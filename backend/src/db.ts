import { PrismaClient } from '@prisma/client'

// Một PrismaClient dùng chung cho cả tiến trình.
export const prisma = new PrismaClient()
