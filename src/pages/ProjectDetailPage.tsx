import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PencilIcon } from 'lucide-react';
import { Header, Role } from '../detail/components/Header';
import { Footer } from '../detail/components/Footer';
import { ProjectCanvas } from '../detail/ProjectCanvas';
import { buildSyncedMedia, type SyncedContent } from '../detail/syncedMedia';
import type { InventorySource } from '../detail/components/InventorySetup';
import type { ProjectLayout } from '../detail/parseWorkbook';

const DEMO_NAME = 'IMPERIA SKY PARK';

interface SyncedProject {
  project_name?: string;
  updated_at?: string;
  content?: SyncedContent;
  configuration?: {projectType?: string;};
}

export function ProjectDetailPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [role, setRole] = useState<Role>('Quản lý giao dịch');
  const [activeTab, setActiveTab] = useState('tong-quan');
  const [synced, setSynced] = useState<SyncedProject | null>(null);
  /**
   * Loại hình do khai báo ở màn Khởi tạo quyết định template Quỹ căn, không suy
   * từ bảng hàng. Ưu tiên loại hình đã lưu trong cấu hình dự án; query string
   * chỉ là dự phòng cho lần mở từ trang trước khi dữ liệu kịp tải.
   */
  const projectLayout: ProjectLayout =
  synced?.configuration?.projectType === 'Thấp tầng' ?
  'thap-tang' :
  synced?.configuration?.projectType === 'Cao tầng' ?
  'cao-tang' :
  searchParams.get('loaiHinh') === 'thap-tang' ?
  'thap-tang' :
  'cao-tang';
  /** Bảng hàng vừa nhập trong CMS, dùng cho trang xem trước cùng phiên. */
  const [inventorySource] = useState<InventorySource | undefined>(() => {
    try {
      const raw = window.sessionStorage.getItem('cms:inventory');
      return raw ? (JSON.parse(raw) as InventorySource) : undefined;
    } catch {
      return undefined;
    }
  });
  const [isLoading, setIsLoading] = useState(Boolean(projectId));

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
        // Prototype: lỗi tải thì rơi về dữ liệu mẫu, không chặn màn hình.
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
  const syncedMedia = useMemo(() => buildSyncedMedia(synced?.content), [synced]);

  return (
    <div className="flex min-h-full w-full flex-col bg-[#faf6ef]">
      <Header role={role} onRoleChange={setRole} />

      {projectId &&
      <div className="border-b border-[#f0d9b8] bg-[#fdf3e2]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5 text-xs sm:px-6 lg:px-8">
            <span className="rounded bg-[#f5921f] px-2 py-0.5 font-bold uppercase tracking-wide text-white">
              Xem trước
            </span>
            <span className="text-[#8a6a3f]">
              {isLoading ?
            'Đang nạp nội dung đã đồng bộ từ Drive…' :
            <>
                  Nội dung đồng bộ từ Drive
                  {synced?.updated_at &&
              <> · cập nhật {new Date(synced.updated_at).toLocaleString('vi-VN')}</>
              }
                </>
            }
            </span>
            <Link
            to={`/hoan-tat?projectId=${encodeURIComponent(projectId)}&loaiHinh=${projectLayout}`}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-[#e3c79f] bg-white px-3 py-1.5 font-semibold text-[#8a6a3f] transition-colors hover:bg-[#fdf8ee]">

              <PencilIcon className="h-3.5 w-3.5" />
              Quay lại CMS
            </Link>
          </div>
        </div>
      }

      <main className="flex-1">
        <ProjectCanvas
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          role={role}
          projectName={projectName}
          overviewHtml={synced?.content?.overviewContent ?? ''}
          locationHtml={synced?.content?.locationContent ?? ''}
          syncedMedia={syncedMedia}
          inventorySource={inventorySource}
          projectLayout={projectLayout} />

      </main>

      <Footer />
    </div>);

}
