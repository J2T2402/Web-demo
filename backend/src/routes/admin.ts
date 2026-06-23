import { Router } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { prisma } from '../db'
import { signToken, requireAdmin } from '../lib/auth'
import { decrypt } from '../lib/crypto'

export const adminRouter = Router()

const loginLimiter = rateLimit({ windowMs: 60_000, max: 10 })
const LoginBody = z.object({ username: z.string().min(1), password: z.string().min(1) })

// POST /api/admin/login — trả JWT nếu đúng tài khoản.
adminRouter.post('/login', loginLimiter, async (req, res) => {
  const parsed = LoginBody.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid' })

  const username = parsed.data.username.trim()
  const user = await prisma.adminUser.findUnique({ where: { username } })
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: 'invalid_credentials' })
  }
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  return res.json({ token: signToken({ uid: user.id, username: user.username }) })
})

// Các route dưới đây yêu cầu đăng nhập.
adminRouter.use(requireAdmin)

// GET /api/admin/locations — kèm ĐẦY ĐỦ họ tên + SĐT (giải mã).
adminRouter.get('/locations', async (_req, res) => {
  const locs = await prisma.location.findMany({ orderBy: { id: 'asc' }, include: { claim: true } })
  res.json(
    locs.map((l) => ({
      id: l.id,
      name: l.name,
      province: l.province,
      lat: l.lat,
      lng: l.lng,
      status: l.status === 'OWNED' ? 'owned' : 'available',
      owner: l.claim
        ? {
            fullName: decrypt(l.claim.fullNameEnc),
            phone: decrypt(l.claim.phoneEnc),
            claimedAt: l.claim.createdAt.toISOString(),
          }
        : undefined,
    })),
  )
})

// GET /api/admin/stats — thống kê nhanh.
adminRouter.get('/stats', async (_req, res) => {
  const total = await prisma.location.count()
  const owned = await prisma.location.count({ where: { status: 'OWNED' } })
  res.json({ total, owned, available: total - owned, pct: total ? Math.round((owned / total) * 100) : 0 })
})

const PatchBody = z.object({ name: z.string().min(1).max(120) })

// PATCH /api/admin/locations/:id — sửa tên địa danh.
adminRouter.patch('/locations/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = PatchBody.safeParse(req.body)
  if (!Number.isInteger(id) || !parsed.success) return res.status(400).json({ error: 'invalid' })
  const updated = await prisma.location.update({
    where: { id },
    data: { name: parsed.data.name.trim() },
  })
  res.json({ id: updated.id, name: updated.name })
})
