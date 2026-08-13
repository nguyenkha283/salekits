import { useSyncExternalStore } from 'react';
import type { Employee } from '../data/hrm';
import { LINE_LEADERS } from '../data/hrm';

/**
 * Trạng thái dùng chung giữa các màn: vai trò đang đóng, luồng duyệt dự án và
 * hộp thông báo.
 *
 * Vì sao cần kho riêng thay vì state trong từng trang: luồng duyệt đi qua nhiều
 * người và nhiều màn. Người tạo bấm Gửi duyệt ở CMS, đổi vai trò sang Trưởng
 * line thì phải thấy thông báo ngay, duyệt xong quay lại vai trò cũ lại thấy
 * kết quả. State cục bộ của từng trang không làm được việc đó.
 *
 * Dữ liệu lưu ở sessionStorage nên sống qua các lần chuyển trang và tải lại,
 * nhưng vẫn mất khi đóng tab — đúng tính chất một bản demo chưa có backend.
 */

export type WorkflowRole =
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

/** Nhóm Người tạo dự án theo mục 1.4 của SRS. */
export const CREATOR_ROLES: WorkflowRole[] = [
'APM',
'Trợ lý dự án',
'Hành chính dự án'];


export function isCreatorRole(role: WorkflowRole): boolean {
  return CREATOR_ROLES.includes(role);
}

/**
 * Vòng đời trạng thái.
 *
 * ⚠️ SRS mục 3.2 và UC-17 ghi rõ *"Hệ thống không có trạng thái Từ chối"* —
 * theo tài liệu, Trưởng line chưa đồng ý thì dự án giữ nguyên Chờ duyệt kèm ghi
 * chú. Trạng thái `tu-choi` ở đây làm theo yêu cầu nghiệp vụ mới và mâu thuẫn
 * với tài liệu; cần cập nhật SRS mục 3.2, UC-17 và bảng vòng đời trạng thái.
 */
export type WorkflowStatus = 'nhap' | 'cho-duyet' | 'da-duyet' | 'tu-choi';

export interface TeamAssignment {
  lineLeader: Employee;
  apm?: Employee;
  assistant?: Employee;
  admin?: Employee;
  /** Mã nhân viên Quản lý giao dịch đã gán vào dự án. */
  salesCodes: string[];
  marketingCodes: string[];
}

export interface AppNotification {
  id: string;
  /** Vai trò nhận thông báo này. */
  roles: WorkflowRole[];
  tone: 'info' | 'success' | 'warning';
  title: string;
  body: string;
  createdAt: string;
  readBy: WorkflowRole[];
}

export interface WorkflowState {
  role: WorkflowRole;
  status: WorkflowStatus;
  projectName: string;
  projectCode: string;
  /** Vai trò đã bấm Gửi duyệt, để biết ai cần nhận kết quả. */
  submittedByRole: WorkflowRole | null;
  submittedAt: string;
  decidedAt: string;
  rejectReason: string;
  team: TeamAssignment;
  notifications: AppNotification[];
}

const STORAGE_KEY = 'cenhomes.workflow.v1';

function initialState(): WorkflowState {
  return {
    role: 'APM',
    status: 'nhap',
    projectName: '',
    projectCode: '',
    submittedByRole: null,
    submittedAt: '',
    decidedAt: '',
    rejectReason: '',
    team: {
      lineLeader: LINE_LEADERS['line-2'],
      salesCodes: [],
      marketingCodes: []
    },
    notifications: []
  };
}

let state: WorkflowState = load();
const listeners = new Set<() => void>();

function load(): WorkflowState {
  if (typeof window === 'undefined') return initialState();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    // Trộn với mặc định để bản lưu từ phiên bản cũ không thiếu trường.
    return { ...initialState(), ...JSON.parse(raw) as WorkflowState };
  } catch {
    return initialState();
  }
}

function persist() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Chế độ riêng tư chặn sessionStorage: bỏ qua, kho vẫn chạy trong bộ nhớ.
  }
}

