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
  const excluded = name.includes('ca chua') || name.includes('cai thao') || name.includes('bap cai')
  const leafyVegetable = category.includes('rau an la') || category.includes('rau la')
  const configuredStep = asNumber(product?.stepQty)

  if (leafyVegetable && !excluded && unit === 'kg') return 0.25
  if (configuredStep === 0.25) return unit === 'kg' ? 0.5 : 1
  return configuredStep > 0 ? configuredStep : 1
}
