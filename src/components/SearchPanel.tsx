import React, { useState } from 'react';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
const TABS = ['Dự án', 'Nhà bán lẻ', 'Nhà cho thuê'];
interface SelectFieldProps {
  label: string;
  placeholder: string;
}
function SelectField({ label, placeholder }: SelectFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
        {label}
      </label>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-neutral-50 px-4 py-3 text-left text-[15px] text-neutral-500 ring-1 ring-neutral-200 transition-colors hover:ring-neutral-300">
        
        <span className="truncate">{placeholder}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>
    </div>);

}
export function SearchPanel() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  return (
    <div className="mx-auto w-full max-w-[1180px] px-4">
      {/* Tabs */}
      <div className="flex w-fit overflow-hidden rounded-t-xl">
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-7 py-3 text-[15px] font-semibold transition-colors ${active ? 'bg-white text-orange-600' : 'bg-white/40 text-neutral-700 hover:bg-white/60'}`}>
              
              {tab}
              {active &&
              <span className="mx-auto mt-1.5 block h-0.5 w-8 rounded bg-orange-500" />
              }
            </button>);

        })}
      </div>

      {/* Panel */}
      <div className="rounded-b-xl rounded-tr-xl bg-white p-5 shadow-xl lg:p-6">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_auto]">
          <div className="min-w-0">
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              {activeTab}
            </label>
            <input
              type="text"
              placeholder="Nhập dự án, khu vực"
              className="w-full rounded-lg bg-neutral-50 px-4 py-3 text-[15px] text-neutral-800 ring-1 ring-neutral-200 outline-none transition-colors placeholder:text-neutral-400 focus:ring-2 focus:ring-orange-400" />
            
          </div>

          <SelectField label="Loại hình" placeholder="Loại hình BĐS" />
          <SelectField label="Khu vực" placeholder="Khu vực" />
          <SelectField label="Mức giá" placeholder="Mức giá" />
          <SelectField label="Diện tích" placeholder="Diện tích" />

          <button className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-orange-600">
            <SearchIcon className="h-4 w-4" />
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>);

}