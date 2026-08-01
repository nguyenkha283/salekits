import React from 'react';
import { ArrowUpRightIcon, Building2Icon } from 'lucide-react';
import { REAL_TOWERS, REAL_UNITS } from '../data/realInventory';

const BUILDING_IMAGES = ["/af90a9a2-cfa1-4e06-bf16-c3467b5c5fff.jpg", "/bc3b6fbd-aac1-4c49-be3b-976b35aa7a67.jpg", "/f757d0c2-1880-4786-9ade-d83bdf5ffd51.jpg", "/f04fab1e-81cd-4b76-9643-996fa55133e2.jpg"];






/** Số liệu mỗi tòa suy trực tiếp từ bảng hàng đã import. */
function statsOf(tower: string) {
  const units = REAL_UNITS.filter((unit) => unit.tower === tower);
  const available = units.filter((unit) => unit.status === 'Còn hàng').length;
  const areas = units.map((unit) => unit.area);
  const bedrooms = [...new Set(units.map((unit) => unit.bedrooms))].sort();
  return {
    total: units.length,
    available,
    minArea: Math.min(...areas),
    maxArea: Math.max(...areas),
    bedrooms
  };
}


export function BuildingsContent() {
  return (
    <section data-cms-section="products-tab" data-cms-label="Danh sách sản phẩm" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="buildings-title">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a7955]"><Building2Icon className="h-4 w-4" /> Hệ tòa căn hộ</span>
        <h1 id="buildings-title" className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[#3b2c1d] sm:text-4xl">Khám phá các tòa nhà</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">Danh sách tòa sinh tự động từ cột <span className="font-mono text-[13px]">TRỤC / Tòa</span> trong file bảng hàng đã nhập.</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {REAL_TOWERS.map((tower, index) => {
          const stats = statsOf(tower);
          return (
            <article key={tower} className="group overflow-hidden border border-stone-200 bg-white shadow-sm">
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                <img src={BUILDING_IMAGES[index % BUILDING_IMAGES.length]} alt={`Phối cảnh tòa ${tower}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 text-white">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/75">Imperia Sky Park</p>
                  <h2 className="mt-1 text-2xl font-semibold">Tòa {tower}</h2>
                </div>
              </div>
              <div className="p-5">
                <dl className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-stone-500">Căn trong quỹ</dt>
                    <dd className="font-mono font-semibold text-[#3b2c1d]">{stats.total}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-stone-500">Còn hàng</dt>
                    <dd className="font-mono font-semibold text-[#047857]">{stats.available}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-stone-500">Diện tích</dt>
                    <dd className="font-mono text-[#3b2c1d]">{stats.minArea.toFixed(1)} – {stats.maxArea.toFixed(1)} m²</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-stone-500">Loại căn</dt>
                    <dd className="text-[#3b2c1d]">{stats.bedrooms.join(', ')}</dd>
                  </div>
                </dl>
                <button className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#3b2c1d] transition-colors hover:text-[#f5921f]">
                  Xem bảng hàng <ArrowUpRightIcon className="h-4 w-4" />
                </button>
              </div>
            </article>);

        })}
      </div>
    </section>);

}