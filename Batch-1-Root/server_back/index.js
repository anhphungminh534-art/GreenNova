import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import jwt from 'jsonwebtoken'
import { Decimal128, MongoClient, ObjectId } from 'mongodb'
import { createAuthMiddleware, createAuthRouter } from './auth.js'
import { createCartRouter } from './cart.js'
import { createOrdersRouter } from './orders.js'
import { createAdminRouter } from './admin.js'
import { availableComboStock, ensureComboStock } from './combo-stock.js'
import { productQuantityStep } from './product-quantity.js'

const app = express()
const port = Number(process.env.PORT) || 5000
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const databaseName = process.env.MONGODB_DB || 'greennova'
const mongoClient = new MongoClient(mongoUri)
const frontendDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../client_front/dist')

app.use(express.json({ limit: '2mb' }))

let database
let deliveryTimer

const asNumber = (value) => {
  if (value === undefined || value === null) return 0
  const parsed = Number(value.toString())
  return Number.isFinite(parsed) ? parsed : 0
}

const assistantActions = {
  farmBox: [{ label: 'Xem Farm Box đang mở', href: '/farm-box' }],
  combos: [{ label: 'Khám phá các Combo', href: '/imperfect' }],
  products: [{ label: 'Xem danh sách nông sản', href: '/nong-san' }],
  farmBoxAndCombos: [
    { label: 'Xem Farm Box', href: '/farm-box' },
    { label: 'Xem Combo', href: '/imperfect' },
  ],
}

function getAssistantActionsForAnswer(question, answer) {
  const text = normalizeAssistantText(`${question || ''} ${answer || ''}`)
  const actions = []
  if (/farm box|farmbox|hop nong trai/.test(text)) actions.push(...assistantActions.farmBox)
  if (/combo|imperfect/.test(text)) actions.push(...assistantActions.combos)
  if (/nong san|rau cu|rau tuoi/.test(text)) actions.push(...assistantActions.products)
  if (/don hang cua toi|trang thai don/.test(text)) {
    actions.push({ label: 'Xem đơn hàng của tôi', href: '/orders' })
  }
  return [...new Map(actions.map((action) => [action.href, action])).values()]
}

const asImageList = (value) => {
  if (Array.isArray(value)) return value.filter((url) => typeof url === 'string').map((url) => url.trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean)
  return []
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const vietnamDeliveryDeadline = (approvedAt) => {
  const vietnamWallClock = new Date(new Date(approvedAt).getTime() + 7 * 60 * 60 * 1000)
  vietnamWallClock.setUTCDate(vietnamWallClock.getUTCDate() + 2)
  vietnamWallClock.setUTCHours(6, 0, 0, 0)
  return new Date(vietnamWallClock.getTime() - 7 * 60 * 60 * 1000)
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, database: databaseName, connected: Boolean(database) })
})

app.get('/api/categories', async (_request, response, next) => {
  try {
    const categories = await database.collection('categories')
      .find({}, { projection: { name: 1 } })
      .sort({ name: 1 })
      .toArray()

    response.json({ data: categories.map(({ _id, name }) => ({ id: _id.toString(), name })) })
  } catch (error) {
    next(error)
  }
})

app.get('/api/combos', async (_request, response, next) => {
  try {
    const combos = await database.collection('combos')
      .find({ isActive: true, isPublished: true })
      .sort({ name: 1 })
      .toArray()
    const stockedCombos = await Promise.all(combos.map((combo) => ensureComboStock(database, combo)))
    const productIds = [...new Map(stockedCombos.flatMap((combo) => combo.items || [])
      .map((item) => [item.productId.toString(), item.productId])).values()]
    const productDocs = productIds.length
      ? await database.collection('products').find({ _id: { $in: productIds } }, { projection: { name: 1, unit: 1 } }).toArray()
      : []
    const productsById = new Map(productDocs.map((product) => [product._id.toString(), product]))
    response.json({ data: stockedCombos.map((combo) => {
      const items = combo.items || []
      const stock = availableComboStock(combo)
      return {
        id: combo._id.toString(),
        name: combo.name,
        image: combo.imageUrl || '',
        description: combo.imperfectReason || '',
        price: asNumber(combo.price),
        totalWeightKg: items.reduce((total, item) => {
          const unit = normalizeAssistantText(productsById.get(item.productId.toString())?.unit || '')
          return unit.includes('kg') ? total + asNumber(item.quantityPerCombo) : total
        }, 0),
        stock,
        status: stock > 0 ? 'Còn hàng' : 'Hết hàng',
        canPurchase: stock > 0,
        items: items.map((item) => ({
          productId: item.productId.toString(),
          name: productsById.get(item.productId.toString())?.name || 'Sản phẩm',
          quantity: asNumber(item.quantityPerCombo),
          unit: productsById.get(item.productId.toString())?.unit || '',
        })),
      }
    }) })
  } catch (error) { next(error) }
})

app.get('/api/farm-boxes', async (_request, response, next) => {
  try {
    const boxes = await database.collection('farmBoxes').find({}).sort({ name: 1 }).toArray()
    const boxIds = boxes.map((box) => box._id)
    const weeks = boxIds.length
      ? await database.collection('farmBoxWeeks').find({ farmBoxId: { $in: boxIds } }).sort({ startDate: 1 }).toArray()
      : []
    const productIds = [...new Map([
      ...weeks.flatMap((week) => week.items || []),
      ...boxes.flatMap((box) => box.defaultItems || []),
    ]
      .map((item) => [item.productId.toString(), item.productId])).values()]
    const productDocs = productIds.length
      ? await database.collection('products').find({ _id: { $in: productIds } }, { projection: { name: 1, unit: 1 } }).toArray()
      : []
    const productsById = new Map(productDocs.map((product) => [product._id.toString(), product]))
    const weeksByBoxId = new Map()
    for (const week of weeks) {
      const key = week.farmBoxId.toString()
      const entries = weeksByBoxId.get(key) || []
      entries.push({
        id: week._id.toString(),
        name: week.name || '',
        startDate: week.startDate,
        endDate: week.endDate,
        price: asNumber(week.price),
        pricingMode: week.pricingMode || 'manual',
        maxBoxes: asNumber(week.maxBoxes),
        bookedBoxes: asNumber(week.bookedBoxes),
        schedulePending: week.schedulePending === true,
        selectedForWeek: week.selectedForWeek !== false,
        status: week.status,
        available: Math.max(0, asNumber(week.maxBoxes) - asNumber(week.bookedBoxes)),
        canPurchase: week.status === 'Đang mở' && asNumber(week.maxBoxes) > asNumber(week.bookedBoxes),
        items: (week.items || []).map((item) => ({
          productId: item.productId.toString(),
          name: productsById.get(item.productId.toString())?.name || 'Sản phẩm',
          quantity: asNumber(item.quantity),
          unit: productsById.get(item.productId.toString())?.unit || '',
        })),
      })
      weeksByBoxId.set(key, entries)
    }

    response.json({ data: boxes.map((box) => ({
      id: box._id.toString(),
      name: box.name,
      type: box.boxType,
      price: asNumber(box.price),
      description: box.description || '',
      image: box.imageUrl || '',
      pricingMode: box.pricingMode || 'manual',
      defaultMaxBoxes: Math.max(1, Number(box.defaultMaxBoxes) || 60),
      defaultItems: (box.defaultItems || []).map((item) => ({
        productId: item.productId.toString(),
        name: productsById.get(item.productId.toString())?.name || 'Sản phẩm',
        quantity: asNumber(item.quantity),
        unit: productsById.get(item.productId.toString())?.unit || '',
      })),
      weeks: weeksByBoxId.get(box._id.toString()) || [],
    })) })
  } catch (error) { next(error) }
})

app.get('/api/farm-box-emergency-options', async (_request, response, next) => {
  try {
    const sizes = [
      { key: 'small', label: 'Loại nhỏ', id: 'emergency-small' },
      { key: 'medium', label: 'Loại vừa', id: 'emergency-medium' },
      { key: 'large', label: 'Loại lớn', id: 'emergency-large' },
    ]
    const records = await database.collection('farmBoxEmergencyOptions')
      .find({ _id: { $in: sizes.map((entry) => entry.id) } }).toArray()
    const productIds = [...new Map(records.flatMap((record) => record.items || [])
      .map((item) => [item.productId.toString(), item.productId])).values()]
    const productRecords = productIds.length
      ? await database.collection('products').find({ _id: { $in: productIds } }).toArray()
      : []
    const productById = new Map(productRecords.map((product) => [product._id.toString(), product]))
    return response.json({ data: sizes.map((size) => {
      const record = records.find((entry) => entry._id === size.id)
      const items = (record?.items || []).map((item) => {
        const product = productById.get(item.productId.toString())
        return {
          productId: item.productId.toString(),
          name: product?.name || '',
          image: product?.imageUrl || product?.image || '',
          unit: product?.unit || 'kg',
          quantity: asNumber(item.quantity),
          price: asNumber(product?.price),
        }
      })
      return {
        id: size.id,
        size: size.key,
        label: size.label,
        name: record?.name || `Farm Box dự phòng ${size.label.toLowerCase()}`,
        image: record?.imageUrl || '',
        price: Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0)),
        items,
        configured: Boolean(record?.items?.length),
      }
    }) })
  } catch (error) { next(error) }
})

