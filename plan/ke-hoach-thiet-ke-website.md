# Kế hoạch thiết kế Website Sự kiện – Bản đồ "Săn địa danh" Việt Nam

> Tài liệu nguồn: [requirment.md](../document/requirment.md) · Ảnh tham khảo: [img_example.jpg](../document/img_example.jpg)
> Ngày lập: 22/06/2026

---

## 1. Tổng quan & mục tiêu

Xây dựng một website cho **sự kiện nội bộ của công ty**, trọng tâm là một **bản đồ Việt Nam tương tác** hiển thị 50 ghim địa danh. Người tham gia "chọn/sở hữu" một địa danh bằng cách điền Họ tên + Số điện thoại. Admin quản lý toàn bộ trạng thái qua một trang quản trị riêng.

**Hai mục tiêu chất lượng cao nhất (theo yêu cầu công ty):**
1. **Chuyển động mượt mà** — phóng to/thu nhỏ, kéo thả bản đồ, hover/chọn ghim, mở popup… tất cả phải mượt như Google Maps, không giật.
2. **UX/UI phù hợp mọi đối tượng** — từ nhân viên trẻ rành công nghệ đến người lớn tuổi ít dùng web; chạy tốt trên cả điện thoại và máy tính.

### Phân tích ảnh tham khảo
Ảnh mẫu là **bản đồ Việt Nam cách điệu (đồ họa)**, nền xám nhạt, có đầy đủ đường biên các tỉnh, kèm khung phụ **Quần đảo Hoàng Sa**. Mỗi ghim là giọt nước màu đỏ chứa **số thứ tự (1–50)**. Đây là phong cách "bản đồ minh họa", **không phải bản đồ vệ tinh/tile** → định hướng kỹ thuật nên dùng **SVG**, không dùng Google Maps tiles.

---

## 2. Chốt yêu cầu chức năng

| # | Chức năng | Mô tả | Ghi chú thiết kế |
|---|-----------|-------|------------------|
| 1 | Bản đồ + 50 ghim | Hiển thị bản đồ VN với 50 ghim địa danh | SVG cách điệu giống ảnh mẫu |
| 1a | Trạng thái màu | Xanh = còn trống (bấm được); Xám = đã có chủ (khóa, không bấm) | Animation đổi màu khi vừa bị chọn |
| 1b | Bộ lọc | Lọc/tìm theo tên địa danh | Ô search + danh sách; bấm vào sẽ "bay" tới ghim |
| 1c | Zoom/Pan | Phóng to/thu nhỏ, kéo di chuyển như Google Maps | Cuộn chuột, pinch, nút +/−, double-click |
| 2 | Sở hữu 1 ghim | User chọn ghim → nhập **Họ tên** + **Số điện thoại** để xác nhận | 1 user = 1 ghim |
| 3 | Ẩn danh (public) | Phía người dùng/công khai: ghim đã chọn chỉ hiện màu xám + "Đã được chọn", **không lộ** tên/SĐT | Admin thì xem được đầy đủ (xem 3a) |
| 3a | Admin xem đầy đủ | Trang admin hiển thị **đầy đủ Họ tên + Số điện thoại** của khách | Cần kiểm soát truy cập + mã hóa khi lưu |
| 4 | Trang Admin | Xem danh sách địa danh đã/chưa có người chọn; **sửa tên** địa danh | Có thống kê, tìm kiếm, lọc |
| 5 | Đăng nhập Admin | Admin phải đăng nhập mới dùng được trang quản trị | JWT + mật khẩu băm |

### ✅ Các quyết định đã CHỐT (cập nhật 22/06/2026)

