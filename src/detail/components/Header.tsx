import React, { useEffect, useRef, useState } from 'react';
import { BellIcon, ChevronDownIcon, PlusIcon, CheckIcon, MenuIcon } from 'lucide-react';
import { Logo } from './Logo';
export type Role = 'Trưởng line' | 'APM' | 'Trợ lý dự án' | 'Hành chính dự án' | 'Quản lý giao dịch' | 'Marketing';
const ROLES: Role[] = ['Trưởng line', 'APM', 'Trợ lý dự án', 'Hành chính dự án', 'Quản lý giao dịch', 'Marketing'];

/** Roles allowed to see the "Tạo dự án" button. */
const CREATE_ROLES: Role[] = ['APM', 'Trợ lý dự án', 'Hành chính dự án'];
const NAV_ITEMS = ['Kho dự án', 'Nhà bán lẻ', 'Nhà cho thuê', 'Giá nhà đất', 'Tin tức'];
interface HeaderProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}
export function Header({
  role,
  onRoleChange
}: HeaderProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Kho dự án');
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const canCreate = CREATE_ROLES.includes(role);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  return <header className="z-40 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <a href="#" className="shrink-0" aria-label="Cenhomes.vn trang chủ">
          <Logo />
        </a>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => <button key={item} onClick={() => setActiveNav(item)} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeNav === item ? 'text-[#f5921f]' : 'text-gray-700 hover:text-[#f5921f]'}`}>
              {item}
            </button>)}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Create project — role gated */}
          {canCreate && <button className="hidden items-center gap-1.5 rounded-md bg-[#f5921f] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e08315] sm:inline-flex">
              <PlusIcon className="h-4 w-4" />
              Tạo dự án
            </button>}

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen((v) => !v)} className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100" aria-label="Thông báo">
              <BellIcon className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            {notifOpen && <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
                  Thông báo
                </div>
                <ul className="max-h-72 overflow-auto text-sm">
                  {['Dự án Imperia Sky Park vừa cập nhật bảng hàng.', 'Bạn có 2 giao dịch chờ duyệt.', 'Chính sách bán hàng mới đã được ban hành.'].map((n, i) => <li key={i} className="cursor-pointer border-b border-gray-50 px-4 py-3 text-gray-700 last:border-0 hover:bg-gray-50">
                      {n}
                    </li>)}
                </ul>
              </div>}
          </div>

          {/* Role selector */}
          <div className="relative" ref={roleRef}>
            <button onClick={() => setRoleOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-gray-400" aria-haspopup="listbox" aria-expanded={roleOpen}>
              <span className="hidden text-gray-400 sm:inline">Vai trò:</span>
              <span className="max-w-[9rem] truncate">{role}</span>
              <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleOpen && <ul role="listbox" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {ROLES.map((r) => <li key={r}>
                    <button role="option" aria-selected={r === role} onClick={() => {
                onRoleChange(r);
                setRoleOpen(false);
              }} className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${r === role ? 'font-semibold text-[#f5921f]' : 'text-gray-700'}`}>
                      {r}
                      {r === role && <CheckIcon className="h-4 w-4" />}
                    </button>
                  </li>)}
              </ul>}
          </div>

          <button onClick={() => setMobileOpen((v) => !v)} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 lg:hidden" aria-label="Mở menu">
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && <nav className="border-t border-gray-100 bg-white px-4 py-2 lg:hidden" aria-label="Điều hướng di động">
          {NAV_ITEMS.map((item) => <button key={item} onClick={() => {
        setActiveNav(item);
        setMobileOpen(false);
      }} className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium ${activeNav === item ? 'text-[#f5921f]' : 'text-gray-700'}`}>
              {item}
            </button>)}
          {canCreate && <button className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-[#f5921f] px-3.5 py-2 text-sm font-semibold text-white sm:hidden">
              <PlusIcon className="h-4 w-4" />
              Tạo dự án
            </button>}
        </nav>}
    </header>;
}