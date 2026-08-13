import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  AlertTriangleIcon,
  BoldIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  EyeIcon,
  FolderIcon,
  ImagesIcon,
  ItalicIcon,
  BellIcon,
  ListIcon,
  LockIcon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  Settings2Icon,
  XIcon } from
'lucide-react';
import { Role } from '../detail/components/Header';
import { CANVAS_TABS, ProjectCanvas, canEditTab } from '../detail/ProjectCanvas';
import type { FeaturedProduct } from '../detail/components/OverviewContent';
import type { InventorySource } from '../detail/components/InventorySetup';
import type { UpstreamChange } from '../detail/components/InventorySourceBar';
import type { GridModel } from '../detail/gridModel';
import type { ProjectLayout } from '../detail/parseWorkbook';
import { checkSheetStatus } from '../detail/parseWorkbook';
import { HIERARCHY_OPTIONS, SECTIONS, findSection } from '../detail/sectionRegistry';
import {
  IMG,
  buildSyncedMedia,
  countMedia,
  isImageItem,
  pickItems,
  sized,
  stripExt,
  type SyncedContent } from
'../detail/syncedMedia';
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
'Trưởng line',
'Ban lãnh đạo',
'User khác'];


interface Notification {
  id: string;
  unread: boolean;
  title: string;
  body: string;
  time: string;
  tone?: 'info' | 'warn' | 'danger';
}

/** Thông báo mẫu theo UC-21 của SRS. */
const SEED_NOTIFICATIONS: Notification[] = [
{
  id: 'n1', unread: true,
  title: 'Trưởng line yêu cầu chỉnh sửa',
  body: 'Ảnh tiến độ đợt 2 bị mờ, đề nghị thay ảnh gốc và bổ sung chính sách quý 3.',
  time: 'Hôm nay · 10:22'
},
{
  id: 'n2', unread: true,
  title: 'Đồng bộ Drive hoàn tất',
  body: '63 ảnh và tài liệu đã nạp vào 7 tab. 2 file chưa chia sẻ công khai.',
  time: 'Hôm nay · 09:47'
},
{
  id: 'n3', unread: true,
  title: 'Bảng hàng được cập nhật',
  body: 'Lê Minh Hoàng vừa nhập lại bảng hàng — 37 căn đổi tình trạng.',
  time: 'Hôm qua · 16:05'
},
{
  id: 'n4', unread: false,
  title: 'Dự án được thêm vào line 2',
  body: 'Trần Đức Thắng được gán làm người duyệt của dự án này.',
  time: '28/07 · 14:30'
}];


const DEFAULT_STATS = [
{ value: '150+', label: 'Căn hộ bàn giao' },
{ value: '100+', label: 'Tiện ích nội khu' },
{ value: '200+', label: 'Khách hàng hài lòng' }];