app.post('/api/farm-boxes/:id/provisional-week', async (request, response, next) => {
  try {
    if (!ObjectId.isValid(request.params.id)) return response.status(400).json({ error: 'Mã FarmBox không hợp lệ.' })
    const farmBoxId = new ObjectId(request.params.id)
    const farmBoxes = database.collection('farmBoxes')
    const farmBoxWeeks = database.collection('farmBoxWeeks')
    const box = await farmBoxes.findOne({ _id: farmBoxId })
    if (!box) return response.status(404).json({ error: 'Không tìm thấy FarmBox.' })
    const now = new Date()
    const requestedStart = request.body?.startDate ? new Date(request.body.startDate) : null
    const startDate = requestedStart && !Number.isNaN(requestedStart.getTime()) ? requestedStart : new Date(now)
    startDate.setHours(0, 0, 0, 0)
    if (!requestedStart || Number.isNaN(requestedStart.getTime())) {
      const daysUntilMonday = (8 - startDate.getDay()) % 7 || 7
      startDate.setDate(startDate.getDate() + daysUntilMonday)
    }
    const currentMonday = new Date(now)
    currentMonday.setHours(0, 0, 0, 0)
    currentMonday.setDate(currentMonday.getDate() - ((currentMonday.getDay() + 6) % 7))
    const lastSelectableMonday = new Date(currentMonday)
    lastSelectableMonday.setDate(lastSelectableMonday.getDate() + 21)
    if (startDate.getDay() !== 1 || startDate < currentMonday || startDate > lastSelectableMonday) {
      return response.status(400).json({ error: 'Chỉ nhận đặt trước trong một trong 4 tuần đang hiển thị.' })
    }
    const nextDate = new Date(startDate)
    nextDate.setDate(nextDate.getDate() + 1)
    const existingWeek = await farmBoxWeeks.findOne({
      farmBoxId, schedulePending: true,
      startDate: { $gte: startDate, $lt: nextDate },
    })
    if (existingWeek) return response.json({ data: {
      id: existingWeek._id.toString(), startDate: existingWeek.startDate, endDate: existingWeek.endDate,
      price: asNumber(existingWeek.price), maxBoxes: asNumber(existingWeek.maxBoxes),
      bookedBoxes: asNumber(existingWeek.bookedBoxes), status: existingWeek.status,
      available: Math.max(0, asNumber(existingWeek.maxBoxes) - asNumber(existingWeek.bookedBoxes)),
      canPurchase: existingWeek.status === 'Đang mở' && asNumber(existingWeek.maxBoxes) > asNumber(existingWeek.bookedBoxes),
      schedulePending: true, items: [],
    } })
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    const price = asNumber(box.price)
    if (!price) return response.status(409).json({ error: 'FarmBox chưa có giá để nhận đặt trước.' })
    const week = {
      farmBoxId, startDate, endDate, price, maxBoxes: 60, bookedBoxes: 0,
      status: 'Đang mở', items: [], schedulePending: true, contentHistory: [],
    }
    const result = await farmBoxWeeks.insertOne(week)
    return response.status(201).json({ data: {
      id: result.insertedId.toString(), startDate, endDate, price, maxBoxes: 60,
      bookedBoxes: 0, available: 60, status: 'Đang mở', canPurchase: true,
      schedulePending: true, items: [],
    } })
  } catch (error) { next(error) }
})

app.get('/api/products', async (request, response, next) => {
  try {
    const { category, q = '', line = 'Standard' } = request.query
    const filter = { productLine: line, isArchived: { $ne: true } }

    if (category) {
      const matchingCategory = await database.collection('categories').findOne({ name: category })
      if (!matchingCategory) return response.json({ data: [] })
      filter.categoryId = matchingCategory._id
    }

    if (q.trim()) filter.name = { $regex: escapeRegex(q.trim()), $options: 'i' }

    const products = await database.collection('products').aggregate([
      { $match: filter },
      { $sort: { name: 1 } },
      { $limit: 100 },
      { $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categoryDoc' } },
      { $lookup: { from: 'farms', localField: 'farmId', foreignField: '_id', as: 'farmDoc' } },
      { $lookup: { from: 'inventory', localField: '_id', foreignField: 'productId', as: 'inventoryDoc' } },
      {
        $project: {
          name: 1,
          description: 1,
          imageUrl: 1,
          images: 1,
          price: 1,
          unit: 1,
          stepQty: 1,
          productLine: 1,
          certification: 1,
          certifications: 1,
          qualityStandard: 1,
          standard: 1,
          status: 1,
          saleStatus: '$status',
          isRestocking: 1,
          seasonMonths: 1,
          harvestDate: 1,
          createdAt: 1,
          categoryName: { $ifNull: ['$categoryName', { $ifNull: [{ $first: '$categoryDoc.name' }, 'Khác'] }] },
          category: { $ifNull: [{ $first: '$categoryDoc.name' }, 'Khác'] },
          farm: { $ifNull: [{ $first: '$farmDoc.name' }, 'Nông trại GreenNova'] },
          region: { $ifNull: [{ $first: '$farmDoc.region' }, ''] },
          quantity: { $ifNull: [{ $first: '$inventoryDoc.quantity' }, 0] },
          reservedQty: { $ifNull: [{ $first: '$inventoryDoc.reservedQty' }, 0] },
        },
      },
    ]).toArray()

    response.json({
      data: products.map((product) => {
        const available = Math.max(0, asNumber(product.quantity) - asNumber(product.reservedQty))
        return {
          id: product._id.toString(),
          name: product.name,
          category: product.category,
          categoryName: product.categoryName || product.category || 'Khác',
          farm: product.farm,
          region: product.region,
          price: asNumber(product.price),
          unit: product.unit,
          priceUnitQuantity: asNumber(product.stepQty),
          certification: product.certification || product.certifications || product.qualityStandard || product.standard || '',
          step: productQuantityStep(product, product.categoryName || product.category),
          seasonMonths: Array.isArray(product.seasonMonths) ? product.seasonMonths : [],
          harvestDate: product.harvestDate || null,
          createdAt: product.createdAt || null,
          stock: available,
          description: product.description || '',
          image: product.imageUrl || '',
          images: [...new Set([product.imageUrl, ...asImageList(product.images)].filter(Boolean))],
          badge: product.productLine === 'Imperfect' ? 'Giải cứu' : 'Nông sản tươi',
          status: product.status === 'Đang bán' && available > 0 ? 'Đang bán' : 'Hết hàng',
          canPurchase: product.status === 'Đang bán' && available > 0,
          saleStatus: product.saleStatus || product.status,
          isRestocking: product.isRestocking === true,
        }
      }),
    })
  } catch (error) {
    next(error)
  }
})

const normalizeAssistantText = (value) => String(value || '').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, ' ').trim()

async function getAssistantFaqEntries() {
  const names = (await database.listCollections({}, { nameOnly: true }).toArray())
    .map(({ name }) => name)
    .filter((name) => /chat|faq|question|answer|hoi.?dap|qa/.test(normalizeAssistantText(name).replace(/ /g, '')))
  const entries = []
  for (const collectionName of names) {
    const documents = await database.collection(collectionName).find({}).limit(1000).toArray()
    for (const document of documents) {
      const fields = Object.entries(document).map(([key, value]) => ({ key: normalizeAssistantText(key), value }))
      const toText = (value) => Array.isArray(value)
        ? value.map((item) => typeof item === 'string' ? item : '').filter(Boolean).join(' ')
        : typeof value === 'string' ? value : ''
      const questionText = fields
        .filter(({ key }) => /question|cau hoi|prompt|intent|keyword|tu khoa|^q$/.test(key))
        .map(({ value }) => toText(value)).filter(Boolean).join(' ')
      const answerText = fields
        .filter(({ key }) => /answer|cau tra loi|tra loi|response|phan hoi|noi dung|^a$/.test(key))
        .map(({ value }) => toText(value)).filter(Boolean).join('\n')
      if (questionText && answerText) entries.push({ question: questionText, answer: answerText })
    }
  }
  return entries
}

async function getAssistantComboListAnswer() {
  const combos = await database.collection('combos')
    .find({ isActive: true, isPublished: true })
    .sort({ name: 1 })
    .toArray()
  if (!combos.length) {
    return { answer: 'Hiện chưa có Combo nào đang mở bán.', source: 'mongodb-combos' }
  }

  const componentIds = [...new Map(combos.flatMap((combo) => combo.items || [])
    .filter((item) => item.productId)
    .map((item) => [item.productId.toString(), item.productId])).values()]
  const products = componentIds.length
    ? await database.collection('products').find({ _id: { $in: componentIds } }, { projection: { name: 1 } }).toArray()
    : []
  const productsById = new Map(products.map((product) => [product._id.toString(), product]))
  const lines = combos.map((combo) => {
    const components = (combo.items || []).map((item) => (
      productsById.get(item.productId?.toString())?.name || item.name || ''
    )).filter(Boolean)
    const price = `${new Intl.NumberFormat('vi-VN').format(asNumber(combo.price))}đ`
    return `• ${combo.name} — ${price}${components.length ? `. Gồm: ${components.join(', ')}` : ''}`
  })
  return { answer: `Các Combo đang mở bán:\n${lines.join('\n')}`, source: 'mongodb-combos', actions: assistantActions.combos }
}

async function getAssistantComboDetailsAnswer(question, history = []) {
  const combos = await database.collection('combos')
    .find({ isActive: true, isPublished: true })
    .toArray()
  if (!combos.length) return null

  const productIds = [...new Map(combos.flatMap((combo) => combo.items || [])
    .filter((item) => item.productId)
    .map((item) => [item.productId.toString(), item.productId])).values()]
  const products = productIds.length
    ? await database.collection('products').find({ _id: { $in: productIds } }, { projection: { name: 1, unit: 1 } }).toArray()
    : []
  const productById = new Map(products.map((product) => [product._id.toString(), product]))
  const currentText = normalizeAssistantText(question)
  const historyTexts = [...history].reverse().map((entry) => normalizeAssistantText(entry.content))
  let combo = combos.find((entry) => {
    const name = normalizeAssistantText(entry.name)
    return name.length > 3 && currentText.includes(name)
  })

  if (!combo) {
    for (const text of historyTexts) {
      combo = combos.find((entry) => {
        const name = normalizeAssistantText(entry.name)
        return name.length > 3 && text.includes(name)
      })
      if (combo) break
    }
  }
  if (!combo) return null

  const items = (combo.items || []).map((item) => {
    const product = productById.get(item.productId?.toString())
    return {
      name: product?.name || item.name || 'Sản phẩm',
      quantity: asNumber(item.quantityPerCombo),
      unit: product?.unit || '',
    }
  })
  if (!items.length) {
    return { answer: `Mình chưa có thông tin thành phần cho ${combo.name}.`, source: 'mongodb-combos', actions: assistantActions.combos }
  }
  const formatQuantity = (quantity) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(quantity)
  const totalKg = items.reduce((total, item) => (
    normalizeAssistantText(item.unit).includes('kg') ? total + item.quantity : total
  ), 0)
  const itemList = items.map((item) => `${item.name} ${formatQuantity(item.quantity)} ${item.unit}`.trim()).join(', ')
  const weightText = totalKg > 0 ? ` Tổng khối lượng khoảng ${formatQuantity(totalKg)} kg.` : ''
  return {
    answer: `${combo.name} gồm: ${itemList}.${weightText}`,
    source: 'mongodb-combos',
    actions: assistantActions.combos,
  }
}

