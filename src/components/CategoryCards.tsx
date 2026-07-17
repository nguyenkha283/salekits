import React from 'react';
import { HomeIcon, Building2Icon, KeyRoundIcon } from 'lucide-react';
export function CategoryCards() {
  return (
    <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-6 px-4 py-14 md:grid-cols-3">
      {/* Nhà bán lẻ */}
      <article className="rounded-2xl bg-orange-50 p-7">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-white shadow-sm">
          <HomeIcon className="h-7 w-7 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">NHÀ BÁN LẺ</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
          <span className="font-semibold text-neutral-800">304,612</span> nhà đã
          ký gửi 5 phút có 1 giao dịch thành công
        </p>
      </article>

      {/* Dự án (featured) */}
      <article className="relative overflow-hidden rounded-2xl bg-orange-500 p-7 text-white">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
          alt="Cảnh quan đô thị"
          className="pointer-events-none absolute bottom-0 right-0 h-40 w-full object-cover opacity-25" />
        
        <div className="relative">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-white shadow-sm">
            <Building2Icon className="h-7 w-7 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold">DỰ ÁN</h2>
          <p className="mt-4 text-lg font-bold">535 dự án</p>
          <p className="mt-1 text-[15px] font-semibold">
            456,851 lượt tìm kiếm trong 24h
          </p>
        </div>
      </article>

      {/* Nhà cho thuê */}
      <article className="rounded-2xl bg-orange-50 p-7">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-xl bg-white shadow-sm">
          <KeyRoundIcon className="h-7 w-7 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">NHÀ CHO THUÊ</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
          <span className="font-semibold text-neutral-800">19,739</span> nhà
          thuê <span className="font-semibold text-neutral-800">53,926</span>{' '}
          lượt tìm kiếm trong ngày
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
          Chủ nhà và khách thuê được kết nối
        </p>
      </article>
    </section>);

}