1. **Danh tính "1 user" = Số điện thoại.** Mỗi SĐT chỉ sở hữu 1 ghim (ràng buộc UNIQUE trên SĐT). **OTP chưa làm ở giai đoạn này** — thiết kế hệ thống để **có thể bật OTP sau** mà không phá vỡ cấu trúc (luồng xác nhận tách riêng bước verify SĐT).
2. **Public ẩn danh:** ghim đã có chủ chỉ hiện xám + "Đã được chọn", không lộ thông tin cá nhân.
3. **Admin xem ĐẦY ĐỦ:** họ tên + số điện thoại đầy đủ của khách (override yêu cầu "4 số cuối" trong tài liệu gốc). → dữ liệu cá nhân **mã hóa khi lưu** (reversible) để admin giải mã xem; siết quyền truy cập + ghi log.
4. **Realtime: BẮT BUỘC.** Khi 1 người chọn ghim, mọi người khác thấy ghim chuyển xám ngay lập tức.
5. **Mục tiêu quy mô:** hệ thống chạy ổn với **≥ 50 user đồng thời** (xem Mục 9.1 về tải).
6. **Backend phải xử lý tranh chấp:** nhiều user chọn cùng 1 địa danh & bấm xác nhận cùng lúc → chỉ 1 người thắng (xem **Mục 9** đã đặc tả chi tiết cơ chế).

> Còn mở (chưa gấp): admin sửa **tên** địa danh, có thể thêm bật/tắt khả dụng — sẽ chốt khi dựng trang admin.

---

## 3. Đề xuất công nghệ (Tech Stack)

Ưu tiên: mượt, dễ làm UI đẹp, dễ triển khai cho 1 sự kiện nhỏ.

### Frontend
- **React 18 + Vite + TypeScript** — nhanh, hệ sinh thái mạnh.
- **TailwindCSS** — dựng UI nhất quán, responsive nhanh.
- **Framer Motion** — animation mượt (ghim, popup, chuyển trang) với GPU transform.
- **react-zoom-pan-pinch** — zoom/pan/pinch mượt như Google Maps cho khối SVG (hoặc `d3-zoom` nếu cần kiểm soát sâu).
- **Bản đồ:** **SVG Việt Nam** (đầy đủ tỉnh + khung Hoàng Sa), 50 ghim đặt theo tọa độ % cố định trong cùng hệ SVG → zoom là biến đổi `transform` nên **luôn nét, không vỡ**.
- React Hook Form + Zod — form nhập liệu + validate (định dạng SĐT VN).

### Backend
- **Node.js + Express (hoặc Fastify) + TypeScript** — gọn, đủ dùng.
- **Prisma ORM** — model dữ liệu rõ ràng, migration dễ.
- **Xác thực admin:** JWT (access token) + mật khẩu băm bằng **bcrypt/argon2**.
- **Realtime (BẮT BUỘC — đã chốt):** **Socket.IO** để phát sự kiện "ghim X vừa bị chọn" tới mọi client. Mục tiêu ≥ 50 user đồng thời (xem Mục 9.3).

### Database
- **PostgreSQL** cho production (ổn định, hỗ trợ giao dịch tốt — quan trọng để chống tranh chấp chọn trùng ghim).
- Có thể dùng **SQLite** cho bản demo/triển khai siêu nhẹ.

### Triển khai (Deploy) — đã chốt: gộp FE + BE trên 1 domain (Cách 1)
- **Một tiến trình Node/Express duy nhất** phục vụ cả frontend (file đã build) + API + Socket.IO, dưới **cùng 1 domain** → không vướng CORS, chỉ 1 chứng chỉ SSL, rẻ & gọn.
- Đóng gói bằng **Docker Compose** (Node + PostgreSQL) trên **1 VPS nhỏ**.
- **HTTPS bắt buộc** (bảo vệ SĐT người dùng) — dùng Caddy/Cloudflare tự cấp Let's Encrypt.
- 👉 Chi tiết kỹ thuật (Dockerfile, docker-compose, cấu hình Express, SSL, các bước deploy) ở **Mục 10**.

