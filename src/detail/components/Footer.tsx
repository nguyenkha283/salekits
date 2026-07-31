import React from 'react';
import { MapPinIcon, PhoneIcon, MailIcon, FacebookIcon, YoutubeIcon, GlobeIcon, ArrowRightIcon } from 'lucide-react';
import { Logo } from './Logo';
const COLUMNS = [{
  title: 'Giới thiệu',
  links: ['Về Cenhomes.vn', 'Nghề nghiệp', 'Hồ sơ thương hiệu', 'Tin tức', 'Videos']
}, {
  title: 'Khám phá',
  links: ['Dự án Bất động sản', 'Nhà bán lẻ', 'Nhà cho thuê', 'Đăng tin bán nhà', 'Đăng tin cho thuê nhà']
}, {
  title: 'Điều khoản',
  links: ['Quy chế hoạt động', 'Chính sách bảo mật', 'Cơ chế giải quyết tranh chấp']
}];
export function Footer() {
  return <footer className="w-full bg-[#2b2018] text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top row: logo + hotlines */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <Logo variant="light" />
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-14">
            <div>
              <p className="text-xs text-stone-400">Hotline miễn phí (24/7)</p>
              <p className="mt-1 text-lg font-bold text-white">1800 6268</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Chăm sóc khách hàng</p>
              <p className="mt-1 text-lg font-bold text-white">hotro@cenhomes.vn</p>
            </div>
          </div>
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-1 gap-10 py-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Contact */}
          <div>
            <h4 className="text-base font-bold text-white">Liên hệ chúng tôi</h4>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                <span>Số 137 Nguyễn Ngọc Vũ, phường Yên Hòa, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4 shrink-0 text-stone-400" />
                <span>1800 6268</span>
              </li>
              <li className="flex items-center gap-3">
                <MailIcon className="h-4 w-4 shrink-0 text-stone-400" />
                <span>hotro@cenhomes.vn</span>
              </li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 rounded bg-white px-2 py-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-600">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-600" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block text-[10px] font-bold text-red-600">ĐÃ ĐĂNG KÝ</span>
                <span className="block text-[8px] font-semibold text-red-600">BỘ CÔNG THƯƠNG</span>
              </span>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => <div key={col.title}>
              <h4 className="text-base font-bold text-white">{col.title}</h4>
              <ul className="mt-5 space-y-3.5 text-sm">
                {col.links.map((l) => <li key={l}>
                    <a href="#" className="transition-colors hover:text-white">
                      {l}
                    </a>
                  </li>)}
              </ul>
            </div>)}

          {/* Newsletter */}
          <div>
            <h4 className="text-base font-bold text-white">Nhận tin tức</h4>
            <p className="mt-5 text-sm text-stone-400">
              Đăng ký nhận thông tin mới nhất từ Cenhomes
            </p>
            <form className="mt-4 flex items-stretch overflow-hidden rounded-md border border-white/15 bg-transparent" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Nhập email" aria-label="Nhập email" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-stone-500 outline-none" />
              <button type="submit" aria-label="Đăng ký" className="m-1.5 flex w-10 items-center justify-center rounded bg-[#f5921f] text-white transition-colors hover:bg-[#e08315]">
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="text-sm text-stone-400">© 2021 Cenhomes.vn</span>
            <a href="#" aria-label="Facebook" className="text-stone-300 transition-colors hover:text-white">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube" className="text-stone-300 transition-colors hover:text-white">
              <YoutubeIcon className="h-5 w-5" />
            </a>
          </div>
          <button className="flex items-center gap-2 text-sm text-stone-300 transition-colors hover:text-white">
            <GlobeIcon className="h-4 w-4" />
            Tiếng Việt
          </button>
        </div>
      </div>
    </footer>;
}