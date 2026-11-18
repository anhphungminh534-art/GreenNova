import { useEffect, useMemo, useState } from 'react'
import { createXlsx } from './utils/xlsx.js'

const remixScreens = import.meta.glob('./stitch_screens/remix/*/code.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const greennovaScreens = import.meta.glob('./stitch_screens/admin/*/code.html', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const routes = [
  { path: '/', title: 'Trang chủ', source: remixScreens, folder: 'trang_ch_ch_a_ng_nh_p' },
  { path: '/nong-san', title: 'Nông sản', source: remixScreens, folder: 'danh_s_ch_n_ng_s_n_greennova' },
  { path: '/nong-san/chi-tiet', title: 'Chi tiết nông sản', source: remixScreens, folder: 'chi_ti_t_n_ng_s_n_c_chua_greennova' },
  { path: '/imperfect', title: 'Combo Imperfect', source: greennovaScreens, folder: 'ip01_danh_s_ch_combo_n_ng_s_n_imperfect' },
  { path: '/imperfect/chi-tiet', title: 'Chi tiết combo Imperfect', source: greennovaScreens, folder: 'ip02_chi_ti_t_combo_imperfect' },
  { path: '/imperfect/combo-tiet-kiem', title: 'Chi tiết combo Imperfect', source: greennovaScreens, folder: 'ip02_chi_ti_t_combo_imperfect' },
  { path: '/imperfect/combo-canh-ngot', title: 'Combo Canh Ngọt Gia Đình', source: greennovaScreens, folder: 'ip02_chi_ti_t_combo_imperfect' },
  { path: '/imperfect/combo-trai-cay', title: 'Combo Nước Ép & Trái Cây Tươi', source: greennovaScreens, folder: 'ip02_chi_ti_t_combo_imperfect' },
  { path: '/imperfect/combo-salad', title: 'Combo Salad & Giải Nhiệt', source: greennovaScreens, folder: 'ip02_chi_ti_t_combo_imperfect' },
  { path: '/farm-box', title: 'Farm Box', source: greennovaScreens, folder: 'fb01_danh_s_ch_farm_box' },
  { path: '/farm-box/gioi-thieu', title: 'Giới thiệu Farm Box', source: greennovaScreens, folder: 'fb01_danh_s_ch_gi_i_thi_u_farm_box_nh_k_greennova' },
  { path: '/farm-box/lich-mo-ban', title: 'Lịch mở bán Farm Box', source: greennovaScreens, folder: 'fb01_danh_s_ch_l_ch_m_b_n_farm_box_nh_k_theo_tu_n_greennova' },
  { path: '/farm-box/loai-nho', title: 'Farm Box loại nhỏ theo tuần', source: greennovaScreens, folder: 'fb01_lich_farm_box_loai_nho' },
  { path: '/farm-box/loai-vua', title: 'Farm Box loại vừa theo tuần', source: greennovaScreens, folder: 'fb01_lich_farm_box_loai_vua' },
  { path: '/farm-box/loai-lon', title: 'Farm Box loại lớn theo tuần', source: greennovaScreens, folder: 'fb01_lich_farm_box_loai_lon' },
  { path: '/farm-box/thuc-don', title: 'Thực đơn Farm Box', source: greennovaScreens, folder: 'fb02_chi_ti_t_th_c_n_ng_k_farm_box_theo_tu_n_greennova' },
  { path: '/farm-box/chon-goi', title: 'Chọn gói Farm Box', source: remixScreens, folder: 'h_p_n_ng_s_n_tu_n_farm_box_greennova' },
  { path: '/farm-box/tuy-chinh', title: 'Tùy chỉnh gói Farm Box', source: greennovaScreens, folder: 'h_p_n_ng_tr_i_tu_n_farm_box_greennova' },
  { path: '/farm-box/dang-ky', title: 'Đăng ký Farm Box', source: greennovaScreens, folder: 'fb02_chi_ti_t_v_ng_k_farm_box_tu_n' },
  { path: '/farm-box/thay-doi', title: 'Xác nhận thay đổi Farm Box', source: greennovaScreens, folder: 'fb02_chi_ti_t_v_ng_k_farm_box_tu_n' },
  { path: '/farm-box/cua-toi', title: 'Farm Box của tôi', source: greennovaScreens, folder: 'fb03_farm_box_c_a_t_i' },
  { path: '/cart', title: 'Giỏ hàng', source: remixScreens, folder: 'gi_h_ng_greennova' },
  { path: '/cart/empty', title: 'Giỏ hàng trống', source: remixScreens, folder: 'gi_h_ng_tr_ng' },
  { path: '/checkout', title: 'Thông tin giao hàng', source: remixScreens, folder: 't_h_ng_greennova' },
  { path: '/checkout/new-address', title: 'Thêm địa chỉ giao hàng', source: remixScreens, folder: 't_h_ng_th_m_a_ch_m_i' },
  { path: '/checkout/confirm', title: 'Xác nhận đơn hàng', source: remixScreens, folder: 't_h_ng_c_ph_giao_h_ng' },
  { path: '/checkout/payment', title: 'Thanh toán chuyển khoản', source: remixScreens, folder: 'thanh_to_n_chuy_n_kho_n_m_ph_ng' },
  { path: '/checkout/success', title: 'Đặt hàng thành công', source: remixScreens, folder: 't_h_ng_t_h_ng_th_nh_c_ng' },
  { path: '/orders', title: 'Đơn hàng của tôi', source: remixScreens, folder: 'n_h_ng_c_a_t_i_greennova' },
  { path: '/orders/detail', title: 'Chi tiết đơn hàng', source: remixScreens, folder: 'chi_ti_t_n_h_ng_dh00119_ang_x_l' },
  { path: '/login', title: 'Đăng nhập', source: greennovaScreens, folder: 'tk02_ng_nh_p_t_i_kho_n_m_i' },
  { path: '/register', title: 'Đăng ký', source: greennovaScreens, folder: 'tk01_ng_k_t_i_kho_n_kh_ch_h_ng_greennova_3' },
  { path: '/forgot-password', title: 'Quên mật khẩu', source: greennovaScreens, folder: 'tk03_qu_n_m_t_kh_u' },
  { path: '/reset-password', title: 'Đặt lại mật khẩu', source: greennovaScreens, folder: 'tk04_thi_t_l_p_mk_m_i' },
  { path: '/account', title: 'Tài khoản của tôi', source: greennovaScreens, folder: 'tk05_h_s_c_nh_n_s_a_ch' },
  { path: '/account/addresses', title: 'Sổ địa chỉ giao hàng', source: greennovaScreens, folder: 'tk05_h_s_c_nh_n_s_a_ch' },
  { path: '/account/refund-account', title: 'Tài khoản nhận hoàn tiền', source: greennovaScreens, folder: 'tk05_h_s_c_nh_n_s_a_ch' },
  { path: '/account/change-password', title: 'Đổi mật khẩu', source: greennovaScreens, folder: 'tk05_h_s_c_nh_n_s_a_ch' },
  { path: '/admin', title: 'Quản trị GreenNova', source: greennovaScreens, folder: 'qt01_dashboard_admin' },
  { path: '/admin/products', title: 'Quản lý nông sản', source: greennovaScreens, folder: 'qt02_qu_n_l_n_ng_s_n_t_n_kho_standard_produce_greennova' },
  { path: '/admin/imperfect', title: 'Quản lý Imperfect', source: greennovaScreens, folder: 'qt03_qu_n_l_combo_imperfect' },
  { path: '/admin/farm-box', title: 'Quản lý Farm Box', source: greennovaScreens, folder: 'qt04_qu_n_l_c_u_h_nh_farm_box_tu_n' },
  { path: '/admin/orders', title: 'Quản lý đơn hàng', source: greennovaScreens, folder: 'qt05_qu_n_l_n_h_ng' },
  { path: '/admin/refunds', title: 'Đối soát & hoàn tiền', source: greennovaScreens, folder: 'qt05_qu_n_l_n_h_ng' },
  { path: '/admin/profile', title: 'Hồ sơ & Phân quyền', source: greennovaScreens, folder: 'qt01_dashboard_admin' },
]

const legacyAdminOrdersStitchPath = '/stitch/admin/qt06_qu_n_l_n_h_ng_greennova'

// Give every exported Stitch screen a URL, including alternate states and
// duplicate design versions that do not have a primary route above.
const stitchCollections = [
  { group: 'remix', source: remixScreens },
  { group: 'admin', source: greennovaScreens },
]
const namedScreenKeys = new Set(routes.map((route) => `${route.source === remixScreens ? 'remix' : 'admin'}/${route.folder}`))
const extraStitchRoutes = stitchCollections.flatMap(({ group, source }) => (
  Object.keys(source).map((filePath) => filePath.split('/').at(-2))
    .filter((folder, index, folders) => folders.indexOf(folder) === index)
    .filter((folder) => !namedScreenKeys.has(`${group}/${folder}`))
    .map((folder) => ({
      path: `/stitch/${group}/${folder}`,
      title: folder.replaceAll('_', ' '),
      source,
      folder,
      group,
    }))
))
routes.push(...extraStitchRoutes.filter((route) => route.path !== legacyAdminOrdersStitchPath))

function stitchScreenPath(group, folder) {
  const named = routes.find((route) => route.folder === folder
    && (route.source === remixScreens ? 'remix' : 'admin') === group
    && !route.path.startsWith('/stitch/'))
  return named?.path || `/stitch/${group}/${folder}`
}

const routeByStitchPath = {
  'trang-chu': '/',
  'nong-san-hoan-hao': '/nong-san',
  'nong-san-hoan-hao-tuoi-moi': '/nong-san',
  'nong-san-sach': '/nong-san',
  'trai-cay-ban-dia': '/nong-san',
  'nong-ho-lien-ket': '/nong-san',
  'hop-nong-san-farm-box': '/farm-box',
  'hop-nong-trai': '/farm-box',
  'goc-imperfect-tiet-kiem': '/imperfect',
  'dang-xuat': '/login',
  'nong-san': '/nong-san',
  'nong-san-tieu-chuan': '/nong-san',
  'imperfect-produce': '/imperfect',
  'imperfect': '/imperfect',
  'imperfect-45': '/imperfect',
  'rau-cu-ky-quac': '/imperfect',
  'combo-imperfect': '/imperfect',
  'farm-box': '/farm-box',
  'farm-box-cua-toi': '/farm-box/cua-toi',
  'gio-hang': '/cart',
  'thanh-toan': '/checkout',
  'don-hang': '/orders',
  'don-hang-cua-toi': '/orders',
  'dang-nhap': '/login',
  'login': '/login',
  'dang-ky': '/register',
  'register': '/register',
  'quen-mat-khau': '/forgot-password',
  'tai-khoan': '/account',
  'thong-tin-ca-nhan': '/account',
  'doi-mat-khau': '/account/change-password',
  'thiet-lap-mat-khau-moi': '/account/change-password',
  'dia-chi-nhan-hang': '/account',
  'dashboard': '/admin',
  'quan-ly-nong-san': '/admin/products',
  'quan-ly-imperfect': '/admin/imperfect',
  'cau-hinh-farm-box': '/admin/farm-box',
  'quan-ly-don-hang': '/admin/orders',
}

function findScreen(route) {
  const match = Object.entries(route.source).find(([filePath]) => (
    filePath.split('/').at(-2) === route.folder
  ))
  return match?.[1] || ''
}

function isFarmBoxCustomerScreen(route) {
  if (route.path.startsWith('/admin')) return false
  return route.path.startsWith('/farm-box')
    || route.folder.startsWith('fb01')
    || route.folder.startsWith('fb02')
    || route.folder.startsWith('fb03')
    || route.folder.startsWith('h_p_n_ng_s_n_tu_n')
    || route.folder.startsWith('h_p_n_ng_tr_i_tu_n')
}

function normalizeFarmBoxHeader(documentFromStitch) {
  const originalHeader = documentFromStitch.body.querySelector('header')
  const templateHtml = findScreen({
    source: greennovaScreens,
    folder: 'fb01_danh_s_ch_farm_box',
  })
  if (!originalHeader || !templateHtml) return

  const templateDocument = new DOMParser().parseFromString(templateHtml, 'text/html')
  const templateHeader = templateDocument.body.querySelector('header')
  if (!templateHeader) return

  const header = templateHeader.cloneNode(true)
  const announcementBar = header.firstElementChild
  if (announcementBar?.querySelector('.material-symbols-outlined')?.textContent.trim() === 'local_shipping') {
    announcementBar.remove()
  }
  originalHeader.replaceWith(header)

  const main = documentFromStitch.body.querySelector('main')
  if (main) main.style.paddingTop = '7rem'
}

function addFarmBoxEmergencyButton(documentFromStitch, route, customerOrders) {
  const purchasePages = new Set([
    '/farm-box', '/farm-box/gioi-thieu', '/farm-box/lich-mo-ban',
    '/farm-box/loai-nho', '/farm-box/loai-vua', '/farm-box/loai-lon',
    '/farm-box/thuc-don', '/farm-box/chon-goi', '/farm-box/tuy-chinh', '/farm-box/dang-ky',
  ])
  if (!purchasePages.has(route.path)) return
  const query = new URLSearchParams(window.location.search)
  const farmBoxId = query.get('farmBoxId')
  const weekId = query.get('weekId')
  const hasMatchingProposal = (customerOrders || []).some((order) => (order.items || []).some((item) => (
    item.itemType === 'FarmBox'
    && item.cropFailureResolution?.status === 'Chờ khách xác nhận'
    && (!farmBoxId || item.id === farmBoxId)
    && (!weekId || item.weekId === weekId)
  )))
  if (!hasMatchingProposal) return
  const navigation = documentFromStitch.body.querySelector('header nav')
  if (!navigation || navigation.querySelector('[data-farmbox-emergency-link]')) return
  const link = documentFromStitch.createElement('a')
  link.href = '#farmbox-emergency-proposals'
  link.dataset.scrollToFarmboxEmergency = 'true'
  link.dataset.farmboxEmergencyLink = 'true'
  link.className = 'ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#b9d8bb] bg-white px-3 py-2 text-xs font-semibold text-[#176b36] no-underline transition hover:bg-[#eaf5e9] sm:px-4 sm:text-sm'
  link.innerHTML = '<span class="material-symbols-outlined text-[17px]">published_with_changes</span><span>Xem phương án dự phòng</span>'
  navigation.append(link)
}

const GREENNOVA_LOGO_SRC = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI4eknQNsGBaFoJ0wPI3wtJc2HNyPOhG32W4riQqnvrq0RDnbX2LJEgez0giVBBZydipGH7lCqxD-c3gSkbX3jxZjzJqWDbHKcxcUMc4gLksMBca0SB4-Ig6DWhNPbWEdKhsFKOXZLH844ramWNjWiax7_OU4RlND2VqQEIYoGgzDvEb6t33c1FZIEJ9FsR3qg0gTr04W3zoZ3171aILtgw-4ets9hvN8ic5wgVEiTQFCb4Y7LR9lfuw'

function normalizeBrandLogo(documentFromStitch) {
  const header = documentFromStitch.body.querySelector('header')
  if (!header) return

  const brandLink = [...header.querySelectorAll('a')].find((anchor) => {
    const label = normalizeLabel(anchor.textContent)
    const hasLogoImage = [...anchor.querySelectorAll('img')]
      .some((image) => /logo|greennova/i.test(`${image.alt} ${image.src}`))
    const hasEcoMark = [...anchor.querySelectorAll('.material-symbols-outlined')]
      .some((icon) => ['eco', 'nature', 'energy savings leaf'].includes(normalizeLabel(icon.textContent)))
    return hasLogoImage || (label.includes('greennova') && (hasEcoMark || anchor.dataset.path === 'trang-chu'))
  })
  if (!brandLink) return

  brandLink.dataset.path = 'trang-chu'
  brandLink.href = '#'
  brandLink.classList.add('flex', 'items-center', 'gap-space-sm')
  brandLink.replaceChildren()

  const image = documentFromStitch.createElement('img')
  image.alt = 'GreenNova Logo'
  image.src = GREENNOVA_LOGO_SRC
  image.className = 'h-8 w-8 object-contain shrink-0'

  const wordmark = documentFromStitch.createElement('span')
  wordmark.className = 'font-headline-sm text-headline-sm text-primary tracking-tight'
  wordmark.textContent = 'GreenNova'
  brandLink.append(image, wordmark)
}

function normalizeStoreHeader(documentFromStitch, route, authUser, cart = {}) {
  if (route.path.startsWith('/admin') || route.folder.startsWith('qt0')) return

  let header = documentFromStitch.body.querySelector('header')
  if (!header) {
    header = documentFromStitch.createElement('header')
    documentFromStitch.body.prepend(header)
  }

  const cartCount = getCartQuantity(cart)
  const currentSearch = new URLSearchParams(window.location.search).get('search') || ''
  const navItems = [
    { label: 'Trang chủ', path: '/', matches: route.path === '/' },
    { label: 'Nông sản tiêu chuẩn', path: '/nong-san', matches: route.path.startsWith('/nong-san') },
    { label: 'Combo Imperfect', path: '/imperfect', matches: route.path.startsWith('/imperfect') },
    { label: 'Farm Box', path: '/farm-box', matches: route.path.startsWith('/farm-box') },
  ]

  header.className = 'sticky top-0 z-50 w-full border-b border-[#e3e9e2] bg-white text-[#243229] shadow-sm'
  header.removeAttribute('style')
  const bar = documentFromStitch.createElement('div')
  bar.className = 'mx-auto flex min-h-[68px] w-full max-w-none items-center gap-3 px-5 py-2 lg:gap-4 lg:px-10'

  const announcement = documentFromStitch.createElement('div')
  announcement.className = 'flex min-h-6 items-center justify-center gap-1.5 bg-[#176b36] px-3 py-1 text-center text-[10px] font-medium leading-4 text-white sm:text-[11px]'
  announcement.innerHTML = '<span class="material-symbols-outlined text-[13px]" aria-hidden="true">local_shipping</span><span>Giao nông sản sạch tận nơi mỗi sáng <span class="px-1 text-white/70">•</span> Miễn phí vận chuyển đơn từ 300.000đ <span class="px-1 text-white/70">•</span> Hotline: 1900 6886</span>'

  const brand = documentFromStitch.createElement('a')
  brand.href = '/'
  brand.dataset.route = '/'
  brand.setAttribute('aria-label', 'GreenNova - Trang chủ')
  brand.className = 'flex shrink-0 items-center gap-2 text-[#075d31] no-underline'
  const logo = documentFromStitch.createElement('img')
  logo.src = GREENNOVA_LOGO_SRC
  logo.alt = ''
  logo.className = 'h-[30px] w-[30px] shrink-0 object-contain'
  const wordmark = documentFromStitch.createElement('span')
  wordmark.className = 'text-2xl font-bold tracking-tight'
  wordmark.textContent = 'GreenNova'
  brand.append(logo, wordmark)

  const deliveryLocation = documentFromStitch.createElement('div')
  deliveryLocation.className = 'hidden shrink-0 items-center gap-1 rounded-full bg-[#edf6ed] px-2.5 py-1.5 text-[11px] text-[#35463a] lg:flex'
  deliveryLocation.innerHTML = '<span class="material-symbols-outlined text-[15px] text-[#16733b]" aria-hidden="true">location_on</span><span>Giao tại: <strong class="font-semibold">TP. Hồ Chí Minh</strong></span>'

  const nav = documentFromStitch.createElement('nav')
  nav.setAttribute('aria-label', 'Menu chính')
  nav.className = 'mx-auto flex w-full items-center gap-1 overflow-x-auto px-5 lg:px-10'
  navItems.forEach(({ label, path, matches, badge }) => {
    const link = documentFromStitch.createElement('a')
    link.href = path
    link.dataset.route = path
    link.className = `inline-flex min-h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-xl px-2.5 text-[15px] font-semibold no-underline transition-colors lg:px-3 ${matches ? 'bg-[#19763f] text-white' : 'text-[#38483d] hover:bg-[#edf6ed] hover:text-[#075d31]'}`
    link.textContent = label
    if (badge) {
      const tag = documentFromStitch.createElement('span')
      tag.className = 'rounded-full bg-[#a45a00] px-2 py-0.5 text-xs font-bold text-white'
      tag.textContent = badge
      link.append(tag)
    }
    nav.append(link)
  })

  const search = documentFromStitch.createElement('div')
  search.className = 'relative ml-auto flex min-w-0 flex-1 items-center rounded-xl border border-[#8b948c] bg-white px-3 shadow-sm md:max-w-[720px]'
  const searchButton = documentFromStitch.createElement('button')
  searchButton.type = 'button'
  searchButton.className = 'flex h-9 w-9 shrink-0 items-center justify-center text-[#718075]'
  searchButton.setAttribute('aria-label', 'Tìm kiếm')
  searchButton.innerHTML = '<span class="material-symbols-outlined text-[21px]">search</span>'
  const searchInput = documentFromStitch.createElement('input')
  searchInput.type = 'search'
  searchInput.id = 'global-product-search'
  searchInput.placeholder = 'Tìm kiếm rau củ quả, Hộp Nông Trại, nông sản hữu cơ...'
  searchInput.value = currentSearch
  searchInput.setAttribute('aria-label', 'Tìm kiếm nông sản')
  searchInput.className = 'h-9 min-w-0 flex-1 border-0 bg-transparent text-base text-[#243229] outline-none placeholder:text-[#7b867d] focus:ring-0'
  const searchSuggestions = documentFromStitch.createElement('div')
  searchSuggestions.id = 'global-product-search-suggestions'
  searchSuggestions.className = 'absolute left-0 right-0 top-[calc(100%+8px)] z-[70] hidden overflow-hidden rounded-xl border border-[#d7e5d8] bg-white shadow-[0_14px_32px_rgba(21,54,30,0.16)]'
  search.append(searchButton, searchInput, searchSuggestions)

  const actions = documentFromStitch.createElement('div')
  actions.className = 'flex shrink-0 items-center gap-4'
  const favoritesButton = documentFromStitch.createElement('button')
  favoritesButton.type = 'button'
  favoritesButton.className = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf6ed] text-[#47604d] transition-colors hover:bg-[#e1efe1]'
  favoritesButton.setAttribute('aria-label', 'Danh sách yêu thích')
  favoritesButton.title = 'Danh sách yêu thích'
  favoritesButton.innerHTML = '<span class="material-symbols-outlined text-[19px]">favorite</span>'
  actions.append(favoritesButton)

  const cartLink = documentFromStitch.createElement('a')
  cartLink.href = '/cart'
  cartLink.dataset.route = '/cart'
  cartLink.dataset.path = 'gio-hang'
  cartLink.setAttribute('aria-label', cartCount ? `Giỏ hàng, ${cartCount} mặt hàng` : 'Giỏ hàng')
  cartLink.title = 'Giỏ hàng'
  cartLink.className = 'relative flex h-12 w-12 items-center justify-center rounded-xl text-[#37483c] transition-colors hover:bg-[#edf6ed]'
  cartLink.innerHTML = '<span class="material-symbols-outlined text-[24px]">shopping_bag</span>'
  if (cartCount > 0) {
    const badge = documentFromStitch.createElement('span')
    badge.className = 'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a45a00] px-1 text-xs font-bold leading-none text-white'
    badge.textContent = String(cartCount)
    cartLink.append(badge)
  }
  actions.append(cartLink)

  if (authUser) {
    const accountLink = documentFromStitch.createElement('a')
    accountLink.href = '/account'
    accountLink.dataset.route = '/account'
    accountLink.setAttribute('aria-label', `Tài khoản: ${authUser.fullName || 'Khách hàng'}`)
    accountLink.className = 'flex max-w-[240px] shrink-0 items-center gap-2 rounded-full px-1.5 py-1 text-base font-medium text-[#26382c] no-underline hover:bg-[#f1f7f0]'
    const avatar = documentFromStitch.createElement('span')
    avatar.className = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006233] text-white'
    avatar.setAttribute('aria-hidden', 'true')
    avatar.innerHTML = '<span class="material-symbols-outlined text-[20px]">person</span>'
    const name = documentFromStitch.createElement('span')
    name.className = 'truncate'
    name.textContent = authUser.fullName || 'Tài khoản của tôi'
    accountLink.append(avatar, name)
    actions.append(accountLink)
  } else {
    const loginLink = documentFromStitch.createElement('a')
    loginLink.href = '/login'
    loginLink.dataset.route = '/login'
    loginLink.className = 'shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-semibold text-[#075d31] no-underline hover:bg-[#edf6ed]'
    loginLink.textContent = 'Đăng nhập'
    actions.append(loginLink)

    const registerLink = documentFromStitch.createElement('a')
    registerLink.href = '/register'
    registerLink.dataset.route = '/register'
    registerLink.className = 'inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#19763f] px-4 py-2 text-[14px] font-semibold text-white no-underline transition-colors hover:bg-[#126334]'
    registerLink.innerHTML = '<span class="material-symbols-outlined text-[18px]" aria-hidden="true">login</span><span>Đăng ký</span>'
    actions.append(registerLink)
  }

  bar.append(brand, search, actions)
  const navRow = documentFromStitch.createElement('div')
  navRow.className = 'w-full border-t border-[#eef2ed] bg-white py-1'
  navRow.append(nav)
  bar.insertBefore(deliveryLocation, search)
  header.replaceChildren(announcement, bar, navRow)

  // Stitch screens often reserve space for a fixed header. This shared header
  // now participates in document flow, so clear that old offset and trim an
  // oversized top inset on the first content section.
  const main = documentFromStitch.body.querySelector('main')
  if (main) {
    main.className = main.className.replace(/(?:^|\s)(?:sm:|md:|lg:|xl:|2xl:)?pt-(?:\[[^\]]+\]|\d+)(?=\s|$)/g, ' ').trim()
    main.style.paddingTop = '0'
    const firstSection = main.querySelector('section')
    const topInsetClasses = `${main.firstElementChild?.className || ''} ${firstSection?.className || ''}`
    if (/(?:^|\s)(?:(?:sm|md|lg|xl|2xl):)?(?:pt|py)-(?:\[(?:[4-9]\d|\d{3,})[^\]]*\]|(?:1[2-9]|[2-9]\d|\d{3,}))(?:\s|$)/.test(topInsetClasses)) {
      ;(firstSection || main.firstElementChild).style.paddingTop = '28px'
    }
  }
}
function normalizeStoreFooter(documentFromStitch, route) {
  if (route.path.startsWith('/admin') || route.folder.startsWith('qt0')) return

  documentFromStitch.body.querySelectorAll('footer').forEach((footer) => footer.remove())

  const footer = documentFromStitch.createElement('footer')
  footer.className = 'w-full bg-[#105b32] text-white'
  footer.innerHTML = `<div class="mx-auto max-w-[1280px] px-5 py-6 sm:px-8 lg:px-10">
    <div class="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
      <section>
        <a href="/" data-route="/" aria-label="GreenNova - Trang chủ" class="mb-3 inline-flex items-center gap-2 text-white no-underline">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
            <img src="${GREENNOVA_LOGO_SRC}" alt="GreenNova" class="h-full w-full object-contain" />
          </span>
          <span class="text-[22px] font-bold tracking-tight">GreenNova</span>
        </a>
        <p class="mb-4 max-w-sm text-[13px] leading-5 text-white/85">Nền tảng tiêu thụ nông sản địa phương và giảm lãng phí thực phẩm.</p>
        <div class="flex items-center gap-2">
          <a href="/" data-route="/" aria-label="Trang chủ GreenNova" class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#26352c] transition hover:bg-[#e8f3e8]"><span class="material-symbols-outlined">language</span></a>
          <a href="tel:19006886" aria-label="Gọi GreenNova" class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#26352c] transition hover:bg-[#e8f3e8]"><span class="material-symbols-outlined">call</span></a>
          <a href="mailto:support@greennova.vn" aria-label="Email GreenNova" class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#26352c] transition hover:bg-[#e8f3e8]"><span class="material-symbols-outlined">mail</span></a>
        </div>
      </section>
      <section><h2 class="mb-3 text-[17px] font-bold">Về GreenNova</h2><ul class="space-y-1.5 text-[13px] leading-5 text-white/85"><li>Câu chuyện thương hiệu</li><li>Hợp tác xã đối tác</li><li>Báo cáo tác động xanh</li><li>Cơ hội nghề nghiệp</li></ul></section>
      <section><h2 class="mb-3 text-[17px] font-bold">Chính Sách &amp; Hỗ Trợ</h2><ul class="space-y-1.5 text-[13px] leading-5 text-white/85"><li>Chính sách thu hoạch trong ngày</li><li>Đổi trả nông sản hỏng dập trong 2h</li><li>Phương thức thanh toán &amp; ví xanh</li><li>Giao hàng giảm phát thải</li></ul></section>
      <section><h2 class="mb-3 text-[17px] font-bold">Cam Kết Chuẩn Sạch</h2><ul class="space-y-1.5 text-[13px] leading-5 text-white/85"><li>Tiêu chuẩn kiểm nghiệm đất</li><li>Truy xuất nguồn gốc QR</li><li>Nông nghiệp tái sinh</li><li>Quy chuẩn kiểm định dư lượng</li></ul></section>
    </div>
  </div>`

  documentFromStitch.body.append(footer)
}

const money = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
const formatSaigonToday = () => new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
}).format(new Date())

function millisecondsUntilSaigonMidnight(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now).filter((part) => part.type !== 'literal').map(({ type, value }) => [type, Number(value)]))
  const nextUtcMidnight = Date.UTC(parts.year, parts.month - 1, parts.day + 1)
  const saigonOffset = 7 * 60 * 60 * 1000
  return Math.max(1, nextUtcMidnight - saigonOffset - now.getTime() + 25)
}

function showCartToast(message) {
  document.querySelector('[data-greennova-toast]')?.remove()
  const toast = document.createElement('div')
  toast.dataset.greennovaToast = 'true'
  toast.setAttribute('role', 'status')
  toast.setAttribute('aria-live', 'polite')
  toast.textContent = message
  Object.assign(toast.style, {
    position: 'fixed', zIndex: '99999', left: '50%', bottom: '28px', transform: 'translateX(-50%)',
    maxWidth: 'min(92vw, 420px)', padding: '11px 16px', borderRadius: '12px',
    background: '#163522', color: '#fff', boxShadow: '0 8px 28px rgba(0,0,0,.2)',
    font: '500 14px/1.4 system-ui, sans-serif', textAlign: 'center',
  })
  document.body.append(toast)
  window.setTimeout(() => toast.remove(), 2600)
}

const imperfectComboPaths = [
  '/imperfect/combo-tiet-kiem',
  '/imperfect/combo-canh-ngot',
  '/imperfect/combo-trai-cay',
  '/imperfect/combo-salad',
]

function getImperfectCardData(index) {
  const listingRoute = routes.find((item) => item.path === '/imperfect')
  const listingHtml = listingRoute ? findScreen(listingRoute) : ''
  if (!listingHtml) return null
  const listingDocument = new DOMParser().parseFromString(listingHtml, 'text/html')
  const card = listingDocument.querySelectorAll('main article')[index]
  if (!card) return null

  const title = card.querySelector('h2, h3')?.textContent.trim() || 'Combo Imperfect'
  const image = card.querySelector('img')?.getAttribute('src') || ''
  const priceText = card.querySelector('.font-price-lg')?.textContent || ''
  const price = Number(priceText.replace(/\D/g, '')) || 0
  const oldPriceText = card.querySelector('del')?.textContent || ''
  const parsedOldPrice = Number(oldPriceText.replace(/\D/g, '')) || 0
  const savingText = [...card.querySelectorAll('span')]
    .find((element) => element.textContent.includes('Tiết kiệm'))?.textContent || ''
  const savedAmount = Number(savingText.replace(/\D/g, '')) || Math.max(0, parsedOldPrice - price)
  const oldPrice = parsedOldPrice || price + savedAmount
  const contentsText = [...card.querySelectorAll('p')]
    .find((element) => element.textContent.includes('Bao gồm:'))?.textContent.replace(/^\s*Bao gồm:\s*/i, '').trim() || ''
  const reason = card.querySelector('.border-l-4 p')?.textContent.trim() || ''
  const location = card.querySelector('span[class~="bottom-2.5"]')?.textContent.trim() || 'Nông trại GreenNova'
  const stockText = [...card.querySelectorAll('span')].find((element) => /Sắp hết|Còn hàng|Hết hàng/.test(element.textContent))?.textContent.trim() || ''
  const stock = Number(stockText.match(/\d+/)?.[0]) || (stockText.includes('Hết hàng') ? 0 : 8)
  const weight = title.match(/\(([^)]+)\)/)?.[1] || ''
  const contents = contentsText.split(',').map((item) => item.trim()).filter(Boolean)
  return { title, image, price, oldPrice, savedAmount, contentsText, contents, reason, location, stock, weight }
}

function findAvailableComboByName(combos, displayName) {
  const target = normalizeLabel(displayName || '')
  if (!target) return null
  const records = Array.isArray(combos) ? combos : []
  return records.find((item) => normalizeLabel(item.name) === target)
    || records.find((item) => {
      const name = normalizeLabel(item.name)
      return name && (name.includes(target) || target.includes(name))
    })
    || null
}

function applyImperfectComboScreen(documentFromStitch, route, availableCombos = [], cart = {}, search = '') {
  if (route.path === '/imperfect') {
    const cards = [...documentFromStitch.body.querySelectorAll('main article')]
    const list = cards[0]?.parentElement
    if (list) list.id = 'combo-grid'
    const filterGroup = documentFromStitch.body.querySelector('#filter-pill-group')
    if (filterGroup) {
      filterGroup.className = 'flex min-w-0 flex-1 items-center gap-space-xs overflow-x-auto pb-1'
      filterGroup.replaceChildren()
      const allButton = documentFromStitch.createElement('button')
      allButton.type = 'button'
      allButton.className = 'px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm whitespace-nowrap filter-pill active'
      allButton.textContent = `Tất cả combo (${availableCombos.length})`
      allButton.disabled = true
      filterGroup.append(allButton)
    }
    const sortSelect = documentFromStitch.body.querySelector('#sort-select')
    if (sortSelect) {
      sortSelect.dataset.comboSort = 'true'
      sortSelect.replaceChildren()
      ;[
        ['price-asc', 'Giá: Thấp đến cao'],
        ['price-desc', 'Giá: Cao đến thấp'],
        ['name-asc', 'Tên: A–Z'],
        ['stock-desc', 'Còn nhiều hàng'],
      ].forEach(([value, label], index) => {
        const option = documentFromStitch.createElement('option')
        option.value = value
        option.textContent = label
        option.selected = index === 0
        sortSelect.append(option)
      })
    }
    if (list && availableCombos.length) {
      const template = cards[0]
      list.replaceChildren(...availableCombos.map((combo) => {
        const card = template.cloneNode(true)
        const detailRoute = `/imperfect/chi-tiet?comboId=${encodeURIComponent(combo.id)}`
        card.dataset.comboPrice = String(Number(combo.price) || 0)
        card.dataset.comboName = normalizeLabel(combo.name)
        card.dataset.comboStock = String(Number(combo.stock) || 0)
        card.dataset.route = detailRoute
        const image = card.querySelector('img')
        if (image) {
          image.src = combo.image || ''
          image.alt = combo.name
          image.dataset.route = detailRoute
          image.classList.add('cursor-pointer')
          image.setAttribute('aria-label', `Xem chi tiết ${combo.name}`)
        }
        const title = card.querySelector('h2, h3')
        if (title) title.textContent = combo.name
        const price = card.querySelector('.font-price-lg')
        if (price) price.textContent = money(combo.price)
        card.querySelector('del')?.remove()
        ;[...card.querySelectorAll('span')].find((span) => span.textContent.includes('Tiết kiệm'))?.remove()
        const promoBadge = card.querySelector('.absolute.top-3.left-3 span')
        if (promoBadge) promoBadge.textContent = 'Combo Imperfect'
        const stockBadge = card.querySelector('.absolute.top-3.right-3 span:not(.material-symbols-outlined)')
        if (stockBadge) stockBadge.textContent = Number(combo.stock) > 0 ? `Còn ${Number(combo.stock)} combo` : 'Hết hàng'
        const farmBadge = card.querySelector('.absolute.bottom-2\\.5.left-3')
        if (farmBadge) farmBadge.lastChild.textContent = ' GreenNova · Combo'
        const contents = (combo.items || []).map((item) => `${item.quantity || ''} ${item.unit || ''} ${item.name || ''}`.trim()).join(', ')
        const contentParagraph = [...card.querySelectorAll('p')].find((paragraph) => paragraph.querySelector('strong')?.textContent.includes('Bao gồm'))
        if (contentParagraph) {
          const label = contentParagraph.querySelector('strong')?.cloneNode(true)
          contentParagraph.replaceChildren(...[label, documentFromStitch.createTextNode(` ${contents || 'Thành phần đang được cập nhật.'}`)].filter(Boolean))
        }
        const note = card.querySelector('.border-l-4 p')
        if (note) note.textContent = combo.description || 'Combo nông sản tươi được tuyển chọn từ dữ liệu GreenNova.'
        const action = card.querySelector('button')
        if (action) action.dataset.route = detailRoute
        return card
      }))
    } else if (!availableCombos.length && list) {
      list.replaceChildren()
      const empty = documentFromStitch.createElement('p')
      empty.className = 'col-span-full rounded-xl bg-white p-6 text-center text-on-surface-variant'
      empty.textContent = 'Chưa có combo đang bán trong dữ liệu MongoDB.'
      list.append(empty)
    }
    return
  }

  const isDatabaseDetail = route.path === '/imperfect/chi-tiet'
  const comboIndex = imperfectComboPaths.indexOf(route.path)
  if (comboIndex < 0 && !isDatabaseDetail) return
  const thumbnailStrip = documentFromStitch.body.querySelector('.thumbnail-btn')?.parentElement
  thumbnailStrip?.classList.add('hidden')
  const requestedComboId = new URLSearchParams(search).get('comboId') || ''
  const apiCombo = isDatabaseDetail
    ? availableCombos.find((item) => item.id === requestedComboId)
    : findAvailableComboByName(availableCombos, getImperfectCardData(comboIndex)?.title)
  const staticCombo = isDatabaseDetail ? null : getImperfectCardData(comboIndex)
  if (isDatabaseDetail && !apiCombo) {
    const heading = documentFromStitch.body.querySelector('main h1')
    if (heading) heading.textContent = 'Không tìm thấy combo đang bán'
    return
  }
  if (!staticCombo && !apiCombo) return
  const apiContents = (apiCombo?.items || []).map((item) => `${item.quantity || ''} ${item.unit || ''} ${item.name || ''}`.trim())
  const screenCombo = staticCombo || {
    title: apiCombo.name, image: apiCombo.image || '', price: Number(apiCombo.price) || 0,
    oldPrice: 0, savedAmount: 0, contentsText: apiContents.join(', '), contents: apiContents,
    reason: apiCombo.description || '', location: 'Nông trại GreenNova', stock: Number(apiCombo.stock) || 0,
    weight: apiCombo.name.match(/\(([^)]+)\)/)?.[1] || '',
  }
  const combo = apiCombo
    ? { ...screenCombo, id: apiCombo.id, stock: Number(apiCombo.stock) || 0, price: Number(apiCombo.price) || screenCombo.price }
    : screenCombo
  const comboCartKey = `combo:${combo.id || route.path}`
  const remainingStock = Math.max(0, Math.floor(combo.stock) - Math.floor(Number(cart[comboCartKey]) || 0))

  // The headline reports physical availability. The lower quantity panel
  // reports how many more units this customer may add after their cart.
  const headlineStockLabel = [...documentFromStitch.body.querySelectorAll('main span')]
    .find((element) => /^(Sắp hết|Còn hàng|Hết hàng)/.test(element.textContent.trim()))
  if (headlineStockLabel) {
    headlineStockLabel.textContent = combo.stock <= 0
      ? 'Hết hàng'
      : `${combo.stock <= 8 ? 'Sắp hết · ' : 'Còn hàng · '}Còn ${Math.floor(combo.stock)} combo trong kho`
  }

  // Quantity and cart controls work on every detail route, including the
  // original Stitch Củ Quả page, whose visual content stays untouched.
  const quantityDisplay = documentFromStitch.body.querySelector('#qtyDisplay')
  const detailSection = quantityDisplay?.closest('section')
  const decreaseButton = documentFromStitch.body.querySelector('#btnDecrease')
  const increaseButton = documentFromStitch.body.querySelector('#btnIncrease')
  const addButton = documentFromStitch.body.querySelector('#addToCartBtn')
  if (detailSection) {
    detailSection.dataset.comboDetail = 'true'
    detailSection.dataset.comboStock = String(Math.max(0, Math.floor(combo.stock)))
    detailSection.dataset.comboRemainingStock = String(remainingStock)
    detailSection.dataset.comboPrice = String(combo.price)
    detailSection.dataset.comboRoute = isDatabaseDetail ? `/imperfect/chi-tiet?comboId=${encodeURIComponent(combo.id)}` : route.path
  }
  if (quantityDisplay) {
    quantityDisplay.dataset.comboQuantity = 'true'
    quantityDisplay.textContent = remainingStock > 0 ? '1' : '0'
  }
  if (decreaseButton) {
    decreaseButton.dataset.comboQuantityAction = 'decrease'
    decreaseButton.disabled = true
  }
  if (increaseButton) {
    increaseButton.dataset.comboQuantityAction = 'increase'
    increaseButton.disabled = remainingStock <= 1
  }
  if (addButton) {
    const buyNowButton = [...documentFromStitch.body.querySelectorAll('main button')]
      .find((button) => normalizeLabel(button.textContent).includes('mua ngay'))
    if (buyNowButton) {
      buyNowButton.dataset.buyNowCombo = 'true'
      buyNowButton.dataset.addComboId = combo.id || route.path
      if (combo.id) buyNowButton.dataset.mongoComboId = combo.id
      buyNowButton.dataset.comboStock = String(Math.max(0, Math.floor(combo.stock)))
      buyNowButton.dataset.comboRemainingStock = String(remainingStock)
      buyNowButton.disabled = remainingStock < 1
      buyNowButton.classList.toggle('opacity-50', remainingStock < 1)
      buyNowButton.classList.toggle('cursor-not-allowed', remainingStock < 1)
  }
    addButton.dataset.addComboId = combo.id || route.path
    if (combo.id) addButton.dataset.mongoComboId = combo.id
    addButton.dataset.comboStock = String(Math.max(0, Math.floor(combo.stock)))
    addButton.dataset.comboRemainingStock = String(remainingStock)
    addButton.disabled = remainingStock < 1
  }
  const initialAddText = addButton?.querySelector('#addToCartText')
  if (initialAddText && remainingStock < 1) {
    initialAddText.textContent = combo.stock > 0 ? 'Đã đủ số lượng trong giỏ' : 'Hết hàng'
  }
  const availableStockLabel = [...documentFromStitch.body.querySelectorAll('main strong')]
    .find((element) => element.closest('.bg-surface-container-lowest')?.textContent.includes('Tính theo tồn kho'))
  if (availableStockLabel) availableStockLabel.textContent = `${remainingStock} combo`
  if (comboIndex === 0 && !isDatabaseDetail) return // Keep the original Stitch Củ Quả content and title intact.

  const title = documentFromStitch.body.querySelector('main h1')
  if (title) title.textContent = combo.title
  const breadcrumb = [...documentFromStitch.body.querySelectorAll('main nav span')].at(-1)
  if (breadcrumb) breadcrumb.textContent = combo.title
  const summary = title?.parentElement?.querySelector('p')
  if (summary) summary.textContent = combo.reason

  const mainImage = documentFromStitch.body.querySelector('#mainProductImage')
  if (mainImage && combo.image) {
    mainImage.src = combo.image
    mainImage.alt = combo.title
  }
  const thumbnails = [...documentFromStitch.body.querySelectorAll('.thumbnail-btn')]
  thumbnails.forEach((button, index) => {
    if (index > 0 || !combo.image) {
      button.classList.add('hidden')
      return
    }
    const thumbnailImage = button.querySelector('img')
    if (thumbnailImage) {
      thumbnailImage.src = combo.image
      thumbnailImage.alt = combo.title
    }
    const caption = button.querySelector('span:not(.material-symbols-outlined)')
    if (caption) caption.textContent = combo.title
    button.setAttribute('aria-label', `Xem ảnh ${combo.title}`)
  })
  const imageBadge = mainImage?.parentElement?.querySelector('div.bg-tertiary-container')
  if (imageBadge?.lastElementChild) imageBadge.lastElementChild.textContent = 'Nông sản Imperfect giải cứu'
  const imageLocation = mainImage?.parentElement?.querySelector('div.absolute.bottom-4')
  const imageLocationText = imageLocation?.querySelector('span.font-label-sm')
  if (imageLocationText) imageLocationText.textContent = `Thu hoạch tại ${combo.location}`

  const price = documentFromStitch.body.querySelector('.text-display-lg-mobile')
  if (price) price.textContent = money(combo.price)
  const oldPrice = documentFromStitch.body.querySelector('.text-price-md.line-through')
  if (oldPrice) {
    oldPrice.textContent = money(combo.oldPrice)
    oldPrice.classList.toggle('hidden', !combo.oldPrice)
  }
  const savingBadge = documentFromStitch.body.querySelector('main span.bg-secondary-fixed')
  if (savingBadge) {
    savingBadge.textContent = `Tiết kiệm ${money(combo.savedAmount)}`
    savingBadge.classList.toggle('hidden', !combo.savedAmount)
  }

  const reasonLabel = [...documentFromStitch.body.querySelectorAll('main span')]
    .find((element) => element.textContent.includes('Lý do ngoại hình imperfect'))
  const reasonParagraph = reasonLabel?.parentElement?.nextElementSibling
  if (reasonParagraph) reasonParagraph.textContent = combo.reason

  const componentHeading = [...documentFromStitch.body.querySelectorAll('main h2')]
    .find((element) => element.textContent.includes('Thành phần trong combo'))
  const componentLabel = componentHeading?.querySelector('span:not(.material-symbols-outlined)')
  if (componentLabel) componentLabel.textContent = `Thành phần trong combo${combo.weight ? ` (${combo.weight} chuẩn cân)` : ''}`
  const componentPanels = [...documentFromStitch.body.querySelectorAll('.space-y-space-sm')]
    .filter((element) => element.textContent.includes('Mua lẻ:'))
  componentPanels.forEach((panel) => {
    panel.replaceChildren()
    combo.contents.forEach((content) => {
      const row = documentFromStitch.createElement('div')
      row.className = 'flex items-center justify-between gap-3 text-on-surface py-1'
      const name = documentFromStitch.createElement('span')
      name.textContent = content
      row.append(name)
      panel.append(row)
    })
    const retail = documentFromStitch.createElement('div')
    retail.className = 'pt-space-sm mt-space-xs border-t border-surface-container-highest flex items-center justify-between font-label-lg text-label-lg'
    retail.innerHTML = `<span class="text-outline">Giá mua lẻ tham khảo:</span><span class="line-through text-outline">${money(combo.oldPrice)}</span>`
    const bundle = documentFromStitch.createElement('div')
    bundle.className = 'flex items-center justify-between font-title-md text-title-md text-primary font-bold'
    bundle.innerHTML = `<span>Giá combo hôm nay:</span><span>${money(combo.price)}</span>`
    panel.append(retail, bundle)
  })

  const stockText = [...documentFromStitch.body.querySelectorAll('main strong')]
    .find((element) => element.closest('.bg-surface-container-lowest')?.textContent.includes('Tính theo tồn kho'))
  if (stockText) stockText.textContent = `${remainingStock} combo`
  const outOfStock = remainingStock <= 0
  documentFromStitch.body.querySelectorAll('#btnDecrease, #btnIncrease, #addToCartBtn').forEach((control) => {
    control.disabled = outOfStock
    control.classList.toggle('opacity-50', outOfStock)
    control.classList.toggle('cursor-not-allowed', outOfStock)
  })
  const addText = documentFromStitch.body.querySelector('#addToCartText')
  if (addText) addText.textContent = combo.stock <= 0
    ? 'Hết hàng'
    : remainingStock <= 0
      ? 'Đã đủ số lượng trong giỏ'
      : `Thêm vào giỏ - ${money(combo.price)}`
}

function getLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readStoredAuth() {
  const token = sessionStorage.getItem('greennovaToken')
  if (!token) return null

  try {
    const user = JSON.parse(sessionStorage.getItem('greennovaUser') || 'null')
    const encodedPayload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/')
    const payload = encodedPayload ? JSON.parse(atob(encodedPayload)) : null
    if (!user || !payload?.exp || payload.exp * 1000 <= Date.now()) throw new Error('Phiên hết hạn')
    return user
  } catch {
    sessionStorage.removeItem('greennovaToken')
    sessionStorage.removeItem('greennovaUser')
    return null
  }
}

function getProfileCompletionStatus(user) {
  const addresses = Array.isArray(user?.addresses) ? user.addresses : []
  const hasAddress = addresses.some((address) => String(address?.address || '').trim() && String(address?.province || '').trim())
    || Boolean(String(user?.address || '').trim() && String(user?.province || '').trim())
  const hasBank = Boolean(String(user?.bankName || '').trim() && String(user?.bankAccountNumber || '').replace(/\D/g, '').length >= 6)
  return { address: !hasAddress, bank: !hasBank }
}

function requiresCustomerSession(route) {
  return route.path.startsWith('/account')
    || route.path.startsWith('/orders')
    || route.path === '/farm-box/cua-toi'
    || route.path === '/farm-box/thay-doi'
    || route.folder.startsWith('chi_ti_t_n_h_ng')
    || route.folder.startsWith('n_h_ng_c_a_t_i')
    || route.folder.startsWith('fb03_farm_box_c_a_t_i')
}

function requiresAdminSession(route) {
  return route.path.startsWith('/admin') || route.folder.startsWith('qt0')
}

function applyCustomerProfileNavigation(documentFromStitch, route) {
  const profileRoutes = ['/account', '/account/addresses', '/account/refund-account', '/account/change-password', '/orders', '/orders/detail']
  if (!profileRoutes.includes(route.path)) return
  const nav = documentFromStitch.body.querySelector('aside nav')
  if (!nav) return
  const items = [
    { label: 'Thông tin cá nhân', path: '/account', icon: 'badge', match: (text) => /thong tin ca nhan/.test(text), active: route.path === '/account' },
    { label: 'Sổ địa chỉ giao hàng', path: '/account/addresses', icon: 'location_on', match: (text) => /dia chi|so dia chi/.test(text), active: route.path === '/account/addresses' },
    { label: 'Tài khoản nhận hoàn tiền', path: '/account/refund-account', icon: 'account_balance', match: (text) => /tai khoan nhan hoan tien|tai khoan ngan hang/.test(text), active: route.path === '/account/refund-account' },
    { label: 'Đơn hàng của tôi', path: '/orders', icon: 'inventory_2', match: (text) => /lich su don hang|don hang cua toi/.test(text), active: route.path === '/orders' || route.path === '/orders/detail' },
    { label: 'Đổi mật khẩu', path: '/account/change-password', icon: 'lock_reset', match: (text) => /doi mat khau/.test(text), active: route.path === '/account/change-password' },
  ]
  const anchors = [...nav.querySelectorAll('a')]
  const className = 'flex items-center justify-between px-3.5 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-title-md text-title-md transition-colors'
  const activeClassName = 'flex items-center justify-between px-3.5 py-3 rounded-lg bg-surface-container text-primary font-title-md text-title-md border-l-4 border-primary transition-all'
  const normalized = (value) => normalizeLabel(value)
  const selected = items.map((item) => {
    let anchor = anchors.find((candidate) => item.match(normalized(candidate.textContent)))
    if (!anchor) anchor = documentFromStitch.createElement('a')
    anchor.href = item.path
    anchor.dataset.route = item.path
    anchor.className = item.active ? activeClassName : className
    anchor.innerHTML = `<div class="flex items-center gap-3"><span class="material-symbols-outlined text-[20px] ${item.active ? 'text-primary' : ''}">${item.icon}</span><span>${item.label}</span></div>${item.active ? '<span class="material-symbols-outlined text-[16px]">chevron_right</span>' : ''}`
    return anchor
  })
  nav.replaceChildren(...selected)
}

function applyStoreProducts(documentFromStitch, route, products, productPage = 1, productSearch = '', catalogFilters = {}, selectedProductId = '') {
  const harvestDateLabel = formatSaigonToday()
  if (route.path === '/nong-san') {
    documentFromStitch.body.style.backgroundColor = '#f0faf0'
    const listingMain = documentFromStitch.body.querySelector('main')
    if (listingMain) listingMain.style.backgroundColor = '#f0faf0'
  }
  if (!products.length && route.path !== '/nong-san') return
  const normalizedProductSearch = normalizeLabel(productSearch)
  const productSearchTokens = normalizedProductSearch.split(/\s+/).filter(Boolean)
  const getSellableStock = (product) => {
    const stock = Math.max(0, Number(product?.stock) || 0)
    const canPurchase = product?.canPurchase ?? (product?.status === 'Đang bán' && stock > 0)
    return canPurchase ? stock : 0
  }
  let displayProducts = products
  if (route.path === '/nong-san') {
    displayProducts = products.filter((product) => {
      const normalizedName = normalizeLabel(product.name)
      const normalizedCategory = normalizeLabel(product.category || '')
      const month = new Date().getMonth() + 1
      if (productSearchTokens.length && !productSearchTokens.every((token) => normalizedName.includes(token))) return false
      if (catalogFilters.category === 'rau' && !normalizedCategory.includes('rau')) return false
      if (catalogFilters.category === 'cu' && !normalizedCategory.includes('cu')) return false
      if (catalogFilters.category === 'fruit'
        && !normalizedCategory.includes('trai cay') && !normalizedCategory.includes('hoa qua')) return false
      if (catalogFilters.seasonal && !(product.seasonMonths || []).map(Number).includes(month)) return false
      if (catalogFilters.farms?.length && !catalogFilters.farms.includes(product.farm)) return false
      return true
    })

    const compareText = (first, second) => String(first || '').localeCompare(String(second || ''), 'vi')
    if (catalogFilters.sort === 'price-asc') displayProducts.sort((first, second) => first.price - second.price)
    else if (catalogFilters.sort === 'price-desc') displayProducts.sort((first, second) => second.price - first.price)
    else if (catalogFilters.sort === 'alpha') displayProducts.sort((first, second) => compareText(first.name, second.name))
    else if (catalogFilters.sort === 'newest') {
      displayProducts.sort((first, second) => new Date(second.harvestDate || second.createdAt || 0) - new Date(first.harvestDate || first.createdAt || 0))
    }
  }

  let cards = []
  let cardProducts = []
  if (route.path === '/') {
    const imperfectSection = [...documentFromStitch.body.querySelectorAll('section')]
      .find((section) => [...section.querySelectorAll('h2')]
        .some((heading) => normalizeLabel(heading.textContent).includes('khong lang phi gia tri')))
    if (imperfectSection) {
      const bannerImage = imperfectSection.querySelector('img')?.getAttribute('src') || ''
      imperfectSection.className = 'w-full py-8 sm:py-10'
      imperfectSection.innerHTML = `<div class="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div class="grid overflow-hidden rounded-2xl bg-[#f5f1df] p-5 shadow-sm sm:p-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-10 lg:p-9">
          <div class="flex flex-col items-start">
            <span class="inline-flex items-center gap-2 rounded-full bg-[#ffe0c2] px-3 py-1 font-label-md text-label-md font-semibold text-[#814100]">
              <span class="material-symbols-outlined text-[16px]">savings</span> Tiết kiệm tới -45% • Móp méo ngon lành
            </span>
            <h2 class="mt-4 max-w-xl font-headline-lg text-headline-lg font-bold leading-tight text-[#17251b]">Không hoàn hảo về hình thức.<br class="hidden sm:block"/> Không lãng phí giá trị.</h2>
            <p class="mt-3 max-w-xl font-body-sm text-body-sm leading-relaxed text-[#48564b]">Một số nông sản có hình dạng hoặc kích thước không đồng đều nhưng vẫn còn giá trị sử dụng. Chúng tôi gom chúng thành các combo cố định với giá tiết kiệm hơn.</p>
            <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-label-sm text-label-sm font-medium text-[#263c2d]">
              <span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-[15px] text-primary">verified</span>100% Chuẩn VietGAP</span>
              <span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-[15px] text-[#a75b00]">eco</span>Vị ngon tự nhiên</span>
              <span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-[15px] text-primary">energy_savings_leaf</span>Giải cứu 12.4 tấn</span>
            </div>
            <a class="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#814100] px-5 py-2 font-label-md text-label-md font-semibold text-white no-underline transition hover:bg-[#683400]" data-path="imperfect-45" href="#">Khám phá Imperfect <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>
          </div>
          <a class="relative mt-5 block overflow-hidden rounded-xl lg:mt-0" data-path="imperfect-45" href="#" aria-label="Khám phá các combo Imperfect">
            <img class="h-48 w-full object-cover sm:h-56 lg:h-52" src="${bannerImage}" alt="Combo nông sản Imperfect được tuyển chọn" loading="lazy"/>
            <span class="absolute right-3 top-3 rounded-lg bg-[#814100]/95 px-3 py-2 text-center font-label-sm text-label-sm font-semibold text-white shadow"><span class="block">GIẢM ĐẾN</span><span class="text-lg leading-5">-45%</span></span>
            <span class="absolute bottom-3 left-3 rounded-md bg-white/95 px-2.5 py-1 font-label-sm text-label-sm font-semibold text-[#263c2d]">Củ quả méo mó nhưng ngọt vị</span>
          </a>
        </div>
      </div>`
    }
    const heading = [...documentFromStitch.body.querySelectorAll('h2')]
      .find((element) => element.textContent.includes('Tuần này có gì'))
    const grid = heading?.closest('section')?.querySelector('.grid')
    cards = grid ? [...grid.children].slice(0, 4) : []
    // Select the homepage feature items by their MongoDB product names. This
    // keeps each title/image/price/unit attached to the same database record
    // even if the API's alphabetical order changes.
    const featuredNames = ['Bí đỏ da xanh', 'Bông cải', 'Bơ sáp 034', 'Bắp cải thảo']
    const productsByName = new Map(products.map((product) => [normalizeLabel(product.name), product]))
    cardProducts = featuredNames.slice(0, cards.length)
      .map((name) => productsByName.get(normalizeLabel(name)))
      .filter(Boolean)
    if (cardProducts.length < cards.length) {
      const usedIds = new Set(cardProducts.map((product) => product.id))
      cardProducts.push(...products.filter((product) => !usedIds.has(product.id)).slice(0, cards.length - cardProducts.length))
    }
  } else if (route.path === '/nong-san') {
    const categoryButtons = [...documentFromStitch.body.querySelectorAll('button')]
    const categoryKeys = new Map([['tat ca', 'all'], ['rau', 'rau'], ['cu', 'cu'], ['trai cay', 'fruit']])
    categoryButtons.forEach((button) => {
      const label = normalizeLabel(button.textContent)
      const category = categoryKeys.get(label)
      if (!category) return
      button.dataset.productCategory = category
      const active = (catalogFilters.category || 'all') === category
      button.classList.toggle('bg-primary-container', active)
      button.classList.toggle('text-on-primary', active)
      button.classList.toggle('font-semibold', active)
      button.classList.toggle('shadow-sm', active)
      button.classList.toggle('bg-surface-container-lowest', !active)
      button.classList.toggle('text-on-surface', !active)
    })

    const seasonalButton = categoryButtons.find((button) => normalizeLabel(button.textContent).includes('theo mua'))
    if (seasonalButton) {
      seasonalButton.dataset.seasonFilter = 'true'
      seasonalButton.classList.toggle('bg-primary-container', Boolean(catalogFilters.seasonal))
      seasonalButton.classList.toggle('text-on-primary', Boolean(catalogFilters.seasonal))
      seasonalButton.classList.toggle('font-semibold', Boolean(catalogFilters.seasonal))
      seasonalButton.classList.toggle('bg-surface-container-lowest', !catalogFilters.seasonal)
      seasonalButton.classList.toggle('text-on-surface', !catalogFilters.seasonal)
    }

    const farmMenu = documentFromStitch.body.querySelector('#farm-filter-menu')
    if (farmMenu) {
      const farms = [...new Set(products.map((product) => product.farm).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))
      farmMenu.replaceChildren(...farms.map((farm) => {
        const label = documentFromStitch.createElement('label')
        label.className = 'flex items-center gap-space-sm px-space-sm py-2 rounded-lg hover:bg-surface-container cursor-pointer select-none'
        const checkbox = documentFromStitch.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'w-4 h-4 rounded text-primary-container focus:ring-0 accent-primary-container'
        checkbox.dataset.farmFilter = farm
        checkbox.checked = Boolean(catalogFilters.farms?.includes(farm))
        const name = documentFromStitch.createElement('span')
        name.className = 'font-body-sm text-body-sm text-on-surface'
        name.textContent = farm
        label.append(checkbox, name)
        return label
      }))
    }
    const farmButtonLabel = documentFromStitch.body.querySelector('#farm-filter-btn > span:first-child')
    if (farmButtonLabel) {
      farmButtonLabel.textContent = catalogFilters.farms?.length
        ? `Nông trại (${catalogFilters.farms.length})`
        : 'Theo nông trại'
    }
    const sortSelect = documentFromStitch.body.querySelector('select[aria-label="Sắp xếp danh sách"]')
    if (sortSelect) {
      sortSelect.dataset.productSort = 'true'
      const selectedSort = catalogFilters.sort || 'default'
      ;[...sortSelect.options].forEach((option) => {
        const isSelected = option.value === selectedSort
        option.selected = isSelected
        option.toggleAttribute('selected', isSelected)
      })
    }

    const grid = [...documentFromStitch.body.querySelectorAll('.grid')]
      .find((element) => element.querySelector(':scope > article'))
    if (grid) {
      const template = grid.querySelector(':scope > article')
      const pageSize = 12
      const pageCount = Math.max(1, Math.ceil(displayProducts.length / pageSize))
      const safePage = Math.min(Math.max(1, productPage), pageCount)
      cardProducts = displayProducts.slice((safePage - 1) * pageSize, safePage * pageSize)
      cards = cardProducts.map(() => template.cloneNode(true))
      grid.replaceChildren(...cards)
      if (!cardProducts.length) {
        const emptyState = documentFromStitch.createElement('div')
        emptyState.className = 'col-span-full flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-[#d7e7d8] bg-white px-6 py-12 text-center shadow-sm'
        if (normalizedProductSearch) {
          emptyState.innerHTML = `<div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f5e8] text-[#16733b]"><span class="material-symbols-outlined text-[31px]">search_off</span></div>
            <h3 class="mt-5 text-xl font-bold text-[#1e3023]">Không tìm thấy nông sản phù hợp</h3>
            <p class="mt-2 max-w-md text-sm leading-6 text-[#617166]">Không có sản phẩm nào khớp với từ khóa <strong class="font-semibold text-[#33463a]">“${String(productSearch).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])}”</strong>. Hãy thử từ khóa ngắn hơn hoặc xóa bộ lọc hiện tại.</p>
            <button type="button" data-reset-product-filters="true" class="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#16733b] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#075d31]"><span class="material-symbols-outlined text-[18px]">restart_alt</span>Xem tất cả nông sản</button>`
        } else {
          emptyState.innerHTML = '<div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f5e8] text-[#16733b]"><span class="material-symbols-outlined text-[31px]">inventory_2</span></div><h3 class="mt-5 text-xl font-bold text-[#1e3023]">Chưa có nông sản để hiển thị</h3><p class="mt-2 max-w-md text-sm leading-6 text-[#617166]">Danh sách nông sản đang được cập nhật. Bạn có thể quay lại sau ít phút.</p>'
        }
        grid.append(emptyState)
      }

      const pagination = [...documentFromStitch.body.querySelectorAll('section')]
        .find((section) => {
          const labels = [...section.querySelectorAll('button')].map((button) => normalizeLabel(button.textContent))
          return labels.some((label) => label.includes('truoc'))
            && labels.some((label) => label.includes('sau'))
        })
      if (pagination) {
        pagination.replaceChildren()
        pagination.classList.toggle('hidden', displayProducts.length <= pageSize)
        const makePageButton = (label, targetPage, active = false, wide = false) => {
          const button = documentFromStitch.createElement('button')
          button.type = 'button'
          button.dataset.productPage = String(targetPage)
          button.className = wide
            ? 'h-10 px-4 rounded-xl bg-surface-container-lowest text-primary-container hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors shadow-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed'
            : `w-10 h-10 rounded-xl ${active ? 'bg-primary-container text-on-primary font-bold' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container font-medium'} font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center`
          if (active) button.setAttribute('aria-current', 'page')
          if (wide) {
            const icon = documentFromStitch.createElement('span')
            icon.className = 'material-symbols-outlined text-[18px]'
            icon.textContent = label === 'Trước' ? 'chevron_left' : 'chevron_right'
            if (label === 'Sau') button.append(documentFromStitch.createTextNode('Sau'))
            button.append(icon)
            if (label === 'Trước') button.append(documentFromStitch.createTextNode('Trước'))
         
          } else {
            button.textContent = label
          }
          return button
        }
        const previousButton = makePageButton('Trước', Math.max(1, safePage - 1), false, true)
        previousButton.disabled = safePage === 1
        pagination.append(previousButton)
        for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
          pagination.append(makePageButton(String(pageNumber), pageNumber, pageNumber === safePage))
        }
        const nextButton = makePageButton('Sau', Math.min(pageCount, safePage + 1), false, true)
        nextButton.disabled = safePage === pageCount
        pagination.append(nextButton)
      }
    }
  } else if (route.path === '/nong-san/chi-tiet') {
    const productId = selectedProductId || new URLSearchParams(window.location.search).get('productId')
    const product = products.find((item) => item.id === productId)
    if (product) {
      const title = documentFromStitch.body.querySelector('h1')
      if (title) title.textContent = product.name
      const breadcrumb = documentFromStitch.body.querySelector('nav[aria-label="Đường dẫn trang"]')
      if (breadcrumb?.lastElementChild) breadcrumb.lastElementChild.textContent = product.name
      const image = documentFromStitch.body.querySelector('#mainProductImage')
      const galleryImages = [...new Set([product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean))]
      if (image) {
        if (galleryImages[0]) image.src = galleryImages[0]
        image.alt = product.name
      }
      const gallery = image?.closest('section')?.querySelector('.grid.grid-cols-4')
      if (gallery) {
        const thumbnails = [...gallery.querySelectorAll('button')]
        thumbnails.forEach((button, index) => {
          const imageUrl = galleryImages[index]
          if (!imageUrl) {
            button.classList.add('hidden')
            return
          }
          button.classList.remove('hidden')
          button.dataset.gallerySrc = imageUrl
          button.dataset.galleryAlt = `${product.name} — ảnh ${index + 1}`
          button.setAttribute('aria-label', `Xem ${product.name}, ảnh ${index + 1}`)
          button.removeAttribute('onclick')
          button.classList.toggle('ring-2', index === 0)
          button.classList.toggle('ring-1', index !== 0)
          button.classList.toggle('ring-primary', index === 0)
          button.classList.toggle('ring-[#DCE3D8]', index !== 0)
          const thumbnailImage = button.querySelector('img')
          if (thumbnailImage) {
            thumbnailImage.src = imageUrl
            thumbnailImage.alt = `${product.name} — ảnh ${index + 1}`
          }
        })
        gallery.classList.toggle('hidden', galleryImages.length <= 1)

        const imageFrame = image.parentElement
        if (imageFrame && galleryImages.length > 1) {
          ;[-1, 1].forEach((step) => {
            const button = documentFromStitch.createElement('button')
            button.type = 'button'
            button.dataset.galleryStep = String(step)
            button.setAttribute('aria-label', step < 0 ? 'Xem ảnh trước' : 'Xem ảnh tiếp theo')
            button.className = `absolute top-1/2 ${step < 0 ? 'left-3' : 'right-3'} z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#075E35] shadow-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E35]`
            const icon = documentFromStitch.createElement('span')
            icon.className = 'material-symbols-outlined'
            icon.textContent = step < 0 ? 'chevron_left' : 'chevron_right'
            button.append(icon)
            imageFrame.append(button)
          })
        }
      }

      const tagRow = title?.nextElementSibling
      const tags = [...(tagRow?.querySelectorAll('span') || [])]
      if (tags[0]) tags[0].textContent = product.categoryName || product.category || 'Nông sản'
      tags[1]?.remove()
      const price = [...documentFromStitch.body.querySelectorAll('.font-headline-lg')]
        .find((element) => element !== title && element.textContent.includes('đ'))
      if (price) {
        price.replaceChildren(documentFromStitch.createTextNode(money(product.price)))
        const unit = documentFromStitch.createElement('span')
        unit.className = 'font-body-md text-body-md font-normal text-[#5B6B60]'
        unit.textContent = `/${product.unit}`
        price.append(unit)
      }

      const shortDescription = title?.parentElement?.querySelector('p.leading-relaxed')
      if (shortDescription) shortDescription.textContent = product.description || `${product.name} được tuyển chọn từ ${product.farm}, bảo đảm tươi ngon và phù hợp cho bữa ăn gia đình.`
      const findInfoValue = (label) => {
        const labelNode = [...documentFromStitch.body.querySelectorAll('span')]
          .find((element) => element.textContent.trim() === label)
        return labelNode?.closest('.flex.items-center.justify-between')?.lastElementChild
      }
      const harvestedAt = harvestDateLabel
      const stepText = getProductQuantityStep(product)
      const stepFormatted = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(stepText)
      const farmValue = findInfoValue('Nông trại')
      const regionValue = findInfoValue('Khu vực')
      const harvestValue = findInfoValue('Ngày thu hoạch')
      const unitValue = findInfoValue('Đơn vị bán')
      if (farmValue) farmValue.textContent = product.farm || 'Nông trại GreenNova'
      if (regionValue) regionValue.textContent = product.region || 'Đang cập nhật'
      if (harvestValue) harvestValue.textContent = harvestedAt
      if (unitValue) unitValue.textContent = `${product.unit} (bước ${stepFormatted} ${product.unit})`

      const stockText = [...documentFromStitch.body.querySelectorAll('span')]
        .find((element) => ['Còn hàng', 'Hết hàng'].includes(element.textContent.trim()))
      const sellableStock = getSellableStock(product)
      if (stockText) stockText.textContent = sellableStock > 0 ? `Còn ${sellableStock} ${product.unit}` : 'Hết hàng'

      const detailSection = image?.closest('section')
      const quantityBlock = [...(detailSection?.querySelectorAll('.flex.items-center.justify-between') || [])]
        .find((element) => [...element.querySelectorAll('span')].some((span) => span.textContent.includes('Số lượng:')))
      const quantityDisplay = quantityBlock?.querySelector('#quantityDisplay')
      if (quantityBlock && quantityDisplay) {
        const stock = getSellableStock(product)
        const step = Math.max(0.001, getProductQuantityStep(product))
        const initialQuantity = Math.min(stock, Math.max(step, step * Math.ceil(1 / step)))
        quantityBlock.dataset.productDetail = 'true'
        quantityBlock.dataset.productStep = String(step)
        quantityBlock.dataset.productStock = String(stock)
        quantityBlock.dataset.productPrice = String(product.price)
        quantityBlock.dataset.productUnit = product.unit
        quantityDisplay.dataset.detailQuantity = 'true'
        quantityDisplay.textContent = `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(initialQuantity)} ${product.unit}`
        const quantityButtons = [...quantityBlock.querySelectorAll('button')]
        if (quantityButtons[0]) {
          quantityButtons[0].dataset.quantityAction = 'decrease'
          quantityButtons[0].setAttribute('aria-label', `Giảm ${stepFormatted} ${product.unit}`)
          quantityButtons[0].disabled = stock <= 0 || initialQuantity <= step
        }
        if (quantityButtons[1]) {
          quantityButtons[1].dataset.quantityAction = 'increase'
          quantityButtons[1].setAttribute('aria-label', `Tăng ${stepFormatted} ${product.unit}`)
          quantityButtons[1].disabled = stock <= initialQuantity
        }
        quantityButtons.forEach((button) => { button.dataset.detailQuantityButton = 'true' })
        const subtotal = quantityBlock.querySelector('#subtotalDisplay')
        if (subtotal) subtotal.textContent = money(product.price * initialQuantity)
        if (stock <= 0) quantityButtons.forEach((button) => { button.disabled = true })
      }

      const characteristic = [...documentFromStitch.body.querySelectorAll('h3')]
        .find((element) => element.textContent.trim() === 'Đặc điểm nông sản')?.nextElementSibling
      if (characteristic) characteristic.textContent = product.description || `${product.name} được thu hoạch từ ${product.farm} và bảo quản cẩn thận trước khi giao đến khách hàng.`
      const farmRegionLabel = [...documentFromStitch.body.querySelectorAll('span')]
        .find((element) => element.textContent.trim() === 'Khu vực canh tác')
      const farmProfile = farmRegionLabel?.closest('.space-y-3')?.previousElementSibling
      const farmProfileName = farmProfile?.querySelector('span:not(.material-symbols-outlined):not(.material-symbols-rounded):not(.material-icons)')
      if (farmProfileName) farmProfileName.textContent = product.farm || 'Nông trại GreenNova'
      if (farmRegionLabel?.nextElementSibling) farmRegionLabel.nextElementSibling.textContent = product.region || 'Đang cập nhật'

      const relatedHeading = [...documentFromStitch.body.querySelectorAll('h2')]
        .find((element) => element.textContent.includes('Nông sản khác từ'))
      const relatedSection = relatedHeading?.closest('section')
      const relatedGrid = relatedSection?.querySelector('.grid')
      if (relatedHeading && relatedGrid) {
        relatedHeading.textContent = `Nông sản khác từ ${product.farm || 'GreenNova'}`
        const relatedProducts = products
          .filter((item) => item.id !== product.id && item.farm === product.farm)
          .concat(products.filter((item) => item.id !== product.id && item.farm !== product.farm))
          .slice(0, relatedGrid.children.length)
        ;[...relatedGrid.children].forEach((card, index) => {
          const related = relatedProducts[index]
          if (!related) {
            card.remove()
            return
          }
          card.dataset.productId = related.id
          card.dataset.route = `/nong-san/chi-tiet?productId=${encodeURIComponent(related.id)}`
          card.classList.add('cursor-pointer')
          const relatedImage = card.querySelector('img')
          if (relatedImage) {
            if (related.image) relatedImage.src = related.image
            relatedImage.alt = related.name
          }
          const relatedTitle = card.querySelector('h3')
          if (relatedTitle) relatedTitle.textContent = related.name
          if (relatedTitle?.nextElementSibling) relatedTitle.nextElementSibling.textContent = related.farm
          const relatedHarvest = relatedTitle?.nextElementSibling?.nextElementSibling
          if (relatedHarvest) {
            relatedHarvest.textContent = `Ngày thu hoạch: ${harvestDateLabel}`
          }
          const relatedPrice = card.querySelector('.mt-auto span')
          if (relatedPrice) relatedPrice.textContent = `${money(related.price)}/${related.unit}`
          const relatedAddButton = [...card.querySelectorAll('button')]
            .find((button) => normalizeLabel(button.textContent).includes('them vao gio'))
          if (relatedAddButton) {
            const relatedStock = getSellableStock(related)
            relatedAddButton.dataset.addProductId = related.id
            relatedAddButton.dataset.productStock = String(relatedStock)
            relatedAddButton.disabled = relatedStock <= 0
            if (relatedStock <= 0) relatedAddButton.textContent = 'Hết hàng'
          }
        })
      }

      const addButton = [...documentFromStitch.body.querySelectorAll('button')]
        .find((button) => normalizeLabel(button.textContent).includes('them vao gio'))
      if (addButton) {
        const sellableStock = getSellableStock(product)
        addButton.dataset.addProductId = product.id
        addButton.dataset.productStock = String(sellableStock)
        addButton.disabled = sellableStock <= 0
        if (sellableStock <= 0) addButton.textContent = 'Hết hàng'
      }
    }
  }

  cards.forEach((card, index) => {
    const product = cardProducts[index]
    if (!product) return
    const sellableStock = getSellableStock(product)
    const isOutOfStock = sellableStock <= 0
    card.dataset.productId = product.id
    card.dataset.route = `/nong-san/chi-tiet?productId=${encodeURIComponent(product.id)}`
    card.classList.add('cursor-pointer')
    card.classList.toggle('opacity-60', isOutOfStock)
    card.classList.toggle('grayscale', isOutOfStock)
    card.setAttribute('aria-label', `${product.name}${isOutOfStock ? ' — Hết hàng' : ''}`)

    const image = card.querySelector('img')
    if (image && product.image) image.src = product.image
    if (image) image.alt = product.name
    const stockImageFrame = image?.parentElement
    if (stockImageFrame) {
      let stockBadge = stockImageFrame.querySelector('[data-product-stock-badge]')
      if (isOutOfStock && !stockBadge) {
        stockImageFrame.classList.add('relative')
        stockBadge = documentFromStitch.createElement('span')
        stockBadge.dataset.productStockBadge = 'true'
        stockBadge.className = 'absolute left-2 top-2 z-10 rounded-full bg-[#4B5563]/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm'
        stockBadge.textContent = 'Hết hàng'
        stockImageFrame.append(stockBadge)
      } else if (!isOutOfStock && stockBadge) {
        stockBadge.remove()
      }
    }

    const title = card.querySelector('h2, h3')
    if (title) title.textContent = product.name
    const harvestLine = [...card.querySelectorAll('p')]
      .find((paragraph) => normalizeLabel(paragraph.textContent).includes('thu hoach'))
    if (harvestLine) {
      const prefix = normalizeLabel(harvestLine.textContent).startsWith('ngay') ? 'Ngày thu hoạch' : 'Thu hoạch'
      harvestLine.textContent = `${prefix}: ${harvestDateLabel}`
    }

    const farm = route.path === '/'
      ? title?.previousElementSibling
      : title?.nextElementSibling?.querySelector('span:last-child')
    if (farm) farm.textContent = product.farm

    const price = card.querySelector('.font-price-lg')
      || [...card.querySelectorAll('span')].find((element) => (
        [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.includes('đ'))
      ))
    if (price) {
      const amountNode = [...price.childNodes].find((node) => node.nodeType === 3 && node.textContent.includes('đ'))
      if (amountNode) amountNode.textContent = money(product.price)
      else price.textContent = money(product.price)

      // Home cards put the unit inside the price span; catalog cards put it
      // next to the amount. Keep both views synchronized with the API.
      const unit = price.querySelector('span')
        || (price.nextElementSibling && /^\s*\//.test(price.nextElementSibling.textContent)
          ? price.nextElementSibling
          : null)
      if (unit) unit.textContent = `/${product.unit}`
    }

    const addButton = [...card.querySelectorAll('button')]
      .find((button) => button.textContent.toLowerCase().includes('thêm vào giỏ'))
    if (addButton) {
      addButton.dataset.addProductId = product.id
      addButton.dataset.productStock = String(sellableStock)
      addButton.disabled = sellableStock <= 0
      if (sellableStock <= 0) addButton.textContent = 'Hết hàng'
    }

    if (route.path === '/nong-san') {
      const quantityButtons = [...card.querySelectorAll('button[aria-label="Giảm số lượng"], button[aria-label="Tăng số lượng"]')]
      const quantityLabel = quantityButtons[0]?.parentElement?.querySelector('span')
      if (quantityButtons.length === 2 && quantityLabel) {
        const step = Math.max(0.001, getProductQuantityStep(product))
        const stock = sellableStock
        const initialQuantity = Math.min(step, stock)
        card.dataset.productStep = String(step)
        card.dataset.productStock = String(stock)
        card.dataset.productCard = 'true'
        quantityLabel.dataset.productQuantity = 'true'
        quantityLabel.textContent = String(Number(initialQuantity.toFixed(3)))
        quantityButtons[0].dataset.quantityAction = 'decrease'
        quantityButtons[1].dataset.quantityAction = 'increase'
        quantityButtons.forEach((button) => { button.dataset.quantityStep = String(step) })
        quantityButtons[0].disabled = stock <= 0 || initialQuantity <= step
        quantityButtons[1].disabled = stock <= 0 || initialQuantity + step > stock
        if (stock <= 0) {
          quantityButtons.forEach((button) => { button.disabled = true })
        }
      }
    }
  })

  if (route.path === '/nong-san') {
    const count = [...documentFromStitch.body.querySelectorAll('span')]
      .find((element) => element.textContent.trim().startsWith('Hiển thị'))
    if (count) {
      const pageSize = 12
      const pageCount = Math.max(1, Math.ceil(displayProducts.length / pageSize))
      const currentPage = Math.min(Math.max(1, productPage), pageCount)
      const start = (currentPage - 1) * pageSize
      const visibleCount = Math.min(pageSize, Math.max(0, displayProducts.length - start))
      count.textContent = `Hiển thị ${visibleCount} / ${displayProducts.length} nông sản (trang ${currentPage})`
    }

    const searchInput = documentFromStitch.body.querySelector('#product-search-input')
    if (searchInput) searchInput.value = productSearch
  }
}

function readStoredCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('greennovaCart') || '{}')
    return cart && typeof cart === 'object' && !Array.isArray(cart) ? cart : {}
  } catch {
    return {}
  }
}

function readFarmBoxIssueChoices() {
  try {
    const value = JSON.parse(localStorage.getItem('greennovaFarmBoxIssueChoices') || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function getFarmBoxIssueChoice(size, weekId = '', farmBoxId = '') {
  const choices = readFarmBoxIssueChoices()
  return (farmBoxId ? choices[`farmBox:${farmBoxId}:week:${weekId}`] || choices[`farmBox:${farmBoxId}:default`] : '')
    || choices[`size:${size}:week:${weekId}`]
    || choices[`size:${size}:default`]
    || 'replace'
}

function getCartQuantity(cart) {
  return Object.values(cart).filter((quantity) => Number(quantity) > 0).length
}

function applyCartScreen(documentFromStitch, products, cart, route, farmBoxes = [], serverCartItems = null, availableCombos = [], authUser = null) {
  const count = getCartQuantity(cart)
  const useUnifiedStoreCart = route.path.startsWith('/imperfect') || route.path.startsWith('/farm-box')
  const header = documentFromStitch.body.querySelector('header')
  const cartControls = [...(header?.querySelectorAll('a, button, [role="link"]') || [])]
    .filter((control) => [...control.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded, .material-icons')]
      .some((icon) => ['shopping bag', 'shopping cart', 'shopping basket'].includes(normalizeLabel(icon.textContent))))

  cartControls.forEach((control) => {
    const icon = [...control.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded, .material-icons')]
      .find((element) => ['shopping bag', 'shopping cart', 'shopping basket'].includes(normalizeLabel(element.textContent)))
    let badge = [...control.querySelectorAll('span')].find((span) => /^\d+$/.test(span.textContent.trim()))
    if (useUnifiedStoreCart) {
      if (count && !badge) badge = documentFromStitch.createElement('span')
      if (badge && count) {
        badge.textContent = String(count)
        badge.className = 'absolute -top-1 -right-1 bg-primary text-on-primary font-label-sm text-label-sm w-5 h-5 rounded-full flex items-center justify-center font-bold'
      }
      control.className = 'relative w-11 h-11 rounded-full hover:bg-surface-container hover:text-on-surface text-on-surface-variant transition-colors flex items-center justify-center shrink-0'
      control.setAttribute('aria-label', 'Giỏ hàng')
      control.setAttribute('title', 'Giỏ hàng')
      control.dataset.path = 'gio-hang'
      if (control.tagName === 'A') control.setAttribute('href', '#')
      if (control instanceof HTMLButtonElement) {
        control.type = 'button'
        control.dataset.route = '/cart'
      }
      if (icon) icon.className = 'material-symbols-outlined text-[24px]'
      control.replaceChildren(...[icon, count ? badge : null].filter(Boolean))
      return
    }
    if (badge) {
      if (count) {
        badge.textContent = String(count)
        badge.classList.remove('hidden')
      } else {
        badge.remove()
      }
    }
  })

  if (!documentFromStitch.body.querySelector('h1')?.textContent.includes('Giỏ hàng của bạn')) return
  const cartSection = documentFromStitch.body.querySelector('section[aria-label="Danh sách nông sản"]')
  const summary = documentFromStitch.body.querySelector('aside[aria-label="Tóm tắt giỏ hàng"]')
  const heading = [...documentFromStitch.body.querySelectorAll('h1')]
    .find((element) => element.textContent.includes('Giỏ hàng của bạn'))
  const countLabel = heading?.nextElementSibling
  const entries = Object.entries(cart).filter(([, quantity]) => Number(quantity) > 0)
  const comboCartDescription = (combo) => {
    if (!combo) return ''
    const ingredients = (combo.items || []).map((item) => item.name).filter(Boolean)
    const weight = Number(combo.totalWeightKg) || (combo.items || []).reduce((total, item) =>
      normalizeLabel(item.unit || '').includes('kg') ? total + (Number(item.quantity) || 0) : total, 0)
    return `${ingredients.length ? ingredients.join(' + ') : combo.description || ''}${weight > 0 ? ` · ${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(weight)}kg` : ''}`
  }
  const farmBoxReceiveLabel = () => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date()).filter((part) => part.type !== 'literal').map(({ type, value }) => [type, Number(value)]))
    const receiveDay = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 2))
    const date = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(receiveDay)
    return `Ngày nhận: ${date} lúc 06:00`
  }
  const databaseComboEntries = availableCombos.map((apiCombo) => ({
    id: `combo:${apiCombo.id}`,
    route: `/imperfect/chi-tiet?comboId=${encodeURIComponent(apiCombo.id)}`,
    name: apiCombo.name,
    title: apiCombo.name,
    image: apiCombo.image || '',
    price: Number(apiCombo.price) || 0,
    stock: Number(apiCombo.stock) || 0,
    stockKnown: apiCombo.stock !== undefined && apiCombo.stock !== null,
    canPurchase: apiCombo.canPurchase ?? Number(apiCombo.stock) > 0,
    unit: 'combo',
    step: 1,
    cartKey: `combo:${apiCombo.id}`,
    cartItemType: 'Combo',
    cartRefId: apiCombo.id,
    description: comboCartDescription(apiCombo),
  }))
  const legacyComboEntries = imperfectComboPaths.map((path, index) => {
    const combo = getImperfectCardData(index)
    const apiCombo = combo && findAvailableComboByName(availableCombos, combo.title)
    return combo ? {
      id: `combo:${path}`, route: path, ...combo, unit: 'combo',
      stock: Number(apiCombo?.stock ?? combo.stock) || 0,
      stockKnown: apiCombo?.stock !== undefined && apiCombo?.stock !== null,
      canPurchase: apiCombo?.canPurchase ?? Number(combo.stock) > 0,
      description: apiCombo ? comboCartDescription(apiCombo) : combo.description || '',
      step: 1,
      cartKey: `combo:${path}`, cartItemType: 'Combo', cartRefId: apiCombo?.id || '',
    } : null
  }).filter(Boolean)
  const comboEntries = [...databaseComboEntries, ...legacyComboEntries]
  const comboDetailRoute = (id, name) => {
    const apiIndex = (availableCombos || []).findIndex((combo) => combo.id === id)
    if (apiIndex >= 0) {
      return `/imperfect/chi-tiet?comboId=${encodeURIComponent(id)}`
    }
    const normalizedName = normalizeLabel(name || '')
    const titleIndex = imperfectComboPaths.findIndex((_, index) => {
      const title = normalizeLabel(getImperfectCardData(index)?.title || '')
      return title && (title.includes(normalizedName) || normalizedName.includes(title))
    })
    return imperfectComboPaths[titleIndex >= 0 ? titleIndex : 0]
  }
  const localItems = entries.map(([id, quantity]) => {
    if (id.startsWith('farmBox:')) {
      const [, boxId, weekId] = id.split(':')
      const box = farmBoxes.find((item) => item.id === boxId)
      const week = box?.weeks?.find((item) => item.id === weekId)
      return {
        product: {
          id,
          name: box?.name || 'FarmBox đặt trước',
          image: box?.image || '',
          price: Number(week?.price ?? box?.price) || 0,
          unit: 'hộp',
          stock: Number(week?.available) || 0,
          stockKnown: week?.available !== undefined && week?.available !== null,
          canPurchase: week?.canPurchase ?? Number(week?.available) > 0,
          step: 1,
          route: `/farm-box/thuc-don?farmBoxId=${encodeURIComponent(boxId)}${weekId ? `&weekId=${encodeURIComponent(weekId)}` : ''}`,
          cartKey: id, cartItemType: 'FarmBox', cartRefId: boxId, cartWeekId: weekId, apiCartItem: false,
          description: box?.description || '5–7 loại rau củ theo mùa',
        },
        quantity: Number(quantity),
      }
    }
    return {
      product: products.find((item) => item.id === id)
        ? { ...products.find((item) => item.id === id), stockKnown: products.find((item) => item.id === id).stock !== undefined && products.find((item) => item.id === id).stock !== null, cartKey: id, cartItemType: 'Product', cartRefId: id, apiCartItem: false }
        : comboEntries.find((item) => item.id === id) || {
        id, name: `Mặt hàng trong giỏ (${id})`, image: '', price: 0, unit: '', route: `/nong-san/chi-tiet?productId=${encodeURIComponent(id)}`,
        cartKey: id, cartItemType: 'Product', cartRefId: id, apiCartItem: false,
        description: 'Đang đồng bộ thông tin mặt hàng từ máy chủ.',
      },
      quantity: Number(quantity),
    }
  })
  const apiItems = Array.isArray(serverCartItems) ? serverCartItems.map((item) => {
    const id = item.itemType === 'FarmBox' ? `farmBox:${item.id}:${item.weekId}` : item.itemType === 'Combo' ? `combo:${item.id}` : item.id
    const apiFarmBox = item.itemType === 'FarmBox' ? farmBoxes.find((box) => box.id === item.id) : null
    const combo = item.itemType === 'Combo' ? availableCombos.find((entry) => entry.id === item.id) : null
    const description = item.itemType === 'FarmBox'
      ? apiFarmBox?.description || '5–7 loại rau củ theo mùa'
      : item.itemType === 'Combo' ? comboCartDescription(combo) : ''
    return {
      product: {
        id,
        name: item.name || 'Mặt hàng trong giỏ',
        image: item.image || '',
        price: Number(item.unitPrice) || 0,
        unit: item.unit || (item.itemType === 'FarmBox' ? 'hộp' : item.itemType === 'Combo' ? 'combo' : ''),
        stock: Number(item.availableStock) || 0,
        stockKnown: item.availableStock !== undefined && item.availableStock !== null,
        canPurchase: item.canPurchase !== false,
        unavailableMessage: item.message || '',
        step: Number(item.step) || 1,
        priceUnitQuantity: Number(item.priceUnitQuantity) || Number(products.find((entry) => entry.id === item.id)?.priceUnitQuantity) || 0,
        harvestDate: item.harvestDate || products.find((entry) => entry.id === item.id)?.harvestDate || null,
        farm: item.farm || products.find((entry) => entry.id === item.id)?.farm || '',
        route: item.itemType === 'FarmBox'
          ? `/farm-box/thuc-don?farmBoxId=${encodeURIComponent(item.id)}${item.weekId ? `&weekId=${encodeURIComponent(item.weekId)}` : ''}`
          : item.itemType === 'Combo'
            ? comboDetailRoute(item.id, item.name)
            : `/nong-san/chi-tiet?productId=${encodeURIComponent(item.id)}`,
        cartKey: id, cartItemType: item.itemType, cartRefId: item.id, cartWeekId: item.weekId || '', apiCartItem: true,
        description,
      },
      quantity: Number(item.quantity) || 0,
    }
  }) : null
  const serverIds = new Set((apiItems || []).map(({ product }) => product.id))
  const mergedItems = apiItems
    ? [...apiItems, ...localItems.filter(({ product }) => product && !serverIds.has(product.id)
      && !apiItems.some((serverItem) => serverItem.product.name === product.name))]
    : localItems
  const availableItems = mergedItems.filter(({ product, quantity }) => product && quantity > 0)
  const invalidStockItems = availableItems.filter(({ product, quantity }) =>
    product.canPurchase === false || (product.stockKnown && (Number(product.stock) <= 0 || quantity > Number(product.stock))))

  if (countLabel) countLabel.textContent = `(${availableItems.length} mặt hàng)`
  if (!cartSection) return

  if (!availableItems.length) {
    cartSection.replaceChildren()
    const message = documentFromStitch.createElement('div')
    message.className = 'bg-surface-container-lowest p-8 rounded-xl shadow-sm text-center text-on-surface-variant'
    message.textContent = serverCartItems !== null || !entries.length ? 'Giỏ hàng của bạn đang trống.' : 'Đang tải sản phẩm trong giỏ hàng…'
    cartSection.append(message)
    if (summary) summary.classList.add('hidden')
    return
  }

  if (summary) summary.classList.remove('hidden')
  const template = cartSection.querySelector('article')
  if (!template) return
  const cardsByType = new Map([
    ['Product', { title: 'Nông sản', icon: 'eco', tone: 'green', cards: [] }],
    ['Combo', { title: 'Combo Imperfect', icon: 'local_fire_department', tone: 'orange', cards: [] }],
    ['FarmBox', { title: 'Farm Box', icon: 'inventory_2', tone: 'green', cards: [] }],
  ])
  availableItems.forEach(({ product, quantity }) => {
    const card = template.cloneNode(true)
    card.dataset.route = product.route || (String(product.id).startsWith('combo:')
      ? String(product.id).slice('combo:'.length)
      : `/nong-san/chi-tiet?productId=${encodeURIComponent(product.id)}`)
    card.className = 'bg-white px-3 py-2.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-[#e7eee6] last:border-b-0 cursor-pointer hover:bg-[#fbfdfb] transition-colors'
    card.setAttribute('role', 'link')
    card.setAttribute('tabindex', '0')
    card.setAttribute('aria-label', `Mở chi tiết ${product.name}`)
    const decreaseButton = card.querySelector('button[aria-label="Giảm lượng"]')
    const increaseButton = decreaseButton?.nextElementSibling?.nextElementSibling
    const removeButton = [...card.querySelectorAll('button')].find((button) => normalizeLabel(button.textContent).includes('xoa'))
    if (decreaseButton) decreaseButton.dataset.cartAction = 'decrease'
    if (increaseButton?.tagName === 'BUTTON') increaseButton.dataset.cartAction = 'increase'
    if (removeButton) removeButton.dataset.cartAction = 'remove'
    card.dataset.cartKey = product.cartKey || product.id
    card.dataset.cartItemType = product.cartItemType || 'Product'
    card.dataset.cartRefId = product.cartRefId || String(product.id).replace(/^combo:/, '')
    card.dataset.cartWeekId = product.cartWeekId || ''
    card.dataset.apiCartItem = product.apiCartItem ? 'true' : 'false'
    card.dataset.cartStock = String(Math.max(0, Number(product.stock) || 0))
    card.dataset.cartStep = String(Math.max(0.001, getProductQuantityStep(product)))
    card.dataset.cartUnit = product.unit || ''
    const itemType = product.cartItemType || 'Product'
    const stock = Math.max(0, Number(product.stock) || 0)
    const noStock = product.stockKnown && stock <= 0
    const exceedsStock = product.stockKnown && Number(quantity) > stock
    const unavailable = product.canPurchase === false || noStock || exceedsStock
    const lockQuantity = noStock || (product.canPurchase === false && !exceedsStock)
    const image = card.querySelector('img')
    if (image) {
      image.src = product.image || image.src
      image.alt = product.name
      image.className = 'w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-[#eef4ed]'
      if (unavailable) image.classList.add('opacity-55', 'grayscale')
    }
    const title = card.querySelector('h2')
    if (title) {
      title.textContent = product.name
      if (unavailable) title.classList.add('text-[#737b75]')
    }
    const description = card.querySelector('p')
    if (description) {
      description.className = 'text-[12px] leading-[18px] text-[#637166] mt-0.5'
      if (itemType === 'Product') {
        description.textContent = `${product.farm || 'Nông trại GreenNova'} · Thu hoạch: ${formatSaigonToday()}`
      } else {
        description.textContent = product.description || ''
      }
    }
    // Remove decorative labels and stock warnings from the Stitch example; the cart
    // shows the live item details and stock is enforced by the quantity controls.
    card.querySelectorAll('.text-error, h2 + div, h2 + p + p').forEach((element) => element.remove())
    const infoBlock = card.querySelector('.flex.flex-col.min-w-0')
    if (unavailable && title) {
      const status = documentFromStitch.createElement('span')
      status.className = 'mt-1 inline-flex w-fit items-center rounded-full bg-[#f0f1f0] px-2 py-0.5 text-[10px] font-medium text-[#7a817b]'
      status.textContent = noStock ? 'Hết hàng' : product.canPurchase === false && !exceedsStock ? 'Tạm ngưng' : 'Vượt tồn kho'
      title.after(status)
      const notice = documentFromStitch.createElement('p')
      notice.className = 'mt-0.5 text-[11px] leading-4 text-[#d93030]'
      notice.textContent = product.unavailableMessage || (noStock
        ? 'Mặt hàng này hiện không còn để đặt.'
        : exceedsStock ? `Chỉ còn ${stock} ${product.unit || ''}, vui lòng giảm số lượng.` : 'Mặt hàng hiện chưa thể đặt.')
      description?.after(notice)
    }
    const unitPrice = documentFromStitch.createElement('p')
    unitPrice.className = `text-[12px] leading-[18px] text-[#66736a] mt-0.5 ${noStock ? 'line-through opacity-70' : ''}`
    if (itemType === 'Product') {
      const priceQuantity = Number(product.priceUnitQuantity) || 1
      const formattedPriceQuantity = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(priceQuantity)
      unitPrice.textContent = `Đơn giá: ${money(product.price)}/${formattedPriceQuantity}${product.unit || 'kg'}`
    } else {
      unitPrice.textContent = `Đơn giá: ${money(product.price)} / ${itemType === 'Combo' ? 'combo' : 'hộp'}`
    }
    if (itemType === 'FarmBox') {
      const receiveLabel = documentFromStitch.createElement('span')
      receiveLabel.className = 'mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[#e5f1e6] px-2 py-1 text-[11px] font-medium leading-4 text-[#176238]'
      receiveLabel.innerHTML = '<span class="material-symbols-outlined text-[14px]">calendar_today</span>'
      receiveLabel.append(documentFromStitch.createTextNode(farmBoxReceiveLabel()))
      infoBlock?.append(receiveLabel)
    }
    infoBlock?.append(unitPrice)
    card.querySelector('.text-error')?.remove()
    const quantityLabel = card.querySelector('button[aria-label="Giảm lượng"]')?.nextElementSibling
    if (quantityLabel) quantityLabel.textContent = `${quantity} ${product.unit}`
    if (decreaseButton) decreaseButton.disabled = Number(quantity) <= Number(card.dataset.cartStep)
    if (lockQuantity) {
      decreaseButton && (decreaseButton.disabled = true)
      increaseButton && (increaseButton.disabled = true)
      const stepper = decreaseButton?.parentElement
      stepper?.classList.add('opacity-50', 'cursor-not-allowed')
    }
    const linePrice = card.querySelector('.text-right span')
    if (linePrice) {
      linePrice.textContent = money(product.price * quantity)
      linePrice.className = `text-[15px] font-bold ${noStock ? 'text-[#8b918c] line-through' : unavailable ? 'text-[#8b918c]' : 'text-[#14753a]'} block whitespace-nowrap`
      if (noStock) {
        const actualPrice = documentFromStitch.createElement('span')
        actualPrice.className = 'mt-0.5 block text-[11px] font-medium text-[#d93030] no-underline'
        actualPrice.textContent = '0đ'
        linePrice.after(actualPrice)
      }
    }
    const quantityBlock = card.querySelector('.h-11')
    quantityBlock?.classList.add('!h-8', '!bg-[#eef6ed]', '!rounded-lg', '!gap-1')
    const stepperButtons = quantityBlock?.querySelectorAll('button') || []
    stepperButtons.forEach((button) => button.classList.add('!w-7', '!h-7', '!bg-white', '!rounded-md'))
    if (quantityLabel) quantityLabel.className = 'text-[12px] font-semibold text-[#243229] px-1 min-w-[24px] text-center'
    const removeLabel = [...card.querySelectorAll('button')].find((button) => button.dataset.cartAction === 'remove')
    if (removeLabel) {
      removeLabel.className = `flex items-center justify-center gap-1 p-1 ${unavailable ? 'text-[#d93030] hover:text-[#b42318]' : 'text-[#6a786e] hover:text-red-600'}`
      if (unavailable) {
        const removeText = removeLabel.querySelector('span:last-child')
        if (removeText) removeText.textContent = 'Xóa khỏi giỏ'
      } else {
        removeLabel.querySelector('span:last-child')?.remove()
      }
    }
    card.id = `cart-product-${product.id}`
    const type = product.cartItemType || 'Product'
    ;(cardsByType.get(type) || cardsByType.get('Product')).cards.push(card)
  })
  const groups = [...cardsByType.entries()].filter(([, group]) => group.cards.length).map(([type, group]) => {
    const section = documentFromStitch.createElement('section')
    section.className = 'overflow-hidden rounded-xl border border-[#dce7dc] bg-white'
    section.setAttribute('aria-label', group.title)
    const heading = documentFromStitch.createElement('div')
    heading.className = `h-9 px-3 flex items-center justify-between ${group.tone === 'orange' ? 'bg-[#fbf1e9]' : 'bg-[#edf6ee]'}`
    const headingTitle = documentFromStitch.createElement('h2')
    headingTitle.className = 'flex items-center gap-1.5 text-[12px] font-semibold text-[#29372d]'
    headingTitle.innerHTML = `<span class="material-symbols-outlined text-[15px] ${group.tone === 'orange' ? 'text-[#d76b14]' : 'text-[#267746]'}">${group.icon}</span>${group.title}`
    heading.append(headingTitle)
    if (type === 'Combo') {
      const tag = documentFromStitch.createElement('span')
      tag.className = 'rounded-full bg-[#f6dfcb] px-2 py-0.5 text-[9px] font-medium text-[#a45313]'
      tag.textContent = 'Giảm lãng phí thực phẩm'
      heading.append(tag)
    } else if (type === 'FarmBox') {
      const tag = documentFromStitch.createElement('span')
      tag.className = 'rounded-full bg-[#e5efe2] px-2 py-0.5 text-[9px] font-medium text-[#526b4f]'
      tag.textContent = 'Gói đăng ký tuần'
      heading.append(tag)
    }
    section.append(heading, ...group.cards)
    if (type === 'FarmBox') {
      const note = documentFromStitch.createElement('p')
      note.className = 'px-3 py-1.5 text-[9px] italic text-[#738176]'
      note.textContent = 'ⓘ Nội dung hộp có thể thay đổi nhẹ theo nguồn cung.'
      section.append(note)
    }
    return section
  })
  cartSection.classList.remove('gap-space-md')
  cartSection.classList.add('gap-3')
  if (invalidStockItems.length) {
    const warning = documentFromStitch.createElement('div')
    warning.dataset.cartStockWarning = 'true'
    warning.setAttribute('role', 'alert')
    warning.className = 'flex items-center gap-2 rounded-lg border border-[#f3a2a2] bg-[#fff7f7] px-3 py-2.5 text-[11px] leading-4 text-[#d93030]'
    warning.innerHTML = '<span class="material-symbols-outlined text-[15px]">warning</span><span>Vui lòng xóa hoặc chỉnh mặt hàng hết hàng trước khi thanh toán.</span>'
    groups.push(warning)
  }
  cartSection.replaceChildren(...groups)

  const subtotal = availableItems
    .filter(({ product, quantity }) => product.canPurchase !== false
      && !(product.stockKnown && (Number(product.stock) <= 0 || Number(quantity) > Number(product.stock))))
    .reduce((sum, { product, quantity }) => sum + product.price * quantity, 0)
  const shippingFee = subtotal >= 300000 ? 0 : 30000
  const grandTotal = subtotal + shippingFee
  if (summary) {
    summary.className = 'lg:col-span-4 sticky top-24 self-start overflow-hidden rounded-xl border border-[#dce7dc] bg-white shadow-[0_2px_8px_rgba(27,69,39,0.12)]'
    summary.innerHTML = `<div class="px-5 pt-5 pb-4"><h2 class="text-[18px] font-bold text-[#26372b]">Tóm tắt đơn hàng</h2><div class="mt-4 space-y-2.5 text-[12px] text-[#637166]"><div class="flex items-center justify-between gap-3"><span>Tạm tính</span><strong class="font-semibold text-[#26372b]">${money(subtotal)}</strong></div><div class="flex items-center justify-between gap-3"><span>Phí giao hàng</span><span class="text-right">${shippingFee ? money(shippingFee) : 'Miễn phí'}</span></div></div><div class="mt-4 flex items-start gap-2 rounded-lg bg-[#e6f1e7] px-3 py-2.5 text-[10px] leading-[15px] text-[#176238]"><span class="material-symbols-outlined text-[15px]">local_shipping</span><span>${shippingFee ? `Đơn từ 300.000đ được miễn phí giao hàng. Còn thiếu ${money(300000 - subtotal)} để được miễn phí.` : 'Đơn hàng từ 300.000đ được miễn phí giao hàng.'}</span></div></div><div class="border-t border-[#e2e9e1] bg-[#f8f9f3] px-5 py-4"><div class="flex items-center justify-between gap-3"><span class="text-[14px] font-bold text-[#26372b]">Tổng tiền</span><strong class="text-[22px] font-bold leading-7 text-[#16753b]">${money(grandTotal)}</strong></div><div class="mt-3 rounded-lg bg-[#e6f1e7] px-3 py-2.5 text-[10px] leading-[15px] text-[#52645a]"><span class="material-symbols-outlined mr-1 align-middle text-[14px] text-[#176238]">lock</span>${authUser ? 'Thông tin giỏ hàng được lưu trong tài khoản của bạn.' : 'Bạn cần đăng nhập để đặt hàng. Giỏ hàng của bạn sẽ được giữ lại sau khi đăng nhập.'}</div>${authUser ? `<a href="/checkout" data-route="/checkout" class="mt-3 flex h-10 w-full items-center justify-center rounded-lg bg-[#1b723b] text-[12px] font-semibold text-white no-underline hover:bg-[#14572d] ${invalidStockItems.length ? 'pointer-events-none opacity-50' : ''}">Tiến hành đặt hàng</a>` : `<a href="/login?returnTo=%2Fcheckout" data-route="/login?returnTo=%2Fcheckout" class="mt-3 flex h-10 w-full items-center justify-center rounded-lg bg-[#1b723b] text-[12px] font-semibold text-white no-underline hover:bg-[#14572d]">Đăng nhập để thanh toán</a><p class="mt-3 text-center text-[10px] text-[#718077]">Chưa có tài khoản? <a href="/register" data-route="/register" class="font-semibold text-[#16753b]">Đăng ký</a></p>`}<p class="mt-3 text-center text-[10px] leading-[15px] text-[#718077]">Thêm vào giỏ chưa tính phí. Hàng sẽ được giữ khi bạn đặt đơn.</p></div><div class="border-t border-[#e2e9e1] px-4 py-2.5 text-center text-[10px] text-[#53695a]"><span class="text-[#19753c]">♧</span> Bảo trợ nông hộ <span class="mx-1">•</span> <span class="text-[#19753c]">✓</span> 100% Bao bì giấy</div>`
  }
}

function formatChartValue(value, metric, compact = false) {
  if (metric === 'revenue') {
    if (compact && value >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M`
    }
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value) + 'đ'
  }
  const formatted = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value)
  if (metric === 'orders') return compact ? formatted : `${formatted} đơn`
  return `${formatted} kg`
}

function applyWeeklyChart(documentFromStitch, route, weeklyData, selectedMetric) {
  if (route.path !== '/admin' && !route.folder.startsWith('qt01')) return

  const heading = [...documentFromStitch.body.querySelectorAll('h2')]
    .find((element) => element.textContent.includes('Biểu đồ doanh thu tuần qua'))
  if (!heading) return
  let chartCard = heading
  while (chartCard.parentElement && !chartCard.querySelector('.grid-cols-7')) chartCard = chartCard.parentElement
  const barGrid = chartCard.querySelector('.grid-cols-7')
  if (!barGrid) return
  chartCard.querySelectorAll('div').forEach((element) => {
    if (!element.children.length && element.textContent.trim() === 'Peak Box Day') element.remove()
  })

  const days = weeklyData?.days || Array.from({ length: 7 }, (_, index) => ({
    date: '', revenue: 0, orders: 0, kilograms: 0,
  }))
  const valueKey = selectedMetric === 'orders' ? 'orders' : selectedMetric === 'kilograms' ? 'kilograms' : 'revenue'
  const values = days.map((day) => Number(day[valueKey]) || 0)
  const total = Number(weeklyData?.totals?.[valueKey]) || 0
  const maxValue = Math.max(...values)
  const scaleMax = maxValue > 0 ? maxValue * 1.15 : 1
  const peakIndex = weeklyData && maxValue > 0 ? values.indexOf(maxValue) : -1
  const palettes = {
    revenue: { light: [213, 232, 210], dark: [0, 88, 40] },
    orders: { light: [203, 232, 222], dark: [0, 105, 82] },
    kilograms: { light: [224, 235, 196], dark: [83, 119, 25] },
  }
  const palette = palettes[selectedMetric] || palettes.revenue
  const peakDescriptions = {
    revenue: 'Đỉnh doanh thu tuần',
    orders: 'Ngày nhiều đơn nhất',
    kilograms: 'Đỉnh khối lượng tuần',
  }
  const weekRange = [...chartCard.querySelectorAll('span')]
    .find((element) => /^\d{1,2}\/\d{1,2}\s*-\s*\d{1,2}\/\d{1,2}$/.test(element.textContent.trim()))
  if (weekRange && weeklyData?.weekStart && weeklyData?.weekEnd) {
    const shortDate = (value) => value.split('-').slice(1).reverse().join('/')
    weekRange.textContent = `${shortDate(weeklyData.weekStart)} - ${shortDate(weeklyData.weekEnd)}`
  }

  const summary = chartCard.querySelector('span.font-headline-lg')
  if (summary) summary.textContent = weeklyData ? formatChartValue(total, selectedMetric) : 'Đang tải…'
  const comparison = [...chartCard.querySelectorAll('span')]
    .find((element) => element.textContent.includes('+18.4%'))
  comparison?.remove()

  const labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
  const today = getLocalDateString(new Date())
  const columns = [...barGrid.children]
  columns.forEach((column, index) => {
    const valueLabel = column.querySelector(':scope > span')
    const bar = [...column.children].find((element) => element.tagName === 'DIV' && element.style.height)
    const dayLabel = column.lastElementChild
    const value = values[index] || 0
    const isToday = days[index]?.date === today
    const isPeak = index === peakIndex
    if (valueLabel) {
      valueLabel.textContent = weeklyData ? formatChartValue(value, selectedMetric, true) : '—'
      valueLabel.classList.remove('group-hover:opacity-100')
      valueLabel.classList.toggle('opacity-0', !isPeak)
      valueLabel.classList.toggle('opacity-100', isPeak)
      valueLabel.classList.remove('text-on-primary', 'bg-primary', 'text-primary-container', 'bg-secondary-container')
      valueLabel.classList.toggle('bg-primary', isPeak)
      valueLabel.classList.toggle('text-on-primary', isPeak)
      valueLabel.classList.toggle('bg-surface-container-high', !isPeak)
      valueLabel.classList.toggle('text-on-surface', !isPeak)
    }
    if (bar) {
      bar.style.height = maxValue ? `${Math.max(value ? 3 : 0, value / scaleMax * 100)}%` : '0%'
      const color = isPeak ? palette.dark : palette.light
      bar.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      bar.style.backgroundImage = 'none'
      bar.style.boxShadow = isPeak ? '0 0 0 4px rgba(0, 88, 40, 0.18)' : 'none'
      bar.classList.remove('bg-primary', 'bg-primary-container', 'bg-secondary-fixed-dim', 'bg-surface-container-highest', 'bg-gradient-to-t', 'from-primary', 'to-primary-container', 'ring-4', 'ring-primary/20')
      bar.classList.toggle('relative', isPeak)
      bar.querySelector('.weekly-peak-tooltip')?.remove()
      if (isPeak) {
        const tooltip = documentFromStitch.createElement('div')
        tooltip.className = 'weekly-peak-tooltip absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap hidden group-hover:block bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-0.5 rounded shadow z-20'
        tooltip.textContent = peakDescriptions[selectedMetric] || 'Đỉnh tuần'
        bar.append(tooltip)
      }
    }
    if (dayLabel) {
      const dot = dayLabel.querySelector('span')
      dayLabel.textContent = labels[index]
      if (isToday) {
        dayLabel.classList.add('text-primary', 'font-bold')
        dayLabel.classList.remove('text-on-surface-variant')
        const todayDot = documentFromStitch.createElement('span')
        todayDot.className = 'w-1.5 h-1.5 rounded-full bg-primary inline-block ml-1'
        dayLabel.append(todayDot)
      } else {
        dayLabel.classList.remove('text-primary', 'font-bold')
        dayLabel.classList.add('text-on-surface-variant')
        dot?.remove()
      }
    }
  })

  const axisRows = [...(chartCard.querySelector('.absolute.inset-x-0.inset-y-0')?.children || [])]
  axisRows.forEach((row, index) => {
    const label = row.querySelector('span')
    if (!label) return
    const value = scaleMax * (1 - index / Math.max(1, axisRows.length - 1))
    label.textContent = formatChartValue(value, selectedMetric)
  })

  const tabs = [...chartCard.querySelectorAll('button')]
    .filter((button) => ['doanh thu', 'số đơn hàng', 'khối lượng (kg)'].includes(button.textContent.trim().toLocaleLowerCase('vi-VN')))
  tabs.forEach((button) => {
    const label = button.textContent.trim().toLocaleLowerCase('vi-VN')
    const metric = label === 'doanh thu' ? 'revenue' : label === 'số đơn hàng' ? 'orders' : 'kilograms'
    button.dataset.weeklyMetric = metric
    const active = metric === selectedMetric
    button.classList.toggle('bg-surface-container-lowest', active)
    button.classList.toggle('text-primary', active)
    button.classList.toggle('font-bold', active)
    button.classList.toggle('shadow-sm', active)
    button.classList.toggle('text-on-surface-variant', !active)
  })
}

function applyWeeklySalesMix(documentFromStitch, route, weeklyData) {
  if (route.path !== '/admin' && !route.folder.startsWith('qt01')) return

  const heading = [...documentFromStitch.body.querySelectorAll('h2')]
    .find((element) => element.textContent.trim() === 'Tỷ trọng bán hàng')
  if (!heading) return
  let card = heading
  const hasDonutAndBreakdown = (element) => {
    const hasDonut = Boolean(element.querySelector('svg circle[stroke-dasharray]'))
    const labels = [...element.querySelectorAll('span')].map((span) => span.textContent.trim())
    const hasBreakdown = labels.includes('Rau lá hữu cơ VietGAP')
      && labels.includes('Củ quả canh tác sạch')
      && labels.includes('Trái cây đặc sản')
    return hasDonut && hasBreakdown
  }
  while (card.parentElement && !hasDonutAndBreakdown(card)) card = card.parentElement
  const svg = card.querySelector('svg')
  if (!svg) return

  const categories = weeklyData?.categoryRevenue || [
    { key: 'leafy', name: 'Rau lá hữu cơ VietGAP', revenue: 0 },
    { key: 'produce', name: 'Củ quả canh tác sạch', revenue: 0 },
    { key: 'fruit', name: 'Trái cây đặc sản', revenue: 0 },
    { key: 'farmBox', name: 'FarmBox', revenue: 0 },
    { key: 'imperfect', name: 'Combo Imperfect', revenue: 0 },
  ]
  const total = Number(weeklyData?.categoryRevenueTotal) || 0
  const colors = {
    leafy: '#1B723B',
    produce: '#48A169',
    fruit: '#E08A26',
    farmBox: '#3B82A0',
    imperfect: '#C25E2E',
  }
  const percentages = categories.map((category) => total ? Number(category.revenue) / total * 100 : 0)
  const wholePercentages = percentages.map(Math.floor)
  let remaining = total ? 100 - wholePercentages.reduce((sum, value) => sum + value, 0) : 0
  const remainderOrder = percentages.map((value, index) => ({ index, remainder: value - wholePercentages[index] }))
    .sort((first, second) => second.remainder - first.remainder)
  for (let index = 0; index < remaining; index += 1) {
    wholePercentages[remainderOrder[index % remainderOrder.length].index] += 1
  }

  const circumference = 2 * Math.PI * 38
  let consumed = 0
  let segments = [...svg.querySelectorAll('circle[stroke-dasharray]')]
  while (segments.length < categories.length && segments.length) {
    const segment = segments.at(-1).cloneNode(true)
    svg.append(segment)
    segments.push(segment)
  }
  while (segments.length > categories.length) segments.pop().remove()
  segments.forEach((segment, index) => {
    const value = Number(categories[index]?.revenue) || 0
    const length = total ? circumference * value / total : 0
    segment.setAttribute('stroke', colors[categories[index]?.key] || colors.leafy)
    segment.setAttribute('stroke-dasharray', `${length} ${circumference - length}`)
    segment.setAttribute('stroke-dashoffset', `${-consumed}`)
    consumed += length
  })

  const centerTotal = [...card.querySelectorAll('span')]
    .find((element) => element.textContent.trim() === '100%')
  if (centerTotal) centerTotal.textContent = total > 0 ? '100%' : '0%'

  const originalRows = [
    ['Rau lá hữu cơ VietGAP', 'leafy'],
    ['Củ quả canh tác sạch', 'produce'],
    ['Trái cây đặc sản', 'fruit'],
    ['Combo Imperfect', 'imperfect'],
  ].map(([label, key]) => {
    const name = [...card.querySelectorAll('span')].find((element) => element.textContent.trim() === label)
    const row = name?.closest('div.flex.items-center.justify-between')
    if (row) row.dataset.weeklyCategory = key
    return [key, row]
  })
  const rowsByKey = new Map(originalRows.filter(([, row]) => row))
  const fruitRow = rowsByKey.get('fruit')
  const comboRow = rowsByKey.get('imperfect')
  if (fruitRow && comboRow && !card.querySelector('[data-weekly-category="farmBox"]')) {
    const farmBoxRow = fruitRow.cloneNode(true)
    farmBoxRow.dataset.weeklyCategory = 'farmBox'
    const name = [...farmBoxRow.querySelectorAll('span')]
      .find((element) => element.classList.contains('font-medium'))
    if (name) name.textContent = 'FarmBox'
    const small = [...farmBoxRow.querySelectorAll('span')].find((element) => element.classList.contains('text-[11px]'))
    if (small) small.textContent = 'Doanh thu FarmBox tuần này'
    comboRow.before(farmBoxRow)
    rowsByKey.set('farmBox', farmBoxRow)
  }

  categories.forEach((category, index) => {
    const row = rowsByKey.get(category.key)
    if (!row) return
    const name = [...row.querySelectorAll('span')].find((element) => element.classList.contains('font-medium'))
    if (name) name.textContent = category.name
    const swatch = row.querySelector('span.rounded-full')
    if (swatch) swatch.style.backgroundColor = colors[category.key] || colors.leafy
    const figures = [...(row.lastElementChild?.querySelectorAll('span') || [])]
    if (figures[0]) figures[0].textContent = `${wholePercentages[index] || 0}%`
    if (figures[1]) figures[1].textContent = money(Number(category.revenue) || 0)
    if (category.key === 'imperfect') {
      const detail = [...row.querySelectorAll('span')].find((element) => element.textContent.includes('Giải cứu'))
      if (detail) detail.textContent = 'Doanh thu combo tuần này'
    }
  })
}

function isAdminOrdersScreen(route) {
  return route.path === '/admin/orders'
    || route.folder.startsWith('qt05_qu_n_l_n_h_ng')
    || route.folder.startsWith('qt06_qu_n_l_n_h_ng')
}

function applyAdminWeeklyOrderSummary(documentFromStitch, route, weeklyData, errorMessage = '') {
  if (!isAdminOrdersScreen(route)) return

  const setText = (selector, value, fallback = '—') => {
    const element = documentFromStitch.querySelector(selector)
    if (element) element.textContent = value === null || value === undefined ? fallback : String(value)
  }
  const formatDate = (value) => {
    const date = new Date(`${value}T00:00:00+07:00`)
    return Number.isNaN(date.getTime())
      ? ''
      : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  if (!weeklyData) {
    setText('[data-admin-week-orders-count]', '—')
    setText('[data-admin-week-revenue]', errorMessage || 'Đang tải…')
    setText('[data-admin-week-paid-count]', '—')
    setText('[data-admin-week-paid-breakdown]', errorMessage || 'Đang tải số liệu thanh toán…')
    setText('[data-admin-week-pending-count]', '—')
    setText('[data-admin-week-transit-count]', '—')
    return
  }

  setText('[data-admin-week-orders-count]', Number(weeklyData.totalOrders) || 0)
  setText('[data-admin-week-revenue]', `${(Number(weeklyData.totals?.revenue) || 0).toLocaleString('vi-VN')}đ`)
  setText('[data-admin-week-paid-count]', Number(weeklyData.paidOrderCount) || 0)
  setText('[data-admin-week-paid-breakdown]', `${Number(weeklyData.paidBankTransferCount) || 0} chuyển khoản · ${Number(weeklyData.paidCodCount) || 0} COD đã thanh toán`)
  setText('[data-admin-week-pending-count]', Number(weeklyData.pendingPaymentOrderCount) || 0)
  setText('[data-admin-week-transit-count]', Number(weeklyData.inTransitOrderCount) || 0)

  if (weeklyData.weekStart && weeklyData.weekEnd) {
    const lastDate = new Date(`${weeklyData.weekEnd}T00:00:00+07:00`)
    const year = Number.isNaN(lastDate.getTime()) ? '' : `/${lastDate.getFullYear()}`
    setText('[data-admin-orders-week-label]', `Tuần này, ${formatDate(weeklyData.weekStart)} – ${formatDate(weeklyData.weekEnd)}${year}`)
  }

  const tabs = {
    all: weeklyData.totalOrders,
    pending: weeklyData.pendingPaymentOrderCount,
    paid: weeklyData.paidOrderCount,
    transit: weeklyData.inTransitOrderCount,
    delivered: weeklyData.deliveredOrderCount,
  }
  const labels = {
    all: 'Tất cả',
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán / Chờ đóng gói',
    transit: 'Đang giao xe lạnh',
    delivered: 'Đã giao thành công',
  }
  Object.entries(tabs).forEach(([key, count]) => {
    setText(`[data-admin-week-tab-count="${key}"]`, `${labels[key]} (${Number(count) || 0})`)
  })
}

function applyAdminWeeklyOrderRows(documentFromStitch, route, weeklyOrders, errorMessage = '', selectedPage = 1, selectedFilter = 'all') {
  if (!isAdminOrdersScreen(route)) return
  const tableBody = documentFromStitch.querySelector('[data-admin-week-orders]')
  if (!tableBody) return

  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
  const originalRows = [...tableBody.querySelectorAll('tr')]
  const templates = {
    farmBox: originalRows.find((row) => normalizeLabel(row.textContent).includes('farm box')) || originalRows[0],
    imperfect: originalRows.find((row) => normalizeLabel(row.textContent).includes('imperfect')) || originalRows[1] || originalRows[0],
    produce: originalRows.find((row) => normalizeLabel(row.textContent).includes('nong san le')) || originalRows[2] || originalRows[0],
  }
  const tabLabels = {
    all: 'Tất cả',
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán / Chờ đóng gói',
    transit: 'Đang giao xe lạnh',
    delivered: 'Đã giao thành công',
  }
  const matchesTab = (order, key) => {
    if (key === 'pending') return order.status === 'Chờ thanh toán'
    if (key === 'paid') return ['Đã thanh toán', 'Đang xử lý'].includes(order.status)
    if (key === 'transit') return order.status === 'Đang giao'
    if (key === 'delivered') return order.status === 'Đã nhận'
    return true
  }
  const updateTabs = (counts) => Object.entries(tabLabels).forEach(([key, label]) => {
    const countElement = documentFromStitch.querySelector(`[data-admin-week-tab-count="${key}"]`)
    if (!countElement) return
    countElement.textContent = `${label} (${counts[key] ?? 0})`
    const tabButton = countElement.closest('button')
    if (!tabButton) return
    tabButton.dataset.adminWeekTab = key
    const active = selectedFilter === key
    tabButton.classList.remove('bg-primary-container', 'text-on-primary', 'text-tertiary-container', 'text-on-surface-variant', 'shadow-sm', 'hover:bg-tertiary-fixed', 'hover:bg-secondary-container', 'hover:text-primary', 'hover:bg-surface-container')
    if (active) tabButton.classList.add('bg-primary-container', 'text-on-primary', 'shadow-sm')
    else tabButton.classList.add('bg-surface-container-low', key === 'pending' ? 'text-tertiary-container' : 'text-on-surface-variant')
  })
  if (weeklyOrders === null) {
    updateTabs({ all: '—', pending: '—', paid: '—', transit: '—', delivered: '—' })
    tableBody.innerHTML = `<tr><td colspan="9" class="py-8 px-4 text-center text-on-surface-variant">${escape(errorMessage || 'Đang tải đơn hàng trong tuần…')}</td></tr>`
    return
  }
  const counts = { all: weeklyOrders.length }
  for (const key of ['pending', 'paid', 'transit', 'delivered']) counts[key] = weeklyOrders.filter((order) => matchesTab(order, key)).length
  updateTabs(counts)
  if (!weeklyOrders.length) {
    tableBody.innerHTML = '<tr><td colspan="9" class="py-8 px-4 text-center text-on-surface-variant">Tuần này chưa có đơn hàng.</td></tr>'
    renderAdminOrderPagination(documentFromStitch, 0, 1)
    return
  }

  const money = (value) => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`
  const formatDateTime = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return { time: '—', date: '—' }
    return {
      time: date.toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false }),
      date: date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }),
    }
  }
  const rows = weeklyOrders.filter((order) => matchesTab(order, selectedFilter))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="9" class="py-8 px-4 text-center text-on-surface-variant">Không có đơn hàng ở trạng thái này trong tuần.</td></tr>'
    renderAdminOrderPagination(documentFromStitch, 0, 1)
    return
  }
  const totalPages = Math.max(1, Math.ceil(rows.length / 5))
  const currentPage = Math.max(1, Math.min(Number(selectedPage) || 1, totalPages))
  const pageRows = rows.slice((currentPage - 1) * 5, currentPage * 5)
  const renderedRows = pageRows.map((order) => {
    const items = Array.isArray(order.items) ? order.items : []
    const hasFarmBox = items.some((item) => item.itemType === 'FarmBox')
    const hasImperfect = items.some((item) => item.itemType === 'Combo')
    const typeLabel = hasFarmBox ? 'Farm Box' : hasImperfect ? 'Imperfect' : 'Nông sản'
    const { time, date } = formatDateTime(order.createdAt)
    const isCancelled = order.status === 'Đã hủy'
    const isPaid = order.payment?.status === 'Đã thanh toán'
      || (order.paymentMethod !== 'CashOnDelivery' && ['Đã thanh toán', 'Đang xử lý', 'Đang giao', 'Đã nhận'].includes(order.status))
    const template = hasFarmBox ? templates.farmBox : hasImperfect ? templates.imperfect : templates.produce
    const row = template.cloneNode(true)
    const cells = row.querySelectorAll(':scope > td')
    if (cells.length < 9) return row
    row.querySelector('input[type="checkbox"]')?.removeAttribute('checked')
    const checkbox = cells[0].querySelector('input[type="checkbox"]')
    if (checkbox) {
      checkbox.checked = false
      checkbox.dataset.adminWeekOrderSelect = order.id || ''
      checkbox.setAttribute('aria-label', `Chọn đơn ${order.orderCode || order.id}`)
    }

    const code = order.orderCode || order.id || '—'
    cells[1].querySelector('span')?.replaceChildren(`#${code}`)
    const typeBadge = cells[1].querySelectorAll('span')[1]
    if (typeBadge) {
      typeBadge.textContent = typeLabel
      typeBadge.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'bg-amber-100', 'text-amber-800', 'bg-emerald-100', 'text-emerald-800')
      if (hasFarmBox) typeBadge.classList.add('bg-secondary-container', 'text-on-secondary-container')
      else if (hasImperfect) typeBadge.classList.add('bg-amber-100', 'text-amber-800')
      else typeBadge.classList.add('bg-emerald-100', 'text-emerald-800')
    }

    const dateCell = cells[2].querySelectorAll('div')
    if (dateCell[0]) dateCell[0].textContent = time
    if (dateCell[1]) dateCell[1].textContent = date

    const buyerCell = cells[3].querySelectorAll('span')
    if (buyerCell[0]) buyerCell[0].textContent = order.receiver?.name || 'Khách hàng'
    if (buyerCell[1]) buyerCell[1].textContent = `${order.receiver?.phone || '—'}${order.province ? ` • ${order.province}` : ''}`

    const itemCell = cells[4].querySelectorAll('span')
    const itemSummary = items.map((item) => `${item.name || 'Sản phẩm'} × ${Number(item.quantity) || 0}${item.itemType === 'FarmBox' ? ' hộp' : ''}`)
    if (itemCell[0]) itemCell[0].textContent = isCancelled ? 'Đơn đã hủy' : (itemSummary[0] || '—')
    if (itemCell[1]) itemCell[1].textContent = isCancelled ? '' : (itemSummary.length > 1 ? itemSummary.slice(1, 3).join(' · ') : '')

    const amountCell = cells[5].querySelectorAll('span')
    if (amountCell[0]) amountCell[0].textContent = money(order.totalAmount)
    if (amountCell[1]) amountCell[1].textContent = Number(order.shippingFee) > 0 ? `+ Ship ${money(order.shippingFee)}` : '+ Ship 0đ'
    const methodCell = cells[6].querySelector('span')
    if (methodCell) methodCell.textContent = order.paymentMethod === 'CashOnDelivery' ? 'Tiền mặt (COD)' : 'Chuyển khoản (VietQR)'

    const statusBadge = cells[7].querySelector('span')
    if (statusBadge) {
      const statusDot = statusBadge.querySelector('span')
      statusBadge.classList.remove('bg-secondary-container', 'text-primary', 'bg-amber-100', 'text-amber-800', 'bg-error-container', 'text-error')
      if (isCancelled) {
        statusBadge.classList.add('bg-error-container', 'text-error')
        if (statusDot) statusDot.className = 'w-1.5 h-1.5 rounded-full bg-error'
        statusBadge.lastChild.textContent = 'Đã hủy'
      } else if (isPaid) {
        statusBadge.classList.add('bg-secondary-container', 'text-primary')
        if (statusDot) statusDot.className = 'w-1.5 h-1.5 rounded-full bg-primary'
        statusBadge.lastChild.textContent = 'Đã xác nhận thanh toán'
      } else {
        statusBadge.classList.add('bg-amber-100', 'text-amber-800')
        if (statusDot) statusDot.className = 'w-1.5 h-1.5 rounded-full bg-amber-600'
        statusBadge.lastChild.textContent = order.status === 'Chờ thanh toán' ? 'Chờ thanh toán' : 'Chờ xử lý'
      }
    }

    const isCod = order.paymentMethod === 'CashOnDelivery'
    const actionCell = cells[8]
    const actionClass = 'h-8 px-3 rounded-lg bg-primary text-on-primary hover:bg-[#0D5C2C] font-label-md text-label-md font-semibold transition-colors shadow-sm inline-flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed'
    const callClass = 'h-8 px-3 rounded-lg border border-outline/40 hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors inline-flex items-center justify-center gap-1 disabled:opacity-60'
    if (isCancelled) {
      actionCell.innerHTML = '<span class="inline-flex items-center rounded-full bg-error-container px-3 py-1 text-error font-semibold">Đơn đã hủy</span>'
    } else if (order.status === 'Đã nhận') {
      actionCell.innerHTML = '<span class="inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-primary font-semibold">Đã giao</span>'
    } else if (order.status === 'Đang giao') {
      const dueLabel = order.deliveryDueAt ? ` title="Dự kiến tự cập nhật lúc ${escape(new Date(order.deliveryDueAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }))}"` : ''
      actionCell.innerHTML = `<span class="inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-primary font-semibold"${dueLabel}>Đang giao</span>`
    } else if (isCod) {
      actionCell.innerHTML = `<div class="flex flex-col items-stretch gap-1.5">
        <button class="${callClass}" data-admin-order-action="confirm-call" data-order-id="${escape(order.id)}" type="button"><span class="material-symbols-outlined text-[16px] text-secondary">phone_in_talk</span><span>${order.phoneConfirmedAt ? 'Đã xác nhận gọi điện' : 'Xác nhận gọi điện'}</span></button>
        <button class="${actionClass}" data-admin-order-action="approve-delivery" data-order-id="${escape(order.id)}" type="button"><span class="material-symbols-outlined text-[16px]">local_shipping</span><span>Duyệt &amp; Giao xe</span></button>
      </div>`
    } else {
      const canApprove = isPaid || order.status === 'Đang xử lý'
      actionCell.innerHTML = `<button class="${actionClass}" data-admin-order-action="approve-delivery" data-order-id="${escape(order.id)}" type="button" ${canApprove ? '' : 'disabled title="Cần xác nhận thanh toán trước khi duyệt giao"'}><span class="material-symbols-outlined text-[16px]">local_shipping</span><span>Duyệt &amp; Giao xe</span></button>`
    }
    return row
  })
  tableBody.replaceChildren(...renderedRows)
  renderAdminOrderPagination(documentFromStitch, rows.length, currentPage)
}

function renderAdminOrderPagination(documentFromStitch, totalOrders, currentPage) {
  const range = documentFromStitch.querySelector('[data-admin-orders-range]')
  if (range) {
    const start = totalOrders ? (currentPage - 1) * 5 + 1 : 0
    const end = Math.min(currentPage * 5, totalOrders)
    const values = range.querySelectorAll('strong')
    if (values[0]) values[0].textContent = totalOrders ? `${start} - ${end}` : '0'
    if (values[1]) values[1].textContent = String(totalOrders)
    const text = [...range.childNodes].find((node) => node.nodeType === 3 && node.textContent.includes('đơn hàng'))
    if (text) text.textContent = ' đơn hàng trong tuần này'
  }

  const pagination = documentFromStitch.querySelector('[data-admin-orders-pagination]')
  if (!pagination) return
  const pageCount = Math.max(1, Math.ceil(totalOrders / 5))
  const pageNumbers = pageCount <= 5
    ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : currentPage <= 3
      ? [1, 2, 3, '…', pageCount]
      : currentPage >= pageCount - 2
        ? [1, '…', pageCount - 2, pageCount - 1, pageCount]
        : [1, '…', currentPage - 1, currentPage, currentPage + 1, '…', pageCount]
  const previousClass = 'h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors flex items-center gap-1 disabled:opacity-40'
  const nextClass = 'h-9 px-3 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 disabled:opacity-40'
  const currentClass = 'w-9 h-9 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm'
  const pageClass = 'w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors'
  pagination.innerHTML = `<button class="${previousClass}" data-admin-orders-page="${currentPage - 1}" type="button" ${currentPage <= 1 ? 'disabled' : ''}><span class="material-symbols-outlined text-[18px]">chevron_left</span><span>Trước</span></button>${pageNumbers.map((page) => page === '…' ? '<span class="px-2 text-outline">…</span>' : `<button class="${page === currentPage ? currentClass : pageClass}" data-admin-orders-page="${page}" type="button">${page}</button>`).join('')}<button class="${nextClass}" data-admin-orders-page="${currentPage + 1}" type="button" ${currentPage >= pageCount ? 'disabled' : ''}><span>Tiếp</span><span class="material-symbols-outlined text-[18px]">chevron_right</span></button>`
}

function applyFarmBoxPageControls(documentFromStitch, route) {
  if (route.path === '/farm-box') {
    const sizeRoutes = [
      ['loai-nho', '/farm-box/loai-nho'],
      ['loai-vua', '/farm-box/loai-vua'],
      ['loai-lon', '/farm-box/loai-lon'],
    ]
    documentFromStitch.body.querySelectorAll('h3').forEach((heading) => {
      const headingText = normalizeLabel(heading.textContent)
      const match = sizeRoutes.find(([key]) => headingText.includes(`farm box ${key.replace('loai-', 'loai ')}`))
      if (!match) return
      let card = heading
      while (card && !card.classList?.contains('bg-surface-container-lowest')) card = card.parentElement
      if (!card) return
      card.dataset.farmBoxSize = match[0]
      card.querySelectorAll('a, button').forEach((control) => { control.dataset.route = match[1] })
    })
  }

  const size = route.path.endsWith('/loai-nho')
    ? 'nho'
    : route.path.endsWith('/loai-vua')
      ? 'vua'
      : route.path.endsWith('/loai-lon')
        ? 'lon'
        : ''
  if (!size) return

  documentFromStitch.body.querySelectorAll('button, a').forEach((control) => {
    if (!normalizeLabel(control.textContent).includes('xem thuc don')) return
    let card = control
    while (card && ![...card.querySelectorAll('h3')].some((heading) => normalizeLabel(heading.textContent).startsWith('tuan '))) card = card.parentElement
    const weekHeading = card?.querySelector('h3')
    const weekNumber = weekHeading?.textContent.match(/Tuần\s*(\d+)/i)?.[1]
    if (weekNumber) control.dataset.route = `/farm-box/thuc-don?size=${size}&week=${weekNumber}`
  })
}

function applyHomeFarmBoxSection(documentFromStitch, route, farmBoxes = []) {
  if (route.path !== '/') return
  const section = [...documentFromStitch.body.querySelectorAll('section')]
    .find((candidate) => [...candidate.querySelectorAll('h2')]
      .some((heading) => normalizeLabel(heading.textContent).trim() === 'farm box tuan nay'))
  if (!section) return

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dateLabel = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
  }
  const currentOffers = (farmBoxes || []).flatMap((box) => {
    const week = (box.weeks || []).find((entry) => {
      const start = new Date(entry.startDate)
      const end = new Date(entry.endDate)
      return entry.selectedForWeek !== false && !Number.isNaN(start.getTime())
        && !Number.isNaN(end.getTime()) && start <= today && today <= end
    })
    return [{ box, week }]
  })
  const picked = []
  const takeOffer = (predicate) => {
    const offer = currentOffers.find(({ box }) => predicate(normalizeLabel(`${box.name || ''} ${box.type || ''}`)))
    if (offer && !picked.includes(offer)) picked.push(offer)
  }
  takeOffer((name) => name.includes('imperfect'))
  takeOffer((name) => name.includes('standard') || name.includes('tieu chuan'))
  currentOffers.forEach((offer) => {
    if (picked.length < 2 && !picked.includes(offer)) picked.push(offer)
  })

  const cardMarkup = picked.slice(0, 2).map(({ box, week }) => {
    const isImperfect = normalizeLabel(`${box.name || ''} ${box.type || ''}`).includes('imperfect')
    const name = box.name || (isImperfect ? 'Farm Box Imperfect' : 'Farm Box tuần này')
    const price = Number(week?.price ?? box.price) || 0
    const items = week?.items?.length ? week.items : (box.defaultItems || [])
    const itemSummary = items.length
      ? items.slice(0, 5).map((item) => `${item.name}${item.quantity ? ` (${item.quantity}${item.unit || ''})` : ''}`).join(', ')
      : (box.description || 'Nông sản tươi được tuyển chọn theo mùa từ các nông trại GreenNova.')
    const period = week?.startDate && week?.endDate
      ? `${dateLabel(week.startDate)} – ${dateLabel(week.endDate)}`
      : 'Lịch tuần hiện tại'
    const target = `/farm-box/thuc-don?farmBoxId=${encodeURIComponent(box.id)}${week?.id ? `&weekId=${encodeURIComponent(week.id)}` : ''}`
    return `<article class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e2e9df] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <a href="#" data-route="${escapeHtml(target)}" class="relative block h-48 overflow-hidden bg-[#e8f0e5] sm:h-52">
        <img src="${escapeHtml(box.image || '')}" alt="${escapeHtml(name)}" class="h-full w-full object-cover" loading="lazy"/>
        <span class="absolute left-3 top-3 rounded-full ${isImperfect ? 'bg-[#ffe0c2] text-[#814100]' : 'bg-[#d9efd8] text-[#176b36]'} px-3 py-1 text-xs font-semibold">${isImperfect ? 'Imperfect' : 'Farm Box'}</span>
        ${isImperfect ? '<span class="absolute right-3 top-3 rounded-full bg-[#ffe0c2] px-3 py-1 text-xs font-semibold text-[#814100]">Nhiều hơn 25% rau củ</span>' : '<span class="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#176b36]">Tiêu chuẩn tuyển chọn</span>'}
      </a>
      <div class="flex flex-1 flex-col p-4">
        <div class="flex items-start justify-between gap-3"><h3 class="min-w-0 text-lg font-bold text-[#1b2b20]">${escapeHtml(name)}</h3><strong class="shrink-0 text-sm font-bold ${isImperfect ? 'text-[#814100]' : 'text-[#09652f]'}">${money(price)} <span class="font-normal text-[#69766c]">/ hộp</span></strong></div>
        <p class="mt-2 line-clamp-2 text-sm leading-5 text-[#4e5d52]">${escapeHtml(itemSummary)}</p>
        <p class="mt-2 flex items-center gap-1.5 text-xs text-[#69766c]"><span class="material-symbols-outlined text-[15px]">calendar_month</span>Tuần nhận: ${escapeHtml(period)}</p>
        <a href="#" data-route="${escapeHtml(target)}" class="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg ${isImperfect ? 'bg-[#814100] hover:bg-[#683400]' : 'bg-[#1b723b] hover:bg-[#005828]'} px-4 py-2 text-sm font-semibold text-white no-underline transition">Xem Farm Box <span class="material-symbols-outlined text-[17px]">arrow_forward</span></a>
      </div>
    </article>`
  }).join('')

  section.className = 'w-full bg-[#f0faf0] py-10 sm:py-12'
  section.innerHTML = `<div class="mx-auto max-w-[1200px] px-4 sm:px-6">
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 class="text-2xl font-bold tracking-tight text-[#17251a]">Farm Box tuần này</h2><p class="mt-1 text-sm text-[#58675d]">Hộp rau củ tươi luân phiên theo mùa, giao định kỳ tận nhà</p></div><a href="#" data-route="/farm-box" class="text-sm font-semibold text-[#09652f] no-underline hover:underline">Xem tất cả Farm Box →</a></div>
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">${cardMarkup || '<article class="rounded-xl border border-dashed border-[#cbdccf] bg-white p-8 text-center text-sm text-[#647467] md:col-span-2">Các gói Farm Box tuần này đang được cập nhật.</article>'}</div>
    <p class="mt-4 text-center text-xs italic text-[#738276]">* Nội dung hộp có thể thay đổi nhẹ theo nguồn cung và điều kiện thời tiết tại nông trại.</p>
  </div>`
}

function renderFarmBoxWeeksScreen(documentFromStitch, route, farmBoxes, search) {
  const routeSizes = {
    '/farm-box/chon-goi': new URLSearchParams(search || '').get('size') || '',
    '/farm-box/loai-nho': 'nho',
    '/farm-box/loai-vua': 'vua',
    '/farm-box/loai-lon': 'lon',
  }
  if (!(route.path in routeSizes)) return

  const size = routeSizes[route.path]
  const sizeLabels = { nho: 'nhỏ', vua: 'vừa', lon: 'lớn' }
  const sizeTerms = {
    nho: ['nho', 'mini', 'small'],
    vua: ['vua', 'standard', 'medium'],
    lon: ['lon', 'sum vay', 'large'],
  }
  const sizeLabel = sizeLabels[size]
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
  const dateLabel = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const typedBoxes = (farmBoxes || []).filter((box) => {
    const searchable = normalizeLabel(`${box.name || ''} ${box.type || ''}`)
    return sizeTerms[size]?.some((term) => searchable.includes(term))
  })
  // Older FarmBox records may not include a size in their name/type yet. In
  // that case the calendar is shared, while the selected size stays in the URL.
  const matchedBoxes = typedBoxes.length ? typedBoxes : (farmBoxes || [])
  const weeksByKey = new Map()
  matchedBoxes.forEach((box) => {
    ;(box.weeks || []).filter((week) => week.selectedForWeek !== false).forEach((week) => {
      const start = new Date(week.startDate)
      const end = new Date(week.endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < dayStart) return
      const key = `${dateKey(start)}_${dateKey(end)}`
      const grouped = weeksByKey.get(key) || { start, end, offers: [] }
      grouped.offers.push({ box, week })
      weeksByKey.set(key, grouped)
    })
  })
  const currentWeekStart = new Date(dayStart)
  currentWeekStart.setDate(currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7))
  const currentWeekEnd = new Date(currentWeekStart)
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 6)
  const currentWeekKey = `${dateKey(currentWeekStart)}_${dateKey(currentWeekEnd)}`
  if (!weeksByKey.has(currentWeekKey)) {
    weeksByKey.set(currentWeekKey, { start: currentWeekStart, end: currentWeekEnd, offers: [] })
  }
  let weeks = [...weeksByKey.values()]
    .filter((week) => week.start >= currentWeekStart)
    .sort((a, b) => a.start - b.start)
  while (weeks.length < 3) {
    const lastWeek = weeks[weeks.length - 1]
    const start = new Date(lastWeek ? lastWeek.start : currentWeekStart)
    start.setDate(start.getDate() + 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    weeks.push({ start, end, offers: [] })
  }
  weeks = weeks.slice(0, 3)
  const imageFallback = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_FpUyRllWm3Pn0qRQM19w2xMJlajzlyA_tNN8R0JnvrM8AF7u4l2dlAATI-5Q8hHAknwx1DvaeJtvFUv3mR2irjwzkIUgN-L8P7zkTtm1HkA8lJlasnR9BglLZQQxdUEacuko1Bd_tT3_L1r5bZaGAdArjmUWDM4w0TGHgtlWGxFxkWRk8UaXaSw0ECjH8SedN_Rzmx7uJf2Zen0xHhalEh_QONV0DibS7OzjtXaL-n2WcgDVwh5Ysg'
  const weekCards = weeks.map((group, index) => {
    const prices = group.offers.map(({ week }) => Number(week.price) || 0).filter((price) => price > 0)
    const lowPrice = prices.length ? Math.min(...prices) : 0
    const highPrice = prices.length ? Math.max(...prices) : 0
    const planned = group.offers.reduce((sum, { week }) => sum + (Number(week.maxBoxes) || 0), 0)
    const booked = group.offers.reduce((sum, { week }) => sum + (Number(week.bookedBoxes) || 0), 0)
    const available = group.offers.reduce((sum, { week }) => sum + (Number(week.available) || 0), 0)
    const isCurrentWeek = group.start <= dayStart && group.end >= dayStart
    const hasPendingSchedule = group.offers.some(({ week }) => week.schedulePending)
    const status = isCurrentWeek
      ? 'Đang mở bán'
      : index === 1
        ? 'Đặt trước'
      : hasPendingSchedule
        ? 'Đặt trước'
      : group.offers.length
        ? (group.offers.some(({ week }) => week.canPurchase) ? 'Đang mở' : (group.offers[0]?.week.status || 'Sắp mở'))
        : 'Chưa mở bán'
    const statusIsOpen = status === 'Đang mở bán' || status === 'Đang mở'
    const statusIndicator = isCurrentWeek
      ? '<span class="relative flex h-2 w-2"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-white"></span></span>'
      : ''
    const title = `Tuần ${index + 1} (${dateLabel(group.start)} - ${dateLabel(group.end)})`
    const priceText = lowPrice
      ? (lowPrice === highPrice ? money(lowPrice) : `${money(lowPrice)} – ${money(highPrice)}`)
      : 'Đang cập nhật'
    const routeTarget = `/farm-box/tuy-chinh?size=${encodeURIComponent(size)}&weekStart=${encodeURIComponent(group.start.toISOString())}&weekEnd=${encodeURIComponent(group.end.toISOString())}`
    const progress = planned > 0 ? Math.min(100, Math.round(booked / planned * 100)) : 0
    const weekBadge = isCurrentWeek
      ? '<span class="rounded-md bg-[#d9efd8] px-2 py-1 text-sm text-[#526553]">Giao tuần này</span>'
      : index === 1
        ? ''
        : '<span class="rounded-md bg-[#d9efd8] px-2 py-1 text-sm text-[#526553]">Đặt trước</span>'
    const weekStats = index <= 1
      ? `<div class="mb-4 flex min-h-[88px] items-center gap-3 rounded-xl bg-[#edf6ed] px-4 py-3"><span class="material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#176b36]">verified</span><div><strong class="block text-sm font-semibold text-[#176b36]">Nông sản tuyển chọn</strong><p class="mt-1 text-sm leading-5 text-[#5d6b61]">Tươi theo mùa, được tuyển chọn từ các nông trại đạt chuẩn VietGAP.</p></div></div>`
      : `<div class="mb-4 text-sm"><div class="flex justify-between gap-3"><span class="text-[#5d6b61]">Số lượng dự kiến</span><strong class="text-[#176b36]">${planned ? `${planned} hộp` : 'Chưa cập nhật'}</strong></div><div class="mt-2 h-2 overflow-hidden rounded-full bg-[#e5eee5]"><div class="h-full rounded-full bg-[#16733b]" style="width:${progress}%"></div></div><p class="mt-1 text-[#617366]">${planned ? `Đã đặt ${booked}/${planned} hộp · Còn ${available} suất` : 'Sản lượng sẽ được cập nhật khi mở bán'}</p></div><div class="mb-4 rounded-xl bg-[#edf6ed] p-4"><span class="block text-xs text-[#5b6b60]">Giá các lựa chọn trong tuần</span><strong class="mt-1 block text-2xl font-bold text-[#005828]">${escapeHtml(priceText)}</strong></div>`
    return `<article class="overflow-hidden rounded-2xl border border-[#dce8dc] bg-white shadow-sm flex flex-col">
      <div class="p-5 pb-3">
        <div class="flex items-center justify-between gap-3 mb-3"><span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${statusIsOpen ? 'bg-[#1b723b] text-white' : 'bg-[#e6efe6] text-[#526553]'}">${statusIndicator}${escapeHtml(status)}</span>${weekBadge}</div>
        <h2 class="text-xl font-bold text-[#17251a]">${escapeHtml(title)}</h2>
        <p class="mt-1 text-sm text-[#58675d]">Giao trong tuần ${escapeHtml(dateLabel(group.start))} - ${escapeHtml(dateLabel(group.end))}</p>
      </div>
      <div class="mx-5 h-44 overflow-hidden rounded-xl bg-[#eef5ee]"><img class="h-full w-full object-cover" src="${imageFallback}" alt="Hộp nông sản tuần GreenNova"></div>
      <div class="flex flex-1 flex-col p-5 pt-4">${weekStats}<button type="button" data-route="${escapeHtml(routeTarget)}" class="mt-auto h-11 rounded-xl bg-[#09652f] px-4 font-semibold text-white hover:bg-[#005828]">Xem FarmBox của tuần này →</button></div>
    </article>`
  }).join('')

  const section = [...documentFromStitch.body.querySelectorAll('section')]
    .find((candidate) => normalizeLabel(candidate.querySelector('h2')?.textContent || '').includes('3 goi farm box tien loi'))
  const cardGrid = [...(section?.children || [])].find((child) => child.classList?.contains('grid'))
  if (!section || !cardGrid) return

  cardGrid.innerHTML = sizeLabel
    ? weekCards
    : `<div class="col-span-full rounded-2xl border border-[#dce8dc] bg-white p-8 text-center text-[#5e6c62]">Hãy chọn loại FarmBox từ trang chính để xem lịch tuần.</div>`
}

function renderFarmBoxOptionsScreen(documentFromStitch, route, farmBoxes, search) {
  if (route.path !== '/farm-box/tuy-chinh') return

  const params = new URLSearchParams(search || '')
  const size = params.get('size') || ''
  const sizeLabels = { nho: 'nhỏ', vua: 'vừa', lon: 'lớn' }
  const ranges = {
    nho: (price) => price < 199000,
    vua: (price) => price >= 199000 && price < 300000,
    lon: (price) => price >= 300000,
  }
  const label = sizeLabels[size]
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
  const toDateKey = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  const selectedStart = params.get('weekStart')
  const selectedDateKey = selectedStart ? toDateKey(selectedStart) : ''
  const scheduledOffers = (farmBoxes || []).flatMap((box) => (box.weeks || [])
    .filter((week) => week.selectedForWeek !== false)
    .map((week) => ({ box, week })))
  const unscheduledOffers = (farmBoxes || [])
    .filter((box) => !(box.weeks || []).length && Number(box.price) > 0 && ranges[size]?.(Number(box.price)))
    .map((box) => ({
      box,
      week: {
        price: Number(box.price),
        startDate: selectedStart || '',
        endDate: '',
        status: 'Chưa có lịch giao',
        items: [],
      },
      isScheduled: false,
    }))
  const allOffers = scheduledOffers.map((offer) => ({ ...offer, isScheduled: true }))
    .concat(unscheduledOffers)
    .filter(({ week }) => Number(week.price) > 0 && ranges[size]?.(Number(week.price)))
  const sameWeekOffers = selectedDateKey
    ? allOffers.filter(({ week }) => toDateKey(week.startDate) === selectedDateKey)
    : []
  let offers = sameWeekOffers
  const usingNearestWeek = !offers.length && Boolean(selectedDateKey)
  if (usingNearestWeek) {
    const selectedTime = new Date(selectedStart).getTime()
    const nearestByBox = new Map()
    allOffers.forEach((offer) => {
      const key = offer.box.id
      const distance = Math.abs(new Date(offer.week.startDate).getTime() - selectedTime)
      const current = nearestByBox.get(key)
      if (!current || distance < current.distance) nearestByBox.set(key, { ...offer, distance })
    })
    offers = [...nearestByBox.values()].map(({ distance: _distance, ...offer }) => offer)
  }

  const selectionKey = `greennovaFarmBoxOptions:${size}:${selectedDateKey || 'any'}`
  const fingerprint = offers.map(({ box, week }) => `${box.id}:${week.id || 'no-week'}`).sort().join('|')
  let selectedOffers = []
  try {
    const saved = JSON.parse(sessionStorage.getItem(selectionKey) || 'null')
    if (saved?.fingerprint === fingerprint && Array.isArray(saved.ids) && saved.ids.length === offers.length) {
      const selectedIds = new Set(saved.ids)
      selectedOffers = offers.filter(({ box, week }) => selectedIds.has(`${box.id}:${week.id || 'no-week'}`))
    }
    if (!selectedOffers.length && offers.length) {
      const shuffled = [...offers]
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1))
        ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
      }
      selectedOffers = shuffled
      sessionStorage.setItem(selectionKey, JSON.stringify({
        fingerprint,
        ids: selectedOffers.map(({ box, week }) => `${box.id}:${week.id || 'no-week'}`),
      }))
    }
  } catch {
    selectedOffers = [...offers].sort(() => Math.random() - 0.5)
  }

  const cards = selectedOffers.slice(0, 6).map(({ box, week, isScheduled }) => {
    const price = Number(week.price) || 0
    const contents = (week.items || []).slice(0, 4).map((item) => (
      `<li class="flex items-start gap-2 text-sm text-[#526257]"><span class="mt-0.5 text-[#16733b]">✓</span><span>${escapeHtml(item.name)}${item.quantity ? ` · ${escapeHtml(item.quantity)} ${escapeHtml(item.unit || '')}` : ''}</span></li>`
    )).join('')
    const detailRoute = `/farm-box/thuc-don?farmBoxId=${encodeURIComponent(box.id)}${isScheduled ? `&weekId=${encodeURIComponent(week.id)}` : ''}&size=${encodeURIComponent(size)}${selectedStart ? `&weekStart=${encodeURIComponent(new Date(selectedStart).toISOString())}` : ''}`
    const weekTitle = week.startDate && week.endDate
      ? `${toDateKey(week.startDate).slice(8, 10)}/${toDateKey(week.startDate).slice(5, 7)} - ${toDateKey(week.endDate).slice(8, 10)}/${toDateKey(week.endDate).slice(5, 7)}`
      : 'Tuần đang chọn'
    return `<article class="flex h-full flex-col rounded-2xl border border-[#dce8dc] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div class="mb-3 flex items-start justify-between gap-3"><span class="rounded-full bg-[#e7f3e7] px-3 py-1 text-xs font-semibold text-[#176b36]">FarmBox loại ${escapeHtml(label || '')}</span><span class="rounded-full bg-[#f3f4ed] px-2.5 py-1 text-xs text-[#5e6c62]">${escapeHtml(week.schedulePending ? 'Đặt trước' : week.status || 'Theo tuần')}</span></div>
      <div class="mb-4 h-40 overflow-hidden rounded-xl bg-[#eef5ee]"><img class="h-full w-full object-cover" src="${escapeHtml(box.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_FpUyRllWm3Pn0qRQM19w2xMJlajzlyA_tNN8R0JnvrM8AF7u4l2dlAATI-5Q8hHAknwx1DvaeJtvFUv3mR2irjwzkIUgN-L8P7zkTtm1HkA8lJlasnR9BglLZQQxdUEacuko1Bd_tT3_L1r5bZaGAdArjmUWDM4w0TGHgtlWGxFxkWRk8UaXaSw0ECjH8SedN_Rzmx7uJf2Zen0xHhalEh_QONV0DibS7OzjtXaL-n2WcgDVwh5Ysg')}"></div>
      <h3 class="text-lg font-bold text-[#17251a]">${escapeHtml(week.name || box.name || 'FarmBox')}</h3><p class="mt-1 min-h-10 text-sm text-[#5e6c62]">${escapeHtml(box.description || `Thực đơn FarmBox tuần ${weekTitle}`)}</p>
      <div class="my-4 rounded-xl bg-[#edf6ed] p-4"><span class="text-xs text-[#5b6b60]">Giá tuần này</span><strong class="mt-1 block text-2xl font-bold text-[#005828]">${money(price)}</strong></div>
      <ul class="mb-5 flex flex-col gap-2">${contents || '<li class="text-sm text-[#66746a]">Thực đơn chi tiết sẽ được cập nhật.</li>'}</ul>
      <button type="button" data-route="${escapeHtml(detailRoute)}" class="mt-auto h-11 rounded-xl bg-[#09652f] px-4 font-semibold text-white hover:bg-[#005828]">Xem chi tiết FarmBox →</button>
    </article>`
  }).join('')

  const section = [...documentFromStitch.body.querySelectorAll('section')]
    .find((candidate) => normalizeLabel(candidate.querySelector('h2')?.textContent || '').includes('goi dang ky hop nong trai dinh ky'))
  const contentWrapper = section?.firstElementChild
  const grid = [...(contentWrapper?.children || [])].find((child) => child.classList?.contains('grid'))
  if (!section || !grid) return
  grid.innerHTML = selectedOffers.length
    ? cards + (usingNearestWeek ? `<p class="col-span-full text-center text-sm text-[#66746a]">Chưa có gói được cập nhật đúng tuần này; đang hiển thị các lựa chọn gần nhất trong MongoDB.</p>` : '')
    : `<div class="col-span-full rounded-2xl border border-[#dce8dc] bg-white p-8 text-center text-[#5e6c62]">${label ? `Chưa có FarmBox loại ${escapeHtml(label)} trong khoảng giá đã chọn.` : 'Hãy chọn cỡ hộp và tuần trước để xem các gói phù hợp.'}</div>`
}

function renderFarmBoxMenuScreen(documentFromStitch, route, farmBoxes, products, search) {
  if (route.path !== '/farm-box/thuc-don') return

  const params = new URLSearchParams(search || '')
  const requestedBoxId = params.get('farmBoxId') || ''
  const requestedWeekId = params.get('weekId') || ''
  const requestedStart = params.get('weekStart') || ''
  const box = (farmBoxes || []).find((candidate) => candidate.id === requestedBoxId)
    || (farmBoxes || []).find((candidate) => (candidate.weeks || []).some((week) => week.id === requestedWeekId))
  const boxWeeks = (box?.weeks || []).filter((week) => week.selectedForWeek !== false).slice().sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
  const selectedWeek = boxWeeks.find((week) => week.id === requestedWeekId)
    || boxWeeks.find((week) => requestedStart && new Date(week.startDate).toDateString() === new Date(requestedStart).toDateString())
    || boxWeeks[Math.max(0, (Number(params.get('week')) || 1) - 1)]
    || boxWeeks[0]
  const provisionalWeekStart = (() => {
    const requestedDate = requestedStart ? new Date(requestedStart) : null
    const start = requestedDate && !Number.isNaN(requestedDate.getTime()) ? new Date(requestedDate) : new Date()
    start.setHours(0, 0, 0, 0)
    if (!requestedDate || Number.isNaN(requestedDate.getTime())) {
      const daysUntilMonday = (8 - start.getDay()) % 7 || 7
      start.setDate(start.getDate() + daysUntilMonday)
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const upcomingDeliveryExists = [2, 5].some((weekday) => {
      const candidate = new Date(start)
      while (candidate.getDay() !== weekday) candidate.setDate(candidate.getDate() + 1)
      return candidate >= today
    })
    if (!upcomingDeliveryExists) start.setDate(start.getDate() + 7)
    return start
  })()
  const displayWeek = selectedWeek || (box ? {
    startDate: provisionalWeekStart,
    endDate: new Date(provisionalWeekStart.getFullYear(), provisionalWeekStart.getMonth(), provisionalWeekStart.getDate() + 6),
    price: Number(box.price) || 0,
    maxBoxes: 60,
    bookedBoxes: 0,
    available: 60,
    status: 'Đang mở',
    schedulePending: false,
  } : null)
  const menu = [...documentFromStitch.body.querySelectorAll('main > div.flex.flex-col.gap-space-xs')]
    .find((element) => element.querySelector(':scope > article'))
  const aside = documentFromStitch.body.querySelector('aside')
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
  const formatDate = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '' : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
  }
  const productsById = new Map((products || []).map((product) => [product.id, product]))

  const heading = documentFromStitch.body.querySelector('h1')
  const displayBoxName = selectedWeek?.name || box?.name || 'FarmBox'
  if (heading) heading.textContent = box && displayWeek
    ? `Thực đơn ${displayBoxName} · ${formatDate(displayWeek.startDate)} - ${formatDate(displayWeek.endDate)}`
    : 'Thực đơn FarmBox'
  const intro = heading?.nextElementSibling
  if (intro && box) intro.textContent = box.description || 'Thực đơn và lịch giao được quản lý theo từng FarmBox trong MongoDB.'

  if (menu) {
      const items = selectedWeek ? (selectedWeek.items || []) : (box?.defaultItems || [])
    const cards = items.map((item, index) => {
      const product = productsById.get(item.productId)
      const template = menu.querySelector(':scope > article')
      const card = template?.cloneNode(true)
      if (!card) return ''
      const image = card.querySelector('img')
      if (image) {
        if (product?.image) image.src = product.image
        else {
          image.removeAttribute('src')
          image.classList.add('hidden')
        }
        image.alt = item.name || product?.name || 'Nông sản FarmBox'
      }
      const number = card.querySelector('span.absolute.bottom-1')
      if (number) number.textContent = `#${index + 1}`
      const name = card.querySelector('h3')
      if (name) name.textContent = product?.name || item.name || 'Nông sản'
      const farm = [...card.querySelectorAll('span')].find((span) => span.classList.contains('bg-secondary-container'))
      if (farm) farm.textContent = product?.farm || product?.category || 'Nông trại GreenNova'
      const quantity = [...card.querySelectorAll('span.font-price-md')][0]
      if (quantity) quantity.textContent = `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(Number(item.quantity) || 0)} ${item.unit || product?.unit || ''}`.trim()
      const description = card.querySelector('p')
      if (description) description.textContent = product?.description || 'Nông sản tươi được chọn cho thực đơn tuần này.'
      card.querySelectorAll('.flex.items-center.gap-space-md.font-body-sm').forEach((row) => row.remove())
      return card
    }).filter(Boolean)
    menu.replaceChildren(...(cards.length ? cards : [Object.assign(documentFromStitch.createElement('div'), {
      className: 'rounded-xl bg-surface-container-lowest p-space-md text-on-surface-variant',
      textContent: selectedWeek ? 'Tuần này chưa có thực phẩm trong dữ liệu MongoDB.' : 'Chưa có lịch tuần cho FarmBox này trong MongoDB.',
    })]))
  }

  const titleInMenu = [...documentFromStitch.body.querySelectorAll('h2')].find((element) => normalizeLabel(element.textContent).includes('thuc don chi tiet'))
  if (titleInMenu) titleInMenu.textContent = selectedWeek ? `Thực đơn tuần ${formatDate(selectedWeek.startDate)} - ${formatDate(selectedWeek.endDate)}` : 'Thực đơn tuần'

  const weekTabs = [...documentFromStitch.body.querySelectorAll('[id^="tab-week-"]')]
  const tabsContainer = weekTabs[0]?.parentElement
  if (tabsContainer) {
    if (boxWeeks.length) {
      tabsContainer.replaceChildren(...boxWeeks.slice(0, 3).map((week, index) => {
        const tab = documentFromStitch.createElement('button')
        tab.type = 'button'
        tab.id = `tab-week-${index + 1}`
        tab.dataset.route = `/farm-box/thuc-don?farmBoxId=${encodeURIComponent(box.id)}&weekId=${encodeURIComponent(week.id)}&size=${encodeURIComponent(params.get('size') || '')}&weekStart=${encodeURIComponent(new Date(week.startDate).toISOString())}`
        tab.className = `flex items-center gap-2 px-space-md py-2.5 rounded-lg ${week.id === selectedWeek?.id ? 'bg-primary-container text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'} font-label-lg text-label-lg transition-all`
        tab.textContent = `Tuần ${index + 1} (${formatDate(week.startDate)} - ${formatDate(week.endDate)}) · ${week.status || 'Theo lịch'}`
        return tab
      }))
    } else {
      tabsContainer.remove()
    }
  }

  const priceLabels = documentFromStitch.body.querySelectorAll('.font-display-lg')
  if (selectedWeek || box) priceLabels.forEach((priceLabel) => {
    priceLabel.textContent = money(Number(selectedWeek?.price ?? box?.price) || 0)
  })
  const quantity = aside?.querySelector('#box-quantity')
  if (quantity) quantity.textContent = '1'
  const stock = Math.max(0, Number(selectedWeek?.available) || 0)
  const quantityLimit = selectedWeek ? stock : box?.id && Number(box.price) > 0 ? 60 : 0
  const quantityControls = [...(aside?.querySelectorAll('button') || [])]
    .filter((button) => ['remove', 'add'].includes(normalizeLabel(button.querySelector('.material-symbols-outlined')?.textContent || '')))
  quantityControls.forEach((button) => {
    button.removeAttribute('onclick')
    button.dataset.farmboxQuantityAction = normalizeLabel(button.querySelector('.material-symbols-outlined')?.textContent) === 'add' ? 'increase' : 'decrease'
    button.disabled = button.dataset.farmboxQuantityAction === 'increase' ? quantityLimit <= 1 : true
  })

  const weekSummaryLabel = [...(aside?.querySelectorAll('label') || [])]
    .find((label) => normalizeLabel(label.textContent).includes('tuan nhan hang'))
  const weekSummary = weekSummaryLabel?.parentElement
  if (weekSummary) {
    const booked = Math.max(0, Number(displayWeek?.bookedBoxes) || 0)
    const available = Math.max(0, Number(displayWeek?.available) || 0)
    const maxBoxes = Math.max(0, Number(displayWeek?.maxBoxes) || booked + available)
    weekSummary.innerHTML = displayWeek
      ? `<div class="flex items-center justify-between gap-3 rounded-xl border border-[#c8e2cc] bg-[#edf7ed] p-3"><div><div class="font-semibold text-[#26382b]">${formatDate(displayWeek.startDate)} – ${formatDate(displayWeek.endDate)}</div><div class="text-sm text-[#68776b]">Còn ${available}/${maxBoxes} hộp · Đã đặt ${booked}</div></div><span class="rounded-full bg-[#d8efda] px-2.5 py-1 text-xs font-semibold text-[#146b37]">${escapeHtml(displayWeek.schedulePending ? 'Đặt trước' : displayWeek.status || 'Theo lịch')}</span></div>`
      : '<div class="rounded-xl bg-surface-container-low p-3 text-sm text-on-surface-variant">FarmBox này chưa có lịch giao được cấu hình.</div>'
  }

  const deliveryLabel = [...(aside?.querySelectorAll('label') || [])]
    .find((label) => normalizeLabel(label.textContent).includes('chon ngay nhan hang'))
  deliveryLabel?.parentElement?.parentElement?.remove()

  const cta = aside?.querySelector('#cta-button-text')?.closest('button')
  if (cta) {
    cta.removeAttribute('onclick')
    cta.dataset.addFarmBoxId = box?.id || ''
    cta.dataset.farmBoxWeekId = selectedWeek?.id || ''
    const farmBoxSize = params.get('size')
      || (route.path === '/farm-box/loai-nho' ? 'nho' : route.path === '/farm-box/loai-vua' ? 'vua' : route.path === '/farm-box/loai-lon' ? 'lon' : '')
      || ((Number(selectedWeek?.price ?? box?.price) || 0) < 199000 ? 'nho' : (Number(selectedWeek?.price ?? box?.price) || 0) < 300000 ? 'vua' : 'lon')
    cta.dataset.farmBoxSize = farmBoxSize
    cta.dataset.provisionFarmBox = !selectedWeek && box?.id && Number(box.price) > 0 ? 'true' : 'false'
    cta.dataset.provisionalStartDate = provisionalWeekStart.toISOString()
    cta.dataset.farmBoxPrice = String(Number(selectedWeek?.price ?? box?.price) || 0)
    cta.dataset.farmBoxStock = String(quantityLimit)
    delete cta.dataset.selectedFarmBoxDeliveryDate
    cta.disabled = !box || (selectedWeek ? !selectedWeek.canPurchase || stock < 1 : !(Number(box?.price) > 0))
    cta.classList.toggle('opacity-50', cta.disabled)
    cta.querySelector('#cta-button-text').textContent = cta.disabled
      ? (selectedWeek ? 'Tuần này chưa mở bán' : 'Chưa có giá để đặt trước')
      : selectedWeek
          ? `Thêm FarmBox vào giỏ · ${money(Number(selectedWeek.price) || 0)}`
          : `Đặt trước · ${money(Number(box?.price) || 0)}`
    let replacementLink = aside.querySelector('[data-farmbox-replacement-link]')
    if (box) {
      if (!replacementLink) {
        replacementLink = documentFromStitch.createElement('a')
        replacementLink.dataset.farmboxReplacementLink = 'true'
        replacementLink.className = 'mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#b9d9bd] bg-white px-4 py-2.5 text-sm font-semibold text-[#176b36] no-underline transition-colors hover:bg-[#f0f8ef]'
        cta.insertAdjacentElement('afterend', replacementLink)
      }
      const query = new URLSearchParams()
      if (farmBoxSize) query.set('size', farmBoxSize)
      if (box?.id) query.set('farmBoxId', box.id)
      if (selectedWeek?.id) query.set('weekId', selectedWeek.id)
      if (selectedWeek?.startDate) query.set('weekStart', new Date(selectedWeek.startDate).toISOString())
      const weekQuery = query.size ? `?${query.toString()}` : ''
      replacementLink.href = `/farm-box/thay-doi${weekQuery}`
      replacementLink.dataset.route = `/farm-box/thay-doi${weekQuery}`
      replacementLink.innerHTML = '<span class="material-symbols-outlined text-[18px]">published_with_changes</span>Phương án thay thế'
    } else replacementLink?.remove()
  }
}

function renderFarmBoxCustomizerMenu(documentFromStitch, route) {
  if (route.path !== '/farm-box/tuy-chinh') return

  const section = [...documentFromStitch.body.querySelectorAll('section')]
    .find((candidate) => [...candidate.querySelectorAll('h2')]
      .some((heading) => normalizeLabel(heading.textContent).includes('thuc don tuan nay')))
  section?.remove()
  const legacyScheduler = [...documentFromStitch.body.querySelectorAll('section')]
    .find((candidate) => [...candidate.querySelectorAll('h2')]
      .some((heading) => normalizeLabel(heading.textContent).includes('thiet lap don hang dinh ky')))
  legacyScheduler?.remove()
}

function removeFarmBoxDeliveryChoices(documentFromStitch, route) {
  if (!route.path.startsWith('/farm-box')) return
  const labels = [...documentFromStitch.body.querySelectorAll('label')]
  labels.forEach((label) => {
    const text = normalizeLabel(label.textContent)
    if (text.includes('chon ngay nhan hang')) label.parentElement?.parentElement?.remove()
    else if (text.includes('chon ngay giao dinh ky')) label.parentElement?.remove()
  })
}

function applyCheckoutScreen(documentFromStitch, route, authUser) {
  if (route.path !== '/checkout' || !authUser) return
  const setValue = (selector, value) => {
    const input = documentFromStitch.body.querySelector(selector)
    if (input) {
      input.value = value || ''
      input.setAttribute('value', value || '')
    }
  }
  setValue('#fullName', authUser.fullName)
  setValue('#phoneNumber', authUser.phone)
  setValue('#emailAddress', authUser.email)

  const addressSection = [...documentFromStitch.body.querySelectorAll('section')]
    .find((section) => [...section.querySelectorAll('h2')].some((heading) => heading.textContent.includes('Địa chỉ giao hàng')))
  if (!addressSection) return
  const savedAddresses = Array.isArray(authUser.addresses) ? authUser.addresses : []
  const storedCheckoutAddressId = window.sessionStorage.getItem('greennovaCheckoutAddressId') || ''
  const activeAddress = savedAddresses.find((item) => item.id === storedCheckoutAddressId)
    || savedAddresses[0]
    || (authUser.address ? {
      id: 'legacy-default', label: 'Nhà riêng', address: authUser.address,
      province: authUser.province || '', isDefault: true,
    } : null)
  let addAddressButton = addressSection.querySelector('button')
  if (!addAddressButton) {
    addAddressButton = documentFromStitch.createElement('button')
    addressSection.querySelector('h2')?.parentElement?.append(addAddressButton)
  }
  if (addAddressButton) {
    addAddressButton.type = 'button'
    addAddressButton.dataset.toggleNewAddress = 'true'
    addAddressButton.className = 'font-label-md text-label-md text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer'
    addAddressButton.innerHTML = '<span class="material-symbols-outlined text-[18px]">add</span>Địa chỉ khác'
  }
  const addressCards = [...addressSection.querySelectorAll('label')]
    .filter((label) => label.querySelector('input[name="delivery_address"]'))
  addressCards.forEach((card) => card.remove())
  const addressList = documentFromStitch.createElement('div')
  addressList.className = 'mb-3 flex flex-col gap-2'
  const addressSelectLabel = documentFromStitch.createElement('label')
  addressSelectLabel.textContent = 'Địa chỉ đã lưu'
  addressSelectLabel.className = 'text-sm font-semibold text-on-surface'
  const addressOptions = documentFromStitch.createElement('div')
  addressOptions.className = 'flex flex-col gap-2'
  if (!savedAddresses.length) {
    const emptyOption = documentFromStitch.createElement('p')
    emptyOption.className = 'rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant'
    emptyOption.textContent = 'Bạn chưa có địa chỉ nào được lưu.'
    addressOptions.append(emptyOption)
  }
  savedAddresses.forEach((address) => {
    const option = documentFromStitch.createElement('label')
    option.className = 'flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant bg-white px-3 py-3 transition-colors hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-secondary-container/40'
    const radio = documentFromStitch.createElement('input')
    radio.type = 'radio'
    radio.name = 'checkoutSavedAddress'
    radio.value = address.id
    radio.checked = address.id === activeAddress?.id
    radio.className = 'mt-1 accent-primary'
    radio.dataset.savedAddressOption = 'true'
    const details = documentFromStitch.createElement('span')
    details.className = 'flex min-w-0 flex-col gap-1 text-sm text-on-surface'
    const title = documentFromStitch.createElement('span')
    title.className = 'font-semibold'
    title.textContent = `${address.label || 'Địa chỉ'}${address.id === savedAddresses[0]?.id ? ' · Mặc định' : ''}`
    const description = documentFromStitch.createElement('span')
    description.className = 'text-on-surface-variant'
    description.textContent = [address.address, address.province].filter(Boolean).join(', ')
    details.append(title, description)
    option.append(radio, details)
    addressOptions.append(option)
  })
  addressList.append(addressSelectLabel, addressOptions)
  const header = [...addressSection.querySelectorAll('div')]
    .find((element) => element.querySelector('h2')?.textContent.includes('Địa chỉ giao hàng'))
  if (header) header.after(addressList)
  else addressSection.prepend(addressList)

  const selectedCard = documentFromStitch.createElement('div')
  selectedCard.className = 'relative flex flex-col gap-2 p-4 rounded-xl border border-primary bg-secondary-container/40'
  selectedCard.innerHTML = '<div class="flex items-center gap-2"><span class="font-label-lg text-on-surface font-bold" data-current-address-label></span><span class="bg-primary text-on-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Mặc định</span></div>'
  const addressInput = documentFromStitch.createElement('textarea')
  addressInput.id = 'checkoutAddress'
  addressInput.rows = 2
  addressInput.required = true
  addressInput.placeholder = 'Nhập địa chỉ nhận hàng'
  addressInput.className = 'w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y'
  addressInput.value = activeAddress?.address || ''
  addressInput.textContent = activeAddress?.address || ''
  addressInput.setAttribute('aria-label', 'Địa chỉ nhận hàng')
  selectedCard.append(addressInput)
  addressList.after(selectedCard)

  const regionRow = documentFromStitch.createElement('div')
  regionRow.className = 'mt-4 pt-3 border-t border-outline-variant/60 flex items-center gap-3'
  const provinceLabel = documentFromStitch.createElement('label')
  provinceLabel.htmlFor = 'checkoutProvince'
  provinceLabel.textContent = 'Tỉnh/Thành phố'
  provinceLabel.className = 'text-body-sm text-on-surface-variant shrink-0'
  const provinceInput = documentFromStitch.createElement('input')
  provinceInput.id = 'checkoutProvince'
  provinceInput.required = true
  provinceInput.placeholder = 'Nhập tỉnh/thành phố'
  provinceInput.value = activeAddress?.province || authUser.province || ''
  provinceInput.setAttribute('value', activeAddress?.province || authUser.province || '')
  provinceInput.className = 'min-w-0 flex-1 rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
  regionRow.append(provinceLabel, provinceInput)
  selectedCard.after(regionRow)

  const newAddressForm = documentFromStitch.createElement('div')
  newAddressForm.id = 'checkoutNewAddressForm'
  newAddressForm.hidden = true
  newAddressForm.className = 'mt-4 rounded-xl border border-outline-variant bg-surface-container-low p-4 flex flex-col gap-3'
  newAddressForm.style.display = 'none'
  newAddressForm.innerHTML = '<label class="text-sm font-semibold text-on-surface" for="newCheckoutAddressLabel">Tên địa chỉ</label><input id="newCheckoutAddressLabel" class="h-10 rounded-lg border border-outline-variant bg-white px-3 text-body-sm" placeholder="Ví dụ: Nhà riêng, Công ty" value="Nhà riêng"/><label class="text-sm font-semibold text-on-surface" for="newCheckoutAddress">Địa chỉ nhận hàng</label><textarea id="newCheckoutAddress" rows="2" class="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-body-sm" placeholder="Nhập địa chỉ đầy đủ"></textarea><label class="text-sm font-semibold text-on-surface" for="newCheckoutProvince">Tỉnh/Thành phố</label><input id="newCheckoutProvince" class="h-10 rounded-lg border border-outline-variant bg-white px-3 text-body-sm" placeholder="Nhập tỉnh/thành phố"/><button type="button" data-save-new-address="true" class="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container"><span class="material-symbols-outlined text-[18px]">save</span>Lưu địa chỉ mới</button>'
  regionRow.after(newAddressForm)

  // Danh sách lựa chọn đã hiển thị địa chỉ; giữ hai trường cho quy trình checkout
  // nhưng ẩn phần nhập/xem lặp lại bên dưới danh sách.
  selectedCard.hidden = true
  regionRow.hidden = true
  selectedCard.style.display = 'none'
  regionRow.style.display = 'none'
  addressInput.required = false
  provinceInput.required = false
  if (activeAddress) {
    addressInput.readOnly = true
    provinceInput.readOnly = true
  }
  const currentAddressLabel = selectedCard.querySelector('[data-current-address-label]')
  if (currentAddressLabel) currentAddressLabel.textContent = activeAddress?.label || 'Địa chỉ mặc định'

  const receiverSection = [...documentFromStitch.body.querySelectorAll('section')]
    .find((section) => [...section.querySelectorAll('h2')].some((heading) => heading.textContent.includes('Thông tin nhận hàng')))
  const addressHeading = addressSection.querySelector('h2')
  const receiverHeading = receiverSection?.querySelector('h2')
  const addStepNumber = (heading, number) => {
    if (!heading || heading.querySelector('[data-checkout-step]')) return
    const badge = documentFromStitch.createElement('span')
    badge.dataset.checkoutStep = String(number)
    badge.className = 'mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f1e5] align-middle text-[11px] font-bold text-[#176b36]'
    badge.textContent = String(number)
    heading.prepend(badge)
  }
  addStepNumber(receiverHeading, 1)
  addStepNumber(addressHeading, 2)

  const deliveryMethodSection = [...documentFromStitch.body.querySelectorAll('section')]
    .find((section) => [...section.querySelectorAll('h2')].some((heading) => heading.textContent.includes('Hình thức nhận hàng')))
  const orderNote = documentFromStitch.body.querySelector('#orderNote')
  const noteField = orderNote?.closest('.mt-5') || orderNote?.parentElement
  const paymentSection = documentFromStitch.createElement('section')
  paymentSection.className = 'rounded-xl border border-[#c8d9c8] bg-white p-4 shadow-sm sm:p-5'
  paymentSection.innerHTML = '<h2 class="mb-4 flex items-center text-base font-semibold text-[#1f2d23]"><span class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f1e5] text-[11px] font-bold text-[#176b36]">3</span>Phương thức thanh toán</h2><div class="flex flex-col gap-2"><label class="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-[#08733a] bg-[#e8f3e8] p-3 has-[:checked]:border-[#08733a] has-[:checked]:bg-[#e8f3e8]"><input type="radio" name="checkoutPaymentMethod" value="BankTransfer" checked class="mt-1 accent-[#08733a]" aria-label="Chuyển khoản ngân hàng QR"><span class="material-symbols-outlined text-[19px] text-[#08733a]">qr_code_2</span><span class="min-w-0"><strong class="block text-sm font-semibold text-[#24372a]">Chuyển khoản ngân hàng (QR) <span class="material-symbols-outlined align-middle text-[14px] text-[#08733a]">qr_code_2</span></strong><span class="mt-1 block text-xs text-[#5a6b5d]">Quét mã QR để chuyển khoản.</span></span></label></div>'
  if (deliveryMethodSection) {
    deliveryMethodSection.after(paymentSection)
    deliveryMethodSection.remove()
  } else addressSection.after(paymentSection)
  if (noteField) {
    noteField.className = 'mt-4 flex flex-col gap-1.5'
    paymentSection.append(noteField)
  }
}

function applyCheckoutSummary(documentFromStitch, route, products, cart, farmBoxes, serverCartItems, availableCombos) {
  if (route.path !== '/checkout') return
  const aside = [...documentFromStitch.body.querySelectorAll('aside')]
    .find((element) => [...element.querySelectorAll('h2')].some((heading) => heading.textContent.includes('Tóm tắt đơn hàng')))
  const itemList = aside?.querySelector('.space-y-4.my-4')
  if (!aside || !itemList) return

  const entries = []
  const keys = new Set()
  const addEntry = (entry) => {
    if (!entry || !entry.id || Number(entry.quantity) <= 0) return
    const key = `${entry.itemType}:${entry.id}${entry.itemType === 'FarmBox' ? `:${entry.weekId || ''}` : ''}`
    if (keys.has(key)) return
    keys.add(key)
    entries.push(entry)
  }

  if (Array.isArray(serverCartItems)) {
    serverCartItems.forEach((item) => addEntry({
      id: item.id,
      itemType: item.itemType,
      weekId: item.weekId || '',
      name: item.name || 'Mặt hàng trong giỏ',
      image: item.image || '',
      price: Number(item.unitPrice) || 0,
      quantity: Number(item.quantity) || 0,
      unit: item.unit || (item.itemType === 'FarmBox' ? 'hộp' : item.itemType === 'Combo' ? 'combo' : ''),
      note: '',
    }))
  }

  Object.entries(cart || {}).forEach(([cartKey, quantityValue]) => {
    const quantity = Number(quantityValue) || 0
    if (quantity <= 0) return
    if (cartKey.startsWith('farmBox:')) {
      const [, boxId, weekId] = cartKey.split(':')
      const box = farmBoxes.find((item) => item.id === boxId)
      const week = box?.weeks?.find((item) => item.id === weekId)
      return addEntry({
        id: boxId, weekId, itemType: 'FarmBox', name: box?.name || 'Farm Box',
        image: box?.image || '', price: Number(week?.price ?? box?.price) || 0,
        quantity, unit: 'hộp', note: week ? `Tuần nhận: ${new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(week.startDate))} – ${new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date(week.endDate))}` : '',
      })
    }
    if (cartKey.startsWith('combo:')) {
      const comboKey = cartKey.slice('combo:'.length)
      const comboIndex = imperfectComboPaths.indexOf(comboKey)
      const staticCombo = comboIndex >= 0 ? getImperfectCardData(comboIndex) : null
      const combo = availableCombos.find((item) => item.id === comboKey)
        || (staticCombo ? findAvailableComboByName(availableCombos, staticCombo.title) : null)
      return addEntry({
        id: combo?.id || comboKey, itemType: 'Combo', name: combo?.name || staticCombo?.title || 'Combo',
        image: combo?.image || staticCombo?.image || '', price: Number(combo?.price ?? staticCombo?.price) || 0,
        quantity, unit: 'combo',
      })
    }
    const product = products.find((item) => item.id === cartKey)
    addEntry({
      id: cartKey, itemType: 'Product', name: product?.name || 'Nông sản', image: product?.image || '',
      price: Number(product?.price) || 0, quantity, unit: product?.unit || 'kg',
    })
  })

  itemList.className = 'my-4 max-h-[420px] space-y-0 overflow-y-auto'
  itemList.replaceChildren()
  if (!entries.length) {
    const empty = documentFromStitch.createElement('p')
    empty.className = 'py-5 text-center text-sm text-on-surface-variant'
    empty.textContent = 'Giỏ hàng của bạn đang trống.'
    itemList.append(empty)
  }
  entries.forEach((item, index) => {
    const row = documentFromStitch.createElement('div')
    row.className = `flex items-center gap-3 py-3 ${index ? 'border-t border-outline-variant/60' : ''}`
    const image = documentFromStitch.createElement('img')
    image.src = item.image || ''
    image.alt = item.name
    image.className = 'h-14 w-14 shrink-0 rounded-lg border border-outline-variant object-cover'
    const details = documentFromStitch.createElement('div')
    details.className = 'min-w-0 flex-1'
    const name = documentFromStitch.createElement('h3')
    name.className = 'truncate text-sm font-medium text-on-surface'
    name.textContent = item.name
    const unitPrice = documentFromStitch.createElement('p')
    unitPrice.className = 'text-xs text-on-surface-variant'
    unitPrice.textContent = `${item.quantity} ${item.unit} × ${money(item.price)}${item.note ? ` · ${item.note}` : ''}`
    details.append(name, unitPrice)
    const lineTotal = documentFromStitch.createElement('span')
    lineTotal.className = 'shrink-0 text-sm font-semibold text-on-surface'
    lineTotal.textContent = money(item.price * item.quantity)
    row.append(image, details, lineTotal)
    itemList.append(row)
  })

  const subtotal = entries.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = subtotal >= 300000 ? 0 : 30000
  const amountDue = subtotal + shippingFee
  const moneyRows = [...aside.querySelectorAll('.flex.items-center.justify-between, .flex.items-baseline.justify-between')]
  const subtotalRow = moneyRows.find((row) => row.textContent.includes('Tạm tính'))
  if (subtotalRow?.lastElementChild) subtotalRow.lastElementChild.textContent = money(subtotal)
  const shippingRow = moneyRows.find((row) => row.textContent.includes('Phí giao hàng'))
  if (shippingRow) {
    shippingRow.innerHTML = `<span>Phí giao hàng</span><span class="font-semibold text-[#26372b]">${shippingFee ? money(shippingFee) : 'Miễn phí'}</span>`
    const shippingNote = shippingRow.parentElement?.querySelector('p')
    if (shippingNote) shippingNote.textContent = shippingFee
      ? 'Phí giao hàng đồng giá 30.000đ. Đơn từ 300.000đ được miễn phí giao hàng.'
      : 'Đơn từ 300.000đ được miễn phí giao hàng.'
  }
  const totalRow = moneyRows.find((row) => row.textContent.includes('Tổng tiền'))
  if (totalRow?.lastElementChild) totalRow.lastElementChild.textContent = money(amountDue)
}

function applyCustomerOrdersScreen(documentFromStitch, route, customerOrders, orderFilter, customerOrdersError = '', products = [], availableCombos = [], farmBoxes = [], authUser = null) {
  if (route.path !== '/orders') return
  documentFromStitch.body.style.backgroundColor = '#f0faf0'
  const main = documentFromStitch.body.querySelector('main')
  if (!main) return
  main.style.backgroundColor = '#f0faf0'
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
  const statuses = ['Chờ thanh toán', 'Đã thanh toán', 'Đang xử lý', 'Đang giao', 'Đã nhận', 'Đã hủy']
  const orders = Array.isArray(customerOrders) ? customerOrders : []
  const sideNav = documentFromStitch.body.querySelector('aside nav')
  const sidebar = documentFromStitch.body.querySelector('aside')
  if (sidebar && !sidebar.querySelector('[data-order-support-card]')) {
    const support = documentFromStitch.createElement('div')
    support.dataset.orderSupportCard = 'true'
    support.className = 'mt-4 flex items-start gap-2 rounded-xl bg-[#e7f2e6] p-3 text-xs text-[#48614b]'
    support.innerHTML = '<span class="material-symbols-outlined rounded-lg bg-white p-1 text-[#187541]">support_agent</span><span><strong class="block text-[#314a35]">Cần hỗ trợ đơn hàng?</strong>Gọi ngay hotline <b class="text-[#08733a]">1900 6886</b><br><span class="text-[10px]">(8h00 - 21h00)</span></span>'
    sidebar.append(support)
  }
  if (authUser) {
    documentFromStitch.body.querySelectorAll('aside *').forEach((element) => {
      if (element.children.length) return
      const text = element.textContent.trim()
      if (text === 'Nguyễn Văn A') element.textContent = authUser.fullName || 'Tài khoản GreenNova'
      if (text === '0901 234 567') element.textContent = authUser.phone || ''
    })
  }
  const addressLink = [...(sideNav?.querySelectorAll('a') || [])].find((link) => /Địa chỉ nhận hàng|Sổ địa chỉ giao hàng/.test(link.textContent))
  if (addressLink) {
    addressLink.href = '/account/addresses'
    addressLink.dataset.route = '/account/addresses'
    const addressLabel = [...addressLink.querySelectorAll('span')].at(-1)
    if (addressLabel) addressLabel.textContent = 'Sổ địa chỉ giao hàng'
  }
  let refundLink = [...(sideNav?.querySelectorAll('a') || [])].find((link) => /Tài khoản nhận hoàn tiền/.test(link.textContent))
  if (!refundLink && sideNav) {
    refundLink = documentFromStitch.createElement('a')
    refundLink.className = 'flex items-center space-x-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-[#1F2A22] hover:bg-[#F8F9F3] hover:text-[#1B723B] transition-colors group'
    refundLink.innerHTML = '<span class="material-symbols-outlined text-[#5B6B60]">account_balance</span><span>Tài khoản nhận hoàn tiền</span>'
    addressLink?.after(refundLink)
  }
  if (refundLink) {
    refundLink.href = '/account/refund-account'
    refundLink.dataset.route = '/account/refund-account'
  }
  let passwordLink = [...(sideNav?.querySelectorAll('a') || [])].find((link) => /Đổi mật khẩu/.test(link.textContent))
  if (!passwordLink && sideNav) {
    passwordLink = documentFromStitch.createElement('a')
    passwordLink.className = 'flex items-center space-x-3 px-3 py-2.5 rounded-[8px] text-sm font-medium text-[#1F2A22] hover:bg-[#F8F9F3] hover:text-[#1B723B] transition-colors group'
    passwordLink.innerHTML = '<span class="material-symbols-outlined text-[#5B6B60]">lock_reset</span><span>Đổi mật khẩu</span>'
    refundLink?.after(passwordLink)
  }
  if (passwordLink) {
    passwordLink.href = '/account/change-password'
    passwordLink.dataset.route = '/account/change-password'
  }
  const canonicalStatus = (order) => {
    const rawStatus = normalizeLabel(order?.status || '')
    const aliases = {
      'cho thanh toan': 'Chờ thanh toán',
      'pending': 'Chờ thanh toán',
      'pending payment': 'Chờ thanh toán',
      'awaiting payment': 'Chờ thanh toán',
      'da thanh toan': 'Đã thanh toán',
      'paid': 'Đã thanh toán',
      'dang xu ly': 'Đang xử lý',
      'processing': 'Đang xử lý',
      'dang giao': 'Đang giao',
      'dang van chuyen': 'Đang giao',
      'shipping': 'Đang giao',
      'shipped': 'Đang giao',
      'da nhan': 'Đã nhận',
      'da nhan hang': 'Đã nhận',
      'delivered': 'Đã nhận',
      'da huy': 'Đã hủy',
      'da huy don': 'Đã hủy',
      'cancelled': 'Đã hủy',
      'canceled': 'Đã hủy',
    }
    return aliases[rawStatus] || statuses.find((status) => normalizeLabel(status) === rawStatus) || 'Chưa cập nhật'
  }
  const filterGroup = [...main.querySelectorAll('button')]
    .find((button) => /^Tất cả\s*\(/.test(button.textContent.trim()))?.parentElement
  if (filterGroup) {
    filterGroup.replaceChildren()
    const filters = ['Tất cả', 'Đang giao', 'Đã giao', 'Hủy & Hoàn tiền']
    const matchesFilter = (order, filter) => filter === 'Tất cả'
      || (filter === 'Đã giao' && canonicalStatus(order) === 'Đã nhận')
      || (filter === 'Hủy & Hoàn tiền' && canonicalStatus(order) === 'Đã hủy')
      || canonicalStatus(order) === filter
    filters.forEach((status) => {
      const count = orders.filter((order) => matchesFilter(order, status)).length
      const button = documentFromStitch.createElement('button')
      button.type = 'button'
      button.dataset.orderStatusFilter = status === 'Đã giao' ? 'Đã nhận' : status === 'Hủy & Hoàn tiền' ? 'Đã hủy' : status
      const active = orderFilter === status || (status === 'Đã giao' && orderFilter === 'Đã nhận') || (status === 'Hủy & Hoàn tiền' && orderFilter === 'Đã hủy')
      button.setAttribute('aria-pressed', String(active))
      button.className = `px-4 py-2 rounded-full text-xs font-${active ? 'semibold' : 'medium'} ${active ? 'bg-[#1B723B] text-white shadow-sm' : 'bg-white text-[#5B6B60] border border-[#DCE3D8] hover:border-[#1B723B] hover:text-[#1B723B]'} shrink-0 transition-all`
      button.textContent = `${status} (${count})`
      button.title = status === 'Tất cả' ? `Hiển thị tất cả ${count} đơn hàng` : `Lọc ${count} đơn hàng: ${status}`
      filterGroup.append(button)
    })
  }

  const contentSection = main.querySelector('section.flex-1')
  const heading = contentSection?.querySelector('h1')
  if (heading) heading.textContent = 'Lịch Sử Đơn Hàng'
  const subtitle = heading?.nextElementSibling
  if (subtitle) subtitle.textContent = 'Theo dõi tình trạng đơn hàng, lịch giao và thông tin thanh toán của bạn.'
  if (contentSection && !contentSection.querySelector('[data-order-summary-cards]')) {
    const inTransitCount = orders.filter((order) => canonicalStatus(order) === 'Đang giao').length
    const refundedOrders = orders.filter((order) => canonicalStatus(order) === 'Đã hủy' && order.refundStatus)
    const refundedTotal = refundedOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
    const summaryCards = documentFromStitch.createElement('div')
    summaryCards.dataset.orderSummaryCards = 'true'
    summaryCards.className = 'mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3'
    summaryCards.innerHTML = `<div class="flex items-center justify-between rounded-xl border border-[#e3ece2] bg-white p-4 shadow-sm"><div><p class="text-[10px] font-bold uppercase tracking-wide text-[#68786a]">Tổng đơn đã đặt</p><p class="mt-1 text-xl font-bold text-[#213527]">${customerOrders ? String(orders.length).padStart(2, '0') : '—'} <span class="text-xs font-medium text-[#667569]">đơn</span></p></div><span class="material-symbols-outlined rounded-lg bg-[#e9f5e8] p-2 text-[#187541]">receipt_long</span></div><div class="flex items-center justify-between rounded-xl border border-[#e3ece2] bg-white p-4 shadow-sm"><div><p class="text-[10px] font-bold uppercase tracking-wide text-[#187541]">Đang vận chuyển</p><p class="mt-1 text-xl font-bold text-[#213527]">${customerOrders ? String(inTransitCount).padStart(2, '0') : '—'} <span class="text-xs font-medium text-[#667569]">đơn hàng</span></p></div><span class="material-symbols-outlined rounded-lg bg-[#d8efdc] p-2 text-[#187541]">local_shipping</span></div><div class="flex items-center justify-between rounded-xl border border-[#e3ece2] bg-white p-4 shadow-sm"><div><p class="text-[10px] font-bold uppercase tracking-wide text-[#637868]">Hoàn tiền đang xử lý</p><p class="mt-1 text-xl font-bold text-[#213527]">${customerOrders ? money(refundedTotal) : '—'}</p><span class="text-[10px] text-[#68786a]">${refundedOrders.length} đơn hàng</span></div><span class="material-symbols-outlined rounded-lg bg-[#fff2e5] p-2 text-[#a65a12]">currency_exchange</span></div>`
    const titleBlock = heading?.parentElement
    titleBlock?.after(summaryCards)
  }

  const pendingFarmBoxChanges = orders.reduce((sum, order) => sum + (order.items || []).filter((item) => (
    item.itemType === 'FarmBox' && item.cropFailureResolution?.status === 'Chờ khách xác nhận'
  )).length, 0)
  let farmBoxChangeLink = contentSection?.querySelector('[data-farmbox-change-link]')
  if (pendingFarmBoxChanges > 0 && contentSection && customerOrders) {
    if (!farmBoxChangeLink) {
      farmBoxChangeLink = documentFromStitch.createElement('a')
      farmBoxChangeLink.dataset.farmboxChangeLink = 'true'
      farmBoxChangeLink.href = '/farm-box/thuc-don'
      farmBoxChangeLink.dataset.route = '/farm-box/thuc-don'
      farmBoxChangeLink.className = 'mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#b9d9bd] bg-[#e8f4e8] px-4 py-3 text-sm font-semibold text-[#155f32] no-underline hover:bg-[#deefdf]'
      farmBoxChangeLink.innerHTML = '<span class="flex items-center gap-2"><span class="material-symbols-outlined">swap_horiz</span><span data-farmbox-change-link-text></span></span><span class="material-symbols-outlined">arrow_forward</span>'
      const summaryCards = contentSection.querySelector('[data-order-summary-cards]')
      summaryCards?.after(farmBoxChangeLink)
    }
    const label = farmBoxChangeLink.querySelector('[data-farmbox-change-link-text]')
    if (label) label.textContent = `Có ${pendingFarmBoxChanges} Farm Box cần bạn xác nhận thay đổi`
  } else farmBoxChangeLink?.remove()

  const orderList = main.querySelector('table')?.closest('div.bg-white.border')
  const filteredOrders = orderFilter === 'Tất cả'
    ? orders
    : orderFilter === 'Đã giao'
      ? orders.filter((order) => canonicalStatus(order) === 'Đã nhận')
      : orderFilter === 'Hủy & Hoàn tiền'
        ? orders.filter((order) => canonicalStatus(order) === 'Đã hủy')
        : orders.filter((order) => canonicalStatus(order) === orderFilter)
  if (orderList) {
    if (customerOrdersError) {
      orderList.innerHTML = `<div role="alert" class="p-8 text-center text-sm text-[#B42318]">${escapeHtml(customerOrdersError)}</div>`
    } else if (!customerOrders) {
      orderList.innerHTML = '<div class="p-8 text-center text-sm text-[#5B6B60]">Đang tải đơn hàng…</div>'
    } else if (!filteredOrders.length) {
      const message = orders.length ? 'Không có đơn hàng ở trạng thái này.' : 'Bạn chưa có đơn hàng nào.'
      orderList.innerHTML = `<div class="flex flex-col items-center px-6 py-12 text-center"><span class="material-symbols-outlined flex h-14 w-14 items-center justify-center rounded-full bg-[#E3F0E5] text-2xl text-[#1B723B]">receipt_long</span><p class="mt-3 font-semibold text-[#1F2A22]">${message}</p><p class="mt-1 text-sm text-[#5B6B60]">Các đơn hàng mới sẽ được lưu tại đây để bạn tiện theo dõi.</p><a href="/nong-san" data-route="/nong-san" class="mt-4 rounded-lg bg-[#1B723B] px-4 py-2 text-sm font-semibold text-white no-underline">Tiếp tục mua sắm</a></div>`
    } else {
      orderList.className = 'flex flex-col gap-4 mb-6'
      orderList.innerHTML = filteredOrders.map((order, orderIndex) => {
        const created = order.createdAt ? new Date(order.createdAt) : null
        const validDate = created && !Number.isNaN(created.getTime())
        const dateText = validDate ? created.toLocaleDateString('vi-VN') : '—'
        const timeText = validDate ? created.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
        const expectedDelivery = validDate ? new Date(created) : null
        if (expectedDelivery) {
          expectedDelivery.setDate(expectedDelivery.getDate() + 2)
          expectedDelivery.setHours(6, 30, 0, 0)
        }
        const items = Array.isArray(order.items) ? order.items : []
        const itemCount = items.length
        const status = canonicalStatus(order)
        const statusTone = {
          'Chờ thanh toán': 'bg-[#FFF4D6] text-[#8A5A00]',
          'Đã thanh toán': 'bg-[#E8F1FF] text-[#2457A6]',
          'Đang xử lý': 'bg-[#EAF7EA] text-[#1B723B]',
          'Đang giao': 'bg-[#FBE8D7] text-[#854B16]',
          'Đã nhận': 'bg-[#E3F0E5] text-[#1B723B]',
          'Đã hủy': 'bg-[#FDE8E6] text-[#B42318]',
        }[status] || 'bg-[#F1F3EF] text-[#5B6B60]'
        const statusLabel = status === 'Đang giao' ? 'Đang vận chuyển' : status === 'Đã nhận' ? 'Giao thành công' : status
        const statusIcon = status === 'Đang giao' ? 'local_shipping'
          : status === 'Đã nhận' ? 'check_circle'
            : status === 'Đã hủy' ? 'cancel'
              : status === 'Đã thanh toán' ? 'check_circle'
                : status === 'Đang xử lý' ? 'inventory_2' : 'schedule'
        const pendingPayment = status === 'Chờ thanh toán' && order.expiredAt
        const deadline = pendingPayment ? new Date(order.expiredAt) : null
        const deadlineText = deadline && !Number.isNaN(deadline.getTime())
          ? `<span class="mt-1 block text-[11px] font-medium text-[#8A5A00]">Hạn thanh toán: ${deadline.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>`
          : ''
        const paymentAction = status === 'Chờ thanh toán'
          ? `<a href="/checkout/payment?orderId=${encodeURIComponent(order.id || '')}" data-route="/checkout/payment?orderId=${encodeURIComponent(order.id || '')}" class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1B723B] px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#14572D]" aria-label="Thanh toán QR đơn ${escapeHtml(order.orderCode || '')}"><span class="material-symbols-outlined text-[18px]">qr_code_2</span>Thanh toán</a>`
          : ''
        const preview = items.slice(0, 3).map((item) => {
          const source = item.itemType === 'FarmBox'
            ? farmBoxes.find((entry) => entry.id === item.id)
            : item.itemType === 'Combo'
              ? availableCombos.find((entry) => entry.id === item.id)
              : products.find((entry) => entry.id === item.id)
          const image = item.image || item.imageUrl || source?.image || source?.imageUrl || ''
          const label = item.itemType === 'FarmBox' ? 'Farm Box' : item.itemType === 'Combo' ? 'Combo Imperfect' : 'Nông sản'
          const detail = `× ${Number(item.quantity) || 0}${item.itemType === 'FarmBox' ? ' hộp' : ''}`
          return `<div class="flex min-w-0 items-center gap-3 rounded-xl bg-[#F8F9F3] p-3">
            ${image ? `<img src="${escapeHtml(image)}" alt="" class="h-14 w-14 shrink-0 rounded-lg border border-[#DCE3D8] bg-white object-cover" loading="lazy">` : `<span class="material-symbols-outlined flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#DCE3D8] bg-white text-[24px] text-[#1B723B]">${item.itemType === 'FarmBox' ? 'inventory_2' : item.itemType === 'Combo' ? 'nutrition' : 'eco'}</span>`}
            <span class="min-w-0 flex-1"><strong class="block truncate text-sm font-semibold text-[#1F2A22]">${escapeHtml(item.name || label)}</strong><span class="mt-0.5 block text-xs text-[#5B6B60]">${label} · ${detail}</span></span>
            <strong class="shrink-0 text-sm font-semibold text-[#1F2A22]">${money(Number(item.lineTotal) || 0)}</strong>
          </div>`
        }).join('')
        const moreItems = itemCount > 3 ? `<p class="px-1 text-xs text-[#5B6B60]">và ${itemCount - 3} mặt hàng khác</p>` : ''
        const allItems = items.map((item) => {
          const source = item.itemType === 'FarmBox'
            ? farmBoxes.find((entry) => entry.id === item.id)
            : item.itemType === 'Combo'
              ? availableCombos.find((entry) => entry.id === item.id)
              : products.find((entry) => entry.id === item.id)
          const image = item.image || item.imageUrl || source?.image || source?.imageUrl || ''
          const label = item.itemType === 'FarmBox' ? 'Farm Box' : item.itemType === 'Combo' ? 'Combo Imperfect' : 'Nông sản'
          const quantity = Number(item.quantity) || 0
          const unit = item.itemType === 'FarmBox' ? 'hộp' : item.itemType === 'Combo' ? 'combo' : source?.unit || ''
          return `<div class="flex items-center gap-3 border-t border-[#E8EEE7] py-3">
            ${image ? `<img src="${escapeHtml(image)}" alt="" class="h-12 w-12 shrink-0 rounded-lg object-cover" loading="lazy">` : `<span class="material-symbols-outlined flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-[#1B723B]">${item.itemType === 'FarmBox' ? 'inventory_2' : item.itemType === 'Combo' ? 'nutrition' : 'eco'}</span>`}
            <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-[#1F2A22]">${escapeHtml(item.name || label)}</p><p class="text-xs text-[#5B6B60]">${label} · ${quantity} ${unit}</p></div>
            <strong class="text-sm text-[#1F2A22]">${money(Number(item.lineTotal) || 0)}</strong>
          </div>`
        }).join('')
        const detailPath = `/orders/detail?orderId=${encodeURIComponent(order.id || '')}`
        const paymentLabel = order.paymentMethod === 'CashOnDelivery' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản VietQR'
        const refundNote = status === 'Đã hủy'
          ? `<div class="mt-3 rounded-lg border border-[#f6d8d5] bg-[#fff5f4] p-3 text-xs text-[#93443d]"><strong>Lý do hủy:</strong> ${escapeHtml(order.cancelReason || 'Đơn hàng đã được hủy theo yêu cầu.')}<div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3"><div class="rounded-md bg-white/80 p-2"><span class="block text-[9px] text-[#8b7774]">Giá trị đơn hàng</span><strong>${money(Number(order.totalAmount) || 0)}</strong></div><div class="rounded-md bg-white/80 p-2"><span class="block text-[9px] text-[#8b7774]">Phí giao hàng</span><strong>${money(Number(order.shippingFee) || 0)}</strong></div><div class="rounded-md bg-white/80 p-2"><span class="block text-[9px] text-[#8b7774]">${order.refundStatus ? 'Trạng thái hoàn tiền' : 'Thanh toán'}</span><strong class="mt-0.5 inline-flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">${order.refundStatus ? 'currency_exchange' : 'payments'}</span>${escapeHtml(order.refundStatus || (order.paymentMethod === 'CashOnDelivery' ? 'Chưa thu tiền' : 'Chưa hoàn tiền'))}</strong></div></div></div>`
          : ''
        const expectedLabel = expectedDelivery ? expectedDelivery.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa cập nhật'
        const orderAccent = status === 'Đã nhận' ? 'border-l-[#16823b]' : status === 'Đã hủy' ? 'border-l-[#d62828]' : 'border-l-[#8b5e34]'
        return `<article data-order-id="${escapeHtml(order.id || '')}" class="overflow-hidden rounded-xl border border-[#DCE3D8] border-l-[6px] ${orderAccent} bg-white shadow-sm transition-shadow hover:shadow-md">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3D8] bg-white px-5 py-4 sm:px-6">
            <div class="min-w-0"><div class="flex flex-wrap items-center gap-x-2 gap-y-1"><p class="font-heading text-sm font-bold text-[#1F2A22]">Mã đơn: #${escapeHtml(order.orderCode || '—')}</p><span class="text-[10px] text-[#8a988b]">•</span><p class="text-[11px] text-[#657468]">Đặt ngày ${dateText}${timeText ? ` ${timeText}` : ''}</p></div><div class="mt-1.5 flex flex-wrap items-center gap-1.5"><span class="inline-flex items-center gap-1 rounded-full bg-[#edf7ed] px-2 py-1 text-[10px] font-semibold text-[#16713d]"><span class="material-symbols-outlined text-[13px]">${order.paymentMethod === 'CashOnDelivery' ? 'payments' : 'account_balance'}</span>${escapeHtml(paymentLabel)}</span>${order.paymentMethod === 'CashOnDelivery' ? '' : '<span class="inline-flex items-center gap-1 rounded-full bg-[#edf7ed] px-2 py-1 text-[10px] font-semibold text-[#16713d]">◉ VietQR NAPAS 24/7</span>'}</div></div>
            <div class="flex flex-col items-start gap-1 sm:items-end"><span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusTone}"><span class="material-symbols-outlined text-[15px]">${statusIcon}</span>${escapeHtml(statusLabel)}</span>${deadlineText}</div>
          </div>
          ${expectedDelivery && !['Đã hủy', 'Đã nhận'].includes(status) ? `<div class="mx-5 mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#EAF6E9] px-3 py-2.5 text-xs text-[#34593b] sm:mx-6"><span class="flex items-center gap-2"><span class="material-symbols-outlined text-[17px] text-[#188044]">schedule</span><span><strong>Dự kiến giao: ${expectedLabel}, 06:30–08:30</strong><span class="ml-1 text-[#648169]">· Tuyến giao nông sản sạch</span></span></span><span class="font-semibold text-[#168044]">● Đang theo dõi</span></div>` : ''}
          <div class="grid gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_175px]">
            <div class="flex min-w-0 flex-col gap-2">${preview}${moreItems}${refundNote}<div data-order-details="${orderIndex}" class="hidden rounded-xl border border-[#DCE3D8] bg-[#FBFCF8] px-4">${allItems}<div class="border-t border-[#E8EEE7] py-3 text-sm text-[#5B6B60]"><span class="font-semibold text-[#1F2A22]">Người nhận:</span> ${escapeHtml(order.receiver?.name || '—')} <span class="mx-1">·</span> ${escapeHtml(order.receiver?.phone || '')}<p class="mt-1">${escapeHtml([order.shippingAddress, order.province].filter(Boolean).join(', '))}</p></div></div><p class="mt-1 text-[10px] text-[#77867a]">Thanh toán: ${escapeHtml(order.payment?.status || (order.paymentMethod === 'CashOnDelivery' ? 'Thanh toán khi nhận hàng' : status))}</p></div>
            <div class="flex flex-col justify-between gap-3 rounded-xl bg-[#F8FAF6] p-3.5"><div><p class="text-[11px] text-[#667569]">${itemCount} loại mặt hàng</p><p class="mt-1 font-heading text-lg font-bold text-[#1B723B]">${money(Number(order.totalAmount) || 0)}</p></div><div class="flex flex-col gap-2"><a href="${detailPath}#shipping" data-route="${detailPath}#shipping" class="inline-flex items-center justify-center gap-1 rounded-lg border border-[#dce7da] bg-white px-2.5 py-2 text-[11px] font-semibold text-[#21653a] no-underline hover:border-[#1B723B]"><span class="material-symbols-outlined text-[15px]">local_shipping</span>Xem hình thức giao hàng</a><a href="${detailPath}" data-route="${detailPath}" class="inline-flex items-center justify-center gap-1 rounded-lg bg-[#00632e] px-2.5 py-2 text-[11px] font-semibold text-white no-underline hover:bg-[#14572D]"><span class="material-symbols-outlined text-[15px]">receipt_long</span>Chi tiết đơn</a>${paymentAction}</div></div>
          </div>
        </article>`
      }).join('')
    }
  }

  // Target only the small pagination summary. A broad search over all divs can
  // match the two-column page wrapper (which also contains that text) and wipe
  // the entire account/order layout when textContent is replaced.
  const summary = [...main.querySelectorAll('div.text-xs')]
    .find((element) => element.textContent.includes('Hiển thị') && element.textContent.includes('đơn hàng'))
  if (summary) {
    summary.textContent = customerOrdersError ? 'Không tải được lịch sử đơn hàng' : customerOrders ? `Hiển thị ${filteredOrders.length} trên tổng số ${orders.length} đơn hàng` : 'Đang tải danh sách đơn hàng…'
    summary.parentElement?.querySelector('div:last-child')?.remove()
  }
  const title = main.querySelector('h1')
  const description = title?.nextElementSibling
  if (description && customerOrders && !orders.length) description.textContent = 'Đơn hàng bạn đã đặt sẽ xuất hiện tại đây.'
}

function applyFarmBoxChangeConfirmationPage(documentFromStitch, route, customerOrders, customerOrdersError = '', emergencyOptions = []) {
  const inlineFarmBoxPage = route.path.startsWith('/farm-box/')
    && !['/farm-box/thay-doi', '/farm-box/cua-toi'].includes(route.path)
  if (route.path !== '/farm-box/thay-doi' && !inlineFarmBoxPage) return
  const main = documentFromStitch.body.querySelector('main')
  if (!main) return
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const query = new URLSearchParams(window.location.search)
  const targetFarmBoxId = query.get('farmBoxId')
  const targetWeekId = query.get('weekId')
  const sizeValue = normalizeLabel(query.get('size') || '')
  const requestedSize = sizeValue.includes('nho') ? 'small' : sizeValue.includes('vua') ? 'medium' : sizeValue.includes('lon') ? 'large' : ''
  const savedPolicy = requestedSize ? getFarmBoxIssueChoice(requestedSize, targetWeekId || '', targetFarmBoxId || '') : 'replace'
  const pending = (customerOrders || []).flatMap((order) => (order.items || [])
    .map((item) => ({ order, item }))
    .filter(({ item, order }) => item.itemType === 'FarmBox'
      && item.cropFailureResolution?.action === 'replace'
      && item.cropFailureResolution?.status === 'Chờ khách xác nhận'
      && (!targetFarmBoxId || item.id === targetFarmBoxId)
      && (!targetWeekId || item.weekId === targetWeekId)
      && !['Đã hủy', 'Đang giao', 'Đã nhận'].includes(order.status)))
  const cards = pending.map(({ order, item }) => {
    const resolution = item.cropFailureResolution
    const radioName = `farmBoxChange_${order.id}_${item.index}`
    const replacements = Array.isArray(resolution.replacements) && resolution.replacements.length
      ? resolution.replacements
      : resolution.replacement ? [resolution.replacement] : []
    const replacementContents = (resolution.replacementItems || []).map((entry) => `<li class="flex items-center gap-2 text-xs text-[#536659]">${entry.image ? `<img src="${escape(entry.image)}" alt="" class="h-7 w-7 rounded object-cover">` : ''}<span>${escape(entry.name)} · ${Number(entry.quantity).toLocaleString('vi-VN')} kg</span></li>`).join('')
    const replacementOptions = replacements.map((replacement, index) => `<label class="flex cursor-pointer items-start gap-3 rounded-xl border border-[#b9d9bd] bg-[#f4faf3] p-3 has-[:checked]:border-2 has-[:checked]:border-[#168044] has-[:checked]:bg-[#e9f5e8]"><input type="radio" name="${radioName}" value="accept" data-replacement-index="${index}" ${index === 0 ? 'checked' : ''} class="mt-1 accent-[#08733a]">${replacement.image ? `<img src="${escape(replacement.image)}" alt="${escape(replacement.name || 'Farm Box thay thế')}" class="h-14 w-14 rounded-lg object-cover">` : '<span class="material-symbols-outlined flex h-14 w-14 items-center justify-center rounded-lg bg-white text-2xl text-[#16753b]">inventory_2</span>'}<span class="min-w-0"><strong class="block text-sm text-[#25382a]">Nhận ${escape(replacement.name || 'Farm Box dự phòng')}</strong><span class="mt-1 block text-xs text-[#657468]">Giữ nguyên giá trị · Không thu thêm phí</span>${replacementContents ? `<ul class="mt-2 grid gap-1 sm:grid-cols-2">${replacementContents}</ul>` : ''}</span></label>`).join('')
    return `<article data-farmbox-change-card data-order-id="${escape(order.id)}" data-item-index="${Number(item.index) || 0}" class="rounded-xl border border-[#d8e7d7] bg-white p-4 sm:p-5"><div class="mb-3 flex flex-wrap items-center justify-between gap-3"><div><p class="text-xs font-semibold uppercase tracking-wide text-[#607266]">Đơn #${escape(order.orderCode || order.id)}</p><h2 class="mt-1 text-base font-bold text-[#213529]">${escape(item.name || 'Farm Box')}</h2><p class="mt-1 text-sm text-[#66766a]">${Number(item.quantity) || 0} hộp · ${money(Number(item.lineTotal) || 0)}</p></div><span class="rounded-full bg-[#fff2d9] px-3 py-1 text-xs font-semibold text-[#8c5a00]">Chờ bạn xác nhận</span></div><fieldset class="space-y-2"><legend class="mb-2 text-sm font-semibold text-[#344238]">Chọn phương án cho đơn này</legend>${replacementOptions}<label class="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dce5db] bg-white p-3 has-[:checked]:border-2 has-[:checked]:border-[#c62828] has-[:checked]:bg-[#fff5f4]"><input type="radio" name="${radioName}" value="cancel" class="mt-1 accent-[#c62828]"><span><strong class="block text-sm text-[#25382a]">Hủy Farm Box này và hoàn tiền 100%</strong><span class="mt-1 block text-xs text-[#657468]">Số tiền hoàn tối đa: ${money(Number(item.lineTotal) || 0)}.</span></span></label></fieldset></article>`
  }).join('')
  if (inlineFarmBoxPage) {
    if (!customerOrders || !cards) return
    const panel = documentFromStitch.createElement('section')
    panel.id = 'farmbox-emergency-proposals'
    panel.className = 'mx-auto my-8 w-full max-w-7xl px-4 sm:px-6'
    panel.innerHTML = `<div class="rounded-2xl border border-[#c8e0c9] bg-[#edf7ec] p-5 sm:p-6"><header class="mb-4"><p class="text-xs font-bold uppercase tracking-[.14em] text-[#176b36]">Phương án dự phòng</p><h2 class="mt-1 text-xl font-bold text-[#1f3425]">Farm Box gặp sự cố</h2><p class="mt-2 text-sm leading-6 text-[#5c6d60]">Admin đã cấu hình sẵn hộp thay thế. Bạn chủ động chọn nhận hộp thay thế hoặc yêu cầu hoàn tiền 100% cho Farm Box bị ảnh hưởng.</p></header><div class="flex flex-col gap-4">${cards}</div></div>`
    main.append(panel)
    return
  }
  const configuredOptions = (emergencyOptions || []).filter((option) => option.configured && (!requestedSize || option.size === requestedSize))
  const emergencyCards = configuredOptions.map((option) => `<article data-emergency-option-card="${escape(option.size)}" class="rounded-2xl border border-[#d8e7d7] bg-white p-5 shadow-sm"><div class="flex flex-wrap items-center gap-4">${option.image ? `<img src="${escape(option.image)}" alt="${escape(option.name)}" class="h-20 w-20 rounded-xl object-cover">` : '<span class="material-symbols-outlined flex h-20 w-20 items-center justify-center rounded-xl bg-[#e9f5e8] text-3xl text-[#176b36]">inventory_2</span>'}<div class="min-w-0 flex-1"><p class="text-xs font-bold uppercase tracking-wide text-[#647467]">Farm Box dự phòng · ${escape(option.label)}</p><h2 class="mt-1 text-lg font-bold text-[#213529]">${escape(option.name)}</h2><p class="mt-1 font-semibold text-[#08733a]">${money(Number(option.price) || 0)}</p></div></div>${option.items?.length ? `<div class="mt-4 grid gap-2 sm:grid-cols-2">${option.items.map((item) => `<div class="flex items-center gap-2 rounded-lg bg-[#f5faf4] p-2.5">${item.image ? `<img src="${escape(item.image)}" alt="" class="h-10 w-10 rounded-md object-cover">` : ''}<span class="min-w-0 flex-1 text-sm font-medium text-[#344238]">${escape(item.name)}<small class="mt-0.5 block text-xs font-normal text-[#69786c]">${Number(item.quantity).toLocaleString('vi-VN')} ${escape(item.unit || 'kg')} × ${money(Number(item.price) || 0)}/${escape(item.unit || 'kg')}</small></span></div>`).join('')}</div>` : ''}<p class="mt-3 rounded-lg bg-[#eaf5e9] px-3 py-2 text-xs text-[#526656]">Bạn có thể chọn nhận hộp này nếu xảy ra sự cố thu hoạch.</p></article>`).join('')
  const pendingContent = cards ? `<section class="mt-6"><h2 class="mb-3 text-lg font-bold text-[#213529]">Đơn hàng cần bạn xác nhận</h2><div class="flex flex-col gap-4">${cards}</div></section>` : ''
  const emptyState = !emergencyCards && !cards
    ? '<div class="rounded-xl border border-dashed border-[#c8d9c8] bg-white p-8 text-center text-sm text-[#667569]">Admin chưa cấu hình Farm Box dự phòng cho cỡ này.</div>'
    : ''
  const orderRows = pending.map(({ order, item }) => `<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4ece2] py-3 last:border-0"><div><p class="font-semibold text-[#26382b]">${escape(item.name || 'Farm Box')}</p><p class="mt-1 text-xs text-[#68786b]">Đơn #${escape(order.orderCode || order.id)} · ${Number(item.quantity) || 0} hộp · ${escape(order.receiver?.name || order.user?.fullName || '')}</p></div><strong class="text-[#08733a]">${money(Number(item.lineTotal) || 0)}</strong></div>`).join('')
  const orderTotal = pending.reduce((sum, { item }) => sum + (Number(item.lineTotal) || 0), 0)
  const uniqueOrders = [...new Map(pending.map(({ order }) => [order.id, order])).values()]
  const orderSubtotal = uniqueOrders.reduce((sum, order) => sum + (Number(order.subtotal) || 0), 0)
  const orderShipping = uniqueOrders.reduce((sum, order) => sum + (Number(order.shippingFee) || 0), 0)
  const orderGrandTotal = uniqueOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
  const paymentMethods = [...new Set(uniqueOrders.map((order) => order.paymentMethod === 'CashOnDelivery' ? 'Thanh toán khi nhận hàng' : order.paymentMethod === 'BankTransfer' ? 'Chuyển khoản ngân hàng (QR)' : order.paymentMethod).filter(Boolean))]
  const previewOption = configuredOptions[0]
  const packageSummary = pending.length
    ? orderRows
    : previewOption
      ? `<div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4ece2] py-3"><div><p class="font-semibold text-[#26382b]">${escape(previewOption.name)}</p><p class="mt-1 text-xs text-[#68786b]">Farm Box dự phòng · ${escape(previewOption.label)} · ${previewOption.items.length} loại nông sản</p></div><strong class="text-[#08733a]">${money(Number(previewOption.price) || 0)}</strong></div>`
      : ''
  const summaryTotal = pending.length ? orderGrandTotal || orderSubtotal + orderShipping : Number(previewOption?.price) || 0
  const policyPanels = `<section class="rounded-xl border border-[#d9e8d8] bg-white p-5 shadow-sm sm:p-7"><div class="mb-4"><span class="inline-flex rounded-full bg-[#ffe5d2] px-3 py-1 text-[11px] font-bold text-[#884318]">◉ Chính sách bảo vệ quyền lợi thành viên</span><h1 class="mt-3 flex items-center gap-2 text-xl font-bold text-[#203529] sm:text-2xl"><span class="material-symbols-outlined text-[#9a5000]">health_and_safety</span>Chủ động chọn phương án khi nông sản gặp sự cố</h1><p class="mt-2 max-w-4xl text-sm leading-6 text-[#596a5d]">Bạn tự chọn trước cách xử lý cho Farm Box này. Nếu chọn thay thế, hộp dự phòng cùng cỡ sẽ được áp dụng; nếu chọn hoàn tiền, Farm Box bị ảnh hưởng sẽ được hủy và hoàn theo giá trị tương ứng.</p></div><div class="space-y-4"><section class="rounded-xl bg-[#eaf6e9] p-4 sm:p-5"><div class="flex items-start gap-3"><input type="radio" name="farmbox-policy-choice" value="accept" data-farmbox-policy-choice class="mt-1 h-5 w-5 shrink-0 accent-[#08733a]" ${savedPolicy === 'replace' ? 'checked' : ''}><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h2 class="font-bold text-[#24372a]">Lựa chọn 1: Nhận Farm Box dự phòng cùng cỡ</h2><span class="rounded-full bg-[#08733a] px-2 py-0.5 text-[10px] font-bold text-white">Bạn chủ động chọn</span><span class="text-xs font-semibold text-[#176b36]">Không phụ thu</span></div><p class="mt-2 text-xs leading-5 text-[#536657]">Xem trước hộp thay thế do admin cấu hình và chọn nhận hộp này nếu nông sản trong gói gặp sự cố.</p>${emergencyCards ? `<div class="mt-4"><p class="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#536657]">Farm Box dự phòng${requestedSize ? ` · ${requestedSize === 'small' ? 'Loại nhỏ' : requestedSize === 'medium' ? 'Loại vừa' : 'Loại lớn'}` : ''}</p><div class="flex flex-col gap-3">${emergencyCards}</div></div>` : ''}</div></div></section><section class="rounded-xl border border-[#dce8dc] bg-[#f7faf6] p-4 sm:p-5"><div class="flex items-start gap-3"><input type="radio" name="farmbox-policy-choice" value="cancel" data-farmbox-policy-choice class="mt-1 h-5 w-5 shrink-0 accent-[#c62828]" ${savedPolicy === 'cancel' ? 'checked' : ''}><div class="flex-1"><h2 class="font-bold text-[#344238]">Lựa chọn 2: Không nhận thay thế, chọn hoàn tiền 100%</h2><p class="mt-1 text-xs leading-5 text-[#68776a]">Nếu bạn không đồng ý với phương án thay thế, bạn chủ động chọn hoàn tiền theo giá trị Farm Box bị ảnh hưởng.</p>${pending.length ? `<span class="mt-2 inline-flex rounded-full bg-[#e7f2e5] px-2.5 py-1 text-[11px] font-semibold text-[#176b36]">Hoàn tối đa ${money(orderTotal)}</span>` : ''}</div></div></section></div></section>`
  main.innerHTML = `<div class="min-h-screen bg-[#f1faf1] pb-10"><div class="border-b border-[#deeadc] bg-white/80 px-4 py-3 sm:px-6"><div class="mx-auto flex max-w-7xl items-center gap-2 text-xs text-[#617165]"><a href="/" data-route="/" class="text-[#176b36] no-underline">Trang chủ</a><span>›</span><a href="/farm-box" data-route="/farm-box" class="text-[#176b36] no-underline">Farm Box</a><span>›</span><strong class="text-[#344238]">Phương án thay thế</strong></div></div><div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8"><header class="mb-5 rounded-xl bg-[#e7f3e7] px-5 py-4"><p class="text-sm font-bold text-[#25382a]">Chủ động chọn phương án cho Farm Box của bạn</p><p class="mt-1 text-xs text-[#617165]">Bạn tự quyết định nhận hộp thay thế hoặc chọn hoàn tiền; lựa chọn được lưu cùng gói/đơn hàng.</p></header>${customerOrdersError ? `<div role="alert" class="mb-4 rounded-xl border border-red-200 bg-white p-5 text-sm text-red-700">${escape(customerOrdersError)}</div>` : ''}${policyPanels}${pendingContent}<section class="mt-6 rounded-xl border border-[#e0e9df] bg-white p-5 shadow-sm sm:p-7"><div class="flex items-center justify-between gap-3"><div><h2 class="font-bold text-[#25382a]">Thông tin đăng ký gói</h2><p class="mt-1 text-xs text-[#6a786d]">${pending.length ? 'Thông tin của đơn Farm Box đang chờ xử lý.' : 'Lựa chọn sẽ được lưu cho Farm Box bạn đang xem.'}</p></div><span class="material-symbols-outlined text-[#176b36]">inventory_2</span></div><div class="mt-3">${packageSummary || '<p class="py-3 text-sm text-[#68776a]">Chưa có thông tin gói để hiển thị.</p>'}</div><div class="space-y-2 border-t border-[#e4ece2] pt-3 text-xs text-[#68776b]"><div class="flex items-center justify-between gap-3"><span>Phương thức thanh toán</span><strong class="text-right font-semibold text-[#344238]">${pending.length ? escape(paymentMethods.join(' · ') || 'Chưa chọn') : 'Tính khi đặt hàng'}</strong></div><div class="flex items-center justify-between gap-3"><span>Phí vận chuyển nông sản sạch</span><strong class="text-right font-semibold text-[#344238]">${pending.length ? orderShipping === 0 ? 'Miễn phí' : money(orderShipping) : 'Tính ở bước thanh toán'}</strong></div></div><div class="mt-3 rounded-lg bg-[#eaf6e9] p-3"><p class="text-[10px] font-semibold uppercase tracking-wide text-[#66766a]">Phương án bạn đang chọn</p><p data-farmbox-policy-summary class="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#08733a]">${savedPolicy === 'cancel' ? '<span class="material-symbols-outlined text-sm">currency_exchange</span>Không nhận thay thế, hoàn tiền 100%' : '<span class="material-symbols-outlined text-sm">verified</span>Nhận Farm Box dự phòng cùng cỡ'}</p><p class="mt-1 text-[11px] leading-4 text-[#607066]">Lựa chọn do bạn quyết định và sẽ được lưu cùng Farm Box.</p></div><div class="mt-5 flex items-end justify-between gap-4 border-t border-[#e4ece2] pt-4"><div><h3 class="text-sm font-bold text-[#27392d]">${pending.length ? 'Tạm tính đơn hàng:' : 'Giá tham khảo:'}</h3><p class="mt-2 max-w-xl text-[11px] leading-4 text-[#68776b]">${pending.length ? 'Giá trị lấy theo đơn hàng đã đặt. Lựa chọn hoàn tiền chỉ áp dụng cho Farm Box bạn chọn.' : 'Giá hộp dự phòng tính theo đơn giá và định lượng nông sản; phí giao hàng xác định khi đặt gói.'}</p></div><div class="shrink-0 text-right"><strong class="text-xl font-bold text-[#08733a]">${money(summaryTotal)}</strong><p class="mt-0.5 text-[10px] text-[#728074]">Đã bao gồm VAT và phí sơ chế</p></div></div><button type="button" data-farmbox-change-confirm-all ${configuredOptions.length || pending.length ? '' : 'disabled'} class="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#19763d] px-5 text-sm font-bold text-white transition hover:bg-[#116333] disabled:cursor-not-allowed disabled:opacity-50"><span class="material-symbols-outlined text-base">check_circle</span>Xác nhận lựa chọn</button><p class="mt-2 text-center text-[11px] leading-4 text-[#738075]">Lựa chọn được lưu cùng Farm Box/đơn hàng. Bạn có thể tự chọn hoặc đổi phương án tại đây.</p></section><div class="mt-4 flex justify-end"><a href="/farm-box" data-route="/farm-box" class="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#b9d5bb] bg-white px-5 text-sm font-semibold text-[#176b36] no-underline">Quay lại Farm Box</a></div></div></div>`
}

function applyCustomerFarmBoxesScreen(documentFromStitch, route, customerOrders, farmBoxes, customerOrdersError = '') {
  if (route.path !== '/farm-box/cua-toi') return
  ;[...documentFromStitch.body.querySelectorAll('a')]
    .filter((link) => normalizeLabel(link.textContent).includes('uu dai diem xanh'))
    .forEach((link) => link.remove())
  const content = documentFromStitch.body.querySelector('aside')?.parentElement?.querySelector(':scope > main')
  if (!content) return

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
  const orders = Array.isArray(customerOrders) ? customerOrders : []
  const farmBoxOrders = orders.map((order) => ({
    order,
    items: (order.items || []).filter((item) => item.itemType === 'FarmBox'),
  })).filter((entry) => entry.items.length)

  content.innerHTML = `${customerOrdersError
      ? `<div role="alert" class="rounded-xl border border-error/30 bg-surface-container-lowest p-6 text-body-md text-error">${escapeHtml(customerOrdersError)}</div>`
      : !customerOrders
        ? '<section class="rounded-xl border border-surface-container bg-surface-container-lowest p-8 text-center text-on-surface-variant">Đang tải các FarmBox đã đặt…</section>'
        : !farmBoxOrders.length
          ? '<section class="rounded-xl border border-surface-container bg-surface-container-lowest p-8 text-center shadow-sm"><div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary"><span class="material-symbols-outlined">inventory_2</span></div><h2 class="mt-3 font-headline-sm text-headline-sm text-on-surface">Chưa có Farm Box nào</h2><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">Farm Box sẽ xuất hiện tại đây sau khi bạn đặt, kể cả khi đơn hàng có thêm mặt hàng khác.</p><a href="/farm-box" data-route="/farm-box" class="mt-5 inline-flex rounded-lg bg-primary-container px-4 py-2.5 font-label-md text-label-md text-on-primary no-underline">Khám phá Farm Box</a></section>'
          : farmBoxOrders.map(({ order, items }) => {
            const status = escapeHtml(order.status || 'Chưa cập nhật')
            const statusIsActive = ['Đang chuẩn bị', 'Đang xử lý', 'Đang giao'].includes(order.status)
            const lines = items.map((item) => {
              const box = (farmBoxes || []).find((candidate) => candidate.id === item.id)
              const week = (box?.weeks || []).find((candidate) => candidate.id === item.weekId)
              const weekDates = week?.startDate && week?.endDate
                ? `${new Date(week.startDate).toLocaleDateString('vi-VN')} – ${new Date(week.endDate).toLocaleDateString('vi-VN')}`
                : item.deliveryDate ? `Ngày giao dự kiến: ${new Date(`${item.deliveryDate}T00:00:00`).toLocaleDateString('vi-VN')}` : 'Lịch giao theo tuần đã chọn'
              return `<div class="flex flex-col gap-2 rounded-xl border border-surface-container bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex min-w-0 items-center gap-3"><img src="${escapeHtml(box?.image || item.image || '')}" alt="${escapeHtml(box?.name || item.name || 'Farm Box')}" class="h-16 w-20 shrink-0 rounded-lg border border-surface-container bg-white object-cover" loading="lazy"/><div class="min-w-0"><p class="font-title-md text-title-md text-on-surface">${escapeHtml(box?.name || item.name || 'Farm Box')}</p><p class="mt-1 font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(weekDates)}</p></div></div>
                <div class="font-body-md text-body-md text-on-surface">${Number(item.quantity) || 0} hộp <span class="mx-1 text-outline">·</span> <strong class="font-price-md text-price-md text-primary">${money(Number(item.lineTotal) || 0)}</strong></div>
              </div>`
            }).join('')
            return `<section class="relative overflow-hidden rounded-xl border border-surface-container bg-surface-container-lowest p-6 shadow-sm lg:p-7">
              <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-surface-container pb-5">
                <div><div class="mb-1 flex items-center gap-2"><span class="rounded-full bg-primary-container px-2.5 py-0.5 font-label-sm text-label-sm uppercase tracking-wide text-on-primary">Hộp Nông Trại</span><span class="font-body-sm text-body-sm font-semibold text-on-surface-variant">Mã đơn: ${escapeHtml(order.orderCode || '')}</span></div><h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">${escapeHtml(order.receiver?.name ? `FarmBox của ${order.receiver.name}` : 'FarmBox đã đặt')}</h2></div>
                <span class="inline-flex items-center gap-2 rounded-full border border-primary-fixed bg-secondary-container px-3 py-1.5 font-label-md text-label-md text-primary"><span class="h-2.5 w-2.5 rounded-full ${statusIsActive ? 'animate-pulse bg-primary' : 'bg-outline'}"></span><span class="font-bold">${status}</span></span>
              </div>
              <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div class="rounded-xl border border-surface-container bg-surface-container-low p-4"><span class="font-label-sm text-label-sm text-on-surface-variant">Ngày đặt</span><p class="mt-1 font-title-md text-title-md text-on-surface">${order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}</p></div>
                <div class="rounded-xl border border-surface-container bg-surface-container-low p-4"><span class="font-label-sm text-label-sm text-on-surface-variant">Tổng tiền đơn hàng</span><p class="mt-1 font-price-md text-price-md text-primary">${money(Number(order.totalAmount) || 0)}</p></div>
                <div class="rounded-xl border border-surface-container bg-surface-container-low p-4"><span class="font-label-sm text-label-sm text-on-surface-variant">Số gói Farm Box</span><p class="mt-1 font-title-md text-title-md text-on-surface">${items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)} hộp</p></div>
              </div>
              <div class="flex flex-col gap-3">${lines}</div>
              <div class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-surface-container pt-4">
                <span class="font-body-sm text-body-sm text-on-surface-variant">Người nhận: <strong class="font-label-md text-label-md text-on-surface">${escapeHtml(order.receiver?.name || '—')}</strong></span>
                <a href="/orders" data-route="/orders" class="inline-flex items-center gap-1 font-label-md text-label-md font-semibold text-primary no-underline hover:underline">Xem đơn hàng <span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>
              </div>
            </section>`
          }).join('')}
  `
}

function applyCustomerOrderDetailScreen(documentFromStitch, route, search, customerOrders, customerOrdersError = '', products = [], availableCombos = [], farmBoxes = []) {
  if (route.path !== '/orders/detail') return
  documentFromStitch.body.style.backgroundColor = '#f0faf0'
  const main = documentFromStitch.body.querySelector('main')
  if (!main) return
  main.style.backgroundColor = '#f0faf0'
  const orderId = new URLSearchParams(search || '').get('orderId') || ''
  const order = (customerOrders || []).find((entry) => entry.id === orderId)
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
  if (customerOrdersError || !customerOrders || !order) {
    const message = customerOrdersError || (!customerOrders ? 'Đang tải thông tin đơn hàng…' : 'Không tìm thấy đơn hàng này trong tài khoản của bạn.')
    main.innerHTML = `<div class="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-5 text-center"><span class="material-symbols-outlined flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-primary text-3xl">${customerOrdersError ? 'error' : 'receipt_long'}</span><h1 class="mt-4 font-headline-md text-headline-md text-on-surface">${customerOrdersError ? 'Không tải được đơn hàng' : !customerOrders ? 'Đang tải đơn hàng' : 'Không tìm thấy đơn hàng'}</h1><p class="mt-2 max-w-xl font-body-md text-body-md text-on-surface-variant">${escapeHtml(message)}</p><a href="/orders" data-route="/orders" class="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-container px-5 py-3 font-label-lg text-label-lg text-on-primary no-underline"><span class="material-symbols-outlined">arrow_back</span>Quay lại đơn hàng</a></div>`
    return
  }

  const status = order.status || 'Chưa cập nhật'
  const statusLabel = status === 'Đang giao' ? 'Đang vận chuyển' : status === 'Đã nhận' ? 'Giao thành công' : status
  const statusIcon = status === 'Đang giao' ? 'local_shipping' : status === 'Đã nhận' ? 'check_circle' : status === 'Đã hủy' ? 'cancel' : status === 'Đã thanh toán' ? 'check_circle' : status === 'Đang xử lý' ? 'inventory_2' : 'schedule'
  const statusTone = status === 'Đã hủy' ? 'bg-error-container text-error'
    : status === 'Chờ thanh toán' ? 'bg-[#FFF4D6] text-[#8A5A00]'
      : status === 'Đang giao' ? 'bg-[#FBE8D7] text-[#854B16]'
        : ['Đã nhận', 'Đang xử lý'].includes(status) ? 'bg-secondary-container text-primary'
        : 'bg-[#E8F1FF] text-[#2457A6]'
  const fmtDate = (value, withTime = false) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN', withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'long' })
  }
  const dateHistory = new Map((order.statusHistory || []).map((entry) => [entry.newStatus, entry.changedAt]))
  const statusSteps = ['Chờ thanh toán', 'Đã thanh toán', 'Đang xử lý', 'Đang giao', 'Đã nhận']
  const currentIndex = statusSteps.indexOf(status)
  const timeline = status === 'Đã hủy'
    ? `<div class="flex items-center gap-3 rounded-xl bg-error-container/60 p-4 text-error"><span class="material-symbols-outlined">cancel</span><div><strong>Đơn hàng đã hủy</strong><p class="text-sm">${fmtDate(order.cancelledAt || dateHistory.get('Đã hủy'), true)}</p></div></div>`
    : `<div class="hidden md:block py-space-sm"><div class="relative flex items-center justify-between"><div class="absolute left-6 right-6 top-5 h-1 bg-surface-variant -translate-y-1/2 z-0"></div><div class="absolute left-6 top-5 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-700" style="width:${Math.max(0, currentIndex) * 25}%"></div>${statusSteps.map((step, index) => {
      const reached = currentIndex >= index
      const isCurrent = currentIndex === index
      const changedAt = dateHistory.get(step)
      const icon = index === 2 ? 'agriculture' : index === 3 ? 'local_shipping' : index === 4 ? 'task_alt' : 'check'
      return `<div class="relative z-10 flex flex-col items-center text-center w-40"><div class="w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest ${reached ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-variant text-outline'} ${isCurrent ? 'shadow-md animate-pulse' : ''}"><span class="material-symbols-outlined text-[20px]">${reached ? icon : 'radio_button_unchecked'}</span></div><div class="font-label-md text-label-md ${reached ? 'text-on-surface font-semibold' : 'text-outline'} mt-space-sm">${step}</div><div class="font-label-sm text-label-sm ${reached ? 'text-on-surface-variant' : 'text-outline-variant'} mt-0.5">${changedAt ? fmtDate(changedAt, true) : isCurrent ? 'Đang cập nhật' : reached ? 'Đã ghi nhận' : 'Đang chờ'}</div></div>`
    }).join('')}</div></div><div class="flex md:hidden flex-col gap-space-md pl-2">${statusSteps.map((step, index) => {
      const reached = currentIndex >= index
      const changedAt = dateHistory.get(step)
      return `<div class="flex items-start gap-space-md"><div class="flex flex-col items-center"><div class="w-8 h-8 rounded-full ${reached ? 'bg-primary text-on-primary' : 'bg-surface-variant text-outline'} flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-[16px]">${reached ? 'check' : 'radio_button_unchecked'}</span></div>${index < statusSteps.length - 1 ? `<div class="w-0.5 h-8 ${reached && currentIndex > index ? 'bg-primary' : 'bg-surface-variant'} mt-1"></div>` : ''}</div><div><div class="font-label-lg text-label-lg ${reached ? 'text-on-surface font-semibold' : 'text-outline'}">${step}</div><div class="font-body-sm text-body-sm text-on-surface-variant">${changedAt ? fmtDate(changedAt, true) : index === currentIndex ? 'Đang cập nhật' : reached ? 'Đã ghi nhận' : 'Đang chờ'}</div></div></div>`
    }).join('')}</div>`
  const itemRows = (order.items || []).map((item) => {
    const source = item.itemType === 'FarmBox'
      ? farmBoxes.find((entry) => entry.id === item.id)
      : item.itemType === 'Combo'
        ? availableCombos.find((entry) => entry.id === item.id)
        : products.find((entry) => entry.id === item.id)
    const image = item.image || item.imageUrl || source?.image || source?.imageUrl || ''
    const typeLabel = item.itemType === 'FarmBox' ? 'Farm Box' : item.itemType === 'Combo' ? 'Combo Imperfect' : 'Nông sản'
    const quantity = Number(item.quantity) || 0
    const unit = item.itemType === 'FarmBox' ? 'hộp' : item.itemType === 'Combo' ? 'combo' : source?.unit || ''
    const delivery = item.itemType === 'FarmBox' && item.deliveryDate
      ? `<p class="mt-1 text-xs text-on-surface-variant">Ngày giao: ${fmtDate(`${item.deliveryDate}T00:00:00`)}</p>` : ''
    const cropCancelled = item.cropFailureResolution?.customerDecision === 'cancel' || item.cropFailureResolution?.action === 'cancel'
    const cropResolution = item.itemType === 'FarmBox' && item.cropFailureResolution
      ? `<p class="mt-2 rounded-lg ${cropCancelled ? 'bg-[#fff1f0] text-[#a52b27]' : 'bg-[#eaf5e9] text-[#176b36]'} px-3 py-2 text-xs"><strong>${escapeHtml(item.cropFailureResolution.status || 'Đã xử lý sự cố')}</strong>${item.cropFailureResolution.replacement?.name && !cropCancelled ? ` · Thay bằng ${escapeHtml(item.cropFailureResolution.replacement.name)} (không thu thêm phí)` : ''}${cropCancelled && Number(item.cropFailureResolution.refundAmount) > 0 ? ` · Hoàn ${money(Number(item.cropFailureResolution.refundAmount) || 0)}` : ''}</p>` : ''
    return `<div class="flex items-center gap-space-md py-space-md bg-surface-container-lowest border-b border-surface-container last:border-0">
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.name || typeLabel)}" class="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-surface-container" loading="lazy">` : `<span class="material-symbols-outlined w-20 h-20 flex-shrink-0 rounded-xl bg-surface-container flex items-center justify-center text-3xl text-primary">${item.itemType === 'FarmBox' ? 'inventory_2' : item.itemType === 'Combo' ? 'nutrition' : 'eco'}</span>`}<div class="flex flex-col flex-1 min-w-0"><span class="font-label-sm text-label-sm text-secondary font-medium">${typeLabel}</span><h3 class="font-headline-sm text-[16px] text-on-surface truncate mt-1">${escapeHtml(item.name || typeLabel)}</h3><span class="font-body-sm text-body-sm text-on-surface-variant">Số lượng: ${quantity} ${unit} × ${money(Number(item.unitPrice) || 0)}</span>${delivery}${cropResolution}</div>
      <div class="text-right flex-shrink-0"><span class="font-label-lg text-label-lg text-on-surface font-semibold">${money(Number(item.lineTotal) || 0)}</span></div>
    </div>`
  }).join('')
  const paymentLabel = order.paymentMethod === 'CashOnDelivery' ? 'Thanh toán khi nhận hàng' : order.paymentMethod === 'BankTransfer' ? 'Chuyển khoản VietQR' : 'Chưa chọn phương thức'
  const isPaidOrder = order.status === 'Đã thanh toán' || order.payment?.status === 'Đã thanh toán'
    || (order.status === 'Đang xử lý' && order.paymentMethod !== 'CashOnDelivery')
  const paymentStatus = order.status === 'Đã hủy'
    ? (isPaidOrder ? 'Yêu cầu hoàn tiền · Đang xử lý' : 'Đã hủy')
    : order.payment?.status || (order.paymentMethod === 'CashOnDelivery' ? 'Chờ thu tiền khi giao hàng' : 'Chờ thanh toán')
  const paymentAction = status === 'Chờ thanh toán'
    ? `<a href="/checkout/payment?orderId=${encodeURIComponent(order.id)}" data-route="/checkout/payment?orderId=${encodeURIComponent(order.id)}" class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container px-5 py-3 font-label-lg text-label-lg text-on-primary no-underline hover:bg-primary"><span class="material-symbols-outlined">account_balance</span>Tiếp tục thanh toán</a>`
    : ''

  const itemCount = (order.items || []).length
  const shippingAddress = [order.shippingAddress, order.province].filter(Boolean).join(', ') || 'Chưa có địa chỉ'
  const ecoWeight = (order.items || []).filter((item) => item.itemType === 'Combo').reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
  const currentStatusDescription = status === 'Đang xử lý' ? 'Nông trại đang chuẩn bị đơn hàng'
    : status === 'Đang giao' ? 'Đơn hàng đang trên đường đến bạn'
      : status === 'Đã nhận' ? 'Đơn hàng đã được giao thành công'
        : status === 'Đã thanh toán' ? 'Thanh toán đã được ghi nhận'
          : status === 'Chờ thanh toán' ? 'Đang chờ bạn hoàn tất thanh toán'
            : ''
  if (status === 'Đã hủy') {
    const cancelledAt = fmtDate(order.cancelledAt || dateHistory.get('Đã hủy'), true)
    const reason = order.cancelReason || (order.expiredAt ? 'Quá hạn thanh toán' : 'Khách hàng hủy đơn')
    const reasonDescription = reason.toLowerCase().includes('quá hạn') || reason.toLowerCase().includes('hết hạn')
      ? 'Đơn đã tự động hủy do quá hạn thanh toán; lượng hàng giữ kho đã được giải phóng.'
      : 'Đơn hàng đã được hủy theo yêu cầu của bạn và tồn kho đã được cập nhật lại.'
    const historyRows = (order.statusHistory || []).map((entry) => `<div class="flex justify-between gap-3 border-l-2 ${entry.newStatus === 'Đã hủy' ? 'border-[#B42318] bg-[#FDE8E6]/60 text-[#B42318]' : 'border-primary text-on-surface'} pl-4 py-2"><strong>${escapeHtml(entry.newStatus || 'Đã tạo')}</strong><span class="text-sm">${fmtDate(entry.changedAt, true)}</span></div>`).join('')
    main.innerHTML = `<div class="mx-auto w-full max-w-6xl flex flex-col gap-6 pb-8">
      <div class="flex justify-between items-center gap-4"><a href="/orders" data-route="/orders" class="inline-flex items-center gap-2 text-primary no-underline"><span class="material-symbols-outlined">arrow_back</span>Quay lại danh sách đơn</a><span class="text-sm text-on-surface-variant">Đặt lúc ${fmtDate(order.createdAt, true)}</span></div>
      <div class="flex flex-wrap items-center justify-between gap-4"><div class="flex flex-wrap items-center gap-3"><h1 class="font-headline-lg text-headline-lg">Chi tiết đơn hàng ${escapeHtml(order.orderCode || '')}</h1><span class="inline-flex items-center gap-1 rounded-full bg-[#FDE8E6] px-3 py-1 font-semibold text-[#B42318]"><span class="material-symbols-outlined text-[15px]">cancel</span>Đã hủy</span></div><button type="button" data-reorder-order="${escapeHtml(order.id)}" class="h-11 rounded-xl bg-primary-container px-5 font-label-lg text-label-lg text-on-primary"><span class="material-symbols-outlined mr-2 align-middle">replay</span>Đặt lại đơn hàng</button></div>
      <section class="rounded-xl bg-[#FDE8E6] p-5 text-on-surface"><div class="flex gap-3"><span class="material-symbols-outlined text-3xl text-[#B42318]">cancel</span><div><h2 class="font-headline-sm text-headline-sm text-[#B42318]">Đơn hàng đã được hủy</h2><p class="mt-2">Lý do: <strong>${escapeHtml(reason)}</strong>. ${reasonDescription}</p><p class="mt-1 text-sm">Thời gian hủy: ${cancelledAt}${isPaidOrder ? ` · Yêu cầu hoàn ${money(Number(order.totalAmount) || 0)} đang được xử lý` : ''}</p></div></div></section>
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-12"><div class="flex flex-col gap-5 lg:col-span-8"><section class="rounded-xl bg-white p-6 shadow-sm"><h2 class="mb-4 font-headline-sm text-headline-sm">Lịch trình xử lý</h2><div class="flex flex-col gap-3">${historyRows}</div></section><section class="rounded-xl bg-white p-6 shadow-sm"><div class="mb-4 flex justify-between"><h2 class="font-headline-sm text-headline-sm">Sản phẩm trong đơn</h2><span>${itemCount} mặt hàng</span></div><div class="flex flex-col opacity-60 grayscale">${itemRows}</div><div class="order-cancel-summary mt-3 rounded-lg bg-surface-container-low px-4 py-3 text-[15px] leading-6 text-on-surface-variant"><div class="flex justify-between gap-3"><span>Tạm tính hàng hóa:</span><span>${money(Number(order.subtotal ?? order.totalAmount) || 0)}</span></div><div class="mt-1 flex justify-between gap-3"><span>Phí vận chuyển nông sản sạch:</span><span class="shrink-0">${money(Number(order.shippingFee) || 0)}${Number(order.shippingFee) === 0 ? ' (Miễn phí)' : ''}</span></div><div class="my-2 h-px bg-surface-variant"></div><div class="flex items-center justify-between gap-3"><div><h3 class="text-[17px] font-semibold leading-6 text-on-surface">Tổng thanh toán:</h3><p class="text-[12px] leading-4 text-[#B42318]">${isPaidOrder ? 'Yêu cầu hoàn tiền đang được xử lý' : 'Đơn không thành công · Chưa ghi nhận thanh toán'}</p></div><div class="shrink-0 text-right"><p class="text-[18px] font-semibold leading-6 text-outline line-through">${money(Number(order.totalAmount) || 0)}</p><p class="text-[12px] leading-4 text-[#B42318]">${isPaidOrder ? 'Hoàn tiền đang xử lý' : '0đ thu thực tế'}</p></div></div></div></section></div><aside class="flex flex-col gap-5 lg:col-span-4"><section class="rounded-xl bg-white p-6 shadow-sm"><h2 class="mb-3 font-headline-sm text-headline-sm">Địa chỉ nhận hàng</h2><strong>${escapeHtml(order.receiver?.name || '—')}</strong><p>${escapeHtml(order.receiver?.phone || '')}</p><p class="mt-2 text-on-surface-variant">${escapeHtml(shippingAddress)}</p></section><section class="rounded-xl bg-surface-container-high p-6 shadow-sm"><h2 class="font-headline-sm text-headline-sm">Tiếp tục mua hàng?</h2><p class="my-3 text-sm text-on-surface-variant">Đặt lại để kiểm tra tồn kho mới nhất và đưa các mặt hàng trong đơn vào giỏ hàng.</p><button type="button" data-reorder-order="${escapeHtml(order.id)}" class="h-11 w-full rounded-xl bg-primary-container font-label-lg text-on-primary"><span class="material-symbols-outlined mr-2 align-middle">add_shopping_cart</span>Đặt lại đơn hàng</button></section><section class="rounded-xl bg-white p-5 text-sm"><strong>Thanh toán</strong><p>${escapeHtml(paymentLabel)} · ${escapeHtml(paymentStatus)}</p></section></aside></div></div>`
    return
  }
  main.innerHTML = `<div class="max-w-[1100px] w-full mx-auto flex flex-col gap-space-lg">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
      <div class="flex flex-col gap-space-xs"><a class="inline-flex items-center gap-1.5 text-primary hover:text-primary-container transition-colors font-label-md text-label-md w-fit group" data-route="/orders" href="/orders"><span class="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span><span>Quay lại danh sách đơn</span></a><div class="flex flex-wrap items-center gap-space-sm pt-space-xs"><h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Chi tiết đơn hàng ${escapeHtml(order.orderCode || '')}</h1><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold tracking-wide ${statusTone}"><span class="material-symbols-outlined text-[16px]">${statusIcon}</span>${escapeHtml(statusLabel)}</span></div></div>
      <div class="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md bg-surface-container-low px-space-md py-space-sm rounded-lg self-start sm:self-center"><span class="material-symbols-outlined text-[18px] text-secondary">schedule</span><span>Đặt lúc: <strong class="text-on-surface font-semibold">${fmtDate(order.createdAt, true)}</strong></span></div>
    </div>
    ${status === 'Chờ thanh toán' && order.expiredAt ? `<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm"><div><span class="font-label-md text-label-md text-on-surface font-semibold">Hạn thanh toán</span><p class="font-body-sm text-body-sm text-on-surface-variant">${fmtDate(order.expiredAt, true)}</p></div>${paymentAction}</div>` : ''}
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-lg">
      <div class="flex items-center justify-between gap-3"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-primary text-[24px]">local_shipping</span><h2 class="font-headline-sm text-headline-sm text-on-surface">Tiến trình đơn hàng</h2></div><span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Mã đơn: ${escapeHtml(order.orderCode || '')}</span></div>
      ${timeline}${currentStatusDescription ? `<p class="rounded-lg bg-surface-container-low px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(currentStatusDescription)}</p>` : ''}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
      <div class="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between"><div><div class="flex items-center justify-between pb-space-md"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-primary text-[24px]">shopping_cart_checkout</span><h2 class="font-headline-sm text-headline-sm text-on-surface">Sản phẩm đã đặt (${itemCount})</h2></div><span class="font-label-sm text-label-sm text-primary font-semibold bg-primary-fixed px-2.5 py-1 rounded-full">${itemCount} mặt hàng</span></div><div class="flex flex-col">${itemRows || '<p class="py-space-md font-body-sm text-body-sm text-on-surface-variant">Đơn hàng không có mặt hàng.</p>'}</div></div>
        <div class="bg-surface-container-low p-space-md rounded-xl mt-space-md flex flex-col gap-space-xs"><div class="flex justify-between items-center text-body-md font-body-md text-on-surface-variant"><span>Tạm tính</span><span class="text-on-surface font-medium">${money(Number(order.subtotal ?? order.totalAmount) || 0)}</span></div><div class="flex justify-between items-center text-body-md font-body-md text-on-surface-variant"><span>Phí vận chuyển</span><span class="text-primary font-medium">${money(Number(order.shippingFee) || 0)}</span></div><div class="flex justify-between items-center pt-space-xs font-headline-sm text-headline-sm text-on-surface"><span>Tổng thanh toán</span><span class="text-primary text-[22px] font-bold">${money(Number(order.totalAmount) || 0)}</span></div></div>
      </div>
      <div class="lg:col-span-5 flex flex-col gap-space-lg"><div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-primary text-[22px]">location_on</span><h2 class="font-headline-sm text-headline-sm text-on-surface">Địa chỉ nhận hàng</h2></div><div class="flex flex-col gap-space-xs bg-surface-container-low p-space-md rounded-xl"><div class="flex items-center justify-between gap-3"><span class="font-label-lg text-label-lg text-on-surface font-bold">${escapeHtml(order.receiver?.name || '—')}</span><span class="font-label-md text-label-md text-secondary font-medium">${escapeHtml(order.receiver?.phone || '')}</span></div><p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-1">${escapeHtml(shippingAddress)}</p>${order.note ? `<p class="font-body-sm text-body-sm text-on-surface-variant"><strong>Ghi chú:</strong> ${escapeHtml(order.note)}</p>` : ''}</div></div>
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md"><div class="flex items-center gap-space-sm"><span class="material-symbols-outlined text-primary text-[22px]">payments</span><h2 class="font-headline-sm text-headline-sm text-on-surface">Thông tin thanh toán</h2></div><div class="flex flex-col gap-space-sm"><div class="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low"><div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0"><span class="material-symbols-outlined text-[22px]">${order.paymentMethod === 'CashOnDelivery' ? 'payments' : 'account_balance'}</span></div><div class="flex flex-col flex-1 min-w-0"><span class="font-label-md text-label-md text-on-surface font-semibold">${escapeHtml(paymentLabel)}</span><span class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(paymentStatus)}</span></div></div>${order.payment?.transferContent ? `<div class="flex items-center gap-space-sm p-space-sm bg-primary-container/10 rounded-lg"><span class="material-symbols-outlined text-primary text-[20px]">receipt</span><div class="flex flex-col"><span class="font-label-sm text-label-sm text-primary font-bold">Nội dung chuyển khoản</span><span class="font-label-sm text-label-sm text-on-surface-variant">${escapeHtml(order.payment.transferContent)}</span></div></div>` : ''}</div></div>
      ${ecoWeight > 0 ? `<div class="bg-secondary-container/40 p-space-md rounded-xl flex items-center gap-space-md"><div class="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-[20px]">psychiatry</span></div><div class="flex flex-col text-on-secondary-container"><span class="font-label-md text-label-md font-bold">Cảm ơn bạn đã chọn nông sản GreenNova</span><span class="font-body-sm text-body-sm">Đơn hàng có ${ecoWeight} combo nông sản.</span></div></div>` : ''}</div>
    </div>
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md"><div class="flex flex-col gap-0.5 text-center sm:text-left"><span class="font-label-md text-label-md text-on-surface font-semibold">Quản lý trạng thái đơn hàng</span><span class="font-body-sm text-body-sm text-on-surface-variant">${status === 'Đã hủy' ? 'Đơn hàng này đã được hủy.' : ['Chờ thanh toán', 'Đã thanh toán', 'Đang xử lý'].includes(status) ? 'Nếu hủy đơn đã thanh toán, yêu cầu hoàn tiền sẽ được tiếp nhận để xử lý.' : 'Nếu cần thay đổi hoặc hỏi về đơn hàng, vui lòng liên hệ GreenNova.'}</span></div><div class="flex flex-wrap items-center justify-center gap-space-md w-full sm:w-auto"><a href="mailto:support@greennova.vn?subject=${encodeURIComponent(`Hỗ trợ đơn ${order.orderCode || ''}`)}" class="h-11 px-5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-variant font-label-lg text-label-lg inline-flex items-center justify-center gap-1.5 transition-all no-underline"><span class="material-symbols-outlined text-[18px]">support_agent</span><span>Cần hỗ trợ?</span></a>${['Chờ thanh toán', 'Đã thanh toán', 'Đang xử lý'].includes(status) ? `<button type="button" data-customer-cancel-order="${escapeHtml(order.id)}" class="h-11 px-6 rounded-xl border border-[#C62828] text-[#C62828] bg-white hover:bg-[#FFF5F5] font-label-lg text-label-lg inline-flex items-center justify-center gap-1.5 transition-all"><span class="material-symbols-outlined text-[18px]">cancel</span><span>Hủy đơn hàng</span></button>` : ''}</div></div>
    <div id="customer-cancel-modal" data-customer-cancel-modal="true" class="fixed inset-0 z-[100] hidden items-center justify-center bg-[#172019]/45 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="customer-cancel-title" class="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-2xl"><div class="flex items-center gap-2 text-[#C62828]"><span class="material-symbols-outlined text-[26px]">warning</span><h2 id="customer-cancel-title" class="font-headline-sm text-headline-sm text-[#1F2A22]">Xác nhận hủy đơn hàng</h2></div><p class="mt-3 font-body-md text-body-md text-[#4E5B50]">${isPaidOrder ? `Đơn hàng <strong>${escapeHtml(order.orderCode || '')}</strong> đã thanh toán thành công ${money(Number(order.totalAmount) || 0)}. Nếu bạn xác nhận hủy, yêu cầu hoàn ${money(Number(order.totalAmount) || 0)} sẽ được tiếp nhận để xử lý trong vòng 24 giờ.` : `Đơn hàng <strong>${escapeHtml(order.orderCode || '')}</strong> đang chờ thanh toán. Bạn có chắc muốn hủy đơn này không?`}</p><div class="mt-5 flex items-center justify-end gap-2"><button type="button" data-cancel-modal-close="true" class="h-10 rounded-xl bg-surface-container px-4 font-label-md text-label-md text-on-surface">Giữ lại đơn</button><button type="button" data-cancel-modal-confirm="true" class="h-10 rounded-xl bg-[#C62828] px-4 font-label-md text-label-md text-white">Xác nhận hủy</button></div></section></div>
  </div>`
  const cancelModal = main.querySelector('[data-customer-cancel-modal="true"]')
  if (cancelModal) {
    cancelModal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="customer-cancel-title" class="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div class="flex items-start justify-between gap-3"><div><h2 id="customer-cancel-title" class="text-base font-bold text-[#26372b]">Hủy đơn hàng ${escapeHtml(order.orderCode || '')}?</h2><p class="mt-2 text-xs leading-5 text-[#5d6d61]">${isPaidOrder ? 'Đơn hàng đã thanh toán. Khi hủy, yêu cầu hoàn tiền sẽ được ghi nhận để xử lý.' : 'Đơn hàng chưa được thanh toán nên bạn sẽ không bị trừ tiền. Sau khi hủy, bạn không thể khôi phục đơn này.'}</p></div><button type="button" data-cancel-modal-close="true" class="rounded-full p-1 text-[#647267] hover:bg-[#f1f6f0]" aria-label="Đóng"><span class="material-symbols-outlined text-[19px]">close</span></button></div><fieldset class="mt-4 space-y-1.5"><legend class="sr-only">Lý do hủy đơn hàng</legend>${[
      'Muốn thay đổi sản phẩm', 'Muốn đổi địa chỉ giao hàng', 'Đặt nhầm', 'Không muốn mua nữa', 'Lý do khác',
    ].map((reason, index) => `<label class="flex cursor-pointer items-center gap-2.5 rounded-lg border ${index === 0 ? 'border-[#91b99a] bg-[#f5faf5]' : 'border-[#e4e9e3] bg-white'} px-3 py-2.5 text-xs text-[#29382d] hover:border-[#91b99a]"><input type="radio" name="customerCancelReason" value="${reason}" ${index === 0 ? 'checked' : ''} class="accent-[#16753b]"><span>${reason}</span></label>`).join('')}</fieldset><textarea data-cancel-other-reason class="mt-2 hidden min-h-16 w-full rounded-lg border border-[#d9e3d7] p-2.5 text-xs outline-none focus:border-[#16753b]" placeholder="Nhập lý do hủy"></textarea><div class="mt-4 flex flex-col gap-1.5"><button type="button" data-cancel-modal-confirm="true" class="h-10 w-full rounded-lg bg-[#cf2525] text-xs font-semibold text-white hover:bg-[#b51f1f]">Xác nhận hủy đơn</button><button type="button" data-cancel-modal-close="true" class="h-9 w-full rounded-lg border border-[#168044] text-xs font-semibold text-[#168044] hover:bg-[#f2f8f1]">Giữ lại đơn hàng</button></div></section>`
    const reasonRadios = [...cancelModal.querySelectorAll('input[name="customerCancelReason"]')]
    const otherReason = cancelModal.querySelector('[data-cancel-other-reason]')
    reasonRadios.forEach((radio) => radio.addEventListener('change', () => {
      if (otherReason) otherReason.classList.toggle('hidden', radio.value !== 'Lý do khác' || !radio.checked)
    }))
  }
}

function renderAdminFarmBoxSelectedWeeks(documentFromStitch, route, farmBoxes = []) {
  if (route.path !== '/admin/farm-box') return
  const heading = [...documentFromStitch.querySelectorAll('h2')]
    .find((node) => normalizeLabel(node.textContent).includes('cau hinh chi tiet thuc don tuan'))
  const panel = heading?.closest('.bg-surface-container-lowest')
  if (!panel) return

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char])
  const dateKey = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  const dateLabel = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '' : `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
  }
  const moneyLabel = (value) => `${Math.round(Number(value) || 0).toLocaleString('vi-VN')}đ`
  const currentMonday = new Date()
  currentMonday.setHours(0, 0, 0, 0)
  currentMonday.setDate(currentMonday.getDate() - ((currentMonday.getDay() + 6) % 7))
  const weeks = [0, 1, 2].map((offset) => {
    const startDate = new Date(currentMonday)
    startDate.setDate(startDate.getDate() + offset * 7)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
    return { startDate, endDate }
  })

  // Keep the schedule table in sync with the rolling calendar. Older weeks
  // remain in MongoDB for order history, but are no longer shown in this view.
  const scheduleTable = [...documentFromStitch.querySelectorAll('table')]
    .find((table) => normalizeLabel(table.closest('div')?.parentElement?.textContent || '').includes('lich trinh mo ban'))
    || documentFromStitch.querySelector('table')
  scheduleTable?.querySelectorAll('tbody tr').forEach((row, index) => {
    const week = weeks[index]
    if (!week) return
    const cells = row.querySelectorAll('td')
    if (cells[0]) {
      const label = cells[0].querySelector('.font-title-md')
      if (label) label.textContent = `Tuần ${index + 1}`
      cells[0].querySelectorAll('span').forEach((badge) => {
        if (normalizeLabel(badge.textContent).includes('dang chon')) badge.remove()
      })
      const weekDot = cells[0].querySelector('.w-2\\.5') || cells[0].querySelector('span')
      if (weekDot && index === 0) weekDot.classList.add('animate-pulse')
    }
    if (cells[1]) cells[1].textContent = `${dateLabel(week.startDate)} - ${dateLabel(week.endDate)}/${week.endDate.getFullYear()}`
    const status = cells[2]?.querySelector('span')
    if (status) {
      const isCurrent = index === 0
      status.className = `inline-flex items-center gap-1 font-label-sm ${isCurrent ? 'text-primary bg-secondary-fixed/60' : 'text-tertiary bg-tertiary-fixed'} px-2.5 py-1 rounded-full font-semibold`
      const dot = status.querySelector('span')
      const records = (farmBoxes || []).flatMap((box) => (box.weeks || []).filter((entry) => (
        dateKey(entry.startDate) === dateKey(week.startDate) && entry.selectedForWeek !== false
      )))
      const currentStatus = records.some((entry) => entry.status === 'Đang mở') ? 'Đang mở' : 'Sắp mở'
      if (dot) dot.className = `w-1.5 h-1.5 rounded-full ${currentStatus === 'Đang mở' ? 'bg-primary' : 'bg-tertiary'} ${isCurrent ? 'animate-pulse' : ''}`
      status.lastChild.textContent = ` ${currentStatus}`
      const actionCell = cells[7]
      let toggle = [...(actionCell?.querySelectorAll('button') || [])].find((button) => (
        normalizeLabel(button.textContent).includes('kich hoat mo ban') || normalizeLabel(button.textContent).includes('khoa mo ban')
      ))
      if (actionCell && !toggle) {
        toggle = documentFromStitch.createElement('button')
        toggle.className = 'h-9 px-3.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-secondary-container transition-all inline-flex items-center gap-1.5 font-semibold'
        actionCell.append(toggle)
      }
      if (toggle) {
        toggle.dataset.adminFarmboxWeekToggle = String(index + 1)
        toggle.dataset.currentStatus = currentStatus
        toggle.type = 'button'
        if (records.length && currentStatus === 'Đang mở') {
          toggle.innerHTML = '<span class="material-symbols-outlined text-[17px]">lock</span><span>Khóa mở bán</span>'
          toggle.className = 'h-9 px-3.5 rounded-lg bg-[#fff0ed] text-[#a33127] font-label-md text-label-md hover:bg-[#ffe2dc] transition-all inline-flex items-center gap-1.5 font-semibold'
        } else if (records.length) {
          toggle.innerHTML = '<span class="material-symbols-outlined text-[17px]">lock_open</span><span>Kích hoạt mở bán</span>'
        } else {
          toggle.disabled = false
          toggle.removeAttribute('title')
          toggle.dataset.adminFarmboxConfigureWeek = String(index + 1)
          toggle.innerHTML = '<span class="material-symbols-outlined text-[17px]">tune</span><span>Cấu hình tuần</span>'
          toggle.className = 'h-9 px-3.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-secondary-container transition-all inline-flex items-center gap-1.5 font-semibold'
        }
      }
      if (index > 0 && actionCell) {
        let copyButton = actionCell.querySelector('[data-admin-farmbox-copy-week]')
        if (!copyButton) {
          copyButton = documentFromStitch.createElement('button')
          copyButton.className = 'h-9 px-2.5 rounded-lg bg-[#eef5ed] text-[#365844] font-label-md text-xs hover:bg-[#e1eee0] transition-all inline-flex items-center justify-center gap-1'
          copyButton.innerHTML = '<span class="material-symbols-outlined text-[16px]">content_copy</span><span>Sao chép tuần trước</span>'
          if (toggle) actionCell.insertBefore(copyButton, toggle)
          else actionCell.append(copyButton)
        }
        copyButton.dataset.adminFarmboxCopyWeek = String(index + 1)
        copyButton.type = 'button'
      }
      if (actionCell) {
        let actionStack = actionCell.querySelector('[data-admin-farmbox-action-stack]')
        if (!actionStack) {
          actionStack = documentFromStitch.createElement('div')
          actionStack.dataset.adminFarmboxActionStack = 'true'
          actionStack.className = 'mx-auto flex w-full max-w-[190px] flex-col items-stretch gap-2'
          actionCell.append(actionStack)
        }
        actionCell.querySelectorAll('button, a').forEach((button) => {
          if (button.parentElement !== actionStack) actionStack.append(button)
          button.classList.add('w-full', 'justify-center')
        })
      }
    }
  })
  if (scheduleTable) {
    scheduleTable.querySelectorAll('thead tr').forEach((row) => {
      [...row.children].slice(4, 7).forEach((cell) => cell.remove())
    })
    scheduleTable.querySelectorAll('tbody tr').forEach((row) => {
      [...row.children].slice(4, 7).forEach((cell) => cell.remove())
    })
  }

  const weekCards = weeks.map((week, index) => {
    const selected = (farmBoxes || []).flatMap((box) => {
      const matchingWeek = (box.weeks || []).find((item) => dateKey(item.startDate) === dateKey(week.startDate))
      if (!matchingWeek || matchingWeek.selectedForWeek === false) return []
      const totalWeight = (matchingWeek.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
      return [{ box, week: matchingWeek, totalWeight }]
    }).sort((a, b) => Number(a.week.price ?? a.box.price) - Number(b.week.price ?? b.box.price))
    const range = `${dateLabel(week.startDate)} – ${dateLabel(week.endDate)}`
    const items = selected.length
      ? `<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">${selected.map(({ box, week: offer, totalWeight }) => `
          <article class="flex min-w-0 items-center gap-3 rounded-xl border border-[#dbe8dc] bg-white p-3 shadow-sm">
            <img src="${escapeHtml(box.image || '')}" alt="${escapeHtml(box.name)}" class="h-16 w-20 shrink-0 rounded-lg bg-[#eaf4e9] object-cover" loading="lazy" />
            <div class="min-w-0 flex-1">
              <h4 class="truncate text-sm font-semibold text-[#203528]">${escapeHtml(box.name || 'Farm Box')}</h4>
              <p class="mt-1 text-xs text-[#647467]">${totalWeight ? `${Number(totalWeight.toFixed(2))} kg · ` : ''}${(offer.items || []).length} mặt hàng</p>
            </div>
            <strong class="shrink-0 text-sm font-bold text-[#076332]">${moneyLabel(offer.price ?? box.price)}</strong>
          </article>`).join('')}</div>`
      : '<div class="rounded-xl border border-dashed border-[#cbdccf] bg-white/70 px-4 py-6 text-center text-sm text-[#738276]">Chưa có Farm Box được chọn cho tuần này.</div>'
    return `<section class="rounded-2xl border border-[#dce9dc] bg-[#f5faf4] p-4 md:p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div><p class="text-xs font-semibold uppercase tracking-wide text-[#63836b]">Tuần ${index + 1}</p><h3 class="mt-1 text-lg font-bold text-[#1d3023]">${range}</h3></div>
        <span class="rounded-full bg-[#e2f1e1] px-3 py-1 text-xs font-semibold text-[#176b39]">${selected.length} Farm Box đã chọn</span>
      </div>${items}
    </section>`
  }).join('')

  panel.innerHTML = `<div class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#e0e9e0] pb-4">
    <div><p class="text-xs font-bold uppercase tracking-[0.12em] text-[#168049]">Lịch bán Farm Box</p><h2 class="mt-1 text-xl font-bold text-[#1b2b20]">Farm Box admin đã chọn theo tuần</h2><p class="mt-1 text-sm text-[#647467]">Danh sách lấy trực tiếp từ các lựa chọn đã lưu trong MongoDB.</p></div>
    <span class="rounded-full bg-[#e7f4e7] px-3 py-1.5 text-xs font-semibold text-[#27623b]">${weeks.length} tuần gần nhất</span>
  </div>
  <div class="flex flex-col gap-4">${weekCards || '<div class="rounded-xl border border-dashed border-[#cbdccf] bg-white px-4 py-8 text-center text-sm text-[#738276]">Chưa có lịch tuần Farm Box trong dữ liệu.</div>'}</div>`
}

function applyAdminRefundPage(documentFromStitch, route, refunds = [], error = '') {
  if (route.path.startsWith('/admin')) {
    const ordersLink = [...(documentFromStitch.body.querySelectorAll('aside a') || [])].find((link) => normalizeLabel(link.textContent).includes('quan ly don hang'))
    if (ordersLink && !documentFromStitch.body.querySelector('[data-admin-refunds-link]')) {
      const link = documentFromStitch.createElement('a')
      link.href = '/admin/refunds'
      link.dataset.route = '/admin/refunds'
      link.dataset.adminRefundsLink = 'true'
      link.className = route.path === '/admin/refunds' ? 'flex items-center gap-3 rounded-lg bg-[#0b5730] px-3 py-3 text-sm font-semibold text-white no-underline' : 'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#e8f4e9] no-underline hover:bg-white/10'
      link.innerHTML = '<span class="material-symbols-outlined">currency_exchange</span><span>Đối soát & Hoàn tiền</span>'
      ordersLink.after(link)
    }
    const refundLink = documentFromStitch.body.querySelector('[data-admin-refunds-link]')
    if (refundLink && !documentFromStitch.body.querySelector('[data-admin-profile-link]')) {
      const profileLink = documentFromStitch.createElement('a')
      profileLink.href = '/admin/profile'
      profileLink.dataset.route = '/admin/profile'
      profileLink.dataset.adminProfileLink = 'true'
      profileLink.className = route.path === '/admin/profile' ? 'flex items-center gap-3 rounded-lg bg-[#0b5730] px-3 py-3 text-sm font-semibold text-white no-underline' : 'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#e8f4e9] no-underline hover:bg-white/10'
      profileLink.innerHTML = '<span class="material-symbols-outlined">admin_panel_settings</span><span>Hồ sơ & Phân quyền</span>'
      refundLink.after(profileLink)
    }
  }
  if (route.path !== '/admin/refunds') return
  const main = documentFromStitch.body.querySelector('main')
  if (!main) return
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const amount = (value) => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`
  const records = Array.isArray(refunds) ? refunds : []
  const pending = records.filter((item) => item.status !== 'Đã hoàn tiền')
  const completed = records.filter((item) => item.status === 'Đã hoàn tiền')
  const pendingTotal = pending.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const tableRows = records.map((item) => {
    const statusClass = item.status === 'Đã hoàn tiền' ? 'bg-[#e1f3e3] text-[#176b36]' : 'bg-[#fff0d6] text-[#8c5700]'
     const action = item.status === 'Đã hoàn tiền'
      ? '<span style="display:inline-flex;align-items:center;white-space:nowrap" class="rounded-full bg-[#e1f3e3] px-3 py-1.5 text-xs font-semibold text-[#176b36]">Đã hoàn tiền</span>'
      : `<button type="button" data-refund-process="${escape(item.id)}" style="white-space:nowrap" class="rounded-lg bg-[#08733a] px-3 py-2 text-xs font-bold text-white hover:bg-[#075c30]">Xử lý hoàn tiền</button>`
    const time = item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—'
    return `<tr data-refund-row data-status="${escape(item.status)}" data-search="${escape(`${item.orderCode} ${item.customerName} ${item.phone} ${item.reason}`.toLocaleLowerCase('vi'))}" class="border-b border-[#e4ece2] last:border-0 hover:bg-[#f8fbf7]"><td class="px-4 py-4"><strong class="block text-sm text-[#12683a]">${escape(item.orderCode || '—')}</strong><span class="text-[11px] text-[#758276]">${time}</span></td><td class="px-4 py-4"><strong class="block text-sm text-[#26382b]">${escape(item.customerName || 'Khách hàng')}</strong><span class="text-xs text-[#68776b]">${escape(item.phone || '—')}</span></td><td class="px-4 py-4 text-sm text-[#35463a]">${escape(item.itemSummary || 'Đơn hàng đã hủy')}</td><td class="px-4 py-4 text-sm font-bold text-[#12683a]">${amount(item.amount)}</td><td class="px-4 py-4 text-xs text-[#56685b]">${escape(item.bankLabel || 'Theo tài khoản nhận hoàn tiền')}</td><td class="px-4 py-4 text-xs text-[#56685b]">${escape(item.reason || 'Khách yêu cầu hoàn tiền')}</td><td class="px-4 py-4"><span style="display:inline-flex;align-items:center;white-space:nowrap" class="rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass}">${escape(item.status)}</span></td><td class="px-4 py-4">${action}</td></tr>`
  }).join('')
  main.innerHTML = `<div class="min-h-screen bg-[#f1faf1] p-4 sm:p-6 lg:p-8"><div class="mx-auto max-w-[1500px]"><div class="mb-6"><p class="text-xs font-bold uppercase tracking-[.14em] text-[#168049]">Tài chính & đối soát</p><h1 class="mt-1 text-2xl font-bold text-[#213529]">Quản lý & Đối soát Hoàn tiền</h1><p class="mt-1 text-sm text-[#647467]">Kiểm tra yêu cầu hoàn tiền và cập nhật kết quả xử lý cho khách hàng.</p></div>${error ? `<div role="alert" class="mb-4 rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700">${escape(error)}</div>` : ''}<div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><article class="rounded-xl border border-[#e0e9df] bg-white p-4 shadow-sm"><p class="text-xs font-semibold text-[#647467]">Chờ chuyển khoản hoàn tiền</p><p class="mt-2 text-2xl font-bold text-[#25382a]">${pending.length} <span class="text-sm font-medium">phiếu</span></p><p class="mt-1 text-xs text-[#8c5700]">${pending.filter((entry) => entry.method === 'VietQR').length} đơn cần xử lý</p></article><article class="rounded-xl border border-[#e0e9df] bg-white p-4 shadow-sm"><p class="text-xs font-semibold text-[#647467]">Đã hoàn tiền hôm nay</p><p class="mt-2 text-2xl font-bold text-[#176b36]">${completed.length} <span class="text-sm font-medium">phiếu</span></p><p class="mt-1 text-xs text-[#637768]">${amount(completed.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</p></article><article class="rounded-xl border border-[#e0e9df] bg-white p-4 shadow-sm"><p class="text-xs font-semibold text-[#647467]">Tổng tiền cần hoàn</p><p class="mt-2 text-2xl font-bold text-[#08733a]">${amount(pendingTotal)}</p><p class="mt-1 text-xs text-[#637768]">Theo yêu cầu hợp lệ trong MongoDB</p></article><article class="rounded-xl border border-[#e0e9df] bg-white p-4 shadow-sm"><p class="text-xs font-semibold text-[#647467]">Thời gian xử lý trung bình</p><p class="mt-2 text-2xl font-bold text-[#25382a]">— <span class="text-sm font-medium">giờ</span></p><p class="mt-1 text-xs text-[#637768]">Chưa đủ dữ liệu đối soát</p></article></div><section class="overflow-hidden rounded-xl border border-[#e0e9df] bg-white shadow-sm"><div class="flex flex-wrap items-center gap-3 border-b border-[#e6eee5] p-4"><input data-refund-search type="search" placeholder="Tìm mã đơn, tên khách hàng, SĐT..." class="min-h-10 min-w-[220px] flex-1 rounded-lg border border-[#cddbcc] px-3 text-sm outline-none focus:border-[#168049]"/><select data-refund-status class="min-h-10 rounded-lg border border-[#cddbcc] bg-white px-3 text-sm text-[#405144]"><option value="all">Trạng thái: Tất cả</option><option value="Đang xử lý hoàn tiền">Đang xử lý</option><option value="Đã hoàn tiền">Đã hoàn tiền</option></select><select data-refund-reason class="min-h-10 rounded-lg border border-[#cddbcc] bg-white px-3 text-sm text-[#405144]"><option value="all">Lý do: Tất cả</option><option value="hủy">Khách hủy đơn</option><option value="sự cố">Sự cố Farm Box</option></select><button data-refund-refresh type="button" class="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#e9f5e8] px-4 text-sm font-semibold text-[#176b36]"><span class="material-symbols-outlined text-base">refresh</span>Làm mới</button><button data-refund-export type="button" class="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0b5730] px-4 text-sm font-semibold text-white"><span class="material-symbols-outlined text-base">download</span>Xuất file Excel</button></div><div class="overflow-x-auto"><table class="w-full min-w-[1120px] text-left"><thead class="bg-[#edf7ec] text-[11px] uppercase tracking-wide text-[#536657]"><tr><th class="px-4 py-3">Mã hoàn tiền / Ngày tạo</th><th class="px-4 py-3">Khách hàng</th><th class="px-4 py-3">Thông tin mặt hàng</th><th class="px-4 py-3">Số tiền hoàn</th><th class="px-4 py-3">Tài khoản nhận</th><th class="px-4 py-3">Lý do hoàn</th><th class="px-4 py-3">Trạng thái</th><th class="px-4 py-3">Thao tác</th></tr></thead><tbody data-refund-rows>${tableRows || `<tr><td colspan="8" class="px-4 py-12 text-center text-sm text-[#718074]">${refunds === null ? 'Đang tải dữ liệu hoàn tiền…' : 'Chưa có yêu cầu hoàn tiền.'}</td></tr>`}</tbody></table></div><div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6eee5] px-4 py-3 text-xs text-[#647467]"><span data-refund-count>Hiển thị ${records.length} yêu cầu</span><span>Đối soát cập nhật từ MongoDB</span></div></section><aside class="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#dce9dc] bg-[#e8f5e8] p-4"><div class="flex items-start gap-3"><span class="material-symbols-outlined rounded-lg bg-white p-2 text-[#176b36]">verified_user</span><div><h2 class="text-sm font-bold text-[#26382b]">Tự động đối soát theo trạng thái đơn</h2><p class="mt-1 text-xs text-[#5e7062]">Yêu cầu được tổng hợp từ các đơn đã ghi nhận hoàn tiền; hãy xác nhận sau khi chuyển khoản thực tế.</p></div></div><span class="text-xs font-semibold text-[#176b36]">${pending.length} yêu cầu đang chờ xử lý</span></aside></div></div>`
  main.insertAdjacentHTML('beforeend', `<div data-refund-modal class="fixed inset-0 z-[110] hidden items-center justify-center overflow-y-auto bg-[#142018]/55 p-3 backdrop-blur-sm sm:p-5"><section role="dialog" aria-modal="true" aria-labelledby="refund-modal-title" class="my-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"><header class="flex items-center justify-between gap-4 bg-[#eaf6e9] px-5 py-4"><div class="flex items-start gap-3"><span class="material-symbols-outlined rounded-lg bg-[#08733a] p-2 text-white">currency_exchange</span><div><h2 id="refund-modal-title" class="text-base font-bold text-[#24372a]">Thực hiện chuyển khoản hoàn tiền đơn <span data-refund-modal-code></span></h2><p class="mt-1 text-xs text-[#617165]">Mã yêu cầu hoàn: <strong data-refund-modal-reference></strong> · Người tạo: Khách hàng</p></div></div><button type="button" data-refund-close aria-label="Đóng" class="rounded-lg p-2 text-[#607166] hover:bg-white"><span class="material-symbols-outlined">close</span></button></header><div class="bg-[#fff4e9] px-5 py-3 text-xs text-[#78410a]"><strong>Lưu ý quản trị:</strong> Vui lòng quét mã VietQR bằng ứng dụng ngân hàng quản trị GreenNova để chuyển khoản thực tế. Kiểm tra đúng tên người nhận trước khi duyệt.</div><div data-refund-modal-details class="grid gap-4 p-5 lg:grid-cols-[235px_minmax(0,1fr)]"></div><div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#e3ebe2] bg-[#fbfdf9] px-5 py-4"><p class="text-xs text-[#607166]">Khách hàng sẽ thấy trạng thái hoàn tiền được cập nhật trong đơn hàng sau khi xác nhận.</p><div class="flex gap-2"><button type="button" data-refund-close class="rounded-lg border border-[#cbdccb] px-4 py-2 text-sm font-semibold text-[#526255]">Hủy bỏ / Đóng</button><button type="button" data-refund-submit disabled class="inline-flex items-center gap-2 rounded-lg bg-[#08733a] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><span class="material-symbols-outlined text-base">outbox</span>Xác nhận đã chuyển & Ghi nhận thông báo</button></div></div></section></div>`)
}

function applyAdminProfilePage(documentFromStitch, route, authUser = null, activity = []) {
  if (route.path !== '/admin/profile') return
  const main = documentFromStitch.body.querySelector('main')
  if (!main) return
  documentFromStitch.title = route.title
  const dashboardNav = documentFromStitch.body.querySelector('aside a[data-path="dashboard"]')
  dashboardNav?.classList.remove('bg-primary', 'text-on-primary', 'font-bold', 'shadow-sm')
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
  const joined = authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('vi-VN') : 'Chưa có dữ liệu'
  const accountId = authUser?.id || authUser?._id || '—'
  const role = authUser?.role || 'Quản trị viên'
  const displayName = authUser?.fullName || 'Quản trị viên'
  const modules = [
    ['Dashboard', 'dashboard', 'Xem báo cáo doanh thu và hoạt động hệ thống.'],
    ['Quản lý nông sản', 'inventory_2', 'Quản lý sản phẩm, giá bán và tồn kho.'],
    ['Quản lý Imperfect', 'eco', 'Cấu hình combo và nguyên liệu imperfect.'],
    ['Cấu hình Farm Box', 'package_2', 'Quản lý thực đơn tuần và phương án dự phòng.'],
    ['Quản lý đơn hàng', 'local_shipping', 'Duyệt đơn, cập nhật giao hàng và trạng thái.'],
    ['Đối soát & hoàn tiền', 'currency_exchange', 'Xử lý yêu cầu hoàn tiền và biên lai.'],
    ['Hồ sơ và phân quyền', 'admin_panel_settings', 'Quản lý thông tin tài khoản quản trị.'],
  ]
  const activityRows = (activity || []).slice(0, 8).map((entry) => `<tr class="border-b border-[#e8eee7] last:border-0"><td class="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-[#718074]">${escape(entry.time ? new Date(entry.time).toLocaleString('vi-VN') : '—')}</td><td class="px-3 py-3 text-sm text-[#304235]">${escape(entry.action)}</td><td class="px-3 py-3 font-mono text-xs font-semibold text-[#176b36]">${escape(entry.reference || '—')}</td><td class="px-3 py-3"><span class="rounded-full bg-[#e4f3e3] px-2.5 py-1 text-[11px] font-semibold text-[#176b36]">${escape(entry.status || 'Đã lưu')}</span></td></tr>`).join('')
  const moduleCards = modules.map(([name, icon, description]) => `<article class="flex items-start gap-3 rounded-xl border border-[#e3ede2] bg-[#f2faf1] p-4"><span class="material-symbols-outlined rounded-lg bg-[#dff0de] p-2 text-[#08733a]">${icon}</span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><h3 class="font-semibold text-[#26382b]">${name}</h3><span class="rounded-full bg-[#e2f1e1] px-2 py-0.5 text-[10px] font-bold uppercase text-[#176b36]">${escape(role)}</span></div><p class="mt-1 text-xs leading-5 text-[#68796b]">${description}</p></div><span class="mt-1 inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#168049]"><span class="material-symbols-outlined text-sm">check_circle</span>Đang hoạt động</span></article>`).join('')
  main.innerHTML = `<div class="min-h-screen bg-[#eff9ee] p-4 sm:p-6 lg:p-8"><div class="mx-auto max-w-[1450px]"><div class="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[.14em] text-[#168049]">Quản trị hệ thống</p><h1 class="mt-1 text-2xl font-bold text-[#203529] sm:text-3xl">Hồ sơ & Phân quyền Quản trị viên</h1><p class="mt-1 max-w-2xl text-sm text-[#647467]">Quản lý thông tin định danh, quyền truy cập và bảo mật tài khoản quản trị.</p></div><span class="inline-flex items-center gap-2 rounded-xl bg-[#e1f2df] px-4 py-3 text-xs font-semibold text-[#176b36]"><span class="material-symbols-outlined">verified_user</span>Phiên quản trị đang hoạt động</span></div><div class="grid items-start gap-5 xl:grid-cols-[minmax(320px,.82fr)_minmax(500px,1.45fr)]"><div class="space-y-5"><section class="rounded-2xl border border-[#dce9da] bg-white p-5 shadow-sm"><div class="mb-4 flex items-center gap-3 border-b border-[#e5eee4] pb-4"><span class="material-symbols-outlined rounded-xl bg-[#e7f5e6] p-2.5 text-[#08733a]">badge</span><div><h2 class="font-bold text-[#25382a]">Thông tin định danh</h2><p class="text-xs text-[#718074]">Cập nhật thông tin quản trị viên</p></div><span class="ml-auto rounded-full bg-[#e3f2e1] px-2.5 py-1 text-[10px] font-semibold text-[#176b36]">Đang hoạt động</span></div><form data-admin-profile-form class="space-y-3"><label class="block text-xs font-medium text-[#526255]">Mã tài khoản<input value="${escape(accountId)}" readonly class="mt-1.5 w-full rounded-lg border border-[#d8e5d6] bg-[#f6faf5] px-3 py-2.5 font-mono text-xs text-[#647467]"/></label><label class="block text-xs font-medium text-[#526255]">Họ và tên<input name="fullName" value="${escape(displayName)}" required maxlength="100" class="mt-1.5 w-full rounded-lg border border-[#cadcc8] bg-white px-3 py-2.5 text-sm text-[#26382b] outline-none focus:border-[#168049]"/></label><label class="block text-xs font-medium text-[#526255]">Email công vụ<input name="email" type="email" value="${escape(authUser?.email || '')}" required class="mt-1.5 w-full rounded-lg border border-[#cadcc8] bg-white px-3 py-2.5 text-sm text-[#26382b] outline-none focus:border-[#168049]"/></label><label class="block text-xs font-medium text-[#526255]">Số điện thoại<input name="phone" inputmode="numeric" value="${escape(authUser?.phone || '')}" required class="mt-1.5 w-full rounded-lg border border-[#cadcc8] bg-white px-3 py-2.5 text-sm text-[#26382b] outline-none focus:border-[#168049]"/></label><div class="grid grid-cols-2 gap-3"><label class="block text-xs font-medium text-[#526255]">Vai trò<input value="${escape(role)}" readonly class="mt-1.5 w-full rounded-lg border border-[#d8e5d6] bg-[#f6faf5] px-3 py-2.5 text-xs text-[#647467]"/></label><label class="block text-xs font-medium text-[#526255]">Ngày tham gia<input value="${escape(joined)}" readonly class="mt-1.5 w-full rounded-lg border border-[#d8e5d6] bg-[#f6faf5] px-3 py-2.5 text-xs text-[#647467]"/></label></div><p data-admin-profile-message class="hidden rounded-lg px-3 py-2 text-xs" role="status"></p><button class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#08733a] px-4 py-3 text-sm font-bold text-white hover:bg-[#075c30]" type="submit"><span class="material-symbols-outlined text-base">save</span>Lưu thay đổi hồ sơ</button></form></section><section class="rounded-2xl border border-[#dce9da] bg-white p-5 shadow-sm"><div class="mb-4 flex items-center gap-3"><span class="material-symbols-outlined rounded-xl bg-[#e7f5e6] p-2.5 text-[#08733a]">security</span><div><h2 class="font-bold text-[#25382a]">Bảo mật tài khoản</h2><p class="text-xs text-[#718074]">Đổi mật khẩu quản trị viên</p></div></div><form data-admin-password-form class="space-y-3"><label class="block text-xs font-medium text-[#526255]">Mật khẩu hiện tại<input name="currentPassword" type="password" autocomplete="current-password" required class="mt-1.5 w-full rounded-lg border border-[#cadcc8] px-3 py-2.5 text-sm"/></label><label class="block text-xs font-medium text-[#526255]">Mật khẩu mới<input name="newPassword" type="password" autocomplete="new-password" minlength="8" required class="mt-1.5 w-full rounded-lg border border-[#cadcc8] px-3 py-2.5 text-sm"/></label><label class="block text-xs font-medium text-[#526255]">Xác nhận mật khẩu mới<input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required class="mt-1.5 w-full rounded-lg border border-[#cadcc8] px-3 py-2.5 text-sm"/></label><p data-admin-password-message class="hidden rounded-lg px-3 py-2 text-xs" role="status"></p><button class="w-full rounded-lg bg-[#e3f2e1] px-4 py-3 text-sm font-bold text-[#176b36]" type="submit">Cập nhật mật khẩu</button></form><div class="mt-5 rounded-xl border border-dashed border-[#cfdfcd] bg-[#f7fbf6] p-4"><div class="flex items-center justify-between gap-3"><div><h3 class="text-sm font-semibold text-[#304235]">Xác thực hai bước (2FA)</h3><p class="mt-1 text-xs text-[#718074]">Chưa được cấu hình trong hệ thống</p></div><span class="rounded-full bg-[#f0eee8] px-2.5 py-1 text-[10px] font-bold text-[#777163]">Chưa kích hoạt</span></div><p class="mt-3 text-xs leading-5 text-[#697a6c]">Bật 2FA cần tích hợp ứng dụng xác thực và quy trình cấp mã dự phòng. Tài khoản hiện vẫn được bảo vệ bằng mật khẩu.</p></div></section></div><div class="space-y-5"><section class="rounded-2xl border border-[#dce9da] bg-white p-5 shadow-sm"><div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eee4] pb-4"><div class="flex items-center gap-3"><span class="material-symbols-outlined rounded-xl bg-[#e7f5e6] p-2.5 text-[#08733a]">admin_panel_settings</span><div><h2 class="font-bold text-[#25382a]">Phân quyền & Phạm vi Truy cập Module</h2><p class="text-xs text-[#718074]">Quyền hiện áp dụng theo vai trò quản trị hệ thống.</p></div></div><span class="rounded-full bg-[#e3f2e1] px-3 py-1.5 text-xs font-semibold text-[#176b36]">${modules.length}/${modules.length} module</span></div><div class="space-y-3">${moduleCards}</div><div class="mt-4 flex items-start gap-2 rounded-xl bg-[#e8f4e7] p-4 text-xs leading-5 text-[#546658]"><span class="material-symbols-outlined text-[#176b36]">info</span><p><strong>Lưu ý quyền truy cập:</strong> Phân quyền chi tiết theo từng module chưa được bật ở backend. Quyền trong trang này phản ánh vai trò hiện tại, không phải công tắc cấp/thu quyền.</p></div></section><section class="overflow-hidden rounded-2xl border border-[#dce9da] bg-white shadow-sm"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eee4] p-5"><div class="flex items-center gap-3"><span class="material-symbols-outlined rounded-xl bg-[#e7f5e6] p-2.5 text-[#08733a]">history</span><div><h2 class="font-bold text-[#25382a]">Nhật ký hoạt động gần đây</h2><p class="text-xs text-[#718074]">Các lần cập nhật trạng thái đơn hàng đã lưu</p></div></div><span class="text-xs font-semibold text-[#176b36]">Nguồn: MongoDB</span></div><div class="overflow-x-auto"><table class="w-full min-w-[620px] text-left"><thead class="bg-[#f1f8f0] text-[10px] font-bold uppercase tracking-wide text-[#647467]"><tr><th class="px-3 py-3">Thời gian</th><th class="px-3 py-3">Hành động</th><th class="px-3 py-3">Mã tham chiếu</th><th class="px-3 py-3">Trạng thái</th></tr></thead><tbody>${activityRows || `<tr><td colspan="4" class="px-4 py-10 text-center text-sm text-[#718074]">${activity === null ? 'Đang tải nhật ký…' : 'Chưa có lịch sử hoạt động đơn hàng.'}</td></tr>`}</tbody></table></div></section></div></div></div>`
}

function parseScreenUnsafe(html, route, products, authUser, weeklyData, weeklyMetric, cart = {}, productPage = 1, productSearch = '', catalogFilters = {}, selectedProductId = '', availableCombos = [], farmBoxes = [], search = '', serverCartItems = null, customerOrders = null, orderFilter = 'Tất cả', customerOrdersError = '', paymentOrder = null, activePaymentMethod = '', adminWeeklyOrderError = '', adminWeekOrders = null, adminWeekOrdersError = '', adminWeekOrdersPage = 1, adminWeekOrderFilter = 'all', customerEmergencyFarmBoxes = [], adminRefunds = null, adminRefundError = '', adminProfileActivity = null) {
  if (!html) return { bodyClass: '', bodyHtml: '', styles: '', config: '', title: 'GreenNova' }
  let isCancelledOrderTemplate = false
  if (route.path === '/orders/detail') {
    const orderId = new URLSearchParams(search || '').get('orderId') || ''
    const currentOrder = customerOrders?.find((entry) => entry.id === orderId)
    if (currentOrder?.status === 'Đã hủy') {
      html = findScreen({ source: remixScreens, folder: 'chi_ti_t_n_h_ng_dh00121_h_y' }) || html
      isCancelledOrderTemplate = true
    }
  }
  const documentFromStitch = new DOMParser().parseFromString(html, 'text/html')
  const isAdminScreen = route.path.startsWith('/admin') || route.group === 'admin' || route.folder.startsWith('qt0')
  if (isAdminScreen) {
    const cleanAdminLabel = (value) => String(value || '')
      .replace(/\s*\(QT0\d+\)/gi, '')
      .replace(/\s+tại\s+QT0\d+/gi, '')
      .replace(/\bQT0\d+\s*[-–:]\s*/gi, '')
      .replace(/\bQT0\d+\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
    documentFromStitch.title = cleanAdminLabel(documentFromStitch.title)
    const labelWalker = documentFromStitch.createTreeWalker(documentFromStitch.body, NodeFilter.SHOW_TEXT)
    const textNodes = []
    while (labelWalker.nextNode()) textNodes.push(labelWalker.currentNode)
    textNodes.forEach((node) => {
      if (!/QT0\d+/i.test(node.textContent)) return
      const badge = node.parentElement
      if (badge && /^QT0\d+$/i.test(node.textContent.trim())) {
        badge.remove()
        return
      }
      node.textContent = cleanAdminLabel(node.textContent)
    })
  }
  applyFarmBoxPageControls(documentFromStitch, route)
  renderFarmBoxWeeksScreen(documentFromStitch, route, farmBoxes, search)
  renderAdminFarmBoxSelectedWeeks(documentFromStitch, route, farmBoxes)
  renderFarmBoxOptionsScreen(documentFromStitch, route, farmBoxes, search)
  renderFarmBoxCustomizerMenu(documentFromStitch, route)
  renderFarmBoxMenuScreen(documentFromStitch, route, farmBoxes, products, search)
  applyHomeFarmBoxSection(documentFromStitch, route, farmBoxes)
  removeFarmBoxDeliveryChoices(documentFromStitch, route)
  applyStoreProducts(documentFromStitch, route, products, productPage, productSearch, catalogFilters, selectedProductId)
  try {
    applyImperfectComboScreen(documentFromStitch, route, availableCombos, cart, search)
  } catch (error) {
    console.error('Không thể dựng trang combo Imperfect:', error)
  }
  if (isFarmBoxCustomerScreen(route)) {
    normalizeFarmBoxHeader(documentFromStitch)
    addFarmBoxEmergencyButton(documentFromStitch, route, customerOrders)
  }
  normalizeBrandLogo(documentFromStitch)
  normalizeStoreFooter(documentFromStitch, route)
  applyWeeklyChart(documentFromStitch, route, weeklyData, weeklyMetric)
  applyWeeklySalesMix(documentFromStitch, route, weeklyData)
  applyAdminWeeklyOrderSummary(documentFromStitch, route, weeklyData, adminWeeklyOrderError)
  applyAdminWeeklyOrderRows(documentFromStitch, route, adminWeekOrders, adminWeekOrdersError, adminWeekOrdersPage, adminWeekOrderFilter)
  applyAdminRefundPage(documentFromStitch, route, adminRefunds, adminRefundError)
  applyAdminProfilePage(documentFromStitch, route, authUser, adminProfileActivity)
  applyCartScreen(documentFromStitch, products, cart, route, farmBoxes, serverCartItems, availableCombos, authUser)
  applyCheckoutScreen(documentFromStitch, route, authUser)
  applyCheckoutSummary(documentFromStitch, route, products, cart, farmBoxes, serverCartItems, availableCombos)
  applyCustomerOrdersScreen(documentFromStitch, route, customerOrders, orderFilter, customerOrdersError, products, availableCombos, farmBoxes, authUser)
  applyFarmBoxChangeConfirmationPage(documentFromStitch, route, customerOrders, customerOrdersError, customerEmergencyFarmBoxes)
  applyCustomerFarmBoxesScreen(documentFromStitch, route, customerOrders, farmBoxes, customerOrdersError)
  try {
    applyCustomerOrderDetailScreen(documentFromStitch, route, search, customerOrders, customerOrdersError, products, availableCombos, farmBoxes)
  } catch (error) {
    console.error('Không thể hiển thị chi tiết đơn hàng:', error)
    if (route.path === '/orders/detail') {
      const main = documentFromStitch.body.querySelector('main')
      if (main) main.innerHTML = '<div class="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-5 text-center"><span class="material-symbols-outlined text-4xl text-error">error</span><h1 class="mt-3 font-headline-md text-headline-md text-on-surface">Chưa thể hiển thị chi tiết đơn</h1><p class="mt-2 text-sm text-on-surface-variant">Có lỗi khi đọc dữ liệu đơn hàng. Hãy quay lại danh sách đơn và thử mở lại.</p><a href="/orders" data-route="/orders" class="mt-5 rounded-xl bg-primary-container px-5 py-3 font-label-lg text-label-lg text-on-primary no-underline">Quay lại đơn hàng</a></div>'
    }
  }

  if (route.path === '/checkout/payment') {
    try {
      const breadcrumb = documentFromStitch.body.querySelector('nav[aria-label="Breadcrumb"]')
      if (breadcrumb) {
        const orderStep = [...breadcrumb.querySelectorAll('a, span')]
          .find((element) => normalizeLabel(element.textContent.trim()) === normalizeLabel('Đặt hàng'))
        if (orderStep) {
          const separator = orderStep.previousElementSibling
          orderStep.remove()
          if (separator?.textContent.trim() === '/') separator.remove()
        }
        breadcrumb.classList.add('flex-wrap')
        const backToOrders = documentFromStitch.createElement('a')
        backToOrders.href = '/orders'
        backToOrders.dataset.route = '/orders'
        backToOrders.className = 'ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#1B723B]/30 bg-white px-3 py-1.5 font-label-md text-label-md font-semibold text-[#1B723B] no-underline transition-colors hover:bg-[#EAF7EA]'
        backToOrders.innerHTML = '<span class="material-symbols-outlined text-[18px]">arrow_back</span><span>Quay lại trang đơn hàng</span>'
        breadcrumb.append(backToOrders)
      }
      const orderId = new URLSearchParams(window.location.search).get('orderId')
      const latestOrder = JSON.parse(sessionStorage.getItem('greennovaLatestOrder') || 'null')
      const order = orderId
        ? (paymentOrder?.id === orderId ? paymentOrder : null)
          || customerOrders?.find((item) => item.id === orderId)
          || (latestOrder?.id === orderId ? latestOrder : null)
        : latestOrder || paymentOrder
      if (order) {
        const escapeValue = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        }[char]))
        const code = documentFromStitch.body.querySelector('#order-code')
        const amount = documentFromStitch.body.querySelector('#amount')
        const memo = documentFromStitch.body.querySelector('#transfer-memo')
        const bankName = documentFromStitch.body.querySelector('#bank-name')
        const bankAccount = documentFromStitch.body.querySelector('#bank-acc')
        const bankOwner = documentFromStitch.body.querySelector('#bank-owner')
        if (code) code.textContent = order.orderCode || ''
        if (amount) amount.textContent = money(Number(order.totalAmount) || 0)
        if (memo) memo.textContent = order.payment?.transferContent || order.orderCode || ''
        if (bankName) bankName.textContent = 'MB Bank'
        if (bankAccount) bankAccount.textContent = '0912 345 678'
        if (bankOwner) bankOwner.textContent = 'CONG TY GREENNOVA'
        const deadlineLabel = [...documentFromStitch.body.querySelectorAll('span')]
          .find((element) => normalizeLabel(element.textContent).startsWith(normalizeLabel('Hạn thanh toán:')))
        const deadlineDate = order.createdAt
          ? new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000)
          : order.expiredAt ? new Date(order.expiredAt) : null
        const deadlineValue = deadlineLabel?.querySelector('strong')
        if (deadlineValue && deadlineDate && !Number.isNaN(deadlineDate.getTime())) {
          deadlineValue.textContent = deadlineDate.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
          })
        }

        const selectedMethod = activePaymentMethod
          || (order.status === 'Chờ thanh toán' && order.paymentMethod === 'BankTransfer' ? 'BankTransfer' : '')
          || (order.status === 'Đang xử lý' && order.paymentMethod === 'CashOnDelivery' ? 'CashOnDelivery' : '')
        const showTransfer = selectedMethod === 'BankTransfer' && order.status === 'Chờ thanh toán'
        const paymentSection = code?.closest('section')
        const paymentHeader = code?.parentElement?.parentElement
        const orderCodeBlock = code?.parentElement
        if (orderCodeBlock) orderCodeBlock.style.display = showTransfer ? 'flex' : 'none'
        const methodPicker = documentFromStitch.createElement('div')
        methodPicker.className = 'rounded-xl border border-[#DCE3D8] bg-white p-4'
        methodPicker.innerHTML = '<h2 class="mb-3 text-base font-semibold text-[#1F2A22]">Đổi phương thức thanh toán</h2><div class="grid grid-cols-1 gap-3"><button type="button" data-payment-method-choice="CashOnDelivery" class="flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"><span class="material-symbols-outlined text-[22px]">payments</span><span><strong class="block text-sm">Thanh toán khi nhận hàng</strong><small class="text-xs">Thanh toán tiền mặt khi nhận hàng</small></span><span data-choice-indicator class="ml-auto text-[#1B723B]"></span></button><button type="button" data-payment-method-choice="BankTransfer" class="flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors"><span class="material-symbols-outlined text-[22px]">account_balance</span><span><strong class="block text-sm">Chuyển khoản</strong><small class="text-xs">Thanh toán bằng VietQR</small></span><span data-choice-indicator class="ml-auto text-[#1B723B]"></span></button></div>'
        methodPicker.querySelectorAll('[data-payment-method-choice]').forEach((button) => {
          const active = button.dataset.paymentMethodChoice === selectedMethod
          button.disabled = order.status !== 'Chờ thanh toán'
          button.classList.add(...(active
            ? ['border-[#1B723B]', 'bg-[#EAF7EA]', 'text-[#14572D]']
            : ['border-[#DCE3D8]', 'text-[#3F4940]', 'hover:border-[#1B723B]']))
          button.setAttribute('aria-pressed', String(active))
          const indicator = button.querySelector('[data-choice-indicator]')
          if (indicator) indicator.innerHTML = `<span class="material-symbols-outlined text-[20px]">${active ? 'check_circle' : 'radio_button_unchecked'}</span>`
        })
        if (paymentHeader?.parentElement === paymentSection) paymentHeader.after(methodPicker)
        if (selectedMethod === 'CashOnDelivery' && paymentSection) {
          const confirmation = documentFromStitch.createElement('div')
          confirmation.className = 'flex items-start gap-3 rounded-xl border border-[#B8DDBE] bg-[#EAF7EA] p-4 text-[#14572D]'
          confirmation.innerHTML = '<span class="material-symbols-outlined text-[22px]">info</span><div><strong class="block text-sm">Thanh toán khi nhận hàng</strong><p class="mt-1 text-sm">Bấm “Xác nhận đơn hàng” bên dưới để chốt phương thức này. Khi đã xác nhận, đơn hàng không bị hủy theo hạn chuyển khoản.</p></div>'
          methodPicker.after(confirmation)
        }
        if (order.status === 'Đã thanh toán' && paymentSection) {
          const confirmation = documentFromStitch.createElement('div')
          confirmation.className = 'mt-3 flex flex-col gap-3 rounded-xl border border-[#B8DDBE] bg-[#EAF7EA] p-4 text-[#14572D]'
          confirmation.innerHTML = `<div class="flex items-start gap-3"><span class="material-symbols-outlined text-[24px]">check_circle</span><div><strong class="block text-sm">Đã thanh toán</strong><p class="mt-1 text-sm">GreenNova đã ghi nhận thanh toán. Đơn hàng đang chờ nông trại đóng gói.</p></div></div><a href="/orders/detail?orderId=${encodeURIComponent(order.id || '')}" data-route="/orders/detail?orderId=${encodeURIComponent(order.id || '')}" class="inline-flex w-fit items-center gap-2 rounded-lg bg-[#1B723B] px-4 py-2 text-sm font-semibold text-white no-underline"><span class="material-symbols-outlined text-[18px]">receipt_long</span>Xem trạng thái đơn hàng</a>`
          methodPicker.after(confirmation)
        }
        const paymentStatus = [...(paymentHeader?.querySelectorAll('span') || [])]
          .find((element) => normalizeLabel(element.textContent) === normalizeLabel('Chờ thanh toán'))
        if (paymentStatus && order.status) {
          paymentStatus.textContent = order.status
          const badge = paymentStatus.parentElement
          if (order.status === 'Đang xử lý') {
            badge?.classList.remove('bg-[#FDEFC8]', 'text-[#8A5A00]')
            badge?.classList.add('bg-[#EAF7EA]', 'text-[#1B723B]')
            const dot = badge?.querySelector('span.w-2')
            dot?.classList.remove('bg-[#C8701E]')
            dot?.classList.add('bg-[#1B723B]')
          } else if (order.status === 'Đã thanh toán') {
            badge?.classList.remove('bg-[#FDEFC8]', 'text-[#8A5A00]')
            badge?.classList.add('bg-[#E8F1FF]', 'text-[#2457A6]')
            const dot = badge?.querySelector('span.w-2')
            dot?.classList.remove('bg-[#C8701E]')
            dot?.classList.add('bg-[#2457A6]')
          }
        }

        const summary = [...documentFromStitch.body.querySelectorAll('aside')]
          .find((element) => element.querySelector('h2')?.textContent.includes('Tóm tắt đơn hàng'))
        if (summary) {
          const itemsList = summary.querySelector(':scope > .flex.flex-col.gap-4')
          const items = Array.isArray(order.items) ? order.items : []
          if (itemsList) {
            itemsList.innerHTML = items.map((item) => {
              const icon = item.itemType === 'FarmBox' ? 'inventory_2' : item.itemType === 'Combo' ? 'nutrition' : 'eco'
              const typeLabel = item.itemType === 'FarmBox' ? 'Farm Box' : item.itemType === 'Combo' ? 'Combo Imperfect' : 'Nông sản'
              const image = item.image || item.imageUrl || ''
              const imageElement = image
                ? `<img src="${escapeValue(image)}" alt="${escapeValue(item.name || typeLabel)}" class="h-14 w-14 shrink-0 rounded-lg border border-[#DCE3D8] bg-white object-cover" loading="lazy">`
                : `<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[#DCE3D8] bg-[#EAF7EA] text-[#1B723B]"><span class="material-symbols-outlined">${icon}</span></div>`
              return `<div class="flex items-center gap-3">${imageElement}<div class="min-w-0 flex-1"><h3 class="truncate text-sm font-semibold text-[#1F2A22]">${escapeValue(item.name || typeLabel)}</h3><div class="mt-0.5 flex items-center gap-2"><span class="rounded bg-[#F7F3EE] px-1.5 py-0.5 text-[11px] font-medium text-[#8A6A3B]">${typeLabel}</span><span class="text-xs text-[#5B6B60]">×${Number(item.quantity) || 0}</span></div></div><div class="shrink-0 text-right text-sm font-semibold text-[#1F2A22]">${money(Number(item.lineTotal) || 0)}</div></div>`
            }).join('')
          }
          const itemCount = summary.querySelector('h2')?.parentElement?.querySelector('span')
          if (itemCount) itemCount.textContent = `${items.length} món`
          const moneyRows = [...summary.querySelectorAll('.flex.justify-between')]
          const subtotalRow = moneyRows.find((row) => row.textContent.includes('Tạm tính'))
          if (subtotalRow?.lastElementChild) subtotalRow.lastElementChild.textContent = money(Number(order.subtotal ?? order.totalAmount) || 0)
          const shippingRow = moneyRows.find((row) => row.textContent.includes('Phí giao hàng'))
          if (shippingRow) {
            const fee = [...shippingRow.querySelectorAll('span')].at(-1)
            if (fee) fee.textContent = money(Number(order.shippingFee) || 0)
          }
          const totalRow = moneyRows.find((row) => row.textContent.includes('Tổng cộng'))
          if (totalRow?.lastElementChild) totalRow.lastElementChild.textContent = money(Number(order.totalAmount) || 0)
          const addressLabel = [...summary.querySelectorAll('span')].find((item) => item.textContent.includes('Địa chỉ nhận hàng:'))
          const addressValue = addressLabel?.parentElement?.querySelector('span:last-child')
          if (addressValue) addressValue.textContent = [order.shippingAddress, order.province].filter(Boolean).join(', ')
        }

        const paymentCountdown = [...documentFromStitch.body.querySelectorAll('span')]
          .find((element) => /^Còn\s/.test(element.textContent.trim()))
        if (paymentCountdown) {
          const countdownCard = paymentCountdown.parentElement?.parentElement?.parentElement
          if (countdownCard) countdownCard.style.display = !order.expiredAt || order.status !== 'Chờ thanh toán' || selectedMethod === 'CashOnDelivery' ? 'none' : ''
        }
        if (paymentCountdown && order.expiredAt && order.status === 'Chờ thanh toán' && selectedMethod === 'BankTransfer') {
          paymentCountdown.dataset.paymentExpiryCountdown = 'true'
          paymentCountdown.dataset.orderId = order.id || ''
          paymentCountdown.dataset.expiredAt = new Date(order.expiredAt).toISOString()
        }
        const qrConfirmButton = [...documentFromStitch.body.querySelectorAll('button')]
          .find((button) => normalizeLabel(button.textContent).includes('xac nhan thanh toan'))
        if (qrConfirmButton) {
          qrConfirmButton.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Xác nhận thanh toán</span>'
        }

        const qrSvg = documentFromStitch.body.querySelector('svg[viewBox="0 0 200 200"]')
        const qrContainer = qrSvg?.closest('.flex.flex-col.items-center')
        const bankPanel = bankName?.closest('.rounded-xl.border')
        if (qrContainer) qrContainer.style.display = showTransfer ? 'flex' : 'none'
        if (bankPanel) bankPanel.style.display = showTransfer ? 'flex' : 'none'
        if (qrSvg && showTransfer) {
          const qr = documentFromStitch.createElement('img')
          const qrParams = new URLSearchParams({
            amount: String(Math.max(0, Math.round(Number(order.totalAmount) || 0))),
            addInfo: order.payment?.transferContent || order.orderCode || '',
            accountName: 'CONG TY GREENNOVA',
          })
          qr.src = `https://img.vietqr.io/image/MB-0912345678-compact2.svg?${qrParams.toString()}`
          qr.alt = `Mã QR thanh toán đơn ${order.orderCode || ''} số tiền ${money(Number(order.totalAmount) || 0)}`
          qr.className = 'h-full w-full object-contain'
          qrSvg.replaceWith(qr)
          const qrCaption = [...documentFromStitch.body.querySelectorAll('p')]
            .find((element) => element.textContent.includes('Mã QR minh họa'))
          if (qrCaption) qrCaption.textContent = 'Quét mã QR VietQR để chuyển đúng số tiền và nội dung đơn hàng.'
        }
        const confirmButton = [...documentFromStitch.body.querySelectorAll('button')]
          .find((button) => normalizeLabel(button.textContent).includes('xac nhan thanh toan'))
        if (confirmButton) {
          if (selectedMethod === 'BankTransfer') {
            confirmButton.disabled = false
            confirmButton.dataset.paymentMethodConfirm = 'BankTransfer'
            confirmButton.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Xác nhận thanh toán</span>'
          } else if (selectedMethod === 'CashOnDelivery') {
            confirmButton.disabled = false
            confirmButton.dataset.paymentMethodConfirm = 'CashOnDelivery'
            confirmButton.innerHTML = '<span class="material-symbols-outlined text-[20px]">receipt_long</span><span>Xác nhận đơn hàng</span>'
          } else {
            confirmButton.style.display = 'none'
            delete confirmButton.dataset.paymentMethodConfirm
          }
        }
        const cancelButton = [...documentFromStitch.body.querySelectorAll('button')]
          .find((button) => normalizeLabel(button.textContent).includes('huy don hang'))
        if (cancelButton) {
          if (['Chờ thanh toán', 'Đã thanh toán', 'Đang xử lý'].includes(order.status)) {
            cancelButton.removeAttribute('onclick')
            cancelButton.dataset.customerCancelOrder = order.id || ''
          } else {
            cancelButton.style.display = 'none'
          }
        }
        if (order.id && ['Chờ thanh toán', 'Đã thanh toán', 'Đang xử lý'].includes(order.status)
          && !documentFromStitch.body.querySelector('[data-customer-cancel-modal="true"]')) {
          const paid = order.status === 'Đã thanh toán' || order.payment?.status === 'Đã thanh toán'
            || (order.status === 'Đang xử lý' && order.paymentMethod !== 'CashOnDelivery')
          const cancelModal = documentFromStitch.createElement('div')
          cancelModal.id = 'customer-cancel-modal'
          cancelModal.dataset.customerCancelModal = 'true'
          cancelModal.className = 'fixed inset-0 z-[100] hidden items-center justify-center bg-[#172019]/45 p-4 backdrop-blur-sm'
          cancelModal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="customer-cancel-title" class="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div class="flex items-start justify-between gap-3"><div><h2 id="customer-cancel-title" class="text-base font-bold text-[#26372b]">Hủy đơn hàng ${escapeValue(order.orderCode || '')}?</h2><p class="mt-2 text-xs leading-5 text-[#5d6d61]">${paid ? 'Đơn hàng đã thanh toán. Khi hủy, yêu cầu hoàn tiền sẽ được ghi nhận để xử lý.' : 'Đơn hàng chưa được thanh toán nên bạn sẽ không bị trừ tiền. Sau khi hủy, bạn không thể khôi phục đơn này.'}</p></div><button type="button" data-cancel-modal-close="true" class="rounded-full p-1 text-[#647267] hover:bg-[#f1f6f0]" aria-label="Đóng"><span class="material-symbols-outlined text-[19px]">close</span></button></div><fieldset class="mt-4 space-y-1.5"><legend class="sr-only">Lý do hủy đơn hàng</legend>${['Muốn thay đổi sản phẩm', 'Muốn đổi địa chỉ giao hàng', 'Đặt nhầm', 'Không muốn mua nữa', 'Lý do khác'].map((reason, index) => `<label class="flex cursor-pointer items-center gap-2.5 rounded-lg border ${index === 0 ? 'border-[#91b99a] bg-[#f5faf5]' : 'border-[#e4e9e3] bg-white'} px-3 py-2.5 text-xs text-[#29382d] hover:border-[#91b99a]"><input type="radio" name="customerCancelReason" value="${reason}" ${index === 0 ? 'checked' : ''} class="accent-[#16753b]"><span>${reason}</span></label>`).join('')}</fieldset><textarea data-cancel-other-reason class="mt-2 hidden min-h-16 w-full rounded-lg border border-[#d9e3d7] p-2.5 text-xs outline-none focus:border-[#16753b]" placeholder="Nhập lý do hủy"></textarea><div class="mt-4 flex flex-col gap-1.5"><button type="button" data-cancel-modal-confirm="true" class="h-10 w-full rounded-lg bg-[#cf2525] text-xs font-semibold text-white hover:bg-[#b51f1f]">Xác nhận hủy đơn</button><button type="button" data-cancel-modal-close="true" class="h-9 w-full rounded-lg border border-[#168044] text-xs font-semibold text-[#168044] hover:bg-[#f2f8f1]">Giữ lại đơn hàng</button></div></section>`
          documentFromStitch.body.append(cancelModal)
        }
      }
    } catch {}
  }

  if (route.path === '/forgot-password') {
    const recoveryForm = documentFromStitch.body.querySelector('#recoveryForm')
    const description = [...documentFromStitch.body.querySelectorAll('p')]
      .find((element) => element.textContent.includes('Hệ thống sẽ gửi cho bạn liên kết'))
    if (description) {
      description.textContent = 'Chức năng gửi email chưa được tích hợp. Sau khi nhập email đã đăng ký, bạn sẽ được chuyển thẳng đến trang đặt lại mật khẩu.'
    }
    const submitButton = recoveryForm?.querySelector('button[type="submit"]')
    if (submitButton) submitButton.textContent = 'Tiếp tục đặt lại mật khẩu →'
  }

  if (route.path.startsWith('/admin') || route.folder.startsWith('qt0')) {
    documentFromStitch.body.querySelectorAll('header span, aside span').forEach((element) => {
      if (element.textContent.trim() === 'Phạm Quốc Bảo') element.remove()
    })
    const markLogoutControl = (control) => {
      control.dataset.action = 'logout'
      control.setAttribute('aria-label', 'Đăng xuất')
      control.title = 'Đăng xuất'
    }
    const logoutControls = [...documentFromStitch.body.querySelectorAll('button, a')].filter((control) => (
      [...control.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded, .material-icons')]
        .some((icon) => normalizeLabel(icon.textContent) === 'logout')
    ))
    logoutControls.forEach(markLogoutControl)

    // Some admin Stitch pages omit the logout action from their sidebar.
    // Add it beside the admin profile so logout is available on every page.
    if (!logoutControls.length) {
      const sidebar = documentFromStitch.body.querySelector('aside')
      const roleLabel = [...(sidebar?.querySelectorAll('span, p') || [])]
        .find((element) => normalizeLabel(element.textContent) === 'quan tri vien')
      const profileRow = roleLabel?.parentElement?.parentElement
      if (profileRow) {
        const logoutButton = documentFromStitch.createElement('button')
        logoutButton.type = 'button'
        logoutButton.className = 'w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-on-primary hover:bg-primary hover:text-on-primary transition-colors'
        logoutButton.innerHTML = '<span class="material-symbols-outlined text-[18px]">logout</span>'
        markLogoutControl(logoutButton)
        profileRow.append(logoutButton)
      }
    }
  }

  const sampleNames = new Set([
    'Lê Thu Mai',
    'Nguyễn Văn A',
    'A Nguyễn Văn A',
    'Trần Minh Quang',
    'Thảo Vy',
    'Minh Thư',
  ])
  const sampleNameNodes = [...documentFromStitch.body.querySelectorAll('span, div, p, h1, h2, h3')]
    .filter((element) => sampleNames.has(element.textContent.trim()) && !element.children.length)
  if (authUser?.fullName) {
    sampleNameNodes.forEach((element) => { element.textContent = authUser.fullName })
  }

  const headerProfileName = sampleNameNodes.find((element) => element.closest('header'))
  if (headerProfileName) {
    if (!authUser) headerProfileName.textContent = 'Đăng nhập'
    const profileBlock = headerProfileName.parentElement
    const destination = authUser ? '/account' : '/login'
    if (profileBlock && profileBlock.tagName === 'A') {
      profileBlock.href = destination
      profileBlock.dataset.route = destination
      profileBlock.setAttribute('aria-label', authUser ? 'Tài khoản của tôi' : 'Đăng nhập')
    } else if (profileBlock) {
      const accountLink = documentFromStitch.createElement('a')
      accountLink.href = destination
      accountLink.dataset.route = destination
      accountLink.setAttribute('aria-label', authUser ? 'Tài khoản của tôi' : 'Đăng nhập')
      accountLink.className = profileBlock.className + ' cursor-pointer hover:opacity-80 transition-opacity'
      while (profileBlock.firstChild) accountLink.append(profileBlock.firstChild)
      profileBlock.replaceWith(accountLink)
    }
  }

  if (route.folder.startsWith('fb03')) {
    const addressBookNavItem = [...documentFromStitch.body.querySelectorAll('nav a')]
      .find((link) => link.textContent.includes('Sổ địa chỉ'))
    addressBookNavItem?.remove()
  }

  if (route.folder.startsWith('fb03') && authUser) {
    documentFromStitch.body.querySelectorAll('h3, p').forEach((element) => {
      if (element.textContent.trim() === 'Nguyễn Lê Bảo Châu') element.textContent = authUser.fullName || element.textContent
      if (element.textContent.trim() === 'chao.nguyenle@gmail.com') element.textContent = authUser.email || element.textContent
    })
    documentFromStitch.body.querySelectorAll('*').forEach((element) => {
      if (!element.children.length && element.textContent.includes('0912 345 678') && authUser.phone) {
        element.textContent = element.textContent.replace('0912 345 678', authUser.phone)
      }
    })
  }

  if (['/account', '/account/addresses', '/account/refund-account', '/account/change-password'].includes(route.path)) {
    const addressNavItem = [...documentFromStitch.body.querySelectorAll('aside nav a')]
      .find((link) => /Sổ địa chỉ giao hàng/.test(link.textContent))
    if (addressNavItem) {
      addressNavItem.href = '/account/addresses'
      addressNavItem.dataset.route = '/account/addresses'
      if (route.path === '/account/addresses') {
        addressNavItem.className = 'flex items-center justify-between px-3.5 py-3 rounded-lg bg-surface-container text-primary font-title-md text-title-md border-l-4 border-primary transition-all'
      }
    }
    const profileNavItem = [...documentFromStitch.body.querySelectorAll('aside nav a')]
      .find((link) => /Thông tin cá nhân/.test(link.textContent))
    if (profileNavItem) {
      profileNavItem.href = '/account'
      profileNavItem.dataset.route = '/account'
      if (route.path === '/account/addresses') profileNavItem.className = 'flex items-center justify-between px-3.5 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-title-md text-title-md transition-colors'
    }
    let refundNavItem = [...documentFromStitch.body.querySelectorAll('aside nav a')]
      .find((link) => /Tài khoản nhận hoàn tiền/.test(link.textContent))
    if (!refundNavItem) {
      refundNavItem = documentFromStitch.createElement('a')
      refundNavItem.className = 'flex items-center justify-between px-3.5 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-title-md text-title-md transition-colors'
      refundNavItem.innerHTML = '<div class="flex items-center gap-3"><span class="material-symbols-outlined text-[20px]">account_balance</span><span>Tài khoản nhận hoàn tiền</span></div>'
      addressNavItem?.after(refundNavItem)
    }
    refundNavItem.href = '/account/refund-account'
    refundNavItem.dataset.route = '/account/refund-account'
    if (route.path === '/account/refund-account') refundNavItem.className = 'flex items-center justify-between px-3.5 py-3 rounded-lg bg-surface-container text-primary font-title-md text-title-md border-l-4 border-primary transition-all'
    if (route.path === '/account/refund-account') {
      addressNavItem?.classList.remove('bg-surface-container', 'text-primary', 'border-l-4', 'border-primary')
      profileNavItem?.classList.remove('bg-surface-container', 'text-primary', 'border-l-4', 'border-primary')
      addressNavItem?.classList.add('text-on-surface-variant')
      profileNavItem?.classList.add('text-on-surface-variant')
    }
  }

  if (['/account', '/account/addresses', '/account/refund-account', '/account/change-password'].includes(route.path)) {
    const orderNavItem = [...documentFromStitch.body.querySelectorAll('nav a')]
      .find((link) => link.textContent.includes('Lịch sử đơn hàng'))
    const orderLabel = [...(orderNavItem?.querySelectorAll('span') || [])]
      .find((label) => label.textContent.trim() === 'Lịch sử đơn hàng')
    if (orderLabel) orderLabel.textContent = 'Đơn hàng của tôi'

  }

  if (['/account', '/account/addresses', '/account/refund-account', '/account/change-password'].includes(route.path) && authUser) {
    const identityCard = documentFromStitch.body.querySelector('aside .relative.z-10')
    const identityName = identityCard?.querySelector('h2')
    if (identityName) identityName.textContent = authUser.fullName || 'Tài khoản của tôi'
    const phoneUnderAvatar = identityName?.nextElementSibling
    if (phoneUnderAvatar?.tagName === 'SPAN' && /^\+?[\d\s()-]{8,}$/.test(phoneUnderAvatar.textContent.trim())) {
      phoneUnderAvatar.remove()
    }
    const avatarFrame = identityCard?.querySelector('.relative.mb-3')
    const profileImage = avatarFrame?.querySelector('img')
    if (profileImage) {
      const personIcon = documentFromStitch.createElement('div')
      personIcon.className = 'w-full h-full rounded-full bg-primary text-on-primary flex items-center justify-center'
      personIcon.innerHTML = '<span class="material-symbols-outlined text-[32px]">person</span>'
      profileImage.replaceWith(personIcon)
      avatarFrame.querySelector(':scope > span.absolute')?.remove()
    }

    const profileForm = documentFromStitch.body.querySelector('#profile-form')
    const profileInputs = [...(profileForm?.querySelectorAll('input') || [])]
    const setProfileInput = (input, value) => {
      if (!input) return
      const text = String(value || '')
      input.setAttribute('value', text)
      input.value = text
    }
    setProfileInput(profileInputs[0], authUser.fullName)
    setProfileInput(profileInputs[1], authUser.email)
    setProfileInput(profileInputs[2], authUser.phone)
    const createdAtInput = profileInputs[3]
    if (createdAtInput) {
      const createdAt = authUser.createdAt ? new Date(authUser.createdAt) : null
      const createdAtLabel = createdAt && !Number.isNaN(createdAt.getTime())
        ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(createdAt)
        : 'Chưa có dữ liệu'
      setProfileInput(createdAtInput, createdAtLabel)
      createdAtInput.readOnly = true
      createdAtInput.setAttribute('readonly', '')
    }
    documentFromStitch.body.querySelectorAll('#profile-form span').forEach((badge) => {
      if (badge.textContent.includes('Đã xác thực')) badge.remove()
    })
  }

  if (route.path === '/account/addresses' && authUser) {
    const mainContent = documentFromStitch.body.querySelector('.grid.grid-cols-1.lg\\:grid-cols-12 > main')
    const addresses = Array.isArray(authUser.addresses) ? authUser.addresses : []
    const escape = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
    if (mainContent) {
      const addressRows = addresses.map((item) => `<article class="rounded-2xl border ${item.isDefault ? 'border-[#d7e9d7] border-l-4 border-l-[#08733a]' : 'border-[#e0e9e0]'} bg-white p-5 shadow-sm" data-address-card="${escape(item.id)}">
        <div class="flex flex-wrap items-start justify-between gap-3"><div><div class="flex flex-wrap items-center gap-2"><h3 class="text-base font-bold text-[#26382c]">${escape(item.label || 'Địa chỉ khác')}</h3>${item.isDefault ? '<span class="rounded-full bg-[#e4f3e4] px-2.5 py-1 text-xs font-semibold text-[#08733a]">Mặc định</span>' : ''}</div>
        <p class="mt-1 text-sm text-[#526357]">${escape(item.receiverName || authUser.fullName)} <span class="mx-1 text-[#a2afa3]">|</span> ${escape(item.receiverPhone || authUser.phone)}</p></div>
        <span class="inline-flex items-center gap-1 rounded-full bg-[#edf7ed] px-2.5 py-1 text-xs font-medium text-[#08733a]"><span class="material-symbols-outlined text-sm">local_shipping</span> Miễn phí nội thành</span></div>
        <p class="mt-3 flex gap-2 text-sm leading-6 text-[#394b3d]"><span class="material-symbols-outlined mt-0.5 text-base text-[#08733a]">location_on</span>${escape(item.address)}${item.province ? `, ${escape(item.province)}` : ''}</p>
        ${item.note ? `<p class="mt-3 rounded-lg bg-[#f3f8f2] p-3 text-xs text-[#596b5d]">Ghi chú giao hàng: ${escape(item.note)}</p>` : ''}
        <div class="mt-4 flex flex-wrap items-center gap-4 border-t border-[#edf1ed] pt-3 text-xs">${item.isDefault ? '<span class="text-[#08733a]">✓ Địa chỉ đã xác thực qua SMS</span>' : `<button type="button" data-address-action="default" data-address-id="${escape(item.id)}" class="font-semibold text-[#08733a] hover:underline">Đặt làm mặc định</button>`}<button type="button" data-address-action="edit" data-address-id="${escape(item.id)}" class="font-semibold text-[#526357] hover:text-[#08733a]">✎ Chỉnh sửa</button><button type="button" data-address-action="delete" data-address-id="${escape(item.id)}" class="font-semibold text-[#c34236] hover:underline">Xóa</button></div>
      </article>`).join('')
      const area = [...documentFromStitch.body.querySelectorAll('nav')].find((node) => node.closest('main') && node.querySelector('a')?.textContent.includes('Trang chủ'))
      if (area) {
        const crumbs = [...area.querySelectorAll('span')]
        if (crumbs.length) crumbs[crumbs.length - 1].textContent = 'Sổ địa chỉ giao hàng'
      }
      const heading = documentFromStitch.body.querySelector('h1')
      if (heading) heading.textContent = 'Sổ Địa Chỉ Giao Hàng'
      const subheading = heading?.parentElement?.querySelector('p')
      if (subheading) subheading.textContent = 'Quản lý danh sách địa chỉ nhận nông sản tươi và cấu hình vị trí giao mặc định.'
      mainContent.innerHTML = `<section class="rounded-2xl border border-[#e0e9e0] bg-white p-5 shadow-sm sm:p-6"><div class="flex flex-wrap items-start justify-between gap-4"><div><div class="flex items-center gap-2 text-[#08733a]"><span class="material-symbols-outlined">library_books</span><h2 class="text-xl font-bold">Sổ Địa Chỉ Giao Hàng</h2></div><p class="mt-1 text-sm text-[#647467]">Quản lý địa chỉ nhận nông sản tươi và cấu hình vị trí giao mặc định.</p></div><button type="button" data-address-action="add" class="inline-flex items-center gap-2 rounded-lg bg-[#00632e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#07572d]">＋ Thêm Địa Chỉ Mới</button></div>
      <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><div class="rounded-xl bg-[#f0f8f0] p-4"><p class="text-xs text-[#68786a]">Tổng địa chỉ lưu</p><strong class="mt-1 block text-lg text-[#26382c]">${addresses.length.toString().padStart(2, '0')} địa điểm</strong></div><div class="rounded-xl bg-[#f0f8f0] p-4"><p class="text-xs text-[#68786a]">Tuyến giao thường xuyên</p><strong class="mt-1 block text-sm text-[#08733a]">${escape(addresses.find((item) => item.isDefault)?.province || authUser.province || 'Chưa thiết lập')}</strong></div><div class="rounded-xl bg-[#f0f8f0] p-4"><p class="text-xs text-[#68786a]">Khung giờ tiếp nhận</p><strong class="mt-1 block text-sm text-[#26382c]">08:00 - 11:30</strong></div></div>
      <div class="mt-5 flex flex-col gap-3">${addressRows || '<div class="rounded-xl border border-dashed border-[#ccdccc] bg-[#fbfdfb] p-8 text-center text-sm text-[#68786a]">Bạn chưa lưu địa chỉ giao hàng nào. Hãy thêm địa chỉ để đặt hàng nhanh hơn.</div>'}</div>
      <form data-address-form class="mt-4 hidden rounded-xl border border-[#dce9dc] bg-[#f8fbf7] p-5" hidden><h3 class="mb-4 text-lg font-bold text-[#26382c]" data-address-form-title>Thêm địa chỉ giao hàng</h3><input type="hidden" name="id"><div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><label class="text-sm font-medium text-[#3f5143]">Tên địa chỉ<input name="label" maxlength="60" required placeholder="Nhà riêng, Văn phòng..." class="mt-1 h-11 w-full rounded-lg border border-[#d3ded2] bg-white px-3"></label><label class="text-sm font-medium text-[#3f5143]">Người nhận<input name="receiverName" maxlength="100" required value="${escape(authUser.fullName)}" class="mt-1 h-11 w-full rounded-lg border border-[#d3ded2] bg-white px-3"></label><label class="text-sm font-medium text-[#3f5143]">Số điện thoại<input name="receiverPhone" maxlength="11" inputmode="numeric" required value="${escape(authUser.phone)}" class="mt-1 h-11 w-full rounded-lg border border-[#d3ded2] bg-white px-3"></label><label class="text-sm font-medium text-[#3f5143]">Tỉnh / thành phố<input name="province" maxlength="100" required value="${escape(authUser.province)}" placeholder="Tỉnh / thành phố" class="mt-1 h-11 w-full rounded-lg border border-[#d3ded2] bg-white px-3"></label><label class="text-sm font-medium text-[#3f5143] sm:col-span-2">Địa chỉ chi tiết<input name="address" maxlength="500" required value="" placeholder="Số nhà, đường, phường/xã, quận/huyện" class="mt-1 h-11 w-full rounded-lg border border-[#d3ded2] bg-white px-3"></label><label class="text-sm font-medium text-[#3f5143] sm:col-span-2">Ghi chú giao hàng (không bắt buộc)<input name="note" maxlength="300" placeholder="Ví dụ: Gọi trước khi giao" class="mt-1 h-11 w-full rounded-lg border border-[#d3ded2] bg-white px-3"></label></div><label class="mt-3 flex items-center gap-2 text-sm text-[#46594a]"><input type="checkbox" name="makeDefault" checked> Đặt làm địa chỉ mặc định</label><div class="mt-4 flex justify-end gap-2"><button type="button" data-address-action="close" class="rounded-lg border border-[#ccdccc] px-4 py-2 text-sm">Đóng</button><button type="submit" class="rounded-lg bg-[#00632e] px-5 py-2 text-sm font-semibold text-white">Lưu địa chỉ</button></div></form></section>`
    }
  }

  if (route.path === '/account/refund-account' && authUser) {
    const mainContent = documentFromStitch.body.querySelector('.grid.grid-cols-1.lg\\:grid-cols-12 > main')
    const escape = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
    const accountNumber = String(authUser.bankAccountNumber || '')
    const maskedAccount = accountNumber ? `${'•'.repeat(Math.max(0, Math.min(12, accountNumber.length - 4)))}${accountNumber.slice(-4)}` : 'Chưa thêm số tài khoản'
    const heading = documentFromStitch.body.querySelector('h1')
    if (heading) heading.textContent = 'Tài khoản nhận hoàn tiền'
    const subheading = heading?.parentElement?.querySelector('p')
    if (subheading) subheading.textContent = 'Quản lý thông tin ngân hàng để nhận hoàn tiền và ưu đãi GreenNova.'
    const crumbs = [...documentFromStitch.body.querySelectorAll('nav')]
      .find((node) => node.closest('main') && node.querySelector('a')?.textContent.includes('Trang chủ'))
      ?.querySelectorAll('span')
    if (crumbs?.length) crumbs[crumbs.length - 1].textContent = 'Tài khoản nhận hoàn tiền'
    if (mainContent) mainContent.innerHTML = `<div class="flex flex-col gap-4">
      <div class="rounded-xl border border-[#d9ead8] bg-[#eaf6e9] p-4 text-sm text-[#36533b]"><strong class="block text-[#176b39]">Chính sách hoàn tiền tự động qua STK</strong><p class="mt-1">Khi có đơn hàng cần hoàn tiền, khoản hoàn sẽ được gửi về tài khoản bên dưới. Hãy kiểm tra thông tin thật chính xác để tránh chậm trễ.</p></div>
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b5730] via-[#126b3b] to-[#36834e] p-5 text-white shadow-lg"><div class="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-white/5"></div><div class="relative flex items-start justify-between gap-3"><div class="flex items-center gap-2"><span class="material-symbols-outlined rounded-lg bg-white/15 p-2">account_balance_wallet</span><div><p class="text-[10px] font-bold tracking-[0.14em] text-white/75">GREENNOVA REFUND PASS</p><p class="text-sm font-semibold">Tài khoản nhận hoàn tiền</p></div></div><div class="flex gap-1.5"><span class="rounded bg-white/15 px-2 py-1 text-[10px] font-bold">NAPAS 24/7</span><span class="rounded bg-white/15 px-2 py-1 text-[10px] font-bold">${escape(authUser.bankName || 'BANK')}</span></div></div><div class="relative mt-6"><p class="text-[9px] tracking-[0.16em] text-white/65">SỐ TÀI KHOẢN HƯỞNG</p><p class="mt-1 font-mono text-xl font-bold tracking-[0.22em]">${escape(maskedAccount)}</p></div><div class="relative mt-4 flex justify-between gap-4 text-[10px]"><div><p class="text-white/65">CHỦ TÀI KHOẢN</p><p class="mt-1 font-semibold uppercase tracking-wide">${escape(authUser.bankAccountHolder || authUser.fullName)}</p></div><div class="text-right"><p class="text-white/65">NGÂN HÀNG / CHI NHÁNH</p><p class="mt-1 font-semibold">${escape(authUser.bankName || 'Chưa thiết lập')}${authUser.bankBranch ? ` · ${escape(authUser.bankBranch)}` : ''}</p></div></div></section>
      <section class="rounded-xl border border-[#e0e9e0] bg-white p-5 shadow-sm sm:p-6"><div class="mb-4 flex items-start justify-between gap-3"><div><h2 class="text-lg font-bold text-[#26382c]">Chi Tiết Thông Tin Nhận Tiền</h2><p class="text-xs text-[#657468]">Vui lòng nhập thông tin chính xác để tránh lỗi khi tất toán giao dịch.</p></div><span class="hidden items-center gap-1 text-[10px] text-[#627266] sm:inline-flex"><span class="material-symbols-outlined text-sm">verified_user</span>Mã hóa dữ liệu 256-bit</span></div>
      <form data-refund-account-form class="grid grid-cols-1 gap-3 sm:grid-cols-2"><label class="text-xs font-semibold text-[#405144]">Ngân hàng hưởng <span class="text-red-600">*</span><input name="bankName" maxlength="100" required value="${escape(authUser.bankName)}" placeholder="Ví dụ: Vietcombank" class="mt-1 h-10 w-full rounded-lg border border-[#d3ded2] px-3 text-sm font-normal text-[#26382c] focus:outline-none focus:ring-2 focus:ring-[#08733a]"></label><label class="text-xs font-semibold text-[#405144]">Số tài khoản nhận tiền <span class="text-red-600">*</span><input name="bankAccountNumber" maxlength="40" inputmode="numeric" required value="${escape(authUser.bankAccountNumber)}" placeholder="Nhập số tài khoản" class="mt-1 h-10 w-full rounded-lg border border-[#d3ded2] px-3 text-sm font-normal text-[#26382c] focus:outline-none focus:ring-2 focus:ring-[#08733a]"></label><label class="text-xs font-semibold text-[#405144]">Tên chủ tài khoản (in hoa không dấu) <span class="text-red-600">*</span><input name="bankAccountHolder" maxlength="100" required value="${escape(authUser.bankAccountHolder || authUser.fullName)}" placeholder="TEN CHU TAI KHOAN" class="mt-1 h-10 w-full rounded-lg border border-[#d3ded2] px-3 text-sm font-normal uppercase text-[#26382c] focus:outline-none focus:ring-2 focus:ring-[#08733a]"></label><label class="text-xs font-semibold text-[#405144]">Chi nhánh / Tỉnh thành (Tùy chọn)<input name="bankBranch" maxlength="100" value="${escape(authUser.bankBranch)}" placeholder="Ví dụ: Chi nhánh TP. Hồ Chí Minh" class="mt-1 h-10 w-full rounded-lg border border-[#d3ded2] px-3 text-sm font-normal text-[#26382c] focus:outline-none focus:ring-2 focus:ring-[#08733a]"></label><p class="rounded-lg bg-[#eaf6e9] p-3 text-xs text-[#45654b] sm:col-span-2">Thông tin tài khoản chỉ được dùng để xử lý hoàn tiền và ưu đãi dành cho bạn.</p><div class="flex flex-wrap justify-end gap-2 sm:col-span-2"><button type="reset" class="rounded-lg border border-[#d3ded2] px-4 py-2 text-xs font-semibold text-[#536457]">Khôi phục mặc định</button><button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-[#00632e] px-5 py-2 text-xs font-semibold text-white hover:bg-[#07572d]"><span class="material-symbols-outlined text-sm">save</span>Lưu Tài Khoản Hoàn Tiền</button></div></form></section></div>`
  }

  if (route.path.startsWith('/imperfect')) {
    documentFromStitch.body.querySelector('header')?.querySelectorAll('span, div, p').forEach((element) => {
      if (!element.children.length && element.textContent.trim() === 'Trần Minh Khang') element.remove()
    })
  }

  if (authUser && !['/login', '/register'].includes(route.path)) {
    const header = documentFromStitch.body.querySelector('header')
    const headerControls = [...(header?.querySelectorAll('a, button') || [])]
    const loginControl = headerControls.find((element) => labelOf(element).includes('dang nhap'))
    const registerControl = headerControls.find((element) => labelOf(element).includes('dang ky'))
    if (loginControl) {
      if (route.path === '/cart') {
        loginControl.classList.add('hidden')
      } else {
        loginControl.textContent = authUser.fullName || 'Tài khoản của tôi'
        loginControl.dataset.route = '/account'
        if (loginControl.tagName === 'A') loginControl.href = '/account'
      }
    }
    if (registerControl) registerControl.classList.add('hidden')
  }

  if (route.path === '/cart') {
    const header = documentFromStitch.body.querySelector('header')
    const cartControl = header?.querySelector('[data-path="gio-hang"], [aria-label="Giỏ hàng"], [title="Giỏ hàng"]')
    const personIcon = [...(header?.querySelectorAll('.material-symbols-outlined') || [])]
      .find((element) => element.textContent.trim() === 'person')
    const avatar = personIcon?.parentElement

    if (header && cartControl && avatar) {
      const accountLink = avatar.closest('a') || documentFromStitch.createElement('a')
      accountLink.href = authUser ? '/account' : '/login'
      accountLink.dataset.route = authUser ? '/account' : '/login'
      accountLink.setAttribute('aria-label', authUser ? 'Tài khoản của tôi' : 'Đăng nhập')
      accountLink.classList.add('cursor-pointer', 'hover:opacity-80', 'transition-opacity')
      if (!avatar.closest('a')) {
        avatar.replaceWith(accountLink)
        accountLink.append(avatar)
      }
      cartControl.after(accountLink)
    }
  }

  const profileImages = [...(documentFromStitch.body.querySelector('header')?.querySelectorAll('img') || [])]
    .filter((image) => /profile|avatar|user/i.test(image.alt))
  profileImages.forEach((image) => {
    const destination = authUser ? '/account' : '/login'
    const avatar = documentFromStitch.createElement('span')
    avatar.className = `${image.className.replace(/\bobject-cover\b/g, '')} bg-primary text-on-primary flex items-center justify-center shrink-0`.trim()
    avatar.setAttribute('aria-hidden', 'true')
    avatar.innerHTML = '<span class="material-symbols-outlined text-[20px]">person</span>'

    const existingLink = image.closest('a')
    if (existingLink) {
      existingLink.href = destination
      existingLink.dataset.route = destination
      existingLink.setAttribute('aria-label', authUser ? 'Tài khoản của tôi' : 'Đăng nhập')
      image.replaceWith(avatar)
    } else {
      const accountLink = documentFromStitch.createElement('a')
      accountLink.href = destination
      accountLink.dataset.route = destination
      accountLink.setAttribute('aria-label', authUser ? 'Tài khoản của tôi' : 'Đăng nhập')
      accountLink.className = 'inline-flex rounded-full cursor-pointer hover:opacity-80 transition-opacity'
      accountLink.append(avatar)
      image.replaceWith(accountLink)
    }
  })

  if (route.path === '/nong-san/chi-tiet') {
    const header = documentFromStitch.body.querySelector('header')
    const controls = [...(header?.querySelectorAll('a, button') || [])]
    const loginControl = controls.find((control) => labelOf(control).includes('dang nhap'))
    const registerControl = controls.find((control) => labelOf(control).includes('dang ky'))
    const cartControl = controls.find((control) => [...control.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded')]
      .some((icon) => ['shopping bag', 'shopping cart', 'shopping basket'].includes(normalizeLabel(icon.textContent))))
    const personIcon = [...(header?.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded') || [])]
      .find((icon) => normalizeLabel(icon.textContent) === 'person')
    const avatar = personIcon?.parentElement

    if (authUser) {
      loginControl?.classList.add('hidden')
      registerControl?.classList.add('hidden')
      header?.querySelectorAll('span, p, div, a').forEach((element) => {
        if (element.children.length || element.textContent.trim() !== authUser.fullName) return
        const oldNameControl = element.closest('a')
        if (oldNameControl && oldNameControl !== cartControl && !oldNameControl.contains(cartControl)) {
          oldNameControl.remove()
        } else {
          element.remove()
        }
      })
      avatar?.remove()

      if (header && cartControl) {
        const accountLink = documentFromStitch.createElement('a')
        accountLink.href = '/account'
        accountLink.dataset.route = '/account'
        accountLink.setAttribute('aria-label', 'Tài khoản của tôi')
        accountLink.className = 'inline-flex items-center gap-2 ml-1 text-on-surface font-label-lg text-label-lg hover:text-primary transition-colors'

        const accountAvatar = documentFromStitch.createElement('span')
        accountAvatar.className = 'w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0'
        accountAvatar.setAttribute('aria-hidden', 'true')
        accountAvatar.innerHTML = '<span class="material-symbols-outlined text-on-primary text-[18px]">person</span>'
        const accountName = documentFromStitch.createElement('span')
        accountName.textContent = authUser.fullName || 'Tài khoản của tôi'
        accountLink.append(accountAvatar, accountName)
        cartControl.after(accountLink)
      }
    } else {
      avatar?.remove()
    }
  }

  if (route.path === '/account/change-password') {
    const main = documentFromStitch.body.querySelector('.grid.grid-cols-1.lg\\:grid-cols-12 > main')
      || documentFromStitch.body.querySelector('main')
    if (main) {
      const passwordLink = [...documentFromStitch.body.querySelectorAll('aside nav a')]
        .find((link) => /Đổi mật khẩu/.test(link.textContent))
      if (passwordLink) {
        passwordLink.href = '/account/change-password'
        passwordLink.dataset.route = '/account/change-password'
        passwordLink.className = 'flex items-center justify-between px-3.5 py-3 rounded-lg bg-surface-container text-primary font-title-md text-title-md border-l-4 border-primary transition-all'
      }
      const farmBoxLink = [...documentFromStitch.body.querySelectorAll('aside nav a')]
        .find((link) => /Farm Box của tôi/.test(link.textContent))
      farmBoxLink?.remove()
      main.innerHTML = `<div class="mx-auto w-full max-w-5xl space-y-4">
        <section class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e0e9e0] bg-white px-5 py-4 shadow-sm"><div class="flex items-start gap-3"><span class="material-symbols-outlined rounded-lg bg-[#e8f5e9] p-2 text-[#08733a]">shield_lock</span><div><h1 class="text-lg font-bold text-[#24372a]">Đổi Mật Khẩu Đăng Nhập</h1><p class="text-xs text-[#66766a]">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản mua hàng và thông tin cá nhân.</p></div></div><span class="rounded-full bg-[#f0f7f0] px-3 py-1 text-[11px] text-[#637267]">Mật khẩu được mã hóa an toàn</span></section>
        <section class="flex items-start gap-3 rounded-xl bg-[#e8f5e9] px-5 py-4 text-[#285238]"><span class="material-symbols-outlined text-[#08733a]">verified_user</span><div><h2 class="text-sm font-bold">GreenNova Shield — Bảo vệ tài khoản chủ động</h2><p class="mt-1 text-xs leading-5">Mật khẩu của bạn được bảo vệ bằng mã hóa. Không chia sẻ mật khẩu hoặc mã xác thực với bất kỳ ai.</p></div></section>
        <form id="changePasswordForm" class="space-y-5 rounded-xl border border-[#e0e9e0] bg-white p-5 shadow-sm sm:p-7" novalidate>
          <label class="block text-sm font-semibold text-[#26382c]">Mật khẩu hiện tại <span class="text-red-600">*</span><span class="float-right"><a href="/forgot-password" data-route="/forgot-password" class="text-xs font-semibold text-[#08733a]">Quên mật khẩu?</a></span><span class="relative mt-2 block"><input id="currentPassword" name="currentPassword" type="password" autocomplete="current-password" required class="h-11 w-full rounded-xl bg-[#eaf6e9] px-4 pr-12 text-sm font-normal outline-none focus:ring-2 focus:ring-[#16803d]" placeholder="Nhập mật khẩu đang sử dụng"><button type="button" data-toggle-password="currentPassword" class="absolute inset-y-0 right-3 text-[#68786b]" aria-label="Hiện mật khẩu"><span class="material-symbols-outlined text-lg">visibility</span></button></span></label>
          <label class="block text-sm font-semibold text-[#26382c]">Mật khẩu mới <span class="text-red-600">*</span><span class="relative mt-2 block"><input id="newPassword" name="newPassword" type="password" autocomplete="new-password" required minlength="8" class="h-11 w-full rounded-xl bg-[#eaf6e9] px-4 pr-12 text-sm font-normal outline-none focus:ring-2 focus:ring-[#16803d]" placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"><button type="button" data-toggle-password="newPassword" class="absolute inset-y-0 right-3 text-[#68786b]" aria-label="Hiện mật khẩu"><span class="material-symbols-outlined text-lg">visibility</span></button></span><span class="mt-2 block"><span class="flex justify-between text-[11px] font-medium text-[#46584a]"><span>Độ an toàn mật khẩu:</span><span id="password-strength-label">Chưa nhập</span></span><span class="mt-1 flex gap-1"><span data-strength-bar class="h-1 flex-1 rounded-full bg-[#e3eee3]"></span><span data-strength-bar class="h-1 flex-1 rounded-full bg-[#e3eee3]"></span><span data-strength-bar class="h-1 flex-1 rounded-full bg-[#e3eee3]"></span><span data-strength-bar class="h-1 flex-1 rounded-full bg-[#e3eee3]"></span></span></span></label>
          <label class="block text-sm font-semibold text-[#26382c]">Xác nhận mật khẩu mới <span class="text-red-600">*</span><span class="relative mt-2 block"><input id="confirmNewPassword" name="confirmNewPassword" type="password" autocomplete="new-password" required class="h-11 w-full rounded-xl bg-[#eaf6e9] px-4 pr-12 text-sm font-normal outline-none focus:ring-2 focus:ring-[#16803d]" placeholder="Nhập lại mật khẩu mới"><button type="button" data-toggle-password="confirmNewPassword" class="absolute inset-y-0 right-3 text-[#68786b]" aria-label="Hiện mật khẩu"><span class="material-symbols-outlined text-lg">visibility</span></button></span></label>
          <section class="rounded-xl bg-[#e8f5e9] p-4 text-xs text-[#344b39]"><h2 class="mb-2 font-bold uppercase tracking-wide">☷ Tiêu chuẩn mật khẩu an toàn:</h2><p class="mb-1">● Độ dài từ 8 ký tự trở lên</p><p class="mb-1">● Chứa ít nhất 1 chữ viết hoa và 1 số</p><p>● Nên có ít nhất 1 ký tự đặc biệt (!, @, #, $, %, ^, &amp;, *)</p></section>
          <p id="change-password-message" class="hidden rounded-lg px-4 py-3 text-sm" role="status"></p>
          <p class="rounded-xl bg-[#e8f5e9] p-4 text-xs leading-5 text-[#344b39]"><strong>ⓘ Lưu ý bảo mật:</strong> Sau khi đổi mật khẩu thành công, các phiên đăng nhập trên thiết bị lạ sẽ tự động đăng xuất để đảm bảo an toàn cho tài khoản.</p>
          <div class="flex flex-wrap gap-3"><button type="submit" class="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#006233] px-5 text-sm font-bold text-white hover:bg-[#07572d]"><span class="material-symbols-outlined text-base">key</span>Cập Nhật Mật Khẩu</button><a href="/account" data-route="/account" class="inline-flex h-11 items-center justify-center rounded-lg bg-[#e8f5e9] px-5 text-sm font-semibold text-[#445548] no-underline">Hủy bỏ / Khôi phục</a></div>
        </form>
      </div>`
    }
  }

  applyCustomerProfileNavigation(documentFromStitch, route)
  normalizeStoreHeader(documentFromStitch, route, authUser, cart)
  wireStitchNavigation(documentFromStitch, route)

  if (!route.path.startsWith('/admin') && !route.folder.startsWith('qt0')) {
    const assistant = documentFromStitch.createElement('aside')
    assistant.id = 'greennova-assistant'
    assistant.className = 'fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3'
    assistant.innerHTML = `<section id="greennova-assistant-panel" class="hidden h-[min(560px,calc(100vh-110px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-[#d8e5d8] bg-white shadow-[0_18px_60px_rgba(20,60,30,.22)]" aria-label="Trợ lý GreenNova" aria-hidden="true">
      <header class="flex items-center justify-between bg-[#176b36] px-4 py-3 text-white"><div class="flex items-center gap-3"><span class="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-full bg-white/15">smart_toy</span><div><h2 class="text-sm font-bold">Trợ lý GreenNova AI</h2><p class="text-xs text-white/80">Tư vấn nông sản và Farm Box</p></div></div><button type="button" data-assistant-close class="rounded-lg p-2 hover:bg-white/15" aria-label="Đóng chat"><span class="material-symbols-outlined">close</span></button></header>
      <div id="greennova-assistant-messages" class="flex flex-1 flex-col gap-3 overflow-y-auto bg-[#f5faf4] p-4" aria-live="polite"><div class="max-w-[90%] self-start rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 text-sm leading-6 text-[#334238] shadow-sm">Xin chào! Hãy chọn câu hỏi gợi ý hoặc nhập câu hỏi để tra cứu bộ tư vấn GreenNova.</div><div id="greennova-assistant-prompts" class="flex flex-wrap gap-2"></div></div>
      <form id="greennova-assistant-form" class="flex items-center gap-2 border-t border-[#e4ece4] bg-white p-3"><input id="greennova-assistant-input" maxlength="500" autocomplete="off" class="min-w-0 flex-1 rounded-xl border border-[#cedbce] px-3 py-2.5 text-sm outline-none focus:border-[#176b36]" placeholder="Nhập câu hỏi của bạn..." aria-label="Nhập câu hỏi cho trợ lý"><button type="submit" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#176b36] text-white hover:bg-[#10572b]" aria-label="Gửi câu hỏi"><span class="material-symbols-outlined">send</span></button></form>
    </section><button type="button" id="greennova-assistant-launcher" class="flex h-14 items-center gap-2 rounded-full bg-[#176b36] px-4 text-white shadow-lg transition hover:scale-[1.02] hover:bg-[#10572b]" aria-label="Mở Trợ lý GreenNova AI" aria-expanded="false"><span class="material-symbols-outlined">psychology</span><span class="text-sm font-semibold">Tư vấn AI</span></button>`
    documentFromStitch.body.append(assistant)
  }

  documentFromStitch.body.querySelectorAll('script').forEach((script) => script.remove())
  documentFromStitch.body.querySelectorAll('*').forEach((element) => {
    [...element.attributes]
      .filter((attribute) => attribute.name.toLowerCase().startsWith('on'))
      .forEach((attribute) => element.removeAttribute(attribute.name))
  })
  const bodyHtml = documentFromStitch.body.innerHTML
  const styles = `${isCancelledOrderTemplate ? '@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");\n' : ''}${[...documentFromStitch.head.querySelectorAll('style')]
    .map((style) => style.textContent)
    .join('\n')}`
  const config = documentFromStitch.querySelector('#tailwind-config')?.textContent || ''

  return {
    bodyClass: documentFromStitch.body.className,
    bodyHtml,
    styles,
    config,
    title: documentFromStitch.title || 'GreenNova',
  }
}

function parseScreen(...args) {
  const [html, route] = args
  try {
    return parseScreenUnsafe(...args)
  } catch (error) {
    console.error(`Không thể dựng giao diện ${route?.path || 'GreenNova'}:`, error)
    const safeTitle = String(route?.title || 'GreenNova').replace(/[&<>"']/g, '')
    const bodyHtml = `<main class="min-h-[60vh] px-6 py-16 text-center text-[#1F2A22]"><div class="mx-auto max-w-xl rounded-2xl border border-[#DCE3D8] bg-white p-8 shadow-sm"><span class="material-symbols-outlined text-4xl text-[#1B723B]">error</span><h1 class="mt-3 text-xl font-bold">Chưa thể tải ${safeTitle}</h1><p class="mt-2 text-sm text-[#5B6B60]">Đã xảy ra lỗi khi dựng trang. Tải lại trang hoặc quay về danh sách đơn hàng để thử lại.</p><a href="/orders" data-route="/orders" class="mt-5 inline-flex rounded-lg bg-[#1B723B] px-4 py-2.5 text-sm font-semibold text-white no-underline">Quay lại đơn hàng</a></div></main>`
    return {
      bodyClass: 'min-h-screen bg-[#F8F9F3] font-sans text-[#1F2A22]',
      bodyHtml,
      styles: '',
      config: '',
      title: safeTitle,
    }
  }
}

const normalizeLabel = (value) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()

function getProductQuantityStep(product) {
  const category = normalizeLabel(`${product?.categoryName || ''} ${product?.category || ''}`)
  const unit = normalizeLabel(product?.unit || '')
  if (unit !== 'kg') return 1
  return category.includes('rau an la') || category.includes('rau la') ? 0.25 : 0.5
}

function getFarmBoxWeekOpenThisWeek(box, now = new Date()) {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const monday = new Date(today)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const nextMonday = new Date(monday)
  nextMonday.setDate(nextMonday.getDate() + 7)
  return (box?.weeks || []).find((week) => {
    const start = new Date(week.startDate)
    const end = new Date(week.endDate)
    return week.selectedForWeek !== false
      && week.status === 'Đang mở'
      && !Number.isNaN(start.getTime())
      && !Number.isNaN(end.getTime())
      && start < nextMonday
      && end >= monday
  }) || null
}

const getAdminFilteredProducts = (products, inventory, filters) => {
  const inventoryById = new Map(inventory.map((record) => [String(record.productId), record]))
  const query = normalizeLabel(filters.search || '')
  return products.filter((product) => {
    const inventoryRecord = inventoryById.get(String(product.id))
    const quantity = Number(inventoryRecord?.quantity ?? product.stock) || 0
    const saleStatus = product.saleStatus || product.status || ''
    const haystack = normalizeLabel(`${product.name || ''} ${product.sku || ''}`)
    if (query && !haystack.includes(query)) return false
    if (filters.category && normalizeLabel(product.categoryName || product.category || '') !== normalizeLabel(filters.category)) return false
    if (filters.farm && normalizeLabel(product.farm || '') !== normalizeLabel(filters.farm)) return false
    if (filters.status === 'active' && !(saleStatus === 'Đang bán' && quantity > 0)) return false
    if (filters.status === 'out_of_stock' && !(saleStatus === 'Đang bán' && quantity <= 0)) return false
    if (filters.status === 'warning' && !(saleStatus === 'Đang bán' && quantity > 0 && quantity <= 5)) return false
    if (filters.status === 'suspended' && saleStatus === 'Đang bán') return false
    if (filters.status === 'restocking' && !product.isRestocking) return false
    return true
  })
}

function labelOf(element) {
  const clone = element.cloneNode(true)
  clone.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded, .material-icons')
    .forEach((icon) => icon.remove())
  return normalizeLabel([
    element.getAttribute('aria-label') || '',
    element.getAttribute('title') || '',
    clone.textContent || '',
  ].join(' '))
}

function resolveStitchRoute(label, route) {
  const has = (value) => label.includes(normalizeLabel(value))

  if (has('dang xuat')) return '/'
  if (has('them vao gio') && ['/nong-san/chi-tiet', '/imperfect/combo-tiet-kiem', '/farm-box/dang-ky'].includes(route.path)) {
    return '/cart'
  }
  // Admin exports reuse the same section names as the storefront. Keep their
  // sidebar links inside the admin area when the current screen is an admin page.
  if (route.path.startsWith('/admin')) {
    if (has('quan ly don hang') || has('don hang')) return '/admin/orders'
    if (has('quan ly nong san') || has('nong san') || has('san pham') || has('kho hang')) return '/admin/products'
    if (has('quan ly imperfect') || has('imperfect') || has('combo')) return '/admin/imperfect'
    if (has('cau hinh farm box') || has('farm box')) return '/admin/farm-box'
    if (has('dashboard') || has('tong quan') || has('trang chu')) return '/admin'
  }
  if ((has('dia chi moi') || has('them dia chi')) && route.path.startsWith('/checkout')) return '/checkout/new-address'
  if (has('doi dia chi') && route.path.startsWith('/checkout')) return '/checkout/new-address'
  if (has('dashboard') || has('quan tri')) return '/admin'
  if (has('quan ly don hang')) return '/admin/orders'
  if (has('quan ly nong san')) return '/admin/products'
  if (has('quan ly imperfect')) return '/admin/imperfect'
  if (has('cau hinh farm box')) return '/admin/farm-box'
  if (has('cong quan tri')) return '/admin'
  if (has('farm box cua toi')) return '/farm-box/cua-toi'
  if (has('don hang cua toi') || has('lich su don hang') || has('xem don hang')) {
    return route.path.startsWith('/admin') ? '/admin/orders' : '/orders'
  }
  if (has('xem chi tiet') || has('chi tiet don hang')) {
    if (route.path.startsWith('/orders')) return '/orders/detail'
    if (route.path.startsWith('/imperfect')) return '/imperfect/combo-tiet-kiem'
    if (route.path.startsWith('/farm-box')) return '/farm-box/dang-ky'
    if (route.path.startsWith('/nong-san')) return '/nong-san/chi-tiet'
  }
  if (has('thong tin ca nhan') || has('ho so ca nhan') || has('tai khoan cua toi')
    || has('dia chi nhan hang') || has('so dia chi')) return '/account'
  if (has('farm box') && (has('dang ky') || has('xem thuc don') || has('chon hop') || has('dat hop'))) {
    return '/farm-box/dang-ky'
  }
  if (has('hop tuan') || has('thuc don va chon hop')) return '/farm-box/dang-ky'
  if (has('farm box') || has('hop nong trai')) return '/farm-box'
  if (has('imperfect') || has('rau cu ky quac') || has('combo cu qua') || has('combo imperfect')) {
    return route.path.startsWith('/imperfect') && (has('mua') || has('chi tiet'))
      ? '/imperfect/combo-tiet-kiem'
      : '/imperfect'
  }
  if (has('trang chu') || has('green nova')) return '/'
  if (has('nong san') || has('nongsan tieu chuan') || has('kham pha nong san') || has('mua nong san')) return '/nong-san'
  if (has('gio hang')) return '/cart'
  if (has('tiep tuc mua sam') || has('kham pha ngay') || has('xem nong san')) return '/nong-san'
  if (has('quen mat khau')) return '/forgot-password'
  if (has('dat lai mat khau') || has('cap nhat mat khau moi')) return '/reset-password'
  if (has('dang nhap')) return '/login'
  if (has('dang ky')) return '/register'
  if (has('chon mua') || has('mua ngay')) {
    return route.path.startsWith('/farm-box')
      ? '/farm-box/dang-ky'
      : route.path.startsWith('/imperfect') || route.path === '/'
        ? '/imperfect/combo-tiet-kiem'
        : '/nong-san/chi-tiet'
  }
  if (has('them vao gio') && route.path === '/') return '/imperfect/combo-tiet-kiem'

  if (route.path === '/cart' && has('dat hang')) return '/checkout'
  if (route.path === '/checkout/new-address' && (has('huy') || has('luu dia chi'))) return '/checkout'
  if (route.path === '/checkout' && (has('dat hang') || has('tiep tuc'))) return '/checkout/confirm'
  if (route.path === '/checkout/confirm' && (has('xac nhan') || has('dat hang'))) return '/checkout/payment'
  if (route.path === '/checkout/payment' && (has('xac nhan thanh toan') || has('hoan tat'))) return '/checkout/success'
  if (route.path === '/checkout/payment' && has('huy don')) return '/orders'
  if (route.path === '/checkout/success' && (has('thanh toan ngay') || has('xac nhan thanh toan'))) return '/checkout/payment'
  if (route.path.startsWith('/checkout') && has('xem don hang')) return '/orders'
  if (route.path.startsWith('/checkout') && has('quay lai gio hang')) return '/cart'
  if (route.path.startsWith('/orders') && has('thanh toan')) return '/checkout/payment'
  if (route.path === '/admin') return '/admin'

  return null
}

function resolveVariantRoute(label, route) {
  const has = (value) => label.includes(normalizeLabel(value))
  const folder = route.folder

  if (route.path.startsWith('/cart') || folder.includes('gi_h_ng')) {
    if (has('dang nhap de dat hang') || has('dang nhap')) return '/login'
    if (has('dang ky tai khoan')) return '/register'
    if (has('tiep tuc mua sam') || has('kham pha nong san')) return '/nong-san'
    if (has('tien hanh dat hang') || has('dat hang')) return '/checkout'
  }

  if (route.path.startsWith('/checkout') || folder.startsWith('t_h_ng') || folder.startsWith('thanh_to_n')) {
    if (has('dia chi moi') || has('them dia chi') || has('doi dia chi')) return '/checkout/new-address'
    if (has('luu dia chi') || has('huy bo') || has('quay lai')) return '/checkout'
    if (has('xac nhan thanh toan') || has('hoan tat thanh toan')) return '/checkout/success'
    if (has('xac nhan') || has('tiep tuc thanh toan') || has('dat hang ngay')) return '/checkout/payment'
    if (has('dat hang') || has('tiep tuc')) return '/checkout/confirm'
    if (has('xem don hang')) return '/orders'
    if (has('quay lai gio hang')) return '/cart'
  }

  if (route.path.startsWith('/orders') || folder.startsWith('n_h_ng') || folder.startsWith('chi_ti_t_n_h_ng')) {
    if (has('quay lai danh sach don') || has('don hang cua toi')) return '/orders'
    if (has('xem thong tin chuyen khoan') || has('thanh toan ngay')) return '/checkout/payment'
    if (has('xac nhan huy')) return stitchScreenPath('remix', 'chi_ti_t_n_h_ng_dh00123_h_p_tho_i_x_c_nh_n_h_y')
    if (has('huy don hang')) return stitchScreenPath('remix', 'chi_ti_t_n_h_ng_dh00119_ang_x_l')
    if (has('mua lai') || has('dat lai don')) return '/cart'
  }

  if (folder.startsWith('greennova_ai_assistant')) {
    if (has('tra cuu don hang') || has('don hang cua toi')) {
      return stitchScreenPath('remix', 'greennova_ai_assistant_tra_c_u_n_h_ng_ch_a_ng_nh_p')
    }
    if (has('farm box')) return stitchScreenPath('remix', 'greennova_ai_assistant_t_v_n_farm_box_gia_nh_3_ng_i')
    if (has('imperfect')) return stitchScreenPath('remix', 'greennova_ai_assistant_gi_i_p_n_ng_s_n_imperfect')
    if (has('thuc don') || has('theo mua') || has('nong san')) {
      return stitchScreenPath('remix', 'greennova_ai_assistant_g_i_n_ng_s_n_theo_m_a')
    }
  }

  return null
}

function resolveFarmBoxRoute(label, route) {
  const has = (value) => label.includes(normalizeLabel(value))
  const folder = route.folder
  const isFarmBoxScreen = route.path.startsWith('/farm-box')
    || folder.startsWith('fb0')
    || folder.includes('farm_box')
    || folder.includes('h_p_n_ng_s_n_tu_n')
  if (!isFarmBoxScreen) return null

  if (folder.startsWith('fb01_danh_s_ch_l_ch') || route.path === '/farm-box/lich-mo-ban') {
    if (has('xem thuc don') || has('dat hop') || has('chot hop')) return '/farm-box/thuc-don'
    if (has('dang ky')) return '/farm-box/chon-goi'
  }

  if (folder.startsWith('fb01') || route.path === '/farm-box') {
    if (has('xem thuc don 3 tuan') || has('xem lich thang') || has('xem lich thu hoach')) {
      return '/farm-box/lich-mo-ban'
    }
    if (has('chon tuan') || has('xem chi tiet')) return '/farm-box/thuc-don'
    if (has('tim hieu quyen loi')) return '/farm-box/gioi-thieu'
    if (has('xem thuc don') || has('chon hop')) return '/farm-box/lich-mo-ban'
    if (has('dang ky goi') || has('dang ky ngay') || has('dang ky')) return '/farm-box/chon-goi'
  }

  if (folder.startsWith('fb02') || route.path === '/farm-box/thuc-don' || route.path === '/farm-box/dang-ky') {
    if (has('them farm box vao gio') || has('them vao gio')) return '/cart'
    if (has('chon goi') || has('dang ky goi')) return '/farm-box/chon-goi'
  }

  if (folder.startsWith('h_p_n_ng_s_n_tu_n') || route.path === '/farm-box/chon-goi') {
    if (has('dang ky goi') || has('dang ky ngay') || has('chon goi cua ban')) return '/farm-box/tuy-chinh'
  }

  if (folder.startsWith('h_p_n_ng_tr_i_tu_n') || route.path === '/farm-box/tuy-chinh') {
    if (has('hoan tat dang ky') || has('hoan tat')) return '/farm-box/cua-toi'
  }

  if (folder.startsWith('fb03') || route.path === '/farm-box/cua-toi') {
    if (has('xem thuc don') || has('thuc don tuan')) return '/farm-box/thuc-don'
  }

  return null
}

function resolveCardRoute(route, card, index) {
  if (route.path === '/orders') return card?.dataset.orderId ? `/orders/detail?orderId=${encodeURIComponent(card.dataset.orderId)}` : null
  if (route.path === '/admin/orders') return '/admin/orders'
  if (!card) return null
  const cardLabel = labelOf(card)
  if (route.path === '/') {
    if (cardLabel.includes('farm box') || cardLabel.includes('hop nong trai')) return '/farm-box'
    if (cardLabel.includes('imperfect') || cardLabel.includes('ky quac')) return '/imperfect'
    return '/nong-san'
  }
  if (route.path === '/nong-san') {
    return card?.dataset.route || '/nong-san/chi-tiet'
  }
  if (route.path === '/imperfect') return card?.dataset.route || '/imperfect/combo-tiet-kiem'
  if (route.path === '/farm-box') return '/farm-box/dang-ky'
  return null
}

function wireStitchNavigation(documentFromStitch, route) {
  documentFromStitch.body.querySelectorAll('article').forEach((card, index) => {
    if (card.dataset.productId && card.dataset.route?.startsWith('/nong-san/chi-tiet?productId=')) return
    const nextPath = resolveCardRoute(route, card, index)
    if (nextPath) {
      card.dataset.route = nextPath
      card.classList.add('cursor-pointer')
    }
  })

  documentFromStitch.body.querySelectorAll('a').forEach((anchor) => {
    if (anchor.dataset.path === 'bao-cao-va-cai-dat' || anchor.dataset.path === 'bao-cao-cai-dat') {
      anchor.removeAttribute('href')
      anchor.removeAttribute('data-route')
      anchor.removeAttribute('data-path')
      anchor.setAttribute('aria-disabled', 'true')
      anchor.classList.remove('cursor-pointer')
      anchor.style.cursor = 'default'
      return
    }
    const explicitRoute = anchor.dataset.route || routeByStitchPath[anchor.dataset.path]
    const card = anchor.closest('article')
    const nextPath = explicitRoute
      || (route.path === '/imperfect' ? card?.dataset.route : null)
      || resolveFarmBoxRoute(labelOf(anchor), route)
      || resolveVariantRoute(labelOf(anchor), route)
      || resolveStitchRoute(labelOf(anchor), route)
      || resolveCardRoute(route, card, [...documentFromStitch.body.querySelectorAll('article')].indexOf(card))
    const placeholderLink = anchor.getAttribute('href') === '#'
    const fallbackPath = route.path.startsWith('/admin') ? '/admin' : '/'
    if (nextPath || placeholderLink || anchor.hasAttribute('data-path')) {
      const targetPath = nextPath || fallbackPath
      anchor.dataset.route = targetPath
      anchor.setAttribute('href', targetPath)
    }
  })

  documentFromStitch.body.querySelectorAll('button').forEach((button) => {
    if (button.type === 'submit'
      || button.hasAttribute('data-order-status-filter')
      || button.hasAttribute('data-payment-confirm')
      || button.hasAttribute('data-add-product-id')
      || button.hasAttribute('data-add-combo-id')
      || button.hasAttribute('data-add-farm-box-id')
      || button.hasAttribute('data-quantity-action')
      || button.hasAttribute('data-farmbox-quantity-action')
      || button.closest('[data-product-card="true"]')) return
    const card = button.closest('article')
    const nextPath = button.dataset.route
      || (route.path === '/imperfect' ? card?.dataset.route : null)
      || resolveFarmBoxRoute(labelOf(button), route)
      || resolveVariantRoute(labelOf(button), route)
      || resolveStitchRoute(labelOf(button), route)
      || resolveCardRoute(route, card, [...documentFromStitch.body.querySelectorAll('article')].indexOf(card))
    if (nextPath && nextPath !== route.path) button.dataset.route = nextPath
  })

  documentFromStitch.body.querySelectorAll('.cursor-pointer, [role="button"]').forEach((control) => {
    if (['A', 'BUTTON'].includes(control.tagName)
      || ['SELECT', 'INPUT', 'TEXTAREA', 'OPTION'].includes(control.tagName)
      || control.hasAttribute('data-admin-product-filter')
      || control.hasAttribute('data-admin-product-search')
      || control.hasAttribute('data-add-product-id')
      || control.hasAttribute('data-add-combo-id')
      || control.hasAttribute('data-add-farm-box-id')
      || control.dataset.productId
      || control.closest('[data-product-card="true"]')) return
    const label = labelOf(control)
    const iconNames = [...control.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded, .material-icons')]
      .map((icon) => normalizeLabel(icon.textContent))
    const existingRoute = control.dataset.route
    const articleRoute = control.closest('article')?.dataset.route
    const nextPath = iconNames.some((name) => ['shopping bag', 'shopping cart', 'shopping basket'].includes(name))
      ? '/cart'
      : existingRoute
        || (route.path === '/imperfect' ? articleRoute : null)
        || resolveFarmBoxRoute(label, route)
        || resolveVariantRoute(label, route)
        || resolveStitchRoute(label, route)
    if (nextPath && nextPath !== route.path) {
      control.dataset.route = nextPath
      control.setAttribute('role', 'link')
      control.setAttribute('tabindex', '0')
    }
  })
}

function navigateTo(path) {
  const requestedPath = new URL(path, window.location.href)
  if (requestedPath.pathname === legacyAdminOrdersStitchPath) {
    path = `/admin/orders${requestedPath.search}${requestedPath.hash}`
  } else if (requestedPath.pathname === '/farm-box/cua-toi') {
    path = `/account/change-password${requestedPath.search}${requestedPath.hash}`
  }
  const destination = new URL(path, window.location.href)
  if (destination.pathname === window.location.pathname && destination.search === window.location.search) return
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (window.location.pathname === '/admin/farm-box-issues') {
      window.history.replaceState({}, '', `/admin/farm-box${window.location.search}${window.location.hash}`)
      return '/admin/farm-box'
    }
    if (window.location.pathname === legacyAdminOrdersStitchPath) {
      window.history.replaceState({}, '', `/admin/orders${window.location.search}${window.location.hash}`)
      return '/admin/orders'
    }
    if (window.location.pathname === '/farm-box/cua-toi') {
      window.history.replaceState({}, '', `/account/change-password${window.location.search}${window.location.hash}`)
      return '/account/change-password'
    }
    return window.location.pathname
  })
  const [currentSearch, setCurrentSearch] = useState(window.location.search)
  const [selectedProductId, setSelectedProductId] = useState(() => new URLSearchParams(window.location.search).get('productId') || '')
  const [products, setProducts] = useState([])
  const [availableCombos, setAvailableCombos] = useState([])
  const [farmBoxes, setFarmBoxes] = useState([])
  const [customerEmergencyFarmBoxes, setCustomerEmergencyFarmBoxes] = useState([])
  const [farmBoxWeekClock, setFarmBoxWeekClock] = useState(0)
  const [harvestDateClock, setHarvestDateClock] = useState(0)
  const [authUser, setAuthUser] = useState(readStoredAuth)
  const [profileCompletionPrompt, setProfileCompletionPrompt] = useState(null)
  const [cartItems, setCartItems] = useState(readStoredCart)
  const [serverCartItems, setServerCartItems] = useState(null)
  const [customerOrders, setCustomerOrders] = useState(null)
  const [customerOrdersError, setCustomerOrdersError] = useState('')
  const [paymentOrder, setPaymentOrder] = useState(null)
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState(null)
  const [activePaymentMethod, setActivePaymentMethod] = useState('')
  const [orderFilter, setOrderFilter] = useState('Tất cả')
  const [weeklyData, setWeeklyData] = useState(null)
  const [adminWeeklyOrderError, setAdminWeeklyOrderError] = useState('')
  const [adminWeekOrders, setAdminWeekOrders] = useState(null)
  const [adminFarmBoxIssueOrders, setAdminFarmBoxIssueOrders] = useState([])
  const [adminEmergencyFarmBoxes, setAdminEmergencyFarmBoxes] = useState([])
  const [adminEmergencyFarmBoxTab, setAdminEmergencyFarmBoxTab] = useState('small')
  const [adminWeekOrdersError, setAdminWeekOrdersError] = useState('')
  const [adminWeekOrdersPage, setAdminWeekOrdersPage] = useState(1)
  const [adminWeekOrderFilter, setAdminWeekOrderFilter] = useState('all')
  const [adminRefunds, setAdminRefunds] = useState(null)
  const [adminRefundError, setAdminRefundError] = useState('')
  const [adminProfileActivity, setAdminProfileActivity] = useState(null)
  const [dailyDashboardData, setDailyDashboardData] = useState(null)
  const [adminLatestOrders, setAdminLatestOrders] = useState(null)
  const [adminProductSummary, setAdminProductSummary] = useState(null)
  const [adminInventory, setAdminInventory] = useState([])
  const [adminProductPage, setAdminProductPage] = useState(1)
  const [adminProductSearch, setAdminProductSearch] = useState('')
  const [adminProductCategory, setAdminProductCategory] = useState('')
  const [adminProductFarm, setAdminProductFarm] = useState('')
  const [adminProductStockStatus, setAdminProductStockStatus] = useState('')
  const [adminImperfectCombos, setAdminImperfectCombos] = useState([])
  const [adminImperfectIngredients, setAdminImperfectIngredients] = useState([])
  const [weeklyMetric, setWeeklyMetric] = useState('revenue')
  const [productPage, setProductPage] = useState(() => Math.max(1, Number(new URLSearchParams(window.location.search).get('page')) || 1))
  const [productSearch, setProductSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')
  const [productFarmFilters, setProductFarmFilters] = useState([])
  const [productSeasonOnly, setProductSeasonOnly] = useState(false)
  const [productSort, setProductSort] = useState('default')
  const catalogFilters = {
    category: productCategoryFilter,
    farms: productFarmFilters,
    seasonal: productSeasonOnly,
    sort: productSort,
  }

  const route = routes.find((item) => item.path === currentPath) || routes[0]
  const screen = useMemo(
    () => parseScreen(findScreen(route), route, products, authUser, weeklyData, weeklyMetric, cartItems, productPage, productSearch, catalogFilters, selectedProductId, availableCombos, farmBoxes, currentSearch, serverCartItems, customerOrders, orderFilter, customerOrdersError, paymentOrder, activePaymentMethod, adminWeeklyOrderError, adminWeekOrders, adminWeekOrdersError, adminWeekOrdersPage, adminWeekOrderFilter, customerEmergencyFarmBoxes, adminRefunds, adminRefundError, adminProfileActivity),
    [route, products, availableCombos, farmBoxes, farmBoxWeekClock, harvestDateClock, currentSearch, authUser, weeklyData, weeklyMetric, adminWeeklyOrderError, adminWeekOrders, adminWeekOrdersError, adminWeekOrdersPage, adminWeekOrderFilter, cartItems, serverCartItems, customerOrders, orderFilter, customerOrdersError, paymentOrder, activePaymentMethod, productPage, productSearch, productCategoryFilter, productFarmFilters, productSeasonOnly, productSort, selectedProductId, customerEmergencyFarmBoxes, adminRefunds, adminRefundError, adminProfileActivity],
  )

  useEffect(() => {
    if (route.path !== '/farm-box/thay-doi') return undefined
    const controller = new AbortController()
    fetch('/api/farm-box-emergency-options', { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không tải được Farm Box dự phòng.')
        setCustomerEmergencyFarmBoxes(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch((error) => { if (error.name !== 'AbortError') console.warn('Không tải được phương án Farm Box dự phòng:', error.message) })
    return () => controller.abort()
  }, [route.path])

  useEffect(() => {
    if (route.path !== '/admin/refunds') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) {
      setAdminRefundError('Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.')
      setAdminRefunds([])
      return undefined
    }
    const controller = new AbortController()
    const loadRefunds = async () => {
      setAdminRefundError('')
      try {
        const response = await fetch('/api/admin/refunds', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không tải được danh sách hoàn tiền.')
        setAdminRefunds(Array.isArray(payload.data) ? payload.data : [])
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAdminRefundError(error.message || 'Không tải được danh sách hoàn tiền.')
          setAdminRefunds([])
        }
      }
    }
    loadRefunds()
    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/refunds') return undefined
    const main = document.querySelector('#stitch-screen-root main')
    if (!main) return undefined
    const rows = () => [...main.querySelectorAll('[data-refund-row]')]
    const applyFilters = () => {
      const query = normalizeLabel(main.querySelector('[data-refund-search]')?.value || '')
      const status = main.querySelector('[data-refund-status]')?.value || 'all'
      const reason = main.querySelector('[data-refund-reason]')?.value || 'all'
      let visible = 0
      rows().forEach((row) => {
        const matches = (!query || normalizeLabel(row.dataset.search || '').includes(query))
          && (status === 'all' || row.dataset.status === status)
          && (reason === 'all' || normalizeLabel(row.dataset.search || '').includes(normalizeLabel(reason)))
        row.classList.toggle('hidden', !matches)
        if (matches) visible += 1
      })
      const count = main.querySelector('[data-refund-count]')
      if (count) count.textContent = `Hiển thị ${visible} yêu cầu`
    }
    const loadRefunds = async () => {
      const token = sessionStorage.getItem('greennovaToken')
      if (!token) return showCartToast('Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.')
      try {
        const response = await fetch('/api/admin/refunds', { headers: { Authorization: `Bearer ${token}` } })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không tải được dữ liệu hoàn tiền.')
        setAdminRefunds(Array.isArray(payload.data) ? payload.data : [])
      } catch (error) { showCartToast(error.message || 'Không tải được dữ liệu hoàn tiền.') }
    }
    let activeRefundId = ''
    const modal = main.querySelector('[data-refund-modal]')
    const openModal = (item) => {
      if (!modal) return
      activeRefundId = item.id
      const details = modal.querySelector('[data-refund-modal-details]')
      const accountNumber = String(item.bankAccountNumber || '').replace(/\s/g, '')
      const bank = String(item.bankName || '')
      const normalizedBank = normalizeLabel(bank)
      const bankCodeMap = [
        [/vietcombank|\bvcb\b/, 'VCB'], [/mb bank|\bmb\b/, 'MB'], [/bidv/, 'BIDV'],
        [/techcombank|\btcb\b/, 'TCB'], [/vpbank|\bvpbank\b/, 'VPB'], [/\bacb\b/, 'ACB'],
        [/\bvib\b/, 'VIB'], [/tpbank|\btpb\b/, 'TPB'], [/sacombank/, 'STB'], [/\bshb\b/, 'SHB'],
        [/hdbank/, 'HDB'], [/\bmsb\b/, 'MSB'], [/eximbank/, 'EIB'], [/\bocb\b/, 'OCB'],
      ]
      const bankCode = bankCodeMap.find(([pattern]) => pattern.test(normalizedBank))?.[1] || ''
      const transferContent = `HOAN TIEN ${String(item.orderCode || '').replace(/[^a-z\d]/gi, '')}`.slice(0, 25)
      const qrUrl = bankCode && accountNumber
        ? `https://img.vietqr.io/image/${encodeURIComponent(bankCode)}-${encodeURIComponent(accountNumber)}-compact2.png?${new URLSearchParams({ amount: String(Math.round(Number(item.amount) || 0)), addInfo: transferContent, accountName: item.bankAccountHolder || '' })}`
        : ''
      const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
      details.innerHTML = `<div class="rounded-2xl bg-[#edf7ec] p-4 text-center"><div class="mb-3 flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#176b36]">VietQR <span class="text-[10px] text-[#758276]">NAPAS 24/7 · ${esc(bankCode || 'QR')}</span></div>${qrUrl ? `<img src="${esc(qrUrl)}" alt="Mã QR chuyển khoản hoàn tiền" class="mx-auto aspect-square w-full max-w-[190px] rounded-xl bg-white object-contain p-2"/>` : '<div class="flex aspect-square items-center justify-center rounded-xl bg-white p-5 text-sm text-[#738276]">Chưa tạo được QR. Vui lòng kiểm tra tên ngân hàng và số tài khoản của khách.</div>'}<p class="mt-3 text-xs text-[#58695b]">Quét mã bằng ứng dụng ngân hàng để chuyển đúng số tiền và nội dung.</p></div><div class="space-y-3 rounded-2xl bg-[#edf7ec] p-4 text-xs text-[#405144]"><div class="flex justify-between gap-4 border-b border-[#d9e8d8] pb-3"><span>Ngân hàng thụ hưởng:</span><strong class="text-right">${esc(bank || 'Chưa có thông tin')}</strong></div><div class="flex justify-between gap-4 border-b border-[#d9e8d8] pb-3"><span>Số tài khoản thụ hưởng:</span><strong class="flex items-center gap-1 text-right">${esc(item.bankAccountNumber || 'Chưa cập nhật')} <button type="button" data-refund-copy="${esc(item.bankAccountNumber || '')}" class="text-[#08733a]" title="Sao chép">▣</button></strong></div><div class="flex justify-between gap-4 border-b border-[#d9e8d8] pb-3"><span>Tên chủ tài khoản:</span><strong class="text-right">${esc(item.bankAccountHolder || 'Chưa cập nhật')}</strong></div><div class="flex justify-between gap-4 rounded-lg bg-white p-3"><strong>Số tiền hoàn chính xác:</strong><strong class="text-base text-[#08733a]">${esc((Number(item.amount) || 0).toLocaleString('vi-VN'))}đ</strong></div><div class="flex items-center justify-between gap-3"><span>Nội dung chuyển khoản:</span><strong class="rounded bg-white px-2 py-1 text-[#08733a]">${esc(transferContent)}</strong></div><label class="block pt-1 font-semibold">Tải lên ảnh chụp biên lai chuyển tiền (Bill VietQR) <span class="text-red-600">*</span><input data-refund-receipt type="file" accept="image/jpeg,image/png,image/webp" class="mt-2 block w-full rounded-lg border border-[#d5e3d3] bg-white p-2 text-xs"/><span data-refund-receipt-preview class="mt-2 block text-xs font-normal text-[#758276]">Chưa chọn biên lai.</span></label></div>`
      modal.querySelector('[data-refund-modal-code]').textContent = item.orderCode || ''
      modal.querySelector('[data-refund-modal-reference]').textContent = `RF${String(item.orderCode || item.id).replace(/[^a-z\d]/gi, '')}`
      const submit = modal.querySelector('[data-refund-submit]')
      submit.disabled = true
      modal.classList.remove('hidden')
      modal.classList.add('flex')
    }
    const closeModal = () => {
      if (!modal) return
      modal.classList.add('hidden')
      modal.classList.remove('flex')
      activeRefundId = ''
    }
    const handleClick = async (event) => {
      if (event.target.closest('[data-refund-refresh]')) {
        event.preventDefault()
        await loadRefunds()
        return
      }
      if (event.target.closest('[data-refund-close]')) { closeModal(); return }
      const copyButton = event.target.closest('[data-refund-copy]')
      if (copyButton) {
        try { await navigator.clipboard.writeText(copyButton.dataset.refundCopy || ''); showCartToast('Đã sao chép số tài khoản.') }
        catch { showCartToast('Không thể sao chép tự động.') }
        return
      }
      const button = event.target.closest('[data-refund-process]')
      if (!button) return
      const item = (adminRefunds || []).find((entry) => entry.id === button.dataset.refundProcess)
      if (item) openModal(item)
    }
    const handleChange = async (event) => {
      const input = event.target.closest('[data-refund-receipt]')
      if (!input || !modal) return
      const file = input.files?.[0]
      const preview = modal.querySelector('[data-refund-receipt-preview]')
      const submit = modal.querySelector('[data-refund-submit]')
      if (!file) { preview.textContent = 'Chưa chọn biên lai.'; submit.disabled = true; return }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showCartToast('Vui lòng chọn ảnh JPG, PNG hoặc WebP.'); input.value = ''; return }
      try {
        let dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        if (file.size > 700_000) {
          const image = new Image()
          image.src = dataUrl
          await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject })
          const scale = Math.min(1, 1400 / image.width, 1400 / image.height)
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale)
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
          dataUrl = canvas.toDataURL('image/jpeg', 0.78)
        }
        if (String(dataUrl).length > 1_350_000) throw new Error('Ảnh biên lai vẫn quá lớn sau khi nén. Vui lòng chọn ảnh nhỏ hơn.')
        input.dataset.receiptData = dataUrl
        preview.innerHTML = `<span class="text-[#176b36]">Đã chọn: ${String(file.name).replace(/[&<>"']/g, '')}</span><img src="${dataUrl}" alt="Xem trước biên lai" class="mt-2 max-h-28 rounded-lg border border-[#d5e3d3] object-contain"/>`
        submit.disabled = false
      } catch (error) { input.dataset.receiptData = ''; submit.disabled = true; showCartToast(error.message || 'Không đọc được ảnh biên lai.') }
    }
    const handleSubmit = async (event) => {
      const button = event.target.closest('[data-refund-submit]')
      if (!button || !activeRefundId) return
      const input = modal?.querySelector('[data-refund-receipt]')
      const receiptDataUrl = input?.dataset.receiptData || ''
      if (!receiptDataUrl) return showCartToast('Vui lòng tải ảnh biên lai sau khi đã chuyển khoản.')
      const token = sessionStorage.getItem('greennovaToken')
      if (!token) return showCartToast('Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.')
      button.disabled = true
      try {
        const response = await fetch(`/api/admin/refunds/${encodeURIComponent(activeRefundId)}/complete`, {
          method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiptName: input.files?.[0]?.name || 'bien-lai-hoan-tien.jpg', receiptDataUrl }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể cập nhật trạng thái hoàn tiền.')
        setAdminRefunds((current) => (current || []).map((item) => item.id === payload.data.id ? { ...item, status: payload.data.refundStatus, receiptName: payload.data.receiptName } : item))
        closeModal()
        showCartToast(payload.message || 'Đã xác nhận hoàn tiền.')
      } catch (error) {
        showCartToast(error.message || 'Không thể cập nhật trạng thái hoàn tiền.')
        button.disabled = false
      }
    }
    const handleExport = (event) => {
      if (!event.target.closest('[data-refund-export]')) return
      const items = adminRefunds || []
      const rowsData = [
        ['Mã đơn', 'Ngày tạo', 'Khách hàng', 'Số điện thoại', 'Mặt hàng', 'Số tiền hoàn', 'Tài khoản nhận', 'Lý do', 'Trạng thái'],
        ...items.map((item) => [item.orderCode, item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '', item.customerName, item.phone, item.itemSummary, item.amount, item.bankLabel, item.reason, item.status]),
      ]
      const blob = createXlsx(rowsData)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `GreenNova_Doi_soat_hoan_tien_${getLocalDateString(new Date())}.xlsx`
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    }
    main.addEventListener('input', applyFilters)
    main.addEventListener('change', applyFilters)
    main.addEventListener('change', handleChange)
    main.addEventListener('click', handleClick)
    main.addEventListener('click', handleExport)
    main.addEventListener('click', handleSubmit)
    applyFilters()
    return () => {
      main.removeEventListener('input', applyFilters)
      main.removeEventListener('change', applyFilters)
      main.removeEventListener('change', handleChange)
      main.removeEventListener('click', handleClick)
      main.removeEventListener('click', handleExport)
      main.removeEventListener('click', handleSubmit)
    }
  }, [route.path, adminRefunds])

  useEffect(() => {
    if (route.path !== '/admin/profile') {
      setAdminProfileActivity(null)
      return undefined
    }
    const controller = new AbortController()
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) { setAdminProfileActivity([]); return () => controller.abort() }
    fetch('/api/admin/orders', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không tải được nhật ký hoạt động.')
        const activity = (payload.data || []).flatMap((order) => (order.statusHistory || []).map((entry) => ({
          time: entry.changedAt,
          action: `${entry.oldStatus || 'Tạo đơn'} → ${entry.newStatus || order.status}`,
          reference: order.orderCode || order.id,
          status: 'Đã lưu',
        }))).sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 30)
        if (!controller.signal.aborted) setAdminProfileActivity(activity)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Không tải được nhật ký đơn hàng:', error.message)
          setAdminProfileActivity([])
        }
      })
    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/profile') return undefined
    const root = document.querySelector('#stitch-screen-root main')
    const profileForm = root?.querySelector('[data-admin-profile-form]')
    const passwordForm = root?.querySelector('[data-admin-password-form]')
    if (!profileForm || !passwordForm) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    const showMessage = (node, message, success) => {
      node.textContent = message
      node.className = `rounded-lg px-3 py-2 text-xs ${success ? 'bg-[#e5f4e3] text-[#176b36]' : 'bg-[#fff0ed] text-[#b3342b]'}`
    }
    const handleProfileSave = async (event) => {
      event.preventDefault()
      const message = profileForm.querySelector('[data-admin-profile-message]')
      const button = profileForm.querySelector('button[type="submit"]')
      button.disabled = true
      try {
        const formData = new FormData(profileForm)
        const response = await fetch('/api/auth/me', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fullName: formData.get('fullName'), email: formData.get('email'), phone: formData.get('phone') }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể lưu hồ sơ.')
        sessionStorage.setItem('greennovaUser', JSON.stringify(payload.user))
        setAuthUser(payload.user)
        showMessage(message, 'Đã lưu thông tin hồ sơ vào MongoDB.', true)
      } catch (error) { showMessage(message, error.message || 'Không thể lưu hồ sơ.', false) }
      finally { button.disabled = false }
    }
    const handlePasswordSave = async (event) => {
      event.preventDefault()
      const message = passwordForm.querySelector('[data-admin-password-message]')
      const button = passwordForm.querySelector('button[type="submit"]')
      const formData = new FormData(passwordForm)
      if (formData.get('newPassword') !== formData.get('confirmPassword')) {
        showMessage(message, 'Mật khẩu xác nhận chưa khớp.', false)
        return
      }
      button.disabled = true
      try {
        const response = await fetch('/api/auth/me/password', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ currentPassword: formData.get('currentPassword'), newPassword: formData.get('newPassword') }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể cập nhật mật khẩu.')
        passwordForm.reset()
        showMessage(message, payload.message || 'Mật khẩu đã được cập nhật.', true)
      } catch (error) { showMessage(message, error.message || 'Không thể cập nhật mật khẩu.', false) }
      finally { button.disabled = false }
    }
    profileForm.addEventListener('submit', handleProfileSave)
    passwordForm.addEventListener('submit', handlePasswordSave)
    return () => {
      profileForm.removeEventListener('submit', handleProfileSave)
      passwordForm.removeEventListener('submit', handlePasswordSave)
    }
  }, [route.path, screen.bodyHtml])

  useEffect(() => {
    let timer
    const scheduleMidnightRefresh = () => {
      timer = window.setTimeout(() => {
        setHarvestDateClock(Date.now())
        scheduleMidnightRefresh()
      }, millisecondsUntilSaigonMidnight())
    }
    scheduleMidnightRefresh()
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const launcher = document.querySelector('#greennova-assistant-launcher')
    const panel = document.querySelector('#greennova-assistant-panel')
    const form = document.querySelector('#greennova-assistant-form')
    const input = document.querySelector('#greennova-assistant-input')
    const messages = document.querySelector('#greennova-assistant-messages')
    const prompts = document.querySelector('#greennova-assistant-prompts')
    if (!launcher || !panel || !form || !input || !messages || !prompts) return undefined

    const loadSuggestedQuestions = async () => {
      try {
        const response = await fetch('/api/assistant/questions')
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể tải câu hỏi gợi ý.')
        prompts.replaceChildren(...(payload.data?.questions || []).map((question) => {
          const button = document.createElement('button')
          button.type = 'button'
          button.dataset.assistantPrompt = question
          button.className = 'rounded-full border border-[#cfe1d0] bg-white px-3 py-1.5 text-xs text-[#176b36] hover:bg-[#eaf5e9]'
          button.textContent = question
          return button
        }))
      } catch (error) {
        console.warn('Không thể tải câu hỏi gợi ý từ MongoDB:', error.message)
      }
    }
    loadSuggestedQuestions()

    const appendMessage = (text, fromAssistant = false) => {
      const bubble = document.createElement('div')
      bubble.className = fromAssistant
        ? 'max-w-[90%] self-start rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 text-sm leading-6 text-[#334238] shadow-sm whitespace-pre-line'
        : 'max-w-[90%] self-end rounded-2xl rounded-tr-sm bg-[#176b36] px-3.5 py-3 text-sm leading-6 text-white whitespace-pre-line'
      bubble.textContent = text
      messages.append(bubble)
      messages.scrollTop = messages.scrollHeight
      return bubble
    }
    const sendMessage = async (rawMessage) => {
      const message = String(rawMessage || '').trim()
      if (!message) return
      appendMessage(message)
      input.value = ''
      input.disabled = true
      const typing = appendMessage('Đang tìm câu trả lời…', true)
      try {
        const response = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Trợ lý chưa thể xử lý câu hỏi lúc này.')
        typing.textContent = payload.data?.answer || 'Mình chưa tìm được câu trả lời phù hợp. Bạn thử hỏi cụ thể hơn nhé.'
      } catch (error) {
        typing.textContent = error.message || 'Không thể kết nối trợ lý. Bạn thử lại sau nhé.'
      } finally {
        input.disabled = false
        input.focus()
        messages.scrollTop = messages.scrollHeight
      }
    }
    const togglePanel = (open) => {
      panel.classList.toggle('hidden', !open)
      panel.classList.toggle('flex', open)
      panel.setAttribute('aria-hidden', String(!open))
      launcher.setAttribute('aria-expanded', String(open))
      if (open) input.focus()
    }
    const handleLauncher = () => togglePanel(panel.classList.contains('hidden'))
    const handleClose = () => togglePanel(false)
    const handleSubmit = (event) => {
      event.preventDefault()
      sendMessage(input.value)
    }
    const handlePrompt = (event) => {
      const prompt = event.target.closest?.('[data-assistant-prompt]')
      if (!prompt) return
      sendMessage(prompt.dataset.assistantPrompt)
    }
    launcher.addEventListener('click', handleLauncher)
    panel.querySelector('[data-assistant-close]')?.addEventListener('click', handleClose)
    form.addEventListener('submit', handleSubmit)
    messages.addEventListener('click', handlePrompt)
    return () => {
      launcher.removeEventListener('click', handleLauncher)
      panel.querySelector('[data-assistant-close]')?.removeEventListener('click', handleClose)
      form.removeEventListener('submit', handleSubmit)
      messages.removeEventListener('click', handlePrompt)
    }
  }, [route.path, screen.bodyHtml])

  useEffect(() => {
    if (route.path !== '/checkout') return undefined
    const savedAddressOptions = [...document.querySelectorAll('[data-saved-address-option="true"]')]
    const addAddressButton = document.querySelector('[data-toggle-new-address="true"]')
    const newAddressForm = document.querySelector('#checkoutNewAddressForm')
    const saveNewAddressButton = document.querySelector('[data-save-new-address="true"]')
    if (!savedAddressOptions.length && !addAddressButton && !saveNewAddressButton) return undefined

    const token = sessionStorage.getItem('greennovaToken')
    const patchUser = async (path, body = {}) => {
      if (!token) throw new Error('Vui lòng đăng nhập lại để quản lý địa chỉ.')
      const response = await fetch(path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || `Không thể cập nhật địa chỉ (HTTP ${response.status}).`)
      sessionStorage.setItem('greennovaUser', JSON.stringify(payload.user))
      setAuthUser(payload.user)
      return payload.user
    }
    const postUser = async (path, body) => {
      if (!token) throw new Error('Vui lòng đăng nhập lại để thêm địa chỉ.')
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || `Không thể thêm địa chỉ (HTTP ${response.status}).`)
      sessionStorage.setItem('greennovaUser', JSON.stringify(payload.user))
      setAuthUser(payload.user)
      return payload.user
    }

    const changeAddress = async (event) => {
      const selectedId = event.currentTarget.value
      const selectedAddress = (authUser.addresses || []).find((address) => address.id === selectedId)
      if (!selectedId || !selectedAddress) return
      window.sessionStorage.setItem('greennovaCheckoutAddressId', selectedId)
      const addressInput = document.querySelector('#checkoutAddress')
      const provinceInput = document.querySelector('#checkoutProvince')
      if (addressInput) addressInput.value = selectedAddress.address || ''
      if (provinceInput) provinceInput.value = selectedAddress.province || authUser.province || ''
      const currentAddressLabel = document.querySelector('[data-current-address-label]')
      if (currentAddressLabel) currentAddressLabel.textContent = selectedAddress.label || 'Địa chỉ giao hàng'
    }

    const toggleAddAddress = (event) => {
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      if (newAddressForm) {
        newAddressForm.hidden = !newAddressForm.hidden
        newAddressForm.style.display = newAddressForm.hidden ? 'none' : 'flex'
      }
    }

    const addAddress = async (event) => {
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      const label = document.querySelector('#newCheckoutAddressLabel')?.value.trim() || 'Địa chỉ khác'
      const address = document.querySelector('#newCheckoutAddress')?.value.trim() || ''
      const province = document.querySelector('#newCheckoutProvince')?.value.trim() || ''
      if (!address || !province) {
        showCartToast('Vui lòng nhập địa chỉ và tỉnh/thành phố mới.')
        return
      }
      saveNewAddressButton.disabled = true
      try {
      const updatedUser = await postUser('/api/auth/me/addresses', { label, address, province, makeDefault: false })
      const addedAddress = [...(updatedUser.addresses || [])].reverse().find((item) => item.address === address && item.province === province)
      if (addedAddress?.id) window.sessionStorage.setItem('greennovaCheckoutAddressId', addedAddress.id)
      showCartToast('Đã lưu và chọn địa chỉ cho đơn hàng')
      } catch (error) {
        console.error('Lỗi thêm địa chỉ mới:', error)
        showCartToast(error.message || 'Không thể thêm địa chỉ mới.')
      } finally {
        saveNewAddressButton.disabled = false
      }
    }

    savedAddressOptions.forEach((option) => option.addEventListener('change', changeAddress))
    addAddressButton?.addEventListener('click', toggleAddAddress)
    saveNewAddressButton?.addEventListener('click', addAddress)
    return () => {
      savedAddressOptions.forEach((option) => option.removeEventListener('change', changeAddress))
      addAddressButton?.removeEventListener('click', toggleAddAddress)
      saveNewAddressButton?.removeEventListener('click', addAddress)
    }
  }, [route.path, screen.bodyHtml, authUser])

  useEffect(() => {
    const controller = new AbortController()
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?line=Standard', { signal: controller.signal })
        if (!response.ok) throw new Error('API sản phẩm chưa sẵn sàng')
        const payload = await response.json()
        setProducts(Array.isArray(payload.data) ? payload.data : [])
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Chưa tải được sản phẩm từ GreenNova API:', error.message)
      }
    }
    loadProducts()
    const customerCatalogIsVisible = ['/', '/nong-san', '/nong-san/chi-tiet'].includes(route.path)
    const timer = customerCatalogIsVisible ? window.setInterval(loadProducts, 30_000) : null
    return () => {
      controller.abort()
      if (timer) window.clearInterval(timer)
    }
  }, [route.path])

  useEffect(() => {
    if (!['/orders', '/orders/detail'].includes(route.path) && !route.path.startsWith('/farm-box/')) return undefined
    if (!authUser) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) {
      setCustomerOrdersError('Vui lòng đăng nhập để xem đơn hàng.')
      setCustomerOrders([])
      return undefined
    }
    const controller = new AbortController()
    setCustomerOrders(null)
    setCustomerOrdersError('')
    fetch('/api/orders', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể tải danh sách đơn hàng.')
        setCustomerOrders(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('Lỗi tải đơn hàng của tài khoản:', error)
        setCustomerOrdersError(error.message || 'Không thể tải danh sách đơn hàng.')
        setCustomerOrders([])
      })
    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/orders') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const selectOrderFilter = (event) => {
      const button = event.target.closest?.('[data-order-status-filter]')
      if (button) setOrderFilter(button.dataset.orderStatusFilter || 'Tất cả')
    }
    const toggleOrderDetails = (event) => {
      const button = event.target.closest?.('[data-order-toggle]')
      if (!button) return
      const details = root.querySelector(`[data-order-details="${button.dataset.orderToggle}"]`)
      if (!details) return
      const expanded = button.getAttribute('aria-expanded') === 'true'
      button.setAttribute('aria-expanded', String(!expanded))
      details.classList.toggle('hidden', expanded)
      const label = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)
      if (label) label.textContent = expanded ? 'Chi tiết đơn' : 'Thu gọn'
      const icon = button.querySelector('.material-symbols-outlined')
      if (icon) icon.textContent = expanded ? 'receipt_long' : 'expand_less'
    }
    root.addEventListener('click', selectOrderFilter)
    root.addEventListener('click', toggleOrderDetails)
    return () => {
      root.removeEventListener('click', selectOrderFilter)
      root.removeEventListener('click', toggleOrderDetails)
    }
  }, [route.path, screen.bodyHtml])

  useEffect(() => {
    if (route.path !== '/farm-box/thay-doi' && !route.path.startsWith('/farm-box/')) return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const confirmFarmBoxChange = async (event) => {
      const confirmAllButton = event.target.closest?.('[data-farmbox-change-confirm-all]')
      if (confirmAllButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const cards = [...root.querySelectorAll('[data-farmbox-change-card]')]
        if (!cards.length) {
          const selectedPolicy = root.querySelector('[data-farmbox-policy-choice]:checked')?.value === 'cancel' ? 'cancel' : 'replace'
          const query = new URLSearchParams(window.location.search)
          const sizeLabel = normalizeLabel(query.get('size') || '')
          const size = sizeLabel.includes('vua') ? 'medium' : sizeLabel.includes('lon') ? 'large' : sizeLabel.includes('nho') ? 'small' : ''
          if (!size || !root.querySelector(`[data-emergency-option-card="${size}"]`)) {
            showCartToast('Chưa có phương án Farm Box dự phòng được cấu hình cho cỡ này.')
            return
          }
          const weekId = query.get('weekId') || ''
          const preferenceKey = `size:${size}:week:${weekId || '*'}`
          const preferences = readFarmBoxIssueChoices()
          preferences[preferenceKey] = selectedPolicy
          preferences[`size:${size}:default`] = selectedPolicy
          const selectedFarmBoxId = query.get('farmBoxId') || ''
          if (selectedFarmBoxId) {
            preferences[`farmBox:${selectedFarmBoxId}:week:${weekId || '*'}`] = selectedPolicy
            preferences[`farmBox:${selectedFarmBoxId}:default`] = selectedPolicy
          }
          localStorage.setItem('greennovaFarmBoxIssueChoices', JSON.stringify(preferences))
          const farmBoxId = selectedFarmBoxId
          let cartPolicySynced = false
          const token = sessionStorage.getItem('greennovaToken')
          if (farmBoxId && weekId && token) {
            try {
              const cartResponse = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
              const cartPayload = await cartResponse.json()
              if (!cartResponse.ok) throw new Error(cartPayload.error || 'Không đồng bộ được lựa chọn vào giỏ hàng.')
              const cartItem = (cartPayload.data?.items || []).find((item) => item.itemType === 'FarmBox' && item.id === farmBoxId && item.weekId === weekId)
              if (cartItem) {
                const updateResponse = await fetch(`/api/cart/items/FarmBox/${encodeURIComponent(farmBoxId)}?weekId=${encodeURIComponent(weekId)}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ weekId, quantity: cartItem.quantity, cropFailurePolicy: selectedPolicy }),
                })
                const updatePayload = await updateResponse.json()
                if (!updateResponse.ok) throw new Error(updatePayload.error || 'Không đồng bộ được lựa chọn vào giỏ hàng.')
                cartPolicySynced = true
              }
            } catch (error) {
              showCartToast(error.message || 'Đã lưu lựa chọn nhưng chưa đồng bộ vào giỏ hàng.')
            }
          }
          if (!token || !farmBoxId || !weekId || !cartPolicySynced) {
            showCartToast(selectedPolicy === 'cancel' ? 'Đã lưu lựa chọn hoàn tiền cho Farm Box.' : 'Đã lưu lựa chọn nhận Farm Box thay thế.')
          } else showCartToast('Đã lưu phương án vào giỏ hàng của bạn.')
          if (farmBoxId) {
            const returnQuery = new URLSearchParams()
            returnQuery.set('farmBoxId', farmBoxId)
            if (weekId) returnQuery.set('weekId', weekId)
            if (query.get('size')) returnQuery.set('size', query.get('size'))
            if (query.get('weekStart')) returnQuery.set('weekStart', query.get('weekStart'))
            navigateTo(`/farm-box/thuc-don?${returnQuery.toString()}`)
          }
          return
        }
        const choices = cards.map((card) => ({
          card,
          orderId: card.dataset.orderId,
          itemIndex: Number(card.dataset.itemIndex),
          selected: card.querySelector('input[type="radio"]:checked'),
        }))
        if (choices.some(({ orderId, itemIndex, selected }) => !orderId || !Number.isInteger(itemIndex) || !['accept', 'cancel'].includes(selected?.value))) {
          return showCartToast('Vui lòng chọn phương án cho từng Farm Box cần xử lý.')
        }
        if (choices.some(({ selected }) => selected.value === 'cancel')
          && !window.confirm('Bạn xác nhận các lựa chọn hủy Farm Box và yêu cầu hoàn tiền 100%?')) return
        const token = sessionStorage.getItem('greennovaToken')
        if (!token) return showCartToast('Vui lòng đăng nhập lại để xác nhận thay đổi.')
        confirmAllButton.disabled = true
        const updatedOrders = new Map()
        try {
          for (const { orderId, itemIndex, selected } of choices) {
            const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/farm-box-issue`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ itemIndex, decision: selected.value, replacementIndex: Number(selected.dataset.replacementIndex) || 0 }),
            })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || 'Không thể xác nhận phương án Farm Box.')
            updatedOrders.set(payload.data.id, payload.data)
          }
          setCustomerOrders((current) => (current || []).map((order) => updatedOrders.get(order.id) || order))
          showCartToast('Đã xác nhận phương án cho các Farm Box.')
        } catch (error) {
          if (updatedOrders.size) setCustomerOrders((current) => (current || []).map((order) => updatedOrders.get(order.id) || order))
          showCartToast(error.message || 'Không thể xác nhận phương án Farm Box.')
          confirmAllButton.disabled = false
        }
        return
      }
      const button = event.target.closest?.('[data-farmbox-change-confirm]')
      if (!button) return
      event.preventDefault()
      event.stopImmediatePropagation()
      const card = button.closest('[data-farmbox-change-card]')
      const orderId = card?.dataset.orderId
      const itemIndex = Number(card?.dataset.itemIndex)
      const selected = card?.querySelector('input[type="radio"]:checked')
      const decision = selected?.value
      if (!orderId || !Number.isInteger(itemIndex) || !['accept', 'cancel'].includes(decision)) {
        showCartToast('Chọn một phương án xử lý trước khi xác nhận.')
        return
      }
      if (decision === 'cancel' && !window.confirm('Bạn xác nhận hủy Farm Box này và yêu cầu hoàn 100% giá trị hộp?')) return
      const token = sessionStorage.getItem('greennovaToken')
      if (!token) return showCartToast('Vui lòng đăng nhập lại để xác nhận thay đổi.')
      button.disabled = true
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/farm-box-issue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ itemIndex, decision }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể xác nhận phương án Farm Box.')
        setCustomerOrders((current) => (current || []).map((order) => order.id === payload.data.id ? payload.data : order))
        showCartToast(payload.message || 'Đã lưu lựa chọn Farm Box.')
      } catch (error) {
        showCartToast(error.message || 'Không thể xác nhận phương án Farm Box.')
        button.disabled = false
      }
    }
    const syncFarmBoxPolicyChoice = (event) => {
      const choice = event.target.closest?.('[data-farmbox-policy-choice]')
      if (!choice) return
      const policySummary = root.querySelector('[data-farmbox-policy-summary]')
      if (policySummary) policySummary.innerHTML = choice.value === 'cancel'
        ? '<span class="material-symbols-outlined text-sm">cancel</span>Hủy Farm Box và hoàn tiền 100%'
        : '<span class="material-symbols-outlined text-sm">verified</span>Tự động thay thế bằng Farm Box dự phòng cùng cỡ'
      root.querySelectorAll('[data-farmbox-change-card] fieldset').forEach((fieldset) => {
        const matchingChoice = [...fieldset.querySelectorAll('input[type="radio"]')]
          .find((input) => input.value === choice.value)
        if (matchingChoice) matchingChoice.checked = true
      })
    }
    root.addEventListener('click', confirmFarmBoxChange, true)
    root.addEventListener('change', syncFarmBoxPolicyChoice, true)
    return () => {
      root.removeEventListener('click', confirmFarmBoxChange, true)
      root.removeEventListener('change', syncFarmBoxPolicyChoice, true)
    }
  }, [route.path, customerOrders])

  useEffect(() => {
    if (!['/orders/detail', '/checkout/payment'].includes(route.path)) return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const modal = root.querySelector('[data-customer-cancel-modal="true"]')
    let pendingCancelId = ''
    const findOrder = (id) => customerOrders?.find((entry) => entry.id === id)
      || (paymentOrder?.id === id ? paymentOrder : null)
    const cancelOrder = async (event) => {
      const reasonChoice = event.target.closest?.('input[name="customerCancelReason"]')
      if (reasonChoice && modal) {
        modal.querySelector('[data-cancel-other-reason]')?.classList.toggle('hidden', reasonChoice.value !== 'Lý do khác')
        return
      }
      const reorderButton = event.target.closest?.('[data-reorder-order]')
      if (reorderButton) {
        event.preventDefault()
        event.stopPropagation()
        const order = customerOrders?.find((entry) => entry.id === reorderButton.dataset.reorderOrder)
        const token = sessionStorage.getItem('greennovaToken')
        if (!order || !token) {
          showCartToast('Vui lòng đăng nhập lại để đặt lại đơn hàng.')
          return
        }
        reorderButton.disabled = true
        try {
          for (const item of order.items || []) {
            const body = {
              itemType: item.itemType,
              quantity: Number(item.quantity) || 1,
              ...(item.itemType === 'Product' ? { productId: item.id } : {}),
              ...(item.itemType === 'Combo' ? { comboId: item.id } : {}),
              ...(item.itemType === 'FarmBox' ? { farmBoxId: item.id, weekId: item.weekId } : {}),
            }
            const response = await fetch('/api/cart/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(body),
            })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || `Không thể thêm ${item.name || 'mặt hàng'} vào giỏ.`)
          }
          const cartResponse = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
          const cartPayload = await cartResponse.json()
          if (!cartResponse.ok) throw new Error(cartPayload.error || 'Đã thêm một phần đơn hàng nhưng chưa tải lại được giỏ hàng.')
          setServerCartItems(Array.isArray(cartPayload.data?.items) ? cartPayload.data.items : [])
          showCartToast('Đã thêm các mặt hàng còn hàng vào giỏ hàng.')
          window.setTimeout(() => navigateTo('/cart'), 500)
        } catch (error) {
          showCartToast(error.message || 'Không thể đặt lại đơn hàng.')
          reorderButton.disabled = false
        }
        return
      }
      const button = event.target.closest?.('[data-customer-cancel-order]')
      const closeButton = event.target.closest?.('[data-cancel-modal-close="true"]')
      const confirmButton = event.target.closest?.('[data-cancel-modal-confirm="true"]')
      if (button) {
        event.preventDefault()
        event.stopPropagation()
        pendingCancelId = button.dataset.customerCancelOrder || ''
        const firstReason = modal?.querySelector('input[name="customerCancelReason"]')
        if (firstReason) firstReason.checked = true
        const otherReason = modal?.querySelector('[data-cancel-other-reason]')
        otherReason?.classList.add('hidden')
        if (otherReason) otherReason.value = ''
        modal?.classList.remove('hidden')
        modal?.classList.add('flex')
        return
      }
      if (closeButton) {
        modal?.classList.add('hidden')
        modal?.classList.remove('flex')
        pendingCancelId = ''
        return
      }
      if (!confirmButton) return
      event.preventDefault()
      event.stopPropagation()
      const orderId = pendingCancelId
      const order = findOrder(orderId)
      if (!order) {
        showCartToast('Không tìm thấy đơn hàng cần hủy. Hãy tải lại trang.')
        return
      }
      const token = sessionStorage.getItem('greennovaToken')
      if (!token) {
        showCartToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        return
      }
      confirmButton.disabled = true
      try {
        const selectedReason = modal?.querySelector('input[name="customerCancelReason"]:checked')?.value || 'Lý do khác'
        const otherReason = modal?.querySelector('[data-cancel-other-reason]')?.value.trim() || ''
        const cancelReason = selectedReason === 'Lý do khác' && otherReason ? otherReason : selectedReason
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reason: cancelReason }),
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể hủy đơn hàng.')
        const updatedOrder = payload.data
        setCustomerOrders((current) => (current || []).map((entry) => entry.id === orderId ? updatedOrder : entry))
        if (route.path === '/checkout/payment') {
          setPaymentOrder(updatedOrder)
          navigateTo(`/orders/detail?orderId=${encodeURIComponent(orderId)}`)
        }
        pendingCancelId = ''
      } catch (error) {
        showCartToast(error.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.')
        confirmButton.disabled = false
      }
    }
    root.addEventListener('click', cancelOrder)
    return () => root.removeEventListener('click', cancelOrder)
  }, [route.path, screen.bodyHtml, customerOrders, paymentOrder?.id])

  useEffect(() => {
    if (route.path !== '/checkout/payment') return undefined
    const orderId = new URLSearchParams(currentSearch).get('orderId')
    if (!orderId) {
      try { setPaymentOrder(JSON.parse(sessionStorage.getItem('greennovaLatestOrder') || 'null')) }
      catch { setPaymentOrder(null) }
      return undefined
    }

    const listedOrder = customerOrders?.find((order) => order.id === orderId)
    if (listedOrder) {
      setPaymentOrder(listedOrder)
      return undefined
    }

    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    setPaymentOrder(null)
    fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể tải đơn hàng cần thanh toán.')
        const order = payload.data || null
        setPaymentOrder(order)
        if (order) sessionStorage.setItem('greennovaLatestOrder', JSON.stringify(order))
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Không thể tải đơn hàng để tạo VietQR:', error)
          setPaymentOrder(null)
        }
      })
    return () => controller.abort()
  }, [route.path, currentSearch, authUser?.id, customerOrders])

  useEffect(() => {
    setActivePaymentMethod('')
  }, [route.path, currentSearch])

  useEffect(() => {
    if (route.path !== '/checkout/payment') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const saveOrder = (order) => {
      setPaymentOrder(order)
      if (order) sessionStorage.setItem('greennovaLatestOrder', JSON.stringify(order))
    }
    const choosePaymentMethod = (event) => {
      const button = event.target.closest?.('[data-payment-method-choice]')
      if (!button) return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (paymentOrder?.status !== 'Chờ thanh toán') return
      // Keep the customer's choice local until they press the final confirm button.
      setActivePaymentMethod(button.dataset.paymentMethodChoice || '')
    }
    const confirmPayment = async (event) => {
      const button = event.target.closest?.('[data-payment-method-confirm]')
      if (!button) return
      event.preventDefault()
      event.stopImmediatePropagation()
      const orderId = new URLSearchParams(window.location.search).get('orderId') || paymentOrder?.id
      const token = sessionStorage.getItem('greennovaToken')
      if (!orderId || !token) {
        showCartToast('Vui lòng đăng nhập lại để xác nhận thanh toán.')
        return
      }
      const method = button.dataset.paymentMethodConfirm
      button.disabled = true
      try {
        const methodResponse = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment-method`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ method }),
        })
        const methodPayload = await methodResponse.json()
        if (!methodResponse.ok) throw new Error(methodPayload.error || 'Không thể xác nhận phương thức thanh toán.')
        saveOrder(methodPayload.data)

        if (method === 'CashOnDelivery') {
          setActivePaymentMethod('CashOnDelivery')
          showCartToast('Đã xác nhận đơn hàng và thanh toán khi nhận hàng.')
          return
        }

        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/report-payment`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể gửi xác nhận thanh toán.')
        saveOrder(payload.data)
        setPaymentSuccessOrder(payload.data)
      } catch (error) {
        button.disabled = false
        showCartToast(error.message || 'Không thể gửi xác nhận thanh toán.')
      }
    }
    root.addEventListener('click', choosePaymentMethod)
    root.addEventListener('click', confirmPayment)
    return () => {
      root.removeEventListener('click', choosePaymentMethod)
      root.removeEventListener('click', confirmPayment)
    }
  }, [route.path, currentSearch, paymentOrder?.id])

  useEffect(() => {
    if (route.path !== '/checkout/payment') return undefined
    const countdown = document.querySelector('[data-payment-expiry-countdown="true"]')
    if (!countdown) return undefined
    const orderId = countdown.dataset.orderId || new URLSearchParams(currentSearch).get('orderId') || paymentOrder?.id
    const token = sessionStorage.getItem('greennovaToken')
    const deadline = new Date(countdown.dataset.expiredAt).getTime()
    if (!orderId || !token || !Number.isFinite(deadline)) return undefined
    let cancelInFlight = false
    let retryAfter = 0
    let redirected = false

    const updateCountdown = async () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      if (remaining > 0) {
        const hours = Math.floor(remaining / 3600)
        const minutes = Math.floor((remaining % 3600) / 60)
        const seconds = remaining % 60
        countdown.textContent = `Còn ${hours} giờ ${minutes} phút ${seconds} giây`
        return
      }

      countdown.textContent = 'Đơn đang được tự động hủy…'
      if (cancelInFlight || Date.now() < retryAfter) return
      cancelInFlight = true
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/expire`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Chưa thể tự hủy đơn quá hạn.')
        setPaymentOrder(payload.data)
        sessionStorage.setItem('greennovaLatestOrder', JSON.stringify(payload.data))
        showCartToast('Đơn hàng đã tự động hủy do hết hạn thanh toán.')
        if (!redirected) {
          redirected = true
          window.setTimeout(() => navigateTo('/orders'), 900)
        }
      } catch (error) {
        retryAfter = Date.now() + 5000
        if (!error.message?.includes('chưa hết thời hạn')) console.warn('Không thể hủy đơn hết hạn:', error.message)
      } finally {
        cancelInFlight = false
      }
    }
    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [route.path, currentSearch, screen.bodyHtml, paymentOrder?.id])

  useEffect(() => {
    if (route.path !== '/checkout' || !authUser) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    fetch('/api/auth/me', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể tải hồ sơ tài khoản.')
        if (payload.user) {
          sessionStorage.setItem('greennovaUser', JSON.stringify(payload.user))
          setAuthUser(payload.user)
        }
      })
      .catch((error) => {
        if (error.name !== 'AbortError') console.warn('Không tải được thông tin giao hàng từ tài khoản:', error.message)
      })
    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/checkout' || !authUser) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    fetch('/api/cart', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể tải giỏ hàng.')
        setServerCartItems(Array.isArray(payload.data?.items) ? payload.data.items : [])
      })
      .catch((error) => {
        if (error.name !== 'AbortError') console.warn('Không tải được tóm tắt giỏ hàng khi checkout:', error.message)
      })
    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/combos', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('API combo chưa sẵn sàng')
        return response.json()
      })
      .then((payload) => setAvailableCombos(Array.isArray(payload.data) ? payload.data : []))
      .catch((error) => {
        if (error.name !== 'AbortError') console.warn('Chưa tải được tồn kho combo từ GreenNova API:', error.message)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/farm-boxes', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('API FarmBox chưa sẵn sàng')
        return response.json()
      })
      .then((payload) => setFarmBoxes(Array.isArray(payload.data) ? payload.data : []))
      .catch((error) => {
        if (error.name !== 'AbortError') console.warn('Chưa tải được lịch FarmBox từ GreenNova API:', error.message)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!['/farm-box/loai-nho', '/farm-box/loai-vua', '/farm-box/loai-lon', '/farm-box/chon-goi'].includes(route.path)) return undefined
    const controller = new AbortController()
    let timer
    const refreshFarmBoxCalendar = async () => {
      try {
        const response = await fetch('/api/farm-boxes', { signal: controller.signal })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể cập nhật lịch tuần Farm Box.')
        setFarmBoxes(Array.isArray(payload.data) ? payload.data : [])
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể cập nhật lịch tuần Farm Box:', error.message)
      }
    }
    const scheduleNextWeek = () => {
      const now = new Date()
      const nextMonday = new Date(now)
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7
      nextMonday.setDate(now.getDate() + daysUntilMonday)
      nextMonday.setHours(0, 0, 0, 0)
      timer = window.setTimeout(async () => {
        setFarmBoxWeekClock(Date.now())
        await refreshFarmBoxCalendar()
        if (!controller.signal.aborted) scheduleNextWeek()
      }, Math.max(1, nextMonday.getTime() - now.getTime()))
    }
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      setFarmBoxWeekClock(Date.now())
      refreshFarmBoxCalendar()
    }
    scheduleNextWeek()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [route.path])

  useEffect(() => {
    if (route.path !== '/cart' || !authUser) {
      setServerCartItems(null)
      return undefined
    }
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) {
      setServerCartItems(null)
      return undefined
    }
    const controller = new AbortController()
    fetch('/api/cart', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không tải được giỏ hàng từ máy chủ.')
        setServerCartItems(Array.isArray(payload.data?.items) ? payload.data.items : [])
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.warn('Không thể đồng bộ giỏ hàng từ MongoDB:', error.message)
          setServerCartItems(null)
        }
      })
    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (!['/account', '/account/addresses'].includes(route.path) || !authUser) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined

    const controller = new AbortController()
    fetch('/api/auth/me', {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw Object.assign(new Error(result.error || 'Không tải được hồ sơ.'), { status: response.status })
        sessionStorage.setItem('greennovaUser', JSON.stringify(result.user))
        setAuthUser(result.user)
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.warn('Không thể đồng bộ hồ sơ từ MongoDB:', error.message)
        if (error.status === 401) {
          sessionStorage.removeItem('greennovaToken')
          sessionStorage.removeItem('greennovaUser')
          setAuthUser(null)
          navigateTo(`/login?returnTo=${encodeURIComponent(route.path)}`)
        }
      })

    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/account/addresses' || !authUser) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    const form = document.querySelector('[data-address-form]')
    const panel = document.querySelector('#stitch-screen-root')
    if (!token || !form || !panel) return undefined

    const request = async (path, method, body) => {
      const response = await fetch(path, {
        method,
        headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}` },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Không thể cập nhật địa chỉ.')
      sessionStorage.setItem('greennovaUser', JSON.stringify(result.user))
      setAuthUser(result.user)
      return result
    }
    const onClick = async (event) => {
      const control = event.target.closest('[data-address-action]')
      if (!control) return
      event.preventDefault()
      event.stopImmediatePropagation()
      event.stopPropagation()
      const action = control.dataset.addressAction
      if (action === 'add' || action === 'close') {
        form.hidden = action === 'close'
        form.classList.toggle('hidden', form.hidden)
        if (action === 'add') {
          form.reset()
          form.elements.id.value = ''
          form.elements.receiverName.value = authUser.fullName || ''
          form.elements.receiverPhone.value = authUser.phone || ''
          form.elements.province.value = authUser.province || ''
          form.elements.makeDefault.checked = !authUser.addresses?.length
          form.querySelector('[data-address-form-title]').textContent = 'Thêm địa chỉ giao hàng'
          form.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        return
      }
      const id = control.dataset.addressId
      const item = authUser.addresses?.find((entry) => entry.id === id)
      if (!item) return
      try {
        if (action === 'default') {
          await request(`/api/auth/me/addresses/${encodeURIComponent(id)}/default`, 'PATCH')
        } else if (action === 'delete') {
          if (!window.confirm(`Xóa địa chỉ “${item.label}”?`)) return
          await request(`/api/auth/me/addresses/${encodeURIComponent(id)}`, 'DELETE')
        } else if (action === 'edit') {
          form.hidden = false
          form.classList.remove('hidden')
          form.elements.id.value = id
          form.elements.label.value = item.label || ''
          form.elements.receiverName.value = item.receiverName || authUser.fullName || ''
          form.elements.receiverPhone.value = item.receiverPhone || authUser.phone || ''
          form.elements.province.value = item.province || ''
          form.elements.address.value = item.address || ''
          form.elements.note.value = item.note || ''
          form.elements.makeDefault.checked = Boolean(item.isDefault)
          form.querySelector('[data-address-form-title]').textContent = 'Chỉnh sửa địa chỉ giao hàng'
          form.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } catch (error) {
        window.alert(error.message)
      }
    }
    const onSubmit = async (event) => {
      if (event.target !== form) return
      event.preventDefault()
      event.stopImmediatePropagation()
      const values = new FormData(form)
      const id = String(values.get('id') || '')
      const body = Object.fromEntries(['label', 'receiverName', 'receiverPhone', 'address', 'province', 'note'].map((key) => [key, String(values.get(key) || '').trim()]))
      const button = form.querySelector('[type="submit"]')
      button.disabled = true
      try {
        await request(id ? `/api/auth/me/addresses/${encodeURIComponent(id)}` : '/api/auth/me/addresses', id ? 'PATCH' : 'POST', { ...body, makeDefault: values.has('makeDefault') })
        if (values.has('makeDefault')) {
          const saved = authUser.addresses?.find((entry) => entry.id === id)
          const selectedId = id || (authUser.addresses || []).at(-1)?.id
          if (selectedId && (!saved?.isDefault || !id)) {
            const latest = JSON.parse(sessionStorage.getItem('greennovaUser') || '{}')
            const newId = id || latest.addresses?.at(-1)?.id
            if (newId) await request(`/api/auth/me/addresses/${encodeURIComponent(newId)}/default`, 'PATCH')
          }
        }
        window.alert('Đã lưu địa chỉ giao hàng.')
      } catch (error) {
        window.alert(error.message)
      } finally {
        button.disabled = false
      }
    }
    panel.addEventListener('click', onClick, true)
    panel.addEventListener('submit', onSubmit, true)
    return () => {
      panel.removeEventListener('click', onClick, true)
      panel.removeEventListener('submit', onSubmit, true)
    }
  }, [route.path, screen.bodyHtml, authUser])

  useEffect(() => {
    if (route.path !== '/account/refund-account' || !authUser) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    const form = document.querySelector('[data-refund-account-form]')
    if (!token || !form) return undefined
    const onSubmit = async (event) => {
      if (event.target !== form) return
      event.preventDefault()
      event.stopImmediatePropagation()
      const values = new FormData(form)
      const submitButton = form.querySelector('[type="submit"]')
      const payload = {
        fullName: authUser.fullName || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        address: authUser.address || '',
        province: authUser.province || '',
        bankName: String(values.get('bankName') || '').trim(),
        bankAccountNumber: String(values.get('bankAccountNumber') || '').trim(),
        bankAccountHolder: String(values.get('bankAccountHolder') || '').trim().toLocaleUpperCase('vi-VN'),
        bankBranch: String(values.get('bankBranch') || '').trim(),
      }
      submitButton.disabled = true
      try {
        const response = await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể lưu tài khoản nhận hoàn tiền.')
        sessionStorage.setItem('greennovaUser', JSON.stringify(result.user))
        setAuthUser(result.user)
        showCartToast('Đã lưu tài khoản nhận hoàn tiền')
      } catch (error) {
        window.alert(error.message)
      } finally {
        submitButton.disabled = false
      }
    }
    form.addEventListener('submit', onSubmit)
    return () => form.removeEventListener('submit', onSubmit)
  }, [route.path, screen.bodyHtml, authUser])

  useEffect(() => {
    const submitListingSearch = (input) => {
      const query = input?.value?.trim() || ''
      setProductSearch(query)
      setProductPage(1)
      navigateTo(query ? `/nong-san?search=${encodeURIComponent(query)}` : '/nong-san')
    }

    const submitSearch = async (input) => {
      const query = input?.value?.trim() || ''
      const normalizedQuery = normalizeLabel(query)
      if (!normalizedQuery) {
        setProductPage(1)
        setProductSearch('')
        navigateTo('/nong-san')
        return
      }

      const tokens = normalizedQuery.split(/\s+/)
      let searchableProducts = products
      let searchableCombos = availableCombos
      let searchableFarmBoxes = farmBoxes
      try {
        const [productResponse, comboResponse, farmBoxResponse] = await Promise.all([
          fetch(`/api/products?line=Standard&q=${encodeURIComponent(query)}`),
          searchableCombos.length ? Promise.resolve(null) : fetch('/api/combos'),
          searchableFarmBoxes.length ? Promise.resolve(null) : fetch('/api/farm-boxes'),
        ])
        if (productResponse.ok) {
          const payload = await productResponse.json()
          if (Array.isArray(payload.data) && payload.data.length > 0) {
            searchableProducts = payload.data
            setProducts((current) => [
              ...current,
              ...payload.data.filter((item) => !current.some((existing) => existing.id === item.id)),
            ])
          }
        }
        if (comboResponse?.ok) {
          const payload = await comboResponse.json()
          searchableCombos = Array.isArray(payload.data) ? payload.data : []
          setAvailableCombos(searchableCombos)
        }
        if (farmBoxResponse?.ok) {
          const payload = await farmBoxResponse.json()
          searchableFarmBoxes = Array.isArray(payload.data) ? payload.data : []
          setFarmBoxes(searchableFarmBoxes)
        }
      } catch (error) {
        console.warn('Không thể tra cứu toàn bộ danh mục từ máy chủ:', error.message)
      }

      const matchingProducts = searchableProducts.filter((product) => {
        const name = normalizeLabel(product.name)
        return tokens.every((token) => name.includes(token))
      })
      const exactMatch = matchingProducts.find((product) => normalizeLabel(product.name) === normalizedQuery)
      const searchableEntries = [
        ...matchingProducts.map((item) => ({ type: 'Product', item })),
        ...searchableCombos.filter((item) => item.isActive === true && item.isPublished === true
          && tokens.every((token) => normalizeLabel(item.name || '').includes(token)))
          .map((item) => ({ type: 'Combo', item })),
        ...searchableFarmBoxes.filter((item) => getFarmBoxWeekOpenThisWeek(item)
          && tokens.every((token) => normalizeLabel(item.name || '').includes(token)))
          .map((item) => ({ type: 'FarmBox', item, week: getFarmBoxWeekOpenThisWeek(item) })),
      ]
      const exactEntry = searchableEntries.find(({ item }) => normalizeLabel(item.name || '') === normalizedQuery)
      const entryRoute = ({ type, item }) => {
        if (type === 'Combo') return `/imperfect/chi-tiet?comboId=${encodeURIComponent(item.id)}`
        if (type === 'FarmBox') {
          const week = searchableEntries.find((entry) => entry.type === 'FarmBox' && entry.item.id === item.id)?.week
            || getFarmBoxWeekOpenThisWeek(item)
          return `/farm-box/thuc-don?farmBoxId=${encodeURIComponent(item.id)}${week?.id ? `&weekId=${encodeURIComponent(week.id)}` : ''}`
        }
        return `/nong-san/chi-tiet?productId=${encodeURIComponent(item.id)}`
      }

      // A broad query such as "cà chua" can match several distinct products.
      // Keep the user on the catalog so they can choose the regular tomato,
      // cherry tomato, or another matching variety instead of opening the
      // first alphabetically sorted result by accident.
      if (exactEntry) {
        navigateTo(entryRoute(exactEntry))
      } else if (exactMatch) {
        navigateTo(`/nong-san/chi-tiet?productId=${encodeURIComponent(exactMatch.id)}`)
      } else if (searchableEntries.length > 1 && new Set(searchableEntries.map(({ type }) => type)).size === 1) {
        const type = searchableEntries[0].type
        navigateTo(type === 'Combo' ? '/imperfect' : type === 'FarmBox' ? '/farm-box' : `/nong-san?search=${encodeURIComponent(query)}`)
      } else if (searchableEntries.length === 1) {
        navigateTo(entryRoute(searchableEntries[0]))
      } else if (searchableEntries.length > 1) {
        const routeByType = tokens.includes('farm') || tokens.includes('box')
          ? '/farm-box'
          : tokens.includes('combo') || tokens.includes('imperfect')
            ? '/imperfect'
            : entryRoute(searchableEntries[0])
        navigateTo(routeByType)
      } else if (matchingProducts.length > 1) {
        setProductPage(1)
        setProductSearch(query)
        navigateTo(`/nong-san?search=${encodeURIComponent(query)}`)
      } else if (matchingProducts.length === 1) {
        navigateTo(`/nong-san/chi-tiet?productId=${encodeURIComponent(matchingProducts[0].id)}`)
      } else {
        setProductPage(1)
        setProductSearch('')
        navigateTo('/nong-san')
      }
    }

    const isSearchInput = (element) => element instanceof HTMLInputElement
      && !element.matches('[data-admin-product-search]')
      && normalizeLabel(element.placeholder).includes('tim kiem')
    const handleSearchKeydown = (event) => {
      if (event.key !== 'Enter') return
      if (isAdminOrdersScreen(route) && event.target?.matches('[data-admin-orders-search]')) {
        event.preventDefault()
        return
      }
      if (route.path === '/nong-san' && event.target?.id === 'product-search-input') {
        event.preventDefault()
        submitListingSearch(event.target)
        return
      }
      if (!isSearchInput(event.target)) return
      event.preventDefault()
      submitSearch(event.target)
    }
    const handleSearchClick = (event) => {
      const adminSearchInput = document.querySelector('[data-admin-product-search]')
      if (adminSearchInput?.parentElement?.contains(event.target)) return
      if (route.path === '/nong-san' && event.target.closest?.('#clear-search-btn')) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const input = document.querySelector('#product-search-input')
        if (input) input.value = ''
        setProductSearch('')
        setProductPage(1)
        navigateTo('/nong-san')
        return
      }
      const listingSearchButton = route.path === '/nong-san'
        ? [...(document.querySelectorAll('button') || [])].find((button) => (
          normalizeLabel(button.textContent).includes('tim kiem')
          && button.closest('section')?.querySelector('#product-search-input')
        ))
        : null
      if (listingSearchButton && listingSearchButton.contains(event.target)) {
        event.preventDefault()
        event.stopImmediatePropagation()
        submitListingSearch(document.querySelector('#product-search-input'))
        return
      }

      const icon = event.target.closest?.('.material-symbols-outlined, .material-symbols-rounded, .material-icons')
      const button = event.target.closest?.('button')
      const input = isSearchInput(event.target) ? event.target : null
      const inputIcon = input && [...(input.parentElement?.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded, .material-icons') || [])]
        .find((candidate) => normalizeLabel(candidate.textContent) === 'search')
      const clickedInputIcon = Boolean(inputIcon && event.clientX && event.clientY
        && (() => {
          const rect = inputIcon.getBoundingClientRect()
          return event.clientX >= rect.left && event.clientX <= rect.right
            && event.clientY >= rect.top && event.clientY <= rect.bottom
        })())
      const clickedSearchIcon = icon && normalizeLabel(icon.textContent) === 'search'
      const clickedSearchButton = button && [...button.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded, .material-icons')]
        .some((candidate) => normalizeLabel(candidate.textContent) === 'search')
      if (!clickedSearchIcon && !clickedSearchButton && !clickedInputIcon) return

      const header = event.target.closest?.('header') || document.querySelector('header')
      const searchInput = input || [...(header?.querySelectorAll('input') || [])].find(isSearchInput)
      if (!searchInput) return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      submitSearch(searchInput)
    }

    document.addEventListener('keydown', handleSearchKeydown)
    document.addEventListener('click', handleSearchClick)
    return () => {
      document.removeEventListener('keydown', handleSearchKeydown)
      document.removeEventListener('click', handleSearchClick)
    }
  }, [products, availableCombos, farmBoxes, route.path])

  useEffect(() => {
    const input = document.querySelector('#global-product-search')
    const suggestions = document.querySelector('#global-product-search-suggestions')
    if (!input || !suggestions) return undefined

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char])
    const renderSuggestions = () => {
      const query = input.value.trim()
      const tokens = normalizeLabel(query).split(/\s+/).filter(Boolean)
      if (!tokens.length) {
        suggestions.replaceChildren()
        suggestions.classList.add('hidden')
        return
      }
      const productMatches = products.filter((product) => {
        // Suggestions are product-name matches only. Matching the farm or
        // category makes a one-letter query like "c" show unrelated items
        // simply because their category contains that letter.
        const searchable = normalizeLabel(product.name || '')
        return tokens.every((token) => searchable.includes(token))
      }).map((product) => ({
        type: 'Product', item: product, label: product.farm || 'GreenNova',
        route: `/nong-san/chi-tiet?productId=${encodeURIComponent(product.id)}`,
      }))
      const comboMatches = availableCombos.filter((combo) => combo.isActive === true && combo.isPublished === true
        && tokens.every((token) => normalizeLabel(combo.name || '').includes(token)))
        .map((combo) => ({
          type: 'Combo Imperfect', item: combo, label: 'Combo Imperfect · GreenNova',
          route: `/imperfect/chi-tiet?comboId=${encodeURIComponent(combo.id)}`,
        }))
      const farmBoxMatches = farmBoxes.filter((box) => getFarmBoxWeekOpenThisWeek(box)
        && tokens.every((token) => normalizeLabel(box.name || '').includes(token)))
        .map((box) => {
          const week = getFarmBoxWeekOpenThisWeek(box)
          return {
            type: 'Farm Box', item: box,
            label: week?.name ? `Tuần này · ${week.name}` : `Farm Box · ${box.type || 'GreenNova'}`,
            route: `/farm-box/thuc-don?farmBoxId=${encodeURIComponent(box.id)}${week?.id ? `&weekId=${encodeURIComponent(week.id)}` : ''}`,
          }
        })
      const matches = [...productMatches, ...comboMatches, ...farmBoxMatches].slice(0, 7)
      if (!matches.length) {
        suggestions.innerHTML = `<div class="px-4 py-5 text-center text-sm text-[#647467]">Không tìm thấy mặt hàng phù hợp.</div><a href="/nong-san?search=${encodeURIComponent(query)}" data-route="/nong-san?search=${encodeURIComponent(query)}" class="flex items-center gap-2 border-t border-[#edf2ed] px-4 py-3 text-sm font-semibold text-[#16733b] no-underline"><span class="material-symbols-outlined text-[18px]">search</span>Tìm “${escapeHtml(query)}” trong danh mục</a>`
      } else {
        suggestions.innerHTML = `<div class="py-1">${matches.map(({ type, item, label, route }) => `<a href="${escapeHtml(route)}" data-route="${escapeHtml(route)}" class="flex items-center gap-3 px-3 py-2 no-underline transition hover:bg-[#edf7ee]"><img src="${escapeHtml(item.image || item.imageUrl || '')}" alt="" class="h-10 w-10 shrink-0 rounded-lg bg-[#edf4ed] object-cover" loading="lazy"/><span class="min-w-0 flex-1"><strong class="block truncate text-sm text-[#176b39]">${escapeHtml(item.name)}</strong><span class="mt-0.5 flex items-center gap-1 truncate text-xs text-[#6b786e]"><span class="material-symbols-outlined text-[13px]">${type === 'Product' ? 'location_on' : type === 'Combo Imperfect' ? 'nutrition' : 'inventory_2'}</span>${escapeHtml(label)}</span></span></a>`).join('')}</div><a href="/nong-san?search=${encodeURIComponent(query)}" data-route="/nong-san?search=${encodeURIComponent(query)}" class="flex items-center gap-2 border-t border-[#edf2ed] px-4 py-3 text-sm font-semibold text-[#48624d] no-underline transition hover:bg-[#f7fbf7]"><span class="material-symbols-outlined text-[18px] text-[#176b39]">folder_open</span>Tìm “${escapeHtml(query)}” trong danh mục</a>`
      }
      suggestions.classList.remove('hidden')
    }
    const handleInput = () => renderSuggestions()
    const handleFocus = () => renderSuggestions()
    const handleDocumentClick = (event) => {
      if (!suggestions.parentElement?.contains(event.target)) suggestions.classList.add('hidden')
    }
    input.addEventListener('input', handleInput)
    input.addEventListener('focus', handleFocus)
    document.addEventListener('click', handleDocumentClick)
    return () => {
      input.removeEventListener('input', handleInput)
      input.removeEventListener('focus', handleFocus)
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [products, availableCombos, farmBoxes, route.path, screen.bodyHtml])

  useEffect(() => {
    if (route.path !== '/admin' && !route.folder.startsWith('qt01')) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined

    const controller = new AbortController()
    const loadWeeklyReport = async () => {
      try {
        const response = await fetch(`/api/admin/reports/weekly?date=${getLocalDateString(new Date())}`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải số liệu biểu đồ theo tuần.')
        setWeeklyData(result.data)
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể cập nhật biểu đồ tuần:', error.message)
      }
    }

    loadWeeklyReport()
    const timer = window.setInterval(loadWeeklyReport, 120_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, route.folder, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/products') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    const loadProductSummary = async () => {
      try {
        const response = await fetch('/api/admin/products/summary', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải thống kê nông sản.')
        setAdminProductSummary(result.data)
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể tải thống kê sản phẩm:', error.message)
      }
    }
    loadProductSummary()
    const timer = window.setInterval(loadProductSummary, 120_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/farm-box') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    const loadFarmBoxSummary = async () => {
      try {
        const response = await fetch('/api/admin/farm-boxes/summary', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải số hộp Farm Box đã đặt.')
        const summary = result.data || {}
        const root = document.getElementById('stitch-screen-root') || document
        const booked = root.querySelector('[data-farm-box-booked-count]')
        const capacity = root.querySelector('[data-farm-box-capacity]')
        if (booked) booked.textContent = Number(summary.bookedBoxes || 0).toLocaleString('vi-VN')
        if (capacity) capacity.textContent = `/ ${Number(summary.maxBoxes || 0).toLocaleString('vi-VN')} hộp`
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể cập nhật số Farm Box đã đặt:', error.message)
      }
    }
    loadFarmBoxSummary()
    const timer = window.setInterval(loadFarmBoxSummary, 30_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, route.folder, screen.bodyHtml, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/farm-box') return undefined
    let timer
    const refreshAtWeekBoundary = () => {
      const now = new Date()
      const nextMonday = new Date(now)
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7
      nextMonday.setDate(now.getDate() + daysUntilMonday)
      nextMonday.setHours(0, 0, 0, 0)
      timer = window.setTimeout(() => {
        setFarmBoxWeekClock(Date.now())
        refreshAtWeekBoundary()
      }, Math.max(1, nextMonday.getTime() - now.getTime()))
    }
    refreshAtWeekBoundary()
    return () => window.clearTimeout(timer)
  }, [route.path])

  useEffect(() => {
    if (route.path !== '/admin/farm-box') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char])
    const sizeTabs = [
      { key: 'nho', label: 'Loại nhỏ', accepts: (price) => price < 199000 },
      { key: 'vua', label: 'Loại vừa', accepts: (price) => price >= 199000 && price < 300000 },
      { key: 'lon', label: 'Loại lớn', accepts: (price) => price >= 300000 },
    ]
    const catalog = [...products].filter((product) => product?.id && Number(product.price) > 0)
    const rows = [...root.querySelectorAll('tbody tr')]
    rows.forEach((row, index) => {
      const edit = [...row.querySelectorAll('button')].find((button) => normalizeLabel(button.textContent).includes('sua thuc don'))
      if (edit) {
        edit.dataset.adminFarmboxEdit = String(index + 1)
        edit.type = 'button'
      }
    })

    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 z-[100] hidden items-center justify-center bg-[#101b13]/55 p-4 backdrop-blur-sm'
    modal.setAttribute('data-farmbox-demo-modal', 'true')
    modal.innerHTML = '<div class="flex h-[92vh] max-h-[92dvh] w-full max-w-[1450px] flex-col overflow-hidden rounded-2xl bg-[#f7fbf6] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="farmbox-demo-title"></div>'
    document.body.append(modal)
    let activeWeek = 1
    let activeSize = 'nho'
    let selectedBoxId = ''
    let selectedWeekId = ''
    let selectedBox = null
    let selectedWeek = null
    let showWeekSelector = false
    let selectedWeekBoxIds = new Set()
    let selectionInitializedFor = ''
    let refreshFarmBoxesAfterClose = false
    let draft = { pricingMode: 'manual', manualPrice: 0, boxName: '', items: [] }
    let saveMessage = ''
    let saveIsError = false
    const getProduct = (id) => catalog.find((product) => product.id === id)
    const moneyLabel = (value) => `${Math.round(Number(value) || 0).toLocaleString('vi-VN')}đ`
    const dateKey = (value) => {
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    const weekSlots = () => {
      const monday = new Date()
      monday.setHours(0, 0, 0, 0)
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
      return [0, 1, 2].map((offset) => {
        const startDate = new Date(monday)
        startDate.setDate(startDate.getDate() + offset * 7)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
        return { startDate, endDate }
      })
    }
    const activeSlot = () => {
      const slots = weekSlots()
      if (slots[activeWeek - 1]) return slots[activeWeek - 1]
      const startDate = new Date(slots.length ? slots[slots.length - 1].startDate : Date.now())
      if (!slots.length) startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7))
      else startDate.setDate(startDate.getDate() + 7 * (activeWeek - slots.length))
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      return { startDate, endDate }
    }
    const offerFor = (box) => {
      const targetKey = dateKey(activeSlot().startDate)
      const week = (box.weeks || []).find((candidate) => dateKey(candidate.startDate) === targetKey) || null
      return { box, week, price: Number(week?.price ?? box.price) || 0 }
    }
    const matchingOffers = () => (farmBoxes || [])
      .map(offerFor)
      // The edit view is the full catalog for this price tier. Weekly selection
      // is a separate action and must not hide boxes that are not scheduled yet.
      .filter((offer) => offer.price > 0 && sizeTabs.find((tab) => tab.key === activeSize)?.accepts(offer.price))
      .sort((a, b) => a.price - b.price || String(a.box.name).localeCompare(String(b.box.name), 'vi'))
    const weightFor = (items) => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    const loadDraft = (offer) => {
      selectedBox = offer.box
      selectedWeek = offer.week
      selectedBoxId = offer.box.id
      selectedWeekId = offer.week?.id || ''
      const fallbackItems = (offer.week?.items || []).map((item) => ({
        productId: String(item.productId || ''),
        quantity: Number(item.quantity) || 0,
      })).filter((item) => item.productId)
      draft = {
        pricingMode: offer.week?.pricingMode || offer.box.pricingMode || 'manual', manualPrice: offer.price,
        boxName: offer.week?.name || offer.box.name || '', items: fallbackItems,
        maxBoxes: Number(offer.week?.maxBoxes ?? offer.box.defaultMaxBoxes) || 60,
      }
      saveMessage = ''
      saveIsError = false
    }
    const displayBoxName = (box, week) => week?.name || box.name || 'Farm Box'
    const productOptions = (selectedId) => catalog.map((product) => (
      `<option value="${escapeHtml(product.id)}" ${product.id === selectedId ? 'selected' : ''}>${escapeHtml(product.name)} · ${moneyLabel(product.price)}/${escapeHtml(product.unit || 'kg')}</option>`
    )).join('')
    const renderEditor = () => {
      if (!selectedBox) return ''
      const lineItems = (draft.items || []).map((item, index) => {
        const product = getProduct(item.productId)
        const amount = (Number(product?.price) || 0) * (Number(item.quantity) || 0)
        const certificate = product?.certification
        const certificateText = Array.isArray(certificate) ? certificate.join(', ') : String(certificate || '')
        const farmText = [product?.farm, product?.region].filter(Boolean).join(' · ') || 'Chưa cập nhật xuất xứ'
        const step = getProductQuantityStep(product)
        return `<tr class="border-b border-[#e4ece2] last:border-0 hover:bg-[#f8fbf7]">
          <td class="w-14 px-3 py-3 text-center text-sm font-semibold text-[#6c7b6e]">${String(index + 1).padStart(2, '0')}</td>
          <td class="min-w-[270px] px-3 py-3"><div class="flex items-center gap-3"><img src="${escapeHtml(product?.image || '')}" alt="${escapeHtml(product?.name || 'Nông sản')}" class="h-12 w-12 shrink-0 rounded-lg bg-[#eef4ec] object-cover" onerror="this.style.display='none'"><div class="min-w-0"><label class="block"><span class="sr-only">Chọn nông sản</span><select data-fb-demo-product="${index}" class="w-full min-w-0 bg-transparent text-sm font-semibold text-[#24372a] outline-none" ${catalog.length ? '' : 'disabled'}>${productOptions(item.productId)}${!catalog.length ? '<option>Chưa có nông sản</option>' : ''}</select></label><span class="mt-1 block truncate text-xs text-[#69786b]">${escapeHtml(product?.categoryName || product?.category || 'Nông sản')}</span></div></div></td>
          <td class="min-w-[190px] px-3 py-3 text-sm text-[#48594c]">${escapeHtml(farmText)}</td>
          <td class="min-w-[120px] px-3 py-3">${certificateText ? `<span class="inline-flex rounded-full bg-[#e4f3e3] px-2.5 py-1 text-xs font-medium text-[#176b36]">${escapeHtml(certificateText)}</span>` : '<span class="text-xs text-[#89938b]">—</span>'}</td>
          <td class="min-w-[160px] px-3 py-3"><div class="inline-flex h-10 items-center gap-1 rounded-lg bg-[#e9f4e8] p-1"><button data-fb-demo-qty-action="decrease" data-fb-demo-qty-index="${index}" data-fb-demo-step="${step}" type="button" class="grid h-8 w-8 place-items-center rounded-md bg-white text-[#405346] hover:bg-[#d9ecda]" aria-label="Giảm khối lượng"><span class="material-symbols-outlined text-lg">remove</span></button><input data-fb-demo-qty="${index}" type="number" min="0.01" step="${step}" value="${Number(item.quantity) || 0}" class="h-8 w-[74px] border-0 bg-transparent px-1 text-center text-sm font-semibold text-[#176b36] outline-none"/><button data-fb-demo-qty-action="increase" data-fb-demo-qty-index="${index}" data-fb-demo-step="${step}" type="button" class="grid h-8 w-8 place-items-center rounded-md bg-white text-[#405346] hover:bg-[#d9ecda]" aria-label="Tăng khối lượng"><span class="material-symbols-outlined text-lg">add</span></button></div></td>
          <td class="whitespace-nowrap px-3 py-3 text-right text-sm text-[#68766a]">${moneyLabel(product?.price)}/${escapeHtml(product?.unit || 'kg')}</td>
          <td class="whitespace-nowrap px-3 py-3 text-right text-sm font-bold text-[#176b36]">${moneyLabel(amount)}</td>
          <td class="px-3 py-3 text-center"><button data-fb-demo-remove="${index}" type="button" class="grid h-9 w-9 place-items-center rounded-lg text-[#a3453b] hover:bg-[#fff0ed]" title="Bỏ nông sản"><span class="material-symbols-outlined text-[19px]">delete</span></button></td>
        </tr>`
      }).join('')
      const totalWeight = weightFor(draft.items || [])
      const retailTotal = (draft.items || []).reduce((sum, item) => sum + (Number(getProduct(item.productId)?.price) || 0) * (Number(item.quantity) || 0), 0)
      const packagePrice = draft.pricingMode === 'manual' ? Number(draft.manualPrice) || 0 : Math.round(retailTotal)
      const margin = Math.max(0, retailTotal - packagePrice)
      const sizeLabel = sizeTabs.find((tab) => tab.key === activeSize)?.label || ''
      return `<section class="mx-auto w-full rounded-2xl border border-[#dce8dc] bg-[#f0f8ef] p-5"><button data-fb-demo-back type="button" class="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#176b36]"><span class="material-symbols-outlined text-lg">arrow_back</span>Danh sách ${sizeLabel.toLocaleLowerCase('vi-VN')}</button><div class="mb-5 flex items-start gap-4"><img src="${escapeHtml(selectedBox.image || '')}" alt="" class="h-16 w-16 rounded-xl bg-white object-cover"><div class="min-w-0 flex-1"><span class="text-sm font-semibold text-[#627264]">${escapeHtml(sizeLabel)} · ${moneyLabel(packagePrice)}</span><label class="mt-2 block max-w-2xl text-sm font-semibold text-[#35463a]">Tên Farm Box<input data-fb-demo-name type="text" maxlength="100" value="${escapeHtml(draft.boxName || selectedBox.name || '')}" class="mt-1 h-11 w-full rounded-lg border border-[#cbdcc9] bg-white px-3 text-base font-semibold text-[#183a26]" /></label><p class="mt-2 text-sm text-[#657267]">${totalWeight.toLocaleString('vi-VN')} kg · ${selectedWeek ? `Tuần ${activeWeek}` : 'Chưa có thực đơn tuần trong MongoDB'}</p></div></div><div class="overflow-x-auto rounded-xl border border-[#dce8dc] bg-white"><table class="w-full min-w-[1120px] border-collapse text-left"><thead class="bg-[#e8f4e7] text-xs font-semibold text-[#526257]"><tr><th class="px-3 py-3 text-center">STT</th><th class="px-3 py-3">Tên nông sản &amp; phân loại</th><th class="px-3 py-3">Nông trại / xuất xứ</th><th class="px-3 py-3">Chứng nhận</th><th class="px-3 py-3">Khối lượng</th><th class="px-3 py-3 text-right">Đơn giá tham chiếu</th><th class="px-3 py-3 text-right">Thành tiền lẻ</th><th class="px-3 py-3 text-center">Thao tác</th></tr></thead><tbody>${lineItems || `<tr><td colspan="8" class="px-4 py-8 text-center text-sm text-[#6b786d]">Chưa có nông sản trong thực đơn. Thêm sản phẩm từ MongoDB.</td></tr>`}</tbody></table></div><button data-fb-demo-add type="button" class="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#9ebba0] bg-white text-sm font-semibold text-[#176b36] hover:bg-[#f7fcf6]" ${catalog.length ? '' : 'disabled'}><span class="material-symbols-outlined text-lg">add_circle</span>Thêm nông sản từ Products</button><div class="mt-4 grid gap-4 rounded-xl bg-white p-4 md:grid-cols-[minmax(0,1fr)_300px]"><div><div class="flex items-center justify-between text-sm text-[#647166]"><span>Tổng khối lượng</span><strong class="text-[#29382d]">${totalWeight.toLocaleString('vi-VN')} kg</strong></div><div class="mt-2 flex items-center justify-between text-sm text-[#647166]"><span>Tổng giá bán lẻ</span><strong class="text-[#29382d]">${moneyLabel(retailTotal)}</strong></div><label class="mt-4 block text-sm font-semibold text-[#35463a]">Cách đặt giá<select data-fb-demo-mode class="mt-1.5 h-11 w-full rounded-lg border border-[#d4e0d3] bg-white px-3 text-sm"><option value="auto" ${draft.pricingMode !== 'manual' ? 'selected' : ''}>Tự tính theo nông sản và khối lượng</option><option value="manual" ${draft.pricingMode === 'manual' ? 'selected' : ''}>Admin nhập giá gói</option></select></label></div><div><label class="block text-sm font-semibold text-[#35463a]">Giá gói<input data-fb-demo-price type="number" min="0" step="1000" value="${Math.round(packagePrice)}" ${draft.pricingMode !== 'manual' ? 'readonly' : ''} class="mt-1.5 h-11 w-full rounded-lg border border-[#d4e0d3] px-3 text-base font-bold text-[#00602e] ${draft.pricingMode !== 'manual' ? 'bg-[#f2f6f0]' : 'bg-white'}" /></label><p class="mt-2 text-sm text-[#68766a]">${draft.pricingMode === 'manual' ? `Giá lẻ tham khảo ${moneyLabel(retailTotal)} · tiết kiệm ${moneyLabel(margin)}` : 'Giá tự tính bằng tổng đơn giá MongoDB nhân khối lượng.'}</p></div></div></section>`
    }
    const renderWeekSelector = () => {
      const slot = activeSlot()
      const activeSizeTab = sizeTabs.find((tab) => tab.key === activeSize)
      const entries = (farmBoxes || []).map((box) => ({ ...offerFor(box), box }))
        .filter((offer) => offer.price > 0 && activeSizeTab?.accepts(offer.price))
        .sort((a, b) => a.price - b.price || String(a.box.name).localeCompare(String(b.box.name), 'vi'))
      const sizeFor = (price) => sizeTabs.find((tab) => tab.accepts(price))?.label || 'Khác'
      const checkboxes = entries.map(({ box, week, price }) => `<label class="grid cursor-pointer grid-cols-[24px_52px_minmax(0,1fr)_120px] items-center gap-3 rounded-xl border border-[#dce8dc] bg-white p-4 transition hover:border-[#9dbb9f]">
        <input data-fb-demo-week-choice="${escapeHtml(box.id)}" type="checkbox" ${selectedWeekBoxIds.has(box.id) ? 'checked' : ''} class="h-5 w-5 accent-[#176b36]" />
        <img src="${escapeHtml(box.image || '')}" alt="" class="h-13 w-13 rounded-lg bg-[#f1f5ef] object-cover" />
        <span class="min-w-0"><strong class="block truncate text-base text-[#23382a]">${escapeHtml(displayBoxName(box, week))}</strong><span class="mt-1 block text-sm text-[#68766a]">${escapeHtml(sizeFor(price))} · ${weightFor(week?.items || box.defaultItems || []).toLocaleString('vi-VN')} kg${week ? ' · đã có lịch' : ' · sẽ tạo lịch tuần'}</span></span>
        <strong class="text-right text-base text-[#00602e]">${moneyLabel(price)}</strong>
      </label>`).join('')
      return `<section class="mx-auto max-w-[900px] rounded-2xl border border-[#dce8dc] bg-[#f0f8ef] p-6"><div class="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h3 class="text-xl font-bold text-[#183a26]">Chọn Farm Box hiển thị tuần ${activeWeek}</h3><p class="mt-1 text-sm text-[#657267]">${dateKey(slot.startDate)} – ${dateKey(slot.endDate)} · đã chọn <strong data-fb-demo-selected-count>${selectedWeekBoxIds.size}</strong> gói</p></div><div class="flex gap-2"><button data-fb-demo-select-all type="button" class="h-10 rounded-lg border border-[#cbd9cb] bg-white px-3 text-sm font-semibold text-[#455548]">Chọn tất cả</button><button data-fb-demo-select-none type="button" class="h-10 rounded-lg border border-[#cbd9cb] bg-white px-3 text-sm font-semibold text-[#455548]">Bỏ chọn</button></div></div><div class="flex flex-col gap-2">${checkboxes || '<p class="rounded-xl bg-white p-5 text-sm text-[#657267]">Không có Farm Box nào có giá hợp lệ.</p>'}</div></section>`
    }
    const render = () => {
      const dialog = modal.firstElementChild
      const previousScrollTop = dialog.querySelector('[data-fb-demo-scroll]')?.scrollTop || 0
      const offers = matchingOffers()
      const tabs = sizeTabs.map((tab) => `<button data-fb-demo-tab="${tab.key}" type="button" class="rounded-full px-4 py-2.5 text-sm font-semibold ${activeSize === tab.key ? 'bg-[#176f3b] text-white' : 'bg-white text-[#445648] hover:bg-[#e5f2e4]'}">${tab.label} <span class="ml-1 opacity-80">(${(farmBoxes || []).map(offerFor).filter((offer) => offer.price > 0 && tab.accepts(offer.price)).length})</span></button>`).join('')
      const boxCards = offers.map(({ box, week, price }) => {
        const weight = weightFor((week?.items || []).map((item) => item))
        return `<article class="grid grid-cols-[52px_minmax(0,1fr)_120px_112px] items-center gap-4 rounded-xl border border-[#dce8dc] bg-white p-4"><img src="${escapeHtml(box.image || '')}" alt="" class="h-13 w-13 rounded-lg bg-[#f1f5ef] object-cover"><div class="min-w-0"><h3 class="truncate text-base font-semibold text-[#23382a]">${escapeHtml(displayBoxName(box, week))}</h3><p class="mt-1 text-sm text-[#68766a]">${weight ? `${weight.toLocaleString('vi-VN')} kg` : 'Thực đơn chưa cấu hình'}${week ? ` · Tuần ${activeWeek}` : ''}</p></div><strong class="text-right text-base font-bold text-[#00602e]">${moneyLabel(price)}</strong><button data-fb-demo-edit-box="${escapeHtml(box.id)}" type="button" class="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-[#e7f3e7] px-3 text-sm font-semibold text-[#176b36] hover:bg-[#d8edda]"><span class="material-symbols-outlined text-base">edit</span>Chỉnh sửa</button></article>`
      }).join('')
      const listView = `<div class="space-y-3">${boxCards || `<div class="rounded-xl border border-dashed border-[#cddccc] bg-white p-8 text-center"><p class="font-semibold text-[#35463a]">Chưa có Farm Box phù hợp với ${sizeTabs.find((tab) => tab.key === activeSize)?.label.toLocaleLowerCase('vi-VN')}.</p><p class="mt-1 text-sm text-[#738075]">${activeSize === 'nho' ? 'Giá gói cần nhỏ hơn 199.000đ.' : activeSize === 'vua' ? 'Giá gói cần từ 199.000đ và nhỏ hơn 300.000đ.' : 'Giá gói cần từ 300.000đ trở lên.'}</p></div>`}</div>`
      const mainView = selectedBox ? renderEditor() : showWeekSelector ? renderWeekSelector() : listView
      dialog.innerHTML = `<div class="flex shrink-0 items-start justify-between gap-4 border-b border-[#e1e9df] bg-white px-6 py-5"><div><span class="text-sm font-bold uppercase tracking-[0.12em] text-[#1b723b]">Cấu hình Farm Box</span><h2 id="farmbox-demo-title" class="mt-1 text-2xl font-bold text-[#183a26]">Sửa thực đơn · Tuần ${activeWeek}</h2><p class="mt-1 text-sm text-[#657267]">${selectedBox ? 'Điều chỉnh tên, thực đơn và giá của Farm Box đã chọn.' : 'Chọn cỡ hộp để xem các gói và giá hiện có trong MongoDB.'}</p></div><button data-fb-demo-close type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#5d6c60] hover:bg-[#eef5ed]" aria-label="Đóng"><span class="material-symbols-outlined">close</span></button></div>
        <div data-fb-demo-scroll class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 pb-8"><div class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9ead8] bg-[#eaf5e9] px-4 py-3 text-sm text-[#35533d]"><span><strong>Lưu trực tiếp:</strong> cấu hình sẽ được ghi vào MongoDB khi bạn bấm lưu.</span><span class="text-sm">${farmBoxes.length} Farm Box · ${catalog.length} nông sản từ MongoDB</span></div><div class="mb-6 flex flex-wrap gap-2">${tabs}</div>${catalog.length ? '' : '<div class="mb-4 rounded-xl bg-[#fff4df] p-3 text-sm text-[#805600]">Chưa tải được danh sách nông sản. Kiểm tra API rồi mở lại.</div>'}${mainView}${saveMessage ? `<p class="mt-4 rounded-lg ${saveIsError ? 'bg-[#fff0ed] text-[#a33127]' : 'bg-[#e5f4e5] text-[#176b36]'} p-3 text-sm font-semibold">${escapeHtml(saveMessage)}</p>` : ''}</div>
        <footer class="flex shrink-0 items-center justify-between gap-3 border-t border-[#e1e9df] bg-white px-6 py-4"><span class="text-sm text-[#748076]">${selectedBox ? 'Giá tự tính = tổng (đơn giá MongoDB × khối lượng)' : showWeekSelector ? `Sẽ hiển thị ${selectedWeekBoxIds.size} Farm Box trong tuần này` : 'Giá nhỏ < 199.000đ · vừa ≥ 199.000đ đến < 300.000đ · lớn ≥ 300.000đ'}</span><div class="flex gap-2"><button data-fb-demo-close type="button" class="h-10 rounded-xl border border-[#cbd9cb] px-4 text-sm font-semibold text-[#455548]">Đóng</button>${!selectedBox ? `<button data-fb-demo-week-toggle type="button" class="h-10 rounded-xl border border-[#176b36] px-4 text-sm font-semibold text-[#176b36]">${showWeekSelector ? 'Quay lại danh sách' : 'Chọn Farm Box cho tuần'}</button>` : ''}${selectedBox ? '<button data-fb-demo-save type="button" class="h-10 rounded-xl bg-[#00602e] px-5 text-sm font-semibold text-white hover:bg-[#005226]">Lưu</button>' : showWeekSelector ? '<button data-fb-demo-save-week type="button" class="h-10 rounded-xl bg-[#00602e] px-5 text-sm font-semibold text-white hover:bg-[#005226]">Xác nhận lựa chọn</button>' : ''}</div></footer>`
      if (selectedBox) {
        const priceLabel = dialog.querySelector('[data-fb-demo-price]')?.closest('label')
        const priceColumn = priceLabel?.parentElement
        if (priceColumn && priceLabel) {
          const bookedBoxes = Number(selectedWeek?.bookedBoxes) || 0
          const minimum = Math.max(1, bookedBoxes)
          const quota = document.createElement('div')
          quota.className = 'mb-4 rounded-xl border border-[#dce8dc] bg-[#f5faf4] p-3'
          quota.innerHTML = `<div class="mb-2 flex items-center justify-between gap-2"><label for="farmbox-max-boxes" class="text-sm font-semibold text-[#35463a]">Số lượng hộp tối đa</label><span class="text-xs text-[#6b786d]">Đã đặt: ${bookedBoxes}</span></div><div class="flex h-11 items-center gap-2"><button data-fb-demo-maxbox-action="decrease" type="button" ${Number(draft.maxBoxes) <= minimum ? 'disabled' : ''} class="grid h-9 w-9 place-items-center rounded-lg bg-white text-[#405346] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Giảm số hộp"><span class="material-symbols-outlined">remove</span></button><input id="farmbox-max-boxes" data-fb-demo-maxboxes type="text" inputmode="numeric" pattern="[0-9]*" value="${Math.max(minimum, Math.floor(Number(draft.maxBoxes) || 60))}" class="h-9 min-w-0 flex-1 rounded-lg border border-[#d4e0d3] bg-white px-3 text-center text-base font-bold text-[#176b36]"/><button data-fb-demo-maxbox-action="increase" type="button" class="grid h-9 w-9 place-items-center rounded-lg bg-white text-[#405346]" aria-label="Tăng số hộp"><span class="material-symbols-outlined">add</span></button></div><p class="mt-2 text-xs text-[#6b786d]">${selectedWeek ? 'Áp dụng cho tuần đang chỉnh sửa.' : 'Sẽ dùng làm số hộp mặc định khi tạo lịch tuần.'}</p>`
          priceColumn.insertBefore(quota, priceLabel)
        }
      }
      dialog.querySelector('[data-fb-demo-scroll]').scrollTop = previousScrollTop
    }
    const open = (week) => {
      activeWeek = Math.max(1, Number(week) || 1)
      activeSize = 'nho'
      selectedBoxId = ''
      selectedBox = null
      selectedWeek = null
      showWeekSelector = false
      selectionInitializedFor = ''
      render()
      modal.classList.remove('hidden')
      modal.classList.add('flex')
      document.body.classList.add('overflow-hidden')
    }
    const handleEditButtonClick = (event) => {
      event.preventDefault()
      event.stopPropagation()
      open(event.currentTarget.dataset.adminFarmboxEdit)
    }
    rows.forEach((row) => {
      row.querySelector('[data-admin-farmbox-edit]')?.addEventListener('click', handleEditButtonClick)
    })
    const close = () => {
      modal.classList.add('hidden')
      modal.classList.remove('flex')
      document.body.classList.remove('overflow-hidden')
      if (refreshFarmBoxesAfterClose) {
        refreshFarmBoxesAfterClose = false
        const token = sessionStorage.getItem('greennovaToken')
        fetch('/api/farm-boxes', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
          .then((response) => response.json())
          .then((payload) => { if (Array.isArray(payload.data)) setFarmBoxes(payload.data) })
          .catch((error) => console.warn('Đã lưu tuần nhưng không thể tải lại danh sách Farm Box:', error))
      }
    }
    const updateItem = (index, transform) => {
      if (!draft.items[index]) return
      transform(draft.items[index])
      saveMessage = ''
      render()
    }
    const handleClick = async (event) => {
      const copyWeekButton = event.target.closest?.('[data-admin-farmbox-copy-week]')
      if (copyWeekButton) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        const weekNumber = Number(copyWeekButton.dataset.adminFarmboxCopyWeek) || 0
        const targetSlot = weekSlots()[weekNumber - 1]
        if (weekNumber < 2 || !targetSlot) return
        const targetKey = dateKey(targetSlot.startDate)
        const targetOffers = (farmBoxes || []).flatMap((box) => (box.weeks || []).filter((week) => dateKey(week.startDate) === targetKey))
        if (targetOffers.some((week) => week.selectedForWeek !== false || Number(week.bookedBoxes) > 0)
          && !window.confirm(`Tuần ${weekNumber} đã có cấu hình hoặc đơn đặt. Sao chép sẽ thay thế danh sách Farm Box, thực đơn, giá và chỉ tiêu của tuần này. Bạn muốn tiếp tục không?`)) return
        const token = sessionStorage.getItem('greennovaToken')
        if (!token) return showCartToast('Phiên đăng nhập quản trị đã hết hạn. Hãy đăng nhập lại.')
        copyWeekButton.disabled = true
        copyWeekButton.classList.add('opacity-60')
        try {
          const response = await fetch('/api/admin/farm-box-week-selections/copy-previous', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ startDate: targetSlot.startDate.toISOString(), endDate: targetSlot.endDate.toISOString() }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'Không thể sao chép cấu hình tuần trước.')
          const refreshed = await fetch('/api/farm-boxes', { headers: { Authorization: `Bearer ${token}` } })
          const refreshedPayload = await refreshed.json().catch(() => ({}))
          if (!refreshed.ok || !Array.isArray(refreshedPayload.data)) throw new Error('Đã sao chép nhưng chưa tải lại được danh sách tuần.')
          setFarmBoxes(refreshedPayload.data)
          showCartToast(payload.message || `Đã sao chép cấu hình tuần ${weekNumber - 1} sang tuần ${weekNumber}.`)
        } catch (error) {
          showCartToast(error.message || 'Không thể sao chép cấu hình tuần trước.')
          copyWeekButton.disabled = false
          copyWeekButton.classList.remove('opacity-60')
        }
        return
      }
      const weekToggleButton = event.target.closest?.('[data-admin-farmbox-week-toggle]')
      if (weekToggleButton) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        const weekNumber = Number(weekToggleButton.dataset.adminFarmboxWeekToggle) || 1
        const slot = weekSlots()[weekNumber - 1]
        const records = (farmBoxes || []).flatMap((box) => (box.weeks || []).filter((week) => (
          dateKey(week.startDate) === dateKey(slot?.startDate) && week.selectedForWeek !== false && week.id
        )))
        if (!records.length) {
          activeWeek = weekNumber
          activeSize = 'nho'
          selectedBox = null
          selectedWeek = null
          selectedBoxId = ''
          showWeekSelector = true
          const slotKey = dateKey(slot?.startDate)
          selectedWeekBoxIds = new Set((farmBoxes || []).filter((box) => (
            box.weeks || []
          ).some((week) => dateKey(week.startDate) === slotKey && week.selectedForWeek !== false)).map((box) => box.id))
          selectionInitializedFor = slotKey
          saveMessage = ''
          render()
          modal.classList.remove('hidden')
          modal.classList.add('flex')
          document.body.classList.add('overflow-hidden')
          return
        }
        const nextStatus = weekToggleButton.dataset.currentStatus === 'Đang mở' ? 'Đã đóng' : 'Đang mở'
        const token = sessionStorage.getItem('greennovaToken')
        weekToggleButton.disabled = true
        try {
          const responses = await Promise.all(records.map((week) => fetch(`/api/admin/farm-box-weeks/${encodeURIComponent(week.id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: nextStatus }),
          })))
          const payloads = await Promise.all(responses.map((response) => response.json().catch(() => ({}))))
          const failedIndex = responses.findIndex((response) => !response.ok)
          if (failedIndex >= 0) throw new Error(payloads[failedIndex].error || 'Không thể cập nhật trạng thái mở bán.')
          records.forEach((week) => { week.status = nextStatus })
          const row = weekToggleButton.closest('tr')
          const statusBadge = row?.children[2]?.querySelector('span')
          const statusDot = statusBadge?.querySelector('span')
          if (statusBadge) {
            statusBadge.lastChild.textContent = ` ${nextStatus}`
            statusBadge.className = `inline-flex items-center gap-1 font-label-sm ${nextStatus === 'Đang mở' ? 'text-primary bg-secondary-fixed/60' : 'text-tertiary bg-tertiary-fixed'} px-2.5 py-1 rounded-full font-semibold`
          }
          if (statusDot) statusDot.className = `w-1.5 h-1.5 rounded-full ${nextStatus === 'Đang mở' ? 'bg-primary' : 'bg-tertiary'} ${weekNumber === 1 ? 'animate-pulse' : ''}`
          weekToggleButton.dataset.currentStatus = nextStatus
          if (nextStatus === 'Đang mở') {
            weekToggleButton.innerHTML = '<span class="material-symbols-outlined text-[17px]">lock</span><span>Khóa mở bán</span>'
            weekToggleButton.className = 'h-9 px-3.5 rounded-lg bg-[#fff0ed] text-[#a33127] font-label-md text-label-md hover:bg-[#ffe2dc] transition-all inline-flex items-center gap-1.5 font-semibold'
          } else {
            weekToggleButton.innerHTML = '<span class="material-symbols-outlined text-[17px]">lock_open</span><span>Kích hoạt mở bán</span>'
            weekToggleButton.className = 'h-9 px-3.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md hover:bg-secondary-container transition-all inline-flex items-center gap-1.5 font-semibold'
          }
        } catch (error) {
          window.alert(error.message || 'Không thể cập nhật trạng thái mở bán.')
        } finally {
          weekToggleButton.disabled = false
        }
        return
      }
      if (event.target === modal || event.target.closest?.('[data-fb-demo-close]')) { close(); return }
      const weekToggle = event.target.closest?.('[data-fb-demo-week-toggle]')
      if (weekToggle) {
        showWeekSelector = !showWeekSelector
        if (showWeekSelector) {
          const slotKey = dateKey(activeSlot().startDate)
          if (selectionInitializedFor !== slotKey) {
            selectedWeekBoxIds = new Set((farmBoxes || []).filter((box) => (
              box.weeks || []
            ).some((week) => dateKey(week.startDate) === slotKey && week.selectedForWeek !== false)).map((box) => box.id))
            selectionInitializedFor = slotKey
          }
        }
        saveMessage = ''
        render()
        return
      }
      const selectAll = event.target.closest?.('[data-fb-demo-select-all]')
      if (selectAll) {
        const activeSizeTab = sizeTabs.find((item) => item.key === activeSize)
        ;(farmBoxes || []).filter((box) => activeSizeTab?.accepts(offerFor(box).price)).forEach((box) => selectedWeekBoxIds.add(box.id))
        render()
        return
      }
      if (event.target.closest?.('[data-fb-demo-select-none]')) {
        const activeSizeTab = sizeTabs.find((item) => item.key === activeSize)
        ;(farmBoxes || []).filter((box) => activeSizeTab?.accepts(offerFor(box).price)).forEach((box) => selectedWeekBoxIds.delete(box.id))
        render()
        return
      }
      const saveWeekButton = event.target.closest?.('[data-fb-demo-save-week]')
      if (saveWeekButton) {
        const slot = activeSlot()
        const selectedEntries = (farmBoxes || []).filter((box) => selectedWeekBoxIds.has(box.id)).map((box) => {
          const offer = offerFor(box)
          const sourceItems = offer.week?.items?.length ? offer.week.items : (box.defaultItems || [])
          return {
            farmBoxId: box.id,
            price: offer.price,
            pricingMode: offer.week?.pricingMode || box.pricingMode || 'manual',
            maxBoxes: offer.week?.maxBoxes || offer.box.defaultMaxBoxes || 60,
            items: sourceItems.map((item) => ({ productId: item.productId, quantity: Number(item.quantity) || 0 })),
          }
        })
        if (selectedEntries.some((entry) => entry.price <= 0)) {
          saveIsError = true
          saveMessage = 'Một Farm Box đang chọn chưa có giá hợp lệ. Hãy bỏ chọn hoặc cập nhật giá trước.'
          render()
          return
        }
        const token = sessionStorage.getItem('greennovaToken')
        if (!token) { saveIsError = true; saveMessage = 'Phiên đăng nhập quản trị đã hết hạn. Hãy đăng nhập lại.'; render(); return }
        saveWeekButton.disabled = true
        saveWeekButton.textContent = 'Đang lưu…'
        try {
          const response = await fetch('/api/admin/farm-box-week-selections', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              startDate: new Date(slot.startDate).toISOString(),
              endDate: new Date(slot.endDate).toISOString(),
              farmBoxes: selectedEntries,
            }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'Không thể lưu lựa chọn Farm Box cho tuần này.')
          refreshFarmBoxesAfterClose = true
          const refreshedResponse = await fetch('/api/farm-boxes', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
          const refreshedPayload = await refreshedResponse.json().catch(() => ({}))
          if (!refreshedResponse.ok || !Array.isArray(refreshedPayload.data)) {
            throw new Error('Đã nhận lựa chọn nhưng chưa tải lại được danh sách. Hãy đóng cửa sổ rồi mở lại để chỉnh sửa.')
          }
          // Keep the open editor modal alive, but refresh its source data so the
          // selected boxes immediately appear in the editable list.
          farmBoxes.splice(0, farmBoxes.length, ...refreshedPayload.data)
          showWeekSelector = false
          selectionInitializedFor = dateKey(slot.startDate)
          saveIsError = false
          saveMessage = payload.message || `Đã lưu ${selectedWeekBoxIds.size} Farm Box cho tuần ${activeWeek}. Bạn có thể chọn Chỉnh sửa ở từng hộp.`
        } catch (error) {
          saveIsError = true
          saveMessage = error.message || 'Lưu lựa chọn Farm Box thất bại.'
        }
        render()
        return
      }
      const tab = event.target.closest?.('[data-fb-demo-tab]')
      if (tab) { activeSize = tab.dataset.fbDemoTab; selectedBox = null; selectedWeek = null; selectedBoxId = ''; saveMessage = ''; render(); return }
      const editBox = event.target.closest?.('[data-fb-demo-edit-box]')
      if (editBox) {
        const offer = matchingOffers().find((entry) => entry.box.id === editBox.dataset.fbDemoEditBox)
        if (offer) loadDraft(offer)
        render()
        return
      }
      if (event.target.closest?.('[data-fb-demo-back]')) { selectedBox = null; selectedWeek = null; selectedBoxId = ''; showWeekSelector = false; saveMessage = ''; render(); return }
      const add = event.target.closest?.('[data-fb-demo-add]')
      if (add) {
        if (!catalog.length) return
        const used = new Set(draft.items.map((item) => item.productId))
        const product = catalog.find((item) => !used.has(item.id)) || catalog[0]
        draft.items.push({ productId: product.id, quantity: Number(product.step) || 0.5 })
        saveMessage = ''
        render()
        return
      }
      const quantityAction = event.target.closest?.('[data-fb-demo-qty-action]')
      if (quantityAction) {
        const index = Number(quantityAction.dataset.fbDemoQtyIndex)
        const step = Math.max(0.001, Number(quantityAction.dataset.fbDemoStep) || 0.5)
        updateItem(index, (item) => {
          const direction = quantityAction.dataset.fbDemoQtyAction === 'increase' ? 1 : -1
          item.quantity = Math.max(0.01, Math.round(((Number(item.quantity) || 0) + direction * step) * 1000) / 1000)
        })
        return
      }
      const remove = event.target.closest?.('[data-fb-demo-remove]')
      if (remove) {
        draft.items.splice(Number(remove.dataset.fbDemoRemove), 1)
        saveMessage = ''
        render()
        return
      }
      const maxBoxesAction = event.target.closest?.('[data-fb-demo-maxbox-action]')
      if (maxBoxesAction) {
        const minimum = Math.max(1, Number(selectedWeek?.bookedBoxes) || 0)
        const direction = maxBoxesAction.dataset.fbDemoMaxboxAction === 'increase' ? 1 : -1
        draft.maxBoxes = Math.max(minimum, Math.floor(Number(draft.maxBoxes) || 60) + direction)
        saveMessage = ''
        render()
        return
      }
      const saveButton = event.target.closest?.('[data-fb-demo-save]')
      if (saveButton) {
        const name = String(draft.boxName || selectedBox?.name || '').trim()
        if (!name) { saveIsError = true; saveMessage = 'Vui lòng nhập tên Farm Box.'; render(); return }
        const price = Math.round(draft.pricingMode === 'manual'
          ? Number(draft.manualPrice) || 0
          : (draft.items || []).reduce((sum, item) => sum + (Number(getProduct(item.productId)?.price) || 0) * (Number(item.quantity) || 0), 0))
        const token = sessionStorage.getItem('greennovaToken')
        if (!token) { saveIsError = true; saveMessage = 'Phiên đăng nhập quản trị đã hết hạn. Hãy đăng nhập lại.'; render(); return }
        saveButton.disabled = true
        saveButton.textContent = 'Đang lưu…'
        try {
          const response = await fetch(`/api/admin/farm-boxes/${encodeURIComponent(selectedBoxId)}/configuration`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name, price, pricingMode: draft.pricingMode,
              maxBoxes: Math.max(Number(selectedWeek?.bookedBoxes) || 0, Math.floor(Number(draft.maxBoxes) || 60), 1),
              weekId: selectedWeekId || undefined,
              startDate: activeSlot().startDate.toISOString(),
              endDate: activeSlot().endDate.toISOString(),
              items: (draft.items || []).map((item) => ({ productId: item.productId, quantity: Number(item.quantity) })),
            }),
          })
          const payload = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(payload.error || 'Không thể lưu cấu hình Farm Box vào MongoDB.')
          const slot = activeSlot()
          const savedWeek = selectedWeek || {
            id: payload.data?.weekId || '', startDate: slot.startDate, endDate: slot.endDate,
            bookedBoxes: 0, selectedForWeek: false, status: 'Sắp mở', items: [],
          }
          savedWeek.name = name
          savedWeek.price = price
          savedWeek.pricingMode = draft.pricingMode
          savedWeek.maxBoxes = Math.max(Number(savedWeek.bookedBoxes) || 0, Math.floor(Number(draft.maxBoxes) || 60), 1)
          savedWeek.items = (draft.items || []).map((item) => ({ ...item, quantity: Number(item.quantity) }))
          if (!selectedWeek) {
            selectedBox.weeks = [...(selectedBox.weeks || []), savedWeek]
            selectedWeek = savedWeek
            selectedWeekId = savedWeek.id
          }
          draft.manualPrice = price
          saveIsError = false
          saveMessage = payload.message || 'Đã lưu cấu hình Farm Box vào MongoDB.'
        } catch (error) {
          saveIsError = true
          saveMessage = error.message || 'Lưu cấu hình Farm Box thất bại.'
        }
        render()
      }
    }
    const handleChange = (event) => {
      const weekChoice = event.target.closest?.('[data-fb-demo-week-choice]')
      if (weekChoice) {
        if (weekChoice.checked) selectedWeekBoxIds.add(weekChoice.dataset.fbDemoWeekChoice)
        else selectedWeekBoxIds.delete(weekChoice.dataset.fbDemoWeekChoice)
        saveMessage = ''
        render()
        return
      }
      const nameInput = event.target.closest?.('[data-fb-demo-name]')
      if (nameInput) {
        draft.boxName = nameInput.value.trim()
        saveMessage = ''
        return
      }
      const productSelect = event.target.closest?.('[data-fb-demo-product]')
      if (productSelect) { updateItem(Number(productSelect.dataset.fbDemoProduct), (item) => { item.productId = productSelect.value }); return }
      const quantityInput = event.target.closest?.('[data-fb-demo-qty]')
      if (quantityInput) { updateItem(Number(quantityInput.dataset.fbDemoQty), (item) => { item.quantity = Math.max(0.01, Number(quantityInput.value) || 0.01) }); return }
      const maxBoxesInput = event.target.closest?.('[data-fb-demo-maxboxes]')
      if (maxBoxesInput) {
        const minimum = Math.max(1, Number(selectedWeek?.bookedBoxes) || 0)
        draft.maxBoxes = Math.max(minimum, Math.floor(Number(maxBoxesInput.value) || minimum))
        saveMessage = ''
        render()
        return
      }
      const modeSelect = event.target.closest?.('[data-fb-demo-mode]')
      if (modeSelect) {
        draft.pricingMode = modeSelect.value
        saveMessage = ''
        render()
        return
      }
      const priceInput = event.target.closest?.('[data-fb-demo-price]')
      if (priceInput) {
        draft.manualPrice = Math.max(0, Number(priceInput.value) || 0)
        saveMessage = ''
        render()
      }
    }
    document.addEventListener('click', handleClick, true)
    modal.addEventListener('change', handleChange)
    return () => {
      document.removeEventListener('click', handleClick, true)
      rows.forEach((row) => row.querySelector('[data-admin-farmbox-edit]')?.removeEventListener('click', handleEditButtonClick))
      modal.removeEventListener('change', handleChange)
      modal.remove()
      document.body.classList.remove('overflow-hidden')
    }
  }, [route.path, screen.bodyHtml, products, farmBoxes])

  useEffect(() => {
    if (route.path !== '/admin/products') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    const loadInventory = async () => {
      try {
        const response = await fetch('/api/admin/inventory?line=Standard', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải tồn kho.')
        setAdminInventory(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể tải tồn kho sản phẩm:', error.message)
      }
    }
    loadInventory()
    const timer = window.setInterval(loadInventory, 120_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/farm-box') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    fetch('/api/admin/farm-box-emergency-options', { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không tải được Farm Box dự phòng.')
        setAdminEmergencyFarmBoxes(Array.isArray(payload.data) ? payload.data : [])
      })
      .catch((error) => { if (error.name !== 'AbortError') showCartToast(error.message) })
    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/imperfect') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    const loadImperfectSummary = async () => {
      try {
        const response = await fetch('/api/admin/combos/summary', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải thống kê combo tuần này.')
        const summary = result.data || {}
        const root = document.getElementById('stitch-screen-root') || document
        const setText = (selector, value) => {
          const element = root.querySelector(selector)
          if (element) element.textContent = String(value)
        }
        const openCount = Number(summary.openComboCount) || 0
        const orderedKg = Number(summary.orderedKg) || 0
        const lowStockCombos = Array.isArray(summary.lowStockCombos) ? summary.lowStockCombos : []
        setText('[data-imperfect-summary-open]', openCount)
        setText('[data-imperfect-summary-kg]', orderedKg.toLocaleString('vi-VN', { maximumFractionDigits: 3 }))
        setText('[data-imperfect-summary-warning-count]', lowStockCombos.length)
        setText('[data-imperfect-week-combo-count]', `${openCount} Gói`)
        setText('[data-imperfect-week-combo-filter="all"]', `Tất cả (${openCount})`)
        const trend = root.querySelector('[data-imperfect-summary-trend]')
        if (trend) trend.classList.add('hidden')
        setText('[data-imperfect-summary-kg-note]', 'Khối lượng trong các đơn combo từ thứ Hai đến Chủ nhật tuần này')
        const warningNote = root.querySelector('[data-imperfect-summary-warning-note]')
        if (warningNote) {
          warningNote.textContent = lowStockCombos.length
            ? lowStockCombos.slice(0, 2).map((combo) => `${combo.name} còn ${combo.availableCombos} combo (ngưỡng ${combo.threshold})`).join(' · ')
            : 'Chưa có combo nào gần hết hàng.'
          warningNote.title = lowStockCombos.map((combo) => `${combo.name}: còn ${combo.availableCombos}, ngưỡng ${combo.threshold}`).join('\n')
        }
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể cập nhật thống kê combo Imperfect:', error.message)
      }
    }
    loadImperfectSummary()
    const timer = window.setInterval(loadImperfectSummary, 30_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, route.folder, screen.bodyHtml, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/imperfect') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    const loadCombos = async () => {
      try {
        const response = await fetch('/api/admin/combos', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải danh sách combo.')
        setAdminImperfectCombos(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể tải danh sách combo Imperfect:', error.message)
      }
    }
    loadCombos()
    const timer = window.setInterval(loadCombos, 30_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, route.folder, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/imperfect') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    const loadIngredients = async () => {
      try {
        const response = await fetch('/api/admin/imperfect-ingredients', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải kho nguyên liệu Imperfect.')
        setAdminImperfectIngredients(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể tải kho nguyên liệu Imperfect:', error.message)
      }
    }
    loadIngredients()
    const timer = window.setInterval(loadIngredients, 30_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, route.folder, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/imperfect') return
    const root = document.getElementById('stitch-screen-root')
    const pool = root?.querySelector('[data-imperfect-ingredient-pool]')
    if (!root || !pool) return
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character])
    const selected = adminImperfectIngredients.filter((entry) => entry.selected)
    pool.innerHTML = selected.length ? selected.map((entry) => {
      const low = entry.availableQty <= 2
      return `<div class="bg-surface-container-lowest p-2 rounded-lg flex flex-col justify-between ${low ? 'bg-error-container/30' : ''}" title="Tồn kho ${entry.quantity} ${escape(entry.unit)} · Có thể dùng ${entry.availableQty} ${escape(entry.unit)}"><div class="flex items-center justify-between gap-1"><span class="font-label-md ${low ? 'text-error font-bold' : 'text-on-surface'} truncate">${escape(entry.name)}</span>${low ? '<span class="w-2 h-2 shrink-0 rounded-full bg-error animate-ping"></span>' : ''}</div><span class="font-price-md ${low ? 'text-error' : 'text-primary'} font-bold mt-1">${Number(entry.availableQty || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} ${escape(entry.unit)}</span></div>`
    }).join('') : '<div class="col-span-full rounded-lg bg-white p-4 text-center text-sm text-on-surface-variant">Chưa chọn nguyên liệu. Bấm “Chọn nguyên liệu” để thêm từ MongoDB.</div>'
    root.querySelectorAll('[data-imperfect-ingredient-count]').forEach((element) => { element.textContent = String(selected.length) })
  }, [route.path, screen.bodyHtml, adminImperfectIngredients])

  useEffect(() => {
    if (route.path !== '/admin/imperfect') return
    const root = document.getElementById('stitch-screen-root')
    const tableBody = root?.querySelector('[data-imperfect-week-combos]')
    if (!root || !tableBody) return
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character])
    const money = (value) => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`
    const weeklyCombos = adminImperfectCombos.filter((combo) => combo.isActive && combo.isPublished)
    tableBody.innerHTML = weeklyCombos.length ? weeklyCombos.map((combo) => {
      const weight = Number(combo.totalWeightKg) || 0
      const stock = Number(combo.availableCombos) || 0
      const threshold = Number(combo.lowStockThreshold) || 0
      const status = stock <= 0 ? 'Hết hàng' : stock < threshold ? 'Sắp hết' : 'Đang bán'
      const statusClass = status === 'Hết hàng'
        ? 'bg-error-container text-error'
        : status === 'Sắp hết'
          ? 'bg-[#FFF3E0] text-[#E65100]'
          : 'bg-[#E8F5E9] text-[#2E7D32]'
      const ingredients = (combo.items || []).map((item) => (
        `<span class="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">${escape(item.name)} · ${Number(item.quantityPerCombo).toLocaleString('vi-VN')} ${escape(item.unit)}</span>`
      )).join('')
      return `<tr class="hover:bg-surface-container-low transition-colors" data-imperfect-combo-row="${escape(combo.id)}">
        <td class="py-3.5 px-3"><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 shadow-xs relative">${combo.image ? `<img class="w-full h-full object-cover" src="${escape(combo.image)}" alt="${escape(combo.name)}" loading="lazy">` : '<span class="material-symbols-outlined flex h-full items-center justify-center text-primary">nutrition</span>'}<span class="absolute bottom-0 right-0 bg-primary-container text-on-primary font-label-sm text-[9px] px-1 rounded-tl">${weight.toLocaleString('vi-VN', { maximumFractionDigits: 3 })}kg</span></div><div class="flex flex-col min-w-0"><span class="font-title-md text-on-surface font-bold truncate">${escape(combo.name)}</span><div class="flex items-center gap-1 mt-1 flex-wrap">${ingredients || '<span class="text-xs text-on-surface-variant">Chưa có thành phần</span>'}</div></div></div></td>
        <td class="py-3.5 px-2 text-center font-title-md text-on-surface font-semibold text-sm">${weight.toLocaleString('vi-VN', { maximumFractionDigits: 3 })} kg</td>
        <td class="py-3.5 px-3"><span class="font-price-md text-primary font-bold text-base leading-tight">${money(combo.price)}</span></td>
        <td class="py-3.5 px-2 text-center text-on-surface-variant">—</td>
        <td class="py-3.5 px-2 text-center"><span class="font-headline-sm ${stock > 0 && stock < threshold ? 'text-error' : 'text-on-surface'} font-bold text-sm">${stock}</span><span class="block font-label-sm text-[10px] text-on-surface-variant">combo</span></td>
        <td class="py-3.5 px-2 text-center"><span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${statusClass} font-label-sm font-bold"><span class="w-1.5 h-1.5 rounded-full bg-current"></span>${status}</span></td>
        <td class="py-3.5 px-3 text-right"><div class="flex items-center justify-end gap-1.5"><button type="button" data-imperfect-combo-edit="${escape(combo.id)}" class="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-xs font-semibold">Sửa</button><button type="button" data-imperfect-combo-preview="${escape(combo.id)}" class="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" title="Xem trước khách hàng"><span class="material-symbols-outlined text-[16px]">visibility</span></button></div></td>
      </tr>`
    }).join('') : '<tr><td colspan="7" class="py-10 text-center text-on-surface-variant">Chưa chọn combo nào cho tuần này. Bấm nút lọc để chọn combo.</td></tr>'

    const count = weeklyCombos.length
    root.querySelectorAll('[data-imperfect-week-combo-count]').forEach((element) => { element.textContent = `${count} Gói` })
    root.querySelectorAll('[data-imperfect-summary-open]').forEach((element) => { element.textContent = String(count) })
    const allFilter = root.querySelector('[data-imperfect-week-combo-filter="all"]')
    if (allFilter) allFilter.textContent = `Tất cả (${count})`
  }, [route.path, screen.bodyHtml, adminImperfectCombos])

  useEffect(() => {
    if (route.path !== '/admin/imperfect') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const closePicker = () => root.querySelector('[data-imperfect-combo-picker-modal]')?.remove()
    const closeIngredientPicker = () => root.querySelector('[data-imperfect-ingredient-picker-modal]')?.remove()
    const closeEditor = () => root.querySelector('[data-imperfect-combo-editor-modal]')?.remove()
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character])
    const handleClick = async (event) => {
      const ingredientPickerButton = event.target.closest?.('[data-imperfect-ingredient-picker]')
      if (ingredientPickerButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        root.querySelector('[data-imperfect-ingredient-picker-modal]')?.remove()
        const modal = document.createElement('div')
        modal.dataset.imperfectIngredientPickerModal = 'true'
        modal.className = 'fixed inset-0 z-[140] flex items-center justify-center bg-[#13251A]/60 p-4 backdrop-blur-sm'
       const choices = adminImperfectIngredients.map((ingredient) => {
          const thumb = ingredient.image
            ? `<img class="h-12 w-12 shrink-0 rounded-lg bg-[#F0F6EF] object-cover" src="${escape(ingredient.image)}" alt="${escape(ingredient.name)}" loading="lazy" onerror="this.outerHTML='<span class=\\'material-symbols-outlined flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E7F4E8] text-[#176B36]\\'>eco</span>'">`
            : `<span class="material-symbols-outlined flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E7F4E8] text-[#176B36]">eco</span>`
          return `<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-[#D9E4D8] p-3 transition hover:border-[#1B723B] hover:bg-[#F4FAF3]"><input data-imperfect-ingredient-select="${escape(ingredient.id)}" type="checkbox" class="h-5 w-5 shrink-0 accent-[#126B38]" ${ingredient.selected ? 'checked' : ''}>${thumb}<span class="min-w-0 flex-1"><strong class="block truncate text-sm text-[#183D28]">${escape(ingredient.name)}</strong><span class="mt-1 block text-xs text-[#68786B]">Tồn khả dụng: ${Number(ingredient.availableQty || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} ${escape(ingredient.unit)}</span></span><span class="shrink-0 text-xs font-semibold text-[#49604E]">${Number(ingredient.quantity || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} ${escape(ingredient.unit)} tổng</span></label>`
        }).join('')
        modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="imperfect-ingredient-picker-title" class="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><header class="flex items-start justify-between border-b border-[#E0E9E0] p-5"><div><h2 id="imperfect-ingredient-picker-title" class="text-xl font-bold text-[#173D28]">Chọn nguyên liệu Imperfect</h2><p class="mt-1 text-sm text-[#627267]">Tồn kho nguyên liệu được đồng bộ tự động với kho sản phẩm.</p></div><button type="button" data-close-imperfect-ingredient-picker class="rounded-lg p-2 text-[#52665A] hover:bg-[#EFF6EF]" aria-label="Đóng"><span class="material-symbols-outlined">close</span></button></header><div class="space-y-2 overflow-y-auto p-5">${choices || '<p class="rounded-xl bg-[#F4F8F2] p-5 text-center text-sm text-[#647469]">Hệ thống chưa có nguyên liệu Imperfect nào khả dụng.</p>'}</div><footer class="flex items-center justify-between border-t border-[#E0E9E0] p-5"><span class="text-xs text-[#68786B]">Danh sách đã chọn sẽ được lưu vào hệ thống.</span><div class="flex gap-2"><button type="button" data-close-imperfect-ingredient-picker class="rounded-lg border border-[#CAD8CB] px-4 py-2.5 text-sm font-semibold text-[#344238]">Hủy</button><button type="button" data-save-imperfect-ingredients class="rounded-lg bg-[#00602E] px-5 py-2.5 text-sm font-semibold text-white">Lưu danh sách</button></div></footer></section>`
          if (modalEvent.target === modal || modalEvent.target.closest('[data-close-imperfect-ingredient-picker]')) modal.remove()
        })
        root.append(modal)
        return
      }
      const saveIngredientsButton = event.target.closest?.('[data-save-imperfect-ingredients]')
      if (saveIngredientsButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const token = sessionStorage.getItem('greennovaToken')
        if (!token) return showCartToast('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.')
        saveIngredientsButton.disabled = true
        saveIngredientsButton.textContent = 'Đang lưu…'
        try {
          const selectedProductIds = [...root.querySelectorAll('[data-imperfect-ingredient-select]:checked')]
            .map((input) => input.dataset.imperfectIngredientSelect)
          const response = await fetch('/api/admin/imperfect-ingredients', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ selectedProductIds }),
          })
          const result = await response.json()
          if (!response.ok) throw new Error(result.error || 'Không thể lưu danh sách nguyên liệu.')
          setAdminImperfectIngredients(Array.isArray(result.data) ? result.data : [])
          root.querySelector('[data-imperfect-ingredient-picker-modal]')?.remove()
          showCartToast('Đã lưu danh sách kho nguyên liệu Imperfect')
        } catch (error) {
          showCartToast(error.message || 'Không thể lưu danh sách nguyên liệu.')
          saveIngredientsButton.disabled = false
          saveIngredientsButton.textContent = 'Lưu danh sách'
        }
        return
      }
      const previewButton = event.target.closest?.('[data-imperfect-combo-preview]')
      if (previewButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const combo = adminImperfectCombos.find((entry) => entry.id === previewButton.dataset.imperfectComboPreview)
        if (!combo) return showCartToast('Không tìm thấy combo cần xem.')
        root.querySelector('[data-imperfect-combo-preview-modal]')?.remove()
        const modal = document.createElement('div')
        modal.dataset.imperfectComboPreviewModal = 'true'
        modal.className = 'fixed inset-0 z-[145] flex items-center justify-center bg-[#13251A]/60 p-4 backdrop-blur-sm'
        const ingredients = (combo.items || []).map((item) => `<li class="flex items-center justify-between gap-3 border-b border-[#E8EFE7] py-2 last:border-0"><span class="text-sm text-[#344238]">${escape(item.name)}</span><span class="shrink-0 text-sm font-semibold text-[#183D28]">${Number(item.quantityPerCombo || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} ${escape(item.unit || '')}</span></li>`).join('')
        modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="imperfect-preview-title" class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><header class="flex items-start justify-between border-b border-[#E0E9E0] p-5"><div><h2 id="imperfect-preview-title" class="text-xl font-bold text-[#173D28]">Thông tin combo</h2><p class="mt-1 text-sm text-[#647469]">Chi tiết được lấy từ dữ liệu MongoDB.</p></div><button type="button" data-close-imperfect-preview class="rounded-lg p-2 text-[#52665A] hover:bg-[#EFF6EF]" aria-label="Đóng"><span class="material-symbols-outlined">close</span></button></header><div class="overflow-y-auto p-5"><img src="${escape(combo.image || '')}" alt="${escape(combo.name || 'Ảnh combo')}" class="max-h-72 w-full rounded-xl bg-[#F1F7F0] object-contain" loading="lazy"><div class="mt-5 flex flex-wrap items-start justify-between gap-3"><div><h3 class="text-lg font-bold text-[#183D28]">${escape(combo.name || 'Chưa có tên')}</h3><p class="mt-1 text-sm text-[#647469]">${Number(combo.totalWeightKg || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} kg · ${(combo.items || []).length} thành phần</p></div><strong class="rounded-lg bg-[#EAF7EA] px-4 py-2 text-lg font-bold text-[#00602E]">${Number(combo.price || 0).toLocaleString('vi-VN')}đ</strong></div><div class="mt-5 grid gap-4"><section class="rounded-xl border border-[#DCE8DB] bg-[#F8FBF7] p-4"><h4 class="text-sm font-bold text-[#183D28]">Mô tả</h4><p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4F5F53]">${escape(combo.description || 'Chưa có mô tả combo trong MongoDB.')}</p></section><section class="rounded-xl border border-[#F0D8B9] bg-[#FFF9F1] p-4"><h4 class="text-sm font-bold text-[#8A4B0A]">Lý do không hoàn hảo</h4><p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#66533D]">${escape(combo.imperfectReason || 'Chưa có thông tin lý do không hoàn hảo trong MongoDB.')}</p></section><section class="rounded-xl border border-[#DCE8DB] p-4"><h4 class="text-sm font-bold text-[#183D28]">Thành phần combo</h4><ul class="mt-2">${ingredients || '<li class="py-2 text-sm text-[#647469]">Chưa có thành phần.</li>'}</ul></section></div></div><footer class="flex justify-end border-t border-[#E0E9E0] p-4"><button type="button" data-close-imperfect-preview class="rounded-lg bg-[#00602E] px-5 py-2.5 text-sm font-semibold text-white">Đóng</button></footer></section>`
        modal.addEventListener('click', (modalEvent) => {
          if (modalEvent.target === modal || modalEvent.target.closest('[data-close-imperfect-preview]')) modal.remove()
        })
        root.append(modal)
        return
      }
      const editButton = event.target.closest?.('[data-imperfect-combo-edit]')
      if (editButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const combo = adminImperfectCombos.find((entry) => entry.id === editButton.dataset.imperfectComboEdit)
        if (!combo) return showCartToast('Không tìm thấy combo cần cấu hình.')
        closeEditor()
        const existingItems = new Map((combo.items || []).map((item) => [String(item.productId), item]))
        const ingredientPool = adminImperfectIngredients.filter((ingredient) => ingredient.selected)
        const ingredients = ingredientPool.map((ingredient) => {
          const existing = existingItems.get(String(ingredient.id))
          const ingredientId = String(ingredient.id)
          return `<div class="grid grid-cols-[24px_minmax(0,1fr)_112px] items-center gap-3 rounded-xl border border-[#E0E9E0] bg-[#F8FBF7] p-3"><input name="componentProductId" value="${escape(ingredientId)}" type="checkbox" ${existing ? 'checked' : ''} class="h-4 w-4 accent-[#126B38]" aria-label="Dùng ${escape(ingredient.name)} trong combo"><span class="min-w-0"><strong class="block truncate text-sm text-[#243D2D]">${escape(ingredient.name)}</strong><small class="text-xs text-[#718075]">Tồn khả dụng ${Number(ingredient.availableQty || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} ${escape(ingredient.unit)}</small></span><label class="text-xs font-semibold text-[#607064]">Định lượng<input name="quantityPerCombo:${escape(ingredientId)}" type="number" min="0.001" step="0.001" value="${Number(existing?.quantityPerCombo) || 1}" class="mt-1 h-10 w-full rounded-lg border border-[#CAD8CB] bg-white px-2 text-sm font-semibold text-[#183D28] outline-none focus:border-[#1B723B]"></label></div>`
        }).join('')
        const modal = document.createElement('div')
        modal.dataset.imperfectComboEditorModal = 'true'
        modal.className = 'fixed inset-0 z-[145] flex items-center justify-center bg-[#13251A]/60 p-4 backdrop-blur-sm'
        modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="imperfect-editor-title" class="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><header class="flex items-start justify-between border-b border-[#E0E9E0] p-5"><div><h2 id="imperfect-editor-title" class="text-xl font-bold text-[#173D28]">Cấu hình combo</h2><p class="mt-1 text-sm text-[#647469]">Thay đổi này sẽ được lưu vào MongoDB.</p></div><button type="button" data-close-imperfect-editor class="rounded-lg p-2 text-[#52665A] hover:bg-[#EFF6EF]" aria-label="Đóng"><span class="material-symbols-outlined">close</span></button></header><form data-imperfect-edit-form="${escape(combo.id)}" class="flex min-h-0 flex-col"><div class="space-y-4 overflow-y-auto p-5"><div class="flex items-center gap-4 rounded-xl bg-[#F1F7F0] p-3"><img src="${escape(combo.image || '')}" alt="${escape(combo.name)}" class="h-16 w-16 rounded-lg bg-white object-cover"><div class="min-w-0"><p class="truncate font-semibold text-[#183D28]">${escape(combo.name)}</p><p class="mt-1 text-sm text-[#5F7064]">${Number(combo.totalWeightKg || 0).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} kg · ${Number(combo.price || 0).toLocaleString('vi-VN')}đ</p></div></div><label class="block text-sm font-semibold text-[#344238]">Tên combo<input name="name" maxlength="160" required value="${escape(combo.name)}" class="mt-1.5 h-11 w-full rounded-lg border border-[#CAD8CB] px-3 outline-none focus:border-[#1B723B]"></label><div class="grid grid-cols-2 gap-3"><label class="block text-sm font-semibold text-[#344238]">Giá bán (đ)<input name="price" type="number" min="0" step="1" required value="${Number(combo.price) || 0}" class="mt-1.5 h-11 w-full rounded-lg border border-[#CAD8CB] px-3 outline-none focus:border-[#1B723B]"></label><label class="block text-sm font-semibold text-[#344238]">Ngưỡng cảnh báo<input name="lowStockThreshold" type="number" min="0" step="1" required value="${Number(combo.lowStockThreshold) || 0}" class="mt-1.5 h-11 w-full rounded-lg border border-[#CAD8CB] px-3 outline-none focus:border-[#1B723B]"></label></div><label class="block text-sm font-semibold text-[#344238]">Thành phần và định lượng (${escape(combo.totalWeightKg ? 'kg' : 'đơn vị')})<div class="mt-2 space-y-2">${ingredients || '<p class="rounded-lg bg-[#F5F8F4] p-3 text-sm font-normal text-[#68786B]">Combo chưa có thành phần.</p>'}</div></label><label class="block text-sm font-semibold text-[#344238]">Mô tả / lý do Imperfect<textarea name="imperfectReason" rows="3" maxlength="2000" class="mt-1.5 w-full resize-y rounded-lg border border-[#CAD8CB] p-3 font-normal outline-none focus:border-[#1B723B]">${escape(combo.description || '')}</textarea></label><div class="grid gap-2 sm:grid-cols-2"><label class="flex items-center gap-2 rounded-lg bg-[#F4F8F2] p-3 text-sm text-[#344238]"><input name="isActive" type="checkbox" class="h-4 w-4 accent-[#126B38]" ${combo.isActive ? 'checked' : ''}> Đang hoạt động / được phép bán</label><label class="flex items-center gap-2 rounded-lg bg-[#F4F8F2] p-3 text-sm text-[#344238]"><input name="isPublished" type="checkbox" class="h-4 w-4 accent-[#126B38]" ${combo.isPublished ? 'checked' : ''}> Có trong danh sách tuần này</label></div></div><footer class="flex justify-end gap-2 border-t border-[#E0E9E0] p-4"><button type="button" data-close-imperfect-editor class="rounded-lg border border-[#CAD8CB] px-4 py-2.5 text-sm font-semibold text-[#344238]">Hủy</button><button type="submit" class="rounded-lg bg-[#00602E] px-5 py-2.5 text-sm font-semibold text-white">Lưu cấu hình</button></footer></form></section>`
        const componentLabel = [...modal.querySelectorAll('form label')].find((label) => normalizeLabel(label.textContent).includes('thanh phan va dinh luong'))
        if (componentLabel) {
          componentLabel.firstChild.textContent = 'Chọn nguyên liệu từ kho Imperfect đang có và nhập định lượng'
          const componentList = componentLabel.querySelector('div')
          if (componentList && !ingredientPool.length) componentList.innerHTML = '<p class="rounded-lg bg-[#FFF4E5] p-3 text-sm font-normal text-[#87531A]">Kho nguyên liệu chưa có sản phẩm nào được chọn. Hãy chọn nguyên liệu ở mục Kho Nguyên Liệu Imperfect trước.</p>'
        }
        modal.addEventListener('click', (modalEvent) => {
          if (modalEvent.target === modal || modalEvent.target.closest('[data-close-imperfect-editor]')) closeEditor()
        })
        root.append(modal)
        return
      }
      const openButton = event.target.closest?.('[data-imperfect-week-combo-picker]')
      if (openButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        closePicker()
        const modal = document.createElement('div')
        modal.dataset.imperfectComboPickerModal = 'true'
        modal.className = 'fixed inset-0 z-[140] flex items-center justify-center bg-[#13251A]/60 p-4 backdrop-blur-sm'
        const choices = adminImperfectCombos.map((combo) => {
          const weight = Number(combo.totalWeightKg) || 0
          const disabled = !combo.isActive
          return `<label class="flex cursor-pointer items-center gap-4 rounded-xl border border-[#D9E4D8] p-3 transition hover:border-[#1B723B] hover:bg-[#F4FAF3] ${disabled ? 'opacity-60' : ''}"><input data-week-combo-select="${escape(combo.id)}" type="checkbox" class="h-5 w-5 shrink-0 accent-[#126B38]" ${combo.isPublished ? 'checked' : ''} ${disabled ? 'disabled' : ''}><img class="h-16 w-16 shrink-0 rounded-lg bg-[#F0F6EF] object-cover" src="${escape(combo.image)}" alt="${escape(combo.name)}" loading="lazy"><span class="min-w-0 flex-1"><strong class="block truncate text-sm text-[#183D28]">${escape(combo.name)}</strong><span class="mt-1 block text-xs text-[#68786B]">${weight.toLocaleString('vi-VN', { maximumFractionDigits: 3 })} kg · ${Number(combo.items?.length) || 0} thành phần${disabled ? ' · Đang ngưng bán' : ''}</span></span><strong class="shrink-0 text-sm font-bold text-[#00602E]">${Number(combo.price || 0).toLocaleString('vi-VN')}đ</strong></label>`
        }).join('')
        modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="week-combo-picker-title" class="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><header class="flex items-start justify-between border-b border-[#E0E9E0] p-5"><div><h2 id="week-combo-picker-title" class="text-xl font-bold text-[#173D28]">Chọn combo cho tuần này</h2><p class="mt-1 text-sm text-[#627267]">Chọn các combo sẽ hiển thị trong danh sách tuần này.</p></div><button type="button" data-close-week-combo-picker class="rounded-lg p-2 text-[#52665A] hover:bg-[#EFF6EF]" aria-label="Đóng"><span class="material-symbols-outlined">close</span></button></header><div class="space-y-2 overflow-y-auto p-5">${choices || '<p class="rounded-xl bg-[#F4F8F2] p-5 text-center text-sm text-[#647469]">MongoDB chưa có combo nào.</p>'}</div><footer class="flex items-center justify-between border-t border-[#E0E9E0] p-5"><span class="text-xs text-[#68786B]">Lựa chọn sẽ được lưu vào MongoDB.</span><div class="flex gap-2"><button type="button" data-close-week-combo-picker class="rounded-lg border border-[#CAD8CB] px-4 py-2.5 text-sm font-semibold text-[#344238]">Hủy</button><button type="button" data-save-week-combos class="rounded-lg bg-[#00602E] px-5 py-2.5 text-sm font-semibold text-white">Lưu danh sách tuần</button></div></footer></section>`
        modal.addEventListener('click', (modalEvent) => {
          if (modalEvent.target === modal || modalEvent.target.closest('[data-close-week-combo-picker]')) closePicker()
        })
        root.append(modal)
        return
      }
      const saveButton = event.target.closest?.('[data-save-week-combos]')
      if (saveButton) {
      event.preventDefault()
      event.stopImmediatePropagation()
      const token = sessionStorage.getItem('greennovaToken')
      if (!token) return showCartToast('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.')
      saveButton.disabled = true
      saveButton.textContent = 'Đang lưu…'
      try {
        const selected = new Set([...root.querySelectorAll('[data-week-combo-select]:checked')].map((input) => input.dataset.weekComboSelect))
        const updates = adminImperfectCombos.filter((combo) => combo.isActive && Boolean(combo.isPublished) !== selected.has(combo.id))
        for (const combo of updates) {
          const response = await fetch(`/api/admin/combos/${encodeURIComponent(combo.id)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ isPublished: selected.has(combo.id) }),
          })
          const result = await response.json()
          if (!response.ok) throw new Error(result.error || `Không thể cập nhật ${combo.name}.`)
        }
        setAdminImperfectCombos((current) => current.map((combo) => combo.isActive
          ? { ...combo, isPublished: selected.has(combo.id) }
          : combo))
        closePicker()
        showCartToast('Đã lưu danh sách combo tuần này')
      } catch (error) {
        showCartToast(error.message || 'Không thể lưu danh sách combo tuần này.')
        saveButton.disabled = false
        saveButton.textContent = 'Lưu danh sách tuần'
      }
      }
    }
    const handleSubmit = async (event) => {
      const form = event.target.closest?.('[data-imperfect-edit-form]')
      if (!form) return
      event.preventDefault()
      event.stopImmediatePropagation()
      const combo = adminImperfectCombos.find((entry) => entry.id === form.dataset.imperfectEditForm)
      const submit = form.querySelector('button[type="submit"]')
      if (!combo || !submit) return
      submit.disabled = true
      submit.textContent = 'Đang lưu…'
      try {
        const formData = new FormData(form)
        const items = [...form.querySelectorAll('[name="componentProductId"]:checked')].map((checkbox) => ({
          productId: checkbox.value,
          quantityPerCombo: Number(formData.get(`quantityPerCombo:${checkbox.value}`)),
        }))
        if (!items.length) {
          showCartToast('Hãy chọn ít nhất một nguyên liệu từ kho Imperfect.')
          submit.disabled = false
          submit.textContent = 'Lưu cấu hình'
          return
        }
        const body = {
          name: String(formData.get('name') || '').trim(),
          price: Number(formData.get('price')),
          lowStockThreshold: Number(formData.get('lowStockThreshold')),
          imperfectReason: String(formData.get('imperfectReason') || '').trim(),
          isActive: formData.get('isActive') === 'on',
          isPublished: formData.get('isPublished') === 'on',
          items,
        }
        const token = sessionStorage.getItem('greennovaToken')
        const response = await fetch(`/api/admin/combos/${encodeURIComponent(combo.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể lưu cấu hình combo.')
        const refreshed = await fetch('/api/admin/combos', { headers: { Authorization: `Bearer ${token}` } })
        const refreshedPayload = await refreshed.json()
        if (!refreshed.ok) throw new Error(refreshedPayload.error || 'Đã lưu nhưng không tải lại được danh sách combo.')
        setAdminImperfectCombos(Array.isArray(refreshedPayload.data) ? refreshedPayload.data : [])
        closeEditor()
        showCartToast('Đã lưu cấu hình combo')
      } catch (error) {
        showCartToast(error.message || 'Không thể lưu cấu hình combo.')
        submit.disabled = false
        submit.textContent = 'Lưu cấu hình'
      }
    }
    root.addEventListener('click', handleClick)
    root.addEventListener('submit', handleSubmit)
    return () => {
      root.removeEventListener('click', handleClick)
      root.removeEventListener('submit', handleSubmit)
      closePicker()
      closeIngredientPicker()
      closeEditor()
    }
  }, [route.path, screen.bodyHtml, adminImperfectCombos, adminImperfectIngredients])

  useEffect(() => {
    if (!adminProductSummary || route.path !== '/admin/products') return
    const total = Number(adminProductSummary.totalProducts) || 0
    const selling = Number(adminProductSummary.sellingProducts) || 0
    const unavailable = Number(adminProductSummary.unavailableProducts) || 0
    const stock = Number(adminProductSummary.totalQuantity) || 0
    document.querySelectorAll('[data-product-summary-total]').forEach((element) => { element.textContent = String(total) })
    const sellingElement = document.querySelector('[data-product-summary-selling]')
    const unavailableElement = document.querySelector('[data-product-summary-unavailable]')
    const stockElement = document.querySelector('[data-product-summary-stock]')
    const unavailableNames = document.querySelector('[data-product-summary-unavailable-names]')
    if (sellingElement) sellingElement.textContent = String(selling)
    if (unavailableElement) unavailableElement.textContent = String(unavailable).padStart(2, '0')
    if (stockElement) stockElement.textContent = stock.toLocaleString('vi-VN', { maximumFractionDigits: 3 })
    if (unavailableNames) {
      const names = Array.isArray(adminProductSummary.unavailableNames) ? adminProductSummary.unavailableNames : []
      const text = names.slice(0, 3).join(', ') || 'Không có sản phẩm'
      unavailableNames.textContent = text
      unavailableNames.title = names.join(', ') || text
    }
  }, [adminProductSummary, route.path, route.folder])

  useEffect(() => {
    if (route.path !== '/admin/products') return
    const searchInput = document.querySelector('[data-admin-product-search]')
    if (searchInput && searchInput.value !== adminProductSearch) searchInput.value = adminProductSearch
    const categorySelect = document.querySelector('[data-admin-product-filter="category"]')
    const farmSelect = document.querySelector('[data-admin-product-filter="farm"]')
    const setOptions = (select, firstLabel, values, selected) => {
      if (!select) return
      const options = [`<option value="">${firstLabel}</option>`, ...values.map((value) => (
        `<option value="${String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])}"${normalizeLabel(value) === normalizeLabel(selected) && selected ? ' selected' : ''}>${String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])}</option>`
      ))]
      const signature = options.join('')
      if (select.dataset.optionsSignature !== signature) {
        select.innerHTML = signature
        select.dataset.optionsSignature = signature
      }
      select.value = values.find((value) => normalizeLabel(value) === normalizeLabel(selected)) || ''
    }
    const categories = [...new Set(products.map((product) => String(product.categoryName || product.category || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))
    const farms = [...new Set(products.map((product) => String(product.farm || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'))
    setOptions(categorySelect, 'Tất cả danh mục', categories, adminProductCategory)
    setOptions(farmSelect, 'Tất cả nông trại', farms, adminProductFarm)
    const tableBody = document.querySelector('[data-admin-standard-products]')
    if (!tableBody) return
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character])
    const money = (value) => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`
    const formatQuantity = (value) => Number(value || 0).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 3 })
    if (!products.length) {
      tableBody.innerHTML = '<tr><td colspan="9" class="py-8 px-4 text-center text-on-surface-variant">Đang tải sản phẩm từ MongoDB…</td></tr>'
      document.querySelectorAll('[data-product-list-range]').forEach((element) => { element.textContent = '0 - 0' })
      document.querySelectorAll('[data-product-list-total]').forEach((element) => { element.textContent = '0' })
      document.querySelectorAll('[data-product-list-count]').forEach((element) => { element.textContent = '0' })
      const pages = document.querySelector('[data-admin-product-pages]')
      if (pages) pages.innerHTML = ''
      const previous = document.querySelector('[data-admin-product-prev]')
      const next = document.querySelector('[data-admin-product-next]')
      if (previous) previous.disabled = true
      if (next) next.disabled = true
      return
    }
    const filteredProducts = getAdminFilteredProducts(products, adminInventory, {
      search: adminProductSearch,
      category: adminProductCategory,
      farm: adminProductFarm,
      status: adminProductStockStatus,
    })
    const pageCount = Math.max(1, Math.ceil(filteredProducts.length / 10))
    const currentPage = Math.min(Math.max(1, adminProductPage), pageCount)
    if (currentPage !== adminProductPage) setAdminProductPage(currentPage)
    const inventoryById = new Map(adminInventory.map((record) => [record.productId, record]))
    tableBody.innerHTML = filteredProducts.length
      ? filteredProducts.slice((currentPage - 1) * 10, currentPage * 10).map((product) => {
      const inventoryRecord = inventoryById.get(product.id)
      const quantity = Number(inventoryRecord?.quantity ?? product.stock) || 0
      const reservedQty = Number(inventoryRecord?.reservedQty) || 0
      const saleStatus = product.saleStatus || product.status
      const isSelling = saleStatus === 'Đang bán' && quantity > 0
      const isLowStock = isSelling && quantity <= 5
      const statusLabel = saleStatus !== 'Đang bán' ? 'Ngưng bán' : quantity <= 0 ? 'Hết hàng' : isLowStock ? 'Sắp hết' : 'Đang bán'
      const isUnavailable = saleStatus !== 'Đang bán' || quantity <= 0
      const rowClass = isUnavailable
        ? 'opacity-60 grayscale bg-surface-container-low/20 hover:bg-surface-container-low/50'
        : 'hover:bg-surface-container-low/50'
      const imageClass = isUnavailable ? 'opacity-75' : ''
      const statusClass = statusLabel === 'Sắp hết'
        ? 'bg-red-100 text-red-700 animate-pulse'
        : statusLabel === 'Đang bán'
          ? 'bg-secondary-container text-primary'
          : statusLabel === 'Hết hàng'
            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
            : 'bg-error-container text-error'
      const statusDot = statusLabel === 'Sắp hết' ? 'bg-red-600 animate-ping' : statusLabel === 'Đang bán' ? 'bg-primary' : statusLabel === 'Hết hàng' ? 'bg-tertiary' : 'bg-error'
      const image = product.image || ''
      const unit = product.unit || 'kg'
      return `<tr data-admin-product-row="${escape(product.id)}" class="${rowClass} transition-colors">
        <td class="py-3.5 px-4 text-center"><input class="row-checkbox w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" type="checkbox"/></td>
        <td class="py-3.5 px-4 text-center"><div class="w-12 h-12 rounded-lg overflow-hidden bg-surface-container shadow-inner ${imageClass} mx-auto">${image ? `<img class="w-full h-full object-cover" alt="${escape(product.name)}" src="${escape(image)}"/>` : '<div class="w-full h-full flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined">nutrition</span></div>'}</div></td>
        <td class="py-3.5 px-6"><div class="flex flex-col"><span class="font-title-md text-title-md ${isSelling ? 'text-on-surface' : 'text-on-surface/80'} font-bold">${escape(product.name)}</span><span class="font-label-sm text-label-sm text-primary font-medium flex items-center gap-1 mt-0.5"><span class="material-symbols-outlined text-[13px]">verified</span>VietGAP chuẩn</span></div></td>
        <td class="py-3.5 px-4 w-48 min-w-[180px]"><span class="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">${escape(product.categoryName || product.category || 'Khác')}</span></td>
        <td class="py-3.5 px-4 w-40 min-w-[140px] max-w-[160px] font-body-sm text-body-sm text-on-surface-variant font-medium">${escape(product.farm || '—')}</td>
        <td class="py-3.5 px-4 text-right"><span class="font-price-md text-price-md text-on-surface font-bold">${money(product.price)}</span><span class="font-body-sm text-body-sm text-on-surface-variant block">/${escape(unit)}</span></td>
        <td class="py-3.5 px-4"><div class="flex items-center justify-center"><div class="inline-flex items-center bg-surface-container-low rounded-xl p-1 shadow-sm"><button data-inventory-step="-1" data-product-id="${escape(product.id)}" class="w-7 h-7 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-xs" type="button" aria-label="Giảm tồn kho"><span class="material-symbols-outlined text-[16px]">remove</span></button><input data-inventory-quantity-input="${escape(product.id)}" data-inventory-unit="${escape(unit)}" data-inventory-original="${formatQuantity(quantity)}" data-inventory-reserved="${formatQuantity(reservedQty)}" class="w-16 text-center bg-transparent font-price-md text-price-md font-bold text-on-surface focus:outline-none" type="text" inputmode="decimal" aria-label="Tồn kho ${escape(product.name)}" value="${formatQuantity(quantity)} ${escape(unit)}"/><button data-inventory-step="1" data-product-id="${escape(product.id)}" class="w-7 h-7 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface flex items-center justify-center transition-colors shadow-xs" type="button" aria-label="Tăng tồn kho"><span class="material-symbols-outlined text-[16px]">add</span></button></div></div></td>
        <td class="py-3.5 px-4 text-center"><span data-status-cycle-row="true" class="inline-flex items-center"><span data-status-cycle-label="primary" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusClass} font-label-sm text-label-sm font-bold"><span class="w-2 h-2 rounded-full ${statusDot}"></span>${statusLabel}</span>${product.isRestocking && !isLowStock ? '<span data-status-cycle-label="restocking" style="display:none" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold"><span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>Đang nhập kho</span>' : ''}</span></td>
        <td class="py-3.5 px-4"><div class="flex items-center justify-center gap-1"><button data-edit-admin-product="${escape(product.id)}" class="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors" title="Chỉnh trạng thái" type="button"><span class="material-symbols-outlined text-[18px]">edit</span></button><button data-view-admin-product="${escape(product.id)}" class="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors" title="Xem mô tả" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span></button><button data-delete-admin-product="${escape(product.id)}" class="w-8 h-8 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error flex items-center justify-center transition-colors" title="Xóa" type="button"><span class="material-symbols-outlined text-[18px]">delete</span></button></div></td>
      </tr>`
      }).join('')
      : '<tr><td colspan="9" class="py-10 px-4 text-center text-on-surface-variant">Không tìm thấy nông sản phù hợp.</td></tr>'
    const listRange = document.querySelector('[data-product-list-range]')
    const listTotal = document.querySelector('[data-product-list-total]')
    const rangeStart = filteredProducts.length ? (currentPage - 1) * 10 + 1 : 0
    const rangeEnd = Math.min(currentPage * 10, filteredProducts.length)
    if (listRange) listRange.textContent = `${rangeStart} - ${rangeEnd}`
    if (listTotal) listTotal.textContent = String(filteredProducts.length)
    document.querySelectorAll('[data-product-list-count]').forEach((element) => { element.textContent = String(filteredProducts.length) })
    const pages = document.querySelector('[data-admin-product-pages]')
    if (pages) pages.innerHTML = Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1
      const active = page === currentPage
      return `<button data-admin-product-page="${page}" type="button" class="w-9 h-9 rounded-lg ${active ? 'bg-primary text-on-primary font-bold shadow-sm' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-xs'} font-label-md text-label-md transition-colors">${page}</button>`
    }).join('')
    const previous = document.querySelector('[data-admin-product-prev]')
    const next = document.querySelector('[data-admin-product-next]')
    if (previous) previous.disabled = currentPage <= 1
    if (next) next.disabled = currentPage >= pageCount
  }, [products, adminInventory, adminProductPage, adminProductSearch, adminProductCategory, adminProductFarm, adminProductStockStatus, route.path, screen.bodyHtml])

  useEffect(() => {
    if (route.path !== '/admin/products') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const handleFilters = (event) => {
      const search = event.target.closest?.('[data-admin-product-search]')
      const filter = event.target.closest?.('[data-admin-product-filter]')
      if (search) {
        setAdminProductSearch(search.value)
        setAdminProductPage(1)
      } else if (filter) {
        const value = filter.value
        if (filter.dataset.adminProductFilter === 'category') setAdminProductCategory(value)
        if (filter.dataset.adminProductFilter === 'farm') setAdminProductFarm(value)
        if (filter.dataset.adminProductFilter === 'status') setAdminProductStockStatus(value)
        setAdminProductPage(1)
      }
    }
    root.addEventListener('input', handleFilters)
    root.addEventListener('change', handleFilters)
    return () => {
      root.removeEventListener('input', handleFilters)
      root.removeEventListener('change', handleFilters)
    }
  }, [route.path, screen.bodyHtml])

  useEffect(() => {
    if (route.path !== '/admin/products') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const handleProductPagination = (event) => {
      const numberedPage = event.target.closest?.('[data-admin-product-page]')
      const previous = event.target.closest?.('[data-admin-product-prev]')
      const next = event.target.closest?.('[data-admin-product-next]')
      if (!numberedPage && !previous && !next) return
      event.preventDefault()
      const filteredCount = getAdminFilteredProducts(products, adminInventory, {
        search: adminProductSearch,
        category: adminProductCategory,
        farm: adminProductFarm,
        status: adminProductStockStatus,
      }).length
      const pageCount = Math.max(1, Math.ceil(filteredCount / 10))
      const requestedPage = numberedPage
        ? Number(numberedPage.dataset.adminProductPage)
        : adminProductPage + (previous ? -1 : 1)
      setAdminProductPage(Math.min(pageCount, Math.max(1, requestedPage)))
    }
    root.addEventListener('click', handleProductPagination)
    return () => root.removeEventListener('click', handleProductPagination)
  }, [route.path, screen.bodyHtml, products, adminInventory, adminProductSearch, adminProductCategory, adminProductFarm, adminProductStockStatus, adminProductPage])

  useEffect(() => {
    if (route.path !== '/admin/products') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const closeGuide = () => root.querySelector('[data-stock-guide-modal]')?.remove()
    const handleClick = (event) => {
      const guideButton = event.target.closest?.('[data-stock-guide]')
      if (!guideButton) return
      event.preventDefault()
      closeGuide()
      const modal = document.createElement('div')
      modal.dataset.stockGuideModal = 'true'
      modal.className = 'fixed inset-0 z-[130] flex items-center justify-center bg-[#13251A]/60 p-4 backdrop-blur-sm'
      modal.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="stock-guide-title" class="w-full max-w-[680px] rounded-2xl border border-[#B6D7BD] bg-white p-7 shadow-2xl sm:p-9" style="font-family:'Raleway',sans-serif;color:#183D28">
        <div class="mb-5 flex items-start justify-between gap-4"><div class="flex items-center gap-4"><span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#DDF3DF] text-[#00602E]"><span class="material-symbols-outlined text-[32px]">tips_and_updates</span></span><div><p class="text-sm font-extrabold uppercase tracking-[0.12em] text-[#248047]" style="font-family:'Raleway',sans-serif">Hướng dẫn kho</p><h2 id="stock-guide-title" class="mt-1 text-xl font-extrabold leading-snug text-[#143D26] sm:text-2xl" style="font-family:'Raleway',sans-serif">Cập nhật nhanh lượng tồn kho<br class="hidden sm:block"/> (Fast Inventory Sync)</h2></div></div><button type="button" data-close-stock-guide class="rounded-xl p-2 text-[#496B54] transition hover:bg-[#EAF6EA]" aria-label="Đóng hướng dẫn"><span class="material-symbols-outlined">close</span></button></div>
        <p class="rounded-xl border-l-4 border-[#1F8A4C] bg-[#F0F8F0] p-5 text-base font-semibold italic leading-8 text-[#294A33] sm:text-lg">Bạn có thể trực tiếp điều chỉnh khối lượng tại cột <strong class="text-[#00602E]">“Tồn kho (kg)”</strong> bằng nút tăng/giảm hoặc gõ trực tiếp số liệu. Hệ thống sẽ tự động đồng bộ lên quầy mua sắm người tiêu dùng.</p>
        <div class="mt-6 flex justify-end"><button type="button" data-close-stock-guide class="rounded-xl bg-[#00602E] px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-[#08743C]">Đã hiểu</button></div>
      </section>`
      modal.addEventListener('click', (closeEvent) => {
        if (closeEvent.target === modal || closeEvent.target.closest('[data-close-stock-guide]')) closeGuide()
      })
      root.append(modal)
    }
    const handleKeydown = (event) => {
      if (event.key === 'Escape') closeGuide()
    }
    root.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeydown)
    return () => {
      root.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeydown)
      closeGuide()
    }
  }, [route.path, screen.bodyHtml])

  useEffect(() => {
    if (route.path !== '/admin/products') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const readQuantity = (input) => {
      const unit = String(input.dataset.inventoryUnit || '').trim()
      const match = /^\s*(\d+(?:[.,]\d{1,3})?)\s*(.*?)\s*$/.exec(input.value)
      if (!match) throw new Error('Nhập số lượng tồn kho hợp lệ, ví dụ: 40 kg.')
      const enteredUnit = match[2].trim()
      if (enteredUnit && normalizeLabel(enteredUnit) !== normalizeLabel(unit)) {
        throw new Error(`Đơn vị sản phẩm này là ${unit}. Hãy nhập số lượng kèm đúng đơn vị.`)
      }
      const quantity = Number(match[1].replace(',', '.'))
      if (!Number.isFinite(quantity) || quantity < 0 || quantity > 10000000
        || Math.abs(quantity * 1000 - Math.round(quantity * 1000)) > 1e-7) {
        throw new Error('Tồn kho phải là số không âm, tối đa 3 chữ số thập phân.')
      }
      return quantity
    }
    const formatQuantity = (quantity) => Number(quantity).toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 3 })
    const saveQuantity = async (productId, quantity, input) => {
      const token = sessionStorage.getItem('greennovaToken')
      if (!token) throw new Error('Phiên quản trị đã hết hạn. Hãy đăng nhập lại.')
      const row = input.closest('tr')
      const controls = [...(row?.querySelectorAll('[data-inventory-step], [data-inventory-quantity-input]') || [])]
      controls.forEach((control) => { control.disabled = true })
      try {
        const response = await fetch(`/api/admin/inventory/${encodeURIComponent(productId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity, reason: 'Admin cập nhật tồn kho từ danh sách nông sản' }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể lưu tồn kho.')
        const stock = result.data
        setAdminInventory((current) => {
          const next = current.filter((item) => item.productId !== stock.productId)
          next.push({
            productId: stock.productId,
            quantity: stock.quantity,
            reservedQty: stock.reservedQty,
            availableQty: stock.availableQty,
            name: stock.name,
            unit: stock.unit,
          })
          return next
        })
        input.value = `${formatQuantity(stock.quantity)} ${input.dataset.inventoryUnit || ''}`.trim()
        input.dataset.inventoryOriginal = formatQuantity(stock.quantity)
        try {
          const [catalogResponse, summaryResponse] = await Promise.all([
            fetch('/api/products?line=Standard'),
            fetch('/api/admin/products/summary', { headers: { Authorization: `Bearer ${token}` } }),
          ])
          if (catalogResponse.ok) {
            const catalogPayload = await catalogResponse.json()
            setProducts(Array.isArray(catalogPayload.data) ? catalogPayload.data : [])
          }
          if (summaryResponse.ok) {
            const summaryPayload = await summaryResponse.json()
            setAdminProductSummary(summaryPayload.data)
          }
        } catch (refreshError) {
          console.warn('Đã lưu tồn kho nhưng chưa làm mới được các chỉ số:', refreshError.message)
        }
        showCartToast('Đã cập nhật tồn kho')
      } finally {
        controls.forEach((control) => { control.disabled = false })
      }
    }
    const handleStep = async (event) => {
      const button = event.target.closest?.('[data-inventory-step]')
      if (!button) return
      event.preventDefault()
      event.stopPropagation()
      const productId = button.dataset.productId
      const input = root.querySelector(`[data-inventory-quantity-input="${CSS.escape(productId)}"]`)
      if (!input) return
      try {
        const current = readQuantity(input)
        const next = Math.max(0, current + Number(button.dataset.inventoryStep || 0))
        await saveQuantity(productId, next, input)
      } catch (error) {
        input.value = `${input.dataset.inventoryOriginal || ''} ${input.dataset.inventoryUnit || ''}`.trim()
        showCartToast(error.message || 'Không thể cập nhật tồn kho.')
      }
    }
    const handleEnter = async (event) => {
      const input = event.target.closest?.('[data-inventory-quantity-input]')
      if (!input || event.key !== 'Enter') return
      event.preventDefault()
      event.stopPropagation()
      try {
        const quantity = readQuantity(input)
        await saveQuantity(input.dataset.inventoryQuantityInput, quantity, input)
      } catch (error) {
        input.value = `${input.dataset.inventoryOriginal || ''} ${input.dataset.inventoryUnit || ''}`.trim()
        showCartToast(error.message || 'Không thể cập nhật tồn kho.')
        input.focus()
        input.select()
      }
    }
    root.addEventListener('click', handleStep)
    root.addEventListener('keydown', handleEnter)
    return () => {
      root.removeEventListener('click', handleStep)
      root.removeEventListener('keydown', handleEnter)
    }
  }, [route.path, screen.bodyHtml])

  useEffect(() => {
    if (route.path !== '/admin/products') return undefined
    const tableBody = document.querySelector('[data-admin-standard-products]')
    if (!tableBody) return undefined
    const timer = window.setInterval(() => {
      tableBody.querySelectorAll('[data-status-cycle-row]').forEach((cycle) => {
        const main = cycle.querySelector('[data-status-cycle-label="primary"]')
        const restocking = cycle.querySelector('[data-status-cycle-label="restocking"]')
        if (!main || !restocking) return
        const showRestocking = restocking.style.display === 'none'
        main.style.display = showRestocking ? 'none' : 'inline-flex'
        restocking.style.display = showRestocking ? 'inline-flex' : 'none'
      })
    }, 3000)
    return () => window.clearInterval(timer)
  }, [route.path, screen.bodyHtml, products, adminInventory])

  useEffect(() => {
    if (route.path !== '/admin/products') return undefined
    const root = document.getElementById('stitch-screen-root')
    if (!root) return undefined
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character])
    const closeModal = () => root.querySelector('[data-admin-product-modal]')?.remove()
    const refreshProductData = async () => {
      const token = sessionStorage.getItem('greennovaToken')
      const [catalogResponse, inventoryResponse, summaryResponse] = await Promise.all([
        fetch('/api/products?line=Standard'),
        fetch('/api/admin/inventory?line=Standard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/products/summary', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const [catalog, stock, summary] = await Promise.all([
        catalogResponse.json(), inventoryResponse.json(), summaryResponse.json(),
      ])
      if (!catalogResponse.ok || !inventoryResponse.ok || !summaryResponse.ok) {
        throw new Error(catalog.error || stock.error || summary.error || 'Không thể tải lại dữ liệu sản phẩm.')
      }
      setProducts(Array.isArray(catalog.data) ? catalog.data : [])
      setAdminInventory(Array.isArray(stock.data) ? stock.data : [])
      setAdminProductSummary(summary.data)
    }
    const openModal = (product, mode) => {
      closeModal()
      const modal = document.createElement('div')
      modal.dataset.adminProductModal = 'true'
      modal.className = 'fixed inset-0 z-[120] flex items-center justify-center bg-[#172019]/45 p-4 backdrop-blur-sm'
      const isEdit = mode === 'edit'
      const unit = product.unit || 'kg'
      const status = product.saleStatus || product.status
      modal.innerHTML = `<section role="dialog" aria-modal="true" class="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl">
        <div class="mb-5 flex items-start justify-between gap-3"><div><span class="text-xs font-semibold uppercase tracking-wide text-[#1B723B]">${isEdit ? 'Cập nhật trạng thái' : 'Chi tiết nông sản'}</span><h2 class="mt-1 text-xl font-bold text-[#1F2A22]">${escape(product.name)}</h2></div><button data-admin-modal-close type="button" class="rounded-lg p-2 text-[#667268] hover:bg-[#EEF6EE]" aria-label="Đóng"><span class="material-symbols-outlined">close</span></button></div>
        ${isEdit ? `<form data-admin-product-form="status" data-product-id="${escape(product.id)}" class="space-y-4"><label class="block text-sm font-semibold text-[#344238]">Trạng thái bán<select name="status" class="mt-1.5 h-11 w-full rounded-lg border border-[#CBD7CC] bg-white px-3 text-sm"><option value="Đang bán" ${status === 'Đang bán' ? 'selected' : ''}>Đang bán</option><option value="Không bán" ${status !== 'Đang bán' ? 'selected' : ''}>Ngưng bán</option></select></label><label class="flex cursor-pointer items-center gap-3 rounded-xl bg-[#EFF7EF] p-3 text-sm text-[#344238]"><input type="checkbox" name="isRestocking" class="h-4 w-4 accent-[#1B723B]" ${product.isRestocking ? 'checked' : ''}/><span><strong class="block">Đang nhập kho</strong><small class="text-[#667268]">Có thể bật cùng lúc với Đang bán hoặc Ngưng bán.</small></span></label><div class="flex justify-end gap-2 pt-2"><button data-admin-modal-close type="button" class="rounded-lg border border-[#CBD7CC] px-4 py-2.5 text-sm font-semibold text-[#344238]">Hủy</button><button type="submit" class="rounded-lg bg-[#00602E] px-5 py-2.5 text-sm font-semibold text-white">Lưu trạng thái</button></div></form>` : `<form data-admin-product-form="description" data-product-id="${escape(product.id)}" class="space-y-4"><div class="grid grid-cols-[96px_1fr] gap-4 rounded-xl bg-[#F4F8F2] p-3"><img src="${escape(product.image || '')}" alt="${escape(product.name)}" class="h-24 w-24 rounded-lg object-cover"/><div class="space-y-1 text-sm text-[#56645A]"><p><strong>Danh mục:</strong> ${escape(product.categoryName || product.category || '—')}</p><p><strong>Nông trại:</strong> ${escape(product.farm || '—')}</p><p><strong>Giá:</strong> ${Number(product.price || 0).toLocaleString('vi-VN')}đ/${escape(unit)}</p></div></div><label class="block text-sm font-semibold text-[#344238]">Mô tả sản phẩm<textarea name="description" rows="5" maxlength="2000" class="mt-1.5 w-full resize-y rounded-lg border border-[#CBD7CC] p-3 text-sm font-normal focus:border-[#1B723B] focus:outline-none">${escape(product.description || '')}</textarea><small class="mt-1 block font-normal text-[#78847A]">Tối đa 2.000 ký tự.</small></label><div class="flex justify-end gap-2 pt-2"><button data-admin-modal-close type="button" class="rounded-lg border border-[#CBD7CC] px-4 py-2.5 text-sm font-semibold text-[#344238]">Đóng</button><button type="submit" class="rounded-lg bg-[#00602E] px-5 py-2.5 text-sm font-semibold text-white">Lưu mô tả</button></div></form>`}
      </section>`
      modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.closest('[data-admin-modal-close]')) closeModal()
      })
      root.append(modal)
      modal.querySelector('textarea, select')?.focus()
    }
    const handleClick = async (event) => {
      const editButton = event.target.closest?.('[data-edit-admin-product]')
      const viewButton = event.target.closest?.('[data-view-admin-product]')
      const deleteButton = event.target.closest?.('[data-delete-admin-product]')
      const button = editButton || viewButton || deleteButton
      if (!button) return
      event.preventDefault()
      event.stopPropagation()
      const productId = button.dataset.editAdminProduct || button.dataset.viewAdminProduct || button.dataset.deleteAdminProduct
      const product = products.find((entry) => entry.id === productId)
      if (!product) return showCartToast('Không tìm thấy sản phẩm cần thao tác.')
      if (editButton) return openModal(product, 'edit')
      if (viewButton) return openModal(product, 'view')
      if (!window.confirm(`Xóa “${product.name}” khỏi danh sách bán? Sản phẩm sẽ được lưu trữ để giữ nguyên đơn hàng và dữ liệu Farm Box cũ.`)) return
      const token = sessionStorage.getItem('greennovaToken')
      try {
        const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể xóa sản phẩm.')
        await refreshProductData()
        showCartToast('Đã xóa sản phẩm khỏi danh sách bán')
      } catch (error) {
        showCartToast(error.message || 'Không thể xóa sản phẩm.')
      }
    }
    const handleSubmit = async (event) => {
      const form = event.target.closest?.('[data-admin-product-form]')
      if (!form) return
      event.preventDefault()
      event.stopPropagation()
      const modal = form.closest('[data-admin-product-modal]')
      const product = products.find((entry) => entry.id === form.dataset.productId)
      if (!product) return showCartToast('Không tìm thấy sản phẩm cần cập nhật.')
      const submit = form.querySelector('button[type="submit"]')
      submit.disabled = true
      try {
        const formData = new FormData(form)
        const body = form.dataset.adminProductForm === 'status'
          ? { status: formData.get('status') === 'Đang bán' ? 'Đang bán' : 'Không bán', isRestocking: formData.get('isRestocking') === 'on' }
          : { description: String(formData.get('description') || '') }
        const token = sessionStorage.getItem('greennovaToken')
        const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể cập nhật sản phẩm.')
        closeModal()
        await refreshProductData()
        showCartToast(body.status ? 'Đã lưu trạng thái sản phẩm' : 'Đã lưu mô tả sản phẩm')
      } catch (error) {
        showCartToast(error.message || 'Không thể cập nhật sản phẩm.')
        submit.disabled = false
      }
    }
    root.addEventListener('click', handleClick)
    root.addEventListener('submit', handleSubmit)
    return () => {
      root.removeEventListener('click', handleClick)
      root.removeEventListener('submit', handleSubmit)
      closeModal()
    }
  }, [route.path, screen.bodyHtml, products])

  useEffect(() => {
    if (!isAdminOrdersScreen(route)) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    setAdminWeeklyOrderError('')
    setWeeklyData(null)
    if (!token) {
      setAdminWeeklyOrderError('Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.')
      return undefined
    }
    const controller = new AbortController()
    const loadWeeklyOrderSummary = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        let summary
        let reportError
        try {
          const response = await fetch(`/api/admin/reports/weekly?date=${getLocalDateString(new Date())}`, {
            signal: controller.signal,
            headers,
          })
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error || 'Không thể tải báo cáo tuần.')
          summary = payload.data
        } catch (error) {
          if (error.name === 'AbortError') throw error
          reportError = error
        }

        const hasRequiredSummary = summary
          && ['totalOrders', 'paidOrderCount', 'pendingPaymentOrderCount', 'inTransitOrderCount'].every((key) => Number.isFinite(Number(summary[key])))
        if (!hasRequiredSummary) {
          const ordersResponse = await fetch('/api/admin/orders', { signal: controller.signal, headers })
          const ordersPayload = await ordersResponse.json()
          if (!ordersResponse.ok) throw new Error(ordersPayload.error || reportError?.message || 'Không thể tải danh sách đơn hàng.')

          const now = new Date()
          const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekEnd.getDate() + 7)
          const dateOnly = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          const weekOrders = (Array.isArray(ordersPayload.data) ? ordersPayload.data : []).filter((order) => {
            const createdAt = new Date(order.createdAt)
            return !Number.isNaN(createdAt.getTime()) && createdAt >= weekStart && createdAt < weekEnd
          })
          const activeOrders = weekOrders.filter((order) => order.status !== 'Đã hủy')
          const paidStatuses = ['Đã thanh toán', 'Đang xử lý', 'Đang giao', 'Đã nhận']
          const isPaid = (order) => order.payment?.status === 'Đã thanh toán'
            || (order.paymentMethod !== 'CashOnDelivery' && paidStatuses.includes(order.status))
          const paidOrders = activeOrders.filter(isPaid)
          const pendingOrders = activeOrders.filter((order) => order.status === 'Chờ thanh toán'
            && order.payment?.status !== 'Đã thanh toán'
            && (!order.expiredAt || new Date(order.expiredAt) > now))
          summary = {
            weekStart: dateOnly(weekStart),
            weekEnd: dateOnly(new Date(weekEnd.getTime() - 24 * 60 * 60 * 1000)),
            totalOrders: weekOrders.length,
            paidOrderCount: paidOrders.length,
            paidBankTransferCount: paidOrders.filter((order) => order.paymentMethod !== 'CashOnDelivery').length,
            paidCodCount: paidOrders.filter((order) => order.paymentMethod === 'CashOnDelivery').length,
            pendingPaymentOrderCount: pendingOrders.length,
            inTransitOrderCount: activeOrders.filter((order) => order.status === 'Đang giao').length,
            deliveredOrderCount: activeOrders.filter((order) => order.status === 'Đã nhận').length,
            totals: { revenue: paidOrders.reduce((total, order) => total + (Number(order.totalAmount) || 0), 0) },
          }
        }
        setWeeklyData(summary)
        setAdminWeeklyOrderError('')
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Không thể cập nhật tổng đơn tuần:', error.message)
          setAdminWeeklyOrderError(error.message || 'Không thể tải số liệu đơn hàng.')
        }
      }
    }
    const reloadPage = (event) => {
      const button = event.target.closest?.('button[title="Làm mới dữ liệu"]')
      if (!button) return
      event.preventDefault()
      window.location.reload()
    }
    document.addEventListener('click', reloadPage, true)
    loadWeeklyOrderSummary()
    const timer = window.setInterval(loadWeeklyOrderSummary, 120_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener('click', reloadPage, true)
    }
  }, [route.path, route.folder, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/farm-box') return undefined
    const token = sessionStorage.getItem('greennovaToken')
    const controller = new AbortController()
    if (!token) {
      setAdminFarmBoxIssueOrders([])
      return () => controller.abort()
    }
    const loadFarmBoxIssues = async () => {
      try {
        const response = await fetch('/api/admin/orders', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể tải các yêu cầu Farm Box.')
        setAdminFarmBoxIssueOrders((Array.isArray(payload.data) ? payload.data : []).filter((order) => (
          !['Đã hủy', 'Đang giao', 'Đã nhận'].includes(order.status)
          && (order.items || []).some((item) => item.itemType === 'FarmBox' && !item.cropFailureResolution)
        )))
      } catch (error) {
        if (error.name !== 'AbortError') showCartToast(error.message || 'Không thể tải các yêu cầu Farm Box.')
      }
    }
    loadFarmBoxIssues()
    return () => controller.abort()
  }, [route.path, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin/farm-box') return
    const screenRoot = document.getElementById('stitch-screen-root')
    const contentMain = screenRoot?.querySelector('main') || document.querySelector('main')
    if (!contentMain) return
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
    let section = contentMain.querySelector('[data-admin-farmbox-issues]')
    if (!section) {
      section = document.createElement('section')
      section.dataset.adminFarmboxIssues = 'true'
      section.className = 'mt-8 w-full rounded-2xl border border-[#d6e8d5] bg-[#f1faf1] p-5 sm:p-7'
      contentMain.append(section)
    }
    const productOptions = (selectedId) => `<option value="">Chọn nông sản từ MongoDB</option>${products.map((product) => `<option value="${escape(product.id)}" ${product.id === selectedId ? 'selected' : ''}>${escape(product.name)} · ${money(product.price)}/${escape(product.unit || 'kg')}</option>`).join('')}`
    const emergencyLineAmount = (item) => (Number(products.find((product) => product.id === item.productId)?.price) || 0) * (Number(item.quantity) || 0)
    const emergencyBoxPrice = (box) => Math.round((box.items || []).reduce((sum, item) => sum + emergencyLineAmount(item), 0))
    const emergencyTabs = adminEmergencyFarmBoxes.map((box) => `<button type="button" data-emergency-tab="${escape(box.size)}" class="rounded-full px-5 py-2.5 text-sm font-semibold transition ${adminEmergencyFarmBoxTab === box.size ? 'bg-[#08733a] text-white shadow-sm' : 'bg-white text-[#47584b] hover:bg-[#eaf5e9]'}">${escape(box.label)}</button>`).join('')
    const emergencyCards = adminEmergencyFarmBoxes.filter((box) => box.size === adminEmergencyFarmBoxTab).map((box) => {
      const rows = [...(box.items || []), ...(!box.items?.length ? [{ productId: '', quantity: 1 }] : [])].map((item) => {
        const product = products.find((entry) => entry.id === item.productId)
        const step = getProductQuantityStep(product)
        const unit = product?.unit || 'kg'
        const amount = emergencyLineAmount(item)
        return `<div class="grid grid-cols-[minmax(0,1fr)_150px_40px] items-center gap-2" data-emergency-item-row><select data-emergency-product class="h-10 min-w-0 rounded-lg border border-[#d2e0d0] bg-white px-2 text-sm">${productOptions(item.productId)}</select><div class="flex h-10 items-center gap-1 rounded-lg border border-[#d2e0d0] bg-white p-1"><button data-emergency-qty-action="decrease" data-emergency-step="${step}" type="button" class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#edf6ec] text-[#38543e]" aria-label="Giảm ${step} ${escape(unit)}"><span class="material-symbols-outlined text-base">remove</span></button><input data-emergency-quantity type="number" min="0.01" step="${step}" value="${Number(item.quantity) || 1}" class="h-7 min-w-0 w-full border-0 px-1 text-center text-sm outline-none" aria-label="Số lượng (${escape(unit)})"><button data-emergency-qty-action="increase" data-emergency-step="${step}" type="button" class="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#edf6ec] text-[#38543e]" aria-label="Tăng ${step} ${escape(unit)}"><span class="material-symbols-outlined text-base">add</span></button></div><button data-emergency-remove type="button" class="grid h-10 w-10 place-items-center rounded-lg text-[#a23b31] hover:bg-[#fff0ed]" aria-label="Xóa nông sản"><span class="material-symbols-outlined">delete</span></button><p class="col-span-2 -mt-1 text-right text-xs text-[#657468]">${money(amount)} · ${money(product?.price)}/${escape(unit)} × ${Number(item.quantity) || 0} ${escape(unit)}</p></div>`
      }).join('')
      return `<article class="rounded-xl border border-[#d7e6d6] bg-white p-4" data-emergency-box="${escape(box.size)}"><div class="mb-3 flex items-center justify-between"><h3 class="font-bold text-[#26382b]">Farm Box dự phòng · ${escape(box.label)}</h3><span class="rounded-full bg-[#e8f4e7] px-2.5 py-1 text-xs text-[#176b36]">ID: emergency-${escape(box.size)}</span></div><div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]"><label class="text-xs font-semibold text-[#667569]">Tên Farm Box<input data-emergency-name maxlength="120" value="${escape(box.name || '')}" class="mt-1 h-10 w-full rounded-lg border border-[#d2e0d0] px-3 text-sm font-medium text-[#27392b]" /></label><label class="text-xs font-semibold text-[#667569]">Giá gói · tự tính từ đơn giá<input data-emergency-price type="text" readonly value="${money(emergencyBoxPrice(box))}" class="mt-1 h-10 w-full rounded-lg border border-[#d2e0d0] bg-[#f3f8f2] px-3 text-sm font-bold text-[#176b36]" /></label></div><label class="mt-3 block text-xs font-semibold text-[#667569]">Ảnh Farm Box (URL)<input data-emergency-image value="${escape(box.image || '')}" class="mt-1 h-10 w-full rounded-lg border border-[#d2e0d0] px-3 text-sm" /></label><div class="mt-4 space-y-2" data-emergency-items>${rows}</div><div class="mt-3 flex flex-wrap items-center gap-2"><button data-emergency-add type="button" class="rounded-lg border border-dashed border-[#9fbea1] px-3 py-2 text-sm font-semibold text-[#176b36]">+ Thêm nông sản</button><span class="mr-auto text-sm font-semibold text-[#405346]">Tổng Farm Box: <strong class="text-[#08733a]">${money(emergencyBoxPrice(box))}</strong></span><button data-emergency-save type="button" class="rounded-lg bg-[#08733a] px-4 py-2 text-sm font-semibold text-white">Lưu Farm Box dự phòng</button></div></article>`
    }).join('')
    section.innerHTML = `<header class="mb-5"><p class="text-xs font-bold uppercase tracking-[.15em] text-[#188044]">Farm Box khẩn cấp</p><h2 class="mt-1 text-2xl font-bold text-[#203529]">Cấu hình 3 hộp thay thế cố định</h2><p class="mt-2 text-sm text-[#607066]">Thiết lập sẵn Farm Box dự phòng loại nhỏ, vừa và lớn. Khi có sự cố, khách hàng sẽ thấy hộp đúng cỡ để chọn nhận thay thế hoặc yêu cầu hoàn tiền.</p></header><div class="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Chọn cỡ Farm Box dự phòng">${emergencyTabs}</div><div class="max-w-3xl">${emergencyCards}</div>`
    const saveEmergencyOption = async (event) => {
      const tab = event.target.closest?.('[data-emergency-tab]')
      if (tab) {
        event.preventDefault()
        setAdminEmergencyFarmBoxTab(tab.dataset.emergencyTab)
        return
      }
      const quantityButton = event.target.closest?.('[data-emergency-qty-action]')
      if (quantityButton) {
        event.preventDefault()
        const card = quantityButton.closest('[data-emergency-box]')
        const row = quantityButton.closest('[data-emergency-item-row]')
        const input = row?.querySelector('[data-emergency-quantity]')
        if (!card || !input) return
        const step = Number(quantityButton.dataset.emergencyStep) || 1
        const direction = quantityButton.dataset.emergencyQtyAction === 'increase' ? 1 : -1
        const next = Math.max(0.01, Math.round(((Number(input.value) || 0) + direction * step) * 1000) / 1000)
        const productId = row.querySelector('[data-emergency-product]')?.value || ''
        const product = products.find((entry) => entry.id === productId)
        const rows = [...card.querySelectorAll('[data-emergency-item-row]')].map((entry) => ({
          productId: entry.querySelector('[data-emergency-product]')?.value || '',
          quantity: entry === row ? next : Number(entry.querySelector('[data-emergency-quantity]')?.value) || 1,
          name: products.find((item) => item.id === entry.querySelector('[data-emergency-product]')?.value)?.name || '',
          image: products.find((item) => item.id === entry.querySelector('[data-emergency-product]')?.value)?.image || '',
        }))
        setAdminEmergencyFarmBoxes((current) => current.map((entry) => entry.size === card.dataset.emergencyBox ? { ...entry, name: card.querySelector('[data-emergency-name]')?.value || entry.name, price: emergencyBoxPrice({ items: rows }), image: card.querySelector('[data-emergency-image]')?.value || entry.image, items: rows } : entry))
        if (product) quantityButton.setAttribute('aria-label', `${direction > 0 ? 'Tăng' : 'Giảm'} ${step} ${product.unit || 'kg'}`)
        return
      }
      const add = event.target.closest?.('[data-emergency-add]')
      const remove = event.target.closest?.('[data-emergency-remove]')
      if (add || remove) {
        event.preventDefault()
        const card = event.target.closest('[data-emergency-box]')
        const option = adminEmergencyFarmBoxes.find((entry) => entry.size === card?.dataset.emergencyBox)
        if (!option) return
        const rows = [...card.querySelectorAll('[data-emergency-item-row]')].map((row) => ({ productId: row.querySelector('[data-emergency-product]')?.value || '', quantity: Number(row.querySelector('[data-emergency-quantity]')?.value) || 1 }))
        if (add) rows.push({ productId: '', quantity: 1 })
        else rows.splice(Number(remove.closest('[data-emergency-item-row]')?.rowIndex) || [...card.querySelectorAll('[data-emergency-item-row]')].indexOf(remove.closest('[data-emergency-item-row]')), 1)
        setAdminEmergencyFarmBoxes((current) => current.map((entry) => entry.size === option.size ? {
          ...entry,
          name: card.querySelector('[data-emergency-name]')?.value || entry.name,
          price: emergencyBoxPrice({ items: rows }),
          image: card.querySelector('[data-emergency-image]')?.value || entry.image,
          items: rows,
        } : entry))
        return
      }
      const save = event.target.closest?.('[data-emergency-save]')
      if (!save) return
      event.preventDefault()
      const card = save.closest('[data-emergency-box]')
      const size = card?.dataset.emergencyBox
      const token = sessionStorage.getItem('greennovaToken')
      const body = {
        name: card.querySelector('[data-emergency-name]')?.value || '',
        imageUrl: card.querySelector('[data-emergency-image]')?.value || '',
        items: [...card.querySelectorAll('[data-emergency-item-row]')].map((row) => ({ productId: row.querySelector('[data-emergency-product]')?.value || '', quantity: Number(row.querySelector('[data-emergency-quantity]')?.value) })),
      }
      save.disabled = true
      try {
        const response = await fetch(`/api/admin/farm-box-emergency-options/${encodeURIComponent(size)}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không lưu được Farm Box dự phòng.')
        setAdminEmergencyFarmBoxes((current) => current.map((entry) => entry.size === size ? { ...entry, ...payload.data, image: body.imageUrl, items: body.items.map((item) => ({ ...item, name: products.find((product) => product.id === item.productId)?.name || '', image: products.find((product) => product.id === item.productId)?.image || '' })) } : entry))
        showCartToast(payload.message || 'Đã lưu Farm Box dự phòng.')
      } catch (error) { showCartToast(error.message || 'Không lưu được Farm Box dự phòng.') }
      finally { save.disabled = false }
    }
    const updateEmergencyDraft = (event) => {
      const card = event.target.closest?.('[data-emergency-box]')
      if (!card) return
      const size = card.dataset.emergencyBox
      setAdminEmergencyFarmBoxes((current) => current.map((entry) => {
        if (entry.size !== size) return entry
        const rows = [...card.querySelectorAll('[data-emergency-item-row]')].map((row) => ({
          productId: row.querySelector('[data-emergency-product]')?.value || '',
          quantity: Number(row.querySelector('[data-emergency-quantity]')?.value) || 1,
          name: products.find((product) => product.id === row.querySelector('[data-emergency-product]')?.value)?.name || '',
          image: products.find((product) => product.id === row.querySelector('[data-emergency-product]')?.value)?.image || '',
        }))
        return {
          ...entry,
          name: card.querySelector('[data-emergency-name]')?.value ?? entry.name,
          price: emergencyBoxPrice({ items: rows }),
          image: card.querySelector('[data-emergency-image]')?.value ?? entry.image,
          items: rows,
        }
      }))
    }
    contentMain.addEventListener('click', saveEmergencyOption)
    contentMain.addEventListener('change', updateEmergencyDraft)
    return () => {
      contentMain.removeEventListener('click', saveEmergencyOption)
      contentMain.removeEventListener('change', updateEmergencyDraft)
    }
  }, [route.path, route.folder, screen.bodyHtml, adminEmergencyFarmBoxes, adminEmergencyFarmBoxTab, products])

  useEffect(() => {
    if (!isAdminOrdersScreen(route)) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    setAdminWeekOrdersPage(1)
    setAdminWeekOrders(null)
    setAdminWeekOrdersError('')
    if (!token) {
      setAdminWeekOrdersError('Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.')
      return undefined
    }

    const controller = new AbortController()
    const loadCurrentWeekOrders = async () => {
      try {
        const now = new Date()
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
        const dateOnly = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const query = new URLSearchParams({ from: dateOnly(weekStart), to: dateOnly(now) })
        const response = await fetch(`/api/admin/orders?${query}`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể tải các đơn trong tuần.')
        const sortedOrders = (Array.isArray(payload.data) ? payload.data : [])
          .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
        setAdminWeekOrders(sortedOrders)
        setAdminWeekOrdersError('')
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAdminWeekOrdersError(error.message || 'Không thể tải các đơn trong tuần.')
          setAdminWeekOrders([])
        }
      }
    }

    loadCurrentWeekOrders()
    const timer = window.setInterval(loadCurrentWeekOrders, 60_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, route.folder, authUser?.id])

  useEffect(() => {
    if (!isAdminOrdersScreen(route)) return undefined
    const input = document.querySelector('[data-admin-orders-search]')
    const tableBody = document.querySelector('main table tbody')
    if (!input || !tableBody) return undefined

    const filterOrders = () => {
      const query = normalizeLabel(input.value).trim()
      tableBody.querySelectorAll('tr').forEach((row) => {
        row.hidden = Boolean(query) && !normalizeLabel(row.textContent).includes(query)
      })
    }
    input.addEventListener('input', filterOrders)
    input.addEventListener('search', filterOrders)
    return () => {
      input.removeEventListener('input', filterOrders)
      input.removeEventListener('search', filterOrders)
    }
  }, [route.path, route.folder, screen.bodyHtml])

  useEffect(() => {
    if (!isAdminOrdersScreen(route)) return undefined
    const changePage = (event) => {
      const tab = event.target.closest?.('[data-admin-week-tab]')
      if (tab) {
        event.preventDefault()
        setAdminWeekOrderFilter(tab.dataset.adminWeekTab || 'all')
        setAdminWeekOrdersPage(1)
        return
      }
      const button = event.target.closest?.('[data-admin-orders-page]')
      if (!button || button.disabled) return
      event.preventDefault()
      setAdminWeekOrdersPage(Number(button.dataset.adminOrdersPage) || 1)
    }
    document.addEventListener('click', changePage, true)
    return () => document.removeEventListener('click', changePage, true)
  }, [route.path, route.folder])

  useEffect(() => {
    if (!isAdminOrdersScreen(route) && route.path !== '/admin/farm-box') return undefined
    const handleOrderAction = async (event) => {
      const button = event.target.closest?.('[data-admin-order-action]')
      if (!button || button.disabled) return
      event.preventDefault()
      event.stopImmediatePropagation()
      const token = sessionStorage.getItem('greennovaToken')
      if (!token) {
        showCartToast('Phiên quản trị đã hết hạn. Vui lòng đăng nhập lại.')
        return
      }
      const action = button.dataset.adminOrderAction
      const orderId = button.dataset.orderId
      const isFarmBoxGroupAction = action === 'farmbox-issue-group'
      if ((!orderId && !isFarmBoxGroupAction) || !['confirm-call', 'approve-delivery', 'farmbox-issue', 'farmbox-issue-group'].includes(action)) return
      button.disabled = true
      try {
        if (action === 'farmbox-issue' || isFarmBoxGroupAction) {
          const policy = button.dataset.issuePolicy
          let actionBody
          if (policy === 'cancel') {
            if (!window.confirm('Khách đã chọn hủy Farm Box nếu nông sản gặp sự cố. Hủy phần Farm Box này và hoàn lại 100% giá trị?')) {
              button.disabled = false
              return
            }
            actionBody = { action: 'cancel', itemIndex: Number(button.dataset.itemIndex) }
          } else if (isFarmBoxGroupAction) {
            actionBody = { action: 'replace' }
          } else {
            const catalogResponse = await fetch('/api/products?line=Standard', { headers: { Authorization: `Bearer ${token}` } })
            const catalogPayload = await catalogResponse.json()
            if (!catalogResponse.ok) throw new Error(catalogPayload.error || 'Không thể tải nông sản thay thế.')
            const choices = (Array.isArray(catalogPayload.data) ? catalogPayload.data : [])
              .filter((product) => product.saleStatus === 'Đang bán' && Number(product.quantity) - Number(product.reservedQty) > 0)
              .slice(0, 30)
            if (!choices.length) throw new Error('Hiện không có nông sản đang bán để thay thế.')
            const requiredChoices = 1
            if (choices.length < requiredChoices) throw new Error(`Cần ít nhất ${requiredChoices} nông sản còn hàng để thay thế.`)
            const menu = choices.map((product, index) => `${index + 1}. ${product.name} · ${(Number(product.price) || 0).toLocaleString('vi-VN')}đ/${product.unit || 'kg'}`).join('\n')
            const selection = window.prompt(`Chọn ${requiredChoices} nông sản thay thế khác nhau (không thu thêm phí):\n${menu}\n\nNhập số thứ tự:`)
            if (selection === null) { button.disabled = false; return }
            const selectedIndexes = selection.split(/[\s,;]+/).filter(Boolean).map((value) => Number(value) - 1)
            if (selectedIndexes.length !== requiredChoices || selectedIndexes.some((index) => !Number.isInteger(index) || !choices[index])
              || new Set(selectedIndexes).size !== selectedIndexes.length) throw new Error(`Vui lòng nhập ${requiredChoices} số thứ tự hợp lệ và khác nhau.`)
            const replacements = selectedIndexes.map((index) => choices[index])
            actionBody = { action: 'replace', itemIndex: Number(button.dataset.itemIndex), replacementProductId: replacements[0].id }
          }
          const endpoint = isFarmBoxGroupAction
            ? '/api/admin/farm-box-issues/replace-group'
            : `/api/admin/orders/${encodeURIComponent(orderId)}/farm-box-issue`
          const requestBody = isFarmBoxGroupAction
            ? { weekId: button.dataset.weekId, size: button.dataset.farmboxSize }
            : actionBody
          const response = await fetch(endpoint, {
            method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
          })
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error || 'Không thể xử lý sự cố Farm Box.')
          const updatedOrders = isFarmBoxGroupAction ? payload.data.updatedOrders : [payload.data]
          setAdminWeekOrders((current) => (current || []).map((order) => updatedOrders.find((updated) => updated.id === order.id) || order))
          setAdminFarmBoxIssueOrders((current) => current.map((order) => updatedOrders.find((updated) => updated.id === order.id) || order)
            .filter((order) => (order.items || []).some((item) => item.itemType === 'FarmBox' && !item.cropFailureResolution)))
          showCartToast(payload.message || 'Đã xử lý sự cố Farm Box.')
          return
        }
        const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/${action}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Không thể cập nhật đơn hàng.')
        const updatedOrder = payload.data
        setAdminWeekOrders((current) => (current || []).map((order) => order.id === updatedOrder.id ? updatedOrder : order))
        if (action === 'approve-delivery') {
          setWeeklyData((current) => current ? { ...current, inTransitOrderCount: (Number(current.inTransitOrderCount) || 0) + 1 } : current)
          const dueText = updatedOrder.deliveryDueAt
            ? new Date(updatedOrder.deliveryDueAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' })
            : ''
          showCartToast(dueText ? `Đã duyệt giao xe. Đơn tự chuyển sang “Đã nhận” lúc ${dueText}.` : 'Đã duyệt giao xe.')
        } else {
          showCartToast('Đã xác nhận gọi điện.')
        }
      } catch (error) {
        showCartToast(error.message || 'Không thể cập nhật đơn hàng.')
        button.disabled = false
      }
    }
    document.addEventListener('click', handleOrderAction, true)
    return () => document.removeEventListener('click', handleOrderAction, true)
  }, [route.path, route.folder])

  useEffect(() => {
    if (route.path !== '/admin' && !route.folder.startsWith('qt01')) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    const loadLatestOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders', {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải các đơn hàng mới nhất.')
        const records = Array.isArray(result.data) ? result.data : []
        setAdminLatestOrders(records.slice(0, 5))
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể tải đơn hàng dashboard:', error.message)
      }
    }
    loadLatestOrders()
    const timer = window.setInterval(loadLatestOrders, 120_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, route.folder, authUser?.id])

  useEffect(() => {
    if (route.path !== '/admin' && !route.folder.startsWith('qt01')) return undefined
    const token = sessionStorage.getItem('greennovaToken')
    if (!token) return undefined
    const controller = new AbortController()
    const loadTodaySummary = async () => {
      try {
        const response = await fetch(`/api/admin/reports/daily?date=${getLocalDateString(new Date())}`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải doanh thu hôm nay.')
        setDailyDashboardData(result.data)
      } catch (error) {
        if (error.name !== 'AbortError') console.warn('Không thể cập nhật doanh thu hôm nay:', error.message)
      }
    }
    loadTodaySummary()
    const timer = window.setInterval(loadTodaySummary, 120_000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
    }
  }, [route.path, route.folder, authUser?.id])

  useEffect(() => {
    if (!dailyDashboardData || (route.path !== '/admin' && !route.folder.startsWith('qt01'))) return
    const formatDashboardMoney = (amount) => `${(Number(amount) || 0).toLocaleString('vi-VN')}đ`
    const revenue = document.querySelector('[data-dashboard-revenue-total]')
    const paid = document.querySelector('[data-dashboard-paid-revenue]')
    const cod = document.querySelector('[data-dashboard-cod-revenue]')
    if (revenue) revenue.textContent = formatDashboardMoney(dailyDashboardData.recognizedRevenue)
    if (paid) paid.textContent = formatDashboardMoney(dailyDashboardData.paidRevenue)
    if (cod) cod.textContent = formatDashboardMoney(dailyDashboardData.codPendingRevenue)
  }, [dailyDashboardData, route.path, route.folder])

  useEffect(() => {
    if (!adminLatestOrders || (route.path !== '/admin' && !route.folder.startsWith('qt01'))) return
    const tableBody = document.querySelector('[data-dashboard-latest-orders]')
    if (!tableBody) return
    const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character])
    const money = (value) => `${(Number(value) || 0).toLocaleString('vi-VN')}đ`
    const emptyRow = '<tr><td colspan="7" class="py-8 px-4 text-center text-on-surface-variant">Chưa có đơn hàng.</td></tr>'
    tableBody.innerHTML = adminLatestOrders.length ? adminLatestOrders.map((order) => {
      const buyerName = order.receiver?.name || 'Khách hàng'
      const buyerPhone = order.receiver?.phone || '—'
      const province = order.province || ''
      const itemSummary = (order.items || []).map((item) => `${item.name || 'Sản phẩm'} × ${Number(item.quantity) || 0}`).join(', ')
      const paymentText = order.paymentMethod === 'CashOnDelivery' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng (VietQR)'
      const paymentPaid = order.payment?.status === 'Đã thanh toán'
        || (order.paymentMethod !== 'CashOnDelivery' && ['Đã thanh toán', 'Đang xử lý', 'Đang giao', 'Đã nhận'].includes(order.status))
      const cancelled = order.status === 'Đã hủy'
      const paymentBadge = cancelled
        ? '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]">cancel</span>Đã hủy</span>'
        : paymentPaid
        ? '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]">check_circle</span>Đã xác nhận thanh toán</span>'
        : '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[14px]">schedule</span>Chờ thu / thanh toán</span>'
      return `<tr class="hover:bg-surface-container-low/40 transition-colors">
        <td class="py-4 px-4 font-headline-sm text-[15px] font-bold text-primary"><a class="hover:underline flex items-center gap-1" href="/admin/orders">#${escape(order.orderCode || order.id)}<span class="material-symbols-outlined text-[14px]">open_in_new</span></a></td>
        <td class="py-4 px-4"><div class="font-semibold text-on-surface">${escape(buyerName)}</div><div class="text-on-surface-variant text-body-sm flex items-center gap-1"><span>${escape(buyerPhone)}</span><span>•</span><span>${escape(province || '—')}</span></div></td>
        <td class="py-4 px-4"><div class="font-medium text-on-surface">${escape(itemSummary || '—')}</div></td>
        <td class="py-4 px-4 text-right font-price-md text-price-md font-bold text-on-surface">${money(order.totalAmount)}</td>
        <td class="py-4 px-4"><div class="flex flex-col"><span class="font-medium text-on-surface">${escape(paymentText)}</span></div></td>
        <td class="py-4 px-4">${paymentBadge}</td>
        <td class="py-4 px-4 text-center"><div class="flex items-center justify-center gap-1.5"><button ${cancelled ? 'disabled aria-disabled="true" title="Đơn hàng đã hủy, không thể duyệt giao"' : ''} class="h-9 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-title-md text-body-sm transition-colors flex items-center gap-1 shadow-sm ${cancelled ? 'opacity-50 cursor-not-allowed hover:bg-primary' : ''}" type="button"><span class="material-symbols-outlined text-[16px]">local_shipping</span>Duyệt &amp; Giao xe</button><button class="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors" title="Chi tiết đơn hàng" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span></button></div></td>
      </tr>`
    }).join('') : emptyRow
  }, [adminLatestOrders, route.path, route.folder])

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname === legacyAdminOrdersStitchPath) {
        window.history.replaceState({}, '', `/admin/orders${window.location.search}${window.location.hash}`)
      } else if (window.location.pathname === '/farm-box/cua-toi') {
        window.history.replaceState({}, '', `/account/change-password${window.location.search}${window.location.hash}`)
      }
      setCurrentPath(window.location.pathname === legacyAdminOrdersStitchPath ? '/admin/orders' : window.location.pathname === '/farm-box/cua-toi' ? '/account/change-password' : window.location.pathname)
      setCurrentSearch(window.location.search)
      setSelectedProductId(new URLSearchParams(window.location.search).get('productId') || '')
      setAuthUser(readStoredAuth())
      setProductPage(Math.max(1, Number(new URLSearchParams(window.location.search).get('page')) || 1))
      setProductSearch(new URLSearchParams(window.location.search).get('search') || '')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => () => {
    window.sessionStorage.removeItem('greennovaCheckoutAddressId')
  }, [route.path])

  useEffect(() => {
    if (requiresAdminSession(route) && !authUser) {
      navigateTo(`/login?returnTo=${encodeURIComponent(currentPath)}`)
    } else if (requiresAdminSession(route) && authUser?.role !== 'Admin') {
      navigateTo('/')
    } else if (requiresCustomerSession(route) && !authUser) {
      navigateTo(`/login?returnTo=${encodeURIComponent(currentPath)}`)
    } else if (authUser && ['/login', '/register'].includes(currentPath)) {
      navigateTo(authUser.role === 'Admin' ? '/admin' : '/account')
    }
  }, [route, currentPath, authUser])

  useEffect(() => {
    const handleAddToCart = async (event) => {
      const checkoutButton = event.target.closest?.('#btnCheckout')
      if (checkoutButton && route.path === '/checkout') {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (checkoutButton.disabled) return
        const token = sessionStorage.getItem('greennovaToken')
        if (!token) {
          showCartToast('Vui lòng đăng nhập trước khi đặt hàng.')
          navigateTo(`/login?returnTo=${encodeURIComponent('/checkout')}`)
          return
        }

        const value = (selector) => document.querySelector(selector)?.value?.trim() || ''
        const receiver = {
          name: value('#fullName'),
          phone: value('#phoneNumber').replace(/\D/g, ''),
          email: value('#emailAddress'),
        }
        const shippingAddress = value('#checkoutAddress')
        const province = value('#checkoutProvince')
        const note = value('#orderNote')
        const paymentMethod = document.querySelector('input[name="checkoutPaymentMethod"]:checked')?.value || 'BankTransfer'
        if (!receiver.name || !receiver.phone || !receiver.email || !shippingAddress || !province) {
          showCartToast('Vui lòng điền đủ thông tin người nhận và địa chỉ giao hàng.')
          return
        }

        checkoutButton.disabled = true
        checkoutButton.setAttribute('aria-busy', 'true')
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        const requestJson = async (url, options = {}) => {
          const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } })
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error || 'Không thể hoàn tất thao tác.')
          return payload
        }

        try {
          const cartPayload = await requestJson('/api/cart')
          let remoteItems = Array.isArray(cartPayload.data?.items) ? cartPayload.data.items : []
          const localCart = readStoredCart()
          let localCartChanged = false
          let farmBoxCatalog = farmBoxes
          if (!farmBoxCatalog.length) {
            const farmBoxPayload = await requestJson('/api/farm-boxes')
            farmBoxCatalog = Array.isArray(farmBoxPayload.data) ? farmBoxPayload.data : []
          }
          let comboCatalog = availableCombos

          for (const [cartKey, rawQuantity] of Object.entries(localCart)) {
            let quantity = Number(rawQuantity) || 0
            if (quantity <= 0) continue
            let itemType = 'Product'
            let itemId = cartKey
            let weekId = ''
            let cropFailurePolicy = 'replace'
            if (cartKey.startsWith('farmBox:')) {
              [, itemId, weekId] = cartKey.split(':')
              itemType = 'FarmBox'
              // Giỏ local cũ có thể còn khóa FarmBox không kèm tuần. Nếu API đã
              // có đúng hộp này thì lấy tuần từ server; nếu chưa có, ghép với
              // tuần đang mở của hộp để phục hồi khóa giỏ cũ.
              if (!/^[a-f\d]{24}$/i.test(weekId || '')) {
                const serverFarmBox = remoteItems.find((item) => item.itemType === 'FarmBox' && item.id === itemId && /^[a-f\d]{24}$/i.test(item.weekId || ''))
                let resolvedWeekId = serverFarmBox?.weekId
                if (!resolvedWeekId) {
                  const box = farmBoxCatalog.find((item) => item.id === itemId)
                  const openWeeks = (box?.weeks || []).filter((week) => week.status === 'Đang mở' && /^[a-f\d]{24}$/i.test(week.id || ''))
                  const closestOpenWeek = [...openWeeks].sort((left, right) =>
                    Math.abs(new Date(left.startDate).getTime() - Date.now()) - Math.abs(new Date(right.startDate).getTime() - Date.now()))[0]
                  resolvedWeekId = closestOpenWeek?.id
                }
                if (!resolvedWeekId) throw new Error('Không tìm thấy tuần đang mở cho Farm Box trong giỏ. Hãy chọn tuần giao trên trang Farm Box rồi thử lại.')
                weekId = resolvedWeekId
                const migratedKey = `farmBox:${itemId}:${weekId}`
                quantity = Math.max(quantity, Number(localCart[migratedKey]) || 0)
                localCart[migratedKey] = quantity
                delete localCart[cartKey]
                localCartChanged = true
              }
              const configuredBox = farmBoxCatalog.find((box) => box.id === itemId)
              const configuredWeek = configuredBox?.weeks?.find((week) => week.id === weekId)
              const farmBoxPrice = Number(configuredWeek?.price ?? configuredBox?.price) || 0
              const size = farmBoxPrice < 199000 ? 'small' : farmBoxPrice < 300000 ? 'medium' : 'large'
              cropFailurePolicy = getFarmBoxIssueChoice(size, weekId, itemId)
            } else if (cartKey.startsWith('combo:')) {
              const comboKey = cartKey.slice('combo:'.length)
              if (/^[a-f\d]{24}$/i.test(comboKey)) {
                itemId = comboKey
              } else {
                const comboIndex = imperfectComboPaths.indexOf(comboKey)
                const comboTitle = comboIndex >= 0 ? getImperfectCardData(comboIndex)?.title : ''
                let combo = findAvailableComboByName(comboCatalog, comboTitle)
                if (!combo && !comboCatalog.length) {
                  const comboPayload = await requestJson('/api/combos')
                  comboCatalog = Array.isArray(comboPayload.data) ? comboPayload.data : []
                  combo = findAvailableComboByName(comboCatalog, comboTitle)
                }
                if (!combo && comboTitle) {
                  const resolved = await requestJson(`/api/combos/resolve?name=${encodeURIComponent(comboTitle)}`)
                  combo = resolved.data || null
                }
                if (!combo) {
                  const serverCombo = findAvailableComboByName(
                    remoteItems.filter((item) => item.itemType === 'Combo'), comboTitle,
                  )
                  if (serverCombo) combo = { id: serverCombo.id }
                }
                if (!combo?.id) throw new Error(`Không tìm thấy mã MongoDB của combo “${comboTitle || 'đã chọn'}”.`)
                itemId = combo.id
              }
              itemType = 'Combo'
            }

            const existing = remoteItems.find((item) => item.itemType === itemType
              && item.id === itemId && (itemType !== 'FarmBox' || item.weekId === weekId))
            if (existing && Number(existing.quantity) === quantity) continue
            const query = itemType === 'FarmBox' && weekId ? `?weekId=${encodeURIComponent(weekId)}` : ''
            const path = existing
              ? `/api/cart/items/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}${query}`
              : '/api/cart/items'
            const body = existing
              ? { quantity, ...(weekId ? { weekId } : {}), ...(itemType === 'FarmBox' ? { cropFailurePolicy } : {}) }
              : {
                  itemType,
                  ...(itemType === 'Product' ? { productId: itemId } : {}),
                  ...(itemType === 'Combo' ? { comboId: itemId } : {}),
                  ...(itemType === 'FarmBox' ? { farmBoxId: itemId, weekId } : {}),
                  ...(itemType === 'FarmBox' ? { cropFailurePolicy } : {}),
                  quantity,
                }
            const synced = await requestJson(path, {
              method: existing ? 'PATCH' : 'POST', body: JSON.stringify(body),
            })
            remoteItems = Array.isArray(synced.data?.items) ? synced.data.items : remoteItems
          }

          if (localCartChanged) {
            localStorage.setItem('greennovaCart', JSON.stringify(localCart))
          }

          const orderPayload = await requestJson('/api/orders', {
            method: 'POST',
            body: JSON.stringify({ receiver, shippingAddress, province, note, paymentMethod }),
          })
          const order = orderPayload.data
          sessionStorage.setItem('greennovaLatestOrder', JSON.stringify(order))
          localStorage.setItem('greennovaCart', '{}')
          localStorage.setItem('greennovaFarmBoxDeliveryDates', '{}')
          setCartItems({})
          setServerCartItems([])
          navigateTo(paymentMethod === 'CashOnDelivery'
            ? '/orders'
            : `/checkout/payment?orderId=${encodeURIComponent(order.id)}`)
        } catch (error) {
          showCartToast(error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.')
        } finally {
          checkoutButton.disabled = false
          checkoutButton.removeAttribute('aria-busy')
        }
        return
      }

      const cartQuantityButton = event.target.closest?.('[data-cart-action="increase"], [data-cart-action="decrease"]')
      if (cartQuantityButton && route.path === '/cart') {
        event.preventDefault()
        event.stopImmediatePropagation()
        const card = cartQuantityButton.closest('[data-cart-key]')
        const quantityLabel = card?.querySelector('button[aria-label="Giảm lượng"]')?.nextElementSibling
        if (!card || !quantityLabel) return

        const current = Number.parseFloat(quantityLabel.textContent.replace(',', '.')) || 0
        const step = Number(card.dataset.cartStep) || 1
        const stock = Number(card.dataset.cartStock) || 0
        const action = cartQuantityButton.dataset.cartAction
        const next = action === 'increase'
          ? Number((current + step).toFixed(3))
          : Number(Math.max(step, current - step).toFixed(3))

        if (action === 'increase' && next > stock) {
          const itemName = card.querySelector('h2')?.textContent.trim() || 'Sản phẩm'
          showCartToast(`${itemName}: vượt quá số lượng tồn. Hiện chỉ còn ${stock} ${card.dataset.cartUnit}.`.trim())
          return
        }
        if (next === current) return

        const cartKey = card.dataset.cartKey
        const token = sessionStorage.getItem('greennovaToken')
        if (card.dataset.apiCartItem === 'true' && token) {
          const itemType = card.dataset.cartItemType
          const itemId = card.dataset.cartRefId
          const weekId = card.dataset.cartWeekId
          const query = itemType === 'FarmBox' && weekId ? `?weekId=${encodeURIComponent(weekId)}` : ''
          cartQuantityButton.disabled = true
          try {
            const response = await fetch(`/api/cart/items/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}${query}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ quantity: next, ...(weekId ? { weekId } : {}) }),
            })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || 'Không thể cập nhật số lượng trong giỏ.')
            setServerCartItems(Array.isArray(payload.data?.items) ? payload.data.items : [])
          } catch (error) {
            showCartToast(error.message || 'Không thể cập nhật số lượng.')
            return
          } finally {
            cartQuantityButton.disabled = false
          }
        }

        const cart = readStoredCart()
        cart[cartKey] = next
        localStorage.setItem('greennovaCart', JSON.stringify(cart))
        setCartItems(cart)
        return
      }

      const removeCartButton = event.target.closest?.('[data-cart-action="remove"]')
      if (removeCartButton && route.path === '/cart') {
        event.preventDefault()
        event.stopImmediatePropagation()
        const card = removeCartButton.closest('[data-cart-key]')
        if (!card) return
        const cartKey = card.dataset.cartKey
        const itemType = card.dataset.cartItemType
        const itemId = card.dataset.cartRefId
        const weekId = card.dataset.cartWeekId
        const token = sessionStorage.getItem('greennovaToken')
        if (card.dataset.apiCartItem === 'true' && token && itemType && itemId) {
          try {
            const query = itemType === 'FarmBox' && weekId ? `?weekId=${encodeURIComponent(weekId)}` : ''
            const response = await fetch(`/api/cart/items/${encodeURIComponent(itemType)}/${encodeURIComponent(itemId)}${query}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || 'Không thể xóa mặt hàng khỏi giỏ hàng.')
            setServerCartItems(Array.isArray(payload.data?.items) ? payload.data.items : [])
          } catch (error) {
            window.alert(error.message || 'Không thể xóa mặt hàng khỏi giỏ hàng.')
            return
          }
        }
        const cart = readStoredCart()
        delete cart[cartKey]
        localStorage.setItem('greennovaCart', JSON.stringify(cart))
        setCartItems(cart)
        return
      }

      const provisionalFarmBoxButton = event.target.closest?.('[data-provision-farm-box="true"]')
      if (provisionalFarmBoxButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (provisionalFarmBoxButton.disabled) return
        const boxId = provisionalFarmBoxButton.dataset.addFarmBoxId
        const issuePolicy = getFarmBoxIssueChoice(provisionalFarmBoxButton.dataset.farmBoxSize || 'small', '', boxId)
        const quantity = Math.max(1, Math.floor(Number(provisionalFarmBoxButton.closest('aside')?.querySelector('#box-quantity')?.textContent) || 1))
        const token = sessionStorage.getItem('greennovaToken')
        provisionalFarmBoxButton.disabled = true
        try {
          const requestedStart = provisionalFarmBoxButton.dataset.provisionalStartDate || new URLSearchParams(window.location.search).get('weekStart') || ''
          const weekResponse = await fetch(`/api/farm-boxes/${encodeURIComponent(boxId)}/provisional-week`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: requestedStart }),
          })
          const weekPayload = await weekResponse.json()
          if (!weekResponse.ok) throw new Error(weekPayload.error || 'Không thể tạo lượt đặt trước FarmBox.')
          const week = weekPayload.data
          const cartKey = `farmBox:${boxId}:${week.id}`
          const cart = readStoredCart()
          const currentQuantity = Math.max(0, Math.floor(Number(cart[cartKey]) || 0))
          const capacity = Math.max(0, Number(week.available) || 0)
          if (currentQuantity + quantity > capacity) throw new Error(`Chỉ còn ${Math.max(0, capacity - currentQuantity)} suất đặt trước.`)

          if (token) {
            const cartResponse = await fetch('/api/cart/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ itemType: 'FarmBox', farmBoxId: boxId, weekId: week.id, quantity, cropFailurePolicy: issuePolicy }),
            })
            const cartPayload = await cartResponse.json()
            if (!cartResponse.ok) throw new Error(cartPayload.error || 'Không thể thêm FarmBox vào giỏ hàng.')
          }
          cart[cartKey] = currentQuantity + quantity
          localStorage.setItem('greennovaCart', JSON.stringify(cart))
          setCartItems(cart)
          fetch('/api/farm-boxes').then((response) => response.json()).then((payload) => {
            if (Array.isArray(payload.data)) setFarmBoxes(payload.data)
          }).catch(() => {})
          window.alert(`Đã thêm ${quantity} FarmBox vào giỏ hàng.`)
        } catch (error) {
          window.alert(error.message || 'Không thể đặt trước FarmBox lúc này.')
        } finally {
          provisionalFarmBoxButton.disabled = false
        }
        return
      }

      const farmBoxQuantityButton = event.target.closest?.('[data-farmbox-quantity-action]')
      if (farmBoxQuantityButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const aside = farmBoxQuantityButton.closest('aside')
        const quantityLabel = aside?.querySelector('#box-quantity')
        const addButton = aside?.querySelector('[data-add-farm-box-id]')
        if (!quantityLabel || !addButton) return
        const stock = Math.max(0, Math.floor(Number(addButton.dataset.farmBoxStock) || 0))
        const current = Math.max(1, Math.floor(Number(quantityLabel.textContent) || 1))
        const next = farmBoxQuantityButton.dataset.farmboxQuantityAction === 'increase'
          ? Math.min(stock, current + 1)
          : Math.max(1, current - 1)
        quantityLabel.textContent = String(next)
        aside.querySelectorAll('[data-farmbox-quantity-action]').forEach((button) => {
          button.disabled = button.dataset.farmboxQuantityAction === 'increase' ? next >= stock : next <= 1
        })
        const ctaLabel = addButton.querySelector('#cta-button-text')
        if (ctaLabel) ctaLabel.textContent = addButton.dataset.provisionFarmBox === 'true'
          ? `Đặt trước · ${money(Number(addButton.dataset.farmBoxPrice) * next)}`
          : `Thêm FarmBox vào giỏ · ${money(Number(addButton.dataset.farmBoxPrice) * next)}`
        return
      }

      const farmBoxButton = event.target.closest?.('[data-add-farm-box-id]')
      if (farmBoxButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (farmBoxButton.disabled) return
        const boxId = farmBoxButton.dataset.addFarmBoxId
        const weekId = farmBoxButton.dataset.farmBoxWeekId
        const issuePolicy = getFarmBoxIssueChoice(farmBoxButton.dataset.farmBoxSize || 'small', weekId, boxId)
        const quantity = Math.max(1, Math.floor(Number(farmBoxButton.closest('aside')?.querySelector('#box-quantity')?.textContent) || 1))
        const stock = Math.max(0, Math.floor(Number(farmBoxButton.dataset.farmBoxStock) || 0))
        const cartKey = `farmBox:${boxId}:${weekId}`
        const cart = readStoredCart()
        const currentQuantity = Math.max(0, Math.floor(Number(cart[cartKey]) || 0))
        if (currentQuantity + quantity > stock) {
          window.alert(`Chỉ còn ${Math.max(0, stock - currentQuantity)} FarmBox cho tuần đã chọn.`)
          return
        }

        const token = sessionStorage.getItem('greennovaToken')
        if (token) {
          try {
            const response = await fetch('/api/cart/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ itemType: 'FarmBox', farmBoxId: boxId, weekId, quantity, cropFailurePolicy: issuePolicy }),
            })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || 'Không thể thêm FarmBox vào giỏ hàng.')
          } catch (error) {
            window.alert(error.message || 'Không thể kết nối máy chủ giỏ hàng.')
            return
          }
        }
        cart[cartKey] = currentQuantity + quantity
        localStorage.setItem('greennovaCart', JSON.stringify(cart))
        setCartItems(cart)
        window.alert(`Đã thêm ${quantity} FarmBox vào giỏ hàng.`)
        return
      }

      const comboQuantityButton = event.target.closest?.('[data-combo-quantity-action]')
      if (comboQuantityButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const comboDetail = comboQuantityButton.closest('[data-combo-detail="true"]')
        const quantityLabel = comboDetail?.querySelector('[data-combo-quantity]')
        if (!comboDetail || !quantityLabel) return
        const stock = Math.max(0, Math.floor(Number(comboDetail.dataset.comboRemainingStock) || 0))
        const current = Math.max(1, Math.floor(Number(quantityLabel.textContent) || 1))
        const next = comboQuantityButton.dataset.comboQuantityAction === 'increase'
          ? Math.min(stock, current + 1)
          : Math.max(1, current - 1)
        quantityLabel.textContent = String(next)
        const decrease = comboDetail.querySelector('[data-combo-quantity-action="decrease"]')
        const increase = comboDetail.querySelector('[data-combo-quantity-action="increase"]')
        if (decrease) decrease.disabled = next <= 1 || stock < 1
        if (increase) increase.disabled = next >= stock
        const addButton = comboDetail.querySelector('[data-add-combo-id]')
        const addText = addButton?.querySelector('#addToCartText')
        if (addText) addText.textContent = stock < 1
          ? 'Hết hàng'
          : `Thêm vào giỏ - ${money(Number(comboDetail.dataset.comboPrice) * next)}`
        return
      }

      const comboButton = event.target.closest?.('[data-add-combo-id]')
      if (comboButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (comboButton.disabled) return
        const comboDetail = comboButton.closest('[data-combo-detail="true"]')
        const quantity = Math.max(1, Math.floor(Number(comboDetail?.querySelector('[data-combo-quantity]')?.textContent) || 1))
        const stock = Math.max(0, Math.floor(Number(comboButton.dataset.comboStock) || 0))
        const comboKey = `combo:${comboButton.dataset.addComboId}`
        const cart = readStoredCart()
        const currentQuantity = Math.max(0, Math.floor(Number(cart[comboKey]) || 0))
        if (currentQuantity + quantity > stock) {
          window.alert(`Chỉ còn ${Math.max(0, stock - currentQuantity)} combo có thể thêm vào giỏ.`)
          return
        }
        const token = sessionStorage.getItem('greennovaToken')
        const mongoComboId = comboButton.dataset.mongoComboId
        if (token && mongoComboId) {
          try {
            const response = await fetch('/api/cart/items', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ itemType: 'Combo', comboId: mongoComboId, quantity }),
            })
            const payload = await response.json()
            if (!response.ok) throw new Error(payload.error || 'Không thể thêm combo vào giỏ hàng.')
          } catch (error) {
            window.alert(error.message || 'Không thể kết nối máy chủ giỏ hàng.')
            return
          }
        }
        cart[comboKey] = currentQuantity + quantity
        localStorage.setItem('greennovaCart', JSON.stringify(cart))
        setCartItems(cart)
        const remainingAfterAdd = Math.max(0, stock - currentQuantity - quantity)
        if (comboDetail) {
          comboDetail.dataset.comboRemainingStock = String(remainingAfterAdd)
          const stockLabel = [...comboDetail.querySelectorAll('strong')]
            .find((element) => element.closest('.bg-surface-container-lowest')?.textContent.includes('Tính theo tồn kho'))
          if (stockLabel) stockLabel.textContent = `${remainingAfterAdd} combo`
          const addMoreButton = comboDetail.querySelector('[data-combo-quantity-action="increase"]')
          const decreaseButton = comboDetail.querySelector('[data-combo-quantity-action="decrease"]')
          const addMoreLabel = comboButton.querySelector('#addToCartText')
          const quantityLabel = comboDetail.querySelector('[data-combo-quantity]')
          if (remainingAfterAdd < 1) {
            if (addMoreButton) addMoreButton.disabled = true
            if (decreaseButton) decreaseButton.disabled = true
            comboButton.disabled = true
            if (addMoreLabel) addMoreLabel.textContent = stock > 0 ? 'Đã đủ số lượng trong giỏ' : 'Hết hàng'
          } else if (quantityLabel) {
            quantityLabel.textContent = '1'
            if (addMoreButton) addMoreButton.disabled = remainingAfterAdd <= 1
            if (decreaseButton) decreaseButton.disabled = true
            comboButton.disabled = false
            if (addMoreLabel) addMoreLabel.textContent = `Thêm vào giỏ - ${money(Number(comboDetail.dataset.comboPrice))}`
          }
        }
        if (comboButton.dataset.buyNowCombo === 'true') {
          navigateTo('/checkout')
          return
        }
        window.alert(`Đã thêm ${quantity} combo vào giỏ hàng.`)
        return
      }

      const quantityButton = event.target.closest?.('[data-quantity-action]')
      if (quantityButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const productControl = quantityButton.closest('[data-product-card="true"], [data-product-detail="true"]')
        const quantityLabel = productControl?.querySelector('[data-product-quantity], [data-detail-quantity]')
        if (!productControl || !quantityLabel) return
        const step = Math.max(0.001, Number(productControl.dataset.productStep) || 1)
        const stock = Math.max(0, Number(productControl.dataset.productStock) || 0)
        // Detail pages display quantities with a localized decimal comma and
        // unit (for example, "0,5 kg"). Number() cannot parse that string;
        // parse the leading localized number so +/- changes the actual value.
        const current = Number.parseFloat(String(quantityLabel.textContent).trim().replace(',', '.')) || 0
        const next = quantityButton.dataset.quantityAction === 'increase'
          ? Math.min(stock, current + step)
          : Math.max(Math.min(step, stock), current - step)
        const roundedNext = Number(next.toFixed(3))
        quantityLabel.textContent = productControl.dataset.productDetail === 'true'
          ? `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(roundedNext)} ${productControl.dataset.productUnit}`
          : String(roundedNext)
        if (productControl.dataset.productDetail === 'true') {
          const subtotal = productControl.querySelector('#subtotalDisplay')
          if (subtotal) subtotal.textContent = money(Number(productControl.dataset.productPrice) * roundedNext)
        }
        const controls = productControl.querySelectorAll('[data-quantity-action]')
        controls.forEach((control) => {
          control.disabled = control.dataset.quantityAction === 'decrease'
            ? roundedNext <= Math.min(step, stock)
            : roundedNext + step > stock
        })
        return
      }

      const button = event.target.closest?.('[data-add-product-id]')
      if (!button || button.disabled) return

      const productId = button.dataset.addProductId
      const cart = readStoredCart()
      const card = button.closest('[data-product-card="true"]')
      const detailQuantity = button.closest('section')?.querySelector('[data-detail-quantity]')?.textContent
      const quantityText = card?.querySelector('[data-product-quantity]')?.textContent || detailQuantity
      const quantity = Math.max(0, Number.parseFloat(String(quantityText || '1').replace(',', '.')) || 1)
      const stock = Number(button.dataset.productStock)
      if (Number.isFinite(stock) && Number(cart[productId] || 0) + quantity > stock) {
        window.alert('Số lượng trong giỏ vượt quá số hàng hiện có.')
        return
      }
      cart[productId] = Number(((Number(cart[productId]) || 0) + quantity).toFixed(3))
      localStorage.setItem('greennovaCart', JSON.stringify(cart))
      setCartItems(cart)
      window.alert('Đã thêm sản phẩm vào giỏ hàng.')
    }

    document.addEventListener('click', handleAddToCart)
    return () => document.removeEventListener('click', handleAddToCart)
  }, [route.path, authUser, availableCombos])

  useEffect(() => {
    if (route.path !== '/farm-box/tuy-chinh') return undefined
    const activeSwaps = new Map()

    const stopSwap = (card) => {
      const pending = activeSwaps.get(card)
      if (!pending) return null
      activeSwaps.delete(card)
      const controls = card.querySelector('[data-farmbox-menu-swap]')?.parentElement
      const swapButton = controls?.querySelector('[data-farmbox-menu-swap]')
      const confirmButton = controls?.querySelector('[data-farmbox-menu-confirm]')
      if (controls) controls.className = 'mt-space-md flex justify-center gap-2'
      if (swapButton) {
        swapButton.classList.remove('flex-1')
        swapButton.classList.add('w-32', 'justify-center')
      }
      if (confirmButton) confirmButton.hidden = true
      return pending
    }

    const updateMenuCard = (card, product) => {
      if (!card || !product) return
      card.dataset.productId = product.id
      const image = card.querySelector('img')
      if (image) {
        if (product.image) {
          image.src = product.image
          image.classList.remove('hidden')
        } else {
          image.removeAttribute('src')
          image.classList.add('hidden')
        }
        image.alt = product.name
      }
      const region = card.querySelector('span.absolute.top-2')
      if (region) region.textContent = product.region || product.farm || product.category || 'GreenNova'
      const title = card.querySelector('h4')
      if (title) title.textContent = product.name
      const description = title?.nextElementSibling
      if (description) description.textContent = `${product.unit ? `${product.unit} · ` : ''}${product.description || product.category || 'Nông sản tươi từ MongoDB'}`
    }

    const readMenuState = (section) => {
      const storageKey = section?.dataset.farmboxMenuStorageKey
      let state = null
      try { state = JSON.parse(sessionStorage.getItem(storageKey) || 'null') } catch {}
      const initialIds = JSON.parse(section?.dataset.farmboxMenuInitialIds || '[]')
      return {
        storageKey,
        initialIds,
        selectedIds: Array.isArray(state?.selectedIds) ? state.selectedIds : initialIds,
        swapsUsed: Math.max(0, Math.min(2, Number(state?.swapsUsed) || 0)),
      }
    }

    const saveMenuState = (section, state) => {
      sessionStorage.setItem(state.storageKey, JSON.stringify({
        initialIds: state.initialIds,
        selectedIds: state.selectedIds,
        swapsUsed: state.swapsUsed,
      }))
      const counter = section.querySelector('#swap-counter')
      if (counter) counter.textContent = `${state.swapsUsed}/2 món`
      section.querySelectorAll('[data-farmbox-menu-swap]').forEach((button) => {
        button.disabled = state.swapsUsed >= 2
      })
    }

    const handleCustomizerClick = (event) => {
      const tagButton = event.target.closest?.('[data-farmbox-note-tag]')
      if (tagButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const notes = document.querySelector('#dietary-notes')
        const value = tagButton.dataset.farmboxNoteTag
        if (notes && value && !notes.value.includes(value)) notes.value = notes.value ? `${notes.value}, ${value}` : value
        return
      }

      const resetButton = event.target.closest?.('[data-farmbox-menu-reset]')
      if (resetButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const section = resetButton.closest('section')
        if (!section) return
        section.querySelectorAll('[data-farmbox-menu-card]').forEach(stopSwap)
        const state = readMenuState(section)
        state.selectedIds = [...state.initialIds]
        state.swapsUsed = 0
        section.querySelectorAll('[data-farmbox-menu-card]').forEach((card) => {
          const product = products.find((item) => item.id === state.selectedIds[Number(card.dataset.farmboxMenuCard)])
          updateMenuCard(card, product)
        })
        saveMenuState(section, state)
        return
      }

      const confirmButton = event.target.closest?.('[data-farmbox-menu-confirm]')
      if (confirmButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const card = confirmButton.closest('[data-farmbox-menu-card]')
        const pending = card && stopSwap(card)
        if (!card || !pending) return
        const section = card.closest('section')
        const state = readMenuState(section)
        const index = Number(card.dataset.farmboxMenuCard)
        state.selectedIds[index] = pending.product.id
        state.swapsUsed += 1
        updateMenuCard(card, pending.product)
        saveMenuState(section, state)
        return
      }

      const swapButton = event.target.closest?.('[data-farmbox-menu-swap]')
      if (swapButton) {
        event.preventDefault()
        event.stopImmediatePropagation()
        if (swapButton.disabled) return
        const section = swapButton.closest('section')
        const card = swapButton.closest('[data-farmbox-menu-card]')
        if (!section || !card) return
        const state = readMenuState(section)
        if (state.swapsUsed >= 2) return
        const index = Number(card.dataset.farmboxMenuCard)
        const selectedElsewhere = new Set(state.selectedIds.filter((_, productIndex) => productIndex !== index))
        const currentId = card.dataset.productId
        const options = products.filter((item) => Number(item.stock) > 0
          && item.id !== currentId
          && !selectedElsewhere.has(item.id))
        if (!options.length) {
          window.alert('Không còn nông sản khác trong kho để đổi món.')
          return
        }
        const controls = swapButton.parentElement
        const confirmButton = controls.querySelector('[data-farmbox-menu-confirm]')
        controls.className = 'mt-space-md flex flex-row justify-center gap-2'
        confirmButton.hidden = false
        const pending = { product: options[Math.floor(Math.random() * options.length)] }
        updateMenuCard(card, pending.product)
        activeSwaps.set(card, pending)
        return
      }
    }

    const handleCustomizerSubmit = (event) => {
      const form = event.target.closest?.('[data-farmbox-configuration-form="true"]')
      if (!form) return
      event.preventDefault()
      const section = form.closest('section')
      if (!section) return
      const state = readMenuState(section)
      const config = {
        weekKey: section.dataset.farmboxMenuStorageKey,
        productIds: state.selectedIds,
        swapsUsed: state.swapsUsed,
        frequency: form.querySelector('[name="frequency"]:checked')?.value || 'weekly',
        deliveryDay: form.querySelector('[name="delivery_day"]:checked')?.value || '',
        notes: form.querySelector('#dietary-notes')?.value.trim() || '',
        savedAt: new Date().toISOString(),
      }
      sessionStorage.setItem('greennovaFarmBoxConfigurationDraft', JSON.stringify(config))
      window.alert('Đã lưu tạm thực đơn và lịch giao trong phiên này. Hãy chọn gói FarmBox phía trên để xem chi tiết và đặt hàng.')
    }

    document.addEventListener('click', handleCustomizerClick)
    document.addEventListener('submit', handleCustomizerSubmit)
    return () => {
      document.removeEventListener('click', handleCustomizerClick)
      document.removeEventListener('submit', handleCustomizerSubmit)
    }
  }, [route.path, products, currentSearch])

  useEffect(() => {
    document.title = screen.title
    if (screen.config && window.tailwind) {
      try {
        new Function('tailwind', screen.config)(window.tailwind)
        window.tailwind.refresh?.()
      } catch (error) {
        console.error('Không thể nạp cấu hình giao diện Stitch:', error)
      }
    }

    const previousStyle = document.getElementById('stitch-screen-styles')
    previousStyle?.remove()
    if (screen.styles) {
      const styleElement = document.createElement('style')
      styleElement.id = 'stitch-screen-styles'
      styleElement.textContent = screen.styles
      document.head.append(styleElement)
    }

    return () => document.getElementById('stitch-screen-styles')?.remove()
  }, [screen])

  useEffect(() => {
    if (route.path !== '/nong-san/chi-tiet') return undefined

    const gallery = document.querySelector('#mainProductImage')?.closest('section')?.querySelector('.grid.grid-cols-4')
    const thumbnails = [...(gallery?.querySelectorAll('[data-gallery-src]') || [])]
    if (thumbnails.length < 2) return undefined

    const selectImage = (index) => {
      const normalizedIndex = (index + thumbnails.length) % thumbnails.length
      const selected = thumbnails[normalizedIndex]
      const mainImage = document.querySelector('#mainProductImage')
      if (!mainImage || !selected) return
      mainImage.src = selected.dataset.gallerySrc
      mainImage.alt = selected.dataset.galleryAlt || mainImage.alt
      thumbnails.forEach((thumbnail, thumbnailIndex) => {
        const active = thumbnailIndex === normalizedIndex
        thumbnail.classList.toggle('ring-2', active)
        thumbnail.classList.toggle('ring-1', !active)
        thumbnail.classList.toggle('ring-primary', active)
        thumbnail.classList.toggle('ring-[#DCE3D8]', !active)
      })
    }

    const timer = window.setInterval(() => {
      const currentIndex = thumbnails.findIndex((thumbnail) => thumbnail.dataset.gallerySrc === document.querySelector('#mainProductImage')?.getAttribute('src'))
      selectImage((currentIndex < 0 ? 0 : currentIndex) + 1)
    }, 2000)

    return () => window.clearInterval(timer)
  }, [route.path, screen])

  useEffect(() => {
    const handleStitchNavigation = (event) => {
      // These are in-place state filters. Their visible wording (for example
      // "Đã thanh toán") must never be interpreted as a route command.
      if (event.target.closest?.('[data-order-status-filter]')) {
        event.preventDefault()
        return
      }

      const comboThumbnail = event.target.closest?.('[data-combo-gallery-src]')
      if (comboThumbnail) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const mainImage = document.querySelector('#mainProductImage')
        const thumbnailImage = comboThumbnail.querySelector('img')
        if (mainImage && thumbnailImage) {
          mainImage.src = thumbnailImage.src
          mainImage.alt = thumbnailImage.alt
        }
        comboThumbnail.parentElement?.querySelectorAll('[data-combo-gallery-src]').forEach((button) => {
          const selected = button === comboThumbnail
          button.classList.toggle('ring-2', selected)
          button.classList.toggle('ring-primary', selected)
          button.classList.toggle('opacity-70', !selected)
        })
        return
      }

      const galleryStep = event.target.closest?.('[data-gallery-step]')
      if (galleryStep) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const thumbnails = [...(document.querySelector('#mainProductImage')?.closest('section')?.querySelectorAll('[data-gallery-src]') || [])]
        const currentSrc = document.querySelector('#mainProductImage')?.getAttribute('src')
        const currentIndex = thumbnails.findIndex((thumbnail) => thumbnail.dataset.gallerySrc === currentSrc)
        const nextIndex = (currentIndex < 0 ? 0 : currentIndex) + Number(galleryStep.dataset.galleryStep)
        const selected = thumbnails[(nextIndex + thumbnails.length) % thumbnails.length]
        selected?.click()
        return
      }

      const galleryThumbnail = event.target.closest?.('[data-gallery-src]')
      if (galleryThumbnail) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const mainImage = document.querySelector('#mainProductImage')
        if (mainImage) {
          mainImage.src = galleryThumbnail.dataset.gallerySrc
          mainImage.alt = galleryThumbnail.dataset.galleryAlt || mainImage.alt
        }
        galleryThumbnail.closest('.grid')?.querySelectorAll('[data-gallery-src]').forEach((thumbnail) => {
          const selected = thumbnail === galleryThumbnail
          thumbnail.classList.toggle('ring-2', selected)
          thumbnail.classList.toggle('ring-1', !selected)
          thumbnail.classList.toggle('ring-primary', selected)
          thumbnail.classList.toggle('ring-[#DCE3D8]', !selected)
        })
        return
      }

      if (route.path === '/nong-san') {
        const resetFiltersButton = event.target.closest?.('[data-reset-product-filters]')
        if (resetFiltersButton) {
          event.preventDefault()
          setProductSearch('')
          setProductCategoryFilter('all')
          setProductFarmFilters([])
          setProductSeasonOnly(false)
          setProductSort('default')
          setProductPage(1)
          navigateTo('/nong-san')
          return
        }
        const farmMenu = document.querySelector('#farm-filter-menu')
        const farmButton = event.target.closest?.('#farm-filter-btn')
        if (farmMenu && !farmMenu.classList.contains('hidden')
          && !event.target.closest?.('#farm-filter-menu, #farm-filter-btn')) {
          farmMenu.classList.add('hidden')
          farmMenu.classList.remove('flex')
        }
        if (farmButton && farmMenu) {
          event.preventDefault()
          event.stopImmediatePropagation()
          farmMenu.classList.toggle('hidden')
          farmMenu.classList.toggle('flex')
          return
        }

        const categoryButton = event.target.closest?.('[data-product-category]')
        if (categoryButton) {
          event.preventDefault()
          setProductCategoryFilter(categoryButton.dataset.productCategory)
          setProductPage(1)
          return
        }

        const seasonButton = event.target.closest?.('[data-season-filter]')
        if (seasonButton) {
          event.preventDefault()
          setProductSeasonOnly((current) => !current)
          setProductPage(1)
          return
        }
      }

      const productPageButton = event.target.closest?.('[data-product-page]')
      if (productPageButton && route.path === '/nong-san') {
        event.preventDefault()
        const nextPage = Math.max(1, Number(productPageButton.dataset.productPage) || 1)
        setProductPage(nextPage)
        const searchQuery = productSearch ? `&search=${encodeURIComponent(productSearch)}` : ''
        navigateTo(`/nong-san?page=${nextPage}${searchQuery}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      const weeklyMetricButton = event.target.closest?.('[data-weekly-metric]')
      if (weeklyMetricButton) {
        event.preventDefault()
        setWeeklyMetric(weeklyMetricButton.dataset.weeklyMetric)
        return
      }

      const exportButton = event.target.closest?.('button')
      if (exportButton && labelOf(exportButton).includes('xuat bao cao ngay')) {
        event.preventDefault()
        const token = sessionStorage.getItem('greennovaToken')
        if (!token) {
          window.alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          navigateTo('/login?returnTo=%2Fadmin')
          return
        }

        const previousDisabled = exportButton.disabled
        exportButton.disabled = true
        exportButton.setAttribute('aria-busy', 'true')
        fetch(`/api/admin/reports/daily?date=${getLocalDateString(new Date())}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(async (response) => {
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Không thể tải báo cáo ngày.')
            const report = result.data
            const rows = [
              ['BÁO CÁO HOẠT ĐỘNG GREENNOVA'],
              ['Ngày báo cáo', report.date],
              ['Tổng số đơn', report.totalOrders],
              ['Tổng giá trị đơn hàng (VNĐ)', report.totalOrderValue],
              ['Doanh thu đã thanh toán (VNĐ)', report.paidRevenue],
              [],
              ['Mã đơn', 'Thời gian tạo', 'Người nhận', 'Số điện thoại', 'Email', 'Trạng thái', 'Tổng tiền (VNĐ)', 'Sản phẩm'],
              ...report.orders.map((order) => [
                order.orderCode,
                order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '',
                order.customerName,
                order.phone,
                order.email,
                order.status,
                order.totalAmount,
                order.items,
              ]),
            ]
            const blob = createXlsx(rows)
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `GreenNova_Bao_cao_ngay_${report.date}.xlsx`
            document.body.append(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
          })
          .catch((error) => window.alert(error.message))
          .finally(() => {
            exportButton.disabled = previousDisabled
            exportButton.removeAttribute('aria-busy')
          })
        return
      }

      const refreshButton = event.target.closest?.('button[title="Làm mới bảng điều khiển"]')
      if (refreshButton) {
        event.preventDefault()
        try {
          if (typeof window.location.reload === 'function') window.location.reload()
          else window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        return
      }

      if (event.target.closest?.('[data-add-product-id], [data-add-combo-id], [data-add-farm-box-id]')) return
      if (route.path === '/cart' && event.target.closest?.('[data-cart-action]')) return
      const control = event.target.closest?.('a[data-path], a[data-route], button[data-route], button[data-action="logout"], [data-route]')
      if (!control) return
      if (control instanceof HTMLButtonElement && control.type === 'submit') return

      if (control.dataset.action === 'logout'
        || control.dataset.path === 'dang-xuat'
        || labelOf(control).includes('dang xuat')) {
        event.preventDefault()
        event.stopImmediatePropagation()
        sessionStorage.removeItem('greennovaToken')
        sessionStorage.removeItem('greennovaUser')
        setAuthUser(null)
        navigateTo('/login')
        return
      }

      const nextPath = control.dataset.route || routeByStitchPath[control.dataset.path]
      if (!nextPath) return

      if (route.path === '/cart'
        && nextPath.startsWith('/checkout')
        && document.querySelector('[data-cart-stock-warning="true"]')) {
        event.preventDefault()
        event.stopImmediatePropagation()
        return
      }

      event.preventDefault()
      navigateTo(nextPath)
    }

    document.addEventListener('click', handleStitchNavigation)
    return () => document.removeEventListener('click', handleStitchNavigation)
  }, [authUser, route.path, productSearch])

  useEffect(() => {
    const handleCatalogChange = (event) => {
      const input = event.target
      if (route.path !== '/nong-san') return
      if (input instanceof HTMLInputElement && input.dataset.farmFilter !== undefined) {
        setProductFarmFilters((current) => {
          const next = new Set(current)
          if (input.checked) next.add(input.dataset.farmFilter)
          else next.delete(input.dataset.farmFilter)
          return [...next]
        })
        setProductPage(1)
      }
      if (input instanceof HTMLSelectElement && input.matches('select[data-product-sort]')) {
        setProductSort(input.value)
        setProductPage(1)
      }
    }
    document.addEventListener('change', handleCatalogChange)
    return () => document.removeEventListener('change', handleCatalogChange)
  }, [route.path, products])

  useEffect(() => {
    if (route.path !== '/imperfect') return undefined
    const sortSelect = document.querySelector('select[data-combo-sort="true"]')
    const grid = document.querySelector('#combo-grid')
    if (!sortSelect || !grid) return undefined
    const sortCombos = () => {
      const cards = [...grid.querySelectorAll('article')]
      const compare = {
        'price-asc': (a, b) => Number(a.dataset.comboPrice) - Number(b.dataset.comboPrice),
        'price-desc': (a, b) => Number(b.dataset.comboPrice) - Number(a.dataset.comboPrice),
        'name-asc': (a, b) => a.dataset.comboName.localeCompare(b.dataset.comboName, 'vi'),
        'stock-desc': (a, b) => Number(b.dataset.comboStock) - Number(a.dataset.comboStock),
      }[sortSelect.value]
      if (compare) grid.append(...cards.sort(compare))
    }
    sortSelect.addEventListener('change', sortCombos)
    return () => sortSelect.removeEventListener('change', sortCombos)
  }, [route.path, screen.bodyHtml])

  useEffect(() => {
    if (route.path !== '/admin' && !route.folder.startsWith('qt01')) return undefined

    const refreshDashboardClock = () => {
      const now = new Date()
      const currentDate = new Intl.DateTimeFormat('vi-VN').format(now)
      const currentTime = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).format(now)
      document.querySelectorAll('#stitch-screen-root span').forEach((element) => {
        const text = element.textContent.trim()
        if (/^Hôm nay, \d{1,2}\/\d{1,2}\/\d{4}$/.test(text)) {
          element.textContent = `Hôm nay, ${currentDate}`
        } else if (text.startsWith('Dữ liệu thời gian thực')) {
          element.textContent = `Thời gian thực: ${currentTime}`
        }
      })
    }

    refreshDashboardClock()
    const timer = window.setInterval(refreshDashboardClock, 1000)
    return () => window.clearInterval(timer)
  }, [route.path, screen.bodyHtml])

  useEffect(() => {
    const handleAuthForm = async (event) => {
      const form = event.target
      if (!(form instanceof HTMLFormElement)) return

      if (form.id === 'profile-form') {
        event.preventDefault()
        const token = sessionStorage.getItem('greennovaToken')
        const button = form.querySelector('button[type="submit"]')
        if (!token) {
          window.alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
          navigateTo('/login?returnTo=%2Faccount')
          return
        }
        const inputs = [...form.querySelectorAll('input:not([readonly])')]
        const payload = {
          fullName: inputs[0]?.value.trim() || '',
          email: inputs[1]?.value.trim() || '',
          phone: (inputs[2]?.value || '').replace(/\D/g, ''),
        }
        if (button) button.disabled = true
        try {
          const response = await fetch('/api/auth/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          })
          const result = await response.json()
          if (!response.ok) throw new Error(result.error || 'Không thể cập nhật thông tin.')
          sessionStorage.setItem('greennovaUser', JSON.stringify(result.user))
          setAuthUser(result.user)
          const toast = document.getElementById('save-toast')
          toast?.classList.remove('hidden')
          if (toast) toast.setAttribute('role', 'status')
        } catch (error) {
          window.alert(error.message)
        } finally {
          if (button) button.disabled = false
        }
        return
      }

      const formId = form.id
      if (formId === 'changePasswordForm') {
        event.preventDefault()
        const currentPassword = form.querySelector('#currentPassword')?.value || ''
        const newPassword = form.querySelector('#newPassword')?.value || ''
        const confirmation = form.querySelector('#confirmNewPassword')?.value || ''
        const message = form.querySelector('#change-password-message')
        const showMessage = (text, isError = true) => {
          if (!message) return
          message.textContent = text
          message.className = `rounded-lg px-4 py-3 text-sm ${isError ? 'bg-red-50 text-red-700' : 'bg-[#e8f5e9] text-[#176b36]'}`
        }
        if (newPassword !== confirmation) return showMessage('Mật khẩu xác nhận chưa khớp.')
        if (newPassword.length < 8 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
          return showMessage('Mật khẩu mới cần tối thiểu 8 ký tự, có chữ hoa, chữ thường và chữ số.')
        }
        const token = sessionStorage.getItem('greennovaToken') || ''
        const submitButton = form.querySelector('[type="submit"]')
        if (submitButton) submitButton.disabled = true
        try {
          const response = await fetch('/api/auth/me/password', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ currentPassword, newPassword }),
          })
          const result = await response.json()
          if (!response.ok) throw new Error(result.error || 'Không thể cập nhật mật khẩu.')
          showMessage(result.message || 'Mật khẩu đã được cập nhật.', false)
          sessionStorage.removeItem('greennovaToken')
          sessionStorage.removeItem('greennovaUser')
          setAuthUser(null)
          window.setTimeout(() => navigateTo('/login'), 1200)
        } catch (error) {
          showMessage(error.message)
        } finally {
          if (submitButton) submitButton.disabled = false
        }
        return
      }
      const endpoints = {
        loginForm: '/api/auth/login',
        registerForm: '/api/auth/register',
        recoveryForm: '/api/auth/forgot-password',
      }
      const isPasswordReset = form.id === 'resetPasswordForm' || Boolean(form.querySelector('#newPassword'))
      const endpoint = isPasswordReset ? '/api/auth/reset-password' : endpoints[formId]
      if (!endpoint) return

      event.preventDefault()
      const value = (id) => form.querySelector('#' + id)?.value?.trim() || ''

      try {
        let payload
        if (formId === 'loginForm') {
          payload = { identifier: value('loginIdentifier'), password: value('loginPassword') }
        } else if (formId === 'registerForm') {
          const password = value('registerPassword')
          const termsAccepted = form.querySelector('#agreeTerms')?.checked
          if (!termsAccepted) {
            window.alert('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.')
            return
          }
          if (password !== value('confirmPassword')) {
            window.alert('Mật khẩu xác nhận chưa khớp.')
            return
          }
          payload = {
            fullName: value('fullName'),
            phone: value('phoneInput'),
            email: value('emailInput'),
            password,
          }
        } else if (isPasswordReset) {
          const password = value('newPassword')
          if (password !== value('confirmPassword')) {
            window.alert('Mật khẩu xác nhận chưa khớp.')
            return
          }
          const token = new URLSearchParams(window.location.search).get('token')
            || sessionStorage.getItem('greennovaPasswordResetToken')
            || ''
          if (!token) {
            window.alert('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Hãy gửi lại yêu cầu.')
            navigateTo('/forgot-password')
            return
          }
          payload = { token, password }
        } else {
          sessionStorage.removeItem('greennovaPasswordResetToken')
          payload = { email: value('recoveryEmail') }
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Có lỗi xảy ra. Vui lòng thử lại.')

        if (formId === 'recoveryForm') {
          if (!result.resetUrl) {
            window.alert('Không tìm thấy tài khoản bằng email này. Hãy kiểm tra email rồi thử lại.')
            return
          }
          const resetToken = new URL(result.resetUrl, window.location.origin).searchParams.get('token')
          if (resetToken) sessionStorage.setItem('greennovaPasswordResetToken', resetToken)
          window.location.assign(new URL(result.resetUrl, window.location.href).href)
          return
        }

        if (formId === 'loginForm' && result.token && result.user) {
          sessionStorage.setItem('greennovaToken', result.token)
          sessionStorage.setItem('greennovaUser', JSON.stringify(result.user))
          setAuthUser(result.user)
          if (result.user.role !== 'Admin') {
            const missingProfile = getProfileCompletionStatus(result.user)
            setProfileCompletionPrompt(missingProfile.address || missingProfile.bank ? missingProfile : null)
          } else {
            setProfileCompletionPrompt(null)
          }
        } else if (formId === 'registerForm') {
          sessionStorage.removeItem('greennovaToken')
          sessionStorage.removeItem('greennovaUser')
          setAuthUser(null)
        }

        window.alert(result.message)
        if (formId === 'loginForm') {
          const user = result.user
          const returnTo = new URLSearchParams(window.location.search).get('returnTo')
          const returnPath = returnTo && routes.some((item) => item.path === returnTo) ? returnTo : null
          navigateTo(user?.role === 'Admin' ? (returnPath || '/admin') : (returnPath && !returnPath.startsWith('/admin') ? returnPath : '/'))
        } else if (formId === 'registerForm') {
          navigateTo('/login')
        } else if (isPasswordReset) {
          sessionStorage.removeItem('greennovaPasswordResetToken')
          navigateTo('/login')
        }
      } catch (error) {
        window.alert(error.message)
      }
    }

    document.addEventListener('submit', handleAuthForm)
    return () => document.removeEventListener('submit', handleAuthForm)
  }, [])

  useEffect(() => {
    const handlePasswordControl = (event) => {
      const toggle = event.target.closest?.('[data-toggle-password]')
      if (toggle) {
        const input = document.getElementById(toggle.dataset.togglePassword)
        if (input) {
          input.type = input.type === 'password' ? 'text' : 'password'
          const icon = toggle.querySelector('.material-symbols-outlined')
          if (icon) icon.textContent = input.type === 'password' ? 'visibility' : 'visibility_off'
          toggle.setAttribute('aria-label', input.type === 'password' ? 'Hiện mật khẩu' : 'Ẩn mật khẩu')
        }
      }
      if (event.type !== 'input' || event.target.id !== 'newPassword') return
      const password = event.target.value || ''
      const score = [password.length >= 8, /[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
      const label = document.getElementById('password-strength-label')
      if (label) label.textContent = !password ? 'Chưa nhập' : score <= 2 ? 'Yếu' : score <= 3 ? 'Trung bình' : score === 4 ? 'Khá tốt' : 'Mạnh'
      document.querySelectorAll('[data-strength-bar]').forEach((bar, index) => {
        bar.classList.toggle('bg-[#16803d]', index < Math.min(score, 4))
        bar.classList.toggle('bg-[#e3eee3]', index >= Math.min(score, 4))
      })
    }
    document.addEventListener('click', handlePasswordControl)
    document.addEventListener('input', handlePasswordControl)
    return () => {
      document.removeEventListener('click', handlePasswordControl)
      document.removeEventListener('input', handlePasswordControl)
    }
  }, [])

  if ((requiresAdminSession(route) && authUser?.role !== 'Admin')
    || (requiresCustomerSession(route) && !authUser)) {
    return <main className="min-h-screen p-8 text-center">Đang chuyển đến trang đăng nhập…</main>
  }

  if (!screen.bodyHtml) {
    return <main className="screen-error">Không tìm thấy màn hình Stitch: {route.title}</main>
  }

  return (
    <>
      <div id="stitch-screen-root" className={screen.bodyClass} dangerouslySetInnerHTML={{ __html: screen.bodyHtml }} />
      {paymentSuccessOrder && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#17231a]/50 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPaymentSuccessOrder(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="payment-success-title" className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#dfe9de] bg-white p-4 shadow-2xl sm:p-6">
            <button type="button" aria-label="Đóng thông báo" onClick={() => setPaymentSuccessOrder(null)} className="absolute right-3 top-3 rounded-full p-2 text-[#647267] hover:bg-[#f1f6f0]"><span className="material-symbols-outlined">close</span></button>
            <div className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f4e8] text-[#16753b]"><span className="material-symbols-outlined text-[28px]">check_circle</span></span>
              <span className="mt-2 rounded-full bg-[#e7f4e8] px-3 py-1 text-[10px] font-semibold text-[#16753b]">● Đã thanh toán</span>
              <h2 id="payment-success-title" className="mt-2 text-xl font-bold text-[#24372a]">Thanh toán thành công</h2>
              <p className="mt-1 text-xs text-[#627064]">Mã đơn hàng <strong>{paymentSuccessOrder.orderCode}</strong> đã được xác nhận.</p>
            </div>
            <div className="my-4 grid grid-cols-5 gap-1 rounded-xl bg-[#f5f8f3] px-2 py-3 text-center text-[9px] text-[#54705a] sm:text-[11px]">
              {['Thanh toán', 'Đã xác nhận', 'Đóng gói', 'Đang giao', 'Đã nhận'].map((step, index) => <div key={step} className="flex flex-col items-center gap-1"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${index === 0 ? 'bg-[#16753b] text-white' : 'bg-[#dfe9de] text-[#768479]'}`}><span className="material-symbols-outlined text-[13px]">{index === 0 ? 'check' : index === 1 ? 'inventory_2' : 'radio_button_unchecked'}</span></span><span>{step}</span></div>)}
            </div>
            <section className="rounded-xl border border-[#e3eae1] p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#edf1eb] pb-2"><h3 className="text-sm font-bold text-[#29382d]">Chi tiết đơn hàng</h3><span className="rounded-md bg-[#f3f7f1] px-2 py-1 text-[10px] text-[#526357]">Mã {paymentSuccessOrder.orderCode}</span></div>
              <div className="divide-y divide-[#edf1eb]">
                {(paymentSuccessOrder.items || []).map((item, index) => {
                  const label = item.itemType === 'FarmBox' ? 'Farm Box' : item.itemType === 'Combo' ? 'Combo Imperfect' : 'Nông sản'
                  const icon = item.itemType === 'FarmBox' ? 'inventory_2' : item.itemType === 'Combo' ? 'nutrition' : 'eco'
                  const image = item.image || item.imageUrl || ''
                  return <div key={`${item.id}-${index}`} className="flex items-center gap-3 py-2.5">
                    {image ? <img src={image} alt={item.name || label} className="h-11 w-11 shrink-0 rounded-lg border border-[#e3eae1] object-cover" /> : <span className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#edf6ec] text-[#16753b]">{icon}</span>}
                    <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#26372b]">{item.name || label}</p><p className="mt-0.5 text-[10px] text-[#778278]">{label} · ×{Number(item.quantity) || 0}</p></div>
                    <strong className="shrink-0 text-xs text-[#26372b]">{money(Number(item.lineTotal) || 0)}</strong>
                  </div>
                })}
              </div>
              <div className="space-y-1 border-t border-[#edf1eb] pt-2 text-xs text-[#657268]"><div className="flex justify-between"><span>Phí giao hàng</span><span>{Number(paymentSuccessOrder.shippingFee) ? money(Number(paymentSuccessOrder.shippingFee)) : 'Miễn phí'}</span></div><div className="flex justify-between pt-1 text-sm font-bold text-[#25372a]"><span>Tổng cộng</span><strong className="text-[#16753b]">{money(Number(paymentSuccessOrder.totalAmount) || 0)}</strong></div></div>
            </section>
            <div className="mt-3 rounded-lg bg-[#f2f8f0] px-3 py-2 text-[10px] leading-4 text-[#526357]"><span className="material-symbols-outlined mr-1 align-middle text-[14px] text-[#16753b]">location_on</span>{[paymentSuccessOrder.shippingAddress, paymentSuccessOrder.province].filter(Boolean).join(', ') || 'Địa chỉ nhận hàng đã lưu'} <span className="mx-1">·</span> GreenNova sẽ cập nhật tiến độ giao hàng trong đơn hàng của bạn.</div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => { const id = paymentSuccessOrder.id; setPaymentSuccessOrder(null); navigateTo(`/orders/detail?orderId=${encodeURIComponent(id)}`) }} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#16753b] px-4 text-xs font-semibold text-white hover:bg-[#105c2d]"><span className="material-symbols-outlined text-[16px]">local_shipping</span>Theo dõi đơn hàng</button><button type="button" onClick={() => { setPaymentSuccessOrder(null); navigateTo('/nong-san') }} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#b9d5bb] px-4 text-xs font-semibold text-[#176b36] hover:bg-[#f2f8f0]"><span className="material-symbols-outlined text-[16px]">shopping_bag</span>Tiếp tục mua sắm</button></div>
          </section>
        </div>
      )}
      {profileCompletionPrompt && authUser?.role !== 'Admin' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#12241a]/45 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setProfileCompletionPrompt(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="profile-completion-title" className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#d9e7d8] bg-white shadow-2xl">
            <div className="h-1.5 bg-[#dcebdd]"><div className="h-full bg-[#278448] transition-all" style={{ width: `${(2 - Number(profileCompletionPrompt.address) - Number(profileCompletionPrompt.bank)) * 50}%` }} /></div>
            <button type="button" aria-label="Đóng thông báo" onClick={() => setProfileCompletionPrompt(null)} className="absolute right-3 top-3 rounded-full p-1.5 text-[#829087] hover:bg-[#f0f6ef]"><span className="material-symbols-outlined text-[18px]">close</span></button>
            <div className="p-5 sm:p-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f4e7] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#176b36]"><span className="material-symbols-outlined text-[13px]">verified</span>Quyền lợi thành viên GreenNova</div>
              <h2 id="profile-completion-title" className="mt-3 pr-6 text-[18px] font-bold leading-6 text-[#20362a]">Hoàn thiện hồ sơ để nhận trọn ưu đãi GreenNova</h2>
              <p className="mt-1.5 text-[12px] leading-[18px] text-[#657469]">Cập nhật địa chỉ nhận hàng và tài khoản ngân hàng để đặt hàng, nhận hoàn tiền và ưu đãi thuận tiện hơn.</p>
              <div className="mt-4 rounded-xl border border-[#e1e9e0] bg-[#f8faf6] p-3">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#46574a]"><span>Mức độ hoàn thiện hồ sơ</span><span className="rounded-full bg-[#e0f1dc] px-2 py-1 text-[#1c753a]">{(2 - Number(profileCompletionPrompt.address) - Number(profileCompletionPrompt.bank)) * 50}% hoàn thành</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e3e9e1]"><div className="h-full rounded-full bg-[#29854a]" style={{ width: `${(2 - Number(profileCompletionPrompt.address) - Number(profileCompletionPrompt.bank)) * 50}%` }} /></div>
                <p className="mt-2 text-[10px] font-semibold text-[#617064]">Cần bổ sung:</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {profileCompletionPrompt.address && <span className="inline-flex items-center gap-1 rounded-md bg-[#fff3df] px-2 py-1 text-[9px] font-medium text-[#9a5b08]"><span className="material-symbols-outlined text-[12px]">location_on</span>Địa chỉ nhận hàng</span>}
                  {profileCompletionPrompt.bank && <span className="inline-flex items-center gap-1 rounded-md bg-[#fff3df] px-2 py-1 text-[9px] font-medium text-[#9a5b08]"><span className="material-symbols-outlined text-[12px]">account_balance</span>Ngân hàng và số tài khoản</span>}
                </div>
              </div>
              <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#66766a]">Quyền lợi khi hoàn thiện hồ sơ</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2 rounded-lg bg-[#f4f8f2] p-2.5"><span className="material-symbols-outlined text-[16px] text-[#278448]">local_shipping</span><div><p className="text-[10px] font-semibold text-[#304335]">Tự động áp dụng ưu đãi giao hàng</p><p className="text-[9px] text-[#708074]">Miễn phí vận chuyển theo điều kiện đơn hàng.</p></div></div>
                <div className="flex items-start gap-2 rounded-lg bg-[#f4f8f2] p-2.5"><span className="material-symbols-outlined text-[16px] text-[#278448]">account_balance_wallet</span><div><p className="text-[10px] font-semibold text-[#304335]">Nhận hoàn tiền thuận tiện</p><p className="text-[9px] text-[#708074]">Dùng thông tin ngân hàng khi cần hoàn tiền.</p></div></div>
                <div className="flex items-start gap-2 rounded-lg bg-[#f4f8f2] p-2.5"><span className="material-symbols-outlined text-[16px] text-[#278448]">qr_code_2</span><div><p className="text-[10px] font-semibold text-[#304335]">Thanh toán VietQR 1 chạm</p><p className="text-[9px] text-[#708074]">Thông tin nhận hàng được điền nhanh khi đặt đơn.</p></div></div>
              </div>
              <button type="button" onClick={() => { setProfileCompletionPrompt(null); navigateTo('/account') }} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#287f3d] text-[11px] font-bold text-white hover:bg-[#206b34]">Cập nhật ngay <span className="material-symbols-outlined text-[15px]">arrow_forward</span></button>
              <button type="button" onClick={() => setProfileCompletionPrompt(null)} className="mt-2 w-full py-1 text-[9px] text-[#78857a] hover:text-[#344238]">Nhắc tôi sau</button>
              <p className="mt-2 text-center text-[8px] text-[#a2aaa2]">Thông tin của bạn được bảo mật và chỉ dùng cho dịch vụ GreenNova.</p>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default App

