import React, { FormEvent, useMemo, useState } from 'react';
import { CrownIcon, HeartIcon, PlusIcon, XIcon } from 'lucide-react';
import { Role } from './Header';
import { UnitDetailModal } from './UnitDetailModal';
import type { UnitDetail, UnitStatus } from './UnitDetailModal';
import { BUILDING_CODES, BUILDINGS, Building, DIRECTION_NAMES, FLOORS, INVENTORY_BY_BUILDING, UNIT_AREAS, UNIT_CODES, UNIT_DIRECTIONS, UNIT_TYPES } from '../data/inventoryData';
interface Fund {
  id: string;
  name: string;
  color: string;
}
interface SelectedUnit {
  floor: string;
  unit: string;
  apartmentType: string;
  area: string;
  direction: string;
  detail: UnitDetail;
}
interface InventoryTableProps {
  role: Role;
}
const INITIAL_FUNDS: Fund[] = [{
  id: 'exclusive',
  name: 'Quỹ độc quyền',
  color: '#ff0000'
}, {
  id: 'cross',
  name: 'Quỹ chéo',
  color: '#a77b00'
}];
const STATUS_COLORS: Record<UnitStatus, string> = {
  'Còn hàng': '#16a34a',
  'Đã lock': '#8b5cf6',
  'Đã cọc': '#f59e0b',
  'Đã bán': '#dc2626'
};

const TOWER_ONE_STATUS_STYLES: Record<UnitStatus, {color: string;background: string;}> = {
  'Còn hàng': { color: '#4a3728', background: 'rgba(255, 255, 255, 1)' },
  'Đã lock': { color: 'rgba(245, 187, 39, 1)', background: 'rgba(245, 187, 39, 0.2)' },
  'Đã cọc': { color: 'rgba(129, 55, 4, 1)', background: 'rgba(129, 55, 4, 0.2)' },
  'Đã bán': { color: '#ff0000', background: 'rgba(255, 0, 0, 0.2)' }
};

const TOWER_ONE_STATUS_LEGENDS: Array<{label: UnitStatus;color: string;}> = [
{ label: 'Đã bán', color: '#ff0000' },
{ label: 'Đã lock', color: 'rgba(245, 187, 39, 1)' },
{ label: 'Đã cọc', color: 'rgba(129, 55, 4, 1)' }];


