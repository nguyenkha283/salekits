import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, LayoutDashboardIcon, PlusIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { CategoryCards } from '../components/CategoryCards';

/** Dải điều hướng phục vụ buổi demo — gỡ bỏ khi lên bản thật. */
function DemoNav() {
  return (
    <div className="border-b border-[#f0d9b8] bg-[#fdf3e2]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <span className="rounded bg-[#f5921f] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          Demo
        </span>
        <span className="mr-2 text-xs text-[#8a6a3f]">Luồng trình bày:</span>

        <Link
          to="/khoi-tao-du-an"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#e3c79f] bg-white px-3 py-1.5 text-xs font-semibold text-[#8a6a3f] transition-colors hover:bg-white/60">
          <PlusIcon className="h-3.5 w-3.5" /> 1. Khởi tạo dự án
        </Link>
        <ArrowRightIcon className="h-3.5 w-3.5 text-[#c9a97a]" />
        <Link
          to="/hoan-tat"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#e3c79f] bg-white px-3 py-1.5 text-xs font-semibold text-[#8a6a3f] transition-colors hover:bg-white/60">
          <LayoutDashboardIcon className="h-3.5 w-3.5" /> 2. CMS biên tập
        </Link>
        <ArrowRightIcon className="h-3.5 w-3.5 text-[#c9a97a]" />
        <Link
          to="/du-an"
          className="inline-flex items-center gap-1.5 rounded-md bg-[#4a3728] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#33251a]">
          3. Trang chi tiết dự án
        </Link>
      </div>
    </div>);

}

export function HomePage() {
  return (
    <div className="min-h-full w-full bg-white font-sans text-neutral-900">
      <Header />
      <DemoNav />
      <main>
        <Hero />
        <CategoryCards />
      </main>
    </div>);

}