async function getAssistantComboAvailabilityAnswer(question, history = []) {
  const combos = await database.collection('combos').find({ isActive: true, isPublished: true }).toArray()
  if (!combos.length) return null
  const texts = [normalizeAssistantText(question), ...[...history].reverse().map((entry) => normalizeAssistantText(entry.content))]
  const genericWords = new Set(['combo', 'con', 'hang', 'khong', 'co', 'la', 'gi', 'bao', 'nhieu', 'dang', 'ban', 'mua', 'duoc', 'ton', 'kho'])
  let combo = null
  for (const text of texts) {
    combo = combos.find((entry) => {
      const name = normalizeAssistantText(entry.name)
      return name.length > 3 && text.includes(name)
    })
    if (!combo) {
      const queryTokens = [...new Set(text.split(/\s+/).filter((word) => word.length > 1 && !genericWords.has(word)))]
      const ranked = combos.map((entry) => {
        const nameTokens = [...new Set(normalizeAssistantText(entry.name).split(/\s+/).filter((word) => word.length > 1 && !genericWords.has(word)))]
        const matched = nameTokens.filter((word) => queryTokens.includes(word))
        return { entry, matchedCount: matched.length, score: matched.length / Math.max(1, nameTokens.length) }
      }).filter(({ matchedCount, score }) => matchedCount >= 2 && score >= 0.5)
        .sort((left, right) => right.score - left.score || right.matchedCount - left.matchedCount)
      combo = ranked[0]?.entry || null
    }
    if (combo) break
  }
  if (!combo) return null

  const stockedCombo = await ensureComboStock(database, combo)
  const stock = availableComboStock(stockedCombo)
  return {
    answer: stock > 0
      ? `${stockedCombo.name} hiện còn hàng, còn ${stock} combo có thể đặt.`
      : `${stockedCombo.name} hiện đã hết hàng, chưa thể đặt lúc này.`,
    source: 'mongodb-combo-stock',
    actions: assistantActions.combos,
  }
}

async function getAssistantProductAnswer(normalizedQuestion, history = [], allowHistoryContext = false) {
  const ignoredWords = new Set(['ben', 'minh', 'co', 'khong', 'ban', 'gia', 'bao', 'nhieu', 'la', 'gi', 'nao', 'shop', 'green', 'nova', 'cho', 'toi', 'hoi', 'nhe', 'xin', 'muon', 'mua', 'hang', 'san', 'pham', 'nong', 'rau', 'cu', 'qua', 'hien', 'tai', 'con', 'het', 'loai', 'giup', 've', 'voi', 'nay', 'cua', 'thu', 'hoach', 'hom', 'ngay', 'nong', 'trai', 'vao'])
  const products = await database.collection('products').find({ isArchived: { $ne: true } }, {
    projection: { name: 1, price: 1, unit: 1, status: 1, farmId: 1, categoryId: 1, productLine: 1, harvestDate: 1 },
  }).limit(1000).toArray()
  const findMatches = (text) => {
    const tokens = normalizeAssistantText(text).split(/\s+/).filter((word) => word.length > 1 && !ignoredWords.has(word))
    if (!tokens.length) return []
    return products.map((product) => {
      const nameTokens = new Set(normalizeAssistantText(product.name).split(/\s+/).filter(Boolean))
      // Match whole normalized name words. Substring matching makes short names
      // such as "bo" (bơ) incorrectly match "bong" (bông cải).
      const matched = tokens.filter((token) => nameTokens.has(token))
      return { product, score: matched.length / tokens.length }
    }).filter(({ score }) => score >= 0.6)
      .sort((a, b) => b.score - a.score || String(a.product.name).localeCompare(String(b.product.name), 'vi'))
  }

  // A product named in the current message takes precedence over older chat context.
  let scored = findMatches(normalizedQuestion)
  if (!scored.length && allowHistoryContext) {
    const recentProductMessage = [...history].reverse()
      .filter((entry) => entry.role === 'user')
      .map((entry) => findMatches(entry.content))
      .find((matches) => matches.length)
    scored = recentProductMessage || []
  }
  scored = scored.slice(0, 1)
  if (!scored.length) return null

  const inventory = await database.collection('inventory').find({
    productId: { $in: scored.map(({ product }) => product._id) },
  }, { projection: { productId: 1, quantity: 1, reservedQty: 1 } }).toArray()
  const stockById = new Map(inventory.map((record) => [record.productId.toString(), Math.max(0, asNumber(record.quantity) - asNumber(record.reservedQty))]))
  const farmIds = [...new Map(scored.map(({ product }) => product.farmId).filter(Boolean).map((id) => [id.toString(), id])).values()]
  const farms = farmIds.length ? await database.collection('farms').find({ _id: { $in: farmIds } }, { projection: { name: 1 } }).toArray() : []
  const farmById = new Map(farms.map((farm) => [farm._id.toString(), farm.name]))
  const asksFarm = /nong trai|farm/.test(normalizedQuestion)
  const asksHarvestDate = /thu hoach|ngay thu hoach/.test(normalizedQuestion)
  const asksRestockDate = /khi nao co lai|bao gio co lai|chung nao co(?: lai)?|nhap lai|hang ve|co hang lai/.test(normalizedQuestion)
  const lines = scored.map(({ product }) => {
    const stock = stockById.get(product._id.toString()) || 0
    const state = product.status !== 'Đang bán' ? product.status || 'Ngừng bán' : stock > 0 ? 'Đang bán' : 'Hết hàng'
    const farm = farmById.get(product.farmId?.toString())
    if (asksRestockDate && stock <= 0) {
      return `${product.name} hiện đã hết hàng. GreenNova chưa có lịch nhập lại được cập nhật.`
    }
    const details = [`${new Intl.NumberFormat('vi-VN').format(asNumber(product.price))}đ/${product.unit || 'đơn vị'}`, state]
    if (farm || asksFarm) details.push(`Nông trại: ${farm || 'chưa cập nhật'}`)
    if (asksHarvestDate) {
      const harvestDate = product.harvestDate ? new Date(product.harvestDate) : null
      const formattedHarvestDate = harvestDate && !Number.isNaN(harvestDate.getTime())
        ? new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(harvestDate)
        : 'chưa cập nhật'
      details.push(`Ngày thu hoạch: ${formattedHarvestDate}`)
    }
    return `• ${product.name} — ${details.join('; ')}`
  })
  return { answer: lines.length === 1 ? lines[0].replace(/^• /, '') : `Thông tin nông sản tìm được:\n${lines.join('\n')}`, source: 'mongodb-products', actions: assistantActions.products }
}

async function getAssistantProductListAnswer() {
  const products = await database.collection('products').find({
    productLine: 'Standard',
    isArchived: { $ne: true },
    status: 'Đang bán',
  }, { projection: { name: 1, price: 1, unit: 1 } }).sort({ name: 1 }).limit(30).toArray()
  if (!products.length) {
    return { answer: 'Hiện chưa có nông sản nào đang mở bán.', source: 'mongodb-products' }
  }

  const lines = products.map((product) => (
    `• ${product.name} — ${new Intl.NumberFormat('vi-VN').format(asNumber(product.price))}đ/${product.unit || 'đơn vị'}`
  ))
  return { answer: `Các nông sản đang bán:\n${lines.join('\n')}`, source: 'mongodb-products', actions: assistantActions.products }
}

async function getAssistantFruitListAnswer() {
  const [categories, products] = await Promise.all([
    database.collection('categories').find({}, { projection: { name: 1 } }).toArray(),
    database.collection('products').find({
      productLine: 'Standard',
      isArchived: { $ne: true },
      status: 'Đang bán',
    }, { projection: { name: 1, price: 1, unit: 1, categoryId: 1, categoryName: 1, category: 1 } }).limit(1000).toArray(),
  ])
  const fruitCategoryIds = new Set(categories
    .filter((category) => /trai cay|hoa qua/.test(normalizeAssistantText(category.name)))
    .map((category) => category._id.toString()))
  const categoryNameById = new Map(categories.map((category) => [category._id.toString(), category.name || '']))
  const fruitNamePrefixes = ['bo sap', 'cam ', 'chuoi', 'nho ', 'tao ', 'du du', 'oi ', 'mit ', 'xoai', 'dua hau', 'chanh day', 'sau rieng']
  const fruits = products.filter((product) => {
    const categoryName = normalizeAssistantText(product.categoryName || product.category || '')
      || normalizeAssistantText(categoryNameById.get(product.categoryId?.toString()) || '')
    const name = normalizeAssistantText(product.name)
    return /trai cay|hoa qua/.test(categoryName)
      || fruitCategoryIds.has(product.categoryId?.toString())
      || fruitNamePrefixes.some((term) => name === term || name.startsWith(term))
  }).sort((left, right) => String(left.name).localeCompare(String(right.name), 'vi'))

  if (!fruits.length) {
    return {
      answer: 'Hiện chưa có loại trái cây nào đang bán được cập nhật trong danh mục.',
      source: 'mongodb-fruit-products',
      actions: assistantActions.products,
    }
  }
  const lines = fruits.map((fruit) => (
    `• ${fruit.name} — ${new Intl.NumberFormat('vi-VN').format(asNumber(fruit.price))}đ/${fruit.unit || 'đơn vị'}`
  ))
  return {
    answer: `Các loại trái cây đang bán tại GreenNova:\n${lines.join('\n')}`,
    source: 'mongodb-fruit-products',
    actions: assistantActions.products,
  }
}

async function getAssistantSeasonalProductAnswer() {
  const month = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', month: 'numeric',
  }).format(new Date()))
  const products = await database.collection('products').find({
    isArchived: { $ne: true },
    seasonMonths: { $in: [month, String(month)] },
  }, { projection: { name: 1, price: 1, unit: 1, status: 1 } }).sort({ name: 1 }).limit(50).toArray()
  const monthName = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', month: 'long',
  }).format(new Date())
  if (!products.length) {
    return { answer: `GreenNova chưa có dữ liệu mùa vụ được cấu hình cho ${monthName}. Bạn có thể xem danh sách nông sản đang bán để chọn sản phẩm hiện có.`, source: 'mongodb-products-season' }
  }
  const lines = products.map((product) => (
    `• ${product.name} — ${new Intl.NumberFormat('vi-VN').format(asNumber(product.price))}đ/${product.unit || 'đơn vị'}${product.status && product.status !== 'Đang bán' ? ` (${product.status})` : ''}`
  ))
  return { answer: `Theo dữ liệu mùa vụ GreenNova, ${monthName} có các loại nông sản:\n${lines.join('\n')}`, source: 'mongodb-products-season', actions: assistantActions.products }
}