> **Phương án thay thế cực nhanh:** dùng **Supabase** (Postgres + Auth + Realtime sẵn có) để rút ngắn thời gian backend. Khi đó vẫn gộp FE + API như Cách 1, chỉ thay PostgreSQL tự quản bằng Supabase. Nêu ra để công ty cân nhắc nếu muốn làm gấp.

---

## 4. Mô hình dữ liệu (Data Model)

```
Location (Địa danh / Ghim)
  id            int (1..50)
  name          string        // tên đầy đủ địa danh
  x, y          float         // tọa độ trên SVG (vị trí ghim)
  status        enum(AVAILABLE | OWNED)
  createdAt, updatedAt

Claim (Lượt sở hữu)
  id            int
  locationId    int  -> Location (UNIQUE: 1 địa danh = 1 chủ)
  fullName      string(enc)   // mã hóa reversible; admin giải mã xem đầy đủ
  phone         string(enc)   // mã hóa reversible; admin xem đầy đủ
  phoneHash     string UNIQUE // băm SĐT để kiểm tra trùng "1 SĐT = 1 ghim" mà không cần giải mã
  ipAddress     string        // chỉ phục vụ rate-limit/chống spam, KHÔNG dùng làm danh tính
  createdAt

AdminUser
  id            int
  username      string (unique)
  passwordHash  string        // bcrypt/argon2
  createdAt, lastLoginAt
```

**Ràng buộc quan trọng (ở tầng DB — lớp bảo vệ cuối cùng):**
- `Claim.locationId` **UNIQUE** → một địa danh không thể có 2 chủ (đã chốt).
- `Claim.phoneHash` **UNIQUE** → một SĐT chỉ tạo được 1 Claim (đã chốt: 1 SĐT = 1 ghim).
- Thao tác chọn ghim chạy nguyên tử trong **transaction** (chi tiết ở **Mục 9**).

---

## 5. Thiết kế API (sơ bộ)

### Public
| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| GET | `/api/locations` | Danh sách 50 ghim (chỉ trạng thái + tên + tọa độ, **không** kèm thông tin chủ) |
| POST | `/api/locations/:id/claim` | Body: `{ fullName, phone }` → đăng ký sở hữu (validate, kiểm tra trùng, transaction) |
| WS/SSE | `/events` | Phát realtime: `location.claimed` để client cập nhật màu |

### Admin (yêu cầu JWT)
| Method | Endpoint | Chức năng |
|--------|----------|-----------|
| POST | `/api/admin/login` | Đăng nhập → trả JWT |
| GET | `/api/admin/locations` | Danh sách kèm trạng thái + **đầy đủ Họ tên + SĐT** của khách (giải mã, có ghi log truy cập) |
| GET | `/api/admin/stats` | Thống kê: đã chọn / còn trống / tỉ lệ |
| PATCH | `/api/admin/locations/:id` | Sửa `name`, (tùy chọn) bật/tắt khả dụng |

---

## 6. UX/UI – trọng tâm trải nghiệm

### Nguyên tắc "phù hợp mọi đối tượng"
- **Đơn giản, ít bước:** chọn ghim → điền 2 ô → xong. Không bắt đăng ký tài khoản.
- **Chữ to, tương phản cao, nút lớn** (mục tiêu chạm ≥ 44px) — thân thiện người lớn tuổi & dùng điện thoại.
- **Ngôn ngữ tiếng Việt rõ ràng**, có hướng dẫn ngắn ngay trên màn hình ("Chạm vào ghim xanh để chọn địa danh của bạn").
- **Phản hồi tức thì:** mọi thao tác có hiệu ứng (hover, loading, thành công/lỗi) để người dùng luôn biết hệ thống đang làm gì.
- **Khả năng tiếp cận (a11y):** hỗ trợ bàn phím (Tab/Enter), `aria-label` cho ghim, không chỉ dùng màu để phân biệt (xanh/xám kèm **icon khóa** + chữ).
- **Responsive:** mobile-first; trên điện thoại bản đồ chiếm toàn màn, panel lọc trượt lên từ dưới (bottom sheet).
- **Chú giải (legend):** góc màn hình giải thích Xanh = còn trống, Xám = đã chọn.

