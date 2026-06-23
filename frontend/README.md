# Demo · Bản đồ "Săn địa danh" Việt Nam

Prototype tương tác để **demo với khách hàng**. Toàn bộ dữ liệu là **mock data** (giả lập trên trình duyệt, chưa có backend / cơ sở dữ liệu thật).

Kế hoạch tổng thể: [../plan/ke-hoach-thiet-ke-website.md](../plan/ke-hoach-thiet-ke-website.md)

---

## ▶️ Cách chạy

Yêu cầu: **Node.js ≥ 18**.

```bash
cd Demo
npm install
npm run dev
```

Trình duyệt sẽ tự mở tại `http://localhost:5173`.

Build bản tĩnh để mang đi demo / deploy:

```bash
npm run build      # tạo thư mục dist/
npm run preview    # xem thử bản build
```

> Routing dùng **HashRouter** nên bản build (`dist/`) mở trực tiếp hay đặt ở
> thư mục con nào cũng chạy, không cần cấu hình server.

---

## 🔑 Tài khoản demo (Trang quản trị)

| Mục | Giá trị |
|-----|---------|
| Đường dẫn | nút **Quản trị** ở góc phải, hoặc `/#/admin` |
| Tài khoản | `admin` |
| Mật khẩu | `admin123` |

---

## ✨ Tính năng đã có trong prototype

Bám sát yêu cầu trong tài liệu gốc:

1. **Bản đồ Việt Nam** (dữ liệu địa lý thật) với **50 ghim** đặt đúng vị trí.
   - 🟢 **Xanh** = còn trống (chạm để chọn) · ⚪ **Xám + ổ khóa** = đã có người chọn (không bấm được) · 🟡 **Vàng** = ghim của bạn.
   - **Phóng to / thu nhỏ / kéo di chuyển** mượt như Google Maps (cuộn chuột, chạm 2 ngón, double-click, nút +/−, nút về vị trí gốc).
   - Có khung **Quần đảo Hoàng Sa / Trường Sa**.
2. **Bộ lọc & tìm kiếm** theo tên địa danh / tỉnh / mã (không phân biệt dấu). Bấm vào kết quả → bản đồ **"bay" tới** ghim đó.
3. **Chọn ghim**: nhập **Họ tên + Số điện thoại** (có kiểm tra định dạng SĐT Việt Nam) → xác nhận → hiệu ứng **chúc mừng + pháo giấy**.
4. **Ẩn danh**: ở giao diện người dùng, ghim đã chọn **không** lộ bất kỳ thông tin nào của chủ sở hữu.
5. **Realtime (mô phỏng)**: thỉnh thoảng "có người khác" chọn một ghim → ghim tự chuyển sang xám + hiện thông báo, ngay trên màn hình của bạn.
6. **Chống chọn trùng**: nếu ghim vừa bị người khác lấy mất, hoặc 1 số điện thoại cố chọn 2 ghim → báo lỗi thân thiện.
7. **Trang quản trị** (cần đăng nhập):
   - Thống kê: tổng / đã chọn / còn trống / tỉ lệ lấp đầy.
   - Bảng danh sách 50 địa danh, tìm kiếm & lọc theo trạng thái.
   - **Xem đầy đủ** họ tên + số điện thoại khách (theo quyết định đã chốt).
   - **Sửa tên / mã** địa danh — cập nhật phản ánh ngay ra bản đồ.
8. **UX/UI cho mọi đối tượng**: chữ to, nút lớn, tương phản cao, responsive (mobile có bộ lọc dạng bottom-sheet), hỗ trợ bàn phím, tôn trọng tùy chọn *giảm chuyển động*.

---

## 🎬 Gợi ý kịch bản demo (3 phút)

1. Mở trang → 50 ghim **rơi xuống** lần lượt theo dáng đất nước.
2. **Cuộn/kéo** bản đồ, phóng to vùng miền Trung để thấy thao tác mượt.
3. Gõ "Hạ Long" hoặc "Đà Nẵng" ở ô tìm kiếm → bấm kết quả → bản đồ **bay tới** ghim.
4. Bấm một ghim **xanh** → nhập Họ tên + SĐT → **Xác nhận** → xem hiệu ứng chúc mừng.
5. Thử bấm một ghim **xám** → không chọn được (đã có người sở hữu).
6. Chờ vài giây → thấy **thông báo realtime** "Vừa có người chọn …" và một ghim đổi màu.
7. Vào **Quản trị** (`admin` / `admin123`) → xem thống kê, danh sách đầy đủ thông tin khách, thử **sửa tên** một địa danh rồi quay lại bản đồ xem thay đổi.

---

## 🧱 Công nghệ

React + Vite + TypeScript · TailwindCSS · Framer Motion (chuyển động) ·
react-zoom-pan-pinch (zoom/pan) · bản đồ SVG dựng từ GeoJSON thật bằng phép
chiếu Mercator tự viết · canvas-confetti.

## 📁 Cấu trúc

```
frontend/
├─ src/
│  ├─ components/   # MapView, PinMarker, SearchPanel, ClaimModal, ...
│  ├─ pages/        # PublicPage, AdminLogin, AdminDashboard
│  ├─ store/        # state (mock) + mô phỏng realtime + auth
│  ├─ lib/          # projection (d3-geo), phone, format, colors
│  └─ data/         # vietnam.json (bản đồ) + 50 địa danh + owner giả
└─ ...
```

## ⚠️ Lưu ý

- **Toàn bộ là mock data**, lưu tạm trong bộ nhớ trình duyệt — **tải lại trang là về trạng thái ban đầu**.
- Đăng nhập admin chỉ là mô phỏng phía client, **chưa bảo mật** — bản thật sẽ dùng backend + JWT như trong kế hoạch.
- Toạ độ 50 địa danh là **xấp xỉ**, có thể tinh chỉnh khi chốt danh sách chính thức.