async function getAssistantSeasonalVegetableRecommendation() {
  const month = Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh', month: 'numeric',
  }).format(new Date()))
  const products = await database.collection('products').find({
    isArchived: { $ne: true },
    seasonMonths: { $in: [month, String(month)] },
  }, { projection: { name: 1, price: 1, unit: 1, status: 1 } }).toArray()
  const fruitTerms = ['bo sap', 'cam sanh', 'chuoi', 'nho', 'tao', 'du du', 'oi le']
  const vegetables = products.filter((product) => {
    const name = normalizeAssistantText(product.name)
    const unit = normalizeAssistantText(product.unit)
    const status = normalizeAssistantText(product.status)
    return unit.includes('kg')
      && !fruitTerms.some((term) => name.includes(term))
      && !['khong ban', 'ngung ban', 'het hang'].includes(status)
  }).sort((left, right) => asNumber(left.price) - asNumber(right.price))

  const formatMoney = (value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`
  const portions = vegetables.slice(0, 3).map((product) => ({
    name: product.name,
    unitPrice: asNumber(product.price),
    quantity: 0.5,
  }))
  const total = portions.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const monthName = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh', month: 'long',
  }).format(new Date())
  const lines = portions.map((item) => (
    `• ${item.name}: 0,5 kg — khoảng ${formatMoney(item.unitPrice * item.quantity)}`
  ))
  const now = new Date()
  const todayKey = getSaigonDateKey(now)
  const weekStart = addDateKeyDays(todayKey, -((new Date(`${todayKey}T00:00:00.000Z`).getUTCDay() + 6) % 7))
  const boxes = await database.collection('farmBoxes').find({}, { projection: { name: 1, price: 1 } }).toArray()
  const boxById = new Map(boxes.map((box) => [box._id.toString(), box]))
  let weeks = boxes.length ? await database.collection('farmBoxWeeks').find({
    farmBoxId: { $in: boxes.map((box) => box._id) },
    selectedForWeek: { $ne: false },
    status: { $in: ['Đang mở', 'Sắp mở'] },
    endDate: { $gte: now },
  }).sort({ startDate: 1 }).toArray() : []
  weeks = weeks.filter((week) => Boolean(boxById.get(week.farmBoxId?.toString())?.name))
  const currentWeeks = weeks.filter((week) => getSaigonDateKey(week.startDate) <= todayKey && getSaigonDateKey(week.endDate) >= todayKey)
  if (currentWeeks.length) {
    weeks = currentWeeks
  } else {
    const nextStart = weeks.map((week) => getSaigonDateKey(week.startDate)).filter((date) => date >= todayKey).sort()[0]
    weeks = nextStart ? weeks.filter((week) => getSaigonDateKey(week.startDate) === nextStart) : []
  }
  const affordableFarmBoxes = [...new Map(weeks.map((week) => {
    const box = boxById.get(week.farmBoxId.toString())
    const price = asNumber(week.price ?? box.price)
    return [box.name, { name: box.name, price, size: price < 199000 ? 'nhỏ' : price < 300000 ? 'vừa' : 'lớn' }]
  }).filter(([, option]) => option.price > 0)
    .sort((left, right) => left[1].price - right[1].price)).values()].slice(0, 2)

  const comboRecords = await database.collection('combos').find({ isActive: true, isPublished: true }).sort({ price: 1 }).limit(20).toArray()
  const affordableCombos = []
  for (const record of comboRecords) {
    const combo = await ensureComboStock(database, record)
    const stock = availableComboStock(combo)
    if (stock > 0) affordableCombos.push({ name: combo.name, price: asNumber(combo.price), stock })
    if (affordableCombos.length === 2) break
  }

  const vegetableSection = lines.length
    ? `Rau củ theo mùa tháng ${monthName}, gợi ý cho 2 người (mỗi loại khoảng 0,5 kg):\n${lines.join('\n')}\nTổng rau củ dự kiến: ${formatMoney(total)}.`
    : 'Hiện chưa có đủ rau củ theo mùa đang bán để tính giỏ rau riêng.'
  const farmBoxSection = affordableFarmBoxes.length
    ? `Farm Box đang mở có giá thấp:\n${affordableFarmBoxes.map((option) => `• ${option.name} (loại ${option.size}) — ${formatMoney(option.price)}`).join('\n')}`
    : 'Hiện chưa có Farm Box nào đang mở để gợi ý.'
  const comboSection = affordableCombos.length
    ? `Combo còn hàng giá thấp:\n${affordableCombos.map((option) => `• ${option.name} — ${formatMoney(option.price)} (còn ${option.stock})`).join('\n')}`
    : 'Hiện chưa có combo còn hàng để gợi ý.'
  return {
    answer: `${vegetableSection}\n\n${farmBoxSection}\n\n${comboSection}\n\nGiá và khẩu phần là thông tin tham khảo; xem chi tiết gói trước khi đặt.`,
    source: 'mongodb-products-season-budget',
    actions: assistantActions.farmBoxAndCombos,
  }
}

function getSaigonDateKey(value) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value instanceof Date ? value : new Date(value))
  const values = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]))
  return `${values.year}-${values.month}-${values.day}`
}

function addDateKeyDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatSaigonDateKey(dateKey) {
  const [, year, month, day] = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/) || []
  return year ? `${day}/${month}` : ''
}

async function getAssistantFarmBoxScheduleAnswer(normalizedQuestion) {
  const now = new Date()
  const todayKey = getSaigonDateKey(now)
  const todayUtc = new Date(`${todayKey}T00:00:00.000Z`)
  const daysSinceMonday = (todayUtc.getUTCDay() + 6) % 7
  const currentWeekStart = addDateKeyDays(todayKey, -daysSinceMonday)
  const nextWeekStart = addDateKeyDays(currentWeekStart, 7)
  const nextWeekEnd = addDateKeyDays(nextWeekStart, 6)
  const mentionsNextWeek = /tuan toi|tuan sau|tuan tiep theo/.test(normalizedQuestion)
  const mentionsThisWeek = /tuan nay|tuan hien tai/.test(normalizedQuestion)
  const requestedSize = /loai nho|size nho|hop nho|box nho/.test(normalizedQuestion)
  ? 'small'
  : /loai vua|size vua|hop vua|box vua|loai trung binh/.test(normalizedQuestion)
    ? 'medium'
    : /loai lon|size lon|hop lon|box lon/.test(normalizedQuestion)
      ? 'large'
      : ''

  const boxes = await database.collection('farmBoxes').find({}, {
    projection: { name: 1, defaultItems: 1 },
  }).toArray()

  if (!boxes.length) {
    return { answer: 'Hiện chưa có Farm Box nào được mở đăng ký.', source: 'mongodb-farm-boxes' }
  }

  const boxById = new Map(boxes.map((box) => [box._id.toString(), box]))
  const weeks = await database.collection('farmBoxWeeks').find({
    farmBoxId: { $in: boxes.map((box) => box._id) },
    selectedForWeek: { $ne: false },
    status: { $in: ['Đang mở', 'Sắp mở'] },
    endDate: { $gte: now },
  }).sort({ startDate: 1, endDate: 1 }).toArray()

  let scheduledWeeks = weeks.filter((week) => {
    const box = boxById.get(week.farmBoxId?.toString())
    return Boolean(box?.name && week.startDate && week.endDate)
  })

  if (mentionsNextWeek) {
    scheduledWeeks = scheduledWeeks.filter((week) => (
      getSaigonDateKey(week.startDate) <= nextWeekEnd
      && getSaigonDateKey(week.endDate) >= nextWeekStart
    ))
  } else if (mentionsThisWeek) {
      scheduledWeeks = scheduledWeeks.filter((week) => (
        getSaigonDateKey(week.startDate) <= todayKey
        && getSaigonDateKey(week.endDate) >= todayKey
    ))
  } else if (scheduledWeeks.length) {
    const nearestStartKey = scheduledWeeks
      .map((week) => getSaigonDateKey(week.startDate))
      .filter((key) => key >= todayKey)
      .sort()[0]

    if (nearestStartKey) {
      scheduledWeeks = scheduledWeeks.filter((week) => getSaigonDateKey(week.startDate) === nearestStartKey)
    }
  }

  const getSize = (week, box) => {
      const rawPrice = week.price ?? box.price
      if (rawPrice === undefined || rawPrice === null || asNumber(rawPrice) <= 0) return ''

      const price = asNumber(rawPrice)
      return price < 199000 ? 'small' : price < 300000 ? 'medium' : 'large'
  }  

  if (requestedSize) {
  scheduledWeeks = scheduledWeeks.filter((week) => {
    const box = boxById.get(week.farmBoxId?.toString())
    return getSize(week, box) === requestedSize
    })
  }

  if (!scheduledWeeks.length) {
    if (requestedSize) {
      const sizeLabel = { small: 'loại nhỏ', medium: 'loại vừa', large: 'loại lớn' }[requestedSize]
      return { answer: `Hiện chưa có Farm Box ${sizeLabel} được mở đăng ký trong tuần bạn hỏi.`, source: 'mongodb-farm-boxes' }
    }
    const answer = mentionsThisWeek
      ? 'Hiện chưa có Farm Box nào được admin chọn mở bán trong tuần này.'
      : mentionsNextWeek
        ? 'Hiện chưa có Farm Box nào được mở đăng ký cho tuần tới.'
        : 'Hiện chưa có Farm Box nào được mở đăng ký trong lịch sắp tới.'
    return { answer, source: 'mongodb-farm-boxes' }
  }

  const productIds = [...new Set(scheduledWeeks.flatMap((week) => {
    const box = boxById.get(week.farmBoxId.toString())
    const items = Array.isArray(week.items) && week.items.length ? week.items : (box?.defaultItems || [])
    return items.map((item) => item.productId?.toString()).filter((id) => ObjectId.isValid(id))
  }))]

  const productDocs = productIds.length
    ? await database.collection('products').find({
      _id: { $in: productIds.map((id) => new ObjectId(id)) },
    }, { projection: { name: 1, unit: 1 } }).toArray()
    : []
  const productsById = new Map(productDocs.map((product) => [product._id.toString(), product]))
  const formatQuantity = (value) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(asNumber(value))

  const lines = scheduledWeeks.map((week) => {
    const box = boxById.get(week.farmBoxId.toString())
    const items = Array.isArray(week.items) && week.items.length ? week.items : (box.defaultItems || [])
    const itemNames = items.map((item) => {
      const product = productsById.get(item.productId?.toString())
      const name = product?.name || item.name
      if (!name) return ''
      const quantity = asNumber(item.quantity)
      const unit = product?.unit || item.unit || ''
      return `${name}${quantity > 0 ? ` ${formatQuantity(quantity)} ${unit}`.trimEnd() : ''}`
    }).filter(Boolean)

    const startKey = getSaigonDateKey(week.startDate)
    const endKey = getSaigonDateKey(week.endDate)
    const weekLabel = `${formatSaigonDateKey(startKey)}–${formatSaigonDateKey(endKey)}`
    const contents = itemNames.length
      ? `Dự kiến gồm: ${itemNames.join(', ')}.`
      : 'Thực đơn đang được cập nhật.'
    const sizeLabel = getSize(week, box) === 'small' ? 'loại nhỏ' : getSize(week, box) === 'medium' ? 'loại vừa' : 'loại lớn'
    return `${box.name} (${sizeLabel}) — tuần ${weekLabel}. ${contents}`
  })

  return {
    answer: `Farm Box theo lịch admin đã cập nhật:\n${lines.join('\n')}`,
    source: 'mongodb-farm-boxes',
    actions: assistantActions.farmBox,
  }
}

async function getAssistantFarmBoxBudgetAnswer(question) {
  const normalized = normalizeAssistantText(question)
  const compact = normalized.replace(/\s+/g, '')
  const suffixedAmount = compact.match(/(\d+(?:[.,]\d+)?)(k|nghin|ngan|trieu)/)
  const plainAmount = normalized.match(/\b(\d{5,})\b/)
  const budget = suffixedAmount
    ? Number(suffixedAmount[1].replace(',', '.')) * (/trieu/.test(suffixedAmount[2]) ? 1000000 : 1000)
    : plainAmount ? Number(plainAmount[1]) : 0
  if (!budget) return null

  const now = new Date()
  const todayKey = getSaigonDateKey(now)
  const boxes = await database.collection('farmBoxes').find({}, { projection: { name: 1, price: 1 } }).toArray()
  if (!boxes.length) return { answer: 'Hiện chưa có Farm Box nào được mở đăng ký.', source: 'mongodb-farm-boxes' }
  const boxById = new Map(boxes.map((box) => [box._id.toString(), box]))
  let weeks = await database.collection('farmBoxWeeks').find({
    farmBoxId: { $in: boxes.map((box) => box._id) },
    selectedForWeek: { $ne: false },
    status: { $in: ['Đang mở', 'Sắp mở'] },
    endDate: { $gte: now },
  }).sort({ startDate: 1, endDate: 1 }).toArray()
  weeks = weeks.filter((week) => Boolean(boxById.get(week.farmBoxId?.toString())?.name))
  const currentWeeks = weeks.filter((week) => getSaigonDateKey(week.startDate) <= todayKey && getSaigonDateKey(week.endDate) >= todayKey)
  if (currentWeeks.length) {
    weeks = currentWeeks
  } else {
    const nextStart = weeks.map((week) => getSaigonDateKey(week.startDate)).filter((date) => date >= todayKey).sort()[0]
    weeks = nextStart ? weeks.filter((week) => getSaigonDateKey(week.startDate) === nextStart) : []
  }

  const options = weeks.map((week) => {
    const box = boxById.get(week.farmBoxId.toString())
    return { name: box.name, price: asNumber(week.price ?? box.price) }
  }).filter((option) => option.price > 0)
  if (!options.length) {
    return { answer: 'Hiện chưa có Farm Box nào có giá và lịch mở bán để mình so với ngân sách này.', source: 'mongodb-farm-boxes' }
  }
  const formatMoney = (value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`
  const affordable = [...new Map(options.filter((option) => option.price <= budget)
    .sort((a, b) => b.price - a.price)
    .map((option) => [option.name, option])).values()]
  if (!affordable.length) {
    const cheapest = options.sort((a, b) => a.price - b.price)[0]
    return {
      answer: `Ngân sách ${formatMoney(budget)} hiện chưa đủ cho Farm Box đang mở bán. Gói thấp nhất là ${cheapest.name}, giá ${formatMoney(cheapest.price)}.`,
      source: 'mongodb-farm-boxes-budget',
      actions: assistantActions.farmBox,
    }
  }
  const recommendation = affordable[0]
  const alternatives = affordable.slice(1, 4).map((option) => `${option.name} (${formatMoney(option.price)})`)
  return {
    answer: `Với ngân sách ${formatMoney(budget)}, mình gợi ý ${recommendation.name} (${formatMoney(recommendation.price)}).`
      + (alternatives.length ? ` Các lựa chọn khác trong ngân sách: ${alternatives.join(', ')}.` : ''),
    source: 'mongodb-farm-boxes-budget',
    actions: assistantActions.farmBox,
  }
}

