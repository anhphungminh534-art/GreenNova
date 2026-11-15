import { Decimal128, Long, ObjectId } from 'mongodb'
import { Router } from 'express'
import { availableComboStock, ensureComboStock } from './combo-stock.js'
import { productQuantityStep } from './product-quantity.js'

const asNumber = (value) => {
  const number = Number(value?.toString() ?? 0)
  return Number.isFinite(number) ? number : 0
}

const safeMoney = (value) => Number.isSafeInteger(value) && value >= 0
const quantityDecimal = (value) => Decimal128.fromString(String(value))
const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000
const cleanOrderItemName = (value) => String(value || '').replace(/\s*\(Chờ Admin xác nhận(?:\s*·[^)]*)?\)/gi, '').trim()

export function createOrdersRouter(database) {
  const router = Router()
  const orders = database.collection('orders')
  const carts = database.collection('carts')
  const payments = database.collection('payments')
  const users = database.collection('users')
  const products = database.collection('products')
  const categories = database.collection('categories')
  const inventory = database.collection('inventory')
  const combos = database.collection('combos')
  const farmBoxes = database.collection('farmBoxes')
  const farmBoxWeeks = database.collection('farmBoxWeeks')
  const counters = database.collection('counters')
  const bankAccounts = database.collection('bankAccounts')
  const inventoryLogs = database.collection('inventoryLogs')

  const userIdFor = (request) => new ObjectId(request.authUser.id)

  function paymentDeadline(order) {
    const placedAt = new Date(order.createdAt || order._id?.getTimestamp?.() || NaN)
    if (Number.isFinite(placedAt.getTime())) return new Date(placedAt.getTime() + PAYMENT_WINDOW_MS)
    return order.expiredAt ? new Date(order.expiredAt) : null
  }

  async function alignPaymentDeadline(order) {
    const deadline = paymentDeadline(order)
    if (deadline && order.status === 'Chờ thanh toán'
      && new Date(order.expiredAt || 0).getTime() !== deadline.getTime()) {
      await orders.updateOne(
        { _id: order._id, status: 'Chờ thanh toán' },
        { $set: { expiredAt: deadline } },
      )
      return { ...order, expiredAt: deadline }
    }
    return order
  }

  async function releaseExpiredOrder(order, now) {
    const orderId = order._id
    for (const reservation of order.inventoryReservations || []) {
      const quantity = asNumber(reservation.quantity)
      if (quantity <= 0) continue
      const result = await inventory.updateOne(
        { productId: reservation.productId, $expr: { $gte: ['$reservedQty', Decimal128.fromString(String(quantity))] } },
        { $inc: { reservedQty: Decimal128.fromString(String(-quantity)) }, $set: { updatedAt: now } },
      )
      if (result.modifiedCount === 1) {
        await inventoryLogs.insertOne({
          productId: reservation.productId, changeType: 'Hoàn',
          quantityChange: Decimal128.fromString(String(-quantity)),
          reason: `Hoàn giữ hàng do đơn ${order.orderCode} hết hạn thanh toán`, orderId, createdAt: now,
        })
      } else {
        console.warn(`Không thể hoàn lượng giữ kho của đơn hết hạn ${order.orderCode}.`)
      }
    }
    for (const reservation of order.comboReservations || []) {
      await combos.updateOne(
        { _id: reservation.comboId, $expr: { $gte: ['$reservedComboQty', reservation.quantity] } },
        { $inc: { reservedComboQty: -reservation.quantity }, $set: { updatedAt: now } },
      )
    }
    for (const reservation of order.farmBoxReservations || []) {
      await farmBoxWeeks.updateOne(
        { _id: reservation.weekId, bookedBoxes: { $gte: reservation.quantity } },
        { $inc: { bookedBoxes: -reservation.quantity } },
      )
    }
    await payments.updateOne(
      { orderId, status: 'Chờ thanh toán' },
      { $set: { status: 'Đã hủy', cancelledAt: now, cancelReason: 'Quá hạn thanh toán' } },
    )
  }

  async function expirePendingOrders(now = new Date(), onlyOrder = null) {
    const filter = {
      status: 'Chờ thanh toán',
      $or: [
        { createdAt: { $lte: new Date(now.getTime() - PAYMENT_WINDOW_MS) } },
        { createdAt: { $exists: false }, expiredAt: { $lte: now } },
      ],
      ...(onlyOrder ? { _id: onlyOrder._id } : {}),
    }
    const expiredOrders = onlyOrder
      ? [onlyOrder]
      : await orders.find(filter).limit(100).toArray()
    let expiredCount = 0
    for (const order of expiredOrders) {
      const update = await orders.updateOne(
        { _id: order._id, ...filter },
        {
          $set: { status: 'Đã hủy', cancelledAt: now, cancelReason: 'Quá hạn thanh toán' },
          $push: { statusHistory: { oldStatus: 'Chờ thanh toán', newStatus: 'Đã hủy', changedBy: null, changedAt: now } },
        },
      )
      if (update.modifiedCount !== 1) continue
      await releaseExpiredOrder(order, now)
      expiredCount += 1
    }
    return expiredCount
  }

  // Enforce the deadline even if the customer closes their browser. Reads also
  // sweep immediately, while this timer keeps stock reservations from lingering.
  const expiryTimer = setInterval(() => {
    expirePendingOrders().catch((error) => console.error('Không thể tự hủy đơn quá hạn:', error))
  }, 15_000)
  expiryTimer.unref?.()
  expirePendingOrders().catch((error) => console.error('Không thể kiểm tra đơn quá hạn khi khởi động:', error))

  async function snapshotLine(line) {
    const quantity = asNumber(line.quantity)
    if (!Number.isFinite(quantity) || quantity <= 0) throw Object.assign(new Error('Số lượng trong giỏ không hợp lệ.'), { status: 400 })

    if (line.itemType === 'Product') {
      const product = await products.findOne({ _id: line.refId })
      if (!product || product.status !== 'Đang bán') throw Object.assign(new Error('Một sản phẩm trong giỏ không còn được bán.'), { status: 409 })
      const stock = await inventory.findOne({ productId: product._id })
      const available = Math.max(0, asNumber(stock?.quantity) - asNumber(stock?.reservedQty))
      if (quantity > available) throw Object.assign(new Error(`${product.name}: chỉ còn ${available} ${product.unit}.`), { status: 409 })
      const category = product.categoryName || product.category
        || (product.categoryId ? (await categories.findOne({ _id: product.categoryId }))?.name : '')
      const step = productQuantityStep(product, category)
      const ratio = quantity / step
      if (step <= 0 || Math.abs(ratio - Math.round(ratio)) > 1e-8) throw Object.assign(new Error(`${product.name}: số lượng không đúng bước ${step} ${product.unit}.`), { status: 400 })
      const price = asNumber(product.price)
      const lineTotal = Math.round(quantity * price)
      if (!safeMoney(price) || !safeMoney(lineTotal)) throw Object.assign(new Error('Giá sản phẩm vượt giới hạn.'), { status: 400 })
      return {
        item: { itemType: 'Product', refId: product._id, itemName: product.name, imageUrl: product.imageUrl || product.image || '', quantity: quantityDecimal(quantity), unitPrice: Long.fromNumber(price), lineTotal: Long.fromNumber(lineTotal) },
        consumption: [{ productId: product._id, quantity }],
      }
    }

    if (line.itemType === 'Combo') {
      const combo = await combos.findOne({ _id: line.refId })
      if (!combo || !combo.isActive || !combo.isPublished) throw Object.assign(new Error('Một combo trong giỏ không còn được mở bán.'), { status: 409 })
      if (!Number.isInteger(quantity)) throw Object.assign(new Error('Số lượng combo phải là số nguyên.'), { status: 400 })
      const stockedCombo = await ensureComboStock(database, combo)
      const availableCombos = availableComboStock(stockedCombo)
      if (quantity > availableCombos) throw Object.assign(new Error(`Combo “${combo.name}” chỉ còn ${availableCombos} combo.`), { status: 409 })
      const price = asNumber(combo.price)
      const lineTotal = Math.round(quantity * price)
      if (!safeMoney(price) || !safeMoney(lineTotal)) throw Object.assign(new Error('Giá combo vượt giới hạn.'), { status: 400 })
      return {
        item: { itemType: 'Combo', refId: combo._id, itemName: combo.name, imageUrl: combo.imageUrl || combo.image || '', quantity: quantityDecimal(quantity), unitPrice: Long.fromNumber(price), lineTotal: Long.fromNumber(lineTotal) },
        comboReservation: { comboId: combo._id, quantity },
      }
    }

    if (line.itemType === 'FarmBox') {
      if (!line.weekId || !Number.isInteger(quantity)) throw Object.assign(new Error('Farm Box cần tuần giao và số lượng nguyên.'), { status: 400 })
      const [box, week] = await Promise.all([
        farmBoxes.findOne({ _id: line.refId }),
        farmBoxWeeks.findOne({ _id: line.weekId, farmBoxId: line.refId }),
      ])
      if (!box || !week || week.status !== 'Đang mở') throw Object.assign(new Error('Tuần giao Farm Box không còn mở.'), { status: 409 })
      const available = Math.max(0, asNumber(week.maxBoxes) - asNumber(week.bookedBoxes))
      if (quantity > available) throw Object.assign(new Error(`Tuần giao Farm Box chỉ còn ${available} hộp.`), { status: 409 })
      const price = asNumber(week.price)
      const lineTotal = Math.round(quantity * price)
      if (!safeMoney(price) || !safeMoney(lineTotal)) throw Object.assign(new Error('Giá Farm Box vượt giới hạn.'), { status: 400 })
      const deliveryDate = String(line.deliveryDate || '')
      if (deliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) throw Object.assign(new Error('Ngày giao FarmBox không hợp lệ.'), { status: 400 })
      const farmBoxName = week.name || box.name
      return {
        item: {
          itemType: 'FarmBox', refId: box._id, weekId: week._id,
          itemName: week.schedulePending ? farmBoxName : `${farmBoxName} (${week.startDate.toLocaleDateString('vi-VN')} - ${week.endDate.toLocaleDateString('vi-VN')})`,
          imageUrl: week.imageUrl || week.image || box.imageUrl || box.image || '',
          schedulePending: week.schedulePending === true,
          ...(deliveryDate ? { deliveryDate } : {}),
          quantity: quantityDecimal(quantity), unitPrice: Long.fromNumber(price),
          lineTotal: Long.fromNumber(lineTotal), fbUpdateStatus: null,
          cropFailurePolicy: line.cropFailurePolicy === 'cancel' ? 'cancel' : 'replace',
          cropFailureResolution: null,
        },
        farmBoxReservation: { weekId: week._id, quantity },
      }
    }

    throw Object.assign(new Error('Loại mặt hàng trong giỏ không hợp lệ.'), { status: 400 })
  }

  async function makeOrderCode() {
    const counter = await counters.findOneAndUpdate(
      { _id: 'orderCode' },
      { $inc: { seq: Long.fromNumber(1) } },
      { returnDocument: 'after', upsert: true },
    )
    const sequence = asNumber(counter?.seq ?? counter?.value?.seq)
    if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('Không thể tạo mã đơn hàng.')
    return `DH${String(sequence).padStart(5, '0')}`
  }

  function publicOrder(order, payment) {
    return {
      id: order._id.toString(),
      orderCode: order.orderCode,
      receiver: order.receiver,
      shippingAddress: order.shippingAddress,
      province: order.province,
      note: order.note || '',
      subtotal: asNumber(order.subtotal),
      shippingFee: asNumber(order.shippingFee),
      totalAmount: asNumber(order.totalAmount),
      status: order.status,
      cancelledAt: order.cancelledAt || null,
      cancelReason: order.cancelReason || '',
      refundStatus: order.refundStatus || '',
      refundedAt: order.refundedAt || null,
      paymentMethod: order.paymentMethod || payment?.method || '',
      createdAt: order.createdAt,
      expiredAt: paymentDeadline(order),
      approvedForDeliveryAt: order.approvedForDeliveryAt || null,
      deliveryDueAt: order.deliveryDueAt || null,
      deliveredAt: order.deliveredAt || null,
      statusHistory: (order.statusHistory || []).map((entry) => ({
        oldStatus: entry.oldStatus || '',
        newStatus: entry.newStatus || '',
        changedAt: entry.changedAt || null,
      })),
      items: (order.items || []).map((item, index) => ({
        index,
        itemType: item.itemType,
        id: item.refId.toString(),
        weekId: item.weekId?.toString(),
        name: cleanOrderItemName(item.itemName),
        image: item.imageUrl || item.image || '',
        schedulePending: item.schedulePending === true,
        deliveryDate: item.deliveryDate || '',
        quantity: asNumber(item.quantity),
        unitPrice: asNumber(item.unitPrice),
        lineTotal: asNumber(item.lineTotal),
        cropFailurePolicy: item.cropFailurePolicy || 'replace',
        cropFailureResolution: item.cropFailureResolution ? {
          action: item.cropFailureResolution.action || '',
          status: item.cropFailureResolution.status || '',
          customerDecision: item.cropFailureResolution.customerDecision || '',
          customerRespondedAt: item.cropFailureResolution.customerRespondedAt || null,
          replacement: item.cropFailureResolution.replacement ? {
            id: item.cropFailureResolution.replacement.id?.toString() || '',
            name: item.cropFailureResolution.replacement.name || '',
            image: item.cropFailureResolution.replacement.image || '',
          } : null,
          replacements: (item.cropFailureResolution.replacements || []).map((replacement) => ({
            id: replacement.id?.toString() || '', name: replacement.name || '', image: replacement.image || '',
          })),
          replacementItems: (item.cropFailureResolution.replacement?.items || []).map((entry) => ({
            productId: entry.productId?.toString() || '', name: entry.name || '', image: entry.image || '', quantity: asNumber(entry.quantity),
          })),
          reason: item.cropFailureResolution.reason || '',
          handledAt: item.cropFailureResolution.handledAt || null,
          refundAmount: asNumber(item.cropFailureResolution.refundAmount),
        } : null,
      })),
      payment: payment ? {
        status: order.paymentMethod === 'CashOnDelivery' ? 'Chờ thu tiền khi giao hàng' : payment.status,
        method: payment.method || order.paymentMethod || '',
        amount: asNumber(payment.amount),
        transferContent: payment.transferContent,
        bankInfo: payment.bankInfo,
        customerReportedAt: payment.customerReportedAt || null,
      } : null,
    }
  }

  async function enrichOrderImages(order) {
    const collections = { Product: products, Combo: combos, FarmBox: farmBoxes }
    const items = await Promise.all((order.items || []).map(async (item) => {
      if (item.imageUrl || item.image) return item
      const collection = collections[item.itemType]
      if (!collection || !item.refId) return item
      const source = await collection.findOne({ _id: item.refId }, { projection: { imageUrl: 1, image: 1 } })
      const imageUrl = source?.imageUrl || source?.image || ''
      return imageUrl ? { ...item, imageUrl } : item
    }))
    return { ...order, items }
  }

  router.post('/', async (request, response, next) => {
    const reservedInventory = []
    const reservedWeeks = []
    const reservedCombos = []
    let createdOrderId
    try {
      const userId = userIdFor(request)
      const body = request.body || {}
      const receiver = body.receiver || {}
      const name = String(receiver.name || '').trim()
      const phone = String(receiver.phone || '').trim()
      const email = String(receiver.email || '').trim().toLowerCase()
      const shippingAddress = String(body.shippingAddress || '').trim()
      const province = String(body.province || '').trim()
      const note = String(body.note || '').trim()
      const paymentMethod = String(body.paymentMethod || 'BankTransfer')
      if (!['BankTransfer', 'CashOnDelivery'].includes(paymentMethod)) {
        return response.status(400).json({ error: 'Vui lòng chọn phương thức thanh toán hợp lệ.' })
      }

      if (!name || !/^[0-9]{9,11}$/.test(phone) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
        || !shippingAddress || !province) {
        return response.status(400).json({ error: 'Cần nhập tên, số điện thoại, email và địa chỉ giao hàng hợp lệ.' })
      }
      if (name.length > 120 || shippingAddress.length > 300 || province.length > 100 || note.length > 500) {
        return response.status(400).json({ error: 'Thông tin giao hàng hoặc ghi chú quá dài.' })
      }

      const cart = await carts.findOne({ userId })
      if (!cart?.items?.length) return response.status(400).json({ error: 'Giỏ hàng đang trống.' })

      const snapshot = []
      const stockNeeds = new Map()
      const weekNeeds = new Map()
      const comboNeeds = new Map()
      for (const line of cart.items) {
        const result = await snapshotLine(line)
        snapshot.push(result.item)
        for (const part of result.consumption || []) {
          const key = part.productId.toString()
          const current = stockNeeds.get(key) || { productId: part.productId, quantity: 0 }
          current.quantity += part.quantity
          stockNeeds.set(key, current)
        }
        if (result.farmBoxReservation) {
          const key = result.farmBoxReservation.weekId.toString()
          const current = weekNeeds.get(key) || { ...result.farmBoxReservation, quantity: 0 }
          current.quantity += result.farmBoxReservation.quantity
          weekNeeds.set(key, current)
        }
        if (result.comboReservation) {
          const key = result.comboReservation.comboId.toString()
          const current = comboNeeds.get(key) || { ...result.comboReservation, quantity: 0 }
          current.quantity += result.comboReservation.quantity
          comboNeeds.set(key, current)
        }
      }

      const subtotalNumber = snapshot.reduce((sum, item) => sum + asNumber(item.lineTotal), 0)
      const shippingFeeNumber = subtotalNumber >= 300000 ? 0 : 30000
      const totalNumber = subtotalNumber + shippingFeeNumber
      if (!safeMoney(subtotalNumber) || !safeMoney(totalNumber)) {
        return response.status(400).json({ error: 'Tổng tiền đơn hàng vượt giới hạn hỗ trợ.' })
      }

      const orderId = new ObjectId()
      const orderCode = await makeOrderCode()
      const now = new Date()
      const bank = await bankAccounts.findOne({ isActive: true, isDefault: true })
        || await bankAccounts.findOne({ isActive: true })
      const bankInfo = bank
        ? `${bank.bankName} - ${bank.accountNumber} - ${bank.accountHolder}`
        : 'Chưa cấu hình tài khoản ngân hàng'

      for (const need of comboNeeds.values()) {
        const combo = await combos.findOne({ _id: need.comboId })
        if (combo) await ensureComboStock(database, combo)
        const result = await combos.updateOne(
          {
            _id: need.comboId,
            isActive: true,
            isPublished: true,
            $expr: { $gte: [{ $subtract: ['$stockQuantity', '$reservedComboQty'] }, need.quantity] },
          },
          { $inc: { reservedComboQty: need.quantity }, $set: { updatedAt: now } },
        )
        if (result.modifiedCount !== 1) throw Object.assign(new Error('Số lượng combo vừa thay đổi. Hãy tải lại giỏ hàng rồi thử lại.'), { status: 409 })
        reservedCombos.push(need)
      }

      for (const need of stockNeeds.values()) {
        const amount = quantityDecimal(need.quantity)
        const result = await inventory.updateOne(
          {
            productId: need.productId,
            $expr: { $gte: [{ $subtract: ['$quantity', '$reservedQty'] }, amount] },
          },
          { $inc: { reservedQty: amount }, $set: { updatedAt: now } },
        )
        if (result.modifiedCount !== 1) throw Object.assign(new Error('Tồn kho vừa thay đổi. Hãy tải lại giỏ hàng rồi thử lại.'), { status: 409 })
        reservedInventory.push({ ...need, amount })
        await inventoryLogs.insertOne({
          productId: need.productId, changeType: 'Giữ', quantityChange: amount,
          reason: `Giữ hàng cho đơn ${orderCode}`, orderId, createdAt: now,
        })
      }

      for (const need of weekNeeds.values()) {
        const result = await farmBoxWeeks.updateOne(
          {
            _id: need.weekId,
            status: 'Đang mở',
            $expr: { $lte: [{ $add: ['$bookedBoxes', need.quantity] }, '$maxBoxes'] },
          },
          { $inc: { bookedBoxes: need.quantity } },
        )
        if (result.modifiedCount !== 1) throw Object.assign(new Error('Số lượng Farm Box của tuần vừa thay đổi. Hãy thử lại.'), { status: 409 })
        reservedWeeks.push(need)
      }

      const orderPlacedAt = new Date()
      const orderExpiresAt = new Date(orderPlacedAt.getTime() + PAYMENT_WINDOW_MS)
      const order = {
        _id: orderId, orderCode, userId,
        receiver: { name, phone, email },
        shippingAddress, province, ...(note ? { note } : {}),
        subtotal: Long.fromNumber(subtotalNumber),
        shippingFee: Long.fromNumber(shippingFeeNumber),
        totalAmount: Long.fromNumber(totalNumber),
        status: paymentMethod === 'CashOnDelivery' ? 'Đang xử lý' : 'Chờ thanh toán',
        paymentMethod, createdAt: orderPlacedAt,
        ...(paymentMethod === 'BankTransfer' ? { expiredAt: orderExpiresAt } : {}),
        items: snapshot,
        inventoryReservations: [...stockNeeds.values()].map((entry) => ({
          productId: entry.productId, quantity: quantityDecimal(entry.quantity),
        })),
        comboReservations: [...comboNeeds.values()].map((entry) => ({ comboId: entry.comboId, quantity: entry.quantity })),
        farmBoxReservations: [...weekNeeds.values()].map((entry) => ({
          weekId: entry.weekId, quantity: entry.quantity,
        })),
        statusHistory: [{ oldStatus: null, newStatus: paymentMethod === 'CashOnDelivery' ? 'Đang xử lý' : 'Chờ thanh toán', changedBy: null, changedAt: orderPlacedAt }],
      }
      await orders.insertOne(order)
      createdOrderId = orderId
      const payment = {
        orderId, amount: Long.fromNumber(totalNumber), transferContent: orderCode,
        bankInfo, status: 'Chờ thanh toán', paidAt: null,
      }
      await payments.insertOne(payment)
      await carts.updateOne({ userId }, { $set: { items: [], updatedAt: now } })

      return response.status(201).json({
        message: paymentMethod === 'CashOnDelivery'
          ? 'Đơn hàng đã được xác nhận với phương thức thanh toán khi nhận hàng.'
          : 'Đơn hàng đã được tạo. Hãy chuyển khoản theo thông tin bên dưới.',
        data: publicOrder(order, payment),
      })
    } catch (error) {
      if (createdOrderId) {
        await Promise.allSettled([orders.deleteOne({ _id: createdOrderId }), payments.deleteOne({ orderId: createdOrderId })])
      }
      for (const item of reservedInventory) {
        await Promise.allSettled([
          inventory.updateOne({ productId: item.productId }, { $inc: { reservedQty: Decimal128.fromString(`-${item.quantity}`) } }),
          inventoryLogs.insertOne({
            productId: item.productId, changeType: 'Hoàn', quantityChange: Decimal128.fromString(`-${item.quantity}`),
            reason: 'Hoàn giữ hàng do tạo đơn không thành công', orderId: createdOrderId, createdAt: new Date(),
          }),
        ])
      }
      for (const item of reservedWeeks) {
        await farmBoxWeeks.updateOne({ _id: item.weekId }, { $inc: { bookedBoxes: -item.quantity } }).catch(() => {})
      }
      for (const item of reservedCombos) {
        await combos.updateOne({ _id: item.comboId, $expr: { $gte: ['$reservedComboQty', item.quantity] } }, { $inc: { reservedComboQty: -item.quantity } }).catch(() => {})
      }
      if (error.status) return response.status(error.status).json({ error: error.message })
      return next(error)
    }
  })

  router.get('/', async (request, response, next) => {
    try {
      await expirePendingOrders()
      const userId = userIdFor(request)
      const records = await orders.find({ userId }).sort({ createdAt: -1 }).limit(100).toArray()
      const alignedRecords = await Promise.all(records.map(async (record) => enrichOrderImages(await alignPaymentDeadline(record))))
      const ids = alignedRecords.map((order) => order._id)
      const paymentRecords = ids.length
        ? await payments.find({ orderId: { $in: ids } }).toArray()
        : []
      const byOrder = new Map(paymentRecords.map((payment) => [payment.orderId.toString(), payment]))
      response.json({ data: alignedRecords.map((order) => publicOrder(order, byOrder.get(order._id.toString()))) })
    } catch (error) { next(error) }
  })

  router.post('/:id/cancel', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const userId = userIdFor(request)
      const orderId = new ObjectId(request.params.id)
      const requestedReason = String(request.body?.reason || '').trim()
      const cancelReason = requestedReason.slice(0, 300) || 'Khách hàng hủy đơn'
      const order = await orders.findOne({ _id: orderId, userId })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      const cancellableStatuses = ['Chờ thanh toán', 'Đã thanh toán', 'Đang xử lý']
      if (!cancellableStatuses.includes(order.status)) {
        return response.status(409).json({ error: 'Đơn hàng này đã được giao hoặc hủy nên không thể hủy thêm.' })
      }

      const now = new Date()
      const previousStatus = order.status
      const update = await orders.updateOne(
        { _id: orderId, userId, status: previousStatus },
        {
          $set: { status: 'Đã hủy', cancelledAt: now, cancelReason, ...(order.paymentMethod !== 'CashOnDelivery' && order.status !== 'Chờ thanh toán' ? { refundStatus: 'Đang xử lý hoàn tiền' } : { refundStatus: '' }) },
          $push: { statusHistory: { oldStatus: previousStatus, newStatus: 'Đã hủy', changedBy: userId, changedAt: now } },
        },
      )
      if (update.modifiedCount !== 1) return response.status(409).json({ error: 'Trạng thái đơn vừa thay đổi. Hãy tải lại trang.' })

      const payment = await payments.findOne({ orderId })
      const stockWasConsumed = payment?.status === 'Đã thanh toán' || (order.status === 'Đã thanh toán')
      for (const reservation of order.inventoryReservations || []) {
        const quantity = asNumber(reservation.quantity)
        if (quantity <= 0) continue
        const stockUpdate = stockWasConsumed
          ? await inventory.updateOne(
            { productId: reservation.productId },
            { $inc: { quantity: Decimal128.fromString(String(quantity)) }, $set: { updatedAt: now } },
          )
          : await inventory.updateOne(
            { productId: reservation.productId, $expr: { $gte: ['$reservedQty', Decimal128.fromString(String(quantity))] } },
            { $inc: { reservedQty: Decimal128.fromString(String(-quantity)) }, $set: { updatedAt: now } },
          )
        if (stockUpdate.modifiedCount !== 1) {
          console.warn(`Không thể đồng bộ tồn kho khi hủy đơn ${order.orderCode}, sản phẩm ${reservation.productId}.`)
        }
        await inventoryLogs.insertOne({
          productId: reservation.productId, changeType: 'Hoàn',
          quantityChange: Decimal128.fromString(String(stockWasConsumed ? quantity : -quantity)),
          reason: `${stockWasConsumed ? 'Hoàn tồn kho' : 'Hoàn giữ hàng'} do hủy đơn ${order.orderCode}`, orderId, performedBy: userId, createdAt: now,
        })
      }
      for (const reservation of order.comboReservations || []) {
        const amount = Number(reservation.quantity) || 0
        if (amount <= 0) continue
        const update = stockWasConsumed
          ? await combos.updateOne(
            { _id: reservation.comboId },
            { $inc: { stockQuantity: amount }, $set: { updatedAt: now } },
          )
          : await combos.updateOne(
            { _id: reservation.comboId, $expr: { $gte: ['$reservedComboQty', amount] } },
            { $inc: { reservedComboQty: -amount }, $set: { updatedAt: now } },
          )
        if (update.modifiedCount !== 1) console.warn(`Không thể đồng bộ số lượng combo khi hủy đơn ${order.orderCode}.`)
      }
      for (const reservation of order.farmBoxReservations || []) {
        await farmBoxWeeks.updateOne(
          { _id: reservation.weekId, bookedBoxes: { $gte: reservation.quantity } },
          { $inc: { bookedBoxes: -reservation.quantity } },
        )
      }

      const updatedOrder = { ...order, status: 'Đã hủy', cancelledAt: now, cancelReason, refundStatus: order.paymentMethod !== 'CashOnDelivery' && order.status !== 'Chờ thanh toán' ? 'Đang xử lý hoàn tiền' : '' }
      return response.json({ message: 'Đã hủy đơn hàng và hoàn số lượng đã giữ.', data: publicOrder(updatedOrder, payment) })
    } catch (error) { next(error) }
  })

  router.post('/:id/expire', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const userId = userIdFor(request)
      const orderId = new ObjectId(request.params.id)
      const order = await orders.findOne({ _id: orderId, userId })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      if (order.status !== 'Chờ thanh toán') return response.status(409).json({ error: 'Đơn hàng không còn chờ thanh toán.' })
      const now = new Date()
      const deadline = paymentDeadline(order)
      if (!deadline || deadline > now) {
        return response.status(409).json({ error: 'Đơn hàng chưa hết thời hạn thanh toán.' })
      }
      await expirePendingOrders(now, order)
      const updatedOrder = await orders.findOne({ _id: orderId, userId })
      const payment = await payments.findOne({ orderId })
      return response.json({ message: 'Đơn hàng đã tự động hủy do hết hạn thanh toán.', data: publicOrder(updatedOrder, payment) })
    } catch (error) { next(error) }
  })

  router.post('/:id/payment-method', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const userId = userIdFor(request)
      const orderId = new ObjectId(request.params.id)
      const method = String(request.body?.method || '')
      if (!['BankTransfer', 'CashOnDelivery'].includes(method)) {
        return response.status(400).json({ error: 'Vui lòng chọn chuyển khoản hoặc tiền mặt khi nhận hàng.' })
      }
      const order = await orders.findOne({ _id: orderId, userId })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      if (order.status !== 'Chờ thanh toán') {
        return response.status(409).json({ error: 'Chỉ có thể chọn phương thức cho đơn đang chờ thanh toán.' })
      }
      if (method === 'BankTransfer') {
        const deadline = paymentDeadline(order)
        if (deadline && deadline <= new Date()) {
          await expirePendingOrders(new Date(), order)
          return response.status(409).json({ error: 'Đơn hàng đã hết hạn thanh toán.' })
        }
      }

      const now = new Date()
      const nextStatus = method === 'CashOnDelivery' ? 'Đang xử lý' : 'Chờ thanh toán'
      const setFields = { paymentMethod: method, updatedAt: now }
      if (method === 'CashOnDelivery') {
        setFields.status = nextStatus
      }
      const update = await orders.updateOne(
        { _id: orderId, userId, status: 'Chờ thanh toán' },
        {
          $set: setFields,
          ...(method === 'CashOnDelivery' ? {
            $push: { statusHistory: { oldStatus: 'Chờ thanh toán', newStatus: nextStatus, changedBy: userId, changedAt: now } },
          } : {}),
        },
      )
      if (update.modifiedCount !== 1) return response.status(409).json({ error: 'Đơn hàng vừa thay đổi trạng thái. Hãy tải lại trang.' })
      // The order is the source of truth for the selected method. Keep the
      // payment document unchanged here: it may have a strict MongoDB
      // validator, and COD is still unpaid until delivery.
      const updatedOrder = await orders.findOne({ _id: orderId, userId })
      const payment = await payments.findOne({ orderId })
      return response.json({ message: 'Đã cập nhật phương thức thanh toán.', data: publicOrder(updatedOrder, payment) })
    } catch (error) { next(error) }
  })

  router.post('/:id/report-payment', async (request, response, next) => {
    const consumedStock = []
    const consumedCombos = []
    let paymentClaimed = false
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const userId = userIdFor(request)
      const orderId = new ObjectId(request.params.id)
      const order = await orders.findOne({ _id: orderId, userId, status: 'Chờ thanh toán', paymentMethod: 'BankTransfer' })
      if (!order) return response.status(409).json({ error: 'Đơn hàng không ở trạng thái chờ xác nhận chuyển khoản.' })
      const now = new Date()
      const deadline = paymentDeadline(order)
      if (!deadline || deadline <= now) {
        await expirePendingOrders(now, order)
        return response.status(409).json({ error: 'Đơn hàng đã hết hạn thanh toán.' })
      }

      const paymentUpdate = await payments.updateOne(
        { orderId, status: 'Chờ thanh toán' },
        { $set: { status: 'Đã thanh toán', paidAt: now, customerReportedAt: now, updatedAt: now } },
      )
      if (paymentUpdate.modifiedCount !== 1) return response.status(409).json({ error: 'Thanh toán đã được ghi nhận hoặc đơn hàng không còn chờ thanh toán.' })
      paymentClaimed = true

      for (const reservation of order.inventoryReservations || []) {
        const amount = asNumber(reservation.quantity)
        if (amount <= 0) continue
        const update = await inventory.updateOne(
          {
            productId: reservation.productId,
            $expr: { $and: [
              { $gte: ['$quantity', Decimal128.fromString(String(amount))] },
              { $gte: ['$reservedQty', Decimal128.fromString(String(amount))] },
            ] },
          },
          { $inc: {
            quantity: Decimal128.fromString(String(-amount)),
            reservedQty: Decimal128.fromString(String(-amount)),
          }, $set: { updatedAt: now } },
        )
        if (update.modifiedCount !== 1) throw Object.assign(new Error('Không thể xác nhận do tồn kho giữ trước đó không còn khớp. Vui lòng liên hệ GreenNova.'), { status: 409 })
        consumedStock.push({ productId: reservation.productId, amount })
        await inventoryLogs.insertOne({
          productId: reservation.productId, changeType: 'Trừ',
          quantityChange: Decimal128.fromString(String(-amount)),
          reason: `Xuất hàng sau khi xác nhận thanh toán ${order.orderCode}`,
          orderId, performedBy: userId, createdAt: now,
        })
      }

      for (const reservation of order.comboReservations || []) {
        const amount = Number(reservation.quantity) || 0
        if (amount <= 0) continue
        const update = await combos.updateOne(
          {
            _id: reservation.comboId,
            $expr: { $and: [
              { $gte: ['$stockQuantity', amount] },
              { $gte: ['$reservedComboQty', amount] },
            ] },
          },
          { $inc: { stockQuantity: -amount, reservedComboQty: -amount }, $set: { updatedAt: now } },
        )
        if (update.modifiedCount !== 1) throw Object.assign(new Error('Không thể xác nhận do số lượng combo đã giữ không còn khớp.'), { status: 409 })
        consumedCombos.push({ comboId: reservation.comboId, amount })
      }

      const orderUpdate = await orders.updateOne(
        { _id: orderId, userId, status: 'Chờ thanh toán' },
        {
          $set: { status: 'Đã thanh toán', updatedAt: now },
          $push: { statusHistory: { oldStatus: 'Chờ thanh toán', newStatus: 'Đã thanh toán', changedBy: userId, changedAt: now } },
        },
      )
      if (orderUpdate.modifiedCount !== 1) throw Object.assign(new Error('Trạng thái đơn hàng vừa thay đổi. Hãy tải lại trang.'), { status: 409 })
      const payment = await payments.findOne({ orderId })
      const updatedOrder = await orders.findOne({ _id: orderId, userId })
      return response.json({ message: 'Đã xác nhận thanh toán. Đơn hàng đã được cập nhật trạng thái.', data: publicOrder(updatedOrder, payment) })
    } catch (error) {
      if (consumedStock.length) {
        await Promise.allSettled(consumedStock.map(({ productId, amount }) => inventory.updateOne(
          { productId },
          { $inc: { quantity: Decimal128.fromString(String(amount)), reservedQty: Decimal128.fromString(String(amount)) }, $set: { updatedAt: new Date() } },
        )))
      }
      if (consumedCombos.length) {
        await Promise.allSettled(consumedCombos.map(({ comboId, amount }) => combos.updateOne(
          { _id: comboId },
          { $inc: { stockQuantity: amount, reservedComboQty: amount }, $set: { updatedAt: new Date() } },
        )))
      }
      if (paymentClaimed) {
        await payments.updateOne(
          { orderId: new ObjectId(request.params.id), status: 'Đã thanh toán' },
          { $set: { status: 'Chờ thanh toán', paidAt: null, customerReportedAt: null, updatedAt: new Date() } },
        )
      }
      if (error.status) return response.status(error.status).json({ error: error.message })
      return next(error)
    }
  })

  router.post('/:id/farm-box-issue', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const userId = userIdFor(request)
      const orderId = new ObjectId(request.params.id)
      const itemIndex = Number(request.body?.itemIndex)
      const decision = String(request.body?.decision || '')
      if (!Number.isInteger(itemIndex) || itemIndex < 0 || !['accept', 'cancel'].includes(decision)) {
        return response.status(400).json({ error: 'Lựa chọn xử lý Farm Box không hợp lệ.' })
      }
      const order = await orders.findOne({ _id: orderId, userId })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      const item = order.items?.[itemIndex]
      if (!item || item.itemType !== 'FarmBox' || item.cropFailureResolution?.status !== 'Chờ khách xác nhận') {
        return response.status(409).json({ error: 'Farm Box này không có thay đổi nào đang chờ xác nhận.' })
      }
      if (['Đã hủy', 'Đang giao', 'Đã nhận'].includes(order.status)) {
        return response.status(409).json({ error: 'Đơn hàng đã kết thúc hoặc đang giao, không thể xác nhận thay đổi.' })
      }

      const now = new Date()
      const payment = await payments.findOne({ orderId })
      const isPaid = payment?.status === 'Đã thanh toán'
        || (order.paymentMethod !== 'CashOnDelivery' && ['Đã thanh toán', 'Đang xử lý'].includes(order.status))
      const resolution = {
        ...item.cropFailureResolution,
        customerDecision: decision,
        customerRespondedAt: now,
        status: decision === 'accept'
          ? 'Khách đã xác nhận thay thế'
          : isPaid ? 'Khách hủy Farm Box · đang hoàn 100%' : 'Khách hủy Farm Box · chưa phát sinh hoàn tiền',
        refundAmount: Long.fromNumber(decision === 'cancel' && isPaid ? asNumber(item.lineTotal) : 0),
      }
      if (decision === 'accept' && Array.isArray(item.cropFailureResolution.replacements) && item.cropFailureResolution.replacements.length) {
        const replacementIndex = Number(request.body?.replacementIndex)
        if (!Number.isInteger(replacementIndex) || replacementIndex < 0 || replacementIndex >= item.cropFailureResolution.replacements.length) {
          return response.status(400).json({ error: 'Chọn một nông sản thay thế trước khi xác nhận.' })
        }
        resolution.replacement = item.cropFailureResolution.replacements[replacementIndex]
        resolution.customerReplacementIndex = replacementIndex
      }
      const allLinesCancelled = decision === 'cancel' && (order.items || []).every((line, index) => (
        index === itemIndex || (line.itemType === 'FarmBox' && line.cropFailureResolution?.customerDecision === 'cancel')
      ))
      const nextStatus = allLinesCancelled ? 'Đã hủy' : order.status
      const updateFields = {
        [`items.${itemIndex}.cropFailureResolution`]: resolution,
        ...(decision === 'cancel' && isPaid ? { refundStatus: 'Đang xử lý hoàn tiền Farm Box', refundRequestedAt: now } : {}),
        ...(allLinesCancelled ? { status: 'Đã hủy', cancelledAt: now, cancelReason: 'Hủy Farm Box theo lựa chọn xử lý nông sản gặp sự cố' } : {}),
      }
      const update = await orders.updateOne(
        { _id: orderId, userId, [`items.${itemIndex}.cropFailureResolution.status`]: 'Chờ khách xác nhận' },
        {
          $set: updateFields,
          $push: { statusHistory: {
            oldStatus: order.status, newStatus: nextStatus,
            note: resolution.status, changedBy: userId, changedAt: now,
          } },
        },
      )
      if (update.modifiedCount !== 1) return response.status(409).json({ error: 'Yêu cầu vừa được cập nhật. Tải lại trang rồi thử lại.' })

      if (decision === 'cancel' && item.weekId) {
        const quantity = Math.max(0, Math.floor(asNumber(item.quantity)))
        if (quantity > 0) {
          await farmBoxWeeks.updateOne(
            { _id: item.weekId, $expr: { $gte: ['$bookedBoxes', quantity] } },
            { $inc: { bookedBoxes: -quantity } },
          )
          await orders.updateOne(
            { _id: orderId, 'farmBoxReservations.weekId': item.weekId },
            { $inc: { 'farmBoxReservations.$.quantity': -quantity } },
          )
        }
      }

      const updatedOrder = await orders.findOne({ _id: orderId, userId })
      return response.json({
        message: decision === 'accept' ? 'Đã xác nhận phương án thay thế.' : 'Đã xác nhận hủy Farm Box.',
        data: publicOrder(updatedOrder, payment),
      })
    } catch (error) { next(error) }
  })

  router.get('/:id', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const order = await orders.findOne({ _id: new ObjectId(request.params.id), userId: userIdFor(request) })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      const alignedOrder = await enrichOrderImages(await alignPaymentDeadline(order))
      const payment = await payments.findOne({ orderId: order._id })
      return response.json({ data: publicOrder(alignedOrder, payment) })
    } catch (error) { next(error) }
  })

  return router
}
