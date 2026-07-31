import React from 'react';
import { MapPinIcon, Building2Icon, LayersIcon, RulerIcon, CalendarIcon, UserRoundIcon } from 'lucide-react';
import { ImageSlider } from './ImageSlider';
const IMAGES = [{
  src: '/af90a9a2-cfa1-4e06-bf16-c3467b5c5fff.jpg',
  alt: 'Phối cảnh Imperia Sky Park Nam An Khánh'
}, {
  src: '/bc3b6fbd-aac1-4c49-be3b-976b35aa7a67.jpg',
  alt: 'Phối cảnh ngoại thất dự án Imperia Sky Park'
}, {
  src: '/73dda9ab-a667-4bd9-a168-fc13267d6901.jpg',
  alt: 'Vị trí kết nối dự án Imperia Sky Park'
}];
const QUICK_FACTS = [{
  icon: Building2Icon,
  label: 'Chủ đầu tư',
  value: 'MIK Group'
}, {
  icon: MapPinIcon,
  label: 'Vị trí',
  value: 'Minh Khai, Hai Bà Trưng, Hà Nội'
}, {
  icon: LayersIcon,
  label: 'Quy mô',
  value: '4 tòa tháp, 40 tầng'
}, {
  icon: RulerIcon,
  label: 'Diện tích căn',
  value: '55 - 120 m²'
}, {
  icon: CalendarIcon,
  label: 'Bàn giao',
  value: 'Quý IV / 2024'
}, {
  icon: UserRoundIcon,
  label: 'Số căn hộ',
  value: '≈ 1.900 căn'
}];
export function ProjectContent() {
  return <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ImageSlider images={IMAGES} />

        <section className="mt-8">
          <h2 className="text-xl font-bold text-stone-900">Tổng quan dự án</h2>
          <div className="mt-3 space-y-4 text-[15px] leading-7 text-stone-700">
            <p>
              <strong>Imperia Sky Park</strong> là tổ hợp căn hộ cao cấp do MIK Group phát triển,
              tọa lạc tại vị trí đắc địa trung tâm Hà Nội. Dự án hướng tới không gian sống xanh,
              hiện đại với hệ tiện ích nội khu đồng bộ và chất lượng bàn giao tiêu chuẩn cao.
            </p>
            <p>
              Theo dõi thông tin chi tiết về bảng giá, quỹ căn, mặt bằng, tiến độ và chính sách bán
              hàng dự án ngay trên trang này. Các mục có biểu tượng khóa yêu cầu quyền truy cập phù
              hợp với vai trò của bạn.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold text-stone-900">Tiện ích nổi bật</h3>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-[15px] text-stone-700 sm:grid-cols-2">
            {['Bể bơi vô cực trên cao', 'Công viên nội khu 3.000 m²', 'Trung tâm thương mại & shophouse', 'Phòng gym & spa tiêu chuẩn 5 sao', 'Trường mầm non liên cấp', 'Hầm gửi xe thông minh 3 tầng'].map((t) => <li key={t} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5921f]" />
                {t}
              </li>)}
          </ul>
        </section>
      </div>

      {/* Sidebar quick facts */}
      <aside className="lg:col-span-1">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-stone-900">Thông tin nhanh</h3>
          <dl className="mt-4 space-y-4">
            {QUICK_FACTS.map((f) => {
            const Icon = f.icon;
            return <div key={f.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5921f]/10 text-[#f5921f]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <dt className="text-xs text-stone-500">{f.label}</dt>
                    <dd className="text-sm font-medium text-stone-900">{f.value}</dd>
                  </div>
                </div>;
          })}
          </dl>
          <button className="mt-5 w-full rounded-md bg-[#f5921f] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e08315]">
            Đăng ký tư vấn
          </button>
        </div>
      </aside>
    </div>;
}