### Các màn hình chính
1. **Trang bản đồ (Home)** — bản đồ toàn màn; thanh tìm/lọc; nút zoom +/−, nút "về vị trí gốc"; legend; bộ đếm "Đã chọn 12/50".
2. **Popup chọn ghim** — hiện khi bấm ghim xanh: tên địa danh + form Họ tên/SĐT + nút "Xác nhận sở hữu".
3. **Màn hình thành công** — animation chúc mừng + ghim của bạn được đánh dấu.
4. **Trang đăng nhập Admin.**
5. **Dashboard Admin** — thống kê + bảng danh sách (lọc theo trạng thái, tìm theo tên), nút sửa tên địa danh.

---

## 7. Đặc tả CHUYỂN ĐỘNG (Animation) — yêu cầu mượt mà

Nguyên tắc kỹ thuật: chỉ animate `transform` và `opacity` (chạy trên GPU), tránh animate `width/height/top/left`; giữ **60fps**; tôn trọng `prefers-reduced-motion` (tắt bớt cho người nhạy cảm chuyển động).

| Tương tác | Hiệu ứng | Thông số gợi ý |
|-----------|----------|----------------|
| Zoom/Pan bản đồ | Quán tính & mượt như Google Maps | Cuộn chuột, pinch, double-click, nút +/−; có giới hạn min/max zoom |
| "Bay" tới ghim khi chọn từ bộ lọc | Pan + zoom có easing | ease-out ~600ms |
| Hover ghim | Phóng nhẹ + nảy lên | scale 1.0→1.15, spring |
| Ghim xuất hiện lần đầu | Rơi xuống lần lượt (stagger) | translateY + fade, delay theo thứ tự |
| Ghim vừa bị chọn (realtime) | Đổi xanh→xám + rung nhẹ 1 lần | color transition 300ms |
| Mở/đóng popup | Trượt + mờ dần | scale 0.95→1, fade 200ms |
| Xác nhận thành công | Hiệu ứng "tick" + confetti nhẹ | spring + canvas confetti |
| Chuyển trang/màn | Fade/slide nhẹ | 200–300ms |
| Loading | Skeleton/spinner mượt | tránh nhảy layout |

---

## 8. Bảo mật & quyền riêng tư

- **Mã hóa reversible** Họ tên + SĐT khi lưu DB (vì admin cần xem đầy đủ); khóa mã hóa giữ ngoài DB (biến môi trường/secret manager) → DB bị lộ vẫn không đọc được PII.
- **Public API không bao giờ trả về** thông tin chủ ghim (chỉ trạng thái + tên địa danh).
- **Chỉ admin đã đăng nhập** mới giải mã/xem được Họ tên + SĐT; **ghi log** mỗi lần truy cập dữ liệu cá nhân để truy vết.
- Admin: mật khẩu băm (bcrypt/argon2), JWT có hạn, **rate-limit** đăng nhập chống dò mật khẩu.
- **Rate-limit** API claim + (tùy chọn) CAPTCHA/OTP nhẹ chống spam đăng ký ảo.
- HTTPS toàn site; validate & sanitize mọi input; chống SQL injection (Prisma tham số hóa sẵn).
- Tuân thủ tinh thần bảo vệ dữ liệu cá nhân (PDPD/Nghị định 13).

---

## 9. Cơ chế chống chọn trùng (Concurrency) — YÊU CẦU TRỌNG TÂM #4

**Tình huống:** nhiều user cùng mở popup 1 địa danh và bấm "Xác nhận" trong vài mili-giây → phải đảm bảo **chỉ đúng 1 người thắng**, không bao giờ có 2 chủ, không tạo dữ liệu rác.

### 9.1 Cách xử lý ở Backend (nhiều lớp bảo vệ)