async function getAssistantFarmBoxHouseholdRecommendation(question) {
  const normalized = normalizeAssistantText(question)
  const numberMatch = normalized.match(/(\d+)\s*nguoi/)
  const wordCounts = { mot: 1, hai: 2, ba: 3, bon: 4, tu: 4, nam: 5, sau: 6, bay: 7, tam: 8 }
  const wordMatch = normalized.match(/\b(mot|hai|ba|bon|tu|nam|sau|bay|tam) nguoi\b/)
  const people = numberMatch ? Number(numberMatch[1]) : wordCounts[wordMatch?.[1]] || 0
  if (!people) return null

  const preferredSize = people <= 2 ? 'small' : people <= 4 ? 'medium' : 'large'
  const sizeLabels = { small: 'nhỏ', medium: 'vừa', large: 'lớn' }
  const now = new Date()
  const todayKey = getSaigonDateKey(now)
  const boxes = await database.collection('farmBoxes').find({}, { projection: { name: 1, price: 1 } }).toArray()
  if (!boxes.length) {
    return { answer: 'Hiện chưa có Farm Box nào được mở đăng ký.', source: 'mongodb-farm-boxes' }
  }
  const boxById = new Map(boxes.map((box) => [box._id.toString(), box]))
  let weeks = await database.collection('farmBoxWeeks').find({
    farmBoxId: { $in: boxes.map((box) => box._id) },
    selectedForWeek: { $ne: false },
    status: { $in: ['Đang mở', 'Sắp mở'] },
    endDate: { $gte: now },
  }).sort({ startDate: 1 }).toArray()
  weeks = weeks.filter((week) => Boolean(boxById.get(week.farmBoxId?.toString())?.name))
  const currentWeeks = weeks.filter((week) => getSaigonDateKey(week.startDate) <= todayKey && getSaigonDateKey(week.endDate) >= todayKey)
  if (currentWeeks.length) {
    weeks = currentWeeks
  } else {
    const nextStart = weeks.map((week) => getSaigonDateKey(week.startDate)).filter((date) => date >= todayKey).sort()[0]
    weeks = nextStart ? weeks.filter((week) => getSaigonDateKey(week.startDate) === nextStart) : []
  }

  const options = weeks.map((week) => {
    const box = boxById.get(week.farmBoxId.toString())
    const price = asNumber(week.price ?? box.price)
    const size = price < 199000 ? 'small' : price < 300000 ? 'medium' : 'large'
    const params = new URLSearchParams({
      farmBoxId: box._id.toString(),
      weekId: week._id.toString(),
      size: size === 'small' ? 'nho' : size === 'medium' ? 'vua' : 'lon',
      weekStart: new Date(week.startDate).toISOString(),
    })
    return {
      name: box.name,
      price,
      size,
      href: `/farm-box/thuc-don?${params.toString()}`,
    }
  }).filter((option) => option.price > 0)
  const preferred = options.filter((option) => option.size === preferredSize).sort((a, b) => a.price - b.price)
  const formatMoney = (value) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`
  const selected = preferred.slice(0, 2)
  if (!selected.length) {
    const alternatives = options.sort((a, b) => a.price - b.price).slice(0, 3)
    if (!alternatives.length) {
      return { answer: 'Hiện chưa có Farm Box nào mở bán trong tuần này.', source: 'mongodb-farm-boxes' }
    }
    return {
      answer: `Với nhà ${people} người, thường nên xem Farm Box loại ${sizeLabels[preferredSize]}. Hiện tuần này chưa có loại này; các gói đang mở là ${alternatives.map((option) => `${option.name} (loại ${sizeLabels[option.size]}, ${formatMoney(option.price)})`).join(', ')}.`,
      source: 'mongodb-farm-boxes-household',
      actions: alternatives.map((option) => ({ label: `Xem ${option.name}`, href: option.href })),
    }
  }

  return {
    answer: `Với nhà ${people} người, mình gợi ý Farm Box loại ${sizeLabels[preferredSize]}: ${selected.map((option) => `${option.name} — ${formatMoney(option.price)}`).join('; ')}. Chọn gói để xem thực đơn và đặt cho tuần đang mở.`,
    source: 'mongodb-farm-boxes-household',
    actions: selected.map((option) => ({ label: `Xem ${option.name}`, href: option.href })),
  }
}

async function getAssistantCustomerFarmBoxStatus(userId) {
  const todayKey = getSaigonDateKey(new Date())
  const daysSinceMonday = (new Date(`${todayKey}T00:00:00.000Z`).getUTCDay() + 6) % 7
  const weekStart = addDateKeyDays(todayKey, -daysSinceMonday)
  const weekEnd = addDateKeyDays(weekStart, 6)
  const weeks = await database.collection('farmBoxWeeks').find({}).toArray()
  const currentWeekIds = new Set(weeks.filter((week) => (
    getSaigonDateKey(week.startDate) <= weekEnd && getSaigonDateKey(week.endDate) >= weekStart
  )).map((week) => week._id.toString()))
  const orders = await database.collection('orders').find({
    userId: new ObjectId(userId),
    'items.itemType': 'FarmBox',
  }).sort({ createdAt: -1 }).limit(50).toArray()
  const matchingOrders = orders.map((order) => ({
    order,
    boxes: (order.items || []).filter((item) => item.itemType === 'FarmBox' && currentWeekIds.has(item.weekId?.toString())),
  })).filter(({ boxes }) => boxes.length)

  if (!matchingOrders.length) {
    return { answer: 'Mình chưa tìm thấy đơn Farm Box nào của bạn có lịch giao trong tuần này.', source: 'mongodb-customer-orders' }
  }
  const dateLabel = (value) => value
    ? new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
    : ''
  const lines = matchingOrders.flatMap(({ order, boxes }) => boxes.map((box) => {
    const status = order.status === 'Đã nhận' || order.deliveredAt
      ? `đã giao${order.deliveredAt ? ` ngày ${dateLabel(order.deliveredAt)}` : ' thành công'}`
      : order.status === 'Đang giao'
        ? `đang giao${order.deliveryDueAt ? `, dự kiến ${dateLabel(order.deliveryDueAt)}` : ''}`
        : order.status === 'Đã hủy' ? 'đã hủy'
          : order.status === 'Chờ thanh toán' ? 'chưa giao vì đơn đang chờ thanh toán'
            : `chưa giao, đơn đang ở trạng thái ${order.status || 'chờ xử lý'}`
    return `• Đơn ${order.orderCode}: ${box.itemName || 'Farm Box'} × ${asNumber(box.quantity)} — ${status}.`
  }))
  return { answer: lines.join('\n'), source: 'mongodb-customer-orders' }
}

async function getAssistantCustomerOrderStatus(userId) {
  const order = await database.collection('orders').findOne(
    { userId: new ObjectId(userId) },
    { sort: { createdAt: -1 } },
  )
  if (!order) {
    return { answer: 'Mình chưa tìm thấy đơn hàng nào trong tài khoản của bạn.', source: 'mongodb-customer-orders' }
  }
  const status = order.status === 'Đã nhận' || order.deliveredAt
    ? `đã giao thành công${order.deliveredAt ? ` ngày ${new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(order.deliveredAt))}` : ''}`
    : order.status === 'Đang giao'
      ? `đang giao${order.deliveryDueAt ? `, dự kiến giao ${new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(order.deliveryDueAt))}` : ''}`
      : order.status === 'Chờ thanh toán' ? 'đang chờ thanh toán'
        : order.status === 'Đã hủy' ? 'đã hủy'
          : order.status || 'chưa cập nhật'
  const items = (order.items || []).map((item) => `${item.itemName || 'Sản phẩm'} × ${asNumber(item.quantity)}`).slice(0, 4)
  return {
    answer: `Đơn gần nhất của bạn (${order.orderCode || 'chưa có mã'}) hiện ${status}.${items.length ? ` Mặt hàng: ${items.join(', ')}.` : ''}`,
    source: 'mongodb-customer-orders',
  }
}

async function getAssistantChatUserId(request) {
  const [scheme, token] = String(request.get('authorization') || '').split(' ')
  if (scheme !== 'Bearer' || !token || !process.env.JWT_SECRET) return null
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (!ObjectId.isValid(payload.sub)) return null
    const user = await database.collection('users').findOne(
      { _id: new ObjectId(payload.sub), status: 'Active' },
      { projection: { _id: 1 } },
    )
    return user?._id.toString() || null
  } catch {
    return null
  }
}

app.get('/api/assistant/questions', async (_request, response, next) => {
  try {
    const entries = await getAssistantFaqEntries()
    const questions = [...new Set(entries.flatMap(({ question }) => question.split(/\s*\|\s*|\s*;\s*/).map((part) => part.trim()).filter(Boolean)))].slice(0, 6)
    response.json({ data: { questions } })
  } catch (error) { next(error) }
})

app.post('/api/assistant/chat', async (request, response, next) => {
  try {
    const question = String(request.body?.message || '').trim()
    if (!question || question.length > 500) {
      return response.status(400).json({ error: 'Câu hỏi cần có nội dung và không dài quá 500 ký tự.' })
    }

    const normalizedQuestion = normalizeAssistantText(question)
    const history = Array.isArray(request.body?.history)
      ? request.body.history.slice(-10).map((entry) => ({
        role: entry?.role === 'assistant' ? 'assistant' : 'user',
        content: String(entry?.content || '').trim().slice(0, 500),
      })).filter((entry) => entry.content)
  : []

    const previousUserMessages = history.filter((entry) => entry.role === 'user').slice(-4)
    const isConversationalFollowUp = Boolean(previousUserMessages.length && (
      /^(con(?: nua| gi)?|the con|vay con|loai|size|gia|bao nhieu|thoi han|han su dung|doi tra|giao hang|cai do|loai do|san pham do|rau nay|qua nay|san pham nay)\b/.test(normalizedQuestion)
      || /\b(con nua|con gi|the con|vay con|the nao|cai do|loai do|san pham do|hop do|combo do|rau nay|qua nay|san pham nay|nong trai nao|thu hoach|khi nao co lai|bao gio co lai|chung nao co( lai)?|nhap lai|hang ve|co hang lai)\b/.test(normalizedQuestion)
    ))
    const contextualQuestion = isConversationalFollowUp
      ? normalizeAssistantText(`${previousUserMessages.map((entry) => entry.content).join(' ')} ${question}`)
      : normalizedQuestion
    const referencesPreviousProduct = /\b(san pham nay|nong san nay|rau nay|qua nay|cai nay|loai nay|san pham do|nong san do|rau do|qua do|khi nao co lai|bao gio co lai|chung nao co( lai)?|nhap lai|hang ve|co hang lai)\b/.test(normalizedQuestion)

    const hasFarmBoxContext = history.some((entry) =>
      /farm box|farmbox|hop nong trai|hop nong san/.test(normalizeAssistantText(entry.content))
    )
    const followUpSize = normalizedQuestion.match(/(?:loai|size|hop|box)\s+(nho|vua|lon)\b/)?.[1]
      || normalizedQuestion.match(/^(nho|vua|lon)$/)?.[1]
    const isFarmBoxSizeFollowUp = Boolean(hasFarmBoxContext && followUpSize)

    const previousWeekQuestion = [...history].reverse().find((entry) =>
      entry.role === 'user' && /tuan nay|tuan toi|tuan sau|tuan tiep theo/.test(normalizeAssistantText(entry.content))
    )
    const previousWeekPhrase = previousWeekQuestion
      ? normalizeAssistantText(previousWeekQuestion.content).match(/tuan nay|tuan toi|tuan sau|tuan tiep theo/)?.[0] || ''
      : ''

    const farmBoxQuestion = isFarmBoxSizeFollowUp
      ? `farm box loai ${followUpSize} ${previousWeekPhrase}`.trim()
      : question
    const effectiveQuestion = normalizeAssistantText(farmBoxQuestion)

    const asksFarmBoxSchedule = /farm box|farmbox|hop nong trai|hop nong san/.test(effectiveQuestion)
      && /tuan|lich|dang ky|thuc don|gom|san pham|mo ban|dang mo|ten|loai nao|hop nao|goi nao|loai nho|loai vua|loai lon|size nho|size vua|size lon|hop nho|hop vua|hop lon|cac loai|nhung loai|co gi|loai farm box/.test(effectiveQuestion)

    const asksOwnFarmBoxDeliveryStatus = /farm box|farmbox|hop nong trai|hop nong san/.test(normalizedQuestion)
      && /(cua toi|don hang|giao chua|da giao|duoc giao|dang giao|nhan chua|tinh trang don)/.test(normalizedQuestion)
    if (asksOwnFarmBoxDeliveryStatus) {
      const userId = await getAssistantChatUserId(request)
      if (!userId) {
        return response.json({ data: {
          answer: 'Bạn đăng nhập để mình kiểm tra trạng thái đơn Farm Box của bạn nhé.',
          source: 'mongodb-customer-orders-auth-required',
        } })
      }
      const data = await getAssistantCustomerFarmBoxStatus(userId)
      return response.json({ data })
    }
    const asksOwnOrderStatus = /don hang cua toi|don hang toi|trang thai don hang|don hang.*trang thai/.test(normalizedQuestion)
    if (asksOwnOrderStatus) {
      const userId = await getAssistantChatUserId(request)
      if (!userId) {
        return response.json({ data: {
          answer: 'Bạn đăng nhập để mình kiểm tra trạng thái đơn hàng của bạn nhé.',
          source: 'mongodb-customer-orders-auth-required',
        } })
      }
      const data = await getAssistantCustomerOrderStatus(userId)
      return response.json({ data })
    }

    const asksFarmBoxByHousehold = /farm box|farmbox|hop nong trai|hop nong san/.test(normalizedQuestion)
      && /nguoi/.test(normalizedQuestion)
      && /nen mua|nen chon|goi y|phu hop/.test(normalizedQuestion)
    if (asksFarmBoxByHousehold) {
      const data = await getAssistantFarmBoxHouseholdRecommendation(question)
      if (data) return response.json({ data })
    }

    const asksFarmBoxBudget = /farm box|farmbox|hop nong trai|hop nong san/.test(normalizedQuestion)
      && /ngan sach|nen dat|phu hop|voi .* (k|nghin|ngan|trieu)/.test(normalizedQuestion)
    if (asksFarmBoxBudget) {
      const data = await getAssistantFarmBoxBudgetAnswer(question)
      if (data) return response.json({ data })
    }

    if (asksFarmBoxSchedule) {
      const data = await getAssistantFarmBoxScheduleAnswer(effectiveQuestion)
      return response.json({ data })
    }
    const asksForComboList = /\bcombo\b/.test(normalizedQuestion)
      && (/^(combo|combo imperfect|imperfect combo)$/.test(normalizedQuestion)
        || /co .*combo|combo .*nao|combo gi|cac combo|nhung combo|danh sach combo|loai combo/.test(normalizedQuestion))
    if (asksForComboList) {
      const data = await getAssistantComboListAnswer()
      return response.json({ data })
    }
    const asksComboAvailability = /\bcombo\b/.test(normalizedQuestion)
      && /con hang|het hang|co hang|ton kho|mua duoc/.test(normalizedQuestion)
    if (asksComboAvailability) {
      const data = await getAssistantComboAvailabilityAnswer(question, history)
      return response.json({ data: data || {
        answer: 'Mình chưa xác định được combo bạn đang hỏi. Bạn gửi tên combo để mình kiểm tra tồn kho nhé.',
        source: 'mongodb-combo-context-needed',
      } })
    }
    const asksComboDetails = /\bcombo\b/.test(normalizedQuestion)
      && /gom nhung gi|gom gi|thanh phan|bao nhieu kg|co nhung gi|combo nay|combo do/.test(normalizedQuestion)
    if (asksComboDetails) {
      const data = await getAssistantComboDetailsAnswer(question, history)
      return response.json({ data: data || {
        answer: 'Bạn cho mình biết tên combo muốn xem nhé, mình sẽ tra thành phần và khối lượng cụ thể.',
        source: 'mongodb-combo-context-needed',
      } })
    }
    const asksForProductList = /^(nong san|rau cu qua|san pham|nong san green nova)$/.test(normalizedQuestion)
      || /co (nong san|rau cu qua|san pham) gi|danh sach (nong san|san pham)|cac (nong san|san pham)|nhung (nong san|san pham)/.test(normalizedQuestion)
    const asksForFruitList = /(trai cay|hoa qua)/.test(normalizedQuestion)
      && /(loai|nhung|cac|danh sach|nao|gi|ban gi)/.test(normalizedQuestion)
    if (asksForFruitList) {
      const data = await getAssistantFruitListAnswer()
      return response.json({ data })
    }
    if (asksForProductList) {
      const data = await getAssistantProductListAnswer()
      return response.json({ data })
    }
    const asksSeasonalBudgetRecommendation = /rau cu|rau|nong san/.test(normalizedQuestion)
      && /(2 nguoi|hai nguoi|cho .* nguoi)/.test(normalizedQuestion)
      && /(theo mua|mua vu|uu tien theo mua)/.test(normalizedQuestion)
      && /(tiet kiem|ngan sach|re)/.test(normalizedQuestion)
    if (asksSeasonalBudgetRecommendation) {
      const data = await getAssistantSeasonalVegetableRecommendation()
      return response.json({ data })
    }
    const asksForSeasonalProducts = /mua vu|vao mua|theo mua|dang vao mua|thang nay.*mua|mua.*thang nay/.test(normalizedQuestion)
    if (asksForSeasonalProducts) {
      const data = await getAssistantSeasonalProductAnswer()
      return response.json({ data })
    }
    const productAnswer = await getAssistantProductAnswer(normalizedQuestion, history, referencesPreviousProduct)
    if (productAnswer) return response.json({ data: productAnswer })
    const asksProductOriginOrHarvest = /nong trai nao|thu hoach|rau nay|qua nay|san pham nay|nong san nay/.test(normalizedQuestion)
    if (asksProductOriginOrHarvest) {
      return response.json({ data: {
        answer: 'Bạn cho mình biết tên nông sản đang hỏi nhé. Mình sẽ tra nông trại cung cấp và ngày thu hoạch nếu dữ liệu đã được cập nhật.',
        source: 'mongodb-product-context-needed',
      } })
    }
    const stopWords = new Set(['cho', 'toi', 'gia', 'bao', 'nhieu', 'co', 'khong', 'nao', 'la', 'the', 'gi', 'vay', 'cua', 've', 'voi', 'mot', 'cac', 'hay', 'giup', 'minh', 'nhe', 'xin', 'hoi', 'nong', 'san', 'rau', 'cu', 'qua'])
    const words = String(contextualQuestion || normalizedQuestion).split(/\s+/).filter((word) => word.length > 1 && !stopWords.has(word))
    const entries = (await getAssistantFaqEntries()).filter(({ answer }) => !/\[[^\]]{2,}\]/.test(String(answer || '')))
    const ranked = entries.map((entry) => {
      const normalizedFaq = normalizeAssistantText(entry.question)
      const matchedWords = words.filter((word) => normalizedFaq.includes(word))
      const exactMatch = normalizedQuestion === normalizedFaq
      const score = exactMatch ? 1 : matchedWords.length / Math.max(1, words.length)
      const relevant = exactMatch
        || (words.length >= 2 && matchedWords.length >= 2 && score >= 0.6)
        || (words.length === 1 && words[0].length >= 5 && matchedWords.length === 1)
      return { ...entry, score, matchedWords, relevant }
    }).sort((first, second) => second.score - first.score)

    const match = ranked[0]
    if (!isConversationalFollowUp && match?.relevant && match.score >= 0.85) {
      return response.json({ data: {
        answer: match.answer,
        matchedQuestion: match.question,
        source: 'mongodb',
        actions: getAssistantActionsForAnswer(question, match.answer),
      } })
    }

    const candidates = ranked.filter((entry) => entry.relevant).slice(0, 5)
    const apiKey = process.env.GEMINI_API_KEY

    if (apiKey) {
      try {
        const [liveProducts, liveCombos, liveBoxes] = await Promise.all([
          database.collection('products').find({ productLine: 'Standard', status: 'Đang bán' }, { projection: { name: 1, price: 1, unit: 1 } }).limit(30).toArray(),
          database.collection('combos').find({ isActive: true, isPublished: true }, { projection: { name: 1, price: 1 } }).limit(10).toArray(),
          database.collection('farmBoxes').find({}, { projection: { name: 1, price: 1 } }).limit(10).toArray(),
        ])
        const candidateModels = [...new Set([process.env.GEMINI_MODEL || 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'])]
        let lastAiError = null
        for (const modelName of candidateModels) {
          try {
            const aiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              body: JSON.stringify({
                model: modelName,
                store: false,
                system_instruction: [
                  'Bạn là trợ lý tư vấn thân thiện của cửa hàng nông sản sạch GreenNova, trả lời ngắn gọn, tự nhiên bằng tiếng Việt.',
                  'Phí giao hàng đồng giá 30.000đ, miễn phí từ 300.000đ. Thanh toán chuyển khoản VietQR.',
                  'Hãy dùng dữ liệu sản phẩm, combo, Farm Box và FAQ được cung cấp để tư vấn thông minh, gợi ý món phù hợp nhu cầu khách; không tự bịa giá khác.',
                ].join(' '),
                input: JSON.stringify({
                  conversationHistory: history,
                  contextualQuestion: isConversationalFollowUp ? contextualQuestion : '',
                  question,
                  storeCatalog: {
                    products: liveProducts.map((p) => `${p.name} (${asNumber(p.price)}đ/${p.unit || 'kg'})`),
                    combos: liveCombos.map((c) => `${c.name} (${asNumber(c.price)}đ)`),
                    farmBoxes: liveBoxes.map((b) => `${b.name} (${asNumber(b.price)}đ)`),
                  },
                  faqCandidates: candidates.map(({ question: faqQuestion, answer }) => ({
                    question: faqQuestion.slice(0, 500),
                    answer: answer.slice(0, 1200),
                  })),
                }),
              }),
              signal: AbortSignal.timeout(15000),
            })

            const aiPayload = await aiResponse.json().catch(() => ({}))
            if (!aiResponse.ok) throw new Error(aiPayload.error?.message || `Gemini API trả về HTTP ${aiResponse.status}.`)
            const aiAnswer = (aiPayload.steps || [])
              .filter((step) => step.type === 'model_output')
              .flatMap((step) => step.content || [])
              .filter((part) => part.type === 'text')
              .map((part) => part.text || '')
              .join('\n')
              .trim()

            if (aiAnswer) {
              return response.json({ data: {
                answer: aiAnswer,
                matchedQuestion: match?.question || '',
                source: `gemini-${modelName}`,
                actions: getAssistantActionsForAnswer(question, aiAnswer),
              } })
            }
          } catch (modelErr) {
            lastAiError = modelErr
          }
        }
        throw lastAiError || new Error('Gemini API không trả về nội dung văn bản.')
      } catch (error) {
        console.warn('Gemini chatbot chưa trả lời được, dùng FAQ MongoDB dự phòng:', error.message)
        const groqApiKey = process.env.GROQ_API_KEY
        if (groqApiKey) {
          try {
            const [fallbackProducts, fallbackCombos, fallbackBoxes] = await Promise.all([
              database.collection('products').find({ productLine: 'Standard', status: 'Đang bán' }, { projection: { name: 1, price: 1, unit: 1 } }).limit(30).toArray(),
              database.collection('combos').find({ isActive: true, isPublished: true }, { projection: { name: 1, price: 1 } }).limit(10).toArray(),
              database.collection('farmBoxes').find({}, { projection: { name: 1, price: 1 } }).limit(10).toArray(),
            ])
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${groqApiKey}`,
              },
              body: JSON.stringify({
                model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
                messages: [
                  {
                    role: 'system',
                    content: [
                      'Bạn là trợ lý tư vấn thân thiện của cửa hàng nông sản sạch GreenNova, trả lời ngắn gọn, tự nhiên bằng tiếng Việt.',
                      'Phí giao hàng đồng giá 30.000đ, miễn phí từ 300.000đ. Thanh toán chuyển khoản VietQR.',
                      'Chỉ dùng thông tin trong dữ liệu được cung cấp; không tự bịa sản phẩm, giá hoặc tình trạng còn hàng.',
                    ].join(' '),
                  },
                  ...history.map(({ role, content }) => ({ role, content })),
                  {
                    role: 'user',
                    content: JSON.stringify({
                      contextualQuestion: isConversationalFollowUp ? contextualQuestion : '',
                      question,
                      storeCatalog: {
                        products: fallbackProducts.map((product) => `${product.name} (${asNumber(product.price)}đ/${product.unit || 'kg'})`),
                        combos: fallbackCombos.map((combo) => `${combo.name} (${asNumber(combo.price)}đ)`),
                        farmBoxes: fallbackBoxes.map((box) => `${box.name} (${asNumber(box.price)}đ)`),
                      },
                      faqCandidates: candidates.map(({ question: faqQuestion, answer }) => ({
                        question: faqQuestion.slice(0, 500),
                        answer: answer.slice(0, 1200),
                      })),
                    }),
                  },
                ],
                temperature: 0.4,
                max_tokens: 700,
              }),
              signal: AbortSignal.timeout(20000),
            })
            const groqPayload = await groqResponse.json().catch(() => ({}))
            if (!groqResponse.ok) {
              throw new Error(groqPayload.error?.message || `Groq API trả về HTTP ${groqResponse.status}.`)
            }
            const groqAnswer = String(groqPayload.choices?.[0]?.message?.content || '').trim()
            if (groqAnswer) {
              return response.json({ data: {
                answer: groqAnswer,
                matchedQuestion: match?.question || '',
                source: 'groq-mongodb-faq',
                actions: getAssistantActionsForAnswer(question, groqAnswer),
              } })
            }
            throw new Error('Groq API không trả về nội dung văn bản.')
          } catch (groqError) {
            console.warn('Groq chatbot dự phòng chưa trả lời được, dùng FAQ MongoDB:', groqError.message)
          }
        }
      }
    }

    if (!isConversationalFollowUp && match?.relevant && match.score >= 0.6) {
      return response.json({ data: {
        answer: match.answer,
        matchedQuestion: match.question,
        source: 'mongodb',
        actions: getAssistantActionsForAnswer(question, match.answer),
      } })
    }

    return response.json({ data: {
      answer: 'Mình chưa tìm thấy câu trả lời phù hợp trong bộ câu hỏi trên MongoDB. Bạn thử chọn một câu gợi ý hoặc nhập lại gần với cách diễn đạt trong bộ câu hỏi nhé.',
      source: 'mongodb-no-match',
    } })
  } catch (error) {
    next(error)
  }
})