function toCmsRole(role: Role): CmsRole {
  // Ban lãnh đạo chỉ xem, ánh xạ về vai trò không có quyền sửa cấu hình.
  if (role === 'Trưởng line' || role === 'Ban lãnh đạo') return 'Trưởng line';
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

interface SectionEdits {
  overviewHtml?: string;
  locationHtml?: string;
  stats?: {value: string;label: string;}[];
  hierarchy?: string;
  projectName?: string;
  tagline?: string;
}

export function ProjectCmsPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const projectId = searchParams.get('projectId');
  /** Dự án tạo không kèm link Drive — vào CMS với nội dung trống. */
  const isBlankSource = searchParams.get('nguon') === 'trong';
  /** Thông tin đã khai ở màn Khởi tạo dự án, truyền qua location.state. */
  const draft = (location.state as {project?: ProjectDraft;} | null)?.project;
  /** Loại hình khai ở bước Khởi tạo dự án; mặc định cao tầng. */
  const projectLayout: ProjectLayout =
  searchParams.get('loaiHinh') === 'thap-tang' ? 'thap-tang' : 'cao-tang';

  const [role, setRole] = useState<Role>('APM');
  const [activeTab, setActiveTab] = useState('tong-quan');

  // Dự án thấp tầng không có tab Bảng hàng — chuyển sang Quỹ căn nếu đang ở đó.
  useEffect(() => {
    if (projectLayout === 'thap-tang' && activeTab === 'bang-hang') {
      setActiveTab('quy-can');
    }
  }, [projectLayout, activeTab]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  /** Prototype: dự án mới chưa có bảng hàng cho tới khi người dùng nhập. */
  const [inventorySource, setInventorySource] = useState<InventorySource | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [upstream, setUpstream] = useState<UpstreamChange | null>(null);
  /** Lưới đã soạn, sống độc lập với dữ liệu để đồng bộ lại không xóa mất. */
  const [grids, setGrids] = useState<Record<string, GridModel>>({});
  const [accessLost, setAccessLost] = useState(false);
  const [synced, setSynced] = useState<SyncedProject | null>(null);
  const [edits, setEdits] = useState<SectionEdits>({});
  /** Ảnh tải tay từ máy, đè lên ảnh Drive ở cùng vị trí (song song với đồng bộ). */
  const [imageOverrides, setImageOverrides] = useState<Record<string, string>>({});
  const [imageExtras, setImageExtras] = useState<Record<string, string[]>>({});
  /**
   * Sản phẩm nổi bật — soạn tay, không lấy từ Drive. Khởi tạo một ô trống để
   * người dùng thấy ngay khung cần điền thay vì một mục rỗng.
   */
  const [products, setProducts] = useState<FeaturedProduct[]>([
  { id: 'sp-1', image: '', title: '', description: '' }]
  );
  const [isResyncing, setIsResyncing] = useState(false);
  const [notice, setNotice] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [toolbarRect, setToolbarRect] = useState<DOMRect | null>(null);
  const focusedBlock = useRef<HTMLElement | null>(null);

  const project: ProjectDraft = draft ?
  { ...draft, name: synced?.project_name ?? draft.name } :
  {
    hierarchy: '',
    name: synced?.project_name ?? 'IMPERIA SKY PARK',
    code: '',
    aliases: [],
    slogan: '',
    propertyType: '',
    address: '',
    province: '',
    ward: '',
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

  const syncedMedia = useMemo(() => buildSyncedMedia(synced?.content), [synced]);
  const totalMedia = countMedia(syncedMedia);
  const editable = canEditTab(role, activeTab);
  const section = findSection(selectedSection);

  const overviewHtml = edits.overviewHtml ?? synced?.content?.overviewContent ?? '';
  const locationHtml = edits.locationHtml ?? synced?.content?.locationContent ?? '';
  const stats = edits.stats ?? DEFAULT_STATS;
  const hierarchy = edits.hierarchy ?? 'Dự án';
  const heroName = edits.projectName ?? project.name;
  // Slogan khai ở màn Khởi tạo dự án; sửa lại được ngay trên canvas.
  const tagline = edits.tagline ?? project.slogan ?? '';

  // Nhận thay đổi từ các khối chữ sửa trực tiếp trên trang.
  const handleInlineChange = useCallback((field: string, value: string) => {
    const stat = field.match(/^stat-(\d+)-(value|label)$/);
    if (stat) {
      const index = Number(stat[1]);
      const key = stat[2] as 'value' | 'label';
      setEdits((current) => {
        const base = current.stats ?? DEFAULT_STATS;
        return {
          ...current,
          stats: base.map((item, i) => i === index ? { ...item, [key]: value } : item)
        };
      });
      return;
    }
    setEdits((current) => ({ ...current, [field]: value }));
  }, []);

  // Ghim thanh công cụ ngay trên khối chữ đang nhập.
  const handleFocusBlock = useCallback((element: HTMLElement | null) => {
    focusedBlock.current = element;
    if (!element) {
      // Trễ một nhịp để cú bấm vào nút trên thanh công cụ không bị mất.
      window.setTimeout(() => {
        if (!focusedBlock.current) setToolbarRect(null);
      }, 180);
      return;
    }
    if (element.dataset.cmsInline !== 'rich') {
      setToolbarRect(null);
      return;
    }
    setToolbarRect(element.getBoundingClientRect());
  }, []);

  const notify = useCallback((entry: Omit<Notification, 'id' | 'unread'>) => {
    setNotifications((current) => [
    { ...entry, id: `n-${Date.now()}`, unread: true },
    ...current]
    );
  }, []);

  /**
   * Theo dõi bảng hàng phía chủ đầu tư.
   *
   * Chạy ở cấp trang chứ không ở tab Bảng hàng, để QLGD nhận được thông báo
   * kể cả khi đang làm việc ở tab khác. Chỉ đọc metadata nên rất nhẹ.
   */
  useEffect(() => {
    const source = inventorySource;
    if (!source || source.kind !== 'link' || !source.modifiedTime) return;

    let cancelled = false;
    let failures = 0;
    let notified = '';

    async function check() {
      const status = await checkSheetStatus(source!.label);
      if (cancelled) return;

      if (!status) {
        failures += 1;
        // Vài lần lỗi liên tiếp mới coi là mất quyền — tránh báo động giả
        // khi mạng chập chờn.
        if (failures >= 3 && !accessLost) {
          setAccessLost(true);
          notify({
            tone: 'danger',
            title: 'Mất quyền đọc bảng hàng chủ đầu tư',
            body: 'Hệ thống không còn đọc được file nguồn. Có thể chủ đầu tư đã đổi quyền chia sẻ hoặc xóa file.',
            time: new Date().toLocaleString('vi-VN')
          });
        }
        return;
      }

      failures = 0;
      setAccessLost(false);

      const changed =
      status.modifiedTime && status.modifiedTime !== source!.modifiedTime;

      if (changed) {
        setUpstream({ time: status.modifiedTime, by: status.modifiedBy });
        // Mỗi mốc thời gian chỉ báo một lần, không lặp mỗi chu kỳ.
        if (notified !== status.modifiedTime) {
          notified = status.modifiedTime;
          notify({
            tone: 'warn',
            title: 'Chủ đầu tư đã cập nhật bảng hàng',
            body:
            `File nguồn được sửa lúc ${new Date(status.modifiedTime).toLocaleString('vi-VN')}` +
            (status.modifiedBy ? ` bởi ${status.modifiedBy}` : '') +
            '. Mở tab Bảng hàng để xem thay đổi trước khi áp dụng.',
            time: new Date().toLocaleString('vi-VN')
          });
        }
      } else {
        setUpstream(null);
      }
    }

    check();
    const timer = window.setInterval(check, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventorySource, notify]);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }, []);

  // ── Chọn section bằng cách bấm thẳng lên canvas ───────────────
  function handleCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const node = target.closest('[data-cms-section]') as HTMLElement | null;
    if (!node) return;
    if (!editable) {
      showNotice(`Vai trò ${role} không có quyền sửa tab này`);
      return;
    }
    // Không chặn thao tác thật của người dùng trên các phần tử tương tác
    if (target.closest('a, button, input, select, textarea, iframe')) return;
    // Bấm vào khối chữ thì đặt con trỏ để gõ, không chuyển sang chọn section.
    if (target.closest('[contenteditable="true"]')) return;
    event.preventDefault();
    const id = node.dataset.cmsSection ?? null;
    setSelectedSection(id);
    setDrawerOpen(true);
  }

  // Đánh dấu section đang chọn trên DOM để CSS tô viền
  useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;
    root.querySelectorAll('[data-cms-selected]').forEach((node) => {
      node.removeAttribute('data-cms-selected');
    });
    if (!selectedSection) return;
    const node = root.querySelector(`[data-cms-section="${selectedSection}"]`);
    node?.setAttribute('data-cms-selected', 'true');
  }, [selectedSection, activeTab, synced, edits, drawerOpen]);

  // Đổi tab thì bỏ chọn section cũ
  useEffect(() => {
    setSelectedSection(null);
  }, [activeTab]);

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

  const publicHref = `/du-an?loaiHinh=${projectLayout}${
  projectId ? `&projectId=${encodeURIComponent(projectId)}` : ''}`;
  const sectionsInTab = SECTIONS.filter((item) => item.tab === activeTab);

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
        {editable ?
        <span className="hidden items-center gap-1 rounded bg-[#fdf3e2] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#8a6a3f] sm:inline-flex">
            <PencilIcon className="h-3 w-3" />
            Bấm vào section để sửa
          </span> :

        <span className="hidden items-center gap-1 rounded bg-[#efe9e1] px-2 py-0.5 text-[11px] font-semibold text-stone-500 sm:inline-flex">
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

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBellOpen((value) => !value);
                if (!bellOpen) {
                  // Mở ra là coi như đã đọc.
                  window.setTimeout(
                    () => setNotifications((current) =>
                    current.map((item) => ({ ...item, unread: false }))
                    ),
                    1200
                  );
                }
              }}
              className={`relative grid h-8 w-8 place-items-center rounded-md border transition-colors ${
              bellOpen ?
              'border-[#f5921f] bg-[#fdf3e2] text-[#b96f12]' :
              'border-[#e0d2bd] text-stone-600 hover:bg-[#faf6ef]'}`
              }
              title="Thông báo"
              aria-label="Thông báo"
              aria-expanded={bellOpen}>

              <BellIcon className="h-4 w-4" />
              {notifications.some((item) => item.unread) &&
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#f5921f] px-1 font-mono text-[9px] font-bold text-white ring-2 ring-white">
                  {notifications.filter((item) => item.unread).length}
                </span>
              }
            </button>

            {bellOpen &&
            <>
                <div
                className="fixed inset-0 z-30"
                onClick={() => setBellOpen(false)}
                aria-hidden="true" />

                <div className="absolute right-0 top-10 z-40 w-[340px] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10">
                  <div className="flex items-center gap-2 border-b border-[#eee4d5] px-4 py-3">
                    <h3 className="text-sm font-bold text-[#3b2c1d]">Thông báo</h3>
                    <span className="rounded bg-[#fdf3e2] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#8a6a3f]">
                      {notifications.filter((item) => item.unread).length} mới
                    </span>
                    <button
                    type="button"
                    onClick={() => setBellOpen(false)}
                    className="ml-auto grid h-6 w-6 place-items-center rounded text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
                    aria-label="Đóng">

                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <ul className="max-h-[340px] overflow-y-auto">
                    {notifications.map((item) =>
                  <li
                    key={item.id}
                    className={`flex gap-2.5 border-b border-[#f5efe5] px-4 py-3 last:border-b-0 ${
                    item.unread ? 'bg-[#fffdf9]' : ''}`
                    }>

                        <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      !item.unread ?
                      'bg-stone-300' :
                      item.tone === 'danger' ?
                      'bg-[#c0392b]' :
                      item.tone === 'warn' ?
                      'bg-[#f5921f]' :
                      'bg-[#2a55b8]'}`
                      } />

                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-stone-800">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[11.5px] leading-relaxed text-stone-500">
                            {item.body}
                          </p>
                          <p className="mt-1 font-mono text-[10.5px] text-stone-400">
                            {item.time}
                          </p>
                        </div>
                      </li>
                  )}
                  </ul>
                </div>
              </>
            }
          </div>

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

      {isBlankSource &&
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e3c79f] bg-[#fdf3e2] px-4 py-2.5 text-xs text-[#8a6a3f]">
          <span className="rounded bg-[#f5921f] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            Chưa liên kết Drive
          </span>
          <span>
            Dự án tạo không kèm link Google Drive nên chưa có ảnh và tài liệu
            nào. Các khối đang hiển thị nội dung mẫu để bạn hình dung bố cục —
            liên kết Drive rồi bấm Đồng bộ để nạp nội dung thật.
          </span>
        </div>
      }

      {/* ── Canvas ─────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 overflow-y-auto bg-[#f3ece1]">
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`min-h-full bg-[#faf6ef] ${
          editable ? 'cms-editing' : 'cms-editing cms-locked'}`
          }>

          <ProjectCanvas
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            role={role}
            projectName={heroName}
            overviewHtml={overviewHtml}
            locationHtml={locationHtml}
            stats={stats}
            hierarchy={hierarchy}
            tagline={tagline}
            inventorySource={inventorySource}
            showInventoryBar={editable}
            upstreamChange={upstream}
            sourceAccessLost={accessLost}
            projectLayout={projectLayout}
            grids={grids}
            onGridsChange={setGrids}
            products={products}
            onProductsChange={setProducts}
            imageSlots={{
              editable,
              overrides: imageOverrides,
              extras: imageExtras,
              onUpload: (slotKey, dataUrl) =>
              setImageOverrides((current) => ({ ...current, [slotKey]: dataUrl })),
              onClear: (slotKey) =>
              setImageOverrides((current) => {
                const next = { ...current };
                delete next[slotKey];
                return next;
              }),
              onAddMany: (collectionKey, dataUrls) =>
              setImageExtras((current) => ({
                ...current,
                [collectionKey]: [...current[collectionKey] ?? [], ...dataUrls]
              })),
              onRemoveExtra: (collectionKey, index) =>
              setImageExtras((current) => ({
                ...current,
                [collectionKey]: (current[collectionKey] ?? []).filter(
                  (_, position) => position !== index
                )
              }))
            }}
            onImportInventory={(source) => {
              const isFirst = !inventorySource;
              setInventorySource(source);
              setUpstream(null);
              try {
                // Cho trang xem trước dùng lại đúng dữ liệu vừa nhập.
                window.sessionStorage.setItem('cms:inventory', JSON.stringify(source));
              } catch {
                // Vượt hạn mức lưu trữ thì bỏ qua, không chặn luồng nhập.
              }
              const picked = source.sheets.filter((sheet) => sheet.kind === 'inventory');
              const units = picked.reduce((total, sheet) => total + sheet.analysis.units.length, 0);
              const priceColumns = picked[0]?.analysis.priceFields.length ?? 0;
              showNotice(
                isFirst ?
                `Đã nhập ${units} căn từ ${picked.length} sheet · ${priceColumns} cột giá` :
                `Đã đồng bộ lại — ${units} căn từ ${picked.length} sheet`
              );
            }}
            editing={{
              enabled: editable,
              onChange: handleInlineChange,
              onFocusBlock: handleFocusBlock
            }}
            syncedMedia={syncedMedia}
            chrome={false} />

        </div>
      </main>

      {/* ── Nút nổi góc dưới phải ─────────────────────────────── */}
      <button
        type="button"
        onClick={() => {
          setDrawerOpen((value) => !value);
          if (drawerOpen) setSelectedSection(null);
        }}
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

      {/* ── Ngăn kéo ──────────────────────────────────────────── */}
      {drawerOpen &&
      <aside className="fixed bottom-[86px] right-5 z-40 flex max-h-[76vh] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          {section ?
        <SectionEditor
          section={section}
          syncedMedia={syncedMedia}
          stats={stats}
          hierarchy={hierarchy}
          heroName={heroName}
          tagline={tagline}
          initialProjectName={project.name}
          isResyncing={isResyncing}
          onBack={() => setSelectedSection(null)}
          onClose={() => {
            setSelectedSection(null);
            setDrawerOpen(false);
          }}
          onChangeStats={(next) =>
          setEdits((current) => ({ ...current, stats: next }))
          }
          onChangeField={(field, value) =>
          setEdits((current) => ({ ...current, [field]: value }))
          }
          onReset={() => {
            setEdits({});
            showNotice('Đã trả về nội dung gốc');
          }}
          onResync={handleResync} /> :


        <DriveDrawer
          activeTab={activeTab}
          syncedMedia={syncedMedia}
          totalMedia={totalMedia}
          updatedAt={synced?.updated_at}
          driveFolderUrl={synced?.drive_folder_url}
          isResyncing={isResyncing}
          sectionsInTab={sectionsInTab}
          editable={editable}
          projectLayout={projectLayout}
          onClose={() => setDrawerOpen(false)}
          onPickTab={(tab) => setActiveTab(tab)}
          onPickSection={(id) => setSelectedSection(id)}
          onResync={handleResync} />

        }
        </aside>
      }

      {toolbarRect &&
      <div
        className="fixed z-50 flex gap-0.5 rounded-lg bg-[#3b2c1d] p-1 shadow-xl"
        style={{
          top: Math.max(8, toolbarRect.top - 44),
          left: Math.max(8, toolbarRect.left)
        }}>

          <FloatToolButton label="Đậm" onClick={() => document.execCommand('bold')}>
            <BoldIcon className="h-3.5 w-3.5" />
          </FloatToolButton>
          <FloatToolButton label="Nghiêng" onClick={() => document.execCommand('italic')}>
            <ItalicIcon className="h-3.5 w-3.5" />
          </FloatToolButton>
          <FloatToolButton label="Danh sách" onClick={() => document.execCommand('insertUnorderedList')}>
            <ListIcon className="h-3.5 w-3.5" />
          </FloatToolButton>
          <FloatToolButton label="Xóa định dạng" onClick={() => document.execCommand('removeFormat')}>
            <RotateCcwIcon className="h-3.5 w-3.5" />
          </FloatToolButton>
        </div>
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

/* ═══════════════════════════════════════════════════════════════
   Ngăn kéo mặc định — nội dung đồng bộ từ Drive
   ═══════════════════════════════════════════════════════════════ */
interface DriveDrawerProps {
  activeTab: string;
  syncedMedia: ReturnType<typeof buildSyncedMedia>;
  totalMedia: number;
  updatedAt?: string;
  driveFolderUrl?: string;
  isResyncing: boolean;
  sectionsInTab: typeof SECTIONS;
  editable: boolean;
  /** Ẩn tab Bảng hàng với dự án thấp tầng. */
  projectLayout: ProjectLayout;
  onClose: () => void;
  onPickTab: (tab: string) => void;
  onPickSection: (id: string) => void;
  onResync: () => void;
}

function DriveDrawer({
  activeTab,
  syncedMedia,
  totalMedia,
  updatedAt,
  driveFolderUrl,
  isResyncing,
  sectionsInTab,
  editable,
  projectLayout,
  onClose,
  onPickTab,
  onPickSection,
  onResync
}: DriveDrawerProps) {
  return (
    <>
      <div className="flex items-start gap-3 border-b border-[#eee4d5] px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-[#3b2c1d]">
            Nội dung đồng bộ từ Google Drive
          </h2>
          <p className="mt-0.5 text-[11px] text-stone-500">
            {totalMedia > 0 ?
            <>{totalMedia} ảnh và tài liệu trong {Object.keys(syncedMedia).length} tab</> :
            'Chưa có nội dung nào được đồng bộ'}
            {updatedAt && <> · {new Date(updatedAt).toLocaleString('vi-VN')}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
          aria-label="Đóng">

          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {sectionsInTab.length > 0 &&
        <div className="mb-2 rounded-lg bg-[#faf6ef] p-2">
            <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Section của tab này — bấm để sửa
            </p>
            {sectionsInTab.map((item) =>
          <button
            key={item.id}
            type="button"
            disabled={!editable}
            onClick={() => onPickSection(item.id)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">

                <PencilIcon className="h-3 w-3 shrink-0 text-[#b08e5c]" />
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-stone-700">
                  {item.label}
                </span>
                <span className="shrink-0 text-[9px] font-bold uppercase text-stone-400">
                  {item.kind === 'drive' ? 'Drive' : item.kind === 'manual' ? 'Đợt sau' : 'Nhập tay'}
                </span>
                <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-stone-300" />
              </button>
          )}
          </div>
        }

        <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Tất cả các tab
        </p>
        {CANVAS_TABS.filter(
          (tab) => !(projectLayout === 'thap-tang' && tab.id === 'bang-hang')
        ).map((tab) => {
          const groups = syncedMedia[tab.id] ?? [];
          const count = groups.reduce((sum, group) => sum + group.items.length, 0);
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onPickTab(tab.id)}
              className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
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
            </button>);

        })}
      </div>

      <div className="space-y-2 border-t border-[#eee4d5] px-4 py-3">
        <p className="flex gap-2 text-[11px] leading-relaxed text-stone-500">
          <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#c97a0a]" />
          Đồng bộ sẽ <b>ghi đè</b> toàn bộ hình ảnh và tài liệu. Nội dung nhập tay
          trên CMS không bị ảnh hưởng.
        </p>
        {driveFolderUrl &&
        <a
          href={driveFolderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8a6a3f] hover:underline">

            <ExternalLinkIcon className="h-3 w-3" />
            Mở thư mục Drive của dự án
          </a>
        }
        <button
          type="button"
          onClick={onResync}
          disabled={isResyncing}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#4a3728] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#33251a] disabled:cursor-not-allowed disabled:bg-stone-300">

          <RefreshCwIcon className={`h-3.5 w-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
          {isResyncing ? 'Đang đồng bộ…' : 'Đồng bộ lại từ Drive'}
        </button>
      </div>
    </>);

}

