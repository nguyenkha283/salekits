import type { Investor } from '../types/investor';
import { matchInvestorName } from './investorMatching';

/**
 * Dữ liệu mẫu cho dashboard. Chưa có đăng nhập nên người dùng hiện tại được cố
 * định ở đây; khi gắn HRM thì thay bằng phiên đăng nhập thật.
 */
export const CURRENT_USER = {
  id: 'u-apm-01',
  name: 'Nguyễn Thu Hà',
  title: 'Phòng kinh doanh dự án 2',
  /** Line đang phụ trách, dùng khi đóng vai Trưởng line. */
  lineId: 'line-2'
};

/** Sản phẩm con của dự án — theo phân cấp dự án cha – con của SRS. */
export interface ProjectChild {
  id: string;
  name: string;
  kind: 'Tòa nhà' | 'Phân khu';
}

export interface DashboardProject {
  id: string;
  code: string;
  name: string;
  /** Cao tầng có tab Bảng hàng dạng lưới; thấp tầng chỉ có Quỹ căn. */
  layout: 'cao-tang' | 'thap-tang';
  propertyType: string;
  createdAt: string;
  coverUrl: string;
  investorId: string;
  /** Đầu mối liên hệ của dự án — tùy chọn (FR-CDT-10). */
  contactId?: string;
  /** Người khởi tạo dự án, quyết định phạm vi nhìn thấy đầu mối. */
  createdBy: string;
  /** Line phụ trách, dùng cho phạm vi của Trưởng line. */
  lineId: string;
  children: ProjectChild[];
}

export const DASHBOARD_PROJECTS: DashboardProject[] = [
{
  id: 'p-001',
  code: 'ISP-HN',
  name: 'Imperia Sky Park',
  layout: 'cao-tang',
  propertyType: 'Chung cư cao tầng',
  createdAt: '28/07/2026',
  coverUrl: '/af1ffc9b-36a7-4608-9ff1-165cbcf660be.jpg',
  investorId: 'i-001',
  createdBy: CURRENT_USER.id,
  lineId: 'line-2',
  contactId: 'c-001',
  children: [
  { id: 'p-001-t1', name: 'Tòa A1 — Hoa Sen', kind: 'Tòa nhà' },
  { id: 'p-001-t2', name: 'Tòa A2 — Hoa Mai', kind: 'Tòa nhà' },
  { id: 'p-001-t3', name: 'Tòa B1 — Hoa Lan', kind: 'Tòa nhà' },
  { id: 'p-001-t4', name: 'Tòa B2 — Hoa Đào', kind: 'Tòa nhà' }]

},
{
  id: 'p-002',
  code: 'VOP3',
  name: 'Vinhomes Ocean Park 3',
  layout: 'thap-tang',
  propertyType: 'Thấp tầng — liền kề, biệt thự',
  createdAt: '14/07/2026',
  coverUrl: '/688da3c2-8d95-4650-9f33-bb0bfb6d4692.jpg',
  investorId: 'i-002',
  createdBy: CURRENT_USER.id,
  lineId: 'line-2',
  contactId: 'c-002',
  children: [
  { id: 'p-002-k1', name: 'Phân khu The Zurich', kind: 'Phân khu' },
  { id: 'p-002-k2', name: 'Phân khu The Copenhagen', kind: 'Phân khu' },
  { id: 'p-002-k3', name: 'Phân khu The Amsterdam', kind: 'Phân khu' }]

},
{
  id: 'p-003',
  code: 'MSC-TD',
  name: 'Masteri Centre Point',
  layout: 'cao-tang',
  propertyType: 'Chung cư cao tầng',
  createdAt: '02/07/2026',
  coverUrl: '/f757d0c2-1880-4786-9ade-d83bdf5ffd51.jpg',
  investorId: 'i-003',
  createdBy: CURRENT_USER.id,
  lineId: 'line-2',
  contactId: 'c-003',
  children: [
  { id: 'p-003-t1', name: 'Tòa Sky Tower', kind: 'Tòa nhà' },
  { id: 'p-003-t2', name: 'Tòa Lake Tower', kind: 'Tòa nhà' }]

},
{
  id: 'p-004',
  code: 'SGH-PQ',
  name: 'Sun Grand City Hillside',
  layout: 'thap-tang',
  propertyType: 'Shophouse, nhà phố thương mại',
  createdAt: '19/06/2026',
  coverUrl: '/73dda9ab-a667-4bd9-a168-fc13267d6901.jpg',
  investorId: 'i-004',
  createdBy: 'u-apm-07',
  lineId: 'line-5',
  contactId: 'c-004',
  children: [
  { id: 'p-004-k1', name: 'Phân khu Đồi Hoàng Hôn', kind: 'Phân khu' },
  { id: 'p-004-k2', name: 'Phân khu Bãi Trường', kind: 'Phân khu' }]

},
{
  id: 'p-005',
  code: 'ECP-LB',
  name: 'Ecopark Sky Forest Residences',
  layout: 'cao-tang',
  propertyType: 'Chung cư cao tầng',
  createdAt: '05/06/2026',
  coverUrl: '/ebd3240e-6608-4c50-8739-cfe41926dd74.jpg',
  investorId: 'i-005',
  createdBy: 'u-apm-07',
  lineId: 'line-5',
  children: [
  { id: 'p-005-t1', name: 'Tòa Sunrise', kind: 'Tòa nhà' },
  { id: 'p-005-t2', name: 'Tòa Sunset', kind: 'Tòa nhà' },
  { id: 'p-005-t3', name: 'Tòa Horizon', kind: 'Tòa nhà' }]

}];


