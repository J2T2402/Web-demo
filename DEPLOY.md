# Hướng dẫn Deploy lên DigitalOcean Droplet

Runbook đã kiểm chứng (build + chạy thử production y hệt trên máy local). Cấu hình: **Cách 1 — gộp FE + BE** (1 tiến trình Node phục vụ frontend + API + realtime), đóng gói bằng Docker Compose (app + PostgreSQL).

> Yêu cầu trước: Droplet Ubuntu đã cài **Docker + Docker Compose**, đã mở firewall 22/80/443, có user thường (xem plan Mục 10.9).

---

## Bước 1 — Đưa code lên Droplet

### Cách A — Git (khuyên dùng, dễ cập nhật về sau)
```bash
# Trên máy local: đẩy repo lên GitHub (1 lần)
# Trên Droplet:
git clone <URL_REPO> webevent && cd webevent
```

### Cách B — Copy thẳng từ máy local (không cần Git)
```powershell
# Chạy trên máy Windows (PowerShell). KHÔNG copy node_modules/dist/.env.
scp -r Dockerfile docker-compose.yml Caddyfile .dockerignore .env.example README.md `
    backend frontend document deploy@<IP_DROPLET>:~/webevent/
```
> Trên Droplet, vào thư mục: `cd ~/webevent`. (Docker build tự cài lại node_modules nên không cần copy.)

---

## Bước 2 — Tạo file .env với secret mạnh (chạy TRÊN Droplet)

```bash
cd ~/webevent
cat > .env <<EOF
POSTGRES_USER=webevent
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=webevent
PORT=3000
JWT_SECRET=$(openssl rand -hex 48)
ENCRYPTION_KEY=$(openssl rand -hex 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=DAT_MAT_KHAU_ADMIN_MANH_O_DAY
EOF
nano .env   # sửa ADMIN_PASSWORD thành mật khẩu thật của bạn
```

> ⚠️ **ENCRYPTION_KEY phải cố định mãi mãi.** Nó dùng để mã hóa Họ tên + SĐT. Nếu đổi key sau khi đã có dữ liệu → **không giải mã lại được** thông tin khách cũ. Sao lưu key này nơi an toàn.

---

## Bước 3 — Chạy (HTTP, kiểm tra nhanh)

```bash
docker compose up -d --build      # build + chạy app + postgres (lần đầu vài phút)
docker compose logs -f app        # xem log: phải thấy "Đã chèn 50 địa danh" + "Server chạy"
```

Kiểm tra: mở `http://<IP_DROPLET>:3000` — bản đồ hiện ra, vào `/#/admin` đăng nhập `admin` + mật khẩu vừa đặt.

---

## Bước 4 — Bật HTTPS + domain (Caddy tự cấp Let's Encrypt)

1. **Trỏ DNS:** tạo bản ghi **A** `tenmiien.com` → `<IP_DROPLET>` (chờ DNS lan truyền, kiểm tra `ping tenmiien.com`).
2. **Sửa domain** trong `Caddyfile`: thay `tenmiien.com` bằng domain thật.
3. **Bật service `caddy`** trong `docker-compose.yml`: bỏ comment khối `caddy:` và 2 dòng volume `caddy_data`/`caddy_config`.
4. **Đóng cổng 3000 ra ngoài** (chỉ để Caddy là cửa ngõ): trong `docker-compose.yml`, xóa/comment 2 dòng `ports: - "3000:3000"` của service `app` (app vẫn chạy nội bộ, Caddy gọi qua `app:3000`).
5. Khởi động lại:
   ```bash
   docker compose up -d
   ```
6. Mở **https://tenmiien.com** — Caddy tự xin SSL. Thử mở 2 tab để kiểm tra realtime đổi xám.

> Chưa có domain? Cứ dùng Bước 3 (HTTP qua IP) trước, làm Bước 4 sau khi có domain.

---

## Vận hành

| Việc | Lệnh |
|------|------|
| Xem log | `docker compose logs -f app` |
| Cập nhật code mới | `git pull && docker compose up -d --build` (hoặc copy lại rồi build) |
| Sao lưu DB | `docker compose exec db pg_dump -U webevent webevent > backup_$(date +%F).sql` |
| Khởi động lại | `docker compose restart app` |
| Reset toàn bộ dữ liệu | `docker compose down -v && docker compose up -d --build` (xóa cả volume DB) |
| Dừng | `docker compose down` |

## Ghi chú production

- DB đồng bộ schema bằng `prisma db push` lúc khởi động; server **tự seed** 50 địa danh + admin khi DB trống.
- Đổi danh sách địa danh: sửa `document/LocationList.md` → đưa lên Droplet → `docker compose down -v && up -d --build` (hoặc xóa bảng Location rồi restart).
- Tài nguyên: Droplet 2GB/1–2 vCPU ở Singapore là đủ cho ~50 user đồng thời.
