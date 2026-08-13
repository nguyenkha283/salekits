import React, { useMemo } from 'react';
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
import { Panorama360Content } from './components/Panorama360Content';
import { NewsContent } from './components/NewsContent';
import { BuildingsContent } from './components/BuildingsContent';
import { FloorPlanContent } from './components/FloorPlanContent';
import { TeamContent } from './components/TeamContent';
import { ImageSlotProvider, type ImageSlotState } from './components/EditableImage';
import type { FeaturedProduct } from './components/OverviewContent';
import type { TeamAssignment } from '../app/workflowStore';
import { InventorySetup, type InventorySource } from './components/InventorySetup';
import { buildInventory, type InventoryData } from './inventoryParser';
import type { ProjectLayout } from './parseWorkbook';
import { normalizeTowerKey } from './towerSheet';
import type { GridModel } from './gridModel';
import {
  InventorySourceBar,
  type UpstreamChange } from
'./components/InventorySourceBar';
import {
  IMG,
  isImageItem,
  pickItems,
  sized,
  stripExt,
  type SyncedMedia } from
'./syncedMedia';

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
  folder?: string;
  /** Ẩn với vai trò "User khác". */
  restricted?: boolean;
}

export const CANVAS_TABS: CanvasTab[] = [
{ id: 'tong-quan', label: 'Tổng quan', source: 'manual', folder: '01. Tổng quan' },
{ id: 'toa-nha', label: 'Sản phẩm', source: 'import' },
{ id: 'mat-bang', label: 'Mặt bằng quỹ căn', source: 'manual', folder: '03. Mặt bằng' },
{ id: 'bang-hang', label: 'Bảng hàng', source: 'import' },
{ id: 'quy-can', label: 'Quỹ căn', source: 'import' },
{ id: 'anh-360', label: 'Ảnh 360', source: 'drive', folder: '04. Ảnh 360' },
{ id: 'chinh-sach', label: 'Chính sách bán hàng', source: 'drive', folder: '05. Chính sách bán hàng' },
{ id: 'tien-do', label: 'Tiến độ', source: 'drive', folder: '06. Tiến độ' },
{ id: 'tai-lieu', label: 'Tài liệu', source: 'drive', folder: '07. Tài liệu' },
{ id: 'tin-tuc', label: 'Tin tức', source: 'manual' },
{ id: 'doi-ngu', label: 'Đội ngũ', source: 'manual', restricted: true }];


function sizedOrUndefined(url: string | undefined, width: number) {
  return url ? sized(url, width) : undefined;
}

/** Vai trò không được xem các tab hạn chế. */
/**
 * Dự án thấp tầng không có tab Bảng hàng.
 *
 * Bảng hàng dạng lưới định vị căn bằng cặp (tầng, trục) — khái niệm không tồn
 * tại ở liền kề, biệt thự, shophouse. Với thấp tầng, căn hiển thị ở Quỹ căn
 * dạng phẳng và định vị bằng pin trên Mặt bằng quỹ căn.
 */
export function tabsForLayout(layout: ProjectLayout): CanvasTab[] {
  if (layout === 'thap-tang') {
    return CANVAS_TABS.filter((tab) => tab.id !== 'bang-hang');
  }
  return CANVAS_TABS;
}

export function canViewRestricted(role: Role): boolean {
  return role !== 'User khác';
}

