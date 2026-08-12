/**
 * Danh mục đơn vị hành chính — mô hình HAI CẤP theo Nghị quyết 202/2025/QH15,
 * hiệu lực 01/07/2025: Tỉnh / Thành phố → Phường / Xã. Cấp Quận / Huyện đã bỏ.
 *
 * ⚠️ Đối chiếu SRS: FR-08 và phụ lục 7.1 vẫn quy định ba cấp
 * Tỉnh → Quận/Huyện → Phường/Xã. Nhóm phát triển đã nêu ở B-09 (SRS v2.1) và
 * mục 7.6 (đề xuất v3) nhưng BA chưa phản hồi. Mã nguồn đang chạy trước theo
 * mô hình hai cấp; cần BA chốt và sửa FR-08 + phụ lục 7.1 cho khớp.
 *
 * Danh sách 34 tỉnh thành là dữ liệu thật. Danh sách phường/xã trong file này
 * chỉ là MẪU cho vài địa phương lớn — bản thật có 3.320 phường/xã, phải lấy từ
 * API danh mục hành chính. Tỉnh chưa có dữ liệu mẫu thì ô Phường/Xã tự chuyển
 * sang cho nhập tay.
 */

/** 6 thành phố trực thuộc Trung ương và 28 tỉnh. */
export const PROVINCES: string[] = [
'Hà Nội',
'TP. Hồ Chí Minh',
'Hải Phòng',
'Đà Nẵng',
'Huế',
'Cần Thơ',
'An Giang',
'Bắc Ninh',
'Cà Mau',
'Cao Bằng',
'Điện Biên',
'Đắk Lắk',
'Đồng Nai',
'Đồng Tháp',
'Gia Lai',
'Hà Tĩnh',
'Hưng Yên',
'Khánh Hòa',
'Lai Châu',
'Lạng Sơn',
'Lào Cai',
'Lâm Đồng',
'Nghệ An',
'Ninh Bình',
'Phú Thọ',
'Quảng Ngãi',
'Quảng Ninh',
'Quảng Trị',
'Sơn La',
'Tây Ninh',
'Thái Nguyên',
'Thanh Hóa',
'Tuyên Quang',
'Vĩnh Long'];


/**
 * Phường / xã theo tỉnh thành — dữ liệu mẫu, chưa đầy đủ.
 * Thay bằng lệnh gọi API danh mục hành chính khi lên bản thật.
 */
export const WARDS_BY_PROVINCE: Record<string, string[]> = {
  'Hà Nội': [
  'Phường Ba Đình',
  'Phường Hoàn Kiếm',
  'Phường Cửa Nam',
  'Phường Ngọc Hà',
  'Phường Hai Bà Trưng',
  'Phường Vĩnh Tuy',
  'Phường Hồng Hà',
  'Phường Lĩnh Nam',
  'Phường Ô Chợ Dừa',
  'Phường Kim Liên',
  'Phường Khương Đình',
  'Phường Nghĩa Đô',
  'Phường Bồ Đề',
  'Phường Long Biên'],

  'TP. Hồ Chí Minh': [
  'Phường Sài Gòn',
  'Phường Bến Thành',
  'Phường Tân Định',
  'Phường Cầu Ông Lãnh',
  'Phường Chợ Lớn',
  'Phường Chợ Quán',
  'Phường Gia Định',
  'Phường Bình Lợi Trung',
  'Phường Phú Nhuận',
  'Phường Gò Vấp',
  'Phường Tân Sơn Nhất',
  'Phường Khánh Hội',
  'Phường Thủ Đức',
  'Phường An Khánh',
  'Phường Hiệp Bình',
  'Phường Tăng Nhơn Phú'],

  'Đà Nẵng': [
  'Phường Hải Châu',
  'Phường Thanh Khê',
  'Phường Sơn Trà',
  'Phường Ngũ Hành Sơn',
  'Phường Hòa Xuân',
  'Phường Hội An',
  'Phường Điện Bàn',
  'Phường Tam Kỳ'],

  'Hải Phòng': [
  'Phường Hồng Bàng',
  'Phường Ngô Quyền',
  'Phường Lê Chân',
  'Phường Hải An',
  'Phường An Dương',
  'Phường Thủy Nguyên',
  'Phường Hải Dương',
  'Phường Chí Linh'],

  'Huế': [
  'Phường Phú Xuân',
  'Phường Thuận Hóa',
  'Phường Hương Trà',
  'Phường Phong Điền',
  'Phường Thủy Xuân'],

  'Cần Thơ': [
  'Phường Ninh Kiều',
  'Phường Cái Răng',
  'Phường Bình Thủy',
  'Phường Ô Môn',
  'Phường Vị Thanh',
  'Phường Sóc Trăng'],

  'Quảng Ninh': [
  'Phường Hạ Long',
  'Phường Bãi Cháy',
  'Phường Cẩm Phả',
  'Phường Móng Cái',
  'Phường Uông Bí',
  'Phường Đông Triều'],

  'Hưng Yên': [
  'Phường Phố Hiến',
  'Phường Hưng Yên',
  'Phường Mỹ Hào',
  'Phường Thái Bình',
  'Xã Văn Giang'],

  'Ninh Bình': [
  'Phường Hoa Lư',
  'Phường Nam Hoa Lư',
  'Phường Tam Điệp',
  'Phường Phủ Lý',
  'Phường Nam Định'],

  'Bắc Ninh': [
  'Phường Kinh Bắc',
  'Phường Võ Cường',
  'Phường Từ Sơn',
  'Phường Bắc Giang',
  'Phường Việt Yên'],

  'Khánh Hòa': [
  'Phường Nha Trang',
  'Phường Bắc Nha Trang',
  'Phường Cam Ranh',
  'Phường Ninh Hòa',
  'Phường Phan Rang'],

  'Lâm Đồng': [
  'Phường Xuân Hương - Đà Lạt',
  'Phường Cam Ly - Đà Lạt',
  'Phường Bảo Lộc',
  'Phường Phan Thiết',
  'Phường Gia Nghĩa'],

  'Đồng Nai': [
  'Phường Trấn Biên',
  'Phường Biên Hòa',
  'Phường Long Bình',
  'Phường Long Khánh',
  'Phường Đồng Xoài']

};

/** Tỉnh đã có dữ liệu phường/xã mẫu; tỉnh khác thì cho nhập tay. */
export function getWards(province: string): string[] {
  return WARDS_BY_PROVINCE[province] ?? [];
}

export function hasWardData(province: string): boolean {
  return getWards(province).length > 0;
}
