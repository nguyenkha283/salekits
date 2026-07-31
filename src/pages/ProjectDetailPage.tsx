import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRightIcon, PencilIcon, Share2Icon } from 'lucide-react';
import { Header, Role } from '../detail/components/Header';
import { ProjectTabs } from '../detail/components/ProjectTabs';
import { ProjectContent } from '../detail/components/ProjectContent';
import { OverviewContent } from '../detail/components/OverviewContent';
import { InventoryTable } from '../detail/components/InventoryTable';
import { FundInventory } from '../detail/components/FundInventory';
import { ProgressContent } from '../detail/components/ProgressContent';
import { PolicyContent } from '../detail/components/PolicyContent';
import { DocumentsContent } from '../detail/components/DocumentsContent';
import { TrainingContent } from '../detail/components/TrainingContent';
import { Panorama360Content } from '../detail/components/Panorama360Content';
import { NewsContent } from '../detail/components/NewsContent';
import { BuildingsContent } from '../detail/components/BuildingsContent';
import { FloorPlanContent } from '../detail/components/FloorPlanContent';
import { Footer } from '../detail/components/Footer';

/** Các tab có nội dung riêng; phần còn lại dùng ProjectContent mặc định. */
const SPECIAL_TABS = [
'tong-quan', 'bang-hang', 'quy-can', 'tien-do', 'chinh-sach',
'tai-lieu', 'dao-tao', 'anh-360', 'tin-tuc', 'toa-nha', 'mat-bang'];

const DEMO_NAME = 'IMPERIA SKY PARK';
const DEMO_DESCRIPTION =
'Theo dõi thông tin chi tiết và bảng giá, quỹ căn, mặt bằng, tiến độ và chính sách bán hàng dự án IMPERIA SKY PARK.';

interface SyncedProject {
  project_name?: string;
  drive_folder_url?: string;
  updated_at?: string;
  content?: {
    overviewContent?: string;
    salesSheetFolderName?: string;
  };
}

export function ProjectDetailPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [role, setRole] = useState<Role>('Quản lý giao dịch');
  const [activeTab, setActiveTab] = useState('tong-quan');
  const [synced, setSynced] = useState<SyncedProject | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(projectId));

  // Khi mở từ CMS (có projectId), nạp dữ liệu đã đồng bộ từ Drive để
  // chứng minh đường truyền Drive → CMS → trang công khai chạy thật.
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/get-project?id=${encodeURIComponent(projectId as string)}`
        );
        const data = await response.json();
        if (!cancelled && response.ok) setSynced(data);
      } catch {
        // Prototype: lỗi tải thì rơi về dữ liệu demo, không chặn màn hình.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const projectName = synced?.project_name?.trim() || DEMO_NAME;
  const overviewHtml = synced?.content?.overviewContent ?? '';
  const isFromCms = Boolean(projectId);

  return (
    <div className="flex min-h-full w-full flex-col bg-[#faf6ef]">
      <Header role={role} onRoleChange={setRole} />

      {/* Thanh ngữ cảnh chỉ hiện khi mở từ CMS — không thuộc trang công khai thật */}
      {isFromCms &&
      <div className="border-b border-[#f0d9b8] bg-[#fdf3e2]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5 text-xs sm:px-6 lg:px-8">
            <span className="rounded bg-[#f5921f] px-2 py-0.5 font-bold uppercase tracking-wide text-white">
              Xem trước
            </span>
            <span className="text-[#8a6a3f]">
              {isLoading ?
            'Đang nạp nội dung đã đồng bộ từ Drive…' :
            <>Nội dung đồng bộ từ Drive
                  {synced?.updated_at &&
              <> · cập nhật {new Date(synced.updated_at).toLocaleString('vi-VN')}</>
              }
                </>
            }
            </span>
            <Link
            to={`/hoan-tat?projectId=${encodeURIComponent(projectId as string)}`}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-[#e3c79f] bg-white px-3 py-1.5 font-semibold text-[#8a6a3f] transition-colors hover:bg-[#fdf8ee]">

              <PencilIcon className="h-3.5 w-3.5" />
              Quay lại CMS
            </Link>
          </div>
        </div>
      }

      <main className="flex-1">
        {activeTab !== 'tong-quan' &&
        <>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6 lg:px-8">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-stone-500">
                <Link to="/" className="hover:text-[#f5921f]">Trang chủ</Link>
                <ChevronRightIcon className="h-4 w-4 text-stone-400" />
                <span className="text-stone-400">Chi tiết dự án</span>
              </nav>
              <button className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-[#faf6ef]">
                <Share2Icon className="h-4 w-4" />
                Chia sẻ
              </button>
            </div>

            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
              <div className="rounded-xl bg-gradient-to-r from-[#f8efe1] to-[#fdf9f2] p-6 sm:p-8">
                <h1 className="text-2xl font-bold uppercase tracking-tight text-[#3b2c1d] sm:text-3xl">
                  {projectName}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-stone-600">
                  {isFromCms ?
                `Theo dõi thông tin chi tiết và bảng giá, quỹ căn, mặt bằng, tiến độ và chính sách bán hàng dự án ${projectName}.` :
                DEMO_DESCRIPTION}
                </p>
              </div>
            </div>
          </>
        }

        {activeTab !== 'tong-quan' &&
        <div className="mt-6">
            <ProjectTabs active={activeTab} onChange={setActiveTab} />
          </div>
        }

        <div
          className={
          activeTab === 'tong-quan' || activeTab === 'mat-bang' ?
          'w-full' :
          activeTab === 'bang-hang' || activeTab === 'quy-can' ?
          'w-full px-4 py-8 sm:px-6 lg:px-8' :
          'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'
          }>

          {activeTab === 'tong-quan' &&
          <>
              {/* Nội dung văn bản đồng bộ từ Drive chèn ngay trên khối Tổng quan
                  thiết kế sẵn, để buổi demo thấy rõ dữ liệu thật đi tới đâu. */}
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
              <OverviewContent tabs={<ProjectTabs active={activeTab} onChange={setActiveTab} />} />
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
          {!SPECIAL_TABS.includes(activeTab) && <ProjectContent />}
        </div>
      </main>

      <Footer />
    </div>);

}
