import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  EyeIcon,
  FolderIcon,
  InfoIcon,
  LockIcon,
  PanelRightIcon,
  RefreshCwIcon,
  Settings2Icon,
  UploadIcon } from
'lucide-react';
import { Role } from '../detail/components/Header';
import {
  CANVAS_TABS,
  ProjectCanvas,
  canEditTab,
  type TabSource } from
'../detail/ProjectCanvas';
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


const SOURCE_LABEL: Record<TabSource, string> = {
  drive: 'DRIVE',
  import: 'IMPORT',
  manual: 'NHẬP TAY'
};

const SOURCE_STYLE: Record<TabSource, string> = {
  drive: 'bg-[#e6f0e8] text-[#2c6e3f]',
  import: 'bg-[#e6edfb] text-[#2a55b8]',
  manual: 'bg-[#efe9e1] text-[#8a6a3f]'
};

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
  content?: {overviewContent?: string;};
}

export function ProjectCmsPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [role, setRole] = useState<Role>('APM');
  const [activeTab, setActiveTab] = useState('tong-quan');
  const [inspectorOpen, setInspectorOpen] = useState(true);
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

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
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
        body: JSON.stringify({
          driveFolderUrl,
          projectName: project.name
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Đồng bộ lại thất bại.');
      setSynced((current) => ({ ...current, content: data.content }));
      showNotice('Đồng bộ lại thành công');
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : 'Đồng bộ lại thất bại.'
      );
    } finally {
      setIsResyncing(false);
    }
  }

  const currentTab =
  CANVAS_TABS.find((tab) => tab.id === activeTab) ?? CANVAS_TABS[0];
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
            onClick={() => setInspectorOpen((value) => !value)}
            className={`grid h-8 w-8 place-items-center rounded-md border transition-colors ${
            inspectorOpen ?
            'border-[#f5921f] bg-[#fdf3e2] text-[#b96f12]' :
            'border-[#e0d2bd] text-stone-600 hover:bg-[#faf6ef]'}`
            }
            title="Bảng nguồn dữ liệu">

            <PanelRightIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => showNotice('Đã gửi duyệt tới Trưởng line')}
            className="h-8 rounded-md bg-[#f5921f] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#db7214] sm:text-sm">

            Gửi duyệt
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Rail trái: 11 tab theo SRS ────────────────────────── */}
        <nav className="hidden w-[212px] shrink-0 overflow-y-auto border-r border-[#e5d8c4] bg-white p-2 lg:block">
          <p className="px-2 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Nội dung dự án
          </p>
          {CANVAS_TABS.map((tab, index) => {
            const isActive = tab.id === activeTab;
            const locked = !canEditTab(role, tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${
                isActive ?
                'bg-[#fdf3e2] font-semibold text-[#8a5a12]' :
                'text-stone-600 hover:bg-[#faf6ef]'}`
                }>

                <span className="w-4 shrink-0 text-[10px] font-mono text-stone-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                {locked ?
                <LockIcon className="h-3 w-3 shrink-0 text-stone-300" /> :
                <span className={`shrink-0 rounded px-1 py-px text-[8px] font-bold ${SOURCE_STYLE[tab.source]}`}>
                    {SOURCE_LABEL[tab.source]}
                  </span>
                }
              </button>);

          })}
        </nav>

        {/* ── Canvas: ĐÚNG template của trang xem trước ─────────── */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-[#f3ece1] p-3 sm:p-5">
          <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded bg-white px-2 py-1 font-semibold text-stone-500 shadow-sm">
              <EyeIcon className="h-3.5 w-3.5" />
              Hiển thị đúng như trang công khai
            </span>
            {!editable &&
            <span className="inline-flex items-center gap-1.5 rounded bg-[#efe9e1] px-2 py-1 font-semibold text-stone-500">
                <LockIcon className="h-3.5 w-3.5" />
                Vai trò {role} không sửa được tab này
              </span>
            }
          </div>

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
              chrome={false} />

          </div>
        </main>

        {/* ── Bảng nguồn dữ liệu bên phải ───────────────────────── */}
        {inspectorOpen &&
        <aside className="hidden w-[290px] shrink-0 overflow-y-auto border-l border-[#e5d8c4] bg-white p-4 xl:block">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Nguồn dữ liệu
            </h2>
            <p className="mt-1.5 text-base font-bold text-[#3b2c1d]">
              {currentTab.label}
            </p>
            <span className={`mt-2 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold ${SOURCE_STYLE[currentTab.source]}`}>
              {SOURCE_LABEL[currentTab.source]}
            </span>

            {currentTab.folder &&
          <div className="mt-3 flex items-start gap-2 rounded-md border border-[#eee4d5] bg-[#faf6ef] p-2.5">
                <FolderIcon className="mt-px h-4 w-4 shrink-0 text-[#b08e5c]" />
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-semibold text-stone-700">
                    {currentTab.folder}
                  </p>
                  <p className="mt-0.5 text-[11px] text-stone-500">
                    Nhận diện theo folder ID, đổi tên trên Drive không ảnh hưởng.
                  </p>
                </div>
              </div>
          }

            <div className="mt-4 space-y-2">
              {currentTab.source === 'drive' &&
            <button
              type="button"
              onClick={handleResync}
              disabled={!editable || isResyncing}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#4a3728] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#33251a] disabled:cursor-not-allowed disabled:bg-stone-300">

                  <RefreshCwIcon className={`h-3.5 w-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
                  Đồng bộ tab này
                </button>
            }
              {currentTab.source === 'import' &&
            <button
              type="button"
              onClick={() => showNotice('Luồng import 5 bước — xem prototype HTML kèm theo')}
              disabled={!editable}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#4a3728] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#33251a] disabled:cursor-not-allowed disabled:bg-stone-300">

                  <UploadIcon className="h-3.5 w-3.5" />
                  Import bảng hàng
                </button>
            }
              <a
              href={publicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[#e0d2bd] px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef]">

                <ExternalLinkIcon className="h-3.5 w-3.5" />
                Mở trang công khai
              </a>
            </div>

            <div className="mt-4 space-y-2 border-t border-[#eee4d5] pt-4 text-[12px] leading-relaxed">
              {currentTab.source === 'manual' &&
            <p className="flex gap-2 text-stone-600">
                  <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#2a55b8]" />
                  Nội dung nhập trực tiếp trên CMS. Đồng bộ Drive không ghi đè phần văn bản.
                </p>
            }
              {currentTab.source === 'drive' &&
            <p className="flex gap-2 text-stone-600">
                  <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#c97a0a]" />
                  Đồng bộ sẽ <b>ghi đè</b> toàn bộ hình ảnh và tài liệu của tab này.
                </p>
            }
              {currentTab.source === 'import' &&
            <p className="flex gap-2 text-stone-600">
                  <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#c97a0a]" />
                  Tình trạng căn chỉ đổi được bằng import lại file, không sửa tay từng căn.
                </p>
            }
              {synced?.updated_at &&
            <p className="flex gap-2 text-stone-500">
                  <CheckCircle2Icon className="mt-px h-3.5 w-3.5 shrink-0 text-[#0e9f6e]" />
                  Đồng bộ gần nhất {new Date(synced.updated_at).toLocaleString('vi-VN')}
                </p>
            }
            </div>

            <div className="mt-4 rounded-md border border-[#eee4d5] bg-[#faf6ef] p-2.5 text-[11px] leading-relaxed text-stone-500">
              <b className="text-stone-700">Prototype:</b> nội dung biên tập chưa
              được lưu xuống cơ sở dữ liệu — CMS chưa có endpoint ghi.
            </div>
          </aside>
        }
      </div>

      {notice &&
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-md bg-[#3b2c1d] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
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