/* ═══════════════════════════════════════════════════════════════
   Trình sửa section đang chọn
   ═══════════════════════════════════════════════════════════════ */
interface SectionEditorProps {
  section: (typeof SECTIONS)[number];
  syncedMedia: ReturnType<typeof buildSyncedMedia>;
  stats: {value: string;label: string;}[];
  hierarchy: string;
  heroName: string;
  tagline: string;
  /** Tên dự án khai ở bước Khởi tạo — hiển thị để đối chiếu. */
  initialProjectName: string;
  isResyncing: boolean;
  onBack: () => void;
  onClose: () => void;
  onChangeStats: (next: {value: string;label: string;}[]) => void;
  onChangeField: (field: 'hierarchy' | 'projectName' | 'tagline', value: string) => void;
  onReset: () => void;
  onResync: () => void;
}

function SectionEditor({
  section,
  syncedMedia,
  stats,
  hierarchy,
  heroName,
  tagline,
  initialProjectName,
  isResyncing,
  onBack,
  onClose,
  onChangeStats,
  onChangeField,
  onReset,
  onResync
}: SectionEditorProps) {
  const items = section.media ?
  pickItems(syncedMedia[section.media[0]], section.media[1]) :
  [];

  return (
    <>
      <div className="flex items-start gap-2 border-b border-[#eee4d5] px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
          aria-label="Quay lại">

          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#b08e5c]">
            Đang sửa section
          </p>
          <h2 className="truncate text-sm font-bold text-[#3b2c1d]">{section.label}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
          aria-label="Đóng">

          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {section.hint &&
        <p className="rounded-md bg-[#faf6ef] p-2.5 text-[11.5px] leading-relaxed text-stone-600">
            {section.hint}
          </p>
        }

        {(section.kind === 'text' || section.kind === 'stats') &&
        <p className="flex gap-2 rounded-md border border-dashed border-[#e0d2bd] p-3 text-[12px] leading-relaxed text-stone-600">
            <PencilIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#b08e5c]" />
            <span>
              Bấm thẳng vào chữ trên trang để sửa tại chỗ. Thanh Đậm / Nghiêng /
              Danh sách hiện ngay phía trên khối đang nhập.
            </span>
          </p>
        }

        {section.kind === 'hero' &&
        <div className="space-y-3">
            <p className="flex gap-2 rounded-md border border-dashed border-[#e0d2bd] p-3 text-[12px] leading-relaxed text-stone-600">
              <PencilIcon className="mt-px h-3.5 w-3.5 shrink-0 text-[#b08e5c]" />
              <span>Cấp độ, tên dự án và slogan sửa được trực tiếp trên hero.</span>
            </p>
            <Field label="Cấp độ dự án">
              <select
              value={hierarchy}
              onChange={(event) => onChangeField('hierarchy', event.target.value)}
              className="h-8 w-full rounded-md border border-[#e0d2bd] bg-white px-2 text-[13px] font-semibold text-stone-800 outline-none focus:border-[#f5921f]">

                {HIERARCHY_OPTIONS.map((option) =>
              <option key={option} value={option}>{option}</option>
              )}
              </select>
            </Field>

            <Field
            label="Tên dự án"
            note={`Khai ở bước Khởi tạo dự án: “${initialProjectName}”`}>

              <input
              value={heroName}
              onChange={(event) => onChangeField('projectName', event.target.value)}
              className="h-8 w-full rounded-md border border-[#e0d2bd] px-2 text-[13px] font-semibold text-stone-800 outline-none focus:border-[#f5921f]" />

            </Field>

            <Field label="Slogan dự án">
              <input
              value={tagline}
              placeholder="Một câu ngắn đặt dưới tên dự án"
              onChange={(event) => onChangeField('tagline', event.target.value)}
              className="h-8 w-full rounded-md border border-[#e0d2bd] px-2 text-[13px] text-stone-700 outline-none focus:border-[#f5921f]" />

            </Field>
          </div>
        }

        {section.kind === 'stats' &&
        <div className="space-y-3">
            {stats.map((stat, index) =>
          <div key={index} className="grid grid-cols-[88px_1fr] gap-2">
                <input
              value={stat.value}
              onChange={(event) => {
                const next = stats.map((item, i) =>
                i === index ? { ...item, value: event.target.value } : item
                );
                onChangeStats(next);
              }}
              className="h-8 rounded-md border border-[#e0d2bd] px-2 text-center text-[13px] font-bold text-[#3b2c1d] outline-none focus:border-[#f5921f]" />

                <input
              value={stat.label}
              onChange={(event) => {
                const next = stats.map((item, i) =>
                i === index ? { ...item, label: event.target.value } : item
                );
                onChangeStats(next);
              }}
              className="h-8 rounded-md border border-[#e0d2bd] px-2 text-[13px] text-stone-700 outline-none focus:border-[#f5921f]" />

              </div>
          )}
          </div>
        }

        {section.kind === 'manual' &&
        <p className="rounded-md border border-dashed border-[#e0d2bd] p-3 text-[12px] text-stone-500">
            Section này nhập tay trên CMS. Giao diện biên tập chi tiết thuộc đợt
            dựng tiếp theo.
          </p>
        }

        {section.media &&
        <div>
            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Ảnh từ Drive
              </h3>
              <span className="font-mono text-[11px] font-bold text-stone-600">
                {items.length}
              </span>
              {section.folder &&
            <span className="inline-flex min-w-0 items-center gap-1 font-mono text-[10.5px] text-stone-400">
                  <FolderIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{section.folder}</span>
                </span>
            }
            </div>

            {items.length > 0 ?
          <div className="grid grid-cols-3 gap-1.5">
                {items.slice(0, 9).map((item, index) =>
            isImageItem(item) ?
            <div key={item.id} className="relative overflow-hidden rounded-md border border-[#eee4d5]">
                      <img
                src={sized(item.url, IMG.thumb)}
                alt={item.caption || item.name}
                loading="lazy"
                className="aspect-square w-full object-cover" />

                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1 font-mono text-[9px] font-bold text-white">
                        {index + 1}
                      </span>
                    </div> :

            <div
              key={item.id}
              title={item.name}
              className="grid aspect-square place-items-center rounded-md border border-[#eee4d5] bg-[#faf6ef] p-1 text-center text-[9px] font-semibold text-stone-500">
                      {stripExt(item.name).slice(0, 18)}
                    </div>

            )}
              </div> :

          <p className="rounded-md border border-dashed border-[#e0d2bd] p-3 text-[12px] text-stone-500">
                Thư mục này chưa có nội dung. Section đang hiển thị dữ liệu mẫu.
              </p>
          }

            {items.length > 9 &&
          <p className="mt-1.5 text-[11px] text-stone-400">
                và {items.length - 9} mục nữa
              </p>
          }

            <button
            type="button"
            onClick={onResync}
            disabled={isResyncing}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#e0d2bd] px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef] disabled:opacity-60">

              <RefreshCwIcon className={`h-3.5 w-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
              Đồng bộ lại từ Drive
            </button>
          </div>
        }
      </div>

      <div className="flex items-center gap-2 border-t border-[#eee4d5] px-4 py-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 transition-colors hover:text-stone-800">

          <RotateCcwIcon className="h-3.5 w-3.5" />
          Trả về gốc
        </button>
        <span className="ml-auto text-[11px] text-stone-400">
          Prototype: chưa lưu xuống CSDL
        </span>
      </div>
    </>);

}

/* ═══════════════════════════════════════════════════════════════
   Thanh công cụ nổi cho khối chữ đang nhập
   ═══════════════════════════════════════════════════════════════ */
function FloatToolButton({
  label,
  onClick,
  children
}: {label: string;onClick: () => void;children: React.ReactNode;}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded text-white/80 transition-colors hover:bg-white/15 hover:text-white">

      {children}
    </button>);

}

function Field({
  label,
  note,
  children
}: {label: string;note?: string;children: React.ReactNode;}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-400">
        {label}
      </span>
      {children}
      {note &&
      <span className="mt-1 block text-[11px] text-stone-500">{note}</span>
      }
    </label>);

}
