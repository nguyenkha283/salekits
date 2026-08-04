import React, { useEffect, useMemo, useState } from 'react';
import { CheckIcon, ChevronDownIcon, CrownIcon, InfoIcon, XIcon } from 'lucide-react';
import {
  isExclusiveFund,
  shortPrice,
  unitPrice,
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
  /** Ghi chú pháp lý chỉ hiện ở trang xem trước và trang công khai. */
  showNotice?: boolean;
}

export function FundInventory({ data, showNotice = false }: FundInventoryProps) {
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
    align?: 'right';
    options?: Array<{id: string;label: string;}>;
  }> = [
  { key: null, label: 'Mã căn' },
  {
    key: 'price',
    label: 'Giá niêm yết',
    align: 'right',
    options: PRICE_RANGES.map((range) => ({ id: range.id, label: range.label }))
  },
  {
    key: 'bedrooms',
    label: 'Loại hình',
    options: options.bedrooms.map((value) => ({ id: value, label: value }))
  },
  { key: null, label: 'Hướng' },
  { key: null, label: 'View' },
  { key: null, label: 'DT tim tường', align: 'right' },
  {
    key: 'area',
    label: 'DT thông thủy',
    align: 'right',
    options: AREA_RANGES.map((range) => ({ id: range.id, label: range.label }))
  },
  {
    key: 'floor',
    label: 'Tầng',
    options: options.floor.map((value) => ({ id: value, label: value }))
  },
  {
    key: 'unit',
    label: 'Trục căn',
    options: options.unit.map((value) => ({ id: value, label: value }))
  },
  {
    key: 'tower',
    label: 'Tòa nhà',
    options: options.tower.map((value) => ({ id: value, label: value }))
  },
  {
    key: 'status',
    label: 'Tình trạng',
    options: STATUS_OPTIONS.map((value) => ({ id: value, label: value }))
  }];


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

      {/* Bộ lọc tổng bên trên bảng */}
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-[#e9e1d5] bg-[#faf7f1] p-3">
        <span className="text-[12px] font-semibold text-[#4a3728]">Lọc nhanh:</span>
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
        {activeCount > 0 &&
        <button
          type="button"
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="inline-flex items-center gap-1 rounded border border-[#e0d2bd] bg-white px-2 py-1 text-[11.5px] font-semibold text-[#992d22] transition-colors hover:bg-[#fbedeb]">

            <XIcon className="h-3 w-3" />
            Xóa {activeCount} bộ lọc
          </button>
        }
        <p className="ml-auto text-[12px] text-[#9c8672]">
          {rows.length}/{data.units.length} căn · đã chọn {selectedIds.length}
        </p>
      </div>

      <div className="mt-3 overflow-x-auto border border-[#e9e1d5] bg-white">
        <table className="w-full min-w-[1180px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-[#827464] text-white">
              <th className="w-10 px-3 py-2.5">
                <button
                  onClick={() => setSelectedIds(allSelected ? [] : rows.map((row) => row.code))}
                  aria-label={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  className={`grid h-4 w-4 place-items-center rounded border border-white/60 ${
                  allSelected ? 'bg-white' : ''}`
                  }>

                  {allSelected && <CheckIcon className="h-3 w-3 text-[#4a3728]" />}
                </button>
              </th>
              {COLUMNS.map((column) =>
              <th
                key={column.label}
                className={`px-3 py-2.5 font-semibold ${column.align === 'right' ? 'text-right' : ''}`}>

                  <span className="inline-flex items-center gap-1">
                    {column.label}
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

              return (
                <tr
                  key={row.code}
                  className={`border-b border-[#f0eae0] transition-colors ${
                  isSelected ? 'bg-[#fdf3e2]' : 'hover:bg-[#faf7f1]'}`
                  }>

                  <td className="px-3 py-2">
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
                  <td className="px-3 py-2 font-semibold text-[#4a3728]">
                    <span className="inline-flex items-center gap-1.5">
                      {crown &&
                      <CrownIcon
                        className="h-3.5 w-3.5 shrink-0 fill-[#173b7a] text-[#173b7a]"
                        aria-label="Quỹ độc quyền" />

                      }
                      {row.code}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">
                    {shortPrice(row.prices[priceIndex])}
                    <span className="ml-1.5 text-[11.5px] font-normal text-stone-400">
                      {unitPrice(row.prices[priceIndex], row.area)}
                    </span>
                  </td>
                  <td className="px-3 py-2">{row.bedrooms || '—'}</td>
                  <td className="px-3 py-2">{extraByKeyword(row, 'huong') || '—'}</td>
                  <td className="px-3 py-2">{extraByKeyword(row, 'view') || '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{timTuong(row) || '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.area?.toFixed(1) ?? '—'}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{row.floor || '—'}</td>
                  <td className="px-3 py-2 tabular-nums">{row.unit || '—'}</td>
                  <td className="px-3 py-2">{row.tower || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-[11.5px] font-semibold ${STATUS_STYLES[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>);

            })}

            {!rows.length &&
            <tr>
                <td colSpan={COLUMNS.length + 1} className="px-3 py-10 text-center text-[13px] text-stone-500">
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