**Lớp 1 — Cập nhật nguyên tử có điều kiện (chính):**
Toàn bộ thao tác claim chạy trong **1 transaction**. Mấu chốt là một câu lệnh UPDATE có điều kiện trạng thái — DB tự đảm bảo chỉ 1 request "chiếm" được:

```sql
BEGIN;
  -- Chỉ chiếm được nếu ghim còn AVAILABLE. Trả về số dòng bị ảnh hưởng.
  UPDATE Location
     SET status = 'OWNED'
   WHERE id = :locationId AND status = 'AVAILABLE';
  -- Nếu 0 dòng bị ảnh hưởng => đã có người khác chiếm trước => ROLLBACK + báo lỗi.

  INSERT INTO Claim (locationId, fullName, phone, phoneHash, ipAddress)
  VALUES (:id, :encName, :encPhone, :phoneHash, :ip);
  -- UNIQUE(locationId) và UNIQUE(phoneHash) là "lưới an toàn" cuối cùng.
COMMIT;
```

- Đây là cập nhật **atomic** ở tầng DB — không cần lock thủ công vẫn an toàn. (Có thể thay bằng `SELECT ... FOR UPDATE` rồi mới UPDATE nếu cần khóa tường minh.)
- Người **thắng**: UPDATE đổi được 1 dòng → INSERT Claim thành công → COMMIT.
- Người **thua**: UPDATE đổi 0 dòng → ROLLBACK → trả lỗi 409 thân thiện: *"Rất tiếc, địa danh này vừa được người khác chọn. Mời bạn chọn địa danh khác nhé!"*

**Lớp 2 — Ràng buộc UNIQUE:** kể cả khi logic có lỗi, `UNIQUE(locationId)` chặn 2 Claim cùng địa danh; `UNIQUE(phoneHash)` chặn 1 SĐT lấy 2 ghim. Bắt lỗi vi phạm unique → trả về thông báo phù hợp.

**Lớp 3 — Chống double-click / gửi trùng:** nút "Xác nhận" **disable + hiện loading** ngay khi bấm; backend nhận diện request trùng (debounce/idempotency theo SĐT+ghim) để không xử lý 2 lần.

### 9.2 Realtime cập nhật cho mọi người
- Ngay khi 1 Claim COMMIT thành công, server **phát sự kiện `location.claimed`** (Socket.IO) tới tất cả client → ghim chuyển **xanh → xám** ngay, kèm animation.
- Nếu ai đó đang mở popup đúng ghim vừa bị chiếm → popup tự đóng + báo "địa danh vừa được chọn" → giảm tối đa cảnh bấm nhầm ghim đã hết.
- Client dùng cập nhật **lạc quan có đối soát**: hiện kết quả tạm, rồi đồng bộ theo phản hồi server (server là nguồn sự thật).

### 9.3 Đáp ứng quy mô ≥ 50 user đồng thời
- 50 user đồng thời là tải **rất nhẹ**: PostgreSQL xử lý hàng nghìn giao dịch/giây; điểm "nóng" duy nhất là vài ghim hot — đã được cập nhật nguyên tử nên không nghẽn.
- Socket.IO 1 tiến trình thừa sức vài nghìn kết nối → 50 kết nối không đáng kể.
- Có **chỉ mục** trên `Location.status`, `Claim.locationId`, `Claim.phoneHash`.
- Đặt **rate-limit** theo IP cho API claim/login (chống bot), pool kết nối DB hợp lý.
- (Không bắt buộc ở quy mô này) Nếu sau muốn scale nhiều tiến trình: thêm Redis adapter cho Socket.IO. Hiện tại **chưa cần**.

---

## 10. Triển khai: Gộp FE + BE trên 1 domain (Cách 1 — đã chốt)

> **Quyết định:** gói toàn bộ ứng dụng vào **một tiến trình Node/Express duy nhất** — server vừa phục vụ **file frontend đã build**, vừa chạy **API** và **Socket.IO realtime**, tất cả dưới **cùng một domain**. Không tách FE/BE khi deploy. Tối ưu cho sự kiện ngắn hạn: rẻ, gọn, không vướng CORS.

