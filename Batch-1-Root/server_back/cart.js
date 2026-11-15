import { Decimal128, Long, ObjectId } from 'mongodb'
import { Router } from 'express'
import { availableComboStock, ensureComboStock } from './combo-stock.js'
import { productQuantityStep } from './product-quantity.js'

const asNumber = (value) => {
  if (value === undefined || value === null) return 0
  const parsed = Number(value.toString())
  return Number.isFinite(parsed) ? parsed : 0
}

const quantityIsMultipleOfStep = (quantity, step) => {
  if (step <= 0) return false
  const ratio = quantity / step
  return Math.abs(ratio - Math.round(ratio)) < 1e-8
}

const dayKey = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function createCartRouter(database) {
  const router = Router()
  const carts = database.collection('carts')
  const products = database.collection('products')
  const categories = database.collection('categories')
  const farms = database.collection('farms')
  const inventory = database.collection('inventory')
  const combos = database.collection('combos')
  const farmBoxes = database.collection('farmBoxes')
  const farmBoxWeeks = database.collection('farmBoxWeeks')

  const getUserId = (request) => new ObjectId(request.authUser.id)

  async function getProductStock(productId) {
    const stock = await inventory.findOne({ productId })
    return Math.max(0, asNumber(stock?.quantity) - asNumber(stock?.reservedQty))
  }

  async function getCatalogItem(itemType, id, weekId) {
    if (itemType === 'Product') {
      const product = await products.findOne({ _id: id })
      if (!product) return null
      const [categoryDoc, farmDoc] = await Promise.all([
        product.categoryName || product.category || !product.categoryId
          ? null : categories.findOne({ _id: product.categoryId }),
        product.farmName || product.farm || !product.farmId
          ? null : farms.findOne({ _id: product.farmId }),
      ])
      const category = product.categoryName || product.category || categoryDoc?.name || ''
      return {
        itemType, id, product, name: product.name, image: product.imageUrl || '',
        farm: product.farmName || product.farm || farmDoc?.name || 'Green Farm Đà Lạt',
        harvestDate: product.harvestDate || null,
        unit: product.unit, price: asNumber(product.price), priceUnitQuantity: asNumber(product.stepQty),
        step: productQuantityStep(product, category),
        availableStock: await getProductStock(id),
        isAvailable: product.status === 'Đang bán',
        unavailableMessage: product.status !== 'Đang bán' ? 'Sản phẩm hiện không được bán.' : '',
      }
    }

    if (itemType === 'Combo') {
      const combo = await combos.findOne({ _id: id })
      if (!combo) return null
      const stockedCombo = await ensureComboStock(database, combo)
      const availableStock = availableComboStock(stockedCombo)
      const active = combo.isActive === true && combo.isPublished === true
      return {
        itemType, id, combo, name: combo.name, image: combo.imageUrl || '', unit: 'combo',
        price: asNumber(combo.price), step: 1, availableStock,
        isAvailable: active && availableStock > 0,
        unavailableMessage: !active
          ? 'Combo hiện không được mở bán.'
          : availableStock < 1 ? 'Combo hiện đã hết hàng.' : '',
      }
    }

    if (itemType === 'FarmBox') {
      if (!weekId) return { error: 'Farm Box cần có weekId để chọn tuần giao.' }
      const [box, week] = await Promise.all([
        farmBoxes.findOne({ _id: id }),
        farmBoxWeeks.findOne({ _id: weekId, farmBoxId: id }),
      ])
      if (!box || !week) return null
      const availableStock = Math.max(0, asNumber(week.maxBoxes) - asNumber(week.bookedBoxes))
      return {
        itemType, id, weekId, box, week, name: box.name, image: box.imageUrl || '',
        unit: 'hộp', price: asNumber(week.price), step: 1, availableStock,
        schedulePending: week.schedulePending === true,
        isAvailable: week.status === 'Đang mở' && availableStock > 0,
        unavailableMessage: week.status !== 'Đang mở'
          ? `Tuần giao này hiện ở trạng thái “${week.status}”.`
          : availableStock < 1 ? 'Tuần giao này đã đủ số lượng.' : '',
      }
    }

    return { error: 'Loại mặt hàng phải là Product, Combo hoặc FarmBox.' }
  }

  async function saveCart(userId, items) {
    const now = new Date()
    await carts.updateOne(
      { userId },
      { $set: { items, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    )
  }

  async function buildCartResponse(userId) {
    const cart = await carts.findOne({ userId })
    const items = []

    for (const cartItem of cart?.items || []) {
      const quantity = asNumber(cartItem.quantity)
      const id = cartItem.refId.toString()
      const weekId = cartItem.weekId?.toString()
      const availability = await getCatalogItem(cartItem.itemType, cartItem.refId, cartItem.weekId)

      if (!availability || availability.error) {
        items.push({
          id, itemType: cartItem.itemType, weekId,
          name: cartItem.itemName || 'Mặt hàng không còn tồn tại',
          quantity, unitPrice: asNumber(cartItem.unitPrice),
          lineTotal: Math.round(quantity * asNumber(cartItem.unitPrice)),
          canPurchase: false,
          message: availability?.error || 'Mặt hàng không còn tồn tại hoặc tuần giao không hợp lệ.',
        })
        continue
      }

      const lineTotal = Math.round(quantity * availability.price)
      items.push({
        id, itemType: cartItem.itemType, weekId,
        name: availability.name, image: availability.image, unit: availability.unit,
        farm: availability.farm || '', harvestDate: availability.harvestDate || null,
        quantity, step: availability.step, unitPrice: availability.price, lineTotal,
        priceUnitQuantity: availability.priceUnitQuantity || 0,
        availableStock: availability.availableStock,
        schedulePending: availability.schedulePending === true,
        deliveryDate: cartItem.deliveryDate || '',
        ...(cartItem.itemType === 'FarmBox' ? { cropFailurePolicy: cartItem.cropFailurePolicy === 'cancel' ? 'cancel' : 'replace' } : {}),
        canPurchase: availability.isAvailable && quantity <= availability.availableStock,
        message: !availability.isAvailable
          ? availability.unavailableMessage
          : quantity > availability.availableStock
            ? `Số lượng trong giỏ vượt quá mức còn có thể bán (${availability.availableStock}).`
            : '',
      })
    }

    return {
      items,
      itemCount: items.length,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
    }
  }

  async function validateRequestedQuantity(itemType, id, weekId, quantity) {
    const availability = await getCatalogItem(itemType, id, weekId)
    if (!availability) return { error: { status: 404, message: 'Không tìm thấy mặt hàng hoặc tuần giao.' } }
    if (availability.error) return { error: { status: 400, message: availability.error } }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: { status: 400, message: 'Số lượng phải lớn hơn 0.' } }
    }
    if (itemType === 'FarmBox' && !Number.isInteger(quantity)) {
      return { error: { status: 400, message: 'Số lượng Farm Box phải là số nguyên.' } }
    }
    if (itemType === 'Product' && !quantityIsMultipleOfStep(quantity, availability.step)) {
      return { error: { status: 400, message: `Số lượng phải theo bước ${availability.step} ${availability.unit}.` } }
    }
    if (!availability.isAvailable) {
      return { error: { status: 409, message: availability.unavailableMessage } }
    }
    if (quantity > availability.availableStock) {
      return { error: { status: 409, message: `Chỉ còn ${availability.availableStock} ${availability.unit} có thể bán.` } }
    }
    if (!Number.isSafeInteger(availability.price)
      || !Number.isSafeInteger(Math.round(quantity * availability.price))) {
      return { error: { status: 400, message: 'Giá hoặc tổng tiền vượt giới hạn hỗ trợ.' } }
    }
    return { availability }
  }

  const validateDeliveryDate = (availability, value) => {
    if (!value) return { date: '' }
    if (availability.itemType !== 'FarmBox' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { error: 'Ngày giao FarmBox không hợp lệ.' }
    const selected = new Date(`${value}T12:00:00`)
    if (Number.isNaN(selected.getTime()) || dayKey(selected) !== value) return { error: 'Ngày giao FarmBox không hợp lệ.' }
    const weekday = selected.getDay()
    if (![2, 5].includes(weekday) || value < dayKey(availability.week.startDate) || value > dayKey(availability.week.endDate)) {
      return { error: 'Hãy chọn một trong hai ngày giao thuộc tuần FarmBox.' }
    }
    return { date: value }
  }

  const makeCartItem = (availability, quantity, deliveryDate = '', cropFailurePolicy = 'replace') => ({
    itemType: availability.itemType,
    refId: availability.id,
    ...(availability.itemType === 'FarmBox' ? { weekId: availability.weekId } : {}),
    ...(availability.itemType === 'FarmBox' && deliveryDate ? { deliveryDate } : {}),
    ...(availability.itemType === 'FarmBox' ? { cropFailurePolicy: cropFailurePolicy === 'cancel' ? 'cancel' : 'replace' } : {}),
    quantity: Decimal128.fromString(quantity.toString()),
    unitPrice: Long.fromNumber(availability.price),
    itemName: availability.name,
    lineTotal: Long.fromNumber(Math.round(quantity * availability.price)),
  })

  const lineMatches = (item, itemType, id, weekId) => item.itemType === itemType
    && item.refId.equals(id)
    && (itemType !== 'FarmBox' || item.weekId?.equals(weekId))

  async function addCartItem(request, response, next, forcedType, forcedId) {
    try {
      const itemType = forcedType || request.body?.itemType || 'Product'
      const idString = forcedId || request.body?.productId || request.body?.comboId || request.body?.farmBoxId
      const weekString = request.body?.weekId
      const quantityToAdd = Number(request.body?.quantity)
      if (!['Product', 'Combo', 'FarmBox'].includes(itemType)) {
        return response.status(400).json({ error: 'Loại mặt hàng phải là Product, Combo hoặc FarmBox.' })
      }
      if (!ObjectId.isValid(idString)) return response.status(400).json({ error: 'Mã mặt hàng không hợp lệ.' })
      if (itemType === 'FarmBox' && !ObjectId.isValid(weekString)) {
        return response.status(400).json({ error: 'Farm Box cần weekId hợp lệ để chọn tuần giao.' })
      }
      if (!Number.isFinite(quantityToAdd) || quantityToAdd <= 0) {
        return response.status(400).json({ error: 'Số lượng cần thêm phải lớn hơn 0.' })
      }

      const id = new ObjectId(idString)
      const weekId = itemType === 'FarmBox' ? new ObjectId(weekString) : undefined
      const userId = getUserId(request)
      const cart = await carts.findOne({ userId })
      const existingItems = cart?.items || []
      const existingIndex = existingItems.findIndex((item) => lineMatches(item, itemType, id, weekId))
      const currentQuantity = existingIndex >= 0 ? asNumber(existingItems[existingIndex].quantity) : 0
      const newQuantity = currentQuantity + quantityToAdd
      const validation = await validateRequestedQuantity(itemType, id, weekId, newQuantity)
      if (validation.error) return response.status(validation.error.status).json({ error: validation.error.message })
      const deliveryDate = validateDeliveryDate(validation.availability, request.body?.deliveryDate)
      if (deliveryDate.error) return response.status(400).json({ error: deliveryDate.error })

      const items = [...existingItems]
      const requestedPolicy = request.body?.cropFailurePolicy
      const existingPolicy = existingIndex >= 0 ? existingItems[existingIndex].cropFailurePolicy : 'replace'
      const cropFailurePolicy = requestedPolicy === 'cancel' || requestedPolicy === 'replace' ? requestedPolicy : existingPolicy
      const newItem = makeCartItem(validation.availability, newQuantity, deliveryDate.date || (existingIndex >= 0 ? existingItems[existingIndex].deliveryDate : ''), cropFailurePolicy)
      if (existingIndex >= 0) items[existingIndex] = newItem
      else items.push(newItem)
      await saveCart(userId, items)
      return response.json({ message: 'Đã thêm mặt hàng vào giỏ hàng.', data: await buildCartResponse(userId) })
    } catch (error) { next(error) }
  }

  async function updateCartItem(request, response, next, itemType, idString) {
    try {
      const weekString = request.body?.weekId || request.query?.weekId
      const quantity = Number(request.body?.quantity)
      if (!ObjectId.isValid(idString)) return response.status(400).json({ error: 'Mã mặt hàng không hợp lệ.' })
      if (itemType === 'FarmBox' && !ObjectId.isValid(weekString)) {
        return response.status(400).json({ error: 'Cần weekId hợp lệ.' })
      }
      const id = new ObjectId(idString)
      const weekId = itemType === 'FarmBox' ? new ObjectId(weekString) : undefined
      const userId = getUserId(request)
      const cart = await carts.findOne({ userId })
      const items = [...(cart?.items || [])]
      const itemIndex = items.findIndex((item) => lineMatches(item, itemType, id, weekId))
      if (itemIndex < 0) return response.status(404).json({ error: 'Mặt hàng không có trong giỏ hàng.' })

      const validation = await validateRequestedQuantity(itemType, id, weekId, quantity)
      if (validation.error) return response.status(validation.error.status).json({ error: validation.error.message })
      const deliveryDate = validateDeliveryDate(validation.availability, request.body?.deliveryDate)
      if (deliveryDate.error) return response.status(400).json({ error: deliveryDate.error })
      const requestedPolicy = request.body?.cropFailurePolicy
      const cropFailurePolicy = requestedPolicy === 'cancel' || requestedPolicy === 'replace' ? requestedPolicy : items[itemIndex].cropFailurePolicy
      items[itemIndex] = makeCartItem(validation.availability, quantity, deliveryDate.date || items[itemIndex].deliveryDate || '', cropFailurePolicy)
      await saveCart(userId, items)
      return response.json({ message: 'Đã cập nhật số lượng.', data: await buildCartResponse(userId) })
    } catch (error) { next(error) }
  }

  async function deleteCartItem(request, response, next, itemType, idString) {
    try {
      const weekString = request.query?.weekId || request.body?.weekId
      if (!ObjectId.isValid(idString)) return response.status(400).json({ error: 'Mã mặt hàng không hợp lệ.' })
      if (itemType === 'FarmBox' && !ObjectId.isValid(weekString)) {
        return response.status(400).json({ error: 'Cần weekId hợp lệ.' })
      }
      const id = new ObjectId(idString)
      const weekId = itemType === 'FarmBox' ? new ObjectId(weekString) : undefined
      const userId = getUserId(request)
      const cart = await carts.findOne({ userId })
      const oldItems = cart?.items || []
      const items = oldItems.filter((item) => !lineMatches(item, itemType, id, weekId))
      if (items.length === oldItems.length) return response.status(404).json({ error: 'Mặt hàng không có trong giỏ hàng.' })
      await saveCart(userId, items)
      return response.json({ message: 'Đã xóa mặt hàng khỏi giỏ hàng.', data: await buildCartResponse(userId) })
    } catch (error) { next(error) }
  }

  router.get('/', async (request, response, next) => {
    try { response.json({ data: await buildCartResponse(getUserId(request)) }) }
    catch (error) { next(error) }
  })

  router.post('/items', (request, response, next) => addCartItem(request, response, next))
  router.post('/items/:itemType/:id', (request, response, next) =>
    addCartItem(request, response, next, request.params.itemType, request.params.id))

  // Giữ các URL Product cũ để tương thích với hướng dẫn đã gửi trước đó.
  router.patch('/items/:productId', (request, response, next) =>
    updateCartItem(request, response, next, 'Product', request.params.productId))
  router.delete('/items/:productId', (request, response, next) =>
    deleteCartItem(request, response, next, 'Product', request.params.productId))

  router.patch('/items/:itemType/:id', (request, response, next) =>
    updateCartItem(request, response, next, request.params.itemType, request.params.id))
  router.delete('/items/:itemType/:id', (request, response, next) =>
    deleteCartItem(request, response, next, request.params.itemType, request.params.id))

  router.delete('/', async (request, response, next) => {
    try {
      const userId = getUserId(request)
      await saveCart(userId, [])
      return response.json({ message: 'Đã xóa toàn bộ giỏ hàng.', data: await buildCartResponse(userId) })
    } catch (error) { next(error) }
  })

  return router
}