function setState(patch: Partial<WorkflowState>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWorkflow(): WorkflowState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

function now(): string {
  return new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
}

function notify(
notification: Omit<AppNotification, 'id' | 'createdAt' | 'readBy'>)
{
  setState({
    notifications: [
    {
      ...notification,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now(),
      readBy: []
    },
    ...state.notifications]

  });
}

// ── Hành động ────────────────────────────────────────────────────────────────

export function setRole(role: WorkflowRole) {
  setState({ role });
}

export function setProjectIdentity(projectName: string, projectCode: string) {
  if (state.projectName === projectName && state.projectCode === projectCode) return;
  setState({ projectName, projectCode });
}

export function updateTeam(patch: Partial<TeamAssignment>) {
  setState({ team: { ...state.team, ...patch } });
}

export function toggleAssignment(
group: 'salesCodes' | 'marketingCodes',
code: string)
{
  const current = state.team[group];
  const next = current.includes(code) ?
  current.filter((item) => item !== code) :
  [...current, code];
  updateTeam({ [group]: next } as Partial<TeamAssignment>);
}

/**
 * Điều kiện tối thiểu để gửi duyệt — UC-16.
 *
 * SRS còn yêu cầu có nội dung tab Tổng quan và ít nhất một ảnh hero banner;
 * hai điều kiện đó được kiểm ở phía màn CMS, nơi biết nội dung hiện có.
 */
export function teamReadyIssues(team: TeamAssignment): string[] {
  const issues: string[] = [];
  if (!team.apm) issues.push('Chưa có APM phụ trách');
  if (!team.assistant) issues.push('Chưa có Trợ lý dự án');
  if (!team.admin) issues.push('Chưa có Hành chính dự án');
  if (team.salesCodes.length === 0) {
    issues.push('Chưa gán Quản lý giao dịch nào vào dự án');
  }
  if (team.marketingCodes.length === 0) {
    issues.push('Chưa gán Marketing nào vào dự án');
  }
  return issues;
}

/** Trưởng phòng QLGD và Marketing gán nhân sự phòng mình vào dự án. */
export function isDeptHeadRole(role: WorkflowRole): boolean {
  return role === 'Trưởng phòng QLGD' || role === 'Trưởng phòng Marketing';
}

export function submitForApproval(projectName: string, projectCode: string) {
  const isResubmit = state.status === 'tu-choi';
  setState({
    status: 'cho-duyet',
    projectName,
    projectCode,
    submittedByRole: state.role,
    submittedAt: now(),
    rejectReason: isResubmit ? state.rejectReason : ''
  });
  notify({
    roles: ['Trưởng line'],
    tone: 'info',
    title: isResubmit ? 'Dự án đã gửi duyệt lại' : 'Có dự án mới cần duyệt',
    body: `${projectName || 'Dự án chưa đặt tên'}${projectCode ? ` · ${projectCode}` : ''} đang chờ bạn xử lý.`
  });
}

export function approveProject() {
  setState({ status: 'da-duyet', decidedAt: now(), rejectReason: '' });
  notify({
    roles: CREATOR_ROLES,
    tone: 'success',
    title: 'Dự án đã được duyệt',
    body: `${state.projectName || 'Dự án'} đã được xuất bản và hiển thị trên trang chi tiết dự án.`
  });
}

export function rejectProject(reason: string) {
  setState({ status: 'tu-choi', decidedAt: now(), rejectReason: reason.trim() });
  notify({
    roles: CREATOR_ROLES,
    tone: 'warning',
    title: 'Dự án chưa được duyệt',
    body: `${state.projectName || 'Dự án'} bị từ chối vì: ${reason.trim()}`
  });
}

export function markNotificationsRead(role: WorkflowRole) {
  setState({
    notifications: state.notifications.map((item) =>
    item.roles.includes(role) && !item.readBy.includes(role) ?
    { ...item, readBy: [...item.readBy, role] } :
    item
    )
  });
}

export function resetWorkflow() {
  state = initialState();
  persist();
  listeners.forEach((listener) => listener());
}

// ── Bộ chọn ──────────────────────────────────────────────────────────────────

export function notificationsFor(
notifications: AppNotification[],
role: WorkflowRole)
: AppNotification[] {
  return notifications.filter((item) => item.roles.includes(role));
}

export function unreadCountFor(
notifications: AppNotification[],
role: WorkflowRole)
: number {
  return notificationsFor(notifications, role).filter(
    (item) => !item.readBy.includes(role)
  ).length;
}