### 10.1 Vì sao chọn Cách 1

| Tiêu chí | Gộp 1 domain (Cách 1) | Tách FE/BE |
|----------|------------------------|------------|
| CORS | ✅ Cùng origin, không cần cấu hình | ⚠️ Phải mở CORS + cấu hình WebSocket cross-origin |
| Chi phí | ✅ 1 VPS / 1 nơi chạy | Tốn 2 nơi |
| SSL/HTTPS | ✅ 1 chứng chỉ cho cả site | Lo 2 chỗ |
| Realtime (Socket.IO) | ✅ Cùng origin → mượt, ít rắc rối | Dễ vướng lỗi cross-origin |
| Vận hành | ✅ 1 tiến trình, 1 log, 1 healthcheck | Phức tạp hơn |

→ Với mục tiêu ~50 user đồng thời cho một sự kiện ngắn hạn, **không cần** tách FE/BE để scale độc lập.

### 10.2 Sơ đồ & định tuyến

```
                        ┌─ GET /              → file tĩnh React (thư mục public/)
Domain (HTTPS) ── Node ─┼─ GET/POST /api/...  → API (Express router)
                        └─ WS   /socket.io/   → realtime (Socket.IO, cùng http server)
```

| Đường dẫn | Xử lý |
|-----------|-------|
| `tenmiien.com/` | Trả `index.html` + assets của React đã build |
| `tenmiien.com/api/...` | API công khai + admin (Express) |
| `tenmiien.com/socket.io/` | Kênh realtime phát sự kiện `location.claimed` |

### 10.3 Cấu trúc thư mục dự án (monorepo)

```
WebEventQH/
├── frontend/            # React + Vite + TS + Tailwind
│   ├── src/
│   └── package.json     # build → frontend/dist
├── backend/             # Node + Express + Socket.IO + Prisma
│   ├── src/
│   │   ├── index.ts     # khởi tạo http server + express + socket.io
│   │   ├── routes/      # /api công khai + /api/admin
│   │   ├── lib/         # mã hóa PII, auth JWT...
│   │   ├── data/        # locationList.ts — parse document/LocationList.md
│   │   └── seed.ts      # seed 50 địa danh từ document/LocationList.md
│   ├── prisma/schema.prisma
│   └── package.json     # build → backend/dist
├── Dockerfile           # multi-stage: build FE + build BE → 1 image chạy
├── docker-compose.yml   # app (Node) + db (PostgreSQL)
└── .env                 # biến môi trường (KHÔNG commit)
```

> Frontend (`frontend/`) gọi API thật + Socket.IO, có fallback dữ liệu demo khi backend chưa chạy.

### 10.4 Express phục vụ frontend (điểm mấu chốt)

Server đăng ký **API và Socket.IO TRƯỚC**, file tĩnh và route fallback ĐẶT SAU CÙNG — nếu không, route `*` sẽ "nuốt" mất `/api`.

```ts
import express from 'express'
import http from 'http'
import path from 'path'
import { Server as SocketServer } from 'socket.io'

const app = express()
const server = http.createServer(app)
const io = new SocketServer(server)        // cùng origin → KHÔNG cần cấu hình CORS

app.use(express.json())

// 1) API trước tiên
app.use('/api', apiRouter)                 // gồm cả /api/admin

// 2) Socket.IO tự gắn vào /socket.io qua server http ở trên
io.on('connection', (socket) => { /* phát/nhận sự kiện realtime */ })

// 3) Phục vụ file frontend đã build
const PUBLIC_DIR = path.resolve('public')  // chứa nội dung frontend/dist
app.use(express.static(PUBLIC_DIR))

// 4) SPA fallback: mọi route còn lại trả index.html (cho React Router dạng BrowserRouter)
app.get('*', (_req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')))

server.listen(process.env.PORT ?? 3000)
```