/** Quyền biên tập theo ma trận phân quyền mục 2.5 của SRS. */
export function canEditTab(role: Role, tabId: string): boolean {
  // Ban lãnh đạo xem toàn bộ nhưng không sửa nội dung nào.
  if (role === 'Trưởng line' || role === 'Ban lãnh đạo' || role === 'User khác')
  return false;
  // Trưởng phòng QLGD và Marketing chỉ vào tab Đội ngũ để gán nhân sự phòng mình.
  if (role === 'Trưởng phòng QLGD' || role === 'Trưởng phòng Marketing')
  return tabId === 'doi-ngu';
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
  /** Nội dung văn bản đồng bộ từ Drive. */
  overviewHtml?: string;
  locationHtml?: string;
  /** Số liệu nổi bật, sửa được trong CMS. */
  stats?: {value: string;label: string;}[];
  /** Cấp độ dự án hiển thị trên hero. */
  hierarchy?: string;
  /** Slogan dưới tên dự án trên hero. */
  tagline?: string;
  /**
   * Nguồn bảng hàng đã nhập.
   *  undefined — trang công khai, dữ liệu đã xuất bản, luôn hiển thị bảng
   *  null      — trong CMS nhưng chưa nhập, hiện màn nhập nguồn dữ liệu
   */
  inventorySource?: InventorySource | null;
  onImportInventory?: (source: InventorySource) => void;
  /** Hiện thanh nguồn kèm nút đồng bộ riêng — chỉ bật trong CMS. */
  showInventoryBar?: boolean;
  /** Thay đổi phía chủ đầu tư, do trang CMS phát hiện. */
  upstreamChange?: UpstreamChange | null;
  /** Mất quyền đọc file nguồn. */
  sourceAccessLost?: boolean;
  /** Cao tầng có tab Bảng hàng dạng lưới; thấp tầng không. */
  projectLayout?: ProjectLayout;
  /** Lưới đã soạn, giữ qua các lần đồng bộ lại. */
  grids?: Record<string, GridModel>;
  onGridsChange?: (grids: Record<string, GridModel>) => void;
  /** Bật sửa chữ trực tiếp trên trang khi hiển thị trong CMS. */
  editing?: {
    enabled: boolean;
    onChange: (field: string, value: string) => void;
    onFocusBlock?: (element: HTMLElement | null) => void;
  };
  /** Ảnh và tài liệu đã đồng bộ, gom theo tab. */
  syncedMedia?: SyncedMedia;
  /** Đội ngũ dự án — đồng bộ từ HRM, gán trong tab Đội ngũ. */
  team?: TeamAssignment;
  /** APM sửa nhóm phụ trách; hai trưởng phòng gán nhân sự phòng mình. */
  canEditRoster?: boolean;
  canAssignSales?: boolean;
  canAssignMarketing?: boolean;
  onTeamChange?: (patch: Partial<TeamAssignment>) => void;
  onToggleAssignment?: (
  group: 'salesCodes' | 'marketingCodes',
  code: string)
  => void;
  /** Sản phẩm nổi bật — soạn tay trong CMS. */
  products?: FeaturedProduct[];
  onProductsChange?: (products: FeaturedProduct[]) => void;
  /** Ảnh tải tay từ máy, đè lên ảnh Drive ở cùng vị trí. */
  imageSlots?: ImageSlotState;
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
  locationHtml = '',
  stats,
  hierarchy,
  tagline,
  inventorySource,
  onImportInventory,
  showInventoryBar = false,
  upstreamChange = null,
  sourceAccessLost = false,
  projectLayout = 'cao-tang',
  grids,
  onGridsChange,
  editing,
  syncedMedia = {},
  team,
  canEditRoster = false,
  canAssignSales = false,
  canAssignMarketing = false,
  onTeamChange,
  onToggleAssignment,
  products,
  onProductsChange,
  imageSlots,
  chrome = true
}: ProjectCanvasProps) {
  const slots: ImageSlotState = imageSlots ?? {
    editable: false,
    overrides: {},
    extras: {}
  };
  const isOverview = activeTab === 'tong-quan';
  const isInventoryTab = ['toa-nha', 'bang-hang', 'quy-can'].includes(activeTab);
  const inventoryReady = inventorySource === undefined || Boolean(inventorySource);
  /** Gộp các sheet đã chọn thành bộ dữ liệu hiển thị. */
  const inventoryData: InventoryData | null = useMemo(
    () =>
    inventorySource ?
    buildInventory(inventorySource.sheets, inventorySource.priceIndex) :
    null,
    [inventorySource]
  );

  /**
   * Template từ sheet Tòa (Kiểu 1). Có sẵn thì dùng luôn — trung thực hơn
   * nhiều so với dựng lại từ danh sách.
   */
  const towerTemplates = useMemo(() => {
    const result: Record<string, GridModel> = {};

    inventorySource?.sheets.
    filter((sheet) => sheet.kind === 'tower' && sheet.tower).
    forEach((sheet) => {
      const tower = sheet.tower;
      if (!tower || !tower.model.blocks.length) return;
      // Tên tòa trong sheet template và trong cột Tòa của sheet dữ liệu có thể
      // viết khác nhau về hoa thường và dấu, nên khớp theo dạng đã chuẩn hóa.
      [tower.towerName, tower.towerCode, sheet.name].
      filter(Boolean).
      forEach((key) => {
        result[normalizeTowerKey(key)] = tower.model;
      });
    });

    return result;
  }, [inventorySource]);

  // Rót dữ liệu Drive vào đúng section của từng component thiết kế sẵn.
  const overviewGroups = syncedMedia['tong-quan'];
  const policyGroups = syncedMedia['chinh-sach'] ?? [];

  const heroSlides = pickItems(overviewGroups, 'hero').map((item) => sized(item.url, IMG.hero));
  const overviewImage = sizedOrUndefined(pickItems(overviewGroups, 'overview')[0]?.url, IMG.wide);
  const locationImage = sizedOrUndefined(pickItems(overviewGroups, 'location')[0]?.url, IMG.wide);
  const amenities = pickItems(overviewGroups, 'amenity').map((item) => ({
    image: sized(item.url, IMG.card),
    title: item.caption || stripExt(item.name)
  }));
  const floorPlans = pickItems(overviewGroups, 'plan-preview').map((item) => ({
    key: item.id,
    label: item.caption || stripExt(item.name),
    title: item.caption || stripExt(item.name),
    image: sized(item.url, IMG.wide)
  }));

  const planImage = sizedOrUndefined(pickItems(syncedMedia['mat-bang'])[0]?.url, IMG.hero);
  const scenes360 = pickItems(syncedMedia['anh-360']).map((item) => ({
    key: item.id,
    label: stripExt(item.name),
    image: sized(item.url, IMG.hero)
  }));
  const policyCover = sizedOrUndefined(pickItems(policyGroups, 'policy-cover')[0]?.url, IMG.wide);
  const policyFileGroups = policyGroups.
  filter((group) => group.id !== 'policy-cover').
  map((group) => ({ id: group.id, label: group.label, items: group.items }));
  const progressPhotos = pickItems(syncedMedia['tien-do']).
  filter(isImageItem).
  map((item, index) => ({
    id: item.id,
    src: sized(item.url, IMG.card),
    alt: `Ảnh tiến độ — ${item.caption || stripExt(item.name)} (${index + 1})`
  }));
  const documentFiles = pickItems(syncedMedia['tai-lieu']).map((item) => ({
    label: stripExt(item.name),
    href: item.url
  }));

  return (
    <ImageSlotProvider value={slots}>
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
            <ProjectTabs
              active={activeTab}
              onChange={onChangeTab}
              hideRestricted={!canViewRestricted(role)}
              hidden={projectLayout === 'thap-tang' ? ['bang-hang'] : []} />
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
        <OverviewContent
          tabs={
          <ProjectTabs
            active={activeTab}
            onChange={onChangeTab}
            hideRestricted={!canViewRestricted(role)}
            hidden={projectLayout === 'thap-tang' ? ['bang-hang'] : []} />
          }
          heroSlides={heroSlides}
          overviewImage={overviewImage}
          overviewHtml={overviewHtml}
          locationImage={locationImage}
          locationHtml={locationHtml}
          amenities={amenities}
          floorPlans={floorPlans}
          stats={stats}
          products={products}
          onProductsChange={onProductsChange}
          hierarchy={hierarchy}
          projectName={projectName}
          tagline={tagline}
          editing={editing} />

        }

        {activeTab === 'mat-bang' && <FloorPlanContent planImage={planImage} projectName={projectName} />}
        {activeTab === 'anh-360' && <Panorama360Content scenes={scenes360} />}
        {activeTab === 'chinh-sach' &&
        <PolicyContent coverImage={policyCover} groups={policyFileGroups} />
        }
        {activeTab === 'tien-do' && <ProgressContent photos={progressPhotos} />}
        {activeTab === 'tai-lieu' && <DocumentsContent documents={documentFiles} />}

        {/* Ba tab phụ thuộc bảng hàng: chưa nhập thì hiện màn nhập nguồn dữ liệu. */}
        {isInventoryTab && !inventoryReady &&
        <InventorySetup
          projectLayout={projectLayout}
          context={activeTab === 'quy-can' ? 'quỹ căn' : activeTab === 'toa-nha' ? 'sản phẩm' : 'bảng hàng'}
          onImported={(source) => onImportInventory?.(source)} />

        }
        {/* Bảng hàng có nguồn riêng ngoài Drive nên cần nút đồng bộ riêng. */}
        {isInventoryTab && inventoryReady && showInventoryBar && inventorySource &&
        <InventorySourceBar
          source={inventorySource}
          upstream={upstreamChange}
          accessLost={sourceAccessLost}
          onResynced={(source) => onImportInventory?.(source)} />

        }
        {activeTab === 'toa-nha' && inventoryData && <BuildingsContent data={inventoryData} projectName={projectName} />}
        {activeTab === 'bang-hang' && projectLayout !== 'thap-tang' && inventoryData &&
        <InventoryTable
          role={role}
          data={inventoryData}
          showNotice={chrome}
          grids={grids}
          templates={towerTemplates}
          onGridsChange={onGridsChange} />
        }
        {activeTab === 'quy-can' && inventoryData &&
        <FundInventory data={inventoryData} layout={projectLayout} showNotice={chrome} />
        }
        {activeTab === 'tin-tuc' && <NewsContent />}
        {activeTab === 'doi-ngu' && canViewRestricted(role) && team &&
        <TeamContent
          projectName={projectName}
          team={team}
          canEditRoster={canEditRoster}
          canAssignSales={canAssignSales}
          canAssignMarketing={canAssignMarketing}
          onChange={(patch) => onTeamChange?.(patch)}
          onToggleAssignment={(group, code) => onToggleAssignment?.(group, code)} />
        }
        {!CANVAS_TABS.some((entry) => entry.id === activeTab) && <ProjectContent />}
      </div>
    </ImageSlotProvider>);

}
