/**
 * Đầu mối liên hệ — người của chủ đầu tư làm việc trực tiếp với đội dự án.
 *
 * Bản ghi DÙNG CHUNG: hai dự án của cùng một chủ đầu tư mà cùng làm việc với
 * một người thì trỏ tới cùng một bản ghi, không tạo bản trùng. Thứ định danh
 * là số điện thoại sau chuẩn hóa.
 */
export interface ProjectContact {
  id: string;
  investorId: string;
  /** contact_name */
  name: string;
  /** contact_phone — giữ nguyên dạng người dùng gõ. */
  phone: string;
  /** contact_dob — phục vụ chăm sóc quan hệ. */
  dob: string;
  /** contact_note — thói quen, sở thích. */
  note: string;
  createdBy: string;
}

/**
 * Đưa số điện thoại về một dạng duy nhất trước khi so trùng.
 * "+84 912 345 678", "0912.345.678" và "912345678" đều thành "0912345678".
 *
 * Phải khớp với hàm contact_normalize_phone trong
 * supabase/schema-dau-moi-lien-he.sql — hai bên lệch nhau là lọt bản ghi trùng.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (/^84[0-9]{9}$/.test(digits)) return `0${digits.slice(2)}`;
  if (/^[1-9][0-9]{8}$/.test(digits)) return `0${digits}`;
  return digits;
}

export function isValidPhone(input: string): boolean {
  return /^0[0-9]{8,10}$/.test(normalizePhone(input));
}

export const DEMO_CONTACTS: ProjectContact[] = [
{
  id: 'c-001',
  investorId: 'i-001',
  name: 'Chị Nguyễn Thanh Lan',
  phone: '0912 345 678',
  dob: '1988-04-12',
  note: 'Hẹn gặp buổi sáng, thích cà phê không đường. Duyệt tài liệu qua Zalo nhanh hơn email.',
  createdBy: 'u-apm-01'
},
{
  id: 'c-002',
  investorId: 'i-002',
  name: 'Anh Trần Quốc Dũng',
  phone: '0987 654 321',
  dob: '1980-11-03',
  note: 'Phụ trách ba dự án phía Đông. Không nghe máy giờ hành chính, nhắn tin trước.',
  createdBy: 'u-apm-07'
},
{
  id: 'c-003',
  investorId: 'i-003',
  name: 'Chị Lê Minh Châu',
  phone: '0908 111 222',
  dob: '',
  note: '',
  createdBy: 'u-apm-01'
}];


/**
 * Tra đầu mối theo số điện thoại — mô phỏng lệnh gọi mạng để phần giao diện
 * chạy đúng như khi nối vào endpoint thật. Khi có backend, thay thân hàm bằng
 * fetch tới `/api/contacts?phone=` và giữ nguyên chữ ký.
 */
export function lookupContactByPhone(
phone: string,
pool: ProjectContact[],
signal?: AbortSignal)
: Promise<ProjectContact | null> {
  return new Promise((resolve, reject) => {
    const key = normalizePhone(phone);
    const timer = setTimeout(() => {
      resolve(pool.find((item) => normalizePhone(item.phone) === key) ?? null);
    }, 200);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
