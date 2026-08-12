import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2Icon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  PlusIcon,
  UserIcon } from
'lucide-react';
import {
  CURRENT_USER,
  DASHBOARD_INVESTORS,
  DASHBOARD_PROJECTS,
  type DashboardProject } from
'../dashboard/dashboardData';
import { ProjectsSection } from '../dashboard/ProjectsSection';
import { InvestorsSection } from '../dashboard/InvestorsSection';
import type { Investor } from '../types/investor';

type MenuKey = 'tong-quan' | 'du-an' | 'chu-dau-tu';

const MENU: {key: MenuKey;label: string;icon: React.ComponentType<{className?: string;}>;}[] =
[
{ key: 'tong-quan', label: 'Dashboard', icon: LayoutDashboardIcon },
{ key: 'du-an', label: 'Quản lý dự án', icon: FolderKanbanIcon },
{ key: 'chu-dau-tu', label: 'Quản lý Chủ đầu tư', icon: Building2Icon }];


function isMenuKey(value: string | null): value is MenuKey {
  return value === 'tong-quan' || value === 'du-an' || value === 'chu-dau-tu';
}

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const menuParam = searchParams.get('muc');
  const active: MenuKey = isMenuKey(menuParam) ? menuParam : 'tong-quan';

  const [projects, setProjects] = useState<DashboardProject[]>(DASHBOARD_PROJECTS);
  const [investors, setInvestors] = useState<Investor[]>(DASHBOARD_INVESTORS);

  function goTo(key: MenuKey) {
    setSearchParams(key === 'tong-quan' ? {} : { muc: key });
  }

  return (
    <div className="min-h-full w-full bg-neutral-50 font-sans text-neutral-900">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-2.5 border-b border-neutral-200 bg-white px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Về trang chủ">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-[#6D3A18]">
            <span className="h-3 w-3 rotate-45 border-2 border-white" />
          </span>
          <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-[#173020] sm:text-xl">
            CENH<span className="text-[#f5881f]">O</span>MES
            <span className="align-super text-[9px] font-bold sm:text-[10px]">
              .VN
            </span>
          </span>
        </Link>
        <span className="h-6 w-px shrink-0 bg-neutral-300" aria-hidden="true" />
        <span className="hidden text-sm font-semibold text-neutral-700 sm:block">
          Dashboard
        </span>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-100">
            <UserIcon className="h-5 w-5" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold text-neutral-900">
              {CURRENT_USER.name}
            </span>
            <span className="block text-xs text-neutral-500">
              {CURRENT_USER.title}
            </span>
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-8">
        {/* Cột trái — menu người dùng */}
        <nav
          aria-label="Menu người dùng"
          className="lg:w-[248px] lg:shrink-0">
          
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {MENU.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;
              return (
                <li key={item.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => goTo(item.key)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive ?
                    'bg-white text-orange-600 shadow-sm ring-1 ring-orange-100' :
                    'text-neutral-600 hover:bg-white hover:text-neutral-900'}`
                    }>
                    
                    <Icon
                      className={`h-4 w-4 ${isActive ? 'text-orange-500' : 'text-neutral-400'}`} />
                    
                    {item.label}
                  </button>
                </li>);

            })}
          </ul>
        </nav>

        {/* Cột phải — nội dung của mục được chọn */}
        <main className="min-w-0 flex-1">
          {active === 'tong-quan' &&
          <OverviewSection
            projectCount={projects.length}
            investorCount={investors.length}
            myInvestorCount={
            investors.filter((item) => item.createdBy === CURRENT_USER.id).length
            }
            onGoTo={goTo} />

          }
          {active === 'du-an' &&
          <ProjectsSection projects={projects} onChange={setProjects} />
          }
          {active === 'chu-dau-tu' &&
          <InvestorsSection investors={investors} onChange={setInvestors} />
          }
        </main>
      </div>
    </div>);

}

interface OverviewSectionProps {
  projectCount: number;
  investorCount: number;
  myInvestorCount: number;
  onGoTo: (key: MenuKey) => void;
}

/** Bản phác thảo — số liệu lấy từ dữ liệu mẫu, chưa nối API. */
function OverviewSection({
  projectCount,
  investorCount,
  myInvestorCount,
  onGoTo
}: OverviewSectionProps) {
  const cards = useMemo(
    () => [
    { label: 'Dự án do tôi khởi tạo', value: projectCount, key: 'du-an' as const },
    { label: 'Chủ đầu tư dùng chung', value: investorCount, key: 'chu-dau-tu' as const },
    { label: 'Chủ đầu tư do tôi tạo', value: myInvestorCount, key: 'chu-dau-tu' as const }],

    [projectCount, investorCount, myInvestorCount]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">
        Xin chào, {CURRENT_USER.name}
      </h1>
      <p className="mt-1 text-sm text-neutral-600">
        Nơi theo dõi dự án bạn phụ trách và danh mục chủ đầu tư dùng chung.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) =>
        <button
          key={card.label}
          type="button"
          onClick={() => onGoTo(card.key)}
          className="rounded-xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:border-orange-200 hover:bg-orange-50/40">
          
            <p className="text-3xl font-extrabold text-neutral-900">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-neutral-600">{card.label}</p>
          </button>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-base font-bold text-neutral-900">Bắt đầu nhanh</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/khoi-tao-du-an"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
            
            <PlusIcon className="h-4 w-4" />
            Tạo dự án
          </Link>
          <button
            type="button"
            onClick={() => onGoTo('chu-dau-tu')}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
            
            <Building2Icon className="h-4 w-4" />
            Thêm chủ đầu tư
          </button>
        </div>
      </div>
    </div>);

}