app.get('/api/combos/resolve', async (request, response, next) => {
  try {
    const requestedName = String(request.query.name || '').trim()
    if (requestedName.length < 3 || requestedName.length > 160) {
      return response.status(400).json({ error: 'Tên combo cần từ 3 đến 160 ký tự.' })
    }
    // Tên trên giao diện đôi khi có thêm khối lượng trong ngoặc, còn tên DB có thể không.
    const baseName = requestedName.replace(/\s*\([^)]*\)\s*$/, '').trim()
    const normalizeComboName = (value) => value.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, ' ').trim()
    const target = normalizeComboName(baseName)
    const targetWords = target.split(' ').filter((word) => word && word !== 'combo')
    const records = await database.collection('combos').find({}, {
      projection: { name: 1, isActive: 1, isPublished: 1 },
    }).toArray()
    const ranked = records.map((combo) => {
      const name = normalizeComboName(combo.name || '')
      const words = new Set(name.split(' ').filter((word) => word && word !== 'combo'))
      const matched = targetWords.filter((word) => words.has(word)).length
      const score = targetWords.length ? matched / targetWords.length : 0
      return { combo, name, score }
    }).filter(({ score }) => score >= 0.6)
      .sort((left, right) => right.score - left.score || Number(right.combo.isActive && right.combo.isPublished) - Number(left.combo.isActive && left.combo.isPublished))
    const match = ranked[0]?.combo
    if (!match) return response.status(404).json({ error: `Không tìm thấy bản ghi MongoDB khớp với combo “${baseName}”.` })
    if (match.isActive !== true || match.isPublished !== true) {
      return response.status(409).json({ error: `Combo “${match.name}” có trong MongoDB nhưng chưa được bật bán.` })
    }
    return response.json({ data: { id: match._id.toString(), name: match.name } })
  } catch (error) { next(error) }
})