> **Lưu ý routing FE:** nếu dùng `BrowserRouter` thì cần SPA fallback ở (4) + đặt Vite `base: '/'`. Prototype hiện tại dùng `HashRouter` + `base: './'` (route nằm sau dấu `#`) nên không phụ thuộc fallback — cả hai đều chạy tốt khi gộp cùng origin.

### 10.5 Đóng gói — Dockerfile (multi-stage)

```dockerfile
# ---------- Stage 1: build frontend ----------
FROM node:20-alpine AS fe-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build                  # -> /app/frontend/dist

# ---------- Stage 2: build backend ----------
FROM node:20-alpine AS be-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate && npm run build   # -> /app/server/dist

# ---------- Stage 3: runtime (image gọn) ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/prisma ./prisma
RUN npx prisma generate
COPY --from=be-build /app/server/dist ./dist
COPY --from=fe-build /app/frontend/dist ./public   # nhúng FE vào server để phục vụ tĩnh
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 10.6 docker-compose — Node + PostgreSQL

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    env_file: .env
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    # chạy migrate trước rồi mới start server
    command: sh -c "npx prisma migrate deploy && node dist/index.js"

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

### 10.7 Biến môi trường (.env)

| Biến | Ví dụ | Ý nghĩa |
|------|-------|---------|
| `PORT` | `3000` | Cổng Node lắng nghe |
| `DATABASE_URL` | `postgresql://app:secret@db:5432/webevent` | Kết nối Postgres (host `db` = tên service trong compose) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `app` / `secret` / `webevent` | Khởi tạo container Postgres |
| `JWT_SECRET` | chuỗi ngẫu nhiên dài | Ký token đăng nhập admin |
| `ENCRYPTION_KEY` | khóa 32 byte (AES-256) | Mã hóa reversible Họ tên + SĐT (xem Mục 8) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | (dùng khi seed) | Tài khoản admin khởi tạo ban đầu |

> ⚠️ `.env` chứa bí mật → thêm vào `.gitignore`, **không commit**. Khóa `ENCRYPTION_KEY` giữ ngoài DB (nguyên tắc ở Mục 8).

### 10.8 HTTPS/SSL

Ứng dụng vẫn là **1 tiến trình Node**; TLS được kết thúc bởi một lớp mỏng phía trước (cấu hình gần như bằng 0):

- **Phương án A — Caddy (khuyên dùng):** tự xin & gia hạn Let's Encrypt, tự chuyển HTTP→HTTPS, tự đẩy WebSocket. Thêm service `caddy` vào compose với `Caddyfile`:
  ```
  tenmiien.com {
      reverse_proxy app:3000
  }
  ```
- **Phương án B — Cloudflare:** trỏ domain qua Cloudflare (proxy bật), TLS tự động ở biên, không cần cài gì trên VPS.

> Socket.IO dùng cùng domain nên WebSocket upgrade đi qua Caddy/Cloudflare bình thường, không cần cấu hình đặc biệt.

### 10.9 Các bước deploy

1. Chuẩn bị VPS (Ubuntu) + cài **Docker** & **Docker Compose**.
2. Trỏ bản ghi **A** của domain về IP VPS.
3. Tạo file `.env` theo Mục 10.7.
4. Build & chạy: `docker compose up -d --build`.
5. Seed 50 địa danh: `docker compose exec app npx prisma db seed` (đọc từ [LocationList.md](../document/LocationList.md)).
6. Bật HTTPS (Caddy/Cloudflare theo Mục 10.8).
7. Kiểm tra: mở `https://tenmiien.com`, thử chọn ghim, mở 2 tab xem realtime đổi xám.

### 10.10 Vận hành & lưu ý

