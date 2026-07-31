import React, { useMemo, useState } from 'react';
import { ChevronDownIcon, CheckIcon, CrownIcon } from 'lucide-react';
import { getFundInventoryRows } from '../data/inventoryData';
import type { UnitStatus } from './UnitDetailModal';
const STATUS_OPTIONS: Array<'all' | UnitStatus> = ['all', 'Còn hàng', 'Đã bán', 'Đã lock', 'Đã cọc'];
export function FundInventory() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | UnitStatus>('all');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const rows = useMemo(() => getFundInventoryRows(), []);
  const filteredRows = statusFilter === 'all' ? rows : rows.filter((row) => row.detail.status === statusFilter);
  const allSelected = filteredRows.length > 0 && filteredRows.every((row) => selectedIds.has(row.id));
  function toggleRow(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allSelected) filteredRows.forEach((row) => next.delete(row.id));else filteredRows.forEach((row) => next.add(row.id));
      return next;
    });
  }
  return <section className="w-full" aria-label="Danh sách quỹ căn">
      <div className="overflow-x-auto rounded-lg border border-stone-100 bg-white">
        <div className="fund-grid grid items-center border-b border-stone-200 bg-[#faf7f1] text-[11px] font-bold uppercase tracking-wide text-stone-400">
          <div className="px-3 py-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Chọn tất cả căn" className="h-4 w-4 rounded border-stone-300 text-[#4a3728] focus:ring-[#4a3728]" />
              Mã căn
            </label>
          </div>
          <div className="px-3 py-3">Giá niêm yết</div>
          <div className="px-3 py-3">Loại hình</div>
          <div className="px-3 py-3">Hướng</div>
          <div className="px-3 py-3">Diện tích</div>
          <div className="px-3 py-3">Tầng</div>
          <div className="px-3 py-3">Trục</div>
          <div className="px-3 py-3">Phân khu</div>
          <div className="px-3 py-3">Tòa nhà</div>
          <div className="relative px-3 py-3">
            <button onClick={() => setIsStatusMenuOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={isStatusMenuOpen} className="inline-flex items-center gap-1 rounded text-[11px] font-bold uppercase tracking-wide text-stone-400 outline-none hover:text-[#4a3728] focus-visible:ring-2 focus-visible:ring-[#4a3728]">
              Tình trạng
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isStatusMenuOpen && <div role="listbox" aria-label="Lọc theo tình trạng" className="absolute right-2 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-stone-200 bg-white py-1 text-left normal-case shadow-lg">
                {STATUS_OPTIONS.map((status) => {
              const isActive = statusFilter === status;
              const label = status === 'all' ? 'Tất cả tình trạng' : status;
              return <button key={status} role="option" aria-selected={isActive} onClick={() => {
                setStatusFilter(status);
                setIsStatusMenuOpen(false);
              }} className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-colors hover:bg-stone-50 ${isActive ? 'text-[#4a3728]' : 'text-[#9c8672]'}`}>
                      {label}
                      {isActive && <CheckIcon className="h-3.5 w-3.5" />}
                    </button>;
            })}
              </div>}
          </div>
        </div>

        {filteredRows.length > 0 ? filteredRows.map((row) => {
        const isSelected = selectedIds.has(row.id);
        return <div key={row.id} className={`fund-grid grid items-center border-b border-stone-100 text-sm last:border-0 ${isSelected ? 'bg-[#fdf6ec]' : 'bg-white'}`}>
              <div className="flex items-center gap-2 px-3 py-3">
                <input type="checkbox" checked={isSelected} onChange={() => toggleRow(row.id)} aria-label={`Chọn căn ${row.id}`} className="h-4 w-4 shrink-0 rounded border-stone-300 text-[#4a3728] focus:ring-[#4a3728]" />
                {row.detail.fund === 'exclusive' && <CrownIcon className="h-3.5 w-3.5 shrink-0 fill-[#173b7a] text-[#173b7a]" aria-label="Quỹ độc quyền" />}
                <span className="text-xs font-bold text-[#4a3728]">{row.id}</span>
              </div>
              <div className="px-3 py-3 font-bold text-[#4a3728]">{row.detail.price}</div>
              <div className="px-3 py-3 text-[#9c8672]">{row.apartmentType}</div>
              <div className="px-3 py-3 text-[#9c8672]">{row.direction}</div>
              <div className="px-3 py-3 text-[#9c8672]">{row.area} m²</div>
              <div className="px-3 py-3 text-center text-[#9c8672]">{row.floor}</div>
              <div className="px-3 py-3 text-center text-[#9c8672]">{row.unit}</div>
              <div className="px-3 py-3 text-[#9c8672]">Imperia Sky Park</div>
              <div className="px-3 py-3 text-[#9c8672]">{row.buildingCode}</div>
              <div className="flex items-center gap-2 px-3 py-3 text-xs font-medium text-[#9c8672]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {row.detail.status}
              </div>
            </div>;
      }) : <div className="px-5 py-16 text-center text-sm font-medium text-stone-500">Không có căn thuộc trạng thái đã chọn.</div>}
      </div>

      {selectedIds.size > 0 && <p className="mt-3 text-xs font-semibold text-[#4a3728]">Đã chọn {selectedIds.size} căn</p>}
    </section>;
}