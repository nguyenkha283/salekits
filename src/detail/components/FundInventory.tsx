import React, { useEffect, useMemo, useState } from 'react';
import { CheckIcon, ChevronDownIcon, CrownIcon, InfoIcon, XIcon } from 'lucide-react';
import {
  isExclusiveFund,
  fullPrice,
  shortPrice,
  type InventoryData,
  type ParsedUnit,
  type UnitStatusValue } from
'../inventoryParser';

/* ═══════════════════════════════════════════════════════════════
   Khoảng giá và khoảng diện tích
   ═══════════════════════════════════════════════════════════════ */

interface Range {
  id: string;
  label: string;
  min: number;
  max: number;
}

/** Dưới 5 tỷ, từng bậc 5 tỷ tới 50 tỷ, rồi trên 50 tỷ. */
const PRICE_RANGES: Range[] = [
{ id: 'p-0', label: 'Dưới 5 tỷ', min: 0, max: 5e9 },
...Array.from({ length: 9 }, (_, index) => {
  const from = (index + 1) * 5;
  return {
    id: `p-${from}`,
    label: `${from} – ${from + 5} tỷ`,
    min: from * 1e9,
    max: (from + 5) * 1e9
  };
}),
{ id: 'p-50', label: 'Trên 50 tỷ', min: 50e9, max: Number.POSITIVE_INFINITY }];


/** Dưới 50 m², từng bậc 50 m² tới 300 m², rồi trên 300 m². */
const AREA_RANGES: Range[] = [
{ id: 'a-0', label: 'Dưới 50 m²', min: 0, max: 50 },
...Array.from({ length: 5 }, (_, index) => {
  const from = (index + 1) * 50;
  return {
    id: `a-${from}`,
    label: `${from} – ${from + 50} m²`,
    min: from,
    max: from + 50
  };
}),
{ id: 'a-300', label: 'Trên 300 m²', min: 300, max: Number.POSITIVE_INFINITY }];


const STATUS_OPTIONS: UnitStatusValue[] = ['Còn hàng', 'Đã lock', 'Đã cọc', 'Đã bán'];

const STATUS_STYLES: Record<UnitStatusValue, string> = {
  'Còn hàng': 'bg-[#d1fae5] text-[#047857]',
  'Đã lock': 'bg-amber-100 text-amber-700',
  'Đã cọc': 'bg-orange-100 text-orange-800',
  'Đã bán': 'bg-red-100 text-red-700'
};

/* ═══════════════════════════════════════════════════════════════
   Bộ lọc
   ═══════════════════════════════════════════════════════════════ */

type FilterKey =
'price' | 'bedrooms' | 'area' | 'floor' | 'unit' | 'tower' | 'status';

type Filters = Record<FilterKey, string[]>;

const EMPTY_FILTERS: Filters = {
  price: [],
  bedrooms: [],
  area: [],
  floor: [],
  unit: [],
  tower: [],
  status: []
};

/** Tìm giá trị nằm trong khoảng nào. */
function inRanges(value: number | null, ranges: Range[], picked: string[]): boolean {
  if (!picked.length) return true;
  if (value === null) return false;
  return picked.some((id) => {
    const range = ranges.find((item) => item.id === id);
    return range ? value >= range.min && value < range.max : false;
  });
}

/** Diện tích tim tường nằm ở cột phụ, tên cột đổi theo từng chủ đầu tư. */
function timTuong(unit: ParsedUnit): string {
  const key = Object.keys(unit.extras).find((name) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('tim tuong')
  );
  return key ? unit.extras[key] : '';
}

function extraByKeyword(unit: ParsedUnit, keyword: string): string {
  const key = Object.keys(unit.extras).find((name) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(keyword)
  );
  return key ? unit.extras[key] : '';
}

interface FundInventoryProps {
  data: InventoryData;
  /** Bộ cột đổi theo loại hình: thấp tầng dùng DT đất và DT xây dựng. */
  layout?: 'cao-tang' | 'thap-tang';
  /** Ghi chú pháp lý chỉ hiện ở trang xem trước và trang công khai. */
  showNotice?: boolean;
}

