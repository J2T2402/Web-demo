// Chuẩn hoá & kiểm tra số điện thoại di động Việt Nam.
// Giữ ĐỒNG BỘ với frontend (frontend/src/lib/phone.ts).

/** Bỏ khoảng trắng, dấu chấm, gạch nối; chuyển +84 -> 0. */
export function normalizePhone(raw: string): string {
  let p = (raw || '').replace(/[\s.\-()]/g, '')
  if (p.startsWith('+84')) p = '0' + p.slice(3)
  else if (p.startsWith('84') && p.length === 11) p = '0' + p.slice(2)
  return p
}

/** SĐT di động VN: 10 số, bắt đầu 0, đầu số 3/5/7/8/9. */
export function isValidVNPhone(raw: string): boolean {
  const p = normalizePhone(raw)
  return /^0(3|5|7|8|9)[0-9]{8}$/.test(p)
}
