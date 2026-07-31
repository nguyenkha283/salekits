/**
 * Danh mục các section có thể chọn trên canvas. CMS dựa vào đây để biết
 * section vừa bấm thuộc tab nào, sửa được gì, và dữ liệu lấy từ thư mục nào.
 */
export type SectionKind = 'hero' | 'text' | 'stats' | 'drive' | 'manual';

/** Cấp độ dự án hiển thị trên hero — giữ nguyên danh sách của bản CMS cũ. */
export const HIERARCHY_OPTIONS = [
'Đại đô thị',
'Khu đô thị',
'Dự án',
'Phân khu',
'Tiểu khu',
'Tòa'];


export interface SectionMeta {
  id: string;
  label: string;
  /** Tab chứa section này. */
  tab: string;
  kind: SectionKind;
  /** Thư mục Drive nguồn, dùng cho section kiểu drive. */
  folder?: string;
  /** Khoá tra ảnh trong syncedMedia: [tabId, groupId]. */
  media?: [string, string?];
  /** Văn bản mẫu, dùng làm nội dung khởi tạo cho ô soạn thảo. */
  defaultText?: string;
  hint?: string;
}

export const SECTIONS: SectionMeta[] = [
{
  id: 'hero', label: 'Băng ảnh đầu trang', tab: 'tong-quan', kind: 'hero',
  folder: '01. Tổng quan / Ảnh hero banner', media: ['tong-quan', 'hero'],
  hint: 'Ảnh lấy từ Drive. Cấp độ, tên dự án và slogan nhập tay tại đây.'
},
{
  id: 'overview', label: 'Tổng quan dự án', tab: 'tong-quan', kind: 'text',
  folder: '01. Tổng quan', media: ['tong-quan', 'overview'],
  defaultText: 'Imperia Sky Park hướng tới một chuẩn sống cân bằng: không gian riêng tư đủ tĩnh tại, những kết nối đủ đầy và cảnh quan xanh len vào từng nhịp sống.',
  hint: 'Văn bản nhập tay tại đây. Ảnh lấy từ thư mục Ảnh tổng quan.'
},
{
  id: 'stats', label: 'Số liệu nổi bật', tab: 'tong-quan', kind: 'stats',
  hint: 'Ba chỉ số hiển thị dưới khối tổng quan.'
},
{
  id: 'location', label: 'Vị trí dự án', tab: 'tong-quan', kind: 'text',
  folder: '01. Tổng quan / Vị trí', media: ['tong-quan', 'location'],
  defaultText: 'Tọa lạc tại Minh Khai, Imperia Sky Park đưa bạn đến gần hơn với nhịp sống trung tâm, đồng thời gìn giữ một khoảng riêng yên bình để trở về.',
  hint: 'Văn bản nhập tay. Ảnh bản đồ lấy từ thư mục Vị trí.'
},
{
  id: 'floorplan', label: 'Mặt bằng xem nhanh', tab: 'tong-quan', kind: 'drive',
  folder: '01. Tổng quan / Ảnh mặt bằng', media: ['tong-quan', 'plan-preview'],
  hint: 'Tên file trở thành nhãn của từng tab mặt bằng.'
},
{
  id: 'products', label: 'Loại hình sản phẩm', tab: 'tong-quan', kind: 'manual',
  hint: 'Danh sách loại căn. Biên tập chi tiết thuộc đợt sau.'
},
{
  id: 'amenities', label: 'Tiện ích', tab: 'tong-quan', kind: 'drive',
  folder: '01. Tổng quan / Ảnh tiện ích', media: ['tong-quan', 'amenity'],
  hint: 'File .txt cùng tên ảnh trở thành chú thích hiển thị.'
},
{
  id: 'contact', label: 'Liên hệ tư vấn', tab: 'tong-quan', kind: 'manual',
  hint: 'Hotline lấy từ cấu hình dự án.'
},
{
  id: 'plan', label: 'Mặt bằng dự án', tab: 'mat-bang', kind: 'drive',
  folder: '03. Mặt bằng', media: ['mat-bang'],
  hint: 'Lấy ảnh đầu tiên trong thư mục. Chấm pin thuộc đợt sau.'
},
{
  id: 'products-tab', label: 'Danh sách sản phẩm', tab: 'toa-nha', kind: 'manual',
  hint: 'Nhập tay danh sách tòa nhà hoặc phân khu.'
},
{
  id: 'p360', label: 'Ảnh 360', tab: 'anh-360', kind: 'drive',
  folder: '04. Ảnh 360', media: ['anh-360'],
  hint: 'Tên file trở thành tên cảnh trong trình xem.'
},
{
  id: 'policy', label: 'Chính sách bán hàng', tab: 'chinh-sach', kind: 'drive',
  folder: '05. Chính sách bán hàng', media: ['chinh-sach'],
  hint: 'Ảnh đầu là ảnh bìa, mỗi thư mục con là một nhóm file.'
},
{
  id: 'progress', label: 'Ảnh tiến độ', tab: 'tien-do', kind: 'drive',
  folder: '06. Tiến độ', media: ['tien-do'],
  hint: 'Chia đợt theo thư mục con thuộc đợt sau (FR-24).'
},
{
  id: 'documents', label: 'Tài liệu dự án', tab: 'tai-lieu', kind: 'drive',
  folder: '07. Tài liệu', media: ['tai-lieu'],
  hint: 'File mở trực tiếp trên Google Drive.'
},
{
  id: 'training', label: 'Nội dung đào tạo', tab: 'dao-tao', kind: 'drive',
  folder: '02. Đào tạo', media: ['dao-tao'],
  hint: 'Video nhúng cấu hình riêng, tài liệu lấy từ Drive.'
}];


export function findSection(id: string | null): SectionMeta | undefined {
  if (!id) return undefined;
  return SECTIONS.find((section) => section.id === id);
}
