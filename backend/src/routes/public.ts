import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../db'
import { normalizePhone, isValidVNPhone } from '../lib/phone'
import { encrypt, phoneHash } from '../lib/crypto'
import { emitClaimed } from '../lib/realtime'

export const publicRouter = Router()

/** Lỗi nghiệp vụ trong transaction claim (mang theo lý do để trả 409). */
class ClaimError extends Error {
  constructor(public reason: 'taken' | 'notfound') {
    super(reason)
  }
}

// GET /api/locations — danh sách công khai: KHÔNG kèm thông tin chủ (ẩn danh).
publicRouter.get('/locations', async (_req, res) => {
  const locs = await prisma.location.findMany({ orderBy: { id: 'asc' } })
  res.json(
    locs.map((l) => ({
      id: l.id,
      name: l.name,
      province: l.province,
      lat: l.lat,
      lng: l.lng,
      status: l.status === 'OWNED' ? 'owned' : 'available',
    })),
  )
})

const claimLimiter = rateLimit({ windowMs: 60_000, max: 30 })
const ClaimBody = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
})

// POST /api/locations/:id/claim — đăng ký sở hữu (transaction chống chọn trùng, Mục 9).
publicRouter.post('/locations/:id/claim', claimLimiter, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, reason: 'notfound' })

  const parsed = ClaimBody.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, reason: 'invalid' })

  const fullName = parsed.data.fullName.trim()
  const phone = normalizePhone(parsed.data.phone)
  if (!isValidVNPhone(phone)) return res.status(400).json({ ok: false, reason: 'invalid' })

  try {
    const loc = await prisma.$transaction(async (tx) => {
      // Lớp 1: cập nhật nguyên tử có điều kiện — chỉ chiếm được nếu còn AVAILABLE.
      const upd = await tx.location.updateMany({
        where: { id, status: 'AVAILABLE' },
        data: { status: 'OWNED' },
      })
      if (upd.count === 0) {
        const exists = await tx.location.findUnique({ where: { id } })
        throw new ClaimError(exists ? 'taken' : 'notfound')
      }
      // Lớp 2: UNIQUE(phoneHash)/UNIQUE(locationId) là lưới an toàn cuối; vi phạm -> rollback.
      await tx.claim.create({
        data: {
          locationId: id,
          fullNameEnc: encrypt(fullName),
          phoneEnc: encrypt(phone),
          phoneHash: phoneHash(phone),
          ipAddress: req.ip ?? null,
        },
      })
      return tx.location.findUniqueOrThrow({ where: { id } })
    })

    emitClaimed({
      id: loc.id,
      name: loc.name,
      province: loc.province,
      status: 'owned',
      claimedAt: new Date().toISOString(),
    })
    return res.json({ ok: true })
  } catch (e) {
    if (e instanceof ClaimError) return res.status(409).json({ ok: false, reason: e.reason })
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = String(e.meta?.target ?? '')
      // phoneHash trùng = SĐT đã sở hữu 1 ghim; còn lại coi như đã bị chiếm.
      return res
        .status(409)
        .json({ ok: false, reason: target.includes('phoneHash') ? 'duplicate' : 'taken' })
    }
    console.error('[claim] error', e)
    return res.status(500).json({ ok: false, reason: 'invalid' })
  }
})
