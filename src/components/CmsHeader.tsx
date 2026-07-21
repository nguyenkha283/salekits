import React from 'react';
import { EyeIcon, PanelRightIcon, Settings2Icon } from 'lucide-react';
import { CmsRole } from '../types/cms';
export type CmsRightPanelMode = 'document' | null;
const ROLES: CmsRole[] = ['APM', 'Trưởng line', 'Quản lý bán hàng', 'Marketing'];
interface CmsHeaderProps {
  rightPanelMode: CmsRightPanelMode;
  role: CmsRole;
  onRoleChange: (role: CmsRole) => void;
  onChangeRightPanel: (mode: CmsRightPanelMode) => void;
  onOpenConfiguration: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}
interface IconControlProps {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}
function IconControl({
  active = false,
  label,
  onClick,
  children
}: IconControlProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`grid h-8 w-8 place-items-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 ${active ? 'bg-neutral-900 text-white' : 'text-neutral-950 hover:bg-neutral-900 hover:text-white'}`}>
      
      {children}
    </button>);

}
export function CmsHeader({
  rightPanelMode,
  role,
  onRoleChange,
  onChangeRightPanel,
  onOpenConfiguration,
  onPreview,
  onSaveDraft,
  onPublish
}: CmsHeaderProps) {
  return (
    <header className="relative flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-5">
      <div
        className="flex min-w-0 items-center gap-2.5"
        aria-label="CENHOMES.VN">
        
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-[#6D3A18]">
          <span className="h-3 w-3 rotate-45 border-2 border-white" />
        </span>
        <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-[#173020] sm:text-xl">
          CENH<span className="text-[#f5881f]">O</span>MES
          <span className="align-super text-[9px] font-bold sm:text-[10px]">
            .VN
          </span>
        </span>
        <span className="h-6 w-px shrink-0 bg-neutral-300" aria-hidden="true" />
        <span className="hidden whitespace-nowrap text-sm font-semibold text-neutral-700 sm:block">
          Chi tiết dự án
        </span>
      </div>

      <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
        <label className="sr-only" htmlFor="cms-role">
          Vai trò người dùng
        </label>
        <select
          id="cms-role"
          value={role}
          onChange={(event) => onRoleChange(event.target.value as CmsRole)}
          className="h-8 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 outline-none transition focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100">
          
          {ROLES.map((item) =>
          <option key={item} value={item}>
              {item}
            </option>
          )}
        </select>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onSaveDraft}
          className="hidden px-1 py-1 text-sm font-semibold text-[#6D3A18] transition-colors hover:text-[#3E200D] focus:outline-none focus:underline sm:block">
          
          Lưu nháp
        </button>
        <IconControl label="Xem trước" onClick={onPreview}>
          <EyeIcon className="h-5 w-5" aria-hidden="true" />
        </IconControl>
        <IconControl label="Cấu hình dự án" onClick={onOpenConfiguration}>
          <Settings2Icon className="h-5 w-5" aria-hidden="true" />
        </IconControl>
        <IconControl
          active={rightPanelMode === 'document'}
          label="Hiển thị bảng điều khiển bên phải"
          onClick={() =>
          onChangeRightPanel(
            rightPanelMode === 'document' ? null : 'document'
          )
          }>
          
          <PanelRightIcon className="h-5 w-5" aria-hidden="true" />
        </IconControl>
        <button
          type="button"
          onClick={onPublish}
          className="h-8 rounded-md bg-[#f5881f] px-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#db7214] focus:outline-none focus:ring-2 focus:ring-orange-300 sm:px-3 sm:text-sm">
          
          Xuất bản
        </button>
      </div>
    </header>);

}