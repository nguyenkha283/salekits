import React, { useMemo, useState } from 'react';
import { CheckIcon, CrownIcon, InfoIcon } from 'lucide-react';
import {
  shortPrice,
  unitPrice,
  type InventoryData,
  type UnitStatusValue } from
'../inventoryParser';

const STATUS_OPTIONS: Array<'all' | UnitStatusValue> = ['all', 'Còn hàng', 'Đã lock', 'Đã cọc', 'Đã bán'];

const STATUS_STYLES: Record<UnitStatusValue, string> = {
  'Còn hàng': 'bg-[#d1fae5] text-[#047857]',
  'Đã lock': 'bg-amber-100 text-amber-700',
  'Đã cọc': 'bg-orange-100 text-orange-800',
  'Đã bán': 'bg-red-100 text-red-700'
};

interface FundInventoryProps {
  data: InventoryData;
}

export function FundInventory({ data }: FundInventoryProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | UnitStatusValue>('all');
  const [towerFilter, setTowerFilter] = useState<string>('all');
  const [priceIndex, setPriceIndex] = useState(() => {
    const firstGroup = data.priceFields[0]?.group;
    const last = data.priceFields.
    map((field, index) => ({ field, index })).
    filter((entry) => entry.field.group === firstGroup).
    pop();
    return last?.index ?? 0;
  });

  const activePriceColumn = data.priceFields[priceIndex];
  const priceGroups = useMemo(
    () => [...new Set(data.priceFields.map((field) => field.group))],
    [data.priceFields]
  );
  const towers = data.towers;

  const rows = useMemo(
    () =>
    data.units.filter(
      (unit) =>
      (statusFilter === 'all' || unit.status === statusFilter) && (
      towerFilter === 'all' || unit.tower === towerFilter)
    ),
    [data.units, statusFilter, towerFilter]
  );

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

  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.code));

  function toggleAll() {
    setSelectedIds(allSelected ? [] : rows.map((row) => row.code));
  }

  function toggleOne(code: string) {
    setSelectedIds((current) =>
    current.includes(code) ? current.filter((item) => item !== code) : [...current, code]
    );
  }

  return (
    <section className="w-full" aria-labelledby="fund-heading">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="fund-heading" className="text-2xl font-bold text-black">Quỹ căn</h2>
        <span className="text-[13px] text-stone-500">
          {data.sheetNames.join(' · ')} — {data.units.length} căn
        </span>
      </div>

      <p className="mt-2 flex gap-2 rounded border border-[#f0dcb6] bg-[#fdf3e2] px-3 py-2 text-[12px] leading-relaxed text-[#92600a]">
        <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" />
        Thông tin diện tích và giá bán là tạm tính để tham khảo. Thông tin chính
        thức được công bố tại thời điểm ký Hợp đồng mua bán.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-3 border border-[#e9e1d5] bg-[#faf7f1] p-4">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-[#4a3728]">Tòa</span>
          <select
            value={towerFilter}
            onChange={(event) => setTowerFilter(event.target.value)}
            className="h-9 rounded border border-[#d9cdb8] bg-white px-2.5 text-[13px] text-[#4a3728] outline-none focus:border-[#f5921f]">

            <option value="all">Tất cả ({data.units.length})</option>
            {towers.map((tower) =>
            <option key={tower} value={tower}>
                Tòa {tower} ({data.units.filter((unit) => unit.tower === tower).length})
              </option>
            )}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-[#4a3728]">Tình trạng</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | UnitStatusValue)}
            className="h-9 rounded border border-[#d9cdb8] bg-white px-2.5 text-[13px] text-[#4a3728] outline-none focus:border-[#f5921f]">

            {STATUS_OPTIONS.map((option) =>
            <option key={option} value={option}>
                {option === 'all' ?
              'Tất cả' :
              `${option} (${data.units.filter((unit) => unit.status === option).length})`}
              </option>
            )}
          </select>
        </label>

        <label className="block min-w-[260px] flex-1">
          <span className="mb-1.5 block text-[12px] font-medium text-[#4a3728]">Giá hiển thị</span>
          <select
            value={priceIndex}
            onChange={(event) => setPriceIndex(Number(event.target.value))}
            className="h-9 w-full rounded border border-[#d9cdb8] bg-white px-2.5 text-[13px] text-[#4a3728] outline-none focus:border-[#f5921f]">

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
        </label>

        <p className="ml-auto text-[12px] text-[#9c8672]">
          {rows.length} căn · đã chọn {selectedIds.length}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto border border-[#e9e1d5] bg-white">
        <table className="w-full min-w-[880px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-[#827464] text-white">
              <th className="w-10 px-3 py-2.5">
                <button
                  onClick={toggleAll}
                  aria-label={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  className={`grid h-4 w-4 place-items-center rounded border border-white/60 ${
                  allSelected ? 'bg-white' : ''}`
                  }>

                  {allSelected && <CheckIcon className="h-3 w-3 text-[#4a3728]" />}
                </button>
              </th>
              <th className="px-3 py-2.5 font-semibold">Mã căn hộ</th>
              <th className="px-3 py-2.5 font-semibold">Tòa</th>
              <th className="px-3 py-2.5 font-semibold">Tầng</th>
              <th className="px-3 py-2.5 font-semibold">Căn</th>
              <th className="px-3 py-2.5 text-right font-semibold">DT thông thủy</th>
              <th className="px-3 py-2.5 font-semibold">Số PN</th>
              <th className="px-3 py-2.5 font-semibold">Bàn giao</th>
              <th className="px-3 py-2.5 text-right font-semibold">{activePriceColumn?.label ?? 'Giá'}</th>
              <th className="px-3 py-2.5 text-right font-semibold">Đơn giá</th>
              <th className="px-3 py-2.5 font-semibold">Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = selectedIds.includes(row.code);
              return (
                <tr
                  key={row.code}
                  className={`border-b border-[#f0eae0] transition-colors ${
                  isSelected ? 'bg-[#fdf3e2]' : 'hover:bg-[#faf7f1]'}`
                  }>

                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleOne(row.code)}
                      aria-label={`Chọn căn ${row.code}`}
                      className={`grid h-4 w-4 place-items-center rounded border ${
                      isSelected ? 'border-[#4a3728] bg-[#4a3728]' : 'border-stone-300'}`
                      }>

                      {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-mono font-semibold text-[#4a3728]">
                    <span className="inline-flex items-center gap-1.5">
                      {(fundsByCode.get(row.code)?.length ?? 0) > 0 &&
                      <CrownIcon
                        className="h-3.5 w-3.5 fill-[#173b7a] text-[#173b7a]"
                        aria-label={fundsByCode.get(row.code)?.join(', ')} />

                      }
                      {row.code}
                    </span>
                  </td>
                  <td className="px-3 py-2">{row.tower}</td>
                  <td className="px-3 py-2 font-mono">{row.floor}</td>
                  <td className="px-3 py-2 font-mono">{row.unit}</td>
                  <td className="px-3 py-2 text-right font-mono">{row.area?.toFixed(2) ?? '—'}</td>
                  <td className="px-3 py-2">{row.bedrooms || '—'}</td>
                  <td className="px-3 py-2">{row.handover || '—'}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">
                    {shortPrice(row.prices[priceIndex])}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-stone-500">
                    {unitPrice(row.prices[priceIndex], row.area)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-[11.5px] font-semibold ${STATUS_STYLES[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
    </section>);

}
