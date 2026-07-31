import React from 'react';
import { ArrowUpRightIcon, Building2Icon } from 'lucide-react';
import { BUILDINGS } from '../data/inventoryData';

const BUILDING_IMAGES = ["/af90a9a2-cfa1-4e06-bf16-c3467b5c5fff.jpg", "/bc3b6fbd-aac1-4c49-be3b-976b35aa7a67.jpg", "/f757d0c2-1880-4786-9ade-d83bdf5ffd51.jpg", "/f04fab1e-81cd-4b76-9643-996fa55133e2.jpg"];






const DESCRIPTIONS = [
'Tòa 1 sở hữu vị trí nổi bật trong quy hoạch, mang tới tầm nhìn rộng mở cùng trải nghiệm sống riêng tư, tinh tế.',
'Tòa 2 được bao quanh bởi khoảng xanh và tiện ích nội khu, phù hợp với nhịp sống cân bằng của gia đình hiện đại.',
'Tòa 3 kết nối trực tiếp tới hệ cảnh quan trung tâm, nơi ánh sáng và thiên nhiên hiện diện trong từng khoảnh khắc.',
'Tòa 4 là lựa chọn dành cho người yêu không gian yên tĩnh, với thiết kế chỉn chu và những tiện ích chọn lọc.'];


export function BuildingsContent() {
  return (
    <section data-cms-section="products-tab" data-cms-label="Danh sách sản phẩm" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="buildings-title">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7955]"><Building2Icon className="h-4 w-4" /> Hệ tòa căn hộ</span>
        <h1 id="buildings-title" className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[#3b2c1d] sm:text-4xl">Khám phá các tòa nhà</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">Bốn tòa căn hộ được quy hoạch hài hòa giữa không gian xanh, tiện ích riêng và nhịp sống kết nối.</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {BUILDINGS.map((building, index) =>
        <article key={building} className="group overflow-hidden border border-stone-200 bg-white shadow-sm">
            <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
              <img src={BUILDING_IMAGES[index]} alt={`Phối cảnh ${building} Imperia Sky Park`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 text-white">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/75">Imperia Sky Park</p>
                <h2 className="mt-1 text-2xl font-semibold">{building}</h2>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-6 text-stone-600">{DESCRIPTIONS[index]}</p>
              <button className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#3b2c1d] transition-colors hover:text-[#f5921f]">
                Xem thông tin <ArrowUpRightIcon className="h-4 w-4" />
              </button>
            </div>
          </article>
        )}
      </div>
    </section>);

}