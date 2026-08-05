import React, { useRef } from 'react';
import { LayoutDashboardIcon, UsersIcon, Grid2x2Icon, Building2Icon, TableIcon, KeyRoundIcon, ScanEyeIcon, FileBadgeIcon, TrendingUpIcon, FileTextIcon, NewspaperIcon } from 'lucide-react';
interface Tab {
  key: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  locked?: boolean;
  restricted?: boolean;
  /** Chỉ hiện biểu tượng, ẩn nhãn chữ. */
  iconOnly?: boolean;
}
const TABS: Tab[] = [{
  key: 'tong-quan',
  label: 'Tổng quan',
  icon: LayoutDashboardIcon
}, {
  key: 'toa-nha',
  label: 'Sản phẩm',
  icon: Building2Icon
}, {
  key: 'mat-bang',
  label: 'Mặt bằng quỹ căn',
  icon: Grid2x2Icon
}, {
  key: 'bang-hang',
  label: 'Bảng hàng',
  icon: TableIcon,
  locked: true
}, {
  key: 'quy-can',
  label: 'Quỹ căn',
  icon: KeyRoundIcon,
  locked: true
}, {
  key: 'anh-360',
  label: 'Ảnh 360°',
  icon: ScanEyeIcon,
  locked: true
}, {
  key: 'chinh-sach',
  label: 'CSBH',
  icon: FileBadgeIcon,
  locked: true
}, {
  key: 'tien-do',
  label: 'Tiến độ',
  icon: TrendingUpIcon,
  locked: true
}, {
  key: 'tai-lieu',
  label: 'Tài liệu',
  icon: FileTextIcon,
  locked: true
}, {
  key: 'tin-tuc',
  label: 'Tin tức',
  icon: NewspaperIcon
}, {
  key: 'doi-ngu',
  label: 'Đội ngũ',
  icon: UsersIcon,
  iconOnly: true,
  /** Ẩn với vai trò User khác — xem HIDDEN_TABS_BY_ROLE. */
  restricted: true
}];
interface ProjectTabsProps {
  active: string;
  onChange: (key: string) => void;
  /** Ẩn các tab hạn chế với vai trò không có quyền xem. */
  hideRestricted?: boolean;
  /** Ẩn tab theo khoá — dùng khi loại hình dự án không có tab đó. */
  hidden?: string[];
}
export function ProjectTabs({
  active,
  onChange,
  hideRestricted = false,
  hidden = []
}: ProjectTabsProps) {
  const TABS_VISIBLE = TABS.filter(
    (tab) => !(hideRestricted && tab.restricted) && !hidden.includes(tab.key)
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  return <div className="project-tabs-sticky border-b border-stone-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={scrollRef} className="no-scrollbar flex items-stretch gap-0 overflow-x-auto" role="tablist" aria-label="Nội dung dự án">
          {TABS_VISIBLE.map((tab, i) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return <React.Fragment key={tab.key}>
                {i !== 0 && <span className="my-3 w-px shrink-0 bg-stone-200" aria-hidden="true" />}
                <button role="tab" aria-selected={isActive} onClick={() => onChange(tab.key)} title={tab.iconOnly ? tab.label : undefined} aria-label={tab.iconOnly ? tab.label : undefined} className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors ${tab.iconOnly ? 'px-3' : 'px-3.5'} ${isActive ? 'border-[#f5921f] text-[#f5921f]' : 'border-transparent text-stone-600 hover:text-[#f5921f]'}`}>
                  <Icon className="h-4 w-4" />
                  {!tab.iconOnly && tab.label}
                </button>
              </React.Fragment>;
        })}
        </div>
      </div>
    </div>;
}