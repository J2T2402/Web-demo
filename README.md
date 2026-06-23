# WebEventQH — Bản đồ săn địa danh Việt Nam

Website sự kiện: bản đồ Việt Nam tương tác với 50 ghim địa danh. Người tham gia "chọn/sở hữu"
một địa danh bằng Họ tên + SĐT; admin quản lý qua trang quản trị riêng. Realtime + chống chọn trùng.

> Tài liệu: [requirment](document/requirment.md) · [Kế hoạch chi tiết](plan/ke-hoach-thiet-ke-website.md) · [50 địa danh](document/LocationList.md)

## Cấu trúc

```
WebEventQH/
├── frontend/            # Frontend — React 18 + Vite + TS + Tailwind (gọi API thật, fallback demo)
├── backend/             # Backend — Node + Express + Socket.IO + Prisma + PostgreSQL
├── Dockerfile           # Multi-stage: build FE + BE -> 1 image (Cách 1: gộp FE+BE)
├── docker-compose.yml   # app (Node) + db (PostgreSQL) [+ Caddy tùy chọn]
├── Caddyfile            # TLS tự động (tùy chọn)
└── .env.example         # Biến môi trường cho deploy (compose)
```

Kiến trúc deploy: **một tiến trình Node phục vụ cả frontend, API và realtime trên 1 domain**
(xem [plan Mục 10](plan/ke-hoach-thiet-ke-website.md)).

---

## Chạy ở máy local (dev)

Cần: **Node 20+** và một **PostgreSQL** (cài sẵn, hoặc chạy nhanh bằng Docker).

```bash
# 0) (tùy chọn) Postgres nhanh bằng Docker
docker run -d --name webevent-pg -e POSTGRES_USER=webevent \
  -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=webevent -p 5432:5432 postgres:16-alpine

# 1) Backend
cd backend
cp .env.example .env          # sửa DATABASE_URL cho khớp Postgres ở trên
npm install
npx prisma generate
npx prisma db push            # tạo bảng từ schema
npm run dev                   # http://localhost:3000  (tự seed 50 địa danh + admin)

# 2) Frontend (terminal khác)
cd frontend
npm install
npm run dev                   # http://localhost:5173  (proxy /api + /socket.io -> :3000)
```

- Mở **http://localhost:5173** — bản đồ; **/#/admin** — trang quản trị.
- Tài khoản admin mặc định: **admin / admin123** (đổi qua biến `ADMIN_*`).
- Nếu backend chưa chạy, frontend **tự fallback** sang dữ liệu demo (mock) để vẫn xem được giao diện.

---

## Deploy lên server (1 VPS — Cách 1)

Yêu cầu: VPS có **Docker + Docker Compose** (xem các bước chuẩn bị server trong plan Mục 10.9).

```bash
git clone <repo>  &&  cd WebEventQH
cp .env.example .env          # ĐỔI tất cả mật khẩu/khóa bí mật
docker compose up -d --build  # build & chạy app + postgres
```

- App chạy ở cổng **3000**. Bật HTTPS bằng cách bỏ comment service `caddy` trong
  `docker-compose.yml`, sửa domain trong `Caddyfile`, rồi `docker compose up -d`.
- DB tự đồng bộ schema (`prisma db push`) và server **tự seed** 50 địa danh + admin lần đầu.
- Xem log: `docker compose logs -f app` · Sao lưu DB: `pg_dump` trên volume `pgdata`.

---

## Sửa danh sách 50 địa danh

**Nguồn dữ liệu duy nhất: [document/LocationList.md](document/LocationList.md).** Mỗi dòng:

```
STT. Tên - vĩ độ, kinh độ - Tỉnh/Thành
```

Thêm/sửa/xóa địa danh chỉ cần sửa file này — server tự parse khi seed lần đầu
(thứ tự không quan trọng; tỉnh/thành có thể bỏ trống). Để seed lại sau khi đổi:
xóa dữ liệu địa danh trong DB rồi khởi động lại (server seed khi bảng rỗng), hoặc chạy `npm run seed`.

> Lưu ý: file `frontend/src/data/locations.ts` chỉ là dữ liệu cho **chế độ demo offline** (khi backend
> chưa chạy). Dữ liệu thật ở production luôn đến từ API, được seed từ `LocationList.md`.

## API tóm tắt

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/locations` | 50 ghim (công khai, **ẩn danh** — không kèm thông tin chủ) |
| POST | `/api/locations/:id/claim` | Body `{fullName, phone}` — đăng ký (transaction chống trùng) |
| WS | `/socket.io` | Sự kiện `location:claimed` (realtime đổi xám) |
| POST | `/api/admin/login` | `{username, password}` → JWT |
| GET | `/api/admin/locations` | Danh sách kèm **đầy đủ** họ tên + SĐT (giải mã) |
| GET | `/api/admin/stats` | Thống kê đã chọn / còn trống |
| PATCH | `/api/admin/locations/:id` | Sửa tên địa danh |

## Bảo mật (đã áp dụng ở khung này)

- PII (Họ tên + SĐT) **mã hóa AES-256-GCM** khi lưu; chỉ admin đã đăng nhập mới giải mã xem.
- `phoneHash` (HMAC) **UNIQUE** → 1 SĐT = 1 ghim; `locationId` **UNIQUE** → 1 ghim = 1 chủ.
- Chọn ghim chạy trong **transaction** + cập nhật nguyên tử có điều kiện → chống chọn trùng.
- Mật khẩu admin băm **bcrypt**; đăng nhập có **rate-limit**; API claim có **rate-limit**.
- API công khai **không bao giờ** trả thông tin chủ ghim.
