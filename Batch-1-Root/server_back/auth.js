import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { createHash, randomBytes } from 'node:crypto'

export function createAuthRouter(database, jwtSecret, requireAuth) {
  const router = Router()
  const users = database.collection('users')
  const passwordResets = database.collection('passwordResets')
  const hashResetToken = (token) => createHash('sha256').update(token).digest('hex')

  const createToken = (user) => jwt.sign(
    { role: user.role },
    jwtSecret,
    { subject: user._id.toString(), expiresIn: '8h' },
  )

  const userAddresses = (user) => {
    const addresses = Array.isArray(user.addresses) ? user.addresses.map((entry, index) => {
      const item = typeof entry === 'string' ? { address: entry } : (entry || {})
      return {
        id: String(item.id || item.addressId?.toString?.() || item._id?.toString?.() || `address-${index + 1}`),
        label: String(item.label || item.name || item.addressName || `Địa chỉ ${index + 1}`),
        receiverName: String(item.receiverName || ''),
        receiverPhone: String(item.receiverPhone || ''),
        address: String(item.address || item.addressDetail || item.fullAddress || item.addressLine || item.detail || ''),
        province: String(item.province || item.city || item.provinceName || ''),
        note: String(item.note || ''),
        isDefault: item.isDefault === true,
      }
    }) : []
    if (!addresses.some((item) => item.address) && user.address) {
      addresses.length = 0
      addresses.push({
        id: 'legacy-default', label: 'Nhà riêng', address: String(user.address),
        province: String(user.province || ''), isDefault: true,
      })
    }
    const defaultAddressId = String(user.defaultAddressId
      || addresses.find((item) => item.isDefault)?.id
      || addresses[0]?.id
      || '')
    return addresses.map((item) => ({ ...item, isDefault: item.id === defaultAddressId }))
  }

  const toStoredAddresses = (addresses, user) => addresses.map((item) => ({
    addressId: ObjectId.isValid(item.id) ? new ObjectId(item.id) : new ObjectId(),
    receiverName: String(item.receiverName || user.fullName || ''),
    receiverPhone: String(item.receiverPhone || user.phone || ''),
    addressDetail: String(item.address || ''),
    province: String(item.province || ''),
    note: String(item.note || ''),
    isDefault: item.isDefault === true,
    label: String(item.label || 'Địa chỉ khác'),
  }))

  const safeUser = (user) => ({
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address || userAddresses(user).find((item) => item.isDefault)?.address || '',
    province: user.province || userAddresses(user).find((item) => item.isDefault)?.province || '',
    addresses: userAddresses(user),
    defaultAddressId: userAddresses(user).find((item) => item.isDefault)?.id || '',
    bankName: String(user.bankName || user.bank?.bankName || user.bankAccount?.bankName || ''),
    bankAccountNumber: String(user.bankAccountNumber || user.bank?.accountNumber || user.bankAccount?.accountNumber || ''),
    bankAccountHolder: String(user.bankAccountHolder || ''),
    bankBranch: String(user.bankBranch || ''),
    role: user.role,
    createdAt: user.createdAt,
  })

  router.get('/me', requireAuth, async (request, response, next) => {
    try {
      const user = await users.findOne({ _id: new ObjectId(request.authUser.id) })
      if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
      return response.json({ user: safeUser(user) })
    } catch (error) {
      return next(error)
    }
  })

  router.patch('/me', requireAuth, async (request, response, next) => {
    try {
      const fullName = String(request.body.fullName || '').trim()
      const email = String(request.body.email || '').trim().toLowerCase()
      const phone = String(request.body.phone || '').trim()
      const addressWasProvided = Object.prototype.hasOwnProperty.call(request.body || {}, 'address')
      const address = addressWasProvided ? String(request.body.address || '').trim() : ''
      const provinceWasProvided = Object.prototype.hasOwnProperty.call(request.body || {}, 'province')
      const province = provinceWasProvided ? String(request.body.province || '').trim() : ''
      const bankNameWasProvided = Object.prototype.hasOwnProperty.call(request.body || {}, 'bankName')
      const bankAccountWasProvided = Object.prototype.hasOwnProperty.call(request.body || {}, 'bankAccountNumber')
      const bankAccountHolderWasProvided = Object.prototype.hasOwnProperty.call(request.body || {}, 'bankAccountHolder')
      const bankBranchWasProvided = Object.prototype.hasOwnProperty.call(request.body || {}, 'bankBranch')
      const bankName = bankNameWasProvided ? String(request.body.bankName || '').trim() : ''
      const bankAccountNumber = bankAccountWasProvided ? String(request.body.bankAccountNumber || '').trim() : ''
      const bankAccountHolder = bankAccountHolderWasProvided ? String(request.body.bankAccountHolder || '').trim() : ''
      const bankBranch = bankBranchWasProvided ? String(request.body.bankBranch || '').trim() : ''
      if (!fullName || fullName.length > 100 || !email || !phone) {
        return response.status(400).json({ error: 'Vui lòng nhập đủ thông tin hợp lệ.' })
      }
      if (address.length > 500) {
        return response.status(400).json({ error: 'Địa chỉ nhận hàng không được dài quá 500 ký tự.' })
      }
      if (province.length > 100) {
        return response.status(400).json({ error: 'Tỉnh/thành phố không được dài quá 100 ký tự.' })
      }
      if (bankName.length > 100 || bankAccountNumber.length > 40 || bankAccountHolder.length > 100 || bankBranch.length > 100) {
        return response.status(400).json({ error: 'Thông tin ngân hàng vượt quá độ dài cho phép.' })
      }
      const bankAccountDigits = bankAccountNumber.replace(/\D/g, '')
      if (bankAccountNumber && (!/^[0-9\s-]+$/.test(bankAccountNumber) || bankAccountDigits.length < 6 || bankAccountDigits.length > 30)) {
        return response.status(400).json({ error: 'Số tài khoản chỉ được gồm 6–30 chữ số.' })
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return response.status(400).json({ error: 'Email chưa đúng định dạng.' })
      }
      if (!/^[0-9]{9,11}$/.test(phone)) {
        return response.status(400).json({ error: 'Số điện thoại cần có 9–11 chữ số.' })
      }

      const userId = new ObjectId(request.authUser.id)
      const existingUser = await users.findOne({ _id: userId })
      if (!existingUser) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
      const duplicateEmail = await users.findOne({ email, _id: { $ne: userId } }, { projection: { _id: 1 } })
      if (duplicateEmail) return response.status(409).json({ error: 'Email này đã được tài khoản khác sử dụng.' })

      const addresses = userAddresses(existingUser)
      const defaultIndex = addresses.findIndex((item) => item.isDefault)
      if (addressWasProvided && defaultIndex >= 0) {
        addresses[defaultIndex] = {
          ...addresses[defaultIndex],
          address,
          province: provinceWasProvided ? province : addresses[defaultIndex].province,
        }
      } else if (addressWasProvided && address) {
        addresses.push({ id: new ObjectId().toString(), label: 'Nhà riêng', address, province, isDefault: true })
      }
      const defaultAddressIndex = addresses.findIndex((item) => item.isDefault)
      const storedAddresses = toStoredAddresses(addresses, { fullName, phone })
      const preservedAddress = existingUser.address || addresses[defaultAddressIndex]?.address || ''

      await users.updateOne(
        { _id: userId, status: 'Active' },
        { $set: {
          fullName, email, phone, address: addressWasProvided ? address : preservedAddress, updatedAt: new Date(),
          ...(provinceWasProvided ? { province } : {}),
          ...(bankNameWasProvided ? { bankName } : {}),
          ...(bankAccountWasProvided ? { bankAccountNumber } : {}),
          ...(bankAccountHolderWasProvided ? { bankAccountHolder } : {}),
          ...(bankBranchWasProvided ? { bankBranch } : {}),
          addresses: storedAddresses,
          ...(defaultAddressIndex >= 0 ? { defaultAddressId: storedAddresses[defaultAddressIndex].addressId.toString() } : {}),
        } },
      )
      const user = await users.findOne({ _id: userId })
      if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
      return response.json({ message: 'Thông tin cá nhân đã được cập nhật.', user: safeUser(user) })
    } catch (error) {
      if (error.code === 11000) return response.status(409).json({ error: 'Email này đã được tài khoản khác sử dụng.' })
      return next(error)
    }
  })

  router.patch('/me/password', requireAuth, async (request, response, next) => {
    try {
      const currentPassword = String(request.body.currentPassword || '')
      const newPassword = String(request.body.newPassword || '')
      if (!currentPassword || !newPassword) {
        return response.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.' })
      }
      if (newPassword.length < 8 || Buffer.byteLength(newPassword, 'utf8') > 72) {
        return response.status(400).json({ error: 'Mật khẩu mới cần từ 8 ký tự trở lên.' })
      }
      if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
        return response.status(400).json({ error: 'Mật khẩu cần có chữ hoa, chữ thường và ít nhất một chữ số.' })
      }
      const userId = new ObjectId(request.authUser.id)
      const user = await users.findOne({ _id: userId, status: 'Active' })
      if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
      if (!await bcrypt.compare(currentPassword, user.passwordHash)) {
        return response.status(400).json({ error: 'Mật khẩu hiện tại chưa chính xác.' })
      }
      await users.updateOne(
        { _id: userId, status: 'Active' },
        { $set: { passwordHash: await bcrypt.hash(newPassword, 12), updatedAt: new Date() } },
      )
      return response.json({ message: 'Mật khẩu đã được cập nhật. Vì lý do bảo mật, vui lòng đăng nhập lại.' })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/me/addresses', requireAuth, async (request, response, next) => {
    try {
      const label = String(request.body?.label || '').trim() || 'Địa chỉ khác'
      const address = String(request.body?.address || '').trim()
      const province = String(request.body?.province || '').trim()
      const receiverName = String(request.body?.receiverName || '').trim()
      const receiverPhone = String(request.body?.receiverPhone || '').replace(/\D/g, '')
      const note = String(request.body?.note || '').trim()
      if (!address || !province) return response.status(400).json({ error: 'Vui lòng nhập địa chỉ và tỉnh/thành phố.' })
      if (label.length > 60 || address.length > 500 || province.length > 100 || receiverName.length > 100 || note.length > 300) {
        return response.status(400).json({ error: 'Nhãn hoặc địa chỉ vượt quá độ dài cho phép.' })
      }
      if (receiverPhone && !/^[0-9]{9,11}$/.test(receiverPhone)) return response.status(400).json({ error: 'Số điện thoại người nhận cần có 9–11 chữ số.' })
      const userId = new ObjectId(request.authUser.id)
      const user = await users.findOne({ _id: userId, status: 'Active' })
      if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
      const addresses = userAddresses(user)
      const id = new ObjectId().toString()
      const makeDefault = request.body?.makeDefault !== false || addresses.length === 0
      const nextAddresses = [
        ...addresses.map((item) => ({ ...item, isDefault: makeDefault ? false : item.isDefault })),
        { id, label, address, province, receiverName, receiverPhone, note, isDefault: makeDefault },
      ]
      const defaultAddressIndex = makeDefault ? nextAddresses.length - 1 : nextAddresses.findIndex((item) => item.isDefault)
      const storedAddresses = toStoredAddresses(nextAddresses, user)
      await users.updateOne({ _id: userId }, { $set: {
        addresses: storedAddresses,
        ...(defaultAddressIndex >= 0 ? {
          defaultAddressId: storedAddresses[defaultAddressIndex].addressId.toString(),
          address: nextAddresses[defaultAddressIndex].address,
          province: nextAddresses[defaultAddressIndex].province,
        } : {}),
        updatedAt: new Date(),
      } })
      return response.status(201).json({ message: 'Đã thêm địa chỉ.', user: safeUser(await users.findOne({ _id: userId })) })
    } catch (error) { return next(error) }
  })

  router.patch('/me/addresses/:id/default', requireAuth, async (request, response, next) => {
    try {
      const userId = new ObjectId(request.authUser.id)
      const user = await users.findOne({ _id: userId, status: 'Active' })
      if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
      const addresses = userAddresses(user)
      let selected = addresses.find((item) => item.id === request.params.id)
      if (!selected && request.params.id === 'legacy-default' && user.address) {
        selected = { id: 'legacy-default', label: 'Nhà riêng', address: user.address, province: user.province || '' }
        addresses.push(selected)
      }
      if (!selected) return response.status(404).json({ error: 'Không tìm thấy địa chỉ đã chọn.' })
      const nextAddresses = addresses.map((item) => ({ ...item, isDefault: item.id === selected.id }))
      const selectedIndex = nextAddresses.findIndex((item) => item.isDefault)
      const storedAddresses = toStoredAddresses(nextAddresses, user)
      await users.updateOne({ _id: userId }, { $set: {
        addresses: storedAddresses,
        defaultAddressId: storedAddresses[selectedIndex].addressId.toString(),
        address: selected.address,
        province: selected.province,
        updatedAt: new Date(),
      } })
      return response.json({ message: 'Đã đổi địa chỉ mặc định.', user: safeUser(await users.findOne({ _id: userId })) })
    } catch (error) { return next(error) }
  })

  router.patch('/me/addresses/:id', requireAuth, async (request, response, next) => {
    try {
      const address = String(request.body?.address || '').trim()
      const province = String(request.body?.province || '').trim()
      const receiverName = String(request.body?.receiverName || '').trim()
      const receiverPhone = String(request.body?.receiverPhone || '').replace(/\D/g, '')
      const note = String(request.body?.note || '').trim()
      const label = String(request.body?.label || '').trim() || 'Địa chỉ khác'
      if (!address || !province) return response.status(400).json({ error: 'Vui lòng nhập địa chỉ và tỉnh/thành phố.' })
      if (label.length > 60 || address.length > 500 || province.length > 100 || receiverName.length > 100 || note.length > 300) {
        return response.status(400).json({ error: 'Nhãn hoặc địa chỉ vượt quá độ dài cho phép.' })
      }
      if (receiverPhone && !/^[0-9]{9,11}$/.test(receiverPhone)) return response.status(400).json({ error: 'Số điện thoại người nhận cần có 9–11 chữ số.' })
      const userId = new ObjectId(request.authUser.id)
      const user = await users.findOne({ _id: userId, status: 'Active' })
      if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
      const addresses = userAddresses(user)
      let index = addresses.findIndex((item) => item.id === request.params.id)
      if (index < 0 && request.params.id === 'legacy-default' && !addresses.length) {
        addresses.push({ id: new ObjectId().toString(), label, address, province, receiverName, receiverPhone, note, isDefault: true })
        index = addresses.length - 1
      } else if (index < 0) {
        return response.status(404).json({ error: 'Không tìm thấy địa chỉ cần cập nhật.' })
      } else {
        addresses[index] = { ...addresses[index], label, address, province, receiverName, receiverPhone, note }
      }
      const selected = addresses.find((item) => item.isDefault) || addresses[0]
      const selectedIndex = addresses.findIndex((item) => item.id === selected.id)
      const storedAddresses = toStoredAddresses(addresses, user)
      await users.updateOne({ _id: userId }, { $set: {
        addresses: storedAddresses,
        defaultAddressId: storedAddresses[selectedIndex].addressId.toString(),
        address: selected.address,
        province: selected.province,
        updatedAt: new Date(),
      } })
      return response.json({ message: 'Đã lưu địa chỉ.', user: safeUser(await users.findOne({ _id: userId })) })
    } catch (error) { return next(error) }
  })

  router.delete('/me/addresses/:id', requireAuth, async (request, response, next) => {
    try {
      const userId = new ObjectId(request.authUser.id)
      const user = await users.findOne({ _id: userId, status: 'Active' })
      if (!user) return response.status(404).json({ error: 'Không tìm thấy tài khoản.' })
      const addresses = userAddresses(user)
      const remaining = addresses.filter((item) => item.id !== request.params.id)
      if (remaining.length === addresses.length) return response.status(404).json({ error: 'Không tìm thấy địa chỉ cần xóa.' })
      if (!remaining.some((item) => item.isDefault) && remaining.length) remaining[0].isDefault = true
      const selected = remaining.find((item) => item.isDefault)
      const storedAddresses = toStoredAddresses(remaining, user)
      await users.updateOne({ _id: userId }, { $set: {
        addresses: storedAddresses,
        address: selected?.address || '',
        province: selected?.province || '',
        defaultAddressId: selected ? storedAddresses[remaining.findIndex((item) => item.isDefault)].addressId.toString() : '',
        updatedAt: new Date(),
      } })
      return response.json({ message: 'Đã xóa địa chỉ.', user: safeUser(await users.findOne({ _id: userId })) })
    } catch (error) { return next(error) }
  })

  router.post('/register', async (request, response, next) => {
    try {
      const fullName = String(request.body.fullName || '').trim()
      const email = String(request.body.email || '').trim().toLowerCase()
      const phone = String(request.body.phone || '').trim()
      const password = String(request.body.password || '')

      if (!fullName || !email || !phone || !password) {
        return response.status(400).json({ error: 'Vui lòng nhập đủ thông tin.' })
      }

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return response.status(400).json({ error: 'Email chưa đúng định dạng.' })
      }

      if (!/^[0-9]{9,11}$/.test(phone)) {
        return response.status(400).json({ error: 'Số điện thoại cần có 9–11 chữ số.' })
      }

      if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        return response.status(400).json({ error: 'Mật khẩu cần từ 8 ký tự trở lên.' })
      }

      const existingUser = await users.findOne({ email })
      if (existingUser) {
        return response.status(409).json({ error: 'Email này đã được đăng ký.' })
      }

      const user = {
        fullName,
        email,
        phone,
        address: '',
        province: '',
        passwordHash: await bcrypt.hash(password, 12),
        role: 'Customer',
        status: 'Active',
        createdAt: new Date(),
      }

      const result = await users.insertOne(user)
      user._id = result.insertedId

      return response.status(201).json({
        message: 'Đăng ký thành công. Vui lòng đăng nhập.',
      })
    } catch (error) {
      if (error.code === 11000) {
        return response.status(409).json({ error: 'Email này đã được đăng ký.' })
      }
      return next(error)
    }
  })

  router.post('/forgot-password', async (request, response, next) => {
    try {
      const email = String(request.body.email || '').trim().toLowerCase()
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return response.status(400).json({ error: 'Email chưa đúng định dạng.' })
      }

      const user = await users.findOne({ email })
      let resetUrl

      // Luôn trả cùng thông báo để không tiết lộ email nào đã đăng ký.
      if (user) {
        await passwordResets.deleteMany({ userId: user._id, isUsed: false })

        const rawToken = randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

        await passwordResets.insertOne({
          userId: user._id,
          token: hashResetToken(rawToken),
          expiresAt,
          isUsed: false,
        })

        resetUrl = `/reset-password?token=${rawToken}`
      } else {
        console.info(`Không tìm thấy tài khoản trong users với email: ${email}`)
      }

      return response.json({
        message: 'Yêu cầu đặt lại mật khẩu đã được xử lý.',
        ...(resetUrl ? { resetUrl } : {}),
      })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/reset-password', async (request, response, next) => {
    try {
      const token = String(request.body.token || '').trim()
      const password = String(request.body.password || '')

      if (!token || !password) {
        return response.status(400).json({ error: 'Vui lòng nhập mã đặt lại và mật khẩu mới.' })
      }

      if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        return response.status(400).json({ error: 'Mật khẩu cần từ 8 ký tự trở lên.' })
      }

      const now = new Date()
      const resetRecord = await passwordResets.findOne({
        token: hashResetToken(token),
        isUsed: false,
        expiresAt: { $gt: now },
      })

      if (!resetRecord) {
        return response.status(400).json({ error: 'Mã đặt lại không hợp lệ, đã hết hạn hoặc đã được sử dụng.' })
      }

      // Đánh dấu mã đã dùng trước để ngăn việc gửi lại cùng một mã nhiều lần.
      const consumeResult = await passwordResets.updateOne(
        { _id: resetRecord._id, isUsed: false, expiresAt: { $gt: now } },
        { $set: { isUsed: true } },
      )

      if (consumeResult.modifiedCount !== 1) {
        return response.status(400).json({ error: 'Mã đặt lại không hợp lệ, đã hết hạn hoặc đã được sử dụng.' })
      }

      const updateResult = await users.updateOne(
        { _id: resetRecord.userId, status: 'Active' },
        { $set: { passwordHash: await bcrypt.hash(password, 12) } },
      )

      if (updateResult.matchedCount !== 1) {
        return response.status(400).json({ error: 'Không thể đặt lại mật khẩu cho tài khoản này.' })
      }

      return response.json({ message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.' })
    } catch (error) {
      return next(error)
    }
  })

  router.post('/login', async (request, response, next) => {
    try {
      const identifier = String(request.body.identifier || request.body.email || '').trim()
      const password = String(request.body.password || '')

      if (!identifier || !password) {
        return response.status(400).json({ error: 'Vui lòng nhập email/số điện thoại và mật khẩu.' })
      }

      const user = await users.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { phone: identifier },
        ],
      })
      const passwordMatches = user
        ? await bcrypt.compare(password, user.passwordHash)
        : false

      if (!user || !passwordMatches) {
        return response.status(401).json({ error: 'Email hoặc mật khẩu không đúng.' })
      }

      if (user.status !== 'Active') {
        return response.status(403).json({ error: 'Tài khoản hiện không hoạt động.' })
      }

      return response.json({
        message: 'Đăng nhập thành công.',
        token: createToken(user),
        user: safeUser(user),
      })
    } catch (error) {
      return next(error)
    }
  })

  return router
}

export function createAuthMiddleware(database, jwtSecret) {
  const requireAuth = async (request, response, next) => {
    try {
      const authorization = request.get('authorization') || ''
      const [scheme, token] = authorization.split(' ')

      if (scheme !== 'Bearer' || !token) {
        return response.status(401).json({ error: 'Vui lòng đăng nhập.' })
      }

      const payload = jwt.verify(token, jwtSecret)

      if (!ObjectId.isValid(payload.sub)) {
        return response.status(401).json({ error: 'Phiên đăng nhập không hợp lệ.' })
      }

      const user = await database.collection('users').findOne(
        { _id: new ObjectId(payload.sub) },
        { projection: { fullName: 1, email: 1, phone: 1, role: 1, status: 1 } },
      )

      if (!user || user.status !== 'Active') {
        return response.status(401).json({ error: 'Tài khoản không hoạt động.' })
      }

      request.authUser = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      }

      return next()
    } catch {
      return response.status(401).json({ error: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' })
    }
  }

  const requireAdmin = (request, response, next) => {
    if (request.authUser?.role !== 'Admin') {
      return response.status(403).json({ error: 'Chức năng này chỉ dành cho admin.' })
    }
    return next()
  }

  return { requireAuth, requireAdmin }
}
