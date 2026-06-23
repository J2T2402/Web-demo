# Hướng dẫn Deploy lên DigitalOcean Droplet

Runbook đã kiểm chứng (build + chạy thử production y hệt trên máy local). Cấu hình: **Cách 1 — gộp FE + BE** (1 tiến trình Node phục vụ frontend + API + realtime), đóng gói bằng Docker Compose (app + PostgreSQL).

> Yêu cầu trước: Droplet Ubuntu đã cài **Docker + Docker Compose**, đã mở firewall 22/80/443, có user thường (xem plan Mục 10.9).

---

## Bước 1 — Đưa code lên Droplet

### Cách A — Git (đang dùng) ✅
Code đã đẩy lên: **https://github.com/J2T2402/Web-demo** (nhánh `main`).
```bash
# Trên Droplet:
git clone https://github.com/J2T2402/Web-demo.git webevent && cd webevent
```
> Nếu repo ở chế độ **Private**, lệnh clone sẽ hỏi đăng nhập:
> nhập **username GitHub** + dán **Personal Access Token** (PAT) vào ô mật khẩu.
> Tạo PAT: GitHub → Settings → Developer settings → Personal access tokens → cấp quyền `repo`.
> (Hoặc đặt repo Public tạm thời cho nhanh, deploy xong đổi lại Private.)
>
> Cập nhật về sau: `git pull && docker compose up -d --build`.

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
DOMAIN=tenmiien.com
JWT_SECRET=$(openssl rand -hex 48)
ENCRYPTION_KEY=$(openssl rand -hex 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=DAT_MAT_KHAU_ADMIN_MANH_O_DAY
EOF
nano .env   # sửa DOMAIN thành domain thật + ADMIN_PASSWORD thành mật khẩu mạnh
```

> ⚠️ **ENCRYPTION_KEY phải cố định mãi mãi.** Nó dùng để mã hóa Họ tên + SĐT. Nếu đổi key sau khi đã có dữ liệu → **không giải mã lại được** thông tin khách cũ. Sao lưu key này nơi an toàn.

---

## Bước 3 — Trỏ DNS về Droplet

Tạo bản ghi **A**: `tenmiien.com` → `<IP_DROPLET>` (và `www` nếu muốn). Chờ DNS lan truyền,
kiểm tra trên Droplet: `ping tenmiien.com` phải ra đúng IP. (Caddy cần domain trỏ đúng để xin SSL.)

---

## Bước 4 — Chạy production (HTTPS tự động qua Caddy)

Một lệnh duy nhất — gộp file base + override production (Caddy lo SSL Let's Encrypt):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose logs -f app    # phải thấy "Đã chèn 50 địa danh" + "Server chạy"
docker compose logs -f caddy  # xem Caddy xin chứng chỉ SSL
```

Mở **https://tenmiien.com** — bản đồ hiện ra; vào `/#/admin` đăng nhập `admin` + mật khẩu đã đặt.
Thử mở 2 tab để kiểm tra realtime đổi xám.

> App chỉ mở ở `127.0.0.1:3000` (không lộ ra internet); chỉ Caddy (80/443) là cửa ngõ công khai.

### (Tùy chọn) Kiểm tra nhanh trước khi có domain
Nếu muốn test khi DNS chưa trỏ xong, chạy riêng phần app rồi curl nội bộ trên Droplet:
```bash
docker compose up -d --build      # chỉ app + db (chưa có Caddy)
curl localhost:3000/api/health    # -> {"ok":true}
```

---

## Vận hành

> Đặt alias cho gọn: `alias dcp='docker compose -f docker-compose.yml -f docker-compose.prod.yml'` rồi dùng `dcp ...`.

| Việc | Lệnh |
|------|------|
| Xem log | `docker compose logs -f app` (hoặc `caddy`) |
| Cập nhật code mới | `git pull && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build` |
| Sao lưu DB | `docker compose exec db pg_dump -U webevent webevent > backup_$(date +%F).sql` |
| Khởi động lại | `docker compose restart app` |
| Reset toàn bộ dữ liệu | `docker compose down -v && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build` (xóa cả volume DB) |
| Dừng | `docker compose down` |

## Ghi chú production

- DB đồng bộ schema bằng `prisma db push` lúc khởi động; server **tự seed** 50 địa danh + admin khi DB trống.
- Đổi danh sách địa danh: sửa `document/LocationList.md` → đưa lên Droplet → `docker compose down -v && up -d --build` (hoặc xóa bảng Location rồi restart).
- Tài nguyên: Droplet 2GB/1–2 vCPU ở Singapore là đủ cho ~50 user đồng thời.
