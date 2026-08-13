/**
 * Dữ liệu nhân sự — mô phỏng nguồn HRM.
 *
 * SRS mục 2.4 quy định tài khoản, chức danh và line đến từ HRM; hệ thống này
 * không tự tạo người dùng. Khi nối HRM thật, thay các hàm tra cứu bên dưới
 * bằng lệnh gọi API và giữ nguyên chữ ký.
 */

export interface Employee {
  /** Mã nhân viên — thứ người dùng gõ vào để tìm. */
  code: string;
  name: string;
  phone: string;
  email: string;
  title: string;
  department: string;
  /** Line phụ trách, chỉ có ở nhân sự thuộc khối kinh doanh dự án. */
  lineId?: string;
}

/** Trưởng line — gắn tự động từ HRM theo line của dự án (UC-05). */
export const LINE_LEADERS: Record<string, Employee> = {
  'line-2': {
    code: 'NV-0117',
    name: 'Trần Minh Khoa',
    phone: '0903 118 227',
    email: 'khoa.tm@cenhomes.vn',
    title: 'Trưởng line 2',
    department: 'Khối kinh doanh dự án',
    lineId: 'line-2'
  },
  'line-5': {
    code: 'NV-0142',
    name: 'Lưu Hoàng Nam',
    phone: '0903 556 118',
    email: 'nam.lh@cenhomes.vn',
    title: 'Trưởng line 5',
    department: 'Khối kinh doanh dự án',
    lineId: 'line-5'
  }
};

/** Nhân sự tra được bằng mã — dùng cho ô nhập mã nhân viên. */
export const EMPLOYEES: Employee[] = [
{
  code: 'NV-1042',
  name: 'Nguyễn Thu Hà',
  phone: '0912 004 218',
  email: 'ha.nt@cenhomes.vn',
  title: 'APM',
  department: 'Phòng kinh doanh dự án 2',
  lineId: 'line-2'
},
{
  code: 'NV-2087',
  name: 'Phạm Thùy Dung',
  phone: '0987 220 145',
  email: 'dung.pt@cenhomes.vn',
  title: 'Trợ lý dự án',
  department: 'Phòng kinh doanh dự án 2',
  lineId: 'line-2'
},
{
  code: 'NV-2091',
  name: 'Lê Hoài An',
  phone: '0975 331 802',
  email: 'an.lh@cenhomes.vn',
  title: 'Trợ lý dự án',
  department: 'Phòng kinh doanh dự án 2',
  lineId: 'line-2'
},
{
  code: 'NV-3155',
  name: 'Vũ Ngọc Mai',
  phone: '0968 447 013',
  email: 'mai.vn@cenhomes.vn',
  title: 'Hành chính dự án',
  department: 'Phòng hành chính dự án',
  lineId: 'line-2'
},
{
  code: 'NV-3160',
  name: 'Đặng Kim Chi',
  phone: '0913 776 254',
  email: 'chi.dk@cenhomes.vn',
  title: 'Hành chính dự án',
  department: 'Phòng hành chính dự án',
  lineId: 'line-2'
},
{
  code: 'NV-1055',
  name: 'Bùi Đức Thắng',
  phone: '0902 665 149',
  email: 'thang.bd@cenhomes.vn',
  title: 'APM',
  department: 'Phòng kinh doanh dự án 5',
  lineId: 'line-5'
}];


export interface Department {
  id: string;
  name: string;
  manager: Employee;
  staff: Employee[];
}

/** Phòng Quản lý giao dịch — hiển thị dạng cây trong màn Đội ngũ. */
export const SALES_DEPARTMENT: Department = {
  id: 'qlgd',
  name: 'Phòng Quản lý giao dịch',
  manager: {
    code: 'QLGD-01',
    name: 'Phạm Quốc Anh',
    phone: '0904 118 552',
    email: 'anh.pq@cenhomes.vn',
    title: 'Trưởng phòng Quản lý giao dịch',
    department: 'Phòng Quản lý giao dịch'
  },
  staff: [
  { code: 'QLGD-07', name: 'Ngô Hải Yến', phone: '0918 224 067', email: 'yen.nh@cenhomes.vn', title: 'Chuyên viên QLGD', department: 'Phòng Quản lý giao dịch' },
  { code: 'QLGD-12', name: 'Trịnh Văn Sơn', phone: '0973 550 118', email: 'son.tv@cenhomes.vn', title: 'Chuyên viên QLGD', department: 'Phòng Quản lý giao dịch' },
  { code: 'QLGD-15', name: 'Hoàng Thu Trang', phone: '0965 118 903', email: 'trang.ht@cenhomes.vn', title: 'Chuyên viên QLGD', department: 'Phòng Quản lý giao dịch' },
  { code: 'QLGD-18', name: 'Đỗ Minh Tuấn', phone: '0947 226 510', email: 'tuan.dm@cenhomes.vn', title: 'Chuyên viên QLGD', department: 'Phòng Quản lý giao dịch' },
  { code: 'QLGD-21', name: 'Lý Phương Thảo', phone: '0932 447 806', email: 'thao.lp@cenhomes.vn', title: 'Chuyên viên QLGD', department: 'Phòng Quản lý giao dịch' }]

};

/** Phòng Marketing — cấu trúc giống Quản lý giao dịch. */
export const MARKETING_DEPARTMENT: Department = {
  id: 'marketing',
  name: 'Phòng Marketing',
  manager: {
    code: 'MKT-01',
    name: 'Đỗ Thanh Vân',
    phone: '0906 337 218',
    email: 'van.dt@cenhomes.vn',
    title: 'Trưởng phòng Marketing',
    department: 'Phòng Marketing'
  },
  staff: [
  { code: 'MKT-05', name: 'Nguyễn Bảo Long', phone: '0919 663 250', email: 'long.nb@cenhomes.vn', title: 'Chuyên viên Marketing', department: 'Phòng Marketing' },
  { code: 'MKT-09', name: 'Trần Khánh Linh', phone: '0983 117 442', email: 'linh.tk@cenhomes.vn', title: 'Chuyên viên nội dung', department: 'Phòng Marketing' },
  { code: 'MKT-14', name: 'Phan Gia Huy', phone: '0961 208 774', email: 'huy.pg@cenhomes.vn', title: 'Chuyên viên thiết kế', department: 'Phòng Marketing' },
  { code: 'MKT-17', name: 'Vương Mỹ Hạnh', phone: '0938 550 227', email: 'hanh.vm@cenhomes.vn', title: 'Chuyên viên truyền thông', department: 'Phòng Marketing' }]

};

const ALL_PEOPLE: Employee[] = [
...EMPLOYEES,
...Object.values(LINE_LEADERS),
SALES_DEPARTMENT.manager,
...SALES_DEPARTMENT.staff,
MARKETING_DEPARTMENT.manager,
...MARKETING_DEPARTMENT.staff];


/** Tra nhân viên theo mã, không phân biệt hoa thường và khoảng trắng thừa. */
export function findEmployeeByCode(code: string): Employee | undefined {
  const key = code.trim().toUpperCase();
  if (!key) return undefined;
  return ALL_PEOPLE.find((person) => person.code.toUpperCase() === key);
}

/**
 * Tra nhân viên bất đồng bộ — mô phỏng lệnh gọi HRM để phần giao diện chạy
 * đúng như khi nối API thật.
 */
export function lookupEmployee(
code: string,
signal?: AbortSignal)
: Promise<Employee | null> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(findEmployeeByCode(code) ?? null), 240);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
