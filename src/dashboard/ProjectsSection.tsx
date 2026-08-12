import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangleIcon,
  Building2Icon,
  CalendarDaysIcon,
  EyeIcon,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon } from
'lucide-react';
import type { DashboardProject } from './dashboardData';
import { normalizeName } from './investorMatching';

interface ProjectsSectionProps {
  projects: DashboardProject[];
  onChange: (projects: DashboardProject[]) => void;
}

export function ProjectsSection({ projects, onChange }: ProjectsSectionProps) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [pendingDelete, setPendingDelete] = useState<DashboardProject | undefined>();

  const visible = useMemo(() => {
    const trimmed = normalizeName(keyword);
    if (!trimmed) return projects;
    return projects.filter(
      (project) =>
      normalizeName(project.name).includes(trimmed) ||
      normalizeName(project.code).includes(trimmed)
    );
  }, [projects, keyword]);

  function openPublicPage(project: DashboardProject) {
    navigate(`/du-an?projectId=${project.id}&loaiHinh=${project.layout}`);
  }

  function openCms(project: DashboardProject) {
    navigate(`/hoan-tat?projectId=${project.id}&loaiHinh=${project.layout}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">
            Dự án của tôi
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Quản lý các dự án do bạn khởi tạo
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/khoi-tao-du-an')}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600">
          
          <PlusIcon className="h-5 w-5" />
          Tạo dự án
        </button>
      </div>

      <div className="relative mt-6">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên dự án hoặc mã dự án"
          aria-label="Tìm dự án"
          className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100" />
        
        {keyword &&
        <button
          type="button"
          aria-label="Xóa từ khóa"
          onClick={() => setKeyword('')}
          className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
          
            <XIcon className="h-4 w-4" />
          </button>
        }
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="hidden grid-cols-[112px_minmax(200px,1fr)_minmax(200px,1fr)_150px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-neutral-500 lg:grid">
          <span>Ảnh dự án</span>
          <span>Tên dự án</span>
          <span>Sản phẩm trong dự án</span>
          <span className="text-right">Hành động</span>
        </div>

        {visible.length === 0 ?
        <div className="px-5 py-14 text-center">
            <p className="text-sm font-semibold text-neutral-900">
              Không có dự án nào khớp từ khóa
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Thử tìm bằng mã dự án, hoặc tạo dự án mới.
            </p>
          </div> :

        <ul className="divide-y divide-neutral-100">
            {visible.map((project) =>
          <li
            key={project.id}
            className="grid grid-cols-1 gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/70 lg:grid-cols-[112px_minmax(200px,1fr)_minmax(200px,1fr)_150px] lg:items-center">
            
                <img
              src={project.coverUrl}
              alt={`Ảnh đại diện ${project.name}`}
              className="h-[72px] w-full rounded-lg object-cover lg:w-[112px]" />
            

                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-neutral-900">
                    {project.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-neutral-500">
                    {project.code}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <Building2Icon className="h-3.5 w-3.5 text-neutral-400" />
                      {project.propertyType}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDaysIcon className="h-3.5 w-3.5 text-neutral-400" />
                      Tạo {project.createdAt}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-neutral-500">
                    <LayersIcon className="h-3.5 w-3.5 text-neutral-400" />
                    {project.children.length}{' '}
                    {project.children[0]?.kind === 'Phân khu' ?
                'phân khu' :
                'tòa nhà'}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {project.children.map((child) =>
                <li
                  key={child.id}
                  className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                  
                        {child.name}
                      </li>
                )}
                  </ul>
                </div>

                <div className="flex items-center gap-1.5 lg:justify-end">
                  <button
                type="button"
                onClick={() => openPublicPage(project)}
                title="Xem trang công khai"
                className="grid h-9 w-9 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900">
                
                    <EyeIcon className="h-4 w-4" />
                    <span className="sr-only">Xem {project.name}</span>
                  </button>
                  <button
                type="button"
                onClick={() => openCms(project)}
                title="Biên tập trong CMS"
                className="grid h-9 w-9 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
                
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">Sửa {project.name}</span>
                  </button>
                  <button
                type="button"
                onClick={() => setPendingDelete(project)}
                title="Xóa dự án"
                className="grid h-9 w-9 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                
                    <Trash2Icon className="h-4 w-4" />
                    <span className="sr-only">Xóa {project.name}</span>
                  </button>
                </div>
              </li>
          )}
          </ul>
        }
      </div>

      {pendingDelete &&
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/50 p-4"
        role="dialog"
        aria-modal="true">
        
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                <AlertTriangleIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  Xóa dự án?
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
                  <span className="font-semibold text-neutral-900">
                    {pendingDelete.name}
                  </span>{' '}
                  cùng {pendingDelete.children.length} sản phẩm con sẽ bị gỡ khỏi
                  hệ thống. Trang công khai của dự án ngừng hoạt động ngay. Nội
                  dung trên Google Drive không bị ảnh hưởng.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
              type="button"
              onClick={() => setPendingDelete(undefined)}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
              
                Hủy
              </button>
              <button
              type="button"
              onClick={() => {
                onChange(
                  projects.filter((project) => project.id !== pendingDelete.id)
                );
                setPendingDelete(undefined);
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
              
                Xóa dự án
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

}
