# Cách 1 — gộp FE + BE: build frontend (frontend/) + backend (backend/) -> 1 image Node
# phục vụ cả file tĩnh React, API và Socket.IO trên cùng 1 cổng.

# ---------- Stage 1: build frontend ----------
FROM node:20-alpine AS fe-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# build ra /app/frontend/dist
RUN npm run build

# ---------- Stage 2: build backend ----------
FROM node:20-alpine AS be-build
WORKDIR /app/backend
# Prisma trên Alpine cần openssl để chạy engine
RUN apk add --no-cache openssl
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
# build ra /app/backend/dist
RUN npx prisma generate && npm run build

# ---------- Stage 3: runtime (image gọn) ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Prisma trên Alpine cần openssl (cho prisma generate + db push lúc khởi động)
RUN apk add --no-cache openssl
COPY backend/package*.json ./
# prisma CLI nằm trong dependencies -> vẫn có ở runtime để db push
RUN npm ci --omit=dev
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY --from=be-build /app/backend/dist ./dist
# nhúng frontend đã build vào server để phục vụ tĩnh
COPY --from=fe-build /app/frontend/dist ./public
# nguồn seed 50 địa danh (parse lúc khởi động)
COPY document/LocationList.md ./LocationList.md
EXPOSE 3000
CMD ["node", "dist/index.js"]
