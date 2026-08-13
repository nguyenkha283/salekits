import type { DashboardProject } from './dashboardData';
import type { ProjectContact } from './contactData';

/**
 * Vai trò dùng chung cho dashboard và CMS — theo mục 2.4 của SRS và ma trận
 * phân quyền mục 4 của đặc tả module Quản lý chủ đầu tư.
 *
 * ⚠️ Ma trận của đặc tả còn có cột Admin, hiện chưa có trong danh sách này.
 */
export type DashboardRole =
'APM' |
'Trợ lý dự án' |
'Hành chính dự án' |
'Quản lý giao dịch' |
'Trưởng phòng QLGD' |
'Marketing' |
'Trưởng phòng Marketing' |
'Trưởng line' |
'Ban lãnh đạo' |
'User khác';

export const DASHBOARD_ROLES: DashboardRole[] = [
'APM',
'Trợ lý dự án',
'Hành chính dự án',
'Quản lý giao dịch',
'Trưởng phòng QLGD',
'Marketing',
'Trưởng phòng Marketing',
'Trưởng line',
'Ban lãnh đạo',
'User khác'];


/** Nhóm Người tạo dự án theo định nghĩa ở mục 1.4 của đặc tả. */
export const PROJECT_CREATOR_ROLES: DashboardRole[] = [
'APM',
'Trợ lý dự án',
'Hành chính dự án'];


export function isProjectCreator(role: DashboardRole): boolean {
  return PROJECT_CREATOR_ROLES.includes(role);
}

/** Tạo và sửa chủ đầu tư: nhóm Người tạo dự án và Admin (FR-CDT-12). */
export function canManageInvestors(role: DashboardRole): boolean {
  return isProjectCreator(role);
}

export function canCreateProject(role: DashboardRole): boolean {
  return isProjectCreator(role);
}

/**
 * Ai được xem đầu mối liên hệ — FR-CDT-11.
 *
 * Quản lý giao dịch và Marketing (Quản lý tin tức) KHÔNG xem được, dù họ thuộc
 * đội ngũ dự án. Đây là quy định có chủ đích của đặc tả, không phải sót.
 */
export function canSeeContacts(role: DashboardRole): boolean {
  return (
    isProjectCreator(role) ||
    role === 'Trưởng line' ||
    role === 'Ban lãnh đạo');

}

export interface ContactScopeInput {
  role: DashboardRole;
  userId: string;
  /** Line mà Trưởng line đang phụ trách. */
  lineId: string;
  projects: DashboardProject[];
}

/**
 * Lọc danh sách đầu mối theo phạm vi của vai trò.
 *
 * | Vai trò | Thấy gì |
 * |---|---|
 * | Ban lãnh đạo | Toàn bộ |
 * | Trưởng line | Đầu mối gắn với dự án thuộc line mình phụ trách |
 * | Người tạo dự án | Đầu mối gắn với dự án do mình tạo, hoặc đầu mối do mình tạo |
 * | Còn lại | Không thấy gì |
 */
export function visibleContacts(
contacts: ProjectContact[],
{ role, userId, lineId, projects }: ContactScopeInput)
: ProjectContact[] {
  if (!canSeeContacts(role)) return [];
  if (role === 'Ban lãnh đạo') return contacts;

  if (role === 'Trưởng line') {
    const inLine = new Set(
      projects.
      filter((project) => project.lineId === lineId).
      map((project) => project.contactId).
      filter(Boolean)
    );
    return contacts.filter((contact) => inLine.has(contact.id));
  }

  // Nhóm Người tạo dự án
  const mine = new Set(
    projects.
    filter((project) => project.createdBy === userId).
    map((project) => project.contactId).
    filter(Boolean)
  );
  return contacts.filter(
    (contact) => mine.has(contact.id) || contact.createdBy === userId
  );
}

/** Dự án đang gắn với một đầu mối, đã lọc theo phạm vi của vai trò. */
export function projectsOfContact(
contactId: string,
{ role, userId, lineId, projects }: ContactScopeInput)
: DashboardProject[] {
  const linked = projects.filter((project) => project.contactId === contactId);
  if (role === 'Ban lãnh đạo') return linked;
  if (role === 'Trưởng line') {
    return linked.filter((project) => project.lineId === lineId);
  }
  return linked.filter((project) => project.createdBy === userId);
}

/** Dự án hiển thị ở mục Quản lý dự án, theo phạm vi vai trò. */
export function visibleProjects(
projects: DashboardProject[],
{ role, userId, lineId }: Omit<ContactScopeInput, 'projects'>)
: DashboardProject[] {
  if (role === 'Ban lãnh đạo') return projects;
  if (role === 'Trưởng line') {
    return projects.filter((project) => project.lineId === lineId);
  }
  if (isProjectCreator(role)) {
    return projects.filter((project) => project.createdBy === userId);
  }
  // Quản lý giao dịch, Marketing, User khác: dự án được phân công. Prototype
  // chưa có bảng phân công nên hiển thị toàn bộ ở chế độ chỉ xem.
  return projects;
}

/** Nhãn cho mục Quản lý dự án, đổi theo phạm vi của vai trò. */
export function projectListHeading(role: DashboardRole): {
  title: string;
  subtitle: string;
} {
  if (role === 'Ban lãnh đạo') {
    return {
      title: 'Toàn bộ dự án',
      subtitle: 'Tất cả dự án trên hệ thống, chế độ chỉ xem'
    };
  }
  if (role === 'Trưởng line') {
    return {
      title: 'Dự án trong line',
      subtitle: 'Các dự án thuộc line bạn phụ trách'
    };
  }
  if (isProjectCreator(role)) {
    return {
      title: 'Dự án của tôi',
      subtitle: 'Quản lý các dự án do bạn khởi tạo'
    };
  }
  return {
    title: 'Dự án được phân công',
    subtitle: 'Các dự án bạn tham gia, chế độ chỉ xem'
  };
}
