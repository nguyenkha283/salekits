import { useState } from 'react';
import { ChevronDownIcon, RotateCcwIcon, SearchIcon } from 'lucide-react';
import type { UnitQuery } from '../unitSearch';
import { normalizeQuery } from '../unitSearch';

/**
 * Form tìm kiếm quỹ căn — mỗi cột của bảng Quỹ căn có một ô tìm tương ứng.
 * Cùng bộ trường với công cụ tra bảng hàng của trợ lý AI Bích Ngọc
 * (xem unitSearch.ts), nên khách tự tìm hay hỏi Ngọc đều ra cùng kết quả.
 */

export type UnitSearchValues = Record<string, string>;

type Field =
{kind: 'text';key: string;label: string;placeholder?: string;} |
{kind: 'select';key: string;label: string;options: string[];} |
{kind: 'range';min: string;max: string;label: string;unit: string;};

const STATUS_OPTIONS = ['Còn hàng', 'Đã lock', 'Đã cọc', 'Đã bán'];

function fieldsFor(
layout: 'cao-tang' | 'thap-tang',
options: {propertyTypes: string[];towers: string[];subdivisions: string[];lotTypes: string[];})
: Field[] {
  if (layout === 'thap-tang') {
    return [
    { kind: 'text', key: 'code', label: 'Mã sản phẩm', placeholder: 'VD: SH22-50' },
    { kind: 'select', key: 'propertyType', label: 'Loại hình', options: options.propertyTypes },
    { kind: 'select', key: 'lotType', label: 'Loại lô', options: options.lotTypes },
    { kind: 'select', key: 'subdivision', label: 'Phân khu', options: options.subdivisions },
    { kind: 'range', min: 'landAreaMin', max: 'landAreaMax', label: 'DT đất', unit: 'm²' },
    { kind: 'range', min: 'buildAreaMin', max: 'buildAreaMax', label: 'DT xây dựng', unit: 'm²' },
    { kind: 'range', min: 'priceMin', max: 'priceMax', label: 'Giá bán', unit: 'tỷ' },
    { kind: 'select', key: 'status', label: 'Trạng thái', options: STATUS_OPTIONS }];

  }
  return [
  { kind: 'text', key: 'code', label: 'Mã căn', placeholder: 'VD: A1-22.07' },
  { kind: 'select', key: 'propertyType', label: 'Loại hình', options: options.propertyTypes },
  { kind: 'select', key: 'tower', label: 'Tòa nhà', options: options.towers },
  { kind: 'text', key: 'floor', label: 'Tầng', placeholder: 'VD: 12' },
  { kind: 'text', key: 'unit', label: 'Trục căn', placeholder: 'VD: 07' },
  { kind: 'text', key: 'direction', label: 'Hướng', placeholder: 'VD: Đông Nam' },
  { kind: 'text', key: 'view', label: 'View', placeholder: 'VD: hồ, công viên' },
  { kind: 'range', min: 'wallAreaMin', max: 'wallAreaMax', label: 'DT tim tường', unit: 'm²' },
  { kind: 'range', min: 'areaMin', max: 'areaMax', label: 'DT thông thủy', unit: 'm²' },
  { kind: 'range', min: 'priceMin', max: 'priceMax', label: 'Giá niêm yết', unit: 'tỷ' },
  { kind: 'select', key: 'status', label: 'Tình trạng', options: STATUS_OPTIONS }];

}

/** Đổi giá trị form (giá nhập theo tỷ) thành điều kiện tìm (giá theo đồng). */
export function toUnitQuery(values: UnitSearchValues): UnitQuery {
  const raw: Record<string, unknown> = { ...values };
  for (const key of ['priceMin', 'priceMax']) {
    const value = Number.parseFloat(String(values[key] ?? '').replace(',', '.'));
    raw[key] = Number.isFinite(value) ? value * 1e9 : undefined;
  }
  return normalizeQuery(raw);
}

const inputClass =
'h-9 w-full min-w-0 rounded-md border border-stone-300 bg-white px-2.5 text-[13px] text-stone-800 placeholder:text-stone-400 focus:border-[#f5921f] focus:outline-none focus:ring-2 focus:ring-orange-100';

export function UnitSearchForm({
  layout,
  values,
  onChange,
  onReset,
  matchCount,
  totalCount,
  options
}: {layout: 'cao-tang' | 'thap-tang';values: UnitSearchValues;onChange: (values: UnitSearchValues) => void;onReset: () => void;matchCount: number;totalCount: number;options: {propertyTypes: string[];towers: string[];subdivisions: string[];lotTypes: string[];};}) {
  const [open, setOpen] = useState(true);
  const fields = fieldsFor(layout, options);
  const activeCount = Object.values(values).filter((value) => value.trim()).length;
  const set = (key: string, value: string) => onChange({ ...values, [key]: value });

  return (
    <form
      role="search"
      aria-label="Tìm kiếm quỹ căn"
      onSubmit={(event) => event.preventDefault()}
      className="mt-4 rounded-xl border border-stone-200 bg-white">

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left">

        <SearchIcon className="h-4 w-4 text-[#f5921f]" />
        <span className="text-sm font-bold text-stone-800">Tìm kiếm căn</span>
        {activeCount > 0 &&
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">
            {activeCount} điều kiện · {matchCount}/{totalCount} căn
          </span>
        }
        <ChevronDownIcon className={`ml-auto h-4 w-4 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
      <div className="border-t border-stone-100 px-4 pb-4 pt-3">
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map((field) => {
            if (field.kind === 'range') {
              return (
                <fieldset key={field.min} className="min-w-0">
                    <legend className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                      {field.label} ({field.unit})
                    </legend>
                    <div className="flex items-center gap-1.5">
                      <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      aria-label={`${field.label} từ`}
                      placeholder="Từ"
                      value={values[field.min] ?? ''}
                      onChange={(event) => set(field.min, event.target.value)}
                      className={inputClass} />
                      <span className="text-stone-400">–</span>
                      <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      aria-label={`${field.label} đến`}
                      placeholder="Đến"
                      value={values[field.max] ?? ''}
                      onChange={(event) => set(field.max, event.target.value)}
                      className={inputClass} />
                    </div>
                  </fieldset>);

            }
            const id = `unit-search-${field.key}`;
            return (
              <div key={field.key} className="min-w-0">
                  <label htmlFor={id} className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                    {field.label}
                  </label>
                  {field.kind === 'select' ?
                <select
                  id={id}
                  value={values[field.key] ?? ''}
                  onChange={(event) => set(field.key, event.target.value)}
                  className={inputClass}>

                      <option value="">Tất cả</option>
                      {field.options.map((option) =>
                  <option key={option} value={option}>{option}</option>
                  )}
                    </select> :

                <input
                  id={id}
                  type="text"
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ''}
                  onChange={(event) => set(field.key, event.target.value)}
                  className={inputClass} />

                }
                </div>);

          })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-stone-600">
              Tìm thấy <b className="text-stone-900">{matchCount}</b> / {totalCount} căn
            </span>
            {activeCount > 0 &&
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-[13px] font-semibold text-stone-700 hover:bg-stone-50">

                <RotateCcwIcon className="h-3.5 w-3.5" />
                Xóa điều kiện
              </button>
          }
          </div>
        </div>
      }
    </form>);

}
