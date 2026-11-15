const asNumber = (value) => {
  const parsed = Number(value?.toString() ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeLabel = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

export function productQuantityStep(product, categoryName = '') {
  const name = normalizeLabel(product?.name)
  const category = normalizeLabel(categoryName || product?.categoryName || product?.category || '')
  const unit = normalizeLabel(product?.unit)
  const excluded = name.includes('cai thao') || name.includes('bap cai')
  const leafyVegetable = category.includes('rau an la') || category.includes('rau la')

  if (leafyVegetable && !excluded && unit === 'kg') return 0.25
  return asNumber(product?.stepQty) > 0 ? asNumber(product.stepQty) : 1
}
