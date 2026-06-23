import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { ENV } from '../env'

export interface AdminPayload {
  uid: number
  username: string
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '12h' })
}

/** Middleware: yêu cầu Bearer token hợp lệ; gắn req.admin nếu OK. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), ENV.JWT_SECRET) as AdminPayload
    ;(req as Request & { admin?: AdminPayload }).admin = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'unauthorized' })
  }
}