export function FundInventory({
  data,
  layout = 'cao-tang',
  showNotice = false
}: FundInventoryProps) {
  // Loại hình do người dùng khai ở màn Khởi tạo quyết định bộ cột — đây là
  // nguồn chân lý duy nhất, không suy từ bảng hàng được tải lên.
  const isLowRise = layout === 'thap-tang';
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  /**
   * Bộ lọc đang mở. Phải ghi cả NƠI mở, vì cùng một tiêu chí xuất hiện ở hai
   * chỗ — dải nút bên trên bảng và nút cạnh tên cột. Chỉ lưu tên tiêu chí thì
   * mở một cái sẽ bung cả hai.
   */
  const [openFilter, setOpenFilter] = useState<{
    key: FilterKey;
    source: 'bar' | 'column';
  } | null>(null);

  function toggleOpen(key: FilterKey, source: 'bar' | 'column') {
    setOpenFilter((current) =>
    current && current.key === key && current.source === source ?
    null :
    { key, source }
    );
  }

  const isOpen = (key: FilterKey, source: 'bar' | 'column') =>
  openFilter?.key === key && openFilter.source === source;

  // Bấm ra ngoài hoặc nhấn Escape thì đóng.
  useEffect(() => {
    if (!openFilter) return;
    const close = () => setOpenFilter(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenFilter(null);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [openFilter]);

  const priceIndex = data.priceIndex;
  const activePriceColumn = data.priceFields[priceIndex];
  // Cột đơn giá (đồng/m²) nhận diện qua nhãn, để hiển thị riêng ở bảng thấp tầng.
  const unitPriceIndex = data.priceFields.findIndex((field) =>
  field.label.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  toLowerCase().
  includes('don gia')
  );

  /** Danh sách lựa chọn sinh từ chính dữ liệu — không thừa, không thiếu. */
  const options = useMemo(() => {
    const distinct = (pick: (unit: ParsedUnit) => string) =>
    [...new Set(data.units.map(pick).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'vi', { numeric: true })
    );

    return {
      bedrooms: distinct((unit) => unit.bedrooms),
      floor: distinct((unit) => unit.floor),
      unit: distinct((unit) => unit.unit),
      tower: distinct((unit) => unit.tower)
    };
  }, [data.units]);

  /** Tra nhanh mã căn → tên các quỹ chứa nó. */
  const fundsByCode = useMemo(() => {
    const map = new Map<string, string[]>();
    data.funds.forEach((fund) => {
      fund.codes.forEach((code) => {
        map.set(code, [...(map.get(code) ?? []), fund.name]);
      });
    });
    return map;
  }, [data.funds]);

  const rows = useMemo(
    () =>
    data.units.filter(
      (unit) =>
      inRanges(unit.prices[priceIndex] ?? null, PRICE_RANGES, filters.price) &&
      inRanges(unit.area, AREA_RANGES, filters.area) && (
      !filters.bedrooms.length || filters.bedrooms.includes(unit.bedrooms)) && (
      !filters.floor.length || filters.floor.includes(unit.floor)) && (
      !filters.unit.length || filters.unit.includes(unit.unit)) && (
      !filters.tower.length || filters.tower.includes(unit.tower)) && (
      !filters.status.length || filters.status.includes(unit.status))
    ),
    [data.units, filters, priceIndex]
  );

  const activeCount = (Object.keys(filters) as FilterKey[]).reduce(
    (total, key) => total + filters[key].length,
    0
  );

  function toggle(key: FilterKey, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: current[key].includes(value) ?
      current[key].filter((item) => item !== value) :
      [...current[key], value]
    }));
  }

  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.code));

  const COLUMNS: Array<{
    key: FilterKey | null;
    label: string;
    /** Đơn vị ghi nhỏ dưới tên cột. */
    unit?: string;
    align: 'left' | 'center';
    width: number;
    options?: Array<{id: string;label: string;}>;
  }> = isLowRise ?
  [
  { key: null, label: 'Mã sản phẩm', align: 'left', width: 150 },
  {
    key: 'bedrooms',
    label: 'Loại hình',
    align: 'center',
    width: 116,
    options: options.bedrooms.map((value) => ({ id: value, label: value }))
  },
  { key: null, label: 'Loại lô', align: 'center', width: 110 },
  { key: null, label: 'DT đất', unit: 'm²', align: 'center', width: 92 },
  { key: null, label: 'DT xây dựng', unit: 'm²', align: 'center', width: 104 },
  { key: null, label: 'Đơn giá', unit: 'đ/m²', align: 'center', width: 120 },
  {
    key: 'price',
    label: 'Giá bán',
    align: 'center',
    width: 130,
    options: PRICE_RANGES.map((range) => ({ id: range.id, label: range.label }))
  },
  { key: null, label: 'Phân khu', align: 'center', width: 110 },
  {
    key: 'status',
    label: 'Trạng thái',
    align: 'center',
    width: 106,
    options: STATUS_OPTIONS.map((value) => ({ id: value, label: value }))
  }] :

  [
  { key: null, label: 'Mã căn', align: 'left', width: 150 },
  {
    key: 'price',
    label: 'Giá niêm yết',
    align: 'center',
    width: 120,
    options: PRICE_RANGES.map((range) => ({ id: range.id, label: range.label }))
  },
  {
    key: 'bedrooms',
    label: 'Loại hình',
    align: 'center',
    width: 96,
    options: options.bedrooms.map((value) => ({ id: value, label: value }))
  },
  { key: null, label: 'Hướng', align: 'center', width: 80 },
  { key: null, label: 'View', align: 'center', width: 150 },
  { key: null, label: 'DT tim tường', unit: 'm²', align: 'center', width: 92 },
  {
    key: 'area',
    label: 'DT thông thủy',
    unit: 'm²',
    align: 'center',
    width: 98,
    options: AREA_RANGES.map((range) => ({ id: range.id, label: range.label }))
  },
  {
    key: 'floor',
    label: 'Tầng',
    align: 'center',
    width: 68,
    options: options.floor.map((value) => ({ id: value, label: value }))
  },
  {
    key: 'unit',
    label: 'Trục căn',
    align: 'center',
    width: 78,
    options: options.unit.map((value) => ({ id: value, label: value }))
  },
  {
    key: 'tower',
    label: 'Tòa nhà',
    align: 'left',
    width: 130,
    options: options.tower.map((value) => ({ id: value, label: value }))
  },
  {
    key: 'status',
    label: 'Tình trạng',
    align: 'center',
    width: 106,
    options: STATUS_OPTIONS.map((value) => ({ id: value, label: value }))
  }];

  const totalWidth = COLUMNS.reduce((sum, column) => sum + column.width, 44);


  return (
    <section className="w-full font-sans" aria-labelledby="fund-heading">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="fund-heading" className="text-2xl font-bold text-black">Quỹ căn</h2>
        <span className="text-[13px] text-stone-500">
          {data.sheetNames.join(' · ')} — {data.units.length} căn
        </span>
      </div>

      {showNotice &&
      <p className="mt-2 flex gap-2 rounded border border-[#f0dcb6] bg-[#fdf3e2] px-3 py-2 text-[12px] leading-relaxed text-[#92600a]">
          <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" />
          Thông tin diện tích và giá bán là tạm tính để tham khảo. Thông tin chính
          thức được công bố tại thời điểm ký Hợp đồng mua bán.
        </p>
      }

      {/* Loại giá đang hiển thị — đặt ngay trên bảng cho dễ thấy */}
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-[#d9e6dc] bg-[#eaf5ec] px-3 py-2">
        <span className="text-[12px] text-[#2c6e3f]">Giá niêm yết đang hiển thị theo</span>
        <span className="rounded bg-white px-2 py-0.5 text-[12.5px] font-bold text-[#14532d] shadow-sm">
          {activePriceColumn?.label ?? 'Giá'}
        </span>
        {activePriceColumn?.group &&
        <span className="text-[11.5px] text-[#3f7a55]">({activePriceColumn.group})</span>
        }
      </div>

      {/* Bộ lọc — số kết quả trước, điều khiển sau, điều kiện đang áp cuối */}
      <div className="mt-3 overflow-hidden rounded-lg border border-[#e9e1d5]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[#faf7f1] px-3 py-2.5">
          <p className="flex shrink-0 items-baseline gap-1.5">
            <span className="text-[19px] font-bold tabular-nums text-[#4a3728]">
              {rows.length}
            </span>
            <span className="text-[12px] text-[#9c8672]">
              / {data.units.length} căn
            </span>
          </p>

          <span className="h-6 w-px shrink-0 bg-[#e0d2bd]" />

          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {COLUMNS.map((column) => {
              const key = column.key;
              if (!key || !column.options) return null;
              return (
                <FilterButton
                  key={key}
                  label={column.label}
                  picked={filters[key]}
                  options={column.options}
                  open={isOpen(key, 'bar')}
                  onToggleOpen={() => toggleOpen(key, 'bar')}
                  onPick={(value) => toggle(key, value)}
                  onClear={() => setFilters((current) => ({ ...current, [key]: [] }))} />);

            })}
          </div>

          {selectedIds.length > 0 &&
          <span className="shrink-0 rounded bg-[#fdf3e2] px-2 py-1 text-[11.5px] font-semibold text-[#8a5a12]">
              Đã chọn {selectedIds.length}
            </span>
          }
        </div>

        {activeCount > 0 &&
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[#e9e1d5] bg-white px-3 py-2">
            <span className="mr-1 text-[11.5px] font-semibold uppercase tracking-wide text-[#9c8672]">
              Đang lọc
            </span>
            {(Object.keys(filters) as FilterKey[]).flatMap((key) =>
          filters[key].map((value) => {
            const column = COLUMNS.find((item) => item.key === key);
            const option = column?.options?.find((item) => item.id === value);
            return (
              <button
                key={`${key}-${value}`}
                type="button"
                onClick={() => toggle(key, value)}
                className="inline-flex items-center gap-1 rounded border border-[#f0d9b8] bg-[#fdf3e2] py-0.5 pl-2 pr-1 text-[11.5px] font-medium text-[#8a5a12] transition-colors hover:bg-[#fbe9cf]">

                    <span className="text-[#b08e5c]">{column?.label}:</span>
                    {option?.label ?? value}
                    <XIcon className="h-3 w-3 opacity-60" />
                  </button>);

          })
          )}
            <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="ml-auto text-[11.5px] font-semibold text-[#992d22] hover:underline">

              Xóa tất cả
            </button>
          </div>
        }
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-[#e9e1d5] bg-white">
        <table
          className="w-full border-collapse text-left text-[13px]"
          style={{ minWidth: totalWidth }}>

          <colgroup>
            <col style={{ width: 44 }} />
            {COLUMNS.map((column) =>
            <col key={column.label} style={{ width: column.width }} />
            )}
          </colgroup>

          <thead>
            <tr className="bg-[#827464] text-white">
              <th className="border-r border-white/20 px-3 py-2">
                <button
                  onClick={() => setSelectedIds(allSelected ? [] : rows.map((row) => row.code))}
                  aria-label={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  className={`grid h-4 w-4 place-items-center rounded border border-white/60 ${
                  allSelected ? 'bg-white' : ''}`
                  }>

                  {allSelected && <CheckIcon className="h-3 w-3 text-[#4a3728]" />}
                </button>
              </th>
              {COLUMNS.map((column, index) =>
              <th
                key={column.label}
                className={`px-2 py-2 font-semibold ${
                index < COLUMNS.length - 1 ? 'border-r border-white/20' : ''} ${
                column.align === 'center' ? 'text-center' : 'text-left'}`
                }>

                  <span
                  className={`inline-flex items-center gap-1 ${
                  column.align === 'center' ? 'justify-center' : ''}`
                  }>

                    <span className="leading-tight">
                      {column.label}
                      {column.unit &&
                    <span className="ml-1 font-normal text-white/60">({column.unit})</span>
                    }
                    </span>
                    {column.key && column.options &&
                  <ColumnFilter
                    label={column.label}
                    picked={filters[column.key]}
                    options={column.options}
                    open={isOpen(column.key, 'column')}
                    onToggleOpen={() => toggleOpen(column.key as FilterKey, 'column')}
                    onPick={(value) => toggle(column.key as FilterKey, value)}
                    onClear={() =>
                    setFilters((current) => ({ ...current, [column.key as FilterKey]: [] }))
                    } />

                  }
                  </span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const isSelected = selectedIds.includes(row.code);
              const funds = fundsByCode.get(row.code) ?? [];
              const crown = funds.some(isExclusiveFund);

              const fundLabel = row.fundLabel || funds[0] || '';
              const codeCell =
              <span key="code" className="inline-flex flex-col items-start gap-0.5">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#4a3728]">
                    {row.code}
                    {crown &&
                  <CrownIcon
                    className="h-3 w-3 shrink-0 fill-[#173b7a] text-[#173b7a]"
                    aria-label="Quỹ độc quyền" />

                  }
                  </span>
                  {fundLabel &&
                <span className="text-[10.5px] font-medium text-stone-500">
                    {fundLabel}
                  </span>
                }
                </span>;

              const priceCell =
              <span key="price" className="font-semibold tabular-nums">
                  {shortPrice(row.prices[priceIndex])}
                </span>;

              const statusCell =
              <span
                key="status"
                className={`inline-block rounded px-2 py-0.5 text-[11.5px] font-semibold ${STATUS_STYLES[row.status]}`}>

                  {row.status}
                </span>;

              // Đơn giá là cột giá có nhãn "đơn giá"; không có thì để trống.
              const unitPriceValue =
              unitPriceIndex >= 0 ? row.prices[unitPriceIndex] : null;

              const cells = isLowRise ?
              [
              codeCell,
              row.bedrooms || '—',
              row.lotType || '—',
              <span key="land" className="tabular-nums">{row.landArea?.toFixed(1) ?? '—'}</span>,
              <span key="build" className="tabular-nums">{row.buildArea?.toFixed(1) ?? '—'}</span>,
              <span key="unit-price" className="tabular-nums text-stone-600">
                  {unitPriceValue ? fullPrice(unitPriceValue) : '—'}
                </span>,
              priceCell,
              row.subdivision || '—',
              statusCell] :

              [
              codeCell,
              priceCell,
              row.bedrooms || '—',
              extraByKeyword(row, 'huong') || '—',
              <span key="view" className="block truncate" title={extraByKeyword(row, 'view')}>
                  {extraByKeyword(row, 'view') || '—'}
                </span>,
              <span key="tim" className="tabular-nums">{timTuong(row) || '—'}</span>,
              <span key="tt" className="tabular-nums">{row.area?.toFixed(1) ?? '—'}</span>,
              <span key="floor" className="tabular-nums">{row.floor || '—'}</span>,
              <span key="unit" className="tabular-nums">{row.unit || '—'}</span>,
              row.tower || '—',
              statusCell];


              return (
                <tr
                  key={row.code}
                  className={`border-t border-[#f0eae0] transition-colors ${
                  isSelected ? 'bg-[#fdf3e2]' : 'hover:bg-[#faf7f1]'}`
                  }>

                  <td className="border-r border-[#f2ece2] px-3 py-1.5">
                    <button
                      onClick={() =>
                      setSelectedIds((current) =>
                      current.includes(row.code) ?
                      current.filter((item) => item !== row.code) :
                      [...current, row.code]
                      )
                      }
                      aria-label={`Chọn căn ${row.code}`}
                      className={`grid h-4 w-4 place-items-center rounded border ${
                      isSelected ? 'border-[#4a3728] bg-[#4a3728]' : 'border-stone-300'}`
                      }>

                      {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                    </button>
                  </td>
                  {cells.map((content, index) =>
                  <td
                    key={COLUMNS[index].label}
                    className={`px-2 py-1.5 ${
                    index < cells.length - 1 ? 'border-r border-[#f2ece2]' : ''} ${
                    COLUMNS[index].align === 'center' ? 'text-center' : 'text-left'}`
                    }>

                      {content}
                    </td>
                  )}
                </tr>);

            })}

            {!rows.length &&
            <tr>
                <td
                colSpan={COLUMNS.length + 1}
                className="border-t border-[#f0eae0] px-3 py-10 text-center text-[13px] text-stone-500">

                  Không có căn nào khớp bộ lọc. Thử bỏ bớt điều kiện.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>);

}

/* ═══════════════════════════════════════════════════════════════
   Bộ lọc theo cột
   ═══════════════════════════════════════════════════════════════ */

interface FilterProps {
  label: string;
  picked: string[];
  options: Array<{id: string;label: string;}>;
  open: boolean;
  onToggleOpen: () => void;
  onPick: (value: string) => void;
  onClear: () => void;
}

/** Danh sách chọn nhiều, dùng chung cho nút trên tiêu đề cột và bộ lọc tổng. */
function FilterMenu({ picked, options, onPick, onClear }: Omit<FilterProps, 'label' | 'open' | 'onToggleOpen'>) {
  return (
    <div
      className="absolute right-0 top-full z-40 mt-1 max-h-72 w-52 overflow-y-auto rounded-lg bg-white py-1 text-left shadow-2xl ring-1 ring-black/10"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}>

      {picked.length > 0 &&
      <button
        type="button"
        onClick={onClear}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] font-semibold text-[#992d22] hover:bg-[#fbedeb]">

          <XIcon className="h-3 w-3" />
          Bỏ chọn tất cả
        </button>
      }
      {options.map((option) =>
      <label
        key={option.id}
        className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-[12.5px] text-stone-700 hover:bg-[#faf6ef]">

          <span
          className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded border ${
          picked.includes(option.id) ? 'border-[#4a3728] bg-[#4a3728]' : 'border-stone-300'}`
          }>

            {picked.includes(option.id) && <CheckIcon className="h-2.5 w-2.5 text-white" />}
          </span>
          <input
          type="checkbox"
          className="hidden"
          checked={picked.includes(option.id)}
          onChange={() => onPick(option.id)} />

          {option.label}
        </label>
      )}
      {!options.length &&
      <p className="px-3 py-2 text-[12px] text-stone-400">Không có lựa chọn</p>
      }
    </div>);

}

/** Nút nhỏ cạnh tên cột. */
function ColumnFilter(props: FilterProps) {
  return (
    <span className="relative">
      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={props.onToggleOpen}
        aria-label={`Lọc theo ${props.label}`}
        className={`grid h-4 w-4 place-items-center rounded transition-colors ${
        props.picked.length ? 'bg-[#f5921f] text-white' : 'text-white/60 hover:bg-white/20 hover:text-white'}`
        }>

        <ChevronDownIcon className="h-3 w-3" />
      </button>
      {props.open && <FilterMenu {...props} />}
    </span>);

}

/** Nút trong bộ lọc tổng bên trên bảng. */
function FilterButton(props: FilterProps) {
  return (
    <span className="relative">
      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={props.onToggleOpen}
        className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[12px] font-semibold transition-colors ${
        props.picked.length ?
        'border-[#f5921f] bg-[#fdf3e2] text-[#8a5a12]' :
        'border-[#e0d2bd] bg-white text-[#4a3728] hover:bg-[#f7f2ea]'}`
        }>

        {props.label}
        {props.picked.length > 0 &&
        <span className="rounded bg-[#f5921f] px-1 text-[10px] font-bold text-white">
            {props.picked.length}
          </span>
        }
        <ChevronDownIcon className="h-3 w-3" />
      </button>
      {props.open && <FilterMenu {...props} />}
    </span>);

}
