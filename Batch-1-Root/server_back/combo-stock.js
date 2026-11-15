import { ObjectId } from 'mongodb'

const asNumber = (value) => {
  const number = Number(value?.toString() ?? 0)
  return Number.isFinite(number) ? number : 0
}

// Seed each combo's independent sellable count from recipe availability once.
// Subsequent orders update this combo document only, so another combo that
// happens to use the same ingredients does not inherit its counter changes.
export async function ensureComboStock(database, combo) {
  if (!combo) return null
  const combos = database.collection('combos')
  let current = combo
  if (!Number.isInteger(Number(current.stockQuantity)) || Number(current.stockQuantity) < 0) {
    const requirements = current.items || []
    let initialStock = 0
    if (requirements.length) {
      const inventory = database.collection('inventory')
      const amounts = await Promise.all(requirements.map(async (item) => {
        const productId = item.productId instanceof ObjectId ? item.productId : new ObjectId(item.productId)
        const stock = await inventory.findOne({ productId })
        const available = Math.max(0, asNumber(stock?.quantity) - asNumber(stock?.reservedQty))
        const perCombo = asNumber(item.quantityPerCombo)
        return perCombo > 0 ? Math.floor(available / perCombo) : 0
      }))
      initialStock = Math.max(0, Math.min(...amounts))
    }
    await combos.updateOne(
      { _id: current._id, $or: [{ stockQuantity: { $exists: false } }, { stockQuantity: null }] },
      { $set: { stockQuantity: initialStock, reservedComboQty: 0, stockInitializedAt: new Date() } },
    )
    current = await combos.findOne({ _id: current._id }) || current
  }
  if (!Number.isFinite(Number(current.reservedComboQty))) {
    await combos.updateOne({ _id: current._id, reservedComboQty: { $exists: false } }, { $set: { reservedComboQty: 0 } })
    current.reservedComboQty = 0
  }
  return current
}

export function availableComboStock(combo) {
  return Math.max(0, Math.floor(asNumber(combo?.stockQuantity) - asNumber(combo?.reservedComboQty)))
}