const VARIANT_DESCRIPTIONS: Partial<Record<Building, string>> = {
  'Tòa 2': 'Phương án 1 · Nền thể hiện trạng thái, viền thể hiện quỹ căn',
  'Tòa 3': 'Phương án 2 · Nền thể hiện quỹ căn, chấm thể hiện trạng thái',
  'Tòa 4': 'Phương án 3 · Khung thể hiện quỹ căn, chip thể hiện trạng thái'
};
export function InventoryTable({
  role
}: InventoryTableProps) {
  const [building, setBuilding] = useState<Building>('Tòa 1');
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [funds, setFunds] = useState<Fund[]>(INITIAL_FUNDS);
  const [visibleFunds, setVisibleFunds] = useState<Record<string, boolean>>({
    exclusive: true,
    cross: true
  });
  const [visibleStatuses, setVisibleStatuses] = useState<Record<UnitStatus, boolean>>({
    'Còn hàng': true,
    'Đã lock': false,
    'Đã cọc': false,
    'Đã bán': false
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null);
  const [sheet, setSheet] = useState('');
  const [color, setColor] = useState('#f5921f');
  const canAddFund = role === 'Quản lý giao dịch';
  const isPaused = building === 'Tòa 2';
  const activeUnits = useMemo(() => INVENTORY_BY_BUILDING[building], [building]);
  const fundColors = useMemo(() => Object.fromEntries(funds.map((fund) => [fund.id, building === 'Tòa 1' && fund.id === 'exclusive' ? '#4a3728' : fund.color])), [building, funds]);
  function toggleFund(fundId: string) {
    setVisibleFunds((current) => {
      const activeFundIds = funds.filter((fund) => current[fund.id] !== false).map((fund) => fund.id);
      if (activeFundIds.length === funds.length) {
        return Object.fromEntries(funds.map((fund) => [fund.id, fund.id === fundId]));
      }
      if (current[fundId] === false) return { ...current, [fundId]: true };
      if (activeFundIds.length > 1) return { ...current, [fundId]: false };
      return current;
    });
  }

  function toggleStatus(status: UnitStatus) {
    if (status === 'Còn hàng') return;
    setVisibleStatuses((current) => ({ ...current, [status]: !current[status] }));
  }

  function submitFund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sheet) return;
    const id = `${sheet}-${Date.now()}`;
    setFunds((currentFunds) => [...currentFunds, {
      id,
      name: sheet,
      color
    }]);
    setVisibleFunds((current) => ({
      ...current,
      [id]: true
    }));
    setSheet('');
    setColor('#f5921f');
    setIsDialogOpen(false);
  }
  return <section className="w-full" aria-labelledby="inventory-heading">
      <h2 id="inventory-heading" className="text-2xl font-bold text-black">Bảng hàng</h2>

      <div className="mt-5 w-full border border-[#e9e1d5] bg-[#faf7f1] p-4 sm:p-5">
        <p className="text-[13px] font-medium text-[#4a3728]">Chọn bảng hàng:</p>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Chọn tòa nhà">
          {BUILDINGS.map((item) => <button key={item} role="tab" aria-selected={building === item} onClick={() => setBuilding(item)} className={`rounded border border-[#e9e1d5] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors ${building === item ? 'bg-[#4a3728]' : 'bg-[#8b7d6d] hover:bg-[#6f6152]'}`}>
              {item}
            </button>)}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border border-[#e9e1d5] bg-white px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {funds.map((fund) => {
          const isVisible = visibleFunds[fund.id] !== false;
          const displayColor = fundColors[fund.id];
          const isTowerOneExclusive = building === 'Tòa 1' && fund.id === 'exclusive';
          const showsFundColor = building !== 'Tòa 1';
          return <button key={fund.id} onClick={() => toggleFund(fund.id)} aria-pressed={isVisible} className={`inline-flex items-center gap-2 rounded border border-[#e9e1d5] bg-white px-3 py-2 text-xs font-medium text-[#4a3728] shadow-sm transition-opacity hover:bg-stone-50 ${isVisible ? 'opacity-100' : 'opacity-40'}`}>
                {isTowerOneExclusive && <CrownIcon className="h-3.5 w-3.5 fill-[#173b7a] text-[#173b7a]" aria-label="Quỹ độc quyền" />}
                {showsFundColor && <span className="h-2.5 w-2.5 rounded-full" style={{
              backgroundColor: displayColor
            }} aria-hidden="true" />}
                {fund.name}
              </button>;
        })}
          {canAddFund && <button onClick={() => setIsDialogOpen(true)} aria-label="Thêm quỹ căn mới" className="inline-flex h-8 w-8 items-center justify-center rounded border border-[#ddd0bd] bg-white text-[#4a3728] transition-colors hover:border-[#4a3728] hover:bg-[#faf5ec]">
              <PlusIcon className="h-4 w-4" />
            </button>}
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex flex-wrap items-center gap-2" aria-label="Lọc theo trạng thái căn">
            <span className="mr-1 text-xs font-medium text-[#7b6d5d]">Trạng thái:</span>
            {TOWER_ONE_STATUS_LEGENDS.map((legend) => {
            const isVisible = visibleStatuses[legend.label];
            return <button key={legend.label} type="button" onClick={() => toggleStatus(legend.label)} aria-pressed={isVisible} className={`inline-flex items-center gap-1.5 rounded border px-2 py-1.5 text-xs font-medium transition-opacity ${isVisible ? 'border-[#d8ccbc] bg-[#faf7f1] text-[#4a3728] opacity-100' : 'border-transparent bg-transparent text-[#7b6d5d] opacity-50 hover:opacity-80'}`}>
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: legend.color }} aria-hidden="true" />
                    {legend.label}
                  </button>;
          })}
          </div>
          <button onClick={() => setIsBasketOpen((current) => !current)} aria-pressed={isBasketOpen} className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-semibold transition-colors ${isBasketOpen ? 'border-[#4a3728] bg-[#4a3728] text-white' : 'border-[#ddd0bd] bg-white text-[#4a3728] hover:bg-[#faf5ec]'}`}>
            <HeartIcon className={`h-4 w-4 ${isBasketOpen ? 'fill-white' : 'fill-[#4a3728]'}`} />
            Giỏ của tôi
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden border border-[#e9e1d5] bg-white">
        <div className="flex items-center justify-between gap-4 bg-[#faf7f1] px-4 py-[13px] sm:px-8">
          <div>
            <p className="text-[13px] font-semibold text-[#4a3728]">{building}</p>
            {VARIANT_DESCRIPTIONS[building] && <p className="mt-0.5 text-[11px] text-[#9c8672]">{VARIANT_DESCRIPTIONS[building]}</p>}
          </div>
          <span className={`shrink-0 rounded px-2.5 py-1 text-[11px] font-semibold ${isPaused ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {isPaused ? 'Đã dừng bán' : 'Đang mở bán'}
          </span>
        </div>

        <table className="inventory-table w-full table-fixed border-collapse text-center font-serif" aria-label={`Bảng hàng ${building}`}>
          <colgroup>
            <col className="inventory-side-column" />
            {UNIT_CODES.map((unit) => <col key={unit} />)}
            <col className="inventory-side-column" />
          </colgroup>
          <thead>
            <tr className="bg-[#827464] text-white">
              <th className="inventory-side-cell">TẦNG/CĂN</th>
              {UNIT_CODES.map((unit) => <th key={unit} className="inventory-head-cell">{unit}</th>)}
              <th className="inventory-side-cell">TẦNG/CĂN</th>
            </tr>
            <tr className="bg-[#dedbcc] text-[#403b35]">
              <th className="inventory-side-cell bg-[#827464] text-white">Loại căn</th>
              {UNIT_TYPES.map((type, index) => <th key={`${type}-${index}`} className="inventory-meta-cell">{type}</th>)}
              <th className="inventory-side-cell bg-[#827464] text-white">Loại căn</th>
            </tr>
            <tr className="bg-[#dedbcc] text-[#403b35]">
              <th className="inventory-side-cell bg-[#827464] text-white">DT TT</th>
              {UNIT_AREAS.map((area, index) => <th key={`${area}-${index}`} className="inventory-meta-cell">{area}</th>)}
              <th className="inventory-side-cell bg-[#827464] text-white">DT TT</th>
            </tr>
            <tr className="bg-[#dedbcc] text-[#403b35]">
              <th className="inventory-side-cell bg-[#827464] text-white">Hướng ban công</th>
              {UNIT_DIRECTIONS.map((direction, index) => <th key={`${direction}-${index}`} className="inventory-meta-cell">{direction}</th>)}
              <th className="inventory-side-cell bg-[#827464] text-white">Hướng ban công</th>
            </tr>
            <tr className="bg-[#b9a988] text-white">
              <th className="inventory-side-cell bg-[#827464]">View</th>
              <th colSpan={19} className="inventory-view-cell">View</th>
              <th className="inventory-side-cell bg-[#827464]">View</th>
            </tr>
          </thead>
          <tbody>
            {FLOORS.map((floor) => <tr key={floor}>
                <th className="inventory-floor-cell">{floor}</th>
                {UNIT_CODES.map((unit) => {
              const inventoryUnit = activeUnits[`${floor}-${unit}`];
              const shouldShow = inventoryUnit && visibleFunds[inventoryUnit.fund] !== false && visibleStatuses[inventoryUnit.status] !== false;
              const content = inventoryUnit?.price;
              const fundColor = inventoryUnit ? fundColors[inventoryUnit.fund] : '';
              const statusColor = inventoryUnit ? STATUS_COLORS[inventoryUnit.status] : '';
              const isTowerOne = building === 'Tòa 1';
              const towerOneStatusStyle = inventoryUnit ? TOWER_ONE_STATUS_STYLES[inventoryUnit.status] : TOWER_ONE_STATUS_STYLES['Còn hàng'];
              const cellVariant = {
                'Tòa 1': 'tower-one-status',
                'Tòa 2': 'status-fill',
                'Tòa 3': 'fund-fill',
                'Tòa 4': 'fund-outline'
              }[building];
              return <td key={unit} className="inventory-unit-cell">
                      {shouldShow && <button onClick={() => {
                  const columnIndex = UNIT_CODES.indexOf(unit);
                  setSelectedUnit({
                    floor,
                    unit,
                    apartmentType: UNIT_TYPES[columnIndex],
                    area: UNIT_AREAS[columnIndex],
                    direction: DIRECTION_NAMES[UNIT_DIRECTIONS[columnIndex]],
                    detail: inventoryUnit
                  });
                }} className={`cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#4a3728] ${cellVariant === 'tower-one-status' ? 'inventory-unit-status-value focus:ring-inset' : cellVariant === 'status-fill' ? 'inventory-unit-value focus:ring-inset' : cellVariant === 'fund-fill' ? 'inventory-unit-value inventory-unit-fund-fill focus:ring-inset' : 'inventory-unit-outline'}`} style={cellVariant === 'tower-one-status' ? {
                  backgroundColor: towerOneStatusStyle.background,
                  color: towerOneStatusStyle.color
                } : cellVariant === 'status-fill' ? {
                  backgroundColor: statusColor,
                  boxShadow: `inset 0 0 0 3px ${fundColor}`
                } : cellVariant === 'fund-outline' ? {
                  color: fundColor,
                  boxShadow: `inset 0 0 0 3px ${fundColor}`
                } : {
                  backgroundColor: fundColor
                }} aria-label={`Xem chi tiết căn ${floor}-${unit}, ${content}, trạng thái ${inventoryUnit.status}`}>
                          <span className="inventory-unit-price">{content}</span>
                          {isTowerOne && <span className="inventory-unit-status-label">{inventoryUnit.status}</span>}
                          {isTowerOne && inventoryUnit.fund === 'exclusive' && <CrownIcon className="inventory-unit-crown" aria-label="Quỹ độc quyền" />}
                          {cellVariant === 'fund-fill' && <span className="inventory-unit-status-dot" style={{
                    backgroundColor: statusColor
                  }} aria-hidden="true" />}
                          {cellVariant === 'fund-outline' && <span className="inventory-unit-status-chip" style={{
                    backgroundColor: statusColor
                  }} aria-hidden="true" />}
                        </button>}
                    </td>;
            })}
                <th className="inventory-floor-cell">{floor}</th>
              </tr>)}
          </tbody>
        </table>
      </div>

      {isDialogOpen && <div role="presentation" className="fixed inset-0 z-[70] flex items-center justify-center bg-[#4a3728]/40 p-4" onMouseDown={() => setIsDialogOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-fund-title" className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-5">
              <h3 id="add-fund-title" className="text-lg font-bold text-[#4a3728]">Thêm Quỹ căn mới</h3>
              <button onClick={() => setIsDialogOpen(false)} aria-label="Đóng" className="text-stone-500 hover:text-[#4a3728]"><XIcon className="h-5 w-5" /></button>
            </div>
            <form className="mt-5 space-y-5" onSubmit={submitFund}>
              <label className="block text-sm font-medium text-[#4a3728]">
                Chọn sheet để đồng bộ trên link drive gốc
                <select value={sheet} onChange={(event) => setSheet(event.target.value)} required className="mt-2 w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition-colors focus:border-[#4a3728] focus:ring-1 focus:ring-[#4a3728]">
                  <option value="" disabled>Chọn sheet</option>
                  <option value="Quỹ tự tạo 1">Quỹ tự tạo 1</option>
                  <option value="Quỹ tự tạo 2">Quỹ tự tạo 2</option>
                  <option value="Quỹ tự tạo 3">Quỹ tự tạo 3</option>
                  <option value="Quỹ tự tạo 4">Quỹ tự tạo 4</option>
                </select>
              </label>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="fund-color" className="text-sm font-medium text-[#4a3728]">Lựa chọn màu nổi bật</label>
                <input id="fund-color" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded border border-stone-300 bg-white p-1" />
              </div>
              <div className="flex justify-end gap-3 border-t border-stone-100 pt-5">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50">Hủy</button>
                <button type="submit" disabled={!sheet} className="rounded bg-[#4a3728] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#33251a] disabled:cursor-not-allowed disabled:opacity-50">Thêm quỹ</button>
              </div>
            </form>
          </div>
        </div>}

      {selectedUnit && <UnitDetailModal buildingCode={BUILDING_CODES[building]} floor={selectedUnit.floor} unit={selectedUnit.unit} apartmentType={selectedUnit.apartmentType} area={selectedUnit.area} direction={selectedUnit.direction} detail={selectedUnit.detail} fundColor={fundColors[selectedUnit.detail.fund]} onClose={() => setSelectedUnit(null)} />}
    </section>;
}