export const DASHBOARD_INVESTORS: Investor[] = [
{
  id: 'i-001',
  code: 'MIKGROUP',
  name: 'Công ty Cổ phần Tập đoàn MIK Group Việt Nam',
  taxCode: '0106215426',
  slug: 'mik-group-viet-nam',
  logoUrl: '',
  description:
  'Nhà phát triển bất động sản cao cấp tại Hà Nội và TP.HCM, nổi bật với dòng sản phẩm Imperia và The Matrix One.',
  advantages: [
  'Hơn 20 dự án đã bàn giao đúng tiến độ',
  'Chuỗi sản phẩm cao cấp Imperia',
  'Hệ sinh thái quản lý vận hành riêng'],

  numbers: [
  { value: '2014', label: 'Năm thành lập', description: 'Khởi đầu tại Hà Nội' },
  { value: '7.000+', label: 'Căn hộ đã bàn giao', description: 'Tính đến 2025' }],

  address: 'Tầng 12, Tòa nhà Hanoi Tower, 49 Hai Bà Trưng, Hà Nội',
  website: 'https://mikgroup.com.vn',
  foundedYear: '2014',
  status: 'Đang sử dụng',
  createdBy: CURRENT_USER.id,
  createdAt: '28/07/2026',
  projectCount: 1
},
{
  id: 'i-002',
  code: 'VINHOMES',
  name: 'Công ty Cổ phần Vinhomes',
  taxCode: '0102671977',
  slug: 'vinhomes',
  logoUrl: '',
  description:
  'Nhà phát triển bất động sản nhà ở lớn nhất Việt Nam, thành viên Tập đoàn Vingroup.',
  advantages: [
  'Quỹ đất lớn nhất thị trường',
  'Hệ sinh thái tiện ích Vin đồng bộ',
  'Tiến độ xây dựng nhanh'],

  numbers: [
  { value: '30+', label: 'Đại đô thị', description: 'Trải khắp cả nước' },
  { value: '2008', label: 'Năm thành lập', description: '' }],

  address: 'Số 458 Minh Khai, Hai Bà Trưng, Hà Nội',
  website: 'https://vinhomes.vn',
  foundedYear: '2008',
  status: 'Đang sử dụng',
  createdBy: 'u-admin',
  createdAt: '12/06/2026',
  projectCount: 1
},
{
  id: 'i-003',
  code: 'MASTERISE',
  name: 'Công ty TNHH Masterise Homes',
  taxCode: '0313627188',
  slug: 'masterise-homes',
  logoUrl: '',
  description:
  'Nhà phát triển bất động sản hàng hiệu, hợp tác với các thương hiệu quốc tế như Marriott và Ritz-Carlton.',
  advantages: ['Bất động sản hàng hiệu', 'Chuẩn bàn giao quốc tế'],
  numbers: [{ value: '2016', label: 'Năm thành lập', description: '' }],
  address: 'Tòa Masteri Centre Point, TP. Thủ Đức, TP.HCM',
  website: 'https://masterisehomes.com',
  foundedYear: '2016',
  status: 'Đang sử dụng',
  createdBy: CURRENT_USER.id,
  createdAt: '02/07/2026',
  projectCount: 1
},
{
  id: 'i-004',
  code: 'SUNGROUP',
  name: 'Tập đoàn Sun Group',
  taxCode: '0104097042',
  slug: 'sun-group',
  logoUrl: '',
  description:
  'Tập đoàn phát triển du lịch, vui chơi giải trí và bất động sản nghỉ dưỡng tại Đà Nẵng, Phú Quốc, Sa Pa.',
  advantages: ['Hệ sinh thái nghỉ dưỡng khép kín', 'Công trình biểu tượng vùng miền'],
  numbers: [{ value: '2007', label: 'Năm thành lập', description: '' }],
  address: 'Tòa nhà Sun Grand City, Ba Đình, Hà Nội',
  website: 'https://sungroup.com.vn',
  foundedYear: '2007',
  status: 'Đang sử dụng',
  createdBy: 'u-apm-07',
  createdAt: '19/06/2026',
  projectCount: 1
},
{
  id: 'i-005',
  code: 'ECOPARK',
  name: 'Công ty Cổ phần Tập đoàn Ecopark',
  taxCode: '0900233824',
  slug: 'ecopark',
  logoUrl: '',
  description:
  'Chủ đầu tư khu đô thị xanh Ecopark tại Hưng Yên, định hướng phát triển đô thị sinh thái.',
  advantages: ['Mật độ cây xanh cao nhất miền Bắc', 'Đô thị đã vận hành hơn 10 năm'],
  numbers: [{ value: '500 ha', label: 'Quy mô', description: 'Khu đô thị Ecopark' }],
  address: 'Khu đô thị Ecopark, Văn Giang, Hưng Yên',
  website: 'https://ecopark.com.vn',
  foundedYear: '2003',
  status: 'Đang sử dụng',
  createdBy: CURRENT_USER.id,
  createdAt: '05/06/2026',
  projectCount: 1
},
{
  id: 'i-006',
  code: 'NAMLONG',
  name: 'Công ty Cổ phần Đầu tư Nam Long',
  taxCode: '0300762800',
  slug: 'nam-long',
  logoUrl: '',
  description:
  'Nhà phát triển bất động sản vừa túi tiền tại khu vực phía Nam với các dòng sản phẩm EHome, Flora, Valora.',
  advantages: ['Sản phẩm vừa túi tiền', 'Hợp tác vốn với đối tác Nhật Bản'],
  numbers: [{ value: '1992', label: 'Năm thành lập', description: '' }],
  address: '6 Nguyễn Khắc Viện, Quận 7, TP.HCM',
  website: 'https://namlongvn.com',
  foundedYear: '1992',
  status: 'Đang sử dụng',
  createdBy: 'u-admin',
  createdAt: '21/05/2026',
  projectCount: 0
},
{
  id: 'i-007',
  code: 'PHATDAT',
  name: 'Công ty Cổ phần Phát triển Bất động sản Phát Đạt',
  taxCode: '0303493756',
  slug: 'phat-dat',
  logoUrl: '',
  description:
  'Chủ đầu tư các dự án nhà ở và khu đô thị tại TP.HCM, Bình Định, Bình Dương.',
  advantages: ['Quỹ đất ven biển miền Trung'],
  numbers: [],
  address: '39 Phạm Ngọc Thạch, Quận 3, TP.HCM',
  website: 'https://phatdat.com.vn',
  foundedYear: '2004',
  status: 'Ngừng sử dụng',
  createdBy: 'u-apm-07',
  createdAt: '08/05/2026',
  projectCount: 0
}];


/**
 * Gợi ý tìm kiếm — mô phỏng một lệnh gọi mạng để phần giao diện chạy đúng như
 * khi nối vào endpoint thật. Khi có backend, thay thân hàm bằng fetch tới
 * `/api/investors?q=` và giữ nguyên chữ ký.
 */
export function searchInvestors(
keyword: string,
pool: Investor[],
signal?: AbortSignal)
: Promise<Investor[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const scored = pool.
      map((investor) => ({
        investor,
        level: matchInvestorName(investor.name, keyword)
      })).
      filter((item) => item.level !== null).
      sort((a, b) => (a.level ?? 9) - (b.level ?? 9));
      resolve(scored.map((item) => item.investor));
    }, 220);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
