import React from 'react';
import { ChevronRightIcon, Share2Icon } from 'lucide-react';
import { Role } from './components/Header';
import { ProjectTabs } from './components/ProjectTabs';
import { ProjectContent } from './components/ProjectContent';
import { OverviewContent } from './components/OverviewContent';
import { InventoryTable } from './components/InventoryTable';
import { FundInventory } from './components/FundInventory';
import { ProgressContent } from './components/ProgressContent';
import { PolicyContent } from './components/PolicyContent';
import { DocumentsContent } from './components/DocumentsContent';
import { TrainingContent } from './components/TrainingContent';
import { Panorama360Content } from './components/Panorama360Content';
import { NewsContent } from './components/NewsContent';
import { BuildingsContent } from './components/BuildingsContent';
import { FloorPlanContent } from './components/FloorPlanContent';

/**
 * Nguồn dữ liệu của từng tab theo SRS:
 *  drive  — đồng bộ từ Google Drive
 *  import — nạp từ file bảng hàng
 *  manual — nhập tay trên CMS
 */
export type TabSource = 'drive' | 'import' | 'manual';

export interface CanvasTab {
  id: string;
  label: string;
  source: TabSource;
  /** Thư mục Drive tương ứng, dùng cho bảng điều khiển bên phải của CMS. */
  folder?: string;
}

export const CANVAS_TABS: CanvasTab[] = [
{ id: 'tong-quan', label: 'Tổng quan', source: 'manual', folder: '01. Tổng quan' },
{ id: 'dao-tao', label: 'Đào tạo', source: 'drive', folder: '02. Đào tạo' },
{ id: 'mat-bang', label: 'Mặt bằng', source: 'manual', folder: '03. Mặt bằng' },
{ id: 'toa-nha', label: 'Sản phẩm', source: 'manual' },
{ id: 'bang-hang', label: 'Bảng hàng', source: 'import' },
{ id: 'quy-can', label: 'Quỹ căn', source: 'import' },
{ id: 'anh-360', label: 'Ảnh 360', source: 'drive', folder: '04. Ảnh 360' },
{ id: 'chinh-sach', label: 'Chính sách bán hàng', source: 'drive', folder: '05. Chính sách bán hàng' },
{ id: 'tien-do', label: 'Tiến độ', source: 'drive', folder: '06. Tiến độ' },
{ id: 'tai-lieu', label: 'Tài liệu', source: 'drive', folder: '07. Tài liệu' },
{ id: 'tin-tuc', label: 'Tin tức', source: 'manual' }];


/** Quyền biên tập theo ma trận phân quyền mục 2.5 của SRS. */
export function canEditTab(role: Role, tabId: string): boolean {
  if (role === 'Trưởng line') return false;
  if (role === 'Quản lý giao dịch')
  return ['bang-hang', 'quy-can', 'mat-bang'].includes(tabId);
  if (role === 'Marketing') return tabId === 'tin-tuc';
  return !['bang-hang', 'quy-can', 'tin-tuc'].includes(tabId);
}

interface ProjectCanvasProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  role: Role;
  projectName: string;
  /** HTML đã đồng bộ từ Drive, hiển thị ở đầu tab Tổng quan. */
  overviewHtml?: string;
  /** Ẩn breadcrumb và nút chia sẻ khi hiển thị bên trong CMS. */
  chrome?: boolean;
}

/**
 * Thân trang chi tiết dự án. Dùng CHUNG cho trang công khai (/du-an) và
 * vùng canvas của CMS (/hoan-tat) — hai nơi luôn hiển thị giống hệt nhau.
 */
export function ProjectCanvas({
  activeTab,
  onChangeTab,
  role,
  projectName,
  overviewHtml = '',
  chrome = true
}: ProjectCanvasProps) {
  const isOverview = activeTab === 'tong-quan';

  return (
    <>
      {!isOverview &&
      <>
          {chrome &&
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6 lg:px-8">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-stone-500">
                <span className="hover:text-[#f5921f]">Trang chủ</span>
                <ChevronRightIcon className="h-4 w-4 text-stone-400" />
                <span className="text-stone-400">Chi tiết dự án</span>
              </nav>
              <button className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-[#faf6ef]">
                <Share2Icon className="h-4 w-4" />
                Chia sẻ
              </button>
            </div>
        }

          <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${chrome ? 'pt-4' : 'pt-6'}`}>
            <div className="rounded-xl bg-gradient-to-r from-[#f8efe1] to-[#fdf9f2] p-6 sm:p-8">
              <h1 className="text-2xl font-bold uppercase tracking-tight text-[#3b2c1d] sm:text-3xl">
                {projectName}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-stone-600">
                Theo dõi thông tin chi tiết và bảng giá, quỹ căn, mặt bằng, tiến
                độ và chính sách bán hàng dự án {projectName}.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <ProjectTabs active={activeTab} onChange={onChangeTab} />
          </div>
        </>
      }

      <div
        className={
        isOverview || activeTab === 'mat-bang' ?
        'w-full' :
        activeTab === 'bang-hang' || activeTab === 'quy-can' ?
        'w-full px-4 py-8 sm:px-6 lg:px-8' :
        'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'
        }>

        {isOverview &&
        <>
            {overviewHtml &&
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-[#e9e1d5] bg-white p-6 sm:p-8">
                  <p className="mb-4 inline-flex items-center gap-2 rounded bg-[#fdf3e2] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#8a6a3f]">
                    Nội dung đồng bộ từ Google Drive
                  </p>
                  <div
                className="prose-cen text-[15px] leading-7 text-stone-700"
                dangerouslySetInnerHTML={{ __html: overviewHtml }} />

                </div>
              </div>
          }
            <OverviewContent
            tabs={<ProjectTabs active={activeTab} onChange={onChangeTab} />} />

          </>
        }
        {activeTab === 'mat-bang' && <FloorPlanContent />}
        {activeTab === 'toa-nha' && <BuildingsContent />}
        {activeTab === 'bang-hang' && <InventoryTable role={role} />}
        {activeTab === 'quy-can' && <FundInventory />}
        {activeTab === 'tien-do' && <ProgressContent />}
        {activeTab === 'chinh-sach' && <PolicyContent />}
        {activeTab === 'tai-lieu' && <DocumentsContent />}
        {activeTab === 'dao-tao' && <TrainingContent />}
        {activeTab === 'anh-360' && <Panorama360Content />}
        {activeTab === 'tin-tuc' && <NewsContent />}
        {!CANVAS_TABS.some((tab) => tab.id === activeTab) && <ProjectContent />}
      </div>
    </>);

}
