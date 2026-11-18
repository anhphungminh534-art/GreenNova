import { Decimal128, Long, ObjectId } from 'mongodb'
import { Router } from 'express'
import { availableComboStock, ensureComboStock } from './combo-stock.js'

const asNumber = (value) => {
  const number = Number(value?.toString() ?? 0)
  return Number.isFinite(number) ? number : 0
}

const cleanOrderItemName = (value) => String(value || '').replace(/\s*\(Chờ Admin xác nhận(?:\s*·[^)]*)?\)/gi, '').trim()

const decimal = (value) => Decimal128.fromString(String(value))
const vietnamDeliveryDeadline = (approvedAt) => {
  const vietnamWallClock = new Date(new Date(approvedAt).getTime() + 7 * 60 * 60 * 1000)
  vietnamWallClock.setUTCDate(vietnamWallClock.getUTCDate() + 2)
  vietnamWallClock.setUTCHours(6, 0, 0, 0)
  return new Date(vietnamWallClock.getTime() - 7 * 60 * 60 * 1000)
}

function presentOrder(order, payment) {
  return {
    id: order._id.toString(),
    orderCode: order.orderCode,
    userId: order.userId.toString(),
    receiver: order.receiver,
    shippingAddress: order.shippingAddress,
    province: order.province,
    note: order.note || '',
    subtotal: asNumber(order.subtotal),
    shippingFee: asNumber(order.shippingFee),
    totalAmount: asNumber(order.totalAmount),
    status: order.status,
    paymentMethod: order.paymentMethod || payment?.method || '',
    createdAt: order.createdAt,
    expiredAt: order.expiredAt,
    approvedForDeliveryAt: order.approvedForDeliveryAt || null,
    deliveryDueAt: order.deliveryDueAt || null,
    deliveredAt: order.deliveredAt || null,
    phoneConfirmedAt: order.phoneConfirmedAt || null,
    cancelledAt: order.cancelledAt || null,
    cancelReason: order.cancelReason || '',
    items: (order.items || []).map((item, index) => ({
      index,
      itemType: item.itemType,
      id: item.refId.toString(),
      weekId: item.weekId?.toString(),
      name: cleanOrderItemName(item.itemName),
      schedulePending: item.schedulePending === true,
      deliveryDate: item.deliveryDate || '',
      quantity: asNumber(item.quantity),
      unitPrice: asNumber(item.unitPrice),
      lineTotal: asNumber(item.lineTotal),
      cropFailurePolicy: item.cropFailurePolicy || '',
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
    statusHistory: order.statusHistory || [],
    payment: payment ? {
      status: payment.status,
      amount: asNumber(payment.amount),
      transferContent: payment.transferContent,
      bankInfo: payment.bankInfo,
      paidAt: payment.paidAt || null,
    } : null,
  }
}

export function createAdminRouter(database) {
  const router = Router()
  const orders = database.collection('orders')
  const payments = database.collection('payments')
  const users = database.collection('users')
  const inventory = database.collection('inventory')
  const inventoryLogs = database.collection('inventoryLogs')
  const products = database.collection('products')
  const combos = database.collection('combos')
  const farmBoxes = database.collection('farmBoxes')
  const farmBoxWeeks = database.collection('farmBoxWeeks')
  const farmBoxEmergencyOptions = database.collection('farmBoxEmergencyOptions')
  const imperfectForCombos = database.collection('imperfectForCombos')
  const imperfectComboSettings = database.collection('imperfectComboSettings')

  async function getImperfectIngredientCatalog() {
    const sourceDocs = await imperfectForCombos.find({}).toArray()
    let productDocs = []
    let sourceByProductId = new Map()
    if (sourceDocs.length) {
      const references = sourceDocs.map((entry) => entry.productId || entry.productID || entry.productRef || entry.refId)
        .filter((id) => id && ObjectId.isValid(String(id)))
        .map((id) => new ObjectId(String(id)))
      if (references.length) {
        productDocs = await products.find({ _id: { $in: references }, isArchived: { $ne: true } }).toArray()
        sourceByProductId = new Map(sourceDocs.map((entry) => {
          const id = entry.productId || entry.productID || entry.productRef || entry.refId
          return id && ObjectId.isValid(String(id)) ? [String(id), entry] : ['', entry]
        }).filter(([id]) => id))
      }
      if (!productDocs.length) {
        productDocs = sourceDocs.map((entry) => ({
          ...entry,
          _id: entry.productId && ObjectId.isValid(String(entry.productId))
            ? new ObjectId(String(entry.productId))
            : entry._id,
        })).filter((entry) => entry._id && ObjectId.isValid(String(entry._id)))
      }
    }
    if (!productDocs.length) {
      productDocs = await products.find({
        imperfectForCombos: { $in: [true] },
        isArchived: { $ne: true },
      }).sort({ name: 1 }).toArray()
    }

    const productIds = productDocs.map((product) => product._id)
    const stocks = productIds.length ? await inventory.find({ productId: { $in: productIds } }).toArray() : []
    const stockByProductId = new Map(stocks.map((stock) => [stock.productId.toString(), stock]))
    const settings = await imperfectComboSettings.findOne({ _id: 'ingredientPool' })
    const configuredIds = Array.isArray(settings?.selectedProductIds)
      ? new Set(settings.selectedProductIds.map((id) => id.toString()))
      : null
    return productDocs.map((product) => {
      const id = product._id.toString()
      const source = sourceByProductId.get(id) || sourceDocs.find((entry) => String(entry.productId || entry._id) === id) || {}
      const stock = stockByProductId.get(id)
      // Existing imperfectForCombos documents already carry their weight.
      // Use it when no live inventory record exists; otherwise inventory is
      // authoritative so reservations and sales continue updating the display.
      const quantity = stock
        ? asNumber(stock.quantity)
        : asNumber(source.weight ?? source.weightKg ?? source.quantity ?? product.weight ?? product.weightKg ?? product.quantity)
      const reservedQty = stock
        ? asNumber(stock.reservedQty)
        : asNumber(source.reservedQty ?? product.reservedQty)
      const unit = product.unit || source.weightUnit || source.unit || 'kg'
      return {
        id,
        name: product.name || source.name || 'Nguyên liệu Imperfect',
        image: product.imageUrl || product.image || source.imageUrl || source.image || '',
        unit,
        quantity,
        reservedQty,
        availableQty: Math.max(0, quantity - reservedQty),
        selected: configuredIds ? configuredIds.has(id) : true,
      }
    }).sort((left, right) => left.name.localeCompare(right.name, 'vi'))
  }

  router.get('/imperfect-ingredients', async (_request, response, next) => {
    try {
      return response.json({ data: await getImperfectIngredientCatalog() })
    } catch (error) { next(error) }
  })

  router.put('/imperfect-ingredients', async (request, response, next) => {
    try {
      const selectedIds = request.body?.selectedProductIds
      if (!Array.isArray(selectedIds) || selectedIds.some((id) => !ObjectId.isValid(String(id)))) {
        return response.status(400).json({ error: 'Danh sách nguyên liệu được chọn không hợp lệ.' })
      }
      const catalog = await getImperfectIngredientCatalog()
      const eligibleIds = new Set(catalog.map((entry) => entry.id))
      const uniqueIds = [...new Set(selectedIds.map(String))]
      if (uniqueIds.some((id) => !eligibleIds.has(id))) {
        return response.status(400).json({ error: 'Có nguyên liệu không nằm trong danh sách Imperfect của MongoDB.' })
      }
      await imperfectComboSettings.updateOne(
        { _id: 'ingredientPool' },
        { $set: { selectedProductIds: uniqueIds.map((id) => new ObjectId(id)), updatedAt: new Date() } },
        { upsert: true },
      )
      return response.json({ message: 'Đã lưu danh sách kho nguyên liệu Imperfect.', data: await getImperfectIngredientCatalog() })
    } catch (error) { next(error) }
  })

  router.get('/combos/summary', async (_request, response, next) => {
    try {
      const now = new Date()
      const vietnamNow = new Date(now.getTime() + 7 * 60 * 60 * 1000)
      const dayOfWeek = (vietnamNow.getUTCDay() + 6) % 7
      const weekStart = new Date(Date.UTC(
        vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth(), vietnamNow.getUTCDate() - dayOfWeek,
      ) - 7 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      const combosThisWeek = await Promise.all((await combos.find({ isActive: true, isPublished: true }).sort({ name: 1 }).toArray())
        .map((combo) => ensureComboStock(database, combo)))
      const ordersThisWeek = await orders.find({
        createdAt: { $gte: weekStart, $lt: weekEnd },
        status: { $ne: 'Đã hủy' },
      }, { projection: { items: 1 } }).toArray()
      const componentIds = [...new Map([
        ...combosThisWeek.flatMap((combo) => combo.items || []),
        ...ordersThisWeek.flatMap((order) => (order.items || [])
          .filter((item) => item.itemType === 'Combo')
          .flatMap((item) => combosThisWeek.find((combo) => combo._id.equals(item.refId))?.items || [])),
      ].map((item) => [item.productId.toString(), item.productId])).values()]
      const productRecords = componentIds.length
        ? await products.find({ _id: { $in: componentIds } }, { projection: { unit: 1 } }).toArray()
        : []
      const productById = new Map(productRecords.map((product) => [product._id.toString(), product]))
      const lowStockCombos = combosThisWeek.map((combo) => ({
        name: combo.name,
        availableCombos: availableComboStock(combo),
        threshold: Number(combo.lowStockThreshold) || 0,
      })).filter((combo) => combo.availableCombos > 0 && combo.availableCombos < combo.threshold)

      const comboById = new Map(combosThisWeek.map((combo) => [combo._id.toString(), combo]))
      let orderedKg = 0
      for (const order of ordersThisWeek) {
        for (const item of order.items || []) {
          if (item.itemType !== 'Combo') continue
          const combo = comboById.get(item.refId?.toString())
          if (!combo) continue
          const comboQuantity = asNumber(item.quantity)
          for (const component of combo.items || []) {
            const product = productById.get(component.productId.toString())
            const unit = String(product?.unit || '').toLowerCase()
            const weightInUnit = asNumber(component.quantityPerCombo) * comboQuantity
            if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') orderedKg += weightInUnit
            else if (unit === 'g' || unit === 'gram' || unit === 'grams') orderedKg += weightInUnit / 1000
          }
        }
      }

      return response.json({ data: {
        weekStart,
        weekEnd,
        openComboCount: combosThisWeek.length,
        orderedKg: Math.round(orderedKg * 1000) / 1000,
        lowStockCount: lowStockCombos.length,
        lowStockCombos,
      } })
    } catch (error) { next(error) }
  })

  router.get('/products/summary', async (_request, response, next) => {
    try {
      const standardProducts = await products.find({ productLine: 'Standard', isArchived: { $ne: true } }, { projection: { name: 1, status: 1 } }).toArray()
      const productIds = standardProducts.map((product) => product._id)
      const stockRecords = productIds.length
        ? await inventory.find({ productId: { $in: productIds } }).toArray()
        : []
      const stockByProduct = new Map(stockRecords.map((stock) => [stock.productId.toString(), stock]))
      let sellingCount = 0
      let totalQuantity = 0
      const unavailableNames = []
      for (const product of standardProducts) {
        const stock = stockByProduct.get(product._id.toString())
        const available = Math.max(0, asNumber(stock?.quantity) - asNumber(stock?.reservedQty))
        totalQuantity += Math.max(0, asNumber(stock?.quantity))
        const isSelling = product.status === 'Đang bán' && available > 0
        if (isSelling) sellingCount += 1
        else unavailableNames.push(product.name)
      }
      return response.json({ data: {
        totalProducts: standardProducts.length,
        sellingProducts: sellingCount,
        unavailableProducts: standardProducts.length - sellingCount,
        unavailableNames,
        totalQuantity,
      } })
    } catch (error) { next(error) }
  })

  async function normalizeComponents(rawItems, quantityField) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return { error: 'Cần ít nhất một sản phẩm thành phần.' }
    }
    const grouped = new Map()
    for (const entry of rawItems) {
      if (!ObjectId.isValid(entry?.productId)) return { error: 'Mã sản phẩm thành phần không hợp lệ.' }
      const quantity = Number(entry[quantityField])
      if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 10000
        || Math.abs(quantity * 1000 - Math.round(quantity * 1000)) > 1e-7) {
        return { error: 'Số lượng mỗi thành phần phải lớn hơn 0 và tối đa 3 chữ số thập phân.' }
      }
      const productId = new ObjectId(entry.productId)
      const key = productId.toString()
      grouped.set(key, { productId, quantity: (grouped.get(key)?.quantity || 0) + quantity })
    }
    const normalized = [...grouped.values()]
    const found = await products.countDocuments({ _id: { $in: normalized.map((item) => item.productId) } })
    if (found !== normalized.length) return { error: 'Một hoặc nhiều sản phẩm thành phần không tồn tại.' }
    return { items: normalized.map(({ productId, quantity }) => ({ productId, [quantityField]: decimal(quantity) })) }
  }

  router.get('/combos', async (_request, response, next) => {
    try {
      const records = await Promise.all((await combos.find({}).sort({ name: 1 }).toArray())
        .map((combo) => ensureComboStock(database, combo)))
      const productIds = [...new Map(records.flatMap((combo) => combo.items || [])
        .map((item) => [item.productId.toString(), item.productId])).values()]
      const [productRecords, stockRecords] = productIds.length
        ? await Promise.all([
          products.find({ _id: { $in: productIds } }, { projection: { name: 1, unit: 1 } }).toArray(),
          inventory.find({ productId: { $in: productIds } }).toArray(),
        ])
        : [[], []]
      const productById = new Map(productRecords.map((product) => [product._id.toString(), product]))
      const stockById = new Map(stockRecords.map((stock) => [stock.productId.toString(), stock]))
      return response.json({ data: records.map((combo) => {
        const items = (combo.items || []).map((item) => {
          const productId = item.productId.toString()
          const product = productById.get(productId)
          const stock = stockById.get(productId)
          return {
            productId,
            name: product?.name || 'Sản phẩm',
            unit: product?.unit || '',
            quantityPerCombo: asNumber(item.quantityPerCombo),
            availableStock: Math.max(0, asNumber(stock?.quantity) - asNumber(stock?.reservedQty)),
          }
        })
        const totalWeightKg = items.reduce((sum, item) => {
          const unit = String(item.unit).trim().toLowerCase()
          const quantity = item.quantityPerCombo
          if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') return sum + quantity
          if (unit === 'g' || unit === 'gram' || unit === 'grams') return sum + quantity / 1000
          return sum
        }, 0)
        const availableCombos = availableComboStock(combo)
        return {
        id: combo._id.toString(),
        name: combo.name,
        image: combo.imageUrl,
        description: combo.description || '',
        imperfectReason: combo.imperfectReason || '',
        price: asNumber(combo.price),
        isActive: combo.isActive,
        isPublished: combo.isPublished,
        lowStockThreshold: combo.lowStockThreshold,
        totalWeightKg: Math.round(totalWeightKg * 1000) / 1000,
        availableCombos,
        items,
      } }) })
    } catch (error) { next(error) }
  })

  router.post('/combos', async (request, response, next) => {
    try {
      const body = request.body || {}
      const name = String(body.name || '').trim()
      const imageUrl = String(body.imageUrl || '').trim()
      const imperfectReason = String(body.imperfectReason || '').trim()
      const description = String(body.description || '').trim()
      const price = Number(body.price)
      const lowStockThreshold = body.lowStockThreshold === undefined ? 3 : Number(body.lowStockThreshold)
      if (!name || name.length > 160 || !imperfectReason
        || !Number.isSafeInteger(price) || price < 0
        || !Number.isInteger(lowStockThreshold) || lowStockThreshold < 0 || lowStockThreshold > 2147483647) {
        return response.status(400).json({ error: 'Tên, ảnh, mô tả combo, giá hoặc ngưỡng tồn kho không hợp lệ.' })
      }
      const normalized = await normalizeComponents(body.items, 'quantityPerCombo')
      if (normalized.error) return response.status(400).json({ error: normalized.error })
      const combo = {
        name, imageUrl, description, imperfectReason,
        price: Long.fromNumber(price),
        isActive: body.isActive ?? true,
        isPublished: body.isPublished ?? false,
        lowStockThreshold,
        items: normalized.items,
        createdAt: new Date(),
      }
      if (typeof combo.isActive !== 'boolean' || typeof combo.isPublished !== 'boolean') {
        return response.status(400).json({ error: 'isActive và isPublished phải là true hoặc false.' })
      }
      const result = await combos.insertOne(combo)
      return response.status(201).json({ message: 'Đã tạo combo.', data: { id: result.insertedId.toString(), ...combo, items: combo.items.map((item) => ({ productId: item.productId.toString(), quantityPerCombo: asNumber(item.quantityPerCombo) })), price } })
    } catch (error) { next(error) }
  })

  router.patch('/combos/:id', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã combo không hợp lệ.' })
      const id = new ObjectId(request.params.id)
      const body = request.body || {}
      const changes = {}
      if (Object.hasOwn(body, 'name')) {
        const value = String(body.name).trim()
        if (!value || value.length > 160) return response.status(400).json({ error: 'Tên combo cần từ 1 đến 160 ký tự.' })
        changes.name = value
      }
      if (Object.hasOwn(body, 'imageUrl')) {
        if (typeof body.imageUrl !== 'string' || !body.imageUrl.trim()) return response.status(400).json({ error: 'imageUrl không hợp lệ.' })
        changes.imageUrl = body.imageUrl.trim()
      }
      if (Object.hasOwn(body, 'imperfectReason')) {
        if (typeof body.imperfectReason !== 'string' || !body.imperfectReason.trim()) return response.status(400).json({ error: 'Mô tả combo không hợp lệ.' })
        changes.imperfectReason = body.imperfectReason.trim()
      }
      if (Object.hasOwn(body, 'description')) {
        if (typeof body.description !== 'string' || body.description.length > 2000) return response.status(400).json({ error: 'Mô tả combo không hợp lệ.' })
        changes.description = body.description.trim()
      }
      if (Object.hasOwn(body, 'price')) {
        const value = Number(body.price)
        if (!Number.isSafeInteger(value) || value < 0) return response.status(400).json({ error: 'Giá cần là số nguyên không âm.' })
        changes.price = Long.fromNumber(value)
      }
      for (const key of ['isActive', 'isPublished']) {
        if (Object.hasOwn(body, key)) {
          if (typeof body[key] !== 'boolean') return response.status(400).json({ error: `${key} phải là true hoặc false.` })
          changes[key] = body[key]
        }
      }
      if (Object.hasOwn(body, 'lowStockThreshold')) {
        const value = Number(body.lowStockThreshold)
        if (!Number.isInteger(value) || value < 0 || value > 2147483647) return response.status(400).json({ error: 'Ngưỡng tồn kho không hợp lệ.' })
        changes.lowStockThreshold = value
      }
      if (Object.hasOwn(body, 'items')) {
        const normalized = await normalizeComponents(body.items, 'quantityPerCombo')
        if (normalized.error) return response.status(400).json({ error: normalized.error })
        if (!normalized.items.length) return response.status(400).json({ error: 'Combo phải có ít nhất một nguyên liệu.' })
        const ingredientCatalog = await getImperfectIngredientCatalog()
        const availableIngredientIds = new Set(ingredientCatalog.filter((ingredient) => ingredient.selected).map((ingredient) => ingredient.id))
        if (normalized.items.some((item) => !availableIngredientIds.has(item.productId.toString()))) {
          return response.status(400).json({ error: 'Thành phần combo chỉ được chọn từ nguyên liệu đang có trong kho Imperfect.' })
        }
        changes.items = normalized.items
      }
      if (Object.keys(changes).length === 0) return response.status(400).json({ error: 'Hãy gửi ít nhất một trường cần cập nhật.' })
      const result = await combos.updateOne({ _id: id }, { $set: changes })
      if (result.matchedCount !== 1) return response.status(404).json({ error: 'Không tìm thấy combo.' })
      return response.json({ message: 'Đã cập nhật combo.' })
    } catch (error) { next(error) }
  })

  router.get('/farm-boxes', async (_request, response, next) => {
    try {
      const boxes = await farmBoxes.find({}).sort({ name: 1 }).toArray()
      return response.json({ data: boxes.map((box) => ({
        id: box._id.toString(), name: box.name, type: box.boxType,
        description: box.description || '', image: box.imageUrl || '',
      })) })
    } catch (error) { next(error) }
  })

  router.get('/farm-boxes/summary', async (_request, response, next) => {
    try {
      // Farm Box reservations live on each delivery-week record. Use the earliest
      // currently open week and sum only records for that same week, so box types
      // in later weeks are not mixed into this week's count.
      const openWeeks = await farmBoxWeeks.find({ status: 'Đang mở' }).sort({ startDate: 1, endDate: 1 }).toArray()
      const firstWeek = openWeeks[0]
      if (!firstWeek) return response.json({ data: { bookedBoxes: 0, maxBoxes: 0, startDate: null, endDate: null } })

      const weekRecords = openWeeks.filter((week) => (
        new Date(week.startDate).getTime() === new Date(firstWeek.startDate).getTime()
        && new Date(week.endDate).getTime() === new Date(firstWeek.endDate).getTime()
      ))
      return response.json({ data: {
        bookedBoxes: weekRecords.reduce((sum, week) => sum + Math.max(0, asNumber(week.bookedBoxes)), 0),
        maxBoxes: weekRecords.reduce((sum, week) => sum + Math.max(0, asNumber(week.maxBoxes)), 0),
        startDate: firstWeek.startDate,
        endDate: firstWeek.endDate,
      } })
    } catch (error) { next(error) }
  })

  router.get('/farm-box-emergency-options', async (_request, response, next) => {
    try {
      const sizes = [
        { key: 'small', label: 'Loại nhỏ', id: 'emergency-small' },
        { key: 'medium', label: 'Loại vừa', id: 'emergency-medium' },
        { key: 'large', label: 'Loại lớn', id: 'emergency-large' },
      ]
      const records = await farmBoxEmergencyOptions.find({ _id: { $in: sizes.map((entry) => entry.id) } }).toArray()
      const productIds = [...new Map(records.flatMap((record) => record.items || []).map((item) => [item.productId.toString(), item.productId])).values()]
      const productRecords = productIds.length ? await products.find({ _id: { $in: productIds } }).toArray() : []
      const productById = new Map(productRecords.map((product) => [product._id.toString(), product]))
      return response.json({ data: sizes.map((size) => {
        const record = records.find((entry) => entry._id === size.id)
        const items = (record?.items || []).map((item) => {
          const product = productById.get(item.productId.toString())
          return { productId: item.productId.toString(), name: product?.name || '', image: product?.imageUrl || product?.image || '', unit: product?.unit || 'kg', quantity: asNumber(item.quantity), price: asNumber(product?.price) }
        })
        const price = Math.round(items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0))
        return { id: size.id, size: size.key, label: size.label, name: record?.name || `Farm Box dự phòng ${size.label.toLowerCase()}`, price, image: record?.imageUrl || '', items, configured: Boolean(record?.items?.length) }
      }) })
    } catch (error) { next(error) }
  })

  router.put('/farm-box-emergency-options/:size', async (request, response, next) => {
    try {
      const size = String(request.params.size || '')
      const definitions = {
        small: { id: 'emergency-small', label: 'Loại nhỏ' },
        medium: { id: 'emergency-medium', label: 'Loại vừa' },
        large: { id: 'emergency-large', label: 'Loại lớn' },
      }
      const definition = definitions[size]
      if (!definition) return response.status(400).json({ error: 'Cỡ Farm Box dự phòng không hợp lệ.' })
      const name = String(request.body?.name || '').trim()
      const imageUrl = String(request.body?.imageUrl || '').trim()
      if (!name || name.length > 120) return response.status(400).json({ error: 'Tên Farm Box phải có từ 1 đến 120 ký tự.' })
      const normalized = await normalizeComponents(request.body?.items, 'quantity')
      if (normalized.error) return response.status(400).json({ error: normalized.error })
      const componentProducts = await products.find({ _id: { $in: normalized.items.map((item) => item.productId) } }, { projection: { price: 1 } }).toArray()
      const componentPriceById = new Map(componentProducts.map((product) => [product._id.toString(), asNumber(product.price)]))
      const rawPrice = normalized.items.reduce((sum, item) => sum + (componentPriceById.get(item.productId.toString()) || 0) * asNumber(item.quantity), 0)
      const price = Math.round(rawPrice)
      if (!Number.isSafeInteger(price) || price <= 0) return response.status(400).json({ error: 'Không thể tính giá gói từ đơn giá sản phẩm.' })
      const now = new Date()
      const record = { _id: definition.id, size, label: definition.label, name, imageUrl, price: Long.fromNumber(price), items: normalized.items, isEmergencyReplacement: true, updatedAt: now, updatedBy: new ObjectId(request.authUser.id) }
      await farmBoxEmergencyOptions.updateOne({ _id: definition.id }, { $set: record }, { upsert: true })
      return response.json({ message: `Đã lưu Farm Box dự phòng ${definition.label.toLowerCase()}.`, data: { id: definition.id, size, name, image: imageUrl, price, items: normalized.items.map((item) => ({ productId: item.productId.toString(), quantity: asNumber(item.quantity) })), configured: true } })
    } catch (error) { next(error) }
  })

  router.post('/farm-boxes', async (request, response, next) => {
    try {
      const body = request.body || {}
      const name = String(body.name || '').trim()
      const boxType = body.boxType || 'Standard'
      if (!name || name.length > 120 || boxType !== 'Standard') {
        return response.status(400).json({ error: 'Tên Farm Box không hợp lệ hoặc loại hộp chưa được hỗ trợ.' })
      }
      const box = {
        name, boxType,
        description: String(body.description || '').trim(),
        imageUrl: String(body.imageUrl || '').trim(),
      }
      const result = await farmBoxes.insertOne(box)
      return response.status(201).json({ message: 'Đã tạo Farm Box.', data: { id: result.insertedId.toString(), ...box } })
    } catch (error) { next(error) }
  })

  router.patch('/farm-boxes/:id/configuration', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã Farm Box không hợp lệ.' })
      const farmBoxId = new ObjectId(request.params.id)
      const box = await farmBoxes.findOne({ _id: farmBoxId })
      if (!box) return response.status(404).json({ error: 'Không tìm thấy Farm Box.' })

      const body = request.body || {}
      const name = String(body.name || '').trim()
      const price = Number(body.price)
      const maxBoxes = body.maxBoxes === undefined ? null : Number(body.maxBoxes)
      const pricingMode = body.pricingMode === 'auto' ? 'auto' : 'manual'
      if (!name || name.length > 120) return response.status(400).json({ error: 'Tên Farm Box phải có từ 1 đến 120 ký tự.' })
      if (!Number.isSafeInteger(price) || price < 0) return response.status(400).json({ error: 'Giá Farm Box phải là số nguyên không âm.' })
      if (maxBoxes !== null && (!Number.isSafeInteger(maxBoxes) || maxBoxes < 1 || maxBoxes > 2147483647)) {
        return response.status(400).json({ error: 'Số lượng hộp tối đa phải là số nguyên dương.' })
      }
      const normalized = await normalizeComponents(body.items, 'quantity')
      if (normalized.error) return response.status(400).json({ error: normalized.error })

      const weekIdValue = String(body.weekId || '')
      const now = new Date()
      const slotStart = body.startDate ? new Date(body.startDate) : null
      const slotEnd = body.endDate ? new Date(body.endDate) : null
      if (weekIdValue || (slotStart && slotEnd)) {
        if (weekIdValue && !ObjectId.isValid(weekIdValue)) return response.status(400).json({ error: 'Mã tuần Farm Box không hợp lệ.' })
        if (!weekIdValue && (Number.isNaN(slotStart?.getTime()) || Number.isNaN(slotEnd?.getTime()) || slotEnd < slotStart
          || slotEnd.getTime() - slotStart.getTime() > 8 * 24 * 60 * 60 * 1000)) {
          return response.status(400).json({ error: 'Khoảng thời gian Farm Box không hợp lệ.' })
        }
        const startBoundary = slotStart ? new Date(slotStart) : null
        const endBoundary = slotEnd ? new Date(slotEnd) : null
        startBoundary?.setHours(0, 0, 0, 0)
        endBoundary?.setHours(23, 59, 59, 999)
        const week = weekIdValue
          ? await farmBoxWeeks.findOne({ _id: new ObjectId(weekIdValue), farmBoxId })
          : await farmBoxWeeks.findOne({
            farmBoxId,
            startDate: { $gte: startBoundary, $lte: new Date(startBoundary.getTime() + 24 * 60 * 60 * 1000 - 1) },
          })
        if (weekIdValue && !week) return response.status(404).json({ error: 'Không tìm thấy tuần của Farm Box này.' })
        const maxBooked = Number(week?.bookedBoxes || 0)
        if (maxBoxes !== null && maxBoxes < maxBooked) {
          return response.status(409).json({ error: `Số lượng tối đa không thể thấp hơn ${maxBooked} hộp đã đặt.` })
        }
        const weekChanges = { name, price: Long.fromNumber(price), items: normalized.items, pricingMode }
        weekChanges.updatedAt = now
        if (maxBoxes !== null) weekChanges.maxBoxes = maxBoxes
        let savedWeekId = week?._id
        if (week) {
          const weekUpdate = await farmBoxWeeks.updateOne(
            { _id: week._id, farmBoxId, bookedBoxes: week.bookedBoxes },
            { $set: weekChanges, $push: { contentHistory: {
              oldContent: JSON.stringify((week.items || []).map((item) => ({ productId: item.productId.toString(), quantity: asNumber(item.quantity) }))),
              newContent: JSON.stringify(normalized.items.map((item) => ({ productId: item.productId.toString(), quantity: asNumber(item.quantity) }))),
              reason: 'Quản trị viên cập nhật thực đơn Farm Box', isMajor: false,
              changedBy: new ObjectId(request.authUser.id), changedAt: now,
            } } },
          )
          if (weekUpdate.matchedCount !== 1) return response.status(409).json({ error: 'Tuần Farm Box vừa được cập nhật. Hãy tải lại trang rồi thử lại.' })
        } else {
          const newWeek = {
            farmBoxId, startDate: startBoundary, endDate: endBoundary, ...weekChanges,
            maxBoxes: maxBoxes ?? Math.max(1, Number(box.defaultMaxBoxes) || 60),
            bookedBoxes: 0, status: startBoundary <= now && endBoundary >= now ? 'Đang mở' : 'Sắp mở',
            selectedForWeek: false, contentHistory: [],
          }
          const inserted = await farmBoxWeeks.insertOne(newWeek)
          savedWeekId = inserted.insertedId
        }
        return response.json({
          message: 'Đã lưu cấu hình Farm Box riêng cho tuần này vào MongoDB.',
          data: { id: farmBoxId.toString(), name, price, pricingMode, maxBoxes, weekId: savedWeekId?.toString() || null },
        })
      } else {
        const boxChanges = { price: Long.fromNumber(price), defaultItems: normalized.items, pricingMode, menuUpdatedAt: now }
        if (maxBoxes !== null) boxChanges.defaultMaxBoxes = maxBoxes
        await farmBoxes.updateOne(
          { _id: farmBoxId },
          { $set: boxChanges },
        )
      }

      if (!weekIdValue) await farmBoxes.updateOne({ _id: farmBoxId }, { $set: { name, updatedAt: now } })
      return response.json({ message: 'Đã lưu cấu hình Farm Box vào MongoDB.', data: { id: farmBoxId.toString(), name, price, pricingMode, maxBoxes, weekId: weekIdValue || null } })
    } catch (error) { next(error) }
  })

  router.put('/farm-box-week-selections', async (request, response, next) => {
    try {
      const body = request.body || {}
      const startDate = new Date(body.startDate)
      const endDate = new Date(body.endDate)
      const selections = Array.isArray(body.farmBoxes) ? body.farmBoxes : null
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate
        || endDate.getTime() - startDate.getTime() > 8 * 24 * 60 * 60 * 1000 || !selections) {
        return response.status(400).json({ error: 'Tuần giao hoặc danh sách Farm Box không hợp lệ.' })
      }
      const uniqueSelections = new Map()
      for (const entry of selections) {
        const id = String(entry?.farmBoxId || '')
        const price = Number(entry?.price)
        if (!ObjectId.isValid(id) || !Number.isSafeInteger(price) || price <= 0) {
          return response.status(400).json({ error: 'Mỗi Farm Box được chọn cần mã hợp lệ và giá lớn hơn 0.' })
        }
        uniqueSelections.set(id, { ...entry, farmBoxId: id, price })
      }
      const startBoundary = new Date(startDate)
      startBoundary.setHours(0, 0, 0, 0)
      const endBoundary = new Date(endDate)
      endBoundary.setHours(23, 59, 59, 999)
      const existingWeeks = await farmBoxWeeks.find({
        startDate: { $gte: startBoundary, $lte: new Date(startBoundary.getTime() + 24 * 60 * 60 * 1000 - 1) },
      }).toArray()
      const existingByBox = new Map(existingWeeks.map((week) => [week.farmBoxId.toString(), week]))
      const selectedIds = new Set(uniqueSelections.keys())
      const now = new Date()

      for (const [farmBoxIdString, entry] of uniqueSelections) {
        const farmBoxId = new ObjectId(farmBoxIdString)
        if (!await farmBoxes.findOne({ _id: farmBoxId })) return response.status(404).json({ error: 'Không tìm thấy một Farm Box đã chọn.' })
        const normalized = Array.isArray(entry.items) && entry.items.length
          ? await normalizeComponents(entry.items, 'quantity')
          : { items: [] }
        if (normalized.error) return response.status(400).json({ error: normalized.error })
        const existing = existingByBox.get(farmBoxIdString)
        if (existing) {
          const nextStatus = existing.bookedBoxes >= existing.maxBoxes
            ? 'Đã đủ'
            : existing.status === 'Đã đóng'
              ? (startDate <= now && endDate >= now ? 'Đang mở' : 'Sắp mở')
              : existing.status
          await farmBoxWeeks.updateOne({ _id: existing._id }, { $set: { selectedForWeek: true, status: nextStatus } })
          continue
        }
        const price = entry.price
        const maxBoxes = Math.max(1, Math.floor(Number(entry.maxBoxes) || 60))
        const week = {
          farmBoxId, startDate, endDate, price: Long.fromNumber(price), maxBoxes,
          bookedBoxes: 0,
          status: startDate <= now && endDate >= now ? 'Đang mở' : 'Sắp mở',
          selectedForWeek: true,
          pricingMode: entry.pricingMode === 'auto' ? 'auto' : 'manual',
          items: normalized.items,
          contentHistory: [],
        }
        const result = await farmBoxWeeks.insertOne(week)
        existingByBox.set(farmBoxIdString, { ...week, _id: result.insertedId })
      }

      for (const week of existingWeeks) {
        const id = week.farmBoxId.toString()
        if (!selectedIds.has(id)) await farmBoxWeeks.updateOne({ _id: week._id }, { $set: { selectedForWeek: false } })
      }

      const savedWeeks = await farmBoxWeeks.find({ startDate: { $gte: startBoundary, $lte: new Date(startBoundary.getTime() + 24 * 60 * 60 * 1000 - 1) } }).toArray()
      return response.json({
        message: `Đã lưu lựa chọn tuần: ${selectedIds.size} Farm Box sẽ hiển thị.`,
        data: { selectedCount: selectedIds.size, totalCount: savedWeeks.length },
      })
    } catch (error) { next(error) }
  })

  router.post('/farm-box-week-selections/copy-previous', async (request, response, next) => {
    try {
      const targetStart = new Date(request.body?.startDate)
      const targetEnd = new Date(request.body?.endDate)
      if (Number.isNaN(targetStart.getTime()) || Number.isNaN(targetEnd.getTime()) || targetEnd < targetStart
        || targetEnd.getTime() - targetStart.getTime() > 8 * 24 * 60 * 60 * 1000) {
        return response.status(400).json({ error: 'Tuần cần sao chép không hợp lệ.' })
      }
      const sourceStart = new Date(targetStart)
      sourceStart.setDate(sourceStart.getDate() - 7)
      sourceStart.setHours(0, 0, 0, 0)
      const sourceEnd = new Date(sourceStart)
      sourceEnd.setHours(23, 59, 59, 999)
      const targetStartBoundary = new Date(targetStart)
      targetStartBoundary.setHours(0, 0, 0, 0)
      const targetEndBoundary = new Date(targetEnd)
      targetEndBoundary.setHours(23, 59, 59, 999)
      const [sourceWeeks, targetWeeks] = await Promise.all([
        farmBoxWeeks.find({ startDate: { $gte: sourceStart, $lte: sourceEnd } }).toArray(),
        farmBoxWeeks.find({ startDate: { $gte: targetStartBoundary, $lte: new Date(targetStartBoundary.getTime() + 24 * 60 * 60 * 1000 - 1) } }).toArray(),
      ])
      const selectedSource = sourceWeeks.filter((week) => week.selectedForWeek !== false)
      if (!selectedSource.length) return response.status(409).json({ error: 'Tuần trước chưa có Farm Box nào được chọn để sao chép.' })

      const sourceByBoxId = new Map(selectedSource.map((week) => [week.farmBoxId.toString(), week]))
      const targetByBoxId = new Map(targetWeeks.map((week) => [week.farmBoxId.toString(), week]))
      const sourceIds = new Set(sourceByBoxId.keys())
      for (const targetWeek of targetWeeks) {
        const farmBoxId = targetWeek.farmBoxId.toString()
        if (!sourceIds.has(farmBoxId) && targetWeek.selectedForWeek !== false) {
          await farmBoxWeeks.updateOne({ _id: targetWeek._id }, { $set: { selectedForWeek: false } })
        }
      }

      const now = new Date()
      for (const [farmBoxIdString, sourceWeek] of sourceByBoxId) {
        const farmBoxId = new ObjectId(farmBoxIdString)
        if (!await farmBoxes.findOne({ _id: farmBoxId })) continue
        const normalized = sourceWeek.items?.length
          ? await normalizeComponents((sourceWeek.items || []).map((item) => ({
            productId: item.productId.toString(), quantity: asNumber(item.quantity),
          })), 'quantity')
          : { items: [] }
        if (normalized.error) return response.status(400).json({ error: normalized.error })
        const existing = targetByBoxId.get(farmBoxIdString)
        const bookedBoxes = Math.max(0, Number(existing?.bookedBoxes) || 0)
        const maxBoxes = Math.max(bookedBoxes, Number(sourceWeek.maxBoxes) || 60, 1)
        const status = bookedBoxes >= maxBoxes
          ? 'Đã đủ'
          : targetStartBoundary <= now && targetEndBoundary >= now ? 'Đang mở' : 'Sắp mở'
        const copiedItems = normalized.items
        if (existing) {
          const setChanges = {
            selectedForWeek: true, price: sourceWeek.price, maxBoxes,
            pricingMode: sourceWeek.pricingMode === 'auto' ? 'auto' : 'manual',
            items: copiedItems, status, updatedAt: now,
          }
          const unsetChanges = {}
          if (sourceWeek.name) setChanges.name = sourceWeek.name
          else unsetChanges.name = ''
          const result = await farmBoxWeeks.updateOne(
            { _id: existing._id, bookedBoxes: existing.bookedBoxes },
            {
              $set: setChanges,
              ...(Object.keys(unsetChanges).length ? { $unset: unsetChanges } : {}),
              $push: { contentHistory: {
                oldContent: JSON.stringify((existing.items || []).map((item) => ({ productId: item.productId.toString(), quantity: asNumber(item.quantity) }))),
                newContent: JSON.stringify(copiedItems.map((item) => ({ productId: item.productId.toString(), quantity: asNumber(item.quantity) }))),
                reason: 'Sao chép cấu hình từ tuần trước', isMajor: false,
                changedBy: new ObjectId(request.authUser.id), changedAt: now,
              } },
            },
          )
          if (result.matchedCount !== 1) return response.status(409).json({ error: 'Tuần đích vừa được đặt hoặc cập nhật. Hãy tải lại rồi thử sao chép lần nữa.' })
        } else {
          await farmBoxWeeks.insertOne({
            farmBoxId, startDate: targetStartBoundary, endDate: targetEndBoundary,
            ...(sourceWeek.name ? { name: sourceWeek.name } : {}),
            price: sourceWeek.price, maxBoxes, bookedBoxes: 0, status,
            selectedForWeek: true, pricingMode: sourceWeek.pricingMode === 'auto' ? 'auto' : 'manual',
            items: copiedItems, contentHistory: [],
          })
        }
      }
      const copiedCount = sourceByBoxId.size
      return response.json({ message: `Đã sao chép ${copiedCount} Farm Box cùng thực đơn và chỉ tiêu từ tuần trước.`, data: { copiedCount } })
    } catch (error) { next(error) }
  })

  router.get('/farm-boxes/:id/weeks', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã Farm Box không hợp lệ.' })
      const farmBoxId = new ObjectId(request.params.id)
      const records = await farmBoxWeeks.find({ farmBoxId }).sort({ startDate: 1 }).toArray()
      return response.json({ data: records.map((week) => ({
        id: week._id.toString(), name: week.name || '', startDate: week.startDate, endDate: week.endDate,
        price: asNumber(week.price), maxBoxes: week.maxBoxes, bookedBoxes: week.bookedBoxes,
        available: Math.max(0, week.maxBoxes - week.bookedBoxes), status: week.status,
        schedulePending: week.schedulePending === true,
        selectedForWeek: week.selectedForWeek !== false,
        items: (week.items || []).map((item) => ({ productId: item.productId.toString(), quantity: asNumber(item.quantity) })),
      })) })
    } catch (error) { next(error) }
  })

  router.post('/farm-boxes/:id/weeks', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã Farm Box không hợp lệ.' })
      const farmBoxId = new ObjectId(request.params.id)
      if (!await farmBoxes.findOne({ _id: farmBoxId })) return response.status(404).json({ error: 'Không tìm thấy Farm Box.' })
      const body = request.body || {}
      const startDate = new Date(body.startDate)
      const endDate = new Date(body.endDate)
      const price = Number(body.price)
      const maxBoxes = Number(body.maxBoxes)
      const status = body.status || 'Sắp mở'
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate
        || !Number.isSafeInteger(price) || price < 0 || !Number.isInteger(maxBoxes) || maxBoxes < 1 || maxBoxes > 2147483647
        || !['Sắp mở', 'Đang mở', 'Đã đủ', 'Đã đóng', 'Hoàn tất'].includes(status)) {
        return response.status(400).json({ error: 'Ngày, giá, số hộp hoặc trạng thái tuần giao không hợp lệ.' })
      }
      const normalized = await normalizeComponents(body.items, 'quantity')
      if (normalized.error) return response.status(400).json({ error: normalized.error })
      const week = {
        farmBoxId, startDate, endDate, price: Long.fromNumber(price), maxBoxes,
        bookedBoxes: 0, status, items: normalized.items, contentHistory: [],
      }
      const result = await farmBoxWeeks.insertOne(week)
      return response.status(201).json({ message: 'Đã tạo tuần giao Farm Box.', data: { id: result.insertedId.toString(), startDate, endDate, price, maxBoxes, bookedBoxes: 0, status } })
    } catch (error) { next(error) }
  })

  router.patch('/farm-box-weeks/:id', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã tuần giao không hợp lệ.' })
      const id = new ObjectId(request.params.id)
      const week = await farmBoxWeeks.findOne({ _id: id })
      if (!week) return response.status(404).json({ error: 'Không tìm thấy tuần giao.' })
      const body = request.body || {}
      const changes = {}
      for (const key of ['startDate', 'endDate']) {
        if (Object.hasOwn(body, key)) {
          const value = new Date(body[key])
          if (Number.isNaN(value.getTime())) return response.status(400).json({ error: 'Ngày tuần giao không hợp lệ.' })
          changes[key] = value
        }
      }
      if (Object.hasOwn(body, 'price')) {
        const value = Number(body.price)
        if (!Number.isSafeInteger(value) || value < 0) return response.status(400).json({ error: 'Giá cần là số nguyên không âm.' })
        changes.price = Long.fromNumber(value)
      }
      if (Object.hasOwn(body, 'maxBoxes')) {
        const value = Number(body.maxBoxes)
        if (!Number.isInteger(value) || value < 1 || value < week.bookedBoxes || value > 2147483647) {
          return response.status(409).json({ error: `Số hộp tối đa không thể thấp hơn ${week.bookedBoxes} hộp đã được đặt.` })
        }
        changes.maxBoxes = value
      }
      if (Object.hasOwn(body, 'status')) {
        if (!['Sắp mở', 'Đang mở', 'Đã đủ', 'Đã đóng', 'Hoàn tất'].includes(body.status)) return response.status(400).json({ error: 'Trạng thái tuần giao không hợp lệ.' })
        changes.status = body.status
      }
      if (Object.hasOwn(body, 'items')) {
        const normalized = await normalizeComponents(body.items, 'quantity')
        if (normalized.error) return response.status(400).json({ error: normalized.error })
        const reason = String(body.reason || '').trim()
        if (!reason) return response.status(400).json({ error: 'Cần nhập reason để lưu lịch sử thay đổi thành phần.' })
        changes.items = normalized.items
        changes.contentHistory = [...(week.contentHistory || []), {
          oldContent: JSON.stringify((week.items || []).map((item) => ({ productId: item.productId.toString(), quantity: asNumber(item.quantity) }))),
          newContent: JSON.stringify(normalized.items.map((item) => ({ productId: item.productId.toString(), quantity: asNumber(item.quantity) }))),
          reason, isMajor: body.isMajor === true, changedBy: new ObjectId(request.authUser.id), changedAt: new Date(),
        }]
      }
      if (week.schedulePending && (Object.hasOwn(body, 'startDate') || Object.hasOwn(body, 'endDate') || Object.hasOwn(body, 'items'))) {
        changes.schedulePending = false
      }
      const startDate = changes.startDate || week.startDate
      const endDate = changes.endDate || week.endDate
      if (endDate < startDate) return response.status(400).json({ error: 'Ngày kết thúc phải sau ngày bắt đầu.' })
      if (Object.keys(changes).length === 0) return response.status(400).json({ error: 'Hãy gửi ít nhất một trường cần cập nhật.' })
      const result = await farmBoxWeeks.updateOne({ _id: id, bookedBoxes: week.bookedBoxes }, { $set: changes })
      if (result.modifiedCount !== 1) return response.status(409).json({ error: 'Tuần giao vừa được cập nhật. Hãy tải lại rồi thử lại.' })
      return response.json({ message: 'Đã cập nhật tuần giao Farm Box.' })
    } catch (error) { next(error) }
  })

  router.delete('/products/:id', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã sản phẩm không hợp lệ.' })
      const id = new ObjectId(request.params.id)
      const result = await products.updateOne(
        { _id: id, isArchived: { $ne: true } },
        { $set: { isArchived: true, status: 'Không bán', isRestocking: false, archivedAt: new Date() } },
      )
      if (result.matchedCount !== 1) return response.status(404).json({ error: 'Không tìm thấy sản phẩm hoặc sản phẩm đã được xóa khỏi danh sách.' })
      return response.json({ message: 'Đã xóa sản phẩm khỏi danh sách bán.' })
    } catch (error) { next(error) }
  })

  router.get('/inventory', async (request, response, next) => {
    try {
      const search = String(request.query.q || '').trim()
      const line = String(request.query.line || '').trim()
      const productFilter = {
        ...(search ? { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } : {}),
        isArchived: { $ne: true },
        ...(line ? { productLine: line } : {}),
      }
      const productDocs = await products.find(productFilter).sort({ name: 1 }).limit(300).toArray()
      const productIds = productDocs.map((product) => product._id)
      const stockDocs = productIds.length
        ? await inventory.find({ productId: { $in: productIds } }).toArray()
        : []
      const stockByProduct = new Map(stockDocs.map((stock) => [stock.productId.toString(), stock]))
      return response.json({ data: productDocs.map((product) => {
        const stock = stockByProduct.get(product._id.toString())
        const quantity = asNumber(stock?.quantity)
        const reservedQty = asNumber(stock?.reservedQty)
        return {
          productId: product._id.toString(),
          name: product.name,
          unit: product.unit,
          status: product.status,
          quantity,
          reservedQty,
          availableQty: Math.max(0, quantity - reservedQty),
          hasInventoryRecord: Boolean(stock),
        }
      }) })
    } catch (error) { next(error) }
  })

  router.patch('/inventory/:productId', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.productId)) return response.status(400).json({ error: 'Mã sản phẩm không hợp lệ.' })
      const productId = new ObjectId(request.params.productId)
      const quantity = Number(request.body?.quantity)
      if (!Number.isFinite(quantity) || quantity < 0 || quantity > 10000000
        || Math.abs(quantity * 1000 - Math.round(quantity * 1000)) > 1e-7) {
        return response.status(400).json({ error: 'Tồn kho phải là số không âm, tối đa 3 chữ số thập phân.' })
      }
      const product = await products.findOne({ _id: productId }, { projection: { name: 1, unit: 1 } })
      if (!product) return response.status(404).json({ error: 'Không tìm thấy sản phẩm.' })

      const now = new Date()
      const stock = await inventory.findOne({ productId })
      const previousQuantity = asNumber(stock?.quantity)
      const reservedQty = asNumber(stock?.reservedQty)
      if (quantity < reservedQty) {
        return response.status(409).json({ error: `Không thể đặt tồn kho thấp hơn ${reservedQty} ${product.unit} đang được giữ cho đơn hàng.` })
      }
      const change = quantity - previousQuantity
      if (stock && change === 0) {
        return response.json({ message: 'Tồn kho không thay đổi.', data: { productId: productId.toString(), name: product.name, quantity, reservedQty, availableQty: quantity - reservedQty } })
      }

      if (!stock) {
        await inventory.insertOne({ productId, quantity: decimal(quantity), reservedQty: decimal(0), updatedAt: now })
      } else {
        const update = await inventory.updateOne(
          { _id: stock._id, quantity: stock.quantity, reservedQty: stock.reservedQty, $expr: { $lte: ['$reservedQty', decimal(quantity)] } },
          { $set: { quantity: decimal(quantity), updatedAt: now } },
        )
        if (update.modifiedCount !== 1) return response.status(409).json({ error: 'Tồn kho vừa được cập nhật ở nơi khác. Hãy tải lại rồi thử lại.' })
      }

      if (change !== 0) {
        await inventoryLogs.insertOne({
          productId,
          changeType: change > 0 ? 'Nhập' : 'Điều chỉnh',
          quantityChange: decimal(change),
          reason: String(request.body?.reason || '').trim().slice(0, 200) || 'Admin cập nhật tồn kho',
          performedBy: new ObjectId(request.authUser.id),
          createdAt: now,
        })
      }
      return response.json({ message: 'Đã cập nhật tồn kho.', data: { productId: productId.toString(), name: product.name, quantity, reservedQty, availableQty: quantity - reservedQty } })
    } catch (error) {
      if (error.code === 11000) return response.status(409).json({ error: 'Bản ghi tồn kho vừa được tạo. Hãy tải lại rồi thử lại.' })
      return next(error)
    }
  })

  router.get('/orders', async (request, response, next) => {
    try {
      const { status, from, to } = request.query
      const allowedStatuses = ['Chờ thanh toán', 'Đã thanh toán', 'Đang xử lý', 'Đang giao', 'Đã nhận', 'Đã hủy']
      if (status && !allowedStatuses.includes(status)) {
        return response.status(400).json({ error: 'Bộ lọc trạng thái đơn hàng không hợp lệ.' })
      }
      if ((from && !/^\d{4}-\d{2}-\d{2}$/.test(String(from))) || (to && !/^\d{4}-\d{2}-\d{2}$/.test(String(to)))) {
        return response.status(400).json({ error: 'Khoảng ngày lọc đơn hàng không hợp lệ.' })
      }
      const filter = {}
      if (status) filter.status = status
      if (from || to) {
        const fromDate = from ? new Date(`${from}T00:00:00+07:00`) : null
        const toDate = to ? new Date(`${to}T00:00:00+07:00`) : null
        const localDateString = (date) => date && new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
        if ((fromDate && (Number.isNaN(fromDate.getTime()) || localDateString(fromDate) !== String(from)))
          || (toDate && (Number.isNaN(toDate.getTime()) || localDateString(toDate) !== String(to)))
          || (fromDate && toDate && fromDate > toDate)) {
          return response.status(400).json({ error: 'Khoảng ngày lọc đơn hàng không hợp lệ.' })
        }
        const createdAt = {}
        if (fromDate) createdAt.$gte = fromDate
        if (toDate) {
          createdAt.$lt = new Date(toDate.getTime() + 24 * 60 * 60 * 1000)
        }
        filter.createdAt = createdAt
      }
      const query = orders.find(filter).sort({ createdAt: -1 })
      const records = from || to ? await query.toArray() : await query.limit(200).toArray()
      const ids = records.map((order) => order._id)
      const paymentRecords = ids.length ? await payments.find({ orderId: { $in: ids } }).toArray() : []
      const paymentByOrderId = new Map(paymentRecords.map((payment) => [payment.orderId.toString(), payment]))
      return response.json({ data: records.map((order) => presentOrder(order, paymentByOrderId.get(order._id.toString()))) })
    } catch (error) { next(error) }
  })

  router.get('/refunds', async (request, response, next) => {
    try {
      const records = await orders.find({ $or: [
        { refundStatus: { $exists: true, $nin: [null, ''] } },
        { 'items.cropFailureResolution.customerDecision': 'cancel' },
      ] }).sort({ refundRequestedAt: -1, createdAt: -1 }).limit(500).toArray()
      const ids = records.map((order) => order._id)
      const userIds = [...new Map(records.map((order) => [order.userId?.toString(), order.userId]).filter(([id, userId]) => id && userId)).values()]
      const [paymentRecords, userRecords] = await Promise.all([
        ids.length ? payments.find({ orderId: { $in: ids } }).toArray() : [],
        userIds.length ? users.find({ _id: { $in: userIds } }).toArray() : [],
      ])
      const paymentByOrderId = new Map(paymentRecords.map((payment) => [payment.orderId.toString(), payment]))
      const userById = new Map(userRecords.map((user) => [user._id.toString(), user]))
      const data = records.map((order) => {
        const refundLines = (order.items || []).filter((item) => item.cropFailureResolution?.customerDecision === 'cancel')
        const lineRefundTotal = refundLines.reduce((sum, item) => sum + asNumber(item.cropFailureResolution?.refundAmount), 0)
        const payment = paymentByOrderId.get(order._id.toString())
        const user = userById.get(order.userId?.toString())
        const isPaid = payment?.status === 'Đã thanh toán' || (order.paymentMethod !== 'CashOnDelivery' && order.status === 'Đã hủy')
        const amount = lineRefundTotal || (isPaid && order.status === 'Đã hủy' ? asNumber(order.totalAmount) : 0)
        return {
          id: order._id.toString(), orderCode: order.orderCode || '', createdAt: order.refundRequestedAt || order.cancelledAt || order.createdAt,
          customerName: order.receiver?.name || user?.fullName || 'Khách hàng', phone: order.receiver?.phone || user?.phone || '',
          itemSummary: refundLines.length ? refundLines.map((item) => `${cleanOrderItemName(item.itemName)} × ${asNumber(item.quantity)}`).join(', ') : 'Hoàn tiền đơn hàng đã hủy',
          amount, method: payment?.method === 'CashOnDelivery' || order.paymentMethod === 'CashOnDelivery' ? 'COD' : 'VietQR',
          bankLabel: user?.bankName ? `${user.bankName} · ${String(user.bankAccountNumber || '').replace(/\d(?=\d{4})/g, '•') || 'Chưa có số tài khoản'}` : 'Chưa cập nhật tài khoản nhận tiền',
          bankName: user?.bankName || user?.bank?.bankName || user?.bankAccount?.bankName || '',
          bankAccountNumber: user?.bankAccountNumber || user?.bank?.accountNumber || user?.bankAccount?.accountNumber || '',
          bankAccountHolder: user?.bankAccountHolder || user?.bank?.accountHolder || user?.bankAccount?.accountHolder || user?.fullName || '',
          reason: refundLines.map((item) => item.cropFailureResolution?.reason).filter(Boolean).join('; ') || order.cancelReason || 'Khách yêu cầu hủy đơn',
          status: order.refundStatus === 'Đã hoàn tiền' ? 'Đã hoàn tiền' : 'Đang xử lý hoàn tiền',
          receiptName: order.refundReceipt?.name || '',
        }
      }).filter((item) => item.amount > 0)
      return response.json({ data })
    } catch (error) { next(error) }
  })

  router.patch('/refunds/:id/complete', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hoàn tiền không hợp lệ.' })
      const receiptName = String(request.body?.receiptName || '').trim().slice(0, 160)
      const receiptDataUrl = String(request.body?.receiptDataUrl || '')
      if (!receiptName || !/^data:image\/(?:jpeg|png|webp);base64,[a-z\d+/]+=*$/i.test(receiptDataUrl)) {
        return response.status(400).json({ error: 'Vui lòng tải lên ảnh biên lai chuyển tiền hợp lệ.' })
      }
      if (receiptDataUrl.length > 1_400_000) return response.status(413).json({ error: 'Ảnh biên lai quá lớn. Vui lòng chọn ảnh nhỏ hơn.' })
      const orderId = new ObjectId(request.params.id)
      const now = new Date()
      const result = await orders.updateOne(
        { _id: orderId, refundStatus: { $exists: true, $nin: [null, '', 'Đã hoàn tiền'] } },
        {
          $set: {
            refundStatus: 'Đã hoàn tiền', refundedAt: now,
            refundReceipt: { name: receiptName, dataUrl: receiptDataUrl, uploadedAt: now },
            refundNotification: { status: 'Đã ghi nhận thông báo trong hệ thống', requestedAt: now },
          },
          $push: { statusHistory: {
            oldStatus: 'Đang xử lý hoàn tiền', newStatus: 'Đã hoàn tiền',
            note: 'Admin xác nhận đã chuyển khoản hoàn tiền và ghi nhận thông báo cho khách hàng',
            changedBy: new ObjectId(request.authUser.id), changedAt: now,
          } },
        },
      )
      if (result.modifiedCount !== 1) return response.status(409).json({ error: 'Yêu cầu hoàn tiền không còn ở trạng thái chờ xử lý.' })
      return response.json({ message: 'Đã lưu biên lai và cập nhật trạng thái hoàn tiền.', data: { id: orderId.toString(), refundStatus: 'Đã hoàn tiền', refundedAt: now, receiptName } })
    } catch (error) { next(error) }
  })

  router.get('/reports/daily', async (request, response, next) => {
    try {
      const date = String(request.query.date || '')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return response.status(400).json({ error: 'Ngày báo cáo không hợp lệ.' })
      }
      const start = new Date(`${date}T00:00:00+07:00`)
      if (Number.isNaN(start.getTime())) return response.status(400).json({ error: 'Ngày báo cáo không hợp lệ.' })
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
      const records = await orders.find({ createdAt: { $gte: start, $lt: end } })
        .sort({ createdAt: 1 })
        .toArray()
      const orderIds = records.map((order) => order._id)
      const paymentRecords = orderIds.length
        ? await payments.find({ orderId: { $in: orderIds } }).toArray()
        : []
      const paymentByOrderId = new Map(paymentRecords.map((payment) => [payment.orderId.toString(), payment]))
      const paidStatuses = new Set(['Đã thanh toán', 'Đang xử lý', 'Đang giao', 'Đã nhận'])
      const activeRecords = records.filter((order) => order.status !== 'Đã hủy')
      let paidRevenue = 0
      let codPendingRevenue = 0
      let recognizedRevenue = 0
      for (const order of activeRecords) {
        const amount = asNumber(order.totalAmount)
        const payment = paymentByOrderId.get(order._id.toString())
        const isPaid = payment?.status === 'Đã thanh toán'
          || (order.paymentMethod !== 'CashOnDelivery' && paidStatuses.has(order.status))
        if (isPaid) {
          paidRevenue += amount
          recognizedRevenue += amount
        } else if (order.paymentMethod === 'CashOnDelivery') {
          codPendingRevenue += amount
          recognizedRevenue += amount
        }
      }

      return response.json({
        data: {
          date,
          totalOrders: records.length,
          totalOrderValue: records.reduce((sum, order) => sum + asNumber(order.totalAmount), 0),
          paidRevenue,
          codPendingRevenue,
          recognizedRevenue,
          paidOrderCount: activeRecords.filter((order) => {
            const payment = paymentByOrderId.get(order._id.toString())
            return payment?.status === 'Đã thanh toán'
              || (order.paymentMethod !== 'CashOnDelivery' && paidStatuses.has(order.status))
          }).length,
          codPendingOrderCount: activeRecords.filter((order) => (
            order.paymentMethod === 'CashOnDelivery'
            && paymentByOrderId.get(order._id.toString())?.status !== 'Đã thanh toán'
          )).length,
          orders: records.map((order) => ({
            orderCode: order.orderCode,
            createdAt: order.createdAt,
            customerName: order.receiver?.name || '',
            phone: order.receiver?.phone || '',
            email: order.receiver?.email || '',
            status: order.status,
            totalAmount: asNumber(order.totalAmount),
            items: (order.items || []).map((item) => `${item.itemName} x ${asNumber(item.quantity)}`).join(', '),
          })),
        },
      })
    } catch (error) { next(error) }
  })

  router.get('/reports/weekly', async (request, response, next) => {
    try {
      const date = String(request.query.date || '')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return response.status(400).json({ error: 'Ngày tham chiếu tuần không hợp lệ.' })
      }

      const [year, month, day] = date.split('-').map(Number)
      const reference = new Date(Date.UTC(year, month - 1, day, 12))
      if (Number.isNaN(reference.getTime()) || reference.toISOString().slice(0, 10) !== date) {
        return response.status(400).json({ error: 'Ngày tham chiếu tuần không hợp lệ.' })
      }
      const daysSinceMonday = (reference.getUTCDay() + 6) % 7
      const weekStart = new Date(Date.UTC(year, month - 1, day - daysSinceMonday) - 7 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      const weekStartDate = new Date(weekStart.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
      const weekEndDate = new Date(weekEnd.getTime() - 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
      const records = await orders.find({ createdAt: { $gte: weekStart, $lt: weekEnd } }).toArray()
      const paymentRecords = records.length
        ? await payments.find({ orderId: { $in: records.map((order) => order._id) } }).toArray()
        : []
      const paymentByOrderId = new Map(paymentRecords.map((payment) => [payment.orderId.toString(), payment]))
      const dayMap = new Map(Array.from({ length: 7 }, (_, index) => {
        const current = new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000)
        const dayDate = current.toISOString().slice(0, 10)
        return [dayDate, { date: dayDate, revenue: 0, orders: 0, kilograms: 0 }]
      }))
      const paidStatuses = new Set(['Đã thanh toán', 'Đang xử lý', 'Đang giao', 'Đã nhận'])
      const activeOrders = records.filter((order) => order.status !== 'Đã hủy')
      const now = new Date()
      const isOrderPaid = (order) => paymentByOrderId.get(order._id.toString())?.status === 'Đã thanh toán'
        || (order.paymentMethod !== 'CashOnDelivery' && paidStatuses.has(order.status))
      const paidOrders = activeOrders.filter(isOrderPaid)
      const pendingPaymentOrders = activeOrders.filter((order) => (
        order.status === 'Chờ thanh toán'
        && paymentByOrderId.get(order._id.toString())?.status !== 'Đã thanh toán'
        && (!order.expiredAt || new Date(order.expiredAt) > now)
      ))
      const paidBankTransferCount = paidOrders.filter((order) => order.paymentMethod !== 'CashOnDelivery').length
      const paidCodCount = paidOrders.filter((order) => order.paymentMethod === 'CashOnDelivery').length
      const comboIds = new Set()
      const farmBoxWeekIds = new Set()
      const productQuantityByOrder = new Map()

      const addProductQuantity = (orderId, productId, quantity) => {
        if (!ObjectId.isValid(productId) || !Number.isFinite(quantity)) return
        const byProduct = productQuantityByOrder.get(orderId) || new Map()
        const key = productId.toString()
        byProduct.set(key, (byProduct.get(key) || 0) + quantity)
        productQuantityByOrder.set(orderId, byProduct)
      }

      for (const order of activeOrders) {
        const localDate = new Date(order.createdAt.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
        const dayData = dayMap.get(localDate)
        if (!dayData) continue
        dayData.orders += 1
        if (isOrderPaid(order)) dayData.revenue += asNumber(order.totalAmount)

        for (const item of order.items || []) {
          const quantity = asNumber(item.quantity)
          if (item.itemType === 'Product') addProductQuantity(order._id.toString(), item.refId, quantity)
          if (item.itemType === 'Combo' && ObjectId.isValid(item.refId)) comboIds.add(item.refId.toString())
          if (item.itemType === 'FarmBox' && ObjectId.isValid(item.weekId)) farmBoxWeekIds.add(item.weekId.toString())
        }
      }

      const [comboRecords, farmBoxWeekRecords] = await Promise.all([
        comboIds.size ? combos.find({ _id: { $in: [...comboIds].map((id) => new ObjectId(id)) } }).toArray() : [],
        farmBoxWeekIds.size ? farmBoxWeeks.find({ _id: { $in: [...farmBoxWeekIds].map((id) => new ObjectId(id)) } }).toArray() : [],
      ])
      const comboById = new Map(comboRecords.map((combo) => [combo._id.toString(), combo]))
      const weekById = new Map(farmBoxWeekRecords.map((week) => [week._id.toString(), week]))

      for (const order of activeOrders) {
        const quantityByProduct = productQuantityByOrder.get(order._id.toString()) || new Map()
        for (const item of order.items || []) {
          const quantity = asNumber(item.quantity)
          if (item.itemType === 'Combo') {
            for (const component of comboById.get(item.refId.toString())?.items || []) {
              const productId = component.productId.toString()
              quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + quantity * asNumber(component.quantityPerCombo))
            }
          }
          if (item.itemType === 'FarmBox') {
            for (const component of weekById.get(item.weekId?.toString())?.items || []) {
              const productId = component.productId.toString()
              quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + quantity * asNumber(component.quantity))
            }
          }
        }
        productQuantityByOrder.set(order._id.toString(), quantityByProduct)
      }

      const productIds = new Set([...productQuantityByOrder.values()].flatMap((map) => [...map.keys()]))
      const productRecords = productIds.size
        ? await products.find({ _id: { $in: [...productIds].map((id) => new ObjectId(id)) } }, { projection: { unit: 1, categoryId: 1 } }).toArray()
        : []
      const unitByProduct = new Map(productRecords.map((product) => [product._id.toString(), String(product.unit || '').trim().toLowerCase()]))
      const categoryIds = [...new Set(productRecords.map((product) => product.categoryId?.toString()).filter(Boolean))]
      const categoryRecords = categoryIds.length
        ? await database.collection('categories').find({ _id: { $in: categoryIds.map((id) => new ObjectId(id)) } }, { projection: { name: 1 } }).toArray()
        : []
      const categoryNameById = new Map(categoryRecords.map((category) => [category._id.toString(), category.name || '']))
      const productCategoryById = new Map(productRecords.map((product) => [
        product._id.toString(), categoryNameById.get(product.categoryId?.toString()) || '',
      ]))
      const kgFactor = (unit) => {
        if (['kg', 'kgs', 'kilogram', 'kilograms', 'ki lô gam', 'kilôgam'].includes(unit)) return 1
        if (['g', 'gr', 'gram', 'grams', 'gramme', 'grammes'].includes(unit)) return 0.001
        return 0
      }

      for (const order of activeOrders) {
        const localDate = new Date(order.createdAt.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
        const dayData = dayMap.get(localDate)
        if (!dayData) continue
        const quantities = productQuantityByOrder.get(order._id.toString()) || new Map()
        for (const [productId, quantity] of quantities) {
          dayData.kilograms += quantity * kgFactor(unitByProduct.get(productId) || '')
        }
      }

      const categoryRevenue = [
        { key: 'leafy', name: 'Rau lá hữu cơ VietGAP', revenue: 0 },
        { key: 'produce', name: 'Củ quả canh tác sạch', revenue: 0 },
        { key: 'fruit', name: 'Trái cây đặc sản', revenue: 0 },
        { key: 'farmBox', name: 'FarmBox', revenue: 0 },
        { key: 'imperfect', name: 'Combo Imperfect', revenue: 0 },
      ]
      const categoryRevenueByKey = new Map(categoryRevenue.map((category) => [category.key, category]))
      for (const order of activeOrders) {
        if (!paidStatuses.has(order.status)) continue
        for (const item of order.items || []) {
          let categoryKey
          if (item.itemType === 'FarmBox') categoryKey = 'farmBox'
          else if (item.itemType === 'Combo') categoryKey = 'imperfect'
          else if (item.itemType === 'Product') {
            const categoryName = (productCategoryById.get(item.refId.toString()) || '')
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase()
            if (categoryName.includes('rau an la') || categoryName.includes('rau la')) categoryKey = 'leafy'
            else if (categoryName.includes('trai cay') || categoryName.includes('hoa qua')) categoryKey = 'fruit'
            else categoryKey = 'produce'
          }
          if (categoryKey) categoryRevenueByKey.get(categoryKey).revenue += asNumber(item.lineTotal)
        }
      }
      const categoryRevenueTotal = categoryRevenue.reduce((sum, category) => sum + category.revenue, 0)

      const days = [...dayMap.values()]
      return response.json({
        data: {
          weekStart: weekStartDate,
          weekEnd: weekEndDate,
          totalOrders: records.length,
          activeOrderCount: activeOrders.length,
          paidOrderCount: paidOrders.length,
          paidBankTransferCount,
          paidCodCount,
          pendingPaymentOrderCount: pendingPaymentOrders.length,
          inTransitOrderCount: activeOrders.filter((order) => order.status === 'Đang giao').length,
          deliveredOrderCount: activeOrders.filter((order) => order.status === 'Đã nhận').length,
          days,
          categoryRevenue,
          categoryRevenueTotal,
          totals: days.reduce((totals, item) => ({
            revenue: totals.revenue + item.revenue,
            orders: totals.orders + item.orders,
            kilograms: totals.kilograms + item.kilograms,
          }), { revenue: 0, orders: 0, kilograms: 0 }),
        },
      })
    } catch (error) { next(error) }
  })

  router.get('/orders/:id', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const order = await orders.findOne({ _id: new ObjectId(request.params.id) })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      const payment = await payments.findOne({ orderId: order._id })
      return response.json({ data: presentOrder(order, payment) })
    } catch (error) { next(error) }
  })

  router.post('/orders/:id/confirm-payment', async (request, response, next) => {
    const reservedChanges = []
    const comboChanges = []
    let paymentClaimed = false
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const orderId = new ObjectId(request.params.id)
      const order = await orders.findOne({ _id: orderId })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      if (order.status !== 'Chờ thanh toán') {
        return response.status(409).json({ error: 'Đơn hàng không còn ở trạng thái chờ thanh toán.' })
      }
      const now = new Date()
      const paymentClaim = await payments.updateOne(
        { orderId, status: 'Chờ thanh toán' },
        { $set: { status: 'Đã thanh toán', paidAt: now } },
      )
      if (paymentClaim.modifiedCount !== 1) {
        return response.status(409).json({ error: 'Thanh toán đã được xác nhận hoặc không tìm thấy bản ghi thanh toán.' })
      }
      paymentClaimed = true

      for (const reservation of order.inventoryReservations || []) {
        const amount = decimal(asNumber(reservation.quantity))
        const update = await inventory.updateOne(
          {
            productId: reservation.productId,
            $expr: { $and: [{ $gte: ['$quantity', amount] }, { $gte: ['$reservedQty', amount] }] },
          },
          { $inc: { quantity: decimal(-asNumber(reservation.quantity)), reservedQty: decimal(-asNumber(reservation.quantity)) }, $set: { updatedAt: now } },
        )
        if (update.modifiedCount !== 1) throw Object.assign(new Error('Không thể trừ một phần tồn kho đã giữ; cần kiểm tra kho trước khi xác nhận.'), { status: 409 })
        reservedChanges.push({ productId: reservation.productId, amount: asNumber(reservation.quantity) })
        await inventoryLogs.insertOne({
          productId: reservation.productId,
          changeType: 'Trừ',
          quantityChange: decimal(-asNumber(reservation.quantity)),
          reason: `Xuất hàng cho đơn ${order.orderCode}`,
          orderId,
          performedBy: new ObjectId(request.authUser.id),
          createdAt: now,
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
        comboChanges.push({ comboId: reservation.comboId, amount })
      }

      const updated = await orders.updateOne(
        { _id: orderId, status: 'Chờ thanh toán' },
        {
          $set: { status: 'Đã thanh toán' },
          $push: {
            statusHistory: {
              oldStatus: 'Chờ thanh toán',
              newStatus: 'Đã thanh toán',
              changedBy: new ObjectId(request.authUser.id),
              changedAt: now,
            },
          },
        },
      )
      if (updated.modifiedCount !== 1) throw Object.assign(new Error('Trạng thái đơn vừa thay đổi; không thể xác nhận thanh toán.'), { status: 409 })

      const freshOrder = await orders.findOne({ _id: orderId })
      const payment = await payments.findOne({ orderId })
      return response.json({ message: 'Đã xác nhận thanh toán và cập nhật tồn kho.', data: presentOrder(freshOrder, payment) })
    } catch (error) {
      if (reservedChanges.length) {
        await Promise.allSettled(reservedChanges.map(async (change) => {
          const now = new Date()
          await inventory.updateOne(
            { productId: change.productId },
            { $inc: { quantity: decimal(change.amount), reservedQty: decimal(change.amount) }, $set: { updatedAt: now } },
          )
          await inventoryLogs.insertOne({
            productId: change.productId,
            changeType: 'Hoàn',
            quantityChange: decimal(change.amount),
            reason: 'Hoàn tồn kho do xác nhận thanh toán không hoàn tất',
            orderId: new ObjectId(request.params.id),
            performedBy: new ObjectId(request.authUser.id),
            createdAt: now,
          })
        }))
      }
      if (comboChanges.length) {
        await Promise.allSettled(comboChanges.map(({ comboId, amount }) => combos.updateOne(
          { _id: comboId },
          { $inc: { stockQuantity: amount, reservedComboQty: amount }, $set: { updatedAt: new Date() } },
        )))
      }
      if (paymentClaimed) {
        await payments.updateOne(
          { orderId: new ObjectId(request.params.id), status: 'Đã thanh toán' },
          { $set: { status: 'Chờ thanh toán', paidAt: null } },
        )
      }
      if (error.status) return response.status(error.status).json({ error: error.message })
      return next(error)
    }
  })

  router.post('/orders/:id/confirm-call', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const orderId = new ObjectId(request.params.id)
      const order = await orders.findOne({ _id: orderId })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      if (order.paymentMethod !== 'CashOnDelivery') return response.status(409).json({ error: 'Thao tác xác nhận gọi điện chỉ áp dụng cho đơn COD.' })
      if (order.status === 'Đã hủy') return response.status(409).json({ error: 'Đơn đã hủy, không thể xác nhận gọi điện.' })
      const now = new Date()
      const result = await orders.updateOne(
        { _id: orderId, status: order.status, phoneConfirmedAt: { $exists: false } },
        { $set: { phoneConfirmedAt: now } },
      )
      const updatedOrder = await orders.findOne({ _id: orderId })
      const payment = await payments.findOne({ orderId })
      return response.json({ message: result.modifiedCount ? 'Đã xác nhận gọi điện.' : 'Cuộc gọi đã được xác nhận trước đó.', data: presentOrder(updatedOrder, payment) })
    } catch (error) { next(error) }
  })

  router.post('/orders/:id/farm-box-issue', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const orderId = new ObjectId(request.params.id)
      const itemIndex = Number(request.body?.itemIndex)
      const action = String(request.body?.action || '')
      const order = await orders.findOne({ _id: orderId })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      if (!Number.isInteger(itemIndex) || itemIndex < 0 || itemIndex >= (order.items || []).length) {
        return response.status(400).json({ error: 'Mặt hàng Farm Box không hợp lệ.' })
      }
      const item = order.items[itemIndex]
      if (item.itemType !== 'FarmBox') return response.status(400).json({ error: 'Chỉ áp dụng cho mặt hàng Farm Box.' })
      if (item.cropFailureResolution) return response.status(409).json({ error: 'Sự cố của Farm Box này đã được xử lý.' })
      if (order.status === 'Đã hủy' || order.status === 'Đã nhận' || order.status === 'Đang giao') {
        return response.status(409).json({ error: 'Chỉ xử lý Farm Box trước khi đơn bắt đầu giao.' })
      }
      const now = new Date()
      let resolution
      if (action === 'replace') {
        const productId = String(request.body?.replacementProductId || '')
        if (!ObjectId.isValid(productId)) return response.status(400).json({ error: 'Chọn nông sản thay thế hợp lệ.' })
        const product = await products.findOne({ _id: new ObjectId(productId), isArchived: { $ne: true }, status: 'Đang bán' })
        if (!product) return response.status(404).json({ error: 'Không tìm thấy nông sản thay thế.' })
        const replacementStock = await inventory.findOne({ productId: product._id })
        if (!replacementStock || asNumber(replacementStock.quantity) - asNumber(replacementStock.reservedQty) <= 0) {
          return response.status(409).json({ error: 'Nông sản thay thế vừa hết hàng. Hãy chọn loại khác.' })
        }
        resolution = {
          action: 'replace', status: 'Chờ khách xác nhận',
          replacement: { id: product._id, name: product.name, image: product.imageUrl || product.image || '' },
          reason: String(request.body?.reason || 'Thay nông sản bị hư hỏng bằng sản phẩm tương đương').slice(0, 300),
          handledAt: now, handledBy: new ObjectId(request.authUser.id), refundAmount: Long.fromNumber(0),
        }
      } else {
        return response.status(400).json({ error: 'Thao tác xử lý Farm Box không hợp lệ.' })
      }
      const setPath = `items.${itemIndex}.cropFailureResolution`
      const update = await orders.updateOne(
        { _id: orderId, [`${setPath}`]: null },
        { $set: { [setPath]: resolution }, $push: { statusHistory: {
          oldStatus: order.status, newStatus: order.status,
          note: resolution.status, changedBy: new ObjectId(request.authUser.id), changedAt: now,
        } } },
      )
      if (update.modifiedCount !== 1) return response.status(409).json({ error: 'Đơn vừa được cập nhật. Tải lại danh sách rồi thử lại.' })
      const updatedOrder = await orders.findOne({ _id: orderId })
      const payment = await payments.findOne({ orderId })
      return response.json({ message: resolution.status, data: presentOrder(updatedOrder, payment) })
    } catch (error) { next(error) }
  })

  router.post('/farm-box-issues/replace-group', async (request, response, next) => {
    try {
      const weekId = String(request.body?.weekId || '')
      const size = String(request.body?.size || '')
      if (!ObjectId.isValid(weekId)) return response.status(400).json({ error: 'Tuần Farm Box không hợp lệ.' })
      if (!['small', 'medium', 'large'].includes(size)) return response.status(400).json({ error: 'Loại Farm Box không hợp lệ.' })
      const emergency = await farmBoxEmergencyOptions.findOne({ _id: `emergency-${size}` })
      if (!emergency?.items?.length) return response.status(409).json({ error: `Chưa cấu hình Farm Box dự phòng ${size}.` })
      const emergencyProductIds = emergency.items.map((item) => item.productId)
      const emergencyProducts = await products.find({ _id: { $in: emergencyProductIds } }).toArray()
      const emergencyProductById = new Map(emergencyProducts.map((product) => [product._id.toString(), product]))
      const emergencyItems = emergency.items.map((item) => ({
        productId: item.productId.toString(),
        name: emergencyProductById.get(item.productId.toString())?.name || 'Nông sản',
        image: emergencyProductById.get(item.productId.toString())?.imageUrl || emergencyProductById.get(item.productId.toString())?.image || '',
        quantity: asNumber(item.quantity),
      }))

      const weekObjectId = new ObjectId(weekId)
      const activeOrders = await orders.find({
        status: { $nin: ['Đã hủy', 'Đang giao', 'Đã nhận'] },
        'items.itemType': 'FarmBox',
        'items.weekId': weekObjectId,
      }).toArray()
      const isSize = (item) => {
        const price = asNumber(item.unitPrice)
        if (size === 'small') return price < 199000
        if (size === 'medium') return price >= 199000 && price < 300000
        return price >= 300000
      }
      const now = new Date()
      const replacement = {
        id: emergency._id,
        name: emergency.name,
        image: emergency.imageUrl || '',
        price: asNumber(emergency.price),
        items: emergencyItems,
      }
      const updatedOrders = []
      let updatedItemCount = 0
      let replacementCount = 0
      let refundCount = 0
      for (const order of activeOrders) {
        const indexes = (order.items || []).flatMap((item, index) => (
          item.itemType === 'FarmBox'
          && item.weekId?.toString() === weekId
          && !item.cropFailureResolution
          && isSize(item)
            ? [index]
            : []
        ))
        if (!indexes.length) continue
        const payment = await payments.findOne({ orderId: order._id })
        const isPaid = payment?.status === 'Đã thanh toán' || ['Đã thanh toán', 'Đang xử lý', 'Đang giao'].includes(order.status)
        const set = {}
        const history = []
        const cancelledFarmBoxLines = []
        for (const index of indexes) {
          const item = order.items[index]
          const choseRefund = item.cropFailurePolicy === 'cancel'
          const resolution = {
            action: choseRefund ? 'cancel' : 'replace',
            status: choseRefund ? 'Khách đã chọn hoàn tiền' : 'Khách đã xác nhận thay thế',
            customerDecision: choseRefund ? 'cancel' : 'accept',
            customerRespondedAt: now,
            replacement: choseRefund ? null : replacement,
            reason: String(request.body?.reason || 'Farm Box gặp sự cố thu hoạch; áp dụng lựa chọn đã lưu của khách hàng.').slice(0, 300),
            handledAt: now, handledBy: new ObjectId(request.authUser.id),
            refundAmount: Long.fromNumber(choseRefund && isPaid ? Math.max(0, Math.round(asNumber(item.lineTotal))) : 0),
          }
          set[`items.${index}.cropFailureResolution`] = resolution
          history.push({
            oldStatus: order.status, newStatus: order.status,
            note: choseRefund ? 'Áp dụng lựa chọn hoàn tiền của khách cho Farm Box gặp sự cố' : 'Áp dụng lựa chọn nhận Farm Box thay thế của khách',
            changedBy: new ObjectId(request.authUser.id), changedAt: now,
          })
          if (choseRefund) {
            refundCount += 1
            cancelledFarmBoxLines.push(item)
          } else replacementCount += 1
        }
        const refundedIndexes = new Set(indexes.filter((index) => order.items[index].cropFailurePolicy === 'cancel'))
        const allFarmBoxesRefunded = (order.items || []).length > 0 && order.items.every((item, index) => (
          item.itemType === 'FarmBox'
            && (refundedIndexes.has(index) || item.cropFailureResolution?.customerDecision === 'cancel')
        ))
        if (allFarmBoxesRefunded && (order.items || []).every((item) => item.itemType === 'FarmBox')) {
          set.status = 'Đã hủy'
          set.cancelledAt = now
          set.cancelReason = 'Khách đã chọn hoàn tiền cho Farm Box gặp sự cố'
          for (const entry of history) entry.newStatus = 'Đã hủy'
        }
        if (cancelledFarmBoxLines.length && isPaid) set.refundStatus = 'Đang xử lý hoàn tiền Farm Box'
        const update = await orders.updateOne(
          {
            _id: order._id,
            status: { $nin: ['Đã hủy', 'Đang giao', 'Đã nhận'] },
            $and: indexes.map((index) => ({ [`items.${index}.cropFailureResolution`]: null })),
          },
          {
            $set: set,
            $push: { statusHistory: { $each: history } },
          },
        )
        if (update.modifiedCount !== 1) continue
        for (const item of cancelledFarmBoxLines) {
          const quantity = Math.max(0, Math.floor(asNumber(item.quantity)))
          if (!quantity || !item.weekId) continue
          await farmBoxWeeks.updateOne(
            { _id: item.weekId, $expr: { $gte: ['$bookedBoxes', quantity] } },
            { $inc: { bookedBoxes: -quantity } },
          )
          await orders.updateOne(
            { _id: order._id, 'farmBoxReservations.weekId': item.weekId },
            { $inc: { 'farmBoxReservations.$.quantity': -quantity } },
          )
        }
        updatedItemCount += indexes.length
        const updatedOrder = await orders.findOne({ _id: order._id })
        updatedOrders.push(presentOrder(updatedOrder, payment))
      }
      if (!updatedItemCount) return response.status(409).json({ error: 'Không còn Farm Box nào phù hợp trong tuần và loại đã chọn.' })
      return response.json({
        message: `Đã áp dụng lựa chọn có sẵn của khách cho ${updatedItemCount} Farm Box: ${replacementCount} nhận hộp thay thế, ${refundCount} chọn hoàn tiền.`,
        data: { updatedItemCount, replacementCount, refundCount, updatedOrders },
      })
    } catch (error) { next(error) }
  })

  router.post('/orders/:id/approve-delivery', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const orderId = new ObjectId(request.params.id)
      const [order, payment] = await Promise.all([
        orders.findOne({ _id: orderId }),
        payments.findOne({ orderId }),
      ])
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      if (order.status === 'Đã hủy') return response.status(409).json({ error: 'Đơn đã hủy, không thể duyệt giao.' })
      if (order.status === 'Đang giao' || order.status === 'Đã nhận') return response.status(409).json({ error: 'Đơn hàng đã được duyệt giao trước đó.' })

      const isCod = order.paymentMethod === 'CashOnDelivery' || payment?.method === 'CashOnDelivery'
      const isPaid = payment?.status === 'Đã thanh toán' || ['Đã thanh toán', 'Đang xử lý'].includes(order.status)
      if (!isCod && !isPaid) return response.status(409).json({ error: 'Đơn chuyển khoản cần được xác nhận thanh toán trước khi duyệt giao.' })
      if (isCod && order.status !== 'Chờ thanh toán' && !isPaid) return response.status(409).json({ error: 'Đơn COD không ở trạng thái có thể duyệt giao.' })

      const now = new Date()
      // Deadline is 06:00 Vietnam time on the second calendar day after approval.
      const deliveryDueAt = vietnamDeliveryDeadline(now)
      const result = await orders.updateOne(
        { _id: orderId, status: order.status },
        {
          $set: { status: 'Đang giao', approvedForDeliveryAt: now, deliveryDueAt },
          $push: { statusHistory: { oldStatus: order.status, newStatus: 'Đang giao', changedBy: new ObjectId(request.authUser.id), changedAt: now } },
        },
      )
      if (result.modifiedCount !== 1) return response.status(409).json({ error: 'Trạng thái đơn vừa thay đổi. Hãy tải lại danh sách.' })
      const updatedOrder = await orders.findOne({ _id: orderId })
      return response.json({ message: 'Đã duyệt giao xe.', data: presentOrder(updatedOrder, payment) })
    } catch (error) { next(error) }
  })

  router.patch('/orders/:id/status', async (request, response, next) => {
    try {
      if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã đơn hàng không hợp lệ.' })
      const nextStatus = String(request.body?.status || '')
      const transitions = {
        'Đã thanh toán': 'Đang xử lý',
        'Đang xử lý': 'Đang giao',
        'Đang giao': 'Đã nhận',
      }
      const orderId = new ObjectId(request.params.id)
      const order = await orders.findOne({ _id: orderId })
      if (!order) return response.status(404).json({ error: 'Không tìm thấy đơn hàng.' })
      if (transitions[order.status] !== nextStatus) {
        return response.status(409).json({ error: 'Chỉ được chuyển đơn theo trình tự: Đã thanh toán → Đang xử lý → Đang giao → Đã nhận.' })
      }

      const now = new Date()
      const consumedComboReservations = []
      if (nextStatus === 'Đã nhận' && order.paymentMethod === 'CashOnDelivery') {
        for (const reservation of order.comboReservations || []) {
          const amount = Number(reservation.quantity) || 0
          if (amount <= 0) continue
          const consumed = await combos.updateOne(
            {
              _id: reservation.comboId,
              $expr: { $and: [
                { $gte: ['$stockQuantity', amount] },
                { $gte: ['$reservedComboQty', amount] },
              ] },
            },
            { $inc: { stockQuantity: -amount, reservedComboQty: -amount }, $set: { updatedAt: now } },
          )
          if (consumed.modifiedCount !== 1) {
            await Promise.allSettled(consumedComboReservations.map(({ comboId, amount: reserved }) => combos.updateOne(
              { _id: comboId },
              { $inc: { stockQuantity: reserved, reservedComboQty: reserved }, $set: { updatedAt: new Date() } },
            )))
            return response.status(409).json({ error: 'Không thể hoàn tất đơn do số lượng combo giữ trước đó không còn khớp.' })
          }
          consumedComboReservations.push({ comboId: reservation.comboId, amount })
        }
      }
      const result = await orders.updateOne(
        { _id: orderId, status: order.status },
        {
          $set: { status: nextStatus },
          $push: {
            statusHistory: {
              oldStatus: order.status,
              newStatus: nextStatus,
              changedBy: new ObjectId(request.authUser.id),
              changedAt: now,
            },
          },
        },
      )
      if (result.modifiedCount !== 1) {
        await Promise.allSettled(consumedComboReservations.map(({ comboId, amount }) => combos.updateOne(
          { _id: comboId },
          { $inc: { stockQuantity: amount, reservedComboQty: amount }, $set: { updatedAt: new Date() } },
        )))
        return response.status(409).json({ error: 'Trạng thái đơn vừa thay đổi. Hãy tải lại danh sách.' })
      }
      const updatedOrder = await orders.findOne({ _id: orderId })
      const payment = await payments.findOne({ orderId })
      return response.json({ message: 'Đã cập nhật trạng thái đơn hàng.', data: presentOrder(updatedOrder, payment) })
    } catch (error) { next(error) }
  })

  return router
}
