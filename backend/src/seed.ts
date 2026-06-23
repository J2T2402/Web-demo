import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { ENV } from './env'
import { parseLocationList } from './data/locationList'

/**
 * Seed idempotent — gọi tự động lúc khởi động server:
 *  - Nếu chưa có địa danh nào: chèn đủ 50 ghim (trạng thái AVAILABLE).
 *  - Nếu chưa có admin: tạo tài khoản admin từ biến môi trường.
 * An toàn khi chạy lại nhiều lần.
 */
export async function ensureSeed(): Promise<void> {
  const count = await prisma.location.count()
  if (count === 0) {
    // Nguồn dữ liệu duy nhất: document/LocationList.md
    const locations = parseLocationList()
    await prisma.location.createMany({
      data: locations.map((l) => ({
        id: l.id,
        name: l.name,
        province: l.province,
        lat: l.lat,
        lng: l.lng,
      })),
    })
    console.log(`[seed] Đã chèn ${locations.length} địa danh từ LocationList.md`)
  }

  const admin = await prisma.adminUser.findUnique({ where: { username: ENV.ADMIN_USERNAME } })
  if (!admin) {
    await prisma.adminUser.create({
      data: {
        username: ENV.ADMIN_USERNAME,
        passwordHash: await bcrypt.hash(ENV.ADMIN_PASSWORD, 10),
      },
    })
    console.log(`[seed] Đã tạo admin '${ENV.ADMIN_USERNAME}'`)
  }
}

// Cho phép chạy thủ công: `npm run seed`
if (require.main === module) {
  ensureSeed()
    .then(() => prisma.$disconnect())
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
