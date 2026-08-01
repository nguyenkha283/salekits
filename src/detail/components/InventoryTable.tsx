import React, { FormEvent, useMemo, useState } from 'react';
import { CrownIcon, HeartIcon, InfoIcon, PlusIcon, XIcon } from 'lucide-react';
import { Role } from './Header';
import { UnitDetailModal } from './UnitDetailModal';
import type { UnitStatus } from './UnitDetailModal';
import {
  PRICE_COLUMNS,
  REAL_TOWERS,
  SHEET_EFFECTIVE_DATE,
  SHEET_NAME,
  SHEET_NOTICE,
  axesOf,
  shortPrice,
  unitAt,
  unitPrice,
  type PriceColumnId,
  type RealUnit } from
'../data/realInventory';

interface Fund {
  id: string;
  name: string;
  color: string;
}

interface InventoryTableProps {
  role: Role;
}

const INITIAL_FUNDS: Fund[] = [
{ id: 'exclusive', name: 'Quỹ độc quyền', color: '#ff0000' },
{ id: 'cross', name: 'Quỹ chéo', color: '#a77b00' }];


const STATUS_STYLES: Record<UnitStatus, {color: string;background: string;}> = {
  'Còn hàng': { color: '#047857', background: '#d1fae5' },
  'Đã lock': { color: 'rgba(245, 187, 39, 1)', background: 'rgba(245, 187, 39, 0.2)' },
  'Đã cọc': { color: 'rgba(129, 55, 4, 1)', background: 'rgba(129, 55, 4, 0.2)' },
  'Đã bán': { color: '#ff0000', background: 'rgba(255, 0, 0, 0.2)' }
};

const STATUS_LEGENDS: Array<{label: UnitStatus;color: string;}> = [
{ label: 'Còn hàng', color: '#047857' },
{ label: 'Đã bán', color: '#ff0000' },
{ label: 'Đã lock', color: 'rgba(245, 187, 39, 1)' },
{ label: 'Đã cọc', color: 'rgba(129, 55, 4, 1)' }];


/**
 * File bảng hàng không có cột quỹ. Tạm suy từ tình trạng để minh hoạ bộ lọc
 * quỹ — cần cột thật hoặc sheet quỹ riêng, xem câu A-01 gửi BA.
 */
function fundOf(unit: RealUnit): 'exclusive' | 'cross' {
  return unit.status === 'Còn hàng' ? 'exclusive' : 'cross';
}

