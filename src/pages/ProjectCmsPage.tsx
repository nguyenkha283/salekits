import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ExternalLinkIcon,
  EyeIcon,
  FolderIcon,
  ImagesIcon,
  LockIcon,
  RefreshCwIcon,
  Settings2Icon,
  XIcon } from
'lucide-react';
import { Role } from '../detail/components/Header';
import { CANVAS_TABS, ProjectCanvas, canEditTab } from '../detail/ProjectCanvas';
import { buildSyncedMedia, countMedia, type SyncedContent } from '../detail/syncedMedia';
import {
  ProjectConfigurationDialog,
  createProjectConfiguration } from
'../components/ProjectConfigurationDialog';
import type { CmsRole } from '../types/cms';
import type { ProjectConfiguration, ProjectDraft } from '../types/project';

const ROLES: Role[] = [
'APM',
'Trợ lý dự án',
'Hành chính dự án',
'Quản lý giao dịch',
'Marketing',
'Trưởng line'];


/** ProjectConfigurationDialog dùng bộ vai trò 4 giá trị cũ — quy đổi sang. */
function toCmsRole(role: Role): CmsRole {
  if (role === 'Trưởng line') return 'Trưởng line';
  if (role === 'Quản lý giao dịch') return 'Quản lý bán hàng';
  if (role === 'Marketing') return 'Marketing';
  return 'APM';
}

interface SyncedProject {
  project_name?: string;
  drive_folder_url?: string;
  updated_at?: string;
  content?: SyncedContent;
}

