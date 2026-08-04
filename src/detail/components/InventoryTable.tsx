import React, { useEffect, useMemo, useState } from 'react';
import { CrownIcon, HeartIcon, InfoIcon } from 'lucide-react';
import { Role } from './Header';
import { UnitDetailModal } from './UnitDetailModal';
import type { UnitStatus } from './UnitDetailModal';
import {
  shortPrice,
  unitPrice,
  type FundGroup,
  type InventoryData,
  type ParsedUnit } from
'../inventoryParser';
import { InventoryGridEditor } from './InventoryGridEditor';
import {
  absorbMissing,
  buildGrid,
  reconcileGrid,
  type GridModel } from
'../gridModel';

interface InventoryTableProps {
  role: Role;
  /** Dữ liệu bóc từ file bảng hàng thật đã nhập. */
  data: InventoryData;
  /** Ghi chú pháp lý chỉ hiện ở trang xem trước và trang công khai. */
  showNotice?: boolean;
  /**
   * Lưới đã soạn, giữ qua các lần đồng bộ. Không truyền thì dựng mới từ dữ
   * liệu — dùng cho trang công khai.
   */
  grids?: Record<string, GridModel>;
  /** Template đọc từ sheet Tòa, ưu tiên hơn template tự dựng. */
  templates?: Record<string, GridModel>;
  onGridsChange?: (grids: Record<string, GridModel>) => void;
}

const STATUS_LEGENDS: Array<{label: UnitStatus;color: string;}> = [
{ label: 'Còn hàng', color: '#047857' },
{ label: 'Đã bán', color: '#ff0000' },
{ label: 'Đã lock', color: 'rgba(245, 187, 39, 1)' },
{ label: 'Đã cọc', color: 'rgba(129, 55, 4, 1)' }];


export function InventoryTable({
  role,
  data,
  showNotice = false,
  grids: externalGrids,
  templates,
  onGridsChange
}: InventoryTableProps) {
  const [tower, setTower] = useState(data.towers[0] ?? '');
  /** Cột giá đã chọn ở bước nhập file. */
  const priceIndex = data.priceIndex;
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
  const canEditGrid = role === 'Quản lý giao dịch' || role === 'APM';

  /**
   * Lưới của từng tòa. Đồng bộ lại CHỈ thay dữ liệu — cấu trúc lưới đã soạn
   * (gộp ô, khu vực chung, phân khối) được giữ nguyên.
   */
  const [localGrids, setLocalGrids] = useState<Record<string, GridModel>>({});
  const grids = externalGrids ?? localGrids;
  const grid = useMemo(
    () => grids[tower] ?? templates?.[tower] ?? buildGrid(data, tower),
    [grids, templates, tower, data]
  );

  function updateGrid(next: GridModel) {
    const merged = { ...grids, [tower]: next };
    if (onGridsChange) onGridsChange(merged);else
    setLocalGrids(merged);
  }

  /** Căn nằm ngoài lưới sau khi đồng bộ — phải báo, không im lặng bỏ qua. */
  const reconcile = useMemo(
    () => reconcileGrid(grid, data, tower),
    [grid, data, tower]
  );
  const activePriceColumn = data.priceFields[priceIndex];

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

      {/* Ghi chú pháp lý — chỉ hiện ở trang xem trước và trang công khai */}
      {showNotice &&
      <p className="mt-2 flex gap-2 rounded border border-[#f0dcb6] bg-[#fdf3e2] px-3 py-2 text-[12px] leading-relaxed text-[#92600a]">
          <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" />
          Thông tin diện tích và giá bán là tạm tính để tham khảo. Thông tin chính
          thức được công bố tại thời điểm ký Hợp đồng mua bán.
        </p>
      }

      <TransientWarnings warnings={data.warnings} />

      {canEditGrid && reconcile.unmatchedCount > 0 &&
      <div className="mt-3 rounded border border-[#f0dcb6] bg-[#fdf3e2] px-3 py-2.5">
          <p className="flex gap-2 text-[12.5px] font-semibold text-[#92600a]">
            <InfoIcon className="mt-px h-4 w-4 shrink-0" />
            {reconcile.unmatchedCount} căn chưa hiển thị được trên lưới
          </p>
          <p className="mt-1 pl-6 text-[11.5px] leading-relaxed text-[#92600a]">
            Đồng bộ chỉ thay dữ liệu, giữ nguyên cấu trúc lưới bạn đã soạn. Dữ
            liệu mới có
            {reconcile.missingFloors.length > 0 &&
            <> tầng <b>{reconcile.missingFloors.join(', ')}</b></>
            }
            {reconcile.missingFloors.length > 0 && reconcile.missingColumns.length > 0 && ' và'}
            {reconcile.missingColumns.length > 0 &&
            <> trục <b>{reconcile.missingColumns.join(', ')}</b></>
            }
            {' '}chưa có trên lưới.
          </p>
          <button
          type="button"
          onClick={() =>
          updateGrid(
            absorbMissing(grid, reconcile.missingFloors, reconcile.missingColumns)
          )
          }
          className="ml-6 mt-2 rounded border border-[#e0d2bd] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#8a6a3f] transition-colors hover:bg-[#faf6ef]">

            Bổ sung vào lưới
          </button>
        </div>
      }

      <div className="mt-4 w-full border border-[#e9e1d5] bg-[#faf7f1] p-3 sm:p-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chọn tòa nhà">
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
            <p className="text-[13px] font-semibold text-[#4a3728]">{tower}</p>
            <p className="mt-0.5 text-[11px] text-[#9c8672]">
              {grid.blocks.length} khối · {grid.blocks.reduce((total, block) => total + block.floors.length, 0)} tầng
              · đang hiển thị {activePriceColumn?.label ?? 'Giá'}
            </p>
          </div>
          <span className="shrink-0 rounded bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            Đang mở bán
          </span>
        </div>

        <div className="p-3 sm:p-4">
          <InventoryGridEditor
            model={grid}
            onChange={updateGrid}
            editable={canEditGrid && showNotice === false}
            unitAt={unitAt}
            renderPrice={(unit) => shortPrice(unit.prices[priceIndex])}
            isVisible={(unit) =>
            passesFundFilter(unit) && visibleStatuses[unit.status] !== false
            }
            onSelectUnit={setSelectedUnit} />

        </div>

        <p className="border-t border-[#e9e1d5] bg-[#faf7f1] px-4 py-2.5 text-[11.5px] text-[#9c8672] sm:px-8">
          Ô trống là căn không có trong file. Dòng tiêu đề nào file không có dữ
          liệu thì để trống — bấm vào để tự điền.
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




/* ═══════════════════════════════════════════════════════════════
   Cảnh báo khi bóc tách — tự ẩn sau 3 giây
   ═══════════════════════════════════════════════════════════════ */

function TransientWarnings({ warnings }: {warnings: string[];}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!warnings.length) return;
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, [warnings]);

  if (!warnings.length || !visible) return null;

  return (
    <ul className="mt-2 space-y-1 rounded border border-[#f0dcb6] bg-[#fffaf0] px-3 py-2 text-[12px] text-[#92600a] transition-opacity">
      {warnings.map((warning) => <li key={warning}>• {warning}</li>)}
    </ul>);

}