export function InventoryTable({ role }: InventoryTableProps) {
  const [tower, setTower] = useState(REAL_TOWERS[0]);
  const [priceColumn, setPriceColumn] = useState<PriceColumnId>('base-total');
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [funds, setFunds] = useState<Fund[]>(INITIAL_FUNDS);
  const [visibleFunds, setVisibleFunds] = useState<Record<string, boolean>>({
    exclusive: true,
    cross: true
  });
  const [visibleStatuses, setVisibleStatuses] = useState<Record<UnitStatus, boolean>>({
    'Còn hàng': true,
    'Đã lock': true,
    'Đã cọc': true,
    'Đã bán': true
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<RealUnit | null>(null);
  const [sheet, setSheet] = useState('');
  const [color, setColor] = useState('#f5921f');

  const canAddFund = role === 'Quản lý giao dịch';
  /** Chỉ người quản lý mới đổi được cột giá hiển thị. */
  const canChangePrice = role === 'Quản lý giao dịch' || role === 'APM';

  const axes = useMemo(() => axesOf(tower), [tower]);
  const priceIndex = PRICE_COLUMNS.findIndex((column) => column.id === priceColumn);
  const activePriceColumn = PRICE_COLUMNS[priceIndex];

  const fundColors = useMemo(
    () =>
    Object.fromEntries(
      funds.map((fund) => [fund.id, fund.id === 'exclusive' ? '#4a3728' : fund.color])
    ),
    [funds]
  );

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
    setVisibleStatuses((current) => ({ ...current, [status]: !current[status] }));
  }

  function submitFund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sheet) return;
    const id = `${sheet}-${Date.now()}`;
    setFunds((currentFunds) => [...currentFunds, { id, name: sheet, color }]);
    setVisibleFunds((current) => ({ ...current, [id]: true }));
    setSheet('');
    setColor('#f5921f');
    setIsDialogOpen(false);
  }

  return (
    <section className="w-full" aria-labelledby="inventory-heading">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="inventory-heading" className="text-2xl font-bold text-black">Bảng hàng</h2>
        <span className="text-[13px] text-stone-500">
          {SHEET_NAME} · hiệu lực từ {SHEET_EFFECTIVE_DATE}
        </span>
      </div>

      {/* Ghi chú pháp lý — bắt buộc hiển thị kèm bảng hàng */}
      <p className="mt-2 flex gap-2 rounded border border-[#f0dcb6] bg-[#fdf3e2] px-3 py-2 text-[12px] leading-relaxed text-[#92600a]">
        <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" />
        {SHEET_NOTICE}
      </p>

      <div className="mt-5 w-full border border-[#e9e1d5] bg-[#faf7f1] p-4 sm:p-5">
        <p className="text-[13px] font-medium text-[#4a3728]">Chọn bảng hàng:</p>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Chọn tòa nhà">
          {REAL_TOWERS.map((item) =>
          <button
            key={item}
            role="tab"
            aria-selected={tower === item}
            onClick={() => setTower(item)}
            className={`rounded border border-[#e9e1d5] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors ${
            tower === item ? 'bg-[#4a3728]' : 'bg-[#8b7d6d] hover:bg-[#6f6152]'}`
            }>

              Tòa {item}
            </button>
          )}
        </div>

        {/* Bộ chọn cột giá — người quản lý quyết định giá nào hiển thị */}
        <div className="mt-4 border-t border-[#e9e1d5] pt-4">
          <label htmlFor="price-column" className="text-[13px] font-medium text-[#4a3728]">
            Giá hiển thị trên bảng hàng:
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <select
              id="price-column"
              value={priceColumn}
              disabled={!canChangePrice}
              onChange={(event) => setPriceColumn(event.target.value as PriceColumnId)}
              className="h-9 min-w-[280px] rounded border border-[#d9cdb8] bg-white px-2.5 text-[13px] font-medium text-[#4a3728] outline-none focus:border-[#f5921f] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500">

              <optgroup label="Giá tiêu chuẩn">
                {PRICE_COLUMNS.filter((column) => column.group === 'Giá tiêu chuẩn').map((column) =>
                <option key={column.id} value={column.id}>{column.label}</option>
                )}
              </optgroup>
              <optgroup label="Chính sách ổn định lãi suất">
                {PRICE_COLUMNS.filter((column) => column.group !== 'Giá tiêu chuẩn').map((column) =>
                <option key={column.id} value={column.id}>{column.label}</option>
                )}
              </optgroup>
            </select>
            <span className="text-[11.5px] text-[#9c8672]">
              {canChangePrice ?
              'File có 6 cột giá. Lựa chọn này áp dụng cho cả bảng hàng và quỹ căn.' :
              'Chỉ APM và Quản lý giao dịch đổi được cột giá.'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border border-[#e9e1d5] bg-white px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {funds.map((fund) => {
            const isVisible = visibleFunds[fund.id] !== false;
            const isExclusive = fund.id === 'exclusive';
            return (
              <button
                key={fund.id}
                onClick={() => toggleFund(fund.id)}
                aria-pressed={isVisible}
                className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                isVisible ? 'border-[#4a3728] bg-[#f7f2ea] text-[#4a3728]' : 'border-[#e9e1d5] text-[#9c8672]'}`
                }>

                {isExclusive && <CrownIcon className="h-3.5 w-3.5 fill-[#173b7a] text-[#173b7a]" aria-label="Quỹ độc quyền" />}
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: fundColors[fund.id] }} />
                {fund.name}
              </button>);

          })}
          {canAddFund &&
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-1 rounded border border-dashed border-[#c9b795] px-2.5 py-1.5 text-[12px] font-semibold text-[#8a6a3f] transition-colors hover:bg-[#faf6ef]">

              <PlusIcon className="h-3.5 w-3.5" />
              Thêm quỹ
            </button>
          }
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STATUS_LEGENDS.map((legend) =>
          <button
            key={legend.label}
            onClick={() => toggleStatus(legend.label)}
            aria-pressed={visibleStatuses[legend.label]}
            className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-semibold transition-opacity ${
            visibleStatuses[legend.label] ? '' : 'opacity-40'}`
            }>

              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: legend.color }} />
              {legend.label}
            </button>
          )}
          <button
            onClick={() => setIsBasketOpen(true)}
            className="ml-1 inline-flex items-center gap-1.5 rounded bg-[#4a3728] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#33251a]">

            <HeartIcon className="h-3.5 w-3.5" />
            Giỏ của tôi
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden border border-[#e9e1d5] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#faf7f1] px-4 py-[13px] sm:px-8">
          <div>
            <p className="text-[13px] font-semibold text-[#4a3728]">Tòa {tower}</p>
            <p className="mt-0.5 text-[11px] text-[#9c8672]">
              {axes.floors.length} tầng × {axes.columns.length} trục · đang hiển thị {activePriceColumn.short}
            </p>
          </div>
          <span className="shrink-0 rounded bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            Đang mở bán
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="inventory-table w-full table-fixed border-collapse text-center font-serif" aria-label={`Bảng hàng tòa ${tower}`}>
            <colgroup>
              <col className="inventory-side-column" />
              {axes.columns.map((column) => <col key={column} />)}
              <col className="inventory-side-column" />
            </colgroup>
            <thead>
              <tr className="bg-[#827464] text-white">
                <th className="inventory-side-cell">TẦNG/CĂN</th>
                {axes.columns.map((column) => <th key={column} className="inventory-head-cell">{column}</th>)}
                <th className="inventory-side-cell">TẦNG/CĂN</th>
              </tr>
              <tr className="bg-[#dedbcc] text-[#403b35]">
                <th className="inventory-side-cell bg-[#827464] text-white">Số PN</th>
                {axes.columns.map((column) => {
                  const sample = REAL_UNITS_IN(tower, column);
                  return <th key={column} className="inventory-meta-cell">{sample?.bedrooms ?? '—'}</th>;
                })}
                <th className="inventory-side-cell bg-[#827464] text-white">Số PN</th>
              </tr>
              <tr className="bg-[#dedbcc] text-[#403b35]">
                <th className="inventory-side-cell bg-[#827464] text-white">DT TT</th>
                {axes.columns.map((column) => {
                  const sample = REAL_UNITS_IN(tower, column);
                  return <th key={column} className="inventory-meta-cell">{sample ? sample.area.toFixed(1) : '—'}</th>;
                })}
                <th className="inventory-side-cell bg-[#827464] text-white">DT TT</th>
              </tr>
            </thead>
            <tbody>
              {axes.floors.map((floor) =>
              <tr key={floor}>
                  <th className="inventory-floor-cell">{floor}</th>
                  {axes.columns.map((column) => {
                  const unit = unitAt(tower, floor, column);
                  const shouldShow =
                  unit &&
                  visibleFunds[fundOf(unit)] !== false &&
                  visibleStatuses[unit.status] !== false;
                  const style = unit ? STATUS_STYLES[unit.status] : STATUS_STYLES['Còn hàng'];

                  return (
                    <td key={column} className="inventory-unit-cell">
                        {shouldShow && unit &&
                      <button
                        onClick={() => setSelectedUnit(unit)}
                        className="inventory-unit-status-value cursor-pointer transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4a3728]"
                        style={{ backgroundColor: style.background, color: style.color }}
                        aria-label={`Xem chi tiết căn ${unit.code}, ${shortPrice(unit.prices[priceIndex])}, trạng thái ${unit.status}`}>

                            <span className="inventory-unit-price">{shortPrice(unit.prices[priceIndex])}</span>
                            <span className="inventory-unit-status-label">{unit.status}</span>
                            {fundOf(unit) === 'exclusive' &&
                        <CrownIcon className="inventory-unit-crown" aria-label="Quỹ độc quyền" />
                        }
                          </button>
                      }
                      </td>);

                })}
                  <th className="inventory-floor-cell">{floor}</th>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="border-t border-[#e9e1d5] bg-[#faf7f1] px-4 py-2.5 text-[11.5px] text-[#9c8672] sm:px-8">
          Ô trống là căn không thuộc quỹ này. Sheet hiện tại phủ khoảng 20% số ô của lưới.
        </p>
      </div>

      {isBasketOpen &&
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setIsBasketOpen(false)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center" onClick={(event) => event.stopPropagation()}>
            <HeartIcon className="mx-auto h-8 w-8 text-stone-300" />
            <p className="mt-3 text-sm text-stone-600">Giỏ của bạn chưa có căn nào.</p>
            <button onClick={() => setIsBasketOpen(false)} className="mt-4 rounded bg-[#4a3728] px-4 py-2 text-sm font-semibold text-white">
              Đóng
            </button>
          </div>
        </div>
      }

      {isDialogOpen &&
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-[#4a3728]">Thêm quỹ căn</h3>
              <button onClick={() => setIsDialogOpen(false)} aria-label="Đóng" className="text-stone-400 hover:text-stone-700">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitFund} className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-[#4a3728]">Chọn sheet quỹ</span>
                <select value={sheet} onChange={(event) => setSheet(event.target.value)} className="h-10 w-full rounded border border-stone-300 px-2.5 text-sm">
                  <option value="">— Chọn sheet —</option>
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
        </div>
      }

      {selectedUnit &&
      <UnitDetailModal
        buildingCode={selectedUnit.tower}
        floor={selectedUnit.floor}
        unit={selectedUnit.unit}
        apartmentCode={selectedUnit.code}
        apartmentType={selectedUnit.bedrooms}
        area={selectedUnit.area.toFixed(2)}
        direction="Chưa có dữ liệu"
        handover={selectedUnit.handover}
        priceLabel={activePriceColumn.label}
        unitPriceText={unitPrice(selectedUnit.prices[priceIndex], selectedUnit.area)}
        detail={{
          fund: fundOf(selectedUnit),
          price: shortPrice(selectedUnit.prices[priceIndex]),
          status: selectedUnit.status
        }}
        fundColor={fundColors[fundOf(selectedUnit)]}
        onClose={() => setSelectedUnit(null)} />

      }
    </section>);

}

/** Lấy một căn bất kỳ trong trục để hiển thị số PN và diện tích ở tiêu đề cột. */
function REAL_UNITS_IN(tower: string, column: string): RealUnit | undefined {
  const axes = axesOf(tower);
  for (const floor of axes.floors) {
    const unit = unitAt(tower, floor, column);
    if (unit) return unit;
  }
  return undefined;
}
