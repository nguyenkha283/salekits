/**
 * Chủ đầu tư — theo "Đặc tả module Quản lý chủ đầu tư" v1.0, mục 2.2.
 *
 * Lưu ý mô hình dữ liệu ở mục 1.2: đầu mối liên hệ KHÔNG nằm ở đây mà nằm trên
 * bản ghi dự án, vì một chủ đầu tư có nhiều dự án và mỗi dự án làm việc với một
 * đầu mối khác nhau.
 */

/** Một mục trong "Con số ấn tượng" — ba phần đều là text (FR-CDT-07). */
export interface InvestorNumber {
  value: string;
  label: string;
  description: string;
}

export type InvestorStatus = 'Đang sử dụng' | 'Ngừng sử dụng';

export interface Investor {
  /** po_id */
  id: string;
  /** po_code — sinh từ tên, không sửa được sau khi tạo (FR-CDT-03). */
  code: string;
  /** po_name */
  name: string;
  /** po_tax_code — tùy chọn, phase này chỉ lưu trữ (FR-CDT-09). */
  taxCode: string;
  /** po_slug — sinh từ tên, duy nhất, sửa được (FR-CDT-04). */
  slug: string;
  /** po_logo */
  logoUrl: string;
  /** po_description — khuyến nghị ≤ 200 ký tự, vượt thì cảnh báo (FR-CDT-05). */
  description: string;
  /** po_usp — tối đa 4 mục (FR-CDT-06). */
  advantages: string[];
  /** po_numbers — tối đa 4 mục (FR-CDT-07). */
  numbers: InvestorNumber[];
  /** po_address */
  address: string;
  /** po_website */
  website: string;
  /** po_founded_year */
  foundedYear: string;
  /** po_status — mặc định Đang sử dụng. */
  status: InvestorStatus;
  /** po_created_by — quyết định quyền sửa bản ghi (FR-CDT-12). */
  createdBy: string;
  createdAt: string;
  /** Số dự án đang tham chiếu tới bản ghi này. */
  projectCount: number;
}

export const MAX_INVESTOR_ADVANTAGES = 4;
export const MAX_INVESTOR_NUMBERS = 4;
/** Ngưỡng khuyến nghị của Mô tả ngắn — vượt thì cảnh báo nhưng vẫn cho lưu. */
export const INVESTOR_DESCRIPTION_SOFT_LIMIT = 200;

export function createEmptyInvestor(createdBy: string): Investor {
  return {
    id: '',
    code: '',
    name: '',
    taxCode: '',
    slug: '',
    logoUrl: '',
    description: '',
    advantages: [],
    numbers: [],
    address: '',
    website: '',
    foundedYear: '',
    status: 'Đang sử dụng',
    createdBy,
    createdAt: '',
    projectCount: 0
  };
}