export function ProjectCmsPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [role, setRole] = useState<Role>('APM');
  const [activeTab, setActiveTab] = useState('tong-quan');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [synced, setSynced] = useState<SyncedProject | null>(null);
  const [isResyncing, setIsResyncing] = useState(false);
  const [notice, setNotice] = useState('');

  const project: ProjectDraft = {
    hierarchy: '',
    name: synced?.project_name ?? 'IMPERIA SKY PARK',
    propertyType: '',
    province: '',
    district: '',
    status: ''
  };
  const [configuration, setConfiguration] = useState<ProjectConfiguration>(() =>
  createProjectConfiguration(project)
  );

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
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const syncedMedia = useMemo(
    () => buildSyncedMedia(synced?.content),
    [synced]
  );
  const totalMedia = countMedia(syncedMedia);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }

  async function handleResync() {
    const driveFolderUrl = synced?.drive_folder_url;
    if (!driveFolderUrl || isResyncing) {
      showNotice('Dự án chưa gắn thư mục Drive — mở từ màn Khởi tạo dự án.');
      return;
    }
    setIsResyncing(true);
    try {
      const response = await fetch('/api/sync-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveFolderUrl, projectName: project.name })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Đồng bộ lại thất bại.');
      setSynced((current) => ({
        ...current,
        content: data.content,
        updated_at: new Date().toISOString()
      }));
      const count = countMedia(buildSyncedMedia(data.content));
      showNotice(`Đồng bộ xong — ${count} ảnh và tài liệu đã nạp vào các tab`);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Đồng bộ lại thất bại.');
    } finally {
      setIsResyncing(false);
    }
  }

  const editable = canEditTab(role, activeTab);
  const publicHref = `/du-an${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ''}`;

  return (
    <div className="flex h-full min-h-screen w-full flex-col bg-[#f3ece1]">
      {/* ── Thanh trên ─────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#e5d8c4] bg-white px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-[5px] bg-[#4a3728]">
            <span className="h-3 w-3 rotate-45 border-2 border-white" />
          </span>
          <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-[#3b2c1d]">
            CENH<span className="text-[#f5921f]">O</span>MES
            <span className="align-super text-[9px] font-bold">.VN</span>
          </span>
        </Link>
        <span className="h-6 w-px bg-[#e5d8c4]" aria-hidden="true" />
        <span className="hidden truncate text-sm font-semibold text-stone-700 sm:block">
          {project.name}
        </span>
        <span className="hidden rounded bg-[#fdf3e2] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#8a6a3f] sm:block">
          Đang biên tập
        </span>
        {!editable &&
        <span className="hidden items-center gap-1 rounded bg-[#efe9e1] px-2 py-0.5 text-[11px] font-semibold text-stone-500 md:inline-flex">
            <LockIcon className="h-3 w-3" />
            {role} không sửa được tab này
          </span>
        }

        <div className="ml-auto flex items-center gap-2">
          <label className="sr-only" htmlFor="cms-role">Vai trò</label>
          <select
            id="cms-role"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="h-8 rounded-md border border-[#e0d2bd] bg-white px-2.5 text-xs font-semibold text-stone-800 outline-none focus:border-[#f5921f] sm:text-sm">

            {ROLES.map((item) =>
            <option key={item} value={item}>{item}</option>
            )}
          </select>

          <button
            type="button"
            onClick={handleResync}
            disabled={isResyncing}
            className="hidden h-8 items-center gap-1.5 rounded-md border border-[#e0d2bd] px-3 text-xs font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef] disabled:opacity-60 sm:flex">

            <RefreshCwIcon className={`h-4 w-4 ${isResyncing ? 'animate-spin' : ''}`} />
            {isResyncing ? 'Đang đồng bộ…' : 'Đồng bộ lại'}
          </button>

          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 place-items-center rounded-md border border-[#e0d2bd] text-stone-600 transition-colors hover:bg-[#faf6ef]"
            title="Mở trang công khai">

            <EyeIcon className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setConfigOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-md border border-[#e0d2bd] text-stone-600 transition-colors hover:bg-[#faf6ef]"
            title="Cấu hình dự án">

            <Settings2Icon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => showNotice('Đã gửi duyệt tới Trưởng line')}
            className="h-8 rounded-md bg-[#f5921f] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#db7214] sm:text-sm">

            Gửi duyệt
          </button>
        </div>
      </header>

      {/* ── Canvas toàn chiều rộng: ĐÚNG template trang công khai ── */}
      <main className="min-w-0 flex-1 overflow-y-auto bg-[#f3ece1] p-3 sm:p-5">
        <div
          className={`overflow-hidden rounded-xl bg-[#faf6ef] shadow-sm ring-1 ${
          editable ? 'ring-[#f0d9b8]' : 'ring-[#e5d8c4]'}`
          }>

          <ProjectCanvas
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            role={role}
            projectName={project.name}
            overviewHtml={synced?.content?.overviewContent ?? ''}
            locationHtml={synced?.content?.locationContent ?? ''}
            syncedMedia={syncedMedia}
            chrome={false} />

        </div>
      </main>

      {/* ── Nút nổi góc dưới phải ─────────────────────────────── */}
      <button
        type="button"
        onClick={() => setDrawerOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-40 grid place-items-center rounded-full bg-[#4a3728] text-white shadow-lg transition-all hover:bg-[#33251a] hover:shadow-xl"
        style={{ height: 52, width: 52 }}
        aria-label="Nội dung đồng bộ từ Google Drive"
        title="Nội dung đồng bộ từ Google Drive">

        {drawerOpen ? <XIcon className="h-5 w-5" /> : <ImagesIcon className="h-5 w-5" />}
        {!drawerOpen && totalMedia > 0 &&
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#f5921f] px-1 font-mono text-[10px] font-bold text-white ring-2 ring-[#f3ece1]">
            {totalMedia}
          </span>
        }
      </button>

      {/* ── Ngăn kéo: Nội dung đồng bộ từ Google Drive ────────── */}
      {drawerOpen &&
      <aside className="fixed bottom-[86px] right-5 z-40 flex max-h-[72vh] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="flex items-start gap-3 border-b border-[#eee4d5] px-4 py-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[#3b2c1d]">
                Nội dung đồng bộ từ Google Drive
              </h2>
              <p className="mt-0.5 text-[11px] text-stone-500">
                {totalMedia > 0 ?
              <>{totalMedia} ảnh và tài liệu trong {Object.keys(syncedMedia).length} tab</> :
              'Chưa có nội dung nào được đồng bộ'}
                {synced?.updated_at &&
              <> · {new Date(synced.updated_at).toLocaleString('vi-VN')}</>
              }
              </p>
            </div>
            <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
            aria-label="Đóng">

              <XIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {CANVAS_TABS.map((tab) => {
            const groups = syncedMedia[tab.id] ?? [];
            const count = groups.reduce((sum, group) => sum + group.items.length, 0);
            const isActive = tab.id === activeTab;

            return (
              <div key={tab.id} className="mb-0.5">
                  <button
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setDrawerOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  isActive ? 'bg-[#fdf3e2]' : 'hover:bg-[#faf6ef]'}`
                  }>

                    <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    count > 0 ? 'bg-[#0e9f6e]' : 'bg-stone-300'}`
                    } />

                    <span
                    className={`min-w-0 flex-1 truncate text-[13px] ${
                    isActive ? 'font-bold text-[#8a5a12]' : 'font-medium text-stone-700'}`
                    }>

                      {tab.label}
                    </span>
                    {tab.source === 'import' ?
                  <span className="shrink-0 rounded bg-[#e6edfb] px-1.5 py-px text-[9px] font-bold text-[#2a55b8]">
                        IMPORT
                      </span> :
                  count > 0 ?
                  <span className="shrink-0 font-mono text-[11px] font-bold text-stone-500">
                        {count}
                      </span> :
                  <span className="shrink-0 text-[10px] text-stone-400">—</span>
                  }
                    <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-stone-300" />
                  </button>

                  {isActive && groups.length > 0 &&
                <ul className="mb-1 ml-6 space-y-1 border-l border-[#eee4d5] pl-3 pt-1">
                      {groups.map((group) =>
                  <li key={group.id} className="flex items-center gap-1.5 text-[11px] text-stone-500">
                          <FolderIcon className="h-3 w-3 shrink-0 text-[#b08e5c]" />
                          <span className="min-w-0 flex-1 truncate font-mono">
                            {group.folder ?? group.label}
                          </span>
                          <span className="shrink-0 font-mono font-bold text-stone-600">
                            {group.items.length}
                          </span>
                        </li>
                  )}
                    </ul>
                }
                </div>);

          })}
          </div>

          <div className="space-y-2 border-t border-[#eee4d5] px-4 py-3">
            <p className="flex gap-2 text-[11px] leading-relaxed text-stone-500">
              <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#c97a0a]" />
              Đồng bộ sẽ <b>ghi đè</b> toàn bộ hình ảnh và tài liệu. Nội dung nhập
              tay trên CMS không bị ảnh hưởng.
            </p>
            {synced?.drive_folder_url &&
          <a
            href={synced.drive_folder_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8a6a3f] hover:underline">

                <ExternalLinkIcon className="h-3 w-3" />
                Mở thư mục Drive của dự án
              </a>
          }
            <button
            type="button"
            onClick={handleResync}
            disabled={isResyncing}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#4a3728] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#33251a] disabled:cursor-not-allowed disabled:bg-stone-300">

              <RefreshCwIcon className={`h-3.5 w-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
              {isResyncing ? 'Đang đồng bộ…' : 'Đồng bộ lại từ Drive'}
            </button>
          </div>
        </aside>
      }

      {notice &&
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-md bg-[#3b2c1d] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <CheckCircle2Icon className="h-4 w-4 shrink-0 text-[#6ee7b7]" />
          {notice}
        </div>
      }

      {configOpen &&
      <ProjectConfigurationDialog
        configuration={configuration}
        project={project}
        role={toCmsRole(role)}
        onChange={setConfiguration}
        onSave={() => {
          setConfigOpen(false);
          showNotice('Đã lưu cấu hình trong phiên làm việc');
        }}
        onClose={() => setConfigOpen(false)} />

      }
    </div>);

}