- **Migrate tự động** khi khởi động (`prisma migrate deploy` trong `command` của compose).
- **Sao lưu DB:** đặt cron `pg_dump` định kỳ trên volume `pgdata` (giữ PII an toàn).
- **Log & theo dõi:** `docker compose logs -f app`; healthcheck Postgres đã có sẵn ở compose.
- **Tài nguyên:** VPS **1–2 vCPU / 2GB RAM** là thừa cho ~50 user đồng thời.
- **Cập nhật bản mới:** `git pull && docker compose up -d --build` (downtime vài giây).

---

## 11. Lộ trình triển khai (đề xuất ~3–4 tuần)

| Giai đoạn | Công việc chính | Kết quả |
|-----------|-----------------|---------|
| **0. Chuẩn bị** (1–2 ngày) | Chốt các câu hỏi mục 2; chuẩn bị **SVG bản đồ VN** + dữ liệu 50 địa danh (tên, tọa độ) | Asset & dữ liệu sẵn sàng |
| **1. Nền tảng** (3–4 ngày) | Khởi tạo repo FE/BE, DB schema, seed 50 ghim, dựng API cơ bản | Chạy được khung |
| **2. Bản đồ tương tác** (4–5 ngày) | Render SVG + ghim, zoom/pan, màu trạng thái, bộ lọc/tìm | Bản đồ dùng được |
| **3. Luồng chọn ghim** (3–4 ngày) | Popup form, validate, transaction claim, màn thành công, ẩn danh | Người dùng chọn được ghim |
| **4. Admin** (3–4 ngày) | Đăng nhập, dashboard, danh sách + lọc, thống kê, sửa tên địa danh | Quản trị đầy đủ |
| **5. Realtime + Animation polish** (2–3 ngày) | Socket cập nhật live, tinh chỉnh toàn bộ hiệu ứng cho mượt | Trải nghiệm "wow" |
| **6. QA & Deploy** (2–3 ngày) | Test đa thiết bị/trình duyệt, bảo mật, tải, deploy + hướng dẫn | Lên sóng |

---

## 12. Tiêu chí nghiệm thu (Definition of Done)

- [ ] Bản đồ VN hiển thị đúng 50 ghim đúng vị trí, có khung Hoàng Sa.
- [ ] Ghim xanh bấm được, ghim xám bị khóa & có dấu hiệu rõ (màu + icon + chữ).
- [ ] Zoom/pan/pinch mượt trên cả desktop & mobile, đạt ~60fps.
- [ ] Lọc/tìm theo tên hoạt động, bấm kết quả "bay" tới ghim.
- [ ] Chọn ghim cần Họ tên + SĐT hợp lệ; chống chọn trùng & chống tranh chấp.
- [ ] Thông tin người dùng được ẩn danh; admin chỉ thấy 4 số cuối SĐT.
- [ ] Admin đăng nhập an toàn; xem danh sách/thống kê; sửa được tên địa danh.
- [ ] Giao diện responsive, chữ to dễ đọc, đạt yêu cầu a11y cơ bản.
- [ ] (Nếu chọn) realtime: ghim chuyển xám ngay khi người khác chọn.

---

## 13. Việc cần công ty cung cấp

1. **Danh sách 50 địa danh**: tên đầy đủ + vị trí (tọa độ) mong muốn trên bản đồ.
2. File **SVG/đồ họa bản đồ Việt Nam** (nếu công ty đã có sẵn theo brand), hoặc đồng ý để team dựng từ dữ liệu bản đồ chuẩn.
3. **Bộ nhận diện thương hiệu**: logo, màu chủ đạo, font (để UI khớp brand công ty).
4. Trả lời các câu hỏi chốt ở **mục 2**.
5. Thông tin **admin** ban đầu (ai quản trị) và nơi muốn deploy (domain).

---

> **Bước tiếp theo đề xuất:** công ty xác nhận các điểm ở Mục 2 + cung cấp dữ liệu Mục 12. Sau đó tôi sẽ chuyển kế hoạch này thành backlog chi tiết và bắt tay dựng khung dự án (Giai đoạn 1).
