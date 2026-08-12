import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDownIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PlusIcon,
  UserIcon,
  XIcon } from
'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
const NAV_ITEMS = [
'Kho dự án',
'Nhà bán lẻ',
'Nhà cho thuê',
'Giá nhà đất',
'Tin tức'];

type HeaderVariant = 'hero' | 'light';
interface HeaderProps {
  variant?: HeaderVariant;
}
export function Header({ variant = 'hero' }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isLight = variant === 'light';
  const foreground = isLight ? 'text-neutral-900' : 'text-white';
  const mutedForeground = isLight ?
  'text-neutral-600 hover:text-orange-600' :
  'text-white/95 hover:text-white';
  function goToCreateProject() {
    setMobileOpen(false);
    navigate('/khoi-tao-du-an');
  }

  // Đóng menu tài khoản khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!accountOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [accountOpen]);

  function goToDashboard() {
    setAccountOpen(false);
    setMobileOpen(false);
    navigate('/dashboard');
  }
  return (
    <header
      className={`z-30 w-full ${isLight ? 'border-b border-neutral-200 bg-white' : 'absolute left-0 right-0 top-0'}`}>
      
      <nav className="mx-auto flex max-w-[1400px] items-center gap-6 px-4 py-5 lg:px-8">
        <Link
          to="/"
          className={`flex shrink-0 items-center gap-2 ${foreground}`}
          aria-label="CENHOMES.VN - Trang chủ">
          
          <span
            className={`grid h-8 w-8 place-items-center rounded-md ${isLight ? 'bg-orange-500' : 'bg-white/20 ring-1 ring-white/40'}`}>
            
            <span className="block h-3.5 w-3.5 rotate-45 border-2 border-white" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">
            CENH
            <span className={isLight ? 'text-orange-500' : 'text-white/95'}>
              O
            </span>
            MES<span className="align-super text-xs font-semibold">.VN</span>
          </span>
        </Link>

        <ul className="ml-4 hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) =>
          <li key={item}>
              <a
              href="#"
              className={`text-[15px] font-medium transition-colors ${mutedForeground}`}>
              
                {item}
              </a>
            </li>
          )}
        </ul>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 md:flex">
            
            Trở thành môi giới
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToCreateProject}
            className={`hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors sm:flex ${isLight ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white text-orange-600 hover:bg-orange-50'}`}>
            
            <PlusIcon className="h-4 w-4" />
            Tạo dự án
          </button>
          <div ref={accountRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setAccountOpen((value) => !value)}
              className={`flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 text-left transition-colors sm:flex ${foreground} ${isLight ? 'hover:bg-neutral-100' : 'hover:bg-white/10'}`}
              aria-label="Thông tin tài khoản"
              aria-haspopup="menu"
              aria-expanded={accountOpen}>
              
              <span
                className={`grid h-9 w-9 place-items-center rounded-full ${isLight ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-100' : 'bg-white/20 ring-1 ring-white/40'}`}>
                
                <UserIcon className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold">Role APM</span>
                <span
                  className={`block text-xs ${isLight ? 'text-neutral-500' : 'text-white/80'}`}>
                  
                  2 chức danh
                </span>
              </span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              
            </button>

            {accountOpen &&
            <div
              role="menu"
              aria-label="Menu tài khoản"
              className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 overflow-hidden rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-neutral-200">
              
                <button
                type="button"
                role="menuitem"
                onClick={goToDashboard}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-neutral-800 transition-colors hover:bg-orange-50 hover:text-orange-600">
                
                  <LayoutDashboardIcon className="h-4 w-4 text-neutral-400" />
                  Dashboard
                </button>
              </div>
            }
          </div>
          <button
            type="button"
            className={`grid h-10 w-10 place-items-center rounded-md lg:hidden ${isLight ? 'bg-orange-50 text-orange-600' : 'bg-white/20 text-white'}`}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}>
            
            {mobileOpen ?
            <XIcon className="h-5 w-5" /> :

            <MenuIcon className="h-5 w-5" />
            }
          </button>
        </div>
      </nav>

      {mobileOpen &&
      <div className="absolute left-4 right-4 top-[76px] rounded-xl bg-white p-4 shadow-lg ring-1 ring-neutral-100 lg:hidden">
          <ul className="flex flex-col divide-y divide-neutral-100">
            {NAV_ITEMS.map((item) =>
          <li key={item}>
                <a
              href="#"
              className="block py-3 text-[15px] font-medium text-neutral-800">
              
                  {item}
                </a>
              </li>
          )}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <button
            type="button"
            onClick={goToDashboard}
            className="flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-800">
            
              <LayoutDashboardIcon className="h-4 w-4" />
              Dashboard
            </button>
            <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white">
            
              Trở thành môi giới
            </button>
            <button
            type="button"
            onClick={goToCreateProject}
            className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white">
            
              <PlusIcon className="h-4 w-4" />
              Tạo dự án
            </button>
          </div>
        </div>
      }
    </header>);

}