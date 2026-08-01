import React, { useMemo, useState } from 'react';
import { CrownIcon, HeartIcon, InfoIcon } from 'lucide-react';
import { Role } from './Header';
import { UnitDetailModal } from './UnitDetailModal';
import type { UnitStatus } from './UnitDetailModal';
import {
  axesOf,
  shortPrice,
  unitPrice,
  type FundGroup,
  type InventoryData,
  type ParsedUnit } from
'../inventoryParser';

interface InventoryTableProps {
  role: Role;
  /** Dữ liệu bóc từ file bảng hàng thật đã nhập. */
  data: InventoryData;
}

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


export function InventoryTable({ role, data }: InventoryTableProps) {
  const [tower, setTower] = useState(data.towers[0] ?? '');
  /** Mặc định chọn cột giá cuối của nhóm đầu — thường là tổng giá trị HĐMB. */
  const [priceIndex, setPriceIndex] = useState(() => {
    const firstGroup = data.priceFields[0]?.group;
    const lastOfFirstGroup = data.priceFields.
    map((field, index) => ({ field, index })).
    filter((entry) => entry.field.group === firstGroup).
    pop();
    return lastOfFirstGroup?.index ?? 0;
  });
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const funds: FundGroup[] = data.funds;
  const [visibleFunds, setVisibleFunds] = useState<Record<string, boolean>>({});
  const [visibleStatuses, setVisibleStatuses] = useState<Record<UnitStatus, boolean>>({
    'Còn hàng': true,
    'Đã lock': true,
    'Đã cọc': true,
    'Đã bán': true
  });
  const [selectedUnit, setSelectedUnit] = useState<ParsedUnit | null>(null);

  /** Chỉ người quản lý mới đổi được cột giá hiển thị. */
  const canChangePrice = role === 'Quản lý giao dịch' || role === 'APM';

  const axes = useMemo(() => axesOf(data.units, tower), [data.units, tower]);
  const activePriceColumn = data.priceFields[priceIndex];
  const priceGroups = useMemo(
    () => [...new Set(data.priceFields.map((field) => field.group))],
    [data.priceFields]
  );

  const fundColors = useMemo(
    () => Object.fromEntries(funds.map((fund) => [fund.id, fund.color])),
    [funds]
  );

  /** Tra nhanh: mã căn → danh sách quỹ chứa nó. */
  const fundsByCode = useMemo(() => {
    const map = new Map<string, string[]>();
    funds.forEach((fund) => {
      fund.codes.forEach((code) => {
        map.set(code, [...(map.get(code) ?? []), fund.id]);
      });
    });
    return map;
  }, [funds]);

  function fundsOf(unit: ParsedUnit): string[] {
    return fundsByCode.get(unit.code) ?? [];
  }

  /** Không khai báo quỹ nào thì mọi căn đều hiện. */
  function passesFundFilter(unit: ParsedUnit): boolean {
    if (!funds.length) return true;
    const owned = fundsOf(unit);
    if (!owned.length) return true;
    return owned.some((id) => visibleFunds[id] !== false);
  }

  /** Tra căn theo vị trí trên lưới của tòa đang chọn. */
  function unitAt(floor: string, column: string): ParsedUnit | undefined {
    return data.units.find(
      (item) => item.tower === tower && item.floor === floor && item.unit === column
    );
  }

  /** Một căn bất kỳ trong trục — dùng cho dòng tiêu đề Số PN và Diện tích. */
  function sampleOf(column: string): ParsedUnit | undefined {
    return data.units.find((item) => item.tower === tower && item.unit === column);
  }

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


  return (
    <section className="w-full" aria-labelledby="inventory-heading">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="inventory-heading" className="text-2xl font-bold text-black">Bảng hàng</h2>
        <span className="text-[13px] text-stone-500">
          {data.sheetNames.join(' · ')} — {data.units.length} căn
        </span>
      </div>

      {/* Ghi chú pháp lý — bắt buộc hiển thị kèm bảng hàng */}
      <p className="mt-2 flex gap-2 rounded border border-[#f0dcb6] bg-[#fdf3e2] px-3 py-2 text-[12px] leading-relaxed text-[#92600a]">
        <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" />
        Thông tin diện tích và giá bán là tạm tính để tham khảo. Thông tin chính
        thức được công bố tại thời điểm ký Hợp đồng mua bán.
      </p>

      {data.warnings.length > 0 &&
      <ul className="mt-2 space-y-1 rounded border border-[#f0dcb6] bg-[#fffaf0] px-3 py-2 text-[12px] text-[#92600a]">
          {data.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
        </ul>
      }

      <div className="mt-5 w-full border border-[#e9e1d5] bg-[#faf7f1] p-4 sm:p-5">
        <p className="text-[13px] font-medium text-[#4a3728]">Chọn bảng hàng:</p>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Chọn tòa nhà">
          {data.towers.map((item) =>
          <button
            key={item}
            role="tab"
            aria-selected={tower === item}
            onClick={() => setTower(item)}
            className={`rounded border border-[#e9e1d5] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors ${
            tower === item ? 'bg-[#4a3728]' : 'bg-[#8b7d6d] hover:bg-[#6f6152]'}`
            }>

              {item}
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
              value={priceIndex}
              disabled={!canChangePrice}
              onChange={(event) => setPriceIndex(Number(event.target.value))}
              className="h-9 min-w-[280px] max-w-full rounded border border-[#d9cdb8] bg-white px-2.5 text-[13px] font-medium text-[#4a3728] outline-none focus:border-[#f5921f] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500">

              {priceGroups.map((group) =>
              <optgroup key={group} label={group}>
                  {data.priceFields.
                map((field, index) => ({ field, index })).
                filter((entry) => entry.field.group === group).
                map((entry) =>
                <option key={entry.index} value={entry.index}>{entry.field.label}</option>
                )}
                </optgroup>
              )}
            </select>
            <span className="text-[11.5px] text-[#9c8672]">
              {canChangePrice ?
              `File có ${data.priceFields.length} cột giá. Lựa chọn này áp dụng cho cả bảng hàng và quỹ căn.` :
              'Chỉ APM và Quản lý giao dịch đổi được cột giá.'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border border-[#e9e1d5] bg-white px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {!funds.length &&
          <span className="text-[12px] text-[#9c8672]">
              File chưa có sheet quỹ nào
            </span>
          }
          {funds.map((fund) => {
            const isVisible = visibleFunds[fund.id] !== false;
            return (
              <button
                key={fund.id}
                onClick={() => toggleFund(fund.id)}
                aria-pressed={isVisible}
                className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                isVisible ? 'border-[#4a3728] bg-[#f7f2ea] text-[#4a3728]' : 'border-[#e9e1d5] text-[#9c8672]'}`
                }>

                <CrownIcon className="h-3.5 w-3.5" style={{ color: fundColors[fund.id] }} aria-hidden="true" />
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: fundColors[fund.id] }} />
                {fund.name}
                <span className="font-mono text-[10.5px] opacity-70">{fund.codes.length}</span>
              </button>);

          })}
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
              {axes.floors.length} tầng × {axes.columns.length} trục · đang hiển thị {activePriceColumn?.label ?? 'Giá'}
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
                  const sample = sampleOf(column);
                  return <th key={column} className="inventory-meta-cell">{sample?.bedrooms || '—'}</th>;
                })}
                <th className="inventory-side-cell bg-[#827464] text-white">Số PN</th>
              </tr>
              <tr className="bg-[#dedbcc] text-[#403b35]">
                <th className="inventory-side-cell bg-[#827464] text-white">DT TT</th>
                {axes.columns.map((column) => {
                  const sample = sampleOf(column);
                  return <th key={column} className="inventory-meta-cell">{sample?.area ? sample.area.toFixed(1) : '—'}</th>;
                })}
                <th className="inventory-side-cell bg-[#827464] text-white">DT TT</th>
              </tr>
            </thead>
            <tbody>
              {axes.floors.map((floor) =>
              <tr key={floor}>
                  <th className="inventory-floor-cell">{floor}</th>
                  {axes.columns.map((column) => {
                  const unit = unitAt(floor, column);
                  const shouldShow =
                  unit && passesFundFilter(unit) && visibleStatuses[unit.status] !== false;
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
                            {fundsOf(unit).length > 0 &&
                        <CrownIcon
                          className="inventory-unit-crown"
                          style={{ color: fundColors[fundsOf(unit)[0]] }}
                          aria-label={funds.find((fund) => fund.id === fundsOf(unit)[0])?.name} />

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

      {selectedUnit &&
      <UnitDetailModal
        buildingCode={selectedUnit.tower}
        floor={selectedUnit.floor}
        unit={selectedUnit.unit}
        apartmentCode={selectedUnit.code}
        apartmentType={selectedUnit.bedrooms || 'Chưa có dữ liệu'}
        area={selectedUnit.area ? selectedUnit.area.toFixed(2) : '—'}
        direction={selectedUnit.extras['Hướng ban công'] ?? 'File chưa có'}
        handover={selectedUnit.handover}
        priceLabel={activePriceColumn?.label}
        unitPriceText={unitPrice(selectedUnit.prices[priceIndex], selectedUnit.area)}
        extras={selectedUnit.extras}
        fundNames={fundsOf(selectedUnit).map(
          (id) => funds.find((fund) => fund.id === id)?.name ?? id
        )}
        detail={{
          price: shortPrice(selectedUnit.prices[priceIndex]),
          status: selectedUnit.status
        }}
        fundColor={fundColors[fundsOf(selectedUnit)[0]] ?? '#4a3728'}
        onClose={() => setSelectedUnit(null)} />

      }
    </section>);

}