try {
  await mongoClient.connect()
  database = mongoClient.db(databaseName)
  const inTransitOrders = await database.collection('orders')
    .find({ status: 'Đang giao', approvedForDeliveryAt: { $type: 'date' } })
    .toArray()
  let correctedDeliveryDeadlines = 0
  for (const order of inTransitOrders) {
    const correctDeadline = vietnamDeliveryDeadline(order.approvedForDeliveryAt)
    if (new Date(order.deliveryDueAt || 0).getTime() === correctDeadline.getTime()) continue
    const corrected = await database.collection('orders').updateOne(
      { _id: order._id, status: 'Đang giao', approvedForDeliveryAt: order.approvedForDeliveryAt },
      { $set: { deliveryDueAt: correctDeadline } },
    )
    correctedDeliveryDeadlines += corrected.modifiedCount
  }
  if (correctedDeliveryDeadlines) {
    console.log(`Đã sửa hạn giao 06:00 theo giờ Việt Nam cho ${correctedDeliveryDeadlines} đơn đang giao.`)
  }
  const addressMigration = await database.collection('users').updateMany(
    { address: { $exists: false } },
    { $set: { address: '' } },
  )
  if (addressMigration.modifiedCount > 0) {
    console.log(`Đã thêm trường address cho ${addressMigration.modifiedCount} tài khoản.`)
  }
  const provinceMigration = await database.collection('users').updateMany(
    { province: { $exists: false } },
    { $set: { province: '' } },
  )
  if (provinceMigration.modifiedCount > 0) {
    console.log(`Đã thêm trường province cho ${provinceMigration.modifiedCount} tài khoản.`)
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('Thiếu JWT_SECRET trong file .env')
  }

  const { requireAuth, requireAdmin } = createAuthMiddleware(database, process.env.JWT_SECRET)
  app.use('/api/auth', createAuthRouter(database, process.env.JWT_SECRET, requireAuth))
  app.use('/api/cart', requireAuth, createCartRouter(database))
  app.use('/api/orders', requireAuth, createOrdersRouter(database))
  app.use('/api/admin', requireAuth, requireAdmin, createAdminRouter(database))

  const settleDeliveredOrders = async () => {
    const now = new Date()
    const dueOrders = await database.collection('orders')
      .find({ status: 'Đang giao', deliveryDueAt: { $lte: now } })
      .limit(100)
      .toArray()
    for (const order of dueOrders) {
      const deliveryDueAt = order.deliveryDueAt || now
      await database.collection('orders').updateOne(
        { _id: order._id, status: 'Đang giao', deliveryDueAt: { $lte: now } },
        {
          $set: { status: 'Đã nhận', deliveredAt: deliveryDueAt },
          $push: {
            statusHistory: {
              oldStatus: 'Đang giao',
              newStatus: 'Đã nhận',
              changedBy: null,
              changedAt: deliveryDueAt,
            },
          },
        },
      )
    }
  }
  const runDeliverySweep = () => settleDeliveredOrders()
    .catch((error) => console.error('Không thể tự cập nhật đơn đã giao:', error))
  runDeliverySweep()
  deliveryTimer = setInterval(runDeliverySweep, 30_000)
  deliveryTimer.unref?.()

  app.patch('/api/admin/products/:id', requireAuth, requireAdmin, async (request, response, next) => {
    try {
      const { id } = request.params
      if (!ObjectId.isValid(id)) {
        return response.status(400).json({ error: 'Mã sản phẩm không hợp lệ.' })
      }

      const body = request.body || {}
      const changes = {}

      if (Object.prototype.hasOwnProperty.call(body, 'name')) {
        const name = String(body.name).trim()
        if (!name || name.length > 120) {
          return response.status(400).json({ error: 'Tên sản phẩm cần từ 1 đến 120 ký tự.' })
        }
        changes.name = name
      }

      if (Object.prototype.hasOwnProperty.call(body, 'price')) {
        const price = Number(body.price)
        if (!Number.isSafeInteger(price) || price < 0) {
          return response.status(400).json({ error: 'Giá cần là số nguyên không âm (đồng Việt Nam).' })
        }
        changes.price = price
      }

      if (Object.prototype.hasOwnProperty.call(body, 'imageUrl')) {
        if (typeof body.imageUrl !== 'string') {
          return response.status(400).json({ error: 'imageUrl cần là chuỗi ký tự.' })
        }
        changes.imageUrl = body.imageUrl.trim()
      }

      if (Object.prototype.hasOwnProperty.call(body, 'description')) {
        if (typeof body.description !== 'string' || body.description.length > 2000) {
          return response.status(400).json({ error: 'Mô tả sản phẩm cần là văn bản tối đa 2.000 ký tự.' })
        }
        changes.description = body.description.trim()
      }

      if (Object.prototype.hasOwnProperty.call(body, 'status')) {
        if (!['Đang bán', 'Không bán'].includes(body.status)) {
          return response.status(400).json({ error: 'Trạng thái sản phẩm không hợp lệ.' })
        }
        changes.status = body.status
      }

      if (Object.prototype.hasOwnProperty.call(body, 'isRestocking')) {
        if (typeof body.isRestocking !== 'boolean') {
          return response.status(400).json({ error: 'isRestocking phải là true hoặc false.' })
        }
        changes.isRestocking = body.isRestocking
      }

      if (Object.keys(changes).length === 0) {
        return response.status(400).json({ error: 'Hãy gửi ít nhất một trường cần cập nhật: name, price, imageUrl, description, status hoặc isRestocking.' })
      }

      const products = database.collection('products')
      const productId = new ObjectId(id)
      const existingProduct = await products.findOne({ _id: productId, isArchived: { $ne: true } })
      if (!existingProduct) return response.status(404).json({ error: 'Không tìm thấy sản phẩm.' })

      const result = await products.updateOne({ _id: new ObjectId(id) }, { $set: changes })
      if (result.matchedCount !== 1) {
        return response.status(404).json({ error: 'Không tìm thấy sản phẩm.' })
      }

      const updatedProduct = await products.findOne(
        { _id: new ObjectId(id) },
        { projection: { name: 1, price: 1, imageUrl: 1, description: 1, status: 1, isRestocking: 1 } },
      )

      return response.json({
        message: 'Cập nhật sản phẩm thành công.',
        data: {
          id: updatedProduct._id.toString(),
          name: updatedProduct.name,
          price: asNumber(updatedProduct.price),
          imageUrl: updatedProduct.imageUrl,
          description: updatedProduct.description || '',
          status: updatedProduct.status,
          saleStatus: updatedProduct.status,
          isRestocking: updatedProduct.isRestocking === true,
        },
      })
    } catch (error) {
      return next(error)
    }
  })

  app.use(express.static(frontendDist))
  app.get(/^(?!\/api\/).*/, (_request, response, next) => {
    response.sendFile(path.join(frontendDist, 'index.html'), (error) => {
      if (error) next(error)
    })
  })

  app.use((error, _request, response, _next) => {
    console.error('API error:', error.message)
    response.status(500).json({ error: 'Không thể xử lý yêu cầu. Hãy kiểm tra kết nối MongoDB rồi thử lại.' })
  })

  app.listen(port, () => {
    console.log(`GreenNova API đang chạy tại http://localhost:${port}`)
    console.log(`Đã kết nối MongoDB database: ${databaseName}`)
  })
} catch (error) {
  console.error('Không thể kết nối MongoDB:', error.message)
  console.error('Kiểm tra MongoDB Server và MONGODB_URI trong file .env.')
  process.exit(1)
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    if (deliveryTimer) clearInterval(deliveryTimer)
    await mongoClient.close()
    process.exit(0)
  })
}
