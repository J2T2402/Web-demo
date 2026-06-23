// 50 địa danh chính thức (nguồn: document/LocationList.md) — MOCK DATA cho demo.
// lat/lng là toạ độ thực (xấp xỉ) để chiếu lên bản đồ đúng vị trí địa lý.
// Tỉnh/thành được bổ sung thêm (LocationList.md chỉ có tên + toạ độ).
// Thứ tự đi theo nhóm vùng miền: Bắc → Trung → Tây Nguyên/Nam Trung Bộ → Nam.

export interface RawLocation {
  id: number
  name: string
  province: string
  lat: number
  lng: number
}

export const RAW_LOCATIONS: RawLocation[] = [
  // --- Miền Bắc (1–18) ---
  { id: 1, name: 'Vịnh Hạ Long', province: 'Quảng Ninh', lat: 20.910, lng: 107.184 },
  { id: 2, name: 'Vịnh Lan Hạ', province: 'Hải Phòng', lat: 20.745, lng: 107.075 },
  { id: 3, name: 'Đảo Cát Bà', province: 'Hải Phòng', lat: 20.728, lng: 107.048 },
  { id: 4, name: 'Yên Tử', province: 'Quảng Ninh', lat: 21.157, lng: 106.717 },
  { id: 5, name: 'Hà Nội', province: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { id: 6, name: 'Hồ Hoàn Kiếm', province: 'Hà Nội', lat: 21.0287, lng: 105.8524 },
  { id: 7, name: 'Tràng An', province: 'Ninh Bình', lat: 20.254, lng: 105.923 },
  { id: 8, name: 'Tam Cốc – Bích Động', province: 'Ninh Bình', lat: 20.217, lng: 105.933 },
  { id: 9, name: 'Hang Múa', province: 'Ninh Bình', lat: 20.234, lng: 105.940 },
  { id: 10, name: 'Cao nguyên đá Đồng Văn', province: 'Hà Giang', lat: 23.278, lng: 105.363 },
  { id: 11, name: 'Đèo Mã Pí Lèng', province: 'Hà Giang', lat: 23.230, lng: 105.343 },
  { id: 12, name: 'Sa Pa', province: 'Lào Cai', lat: 22.336, lng: 103.844 },
  { id: 13, name: 'Đỉnh Fansipan', province: 'Lào Cai', lat: 22.303, lng: 103.775 },
  { id: 14, name: 'Mù Cang Chải', province: 'Yên Bái', lat: 21.851, lng: 104.115 },
  { id: 15, name: 'Hồ Ba Bể', province: 'Bắc Kạn', lat: 22.402, lng: 105.617 },
  { id: 16, name: 'Thác Bản Giốc', province: 'Cao Bằng', lat: 22.853, lng: 106.707 },
  { id: 17, name: 'Mẫu Sơn', province: 'Lạng Sơn', lat: 21.860, lng: 106.930 },
  { id: 18, name: 'Pù Luông', province: 'Thanh Hóa', lat: 20.470, lng: 105.165 },
  // --- Miền Trung (19–36) ---
  { id: 19, name: 'Vườn quốc gia Phong Nha – Kẻ Bàng', province: 'Quảng Bình', lat: 17.590, lng: 106.283 },
  { id: 20, name: 'Hang Sơn Đoòng', province: 'Quảng Bình', lat: 17.455, lng: 106.288 },
  { id: 21, name: 'Động Thiên Đường', province: 'Quảng Bình', lat: 17.531, lng: 106.243 },
  { id: 22, name: 'Huế', province: 'Thừa Thiên Huế', lat: 16.463, lng: 107.591 },
  { id: 23, name: 'Đại Nội Huế', province: 'Thừa Thiên Huế', lat: 16.470, lng: 107.578 },
  { id: 24, name: 'Lăng Khải Định', province: 'Thừa Thiên Huế', lat: 16.398, lng: 107.601 },
  { id: 25, name: 'Đèo Hải Vân', province: 'Đà Nẵng', lat: 16.198, lng: 108.130 },
  { id: 26, name: 'Đà Nẵng', province: 'Đà Nẵng', lat: 16.054, lng: 108.202 },
  { id: 27, name: 'Bà Nà Hills', province: 'Đà Nẵng', lat: 15.995, lng: 107.988 },
  { id: 28, name: 'Bán đảo Sơn Trà', province: 'Đà Nẵng', lat: 16.110, lng: 108.277 },
  { id: 29, name: 'Ngũ Hành Sơn', province: 'Đà Nẵng', lat: 16.004, lng: 108.263 },
  { id: 30, name: 'Hội An', province: 'Quảng Nam', lat: 15.880, lng: 108.338 },
  { id: 31, name: 'Thánh địa Mỹ Sơn', province: 'Quảng Nam', lat: 15.764, lng: 108.124 },
  { id: 32, name: 'Đảo Lý Sơn', province: 'Quảng Ngãi', lat: 15.383, lng: 109.117 },
  { id: 33, name: 'Ghềnh Đá Đĩa', province: 'Phú Yên', lat: 13.290, lng: 109.280 },
  { id: 34, name: 'Kỳ Co', province: 'Bình Định', lat: 13.766, lng: 109.337 },
  { id: 35, name: 'Nha Trang', province: 'Khánh Hòa', lat: 12.239, lng: 109.197 },
  { id: 36, name: 'Vịnh Vĩnh Hy', province: 'Ninh Thuận', lat: 11.717, lng: 109.200 },
  // --- Tây Nguyên & Nam Trung Bộ (37–42) ---
  { id: 37, name: 'Đà Lạt', province: 'Lâm Đồng', lat: 11.940, lng: 108.458 },
  { id: 38, name: 'Hồ Tuyền Lâm', province: 'Lâm Đồng', lat: 11.896, lng: 108.431 },
  { id: 39, name: 'Núi Lang Biang', province: 'Lâm Đồng', lat: 12.047, lng: 108.439 },
  { id: 40, name: 'Tà Đùng', province: 'Đắk Nông', lat: 11.900, lng: 107.865 },
  { id: 41, name: "Biển Hồ T'Nưng", province: 'Gia Lai', lat: 14.058, lng: 108.019 },
  { id: 42, name: 'Buôn Đôn', province: 'Đắk Lắk', lat: 12.900, lng: 107.790 },
  // --- Miền Nam (43–50) ---
  { id: 43, name: 'Phan Thiết', province: 'Bình Thuận', lat: 10.928, lng: 108.102 },
  { id: 44, name: 'Mũi Né', province: 'Bình Thuận', lat: 10.933, lng: 108.283 },
  { id: 45, name: 'Vũng Tàu', province: 'Bà Rịa - Vũng Tàu', lat: 10.411, lng: 107.136 },
  { id: 46, name: 'Thành phố Hồ Chí Minh', province: 'TP. Hồ Chí Minh', lat: 10.776, lng: 106.701 },
  { id: 47, name: 'Địa đạo Củ Chi', province: 'TP. Hồ Chí Minh', lat: 11.143, lng: 106.464 },
  { id: 48, name: 'Rừng tràm Trà Sư', province: 'An Giang', lat: 10.582, lng: 105.058 },
  { id: 49, name: 'Chợ nổi Cái Răng', province: 'Cần Thơ', lat: 10.000, lng: 105.778 },
  { id: 50, name: 'Đảo Phú Quốc', province: 'Kiên Giang', lat: 10.290, lng: 103.984 },
]

// Những địa danh đã có người sở hữu sẵn (để demo trạng thái xám lúc mở trang).
export const OWNED_IDS: number[] = [2, 4, 6, 8, 11, 13, 16, 19, 21, 24, 26, 31, 33, 39, 43, 45, 48, 50]
