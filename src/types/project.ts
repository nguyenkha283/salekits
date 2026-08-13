export type ConfigTeamRole = 'APM' | 'Quản lý bán hàng' | 'Marketing';

export interface ProjectTeamMember {
  id: string;
  employeeCode: string;
  name: string;
  title: string;
  phoneNumber: string;
  isHotlineOnDuty: boolean;
  roles: ConfigTeamRole[];
  isOwner?: boolean;
}

export interface ProjectConfiguration {
  avatarUrl: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  projectCode: string;
  projectType: string;
  address: string;
  province: string;
  ward: string;
  salesStatus: string;
  segment: string;
  category: string;
  minimumArea: string;
  maximumArea: string;
  minimumPrice: string;
  maximumPrice: string;
  contractorManager: string;
  constructionManager: string;
  publishingStatus: string;
  soldUnits: number;
  teamMembers: ProjectTeamMember[];
}

export interface ProjectDraft {
  hierarchy: string;
  name: string;
  /** Mã dự án — sinh từ tên, sửa được trước khi xuất bản (FR-07, FR-08). */
  code: string;
  /** Tên gọi khác của dự án; nhiều tên nhưng vẫn dùng chung một mã. */
  aliases: string[];
  /** Slogan hiển thị dưới tên dự án trên băng ảnh đầu trang. */
  slogan: string;
  propertyType: string;
  /** Địa chỉ nhập tự do — số nhà, tên đường, tên khu. */
  address: string;
  /** Tỉnh / thành phố trực thuộc Trung ương. */
  province: string;
  /** Phường / xã. Mô hình hai cấp, không còn Quận / Huyện. */
  ward: string;
  /** @deprecated Giữ lại cho mã cũ; mô hình hai cấp không dùng nữa. */
  district: string;
  status: string;
  /** Chủ đầu tư — bắt buộc khi khởi tạo dự án (FR-CDT-19). */
  investorId?: string;
  investorName?: string;
  /** Đầu mối liên hệ — bản ghi dùng chung, tùy chọn (FR-CDT-10). */
  contactId?: string;
  contactName?: string;
  contactPhone?: string;
  /** Ảnh đại diện dự án, dạng data URL trong bản prototype. */
  coverImageUrl?: string;
}