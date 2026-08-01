import React from 'react';
import { BedDoubleIcon, CheckSquareIcon, ChevronRightIcon, ExpandIcon, HeartIcon, MessageCircleIcon, RulerIcon, Share2Icon, XIcon } from 'lucide-react';
export type UnitStatus = 'Còn hàng' | 'Đã bán' | 'Đã lock' | 'Đã cọc';
export interface UnitDetail {
  price: string;
  status: UnitStatus;
}
interface UnitDetailModalProps {
  buildingCode: string;
  floor: string;
  unit: string;
  apartmentType: string;
  area: string;
  direction: string;
  detail: UnitDetail;
  fundColor: string;
  onClose: () => void;
  /** Mã căn đọc từ file bảng hàng, không ghép lại từ tầng và trục. */
  apartmentCode?: string;
  /** Gói bàn giao trong file: HTCB hoặc Thô. */
  handover?: string;
  /** Nhãn cột giá đang hiển thị. */
  priceLabel?: string;
  unitPriceText?: string;
  /** Cột trong file không nhận diện được — hiển thị nguyên trạng. */
  extras?: Record<string, string>;
  /** Tên các quỹ chứa căn này. */
  fundNames?: string[];
}
const STATUS_STYLES: Record<UnitStatus, string> = {
  'Còn hàng': 'bg-emerald-100 text-emerald-700',
  'Đã bán': 'bg-red-100 text-red-700',
  'Đã lock': 'bg-amber-100 text-amber-700',
  'Đã cọc': 'bg-[#fdeed8] text-[#b56a10]'
};
export function UnitDetailModal({
  buildingCode,
  apartmentCode,
  handover,
  priceLabel,
  unitPriceText,
  extras,
  fundNames,
  floor,
  unit,
  apartmentType,
  area,
  direction,
  detail,
  fundColor,
  onClose
}: UnitDetailModalProps) {
  const displayCode = apartmentCode ?? `${buildingCode}-${floor}-${unit}`;
  const isAvailable = detail.status === 'Còn hàng';
  return <div role="presentation" className="fixed inset-0 z-[80] flex items-center justify-center bg-[#4a3728]/45 p-3 sm:p-6" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="unit-detail-title" className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{
            backgroundColor: fundColor
          }} aria-hidden="true" />
            <h2 id="unit-detail-title" className="text-xl font-semibold text-[#4a3728]">{displayCode}</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">Giá NY</p>
              <p className="text-xl font-bold text-[#e83d4d]">{detail.price}</p>
              {priceLabel && <p className="mt-0.5 text-[11px] text-stone-500">{priceLabel}</p>}
              <p className="text-[10px] text-stone-400">Giá trước VAT + KPBT</p>
            </div>
            <button onClick={onClose} aria-label="Đóng chi tiết căn" className="rounded p-1 text-stone-300 transition-colors hover:bg-stone-100 hover:text-[#4a3728]">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[42%_58%]">
          <aside className="border-b border-stone-100 bg-[#fafafa] lg:border-b-0 lg:border-r">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#4a3728]">
              <img src="/ffbb15b7-c56b-4b5d-b7e3-ed3affc9fd36.jpg" alt="Không gian căn hộ mẫu" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 top-0 bg-[#3a2b1e]/80 p-5 text-white">
                <p className="text-[10px] font-medium tracking-[0.2em]">IMPERIA SKY PARK</p>
                <p className="mt-3 text-xs font-semibold">TRỤC CĂN</p>
                <p className="text-3xl font-bold tracking-wide">{displayCode}</p>
              </div>
              <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-[#4a3728] shadow-sm" aria-label="Phóng to ảnh">
                <ExpandIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 border-t border-stone-100 bg-white py-3 text-center">
              <div className="border-r border-stone-100 px-2">
                <BedDoubleIcon className="mx-auto h-4 w-4 text-[#f5921f]" />
                <p className="mt-1 text-[10px] text-stone-400">Loại hình</p>
                <p className="text-[11px] font-bold text-[#4a3728]">{apartmentType}</p>
              </div>
              <div className="border-r border-stone-100 px-2">
                <ChevronRightIcon className="mx-auto h-4 w-4 rotate-[-45deg] text-[#f5921f]" />
                <p className="mt-1 text-[10px] text-stone-400">Hướng</p>
                <p className="text-[11px] font-bold text-[#4a3728]">{direction}</p>
              </div>
              <div className="px-2">
                <RulerIcon className="mx-auto h-4 w-4 text-[#f5921f]" />
                <p className="mt-1 text-[10px] text-stone-400">Diện tích</p>
                <p className="text-[11px] font-bold text-[#4a3728]">{area}m²</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-stone-100 bg-white p-3">
              <button className="inline-flex items-center justify-center gap-1 rounded border border-stone-200 px-2 py-2 text-xs font-semibold text-[#4a3728] hover:bg-stone-50"><HeartIcon className="h-3.5 w-3.5 text-stone-400" /> Quan tâm</button>
              <button className="inline-flex items-center justify-center gap-1 rounded border border-stone-200 px-2 py-2 text-xs font-semibold text-[#4a3728] hover:bg-stone-50"><Share2Icon className="h-3.5 w-3.5 text-stone-400" /> Chia sẻ</button>
              <button className="inline-flex items-center justify-center gap-1 rounded border border-[#f5921f] px-2 py-2 text-xs font-semibold text-[#f5921f] hover:bg-[#fef4e6]"><MessageCircleIcon className="h-3.5 w-3.5" /> Hỏi đáp</button>
            </div>
          </aside>

          <div className="p-5 sm:p-7">
            <DetailSection title="Giá" action="Phiếu tính giá">
              <DetailGrid items={[[priceLabel ?? 'Giá bán', detail.price], ['Đơn giá', unitPriceText ?? 'Đang cập nhật']]} />
            </DetailSection>
            <DetailSection title="Diện tích" action="Layout">
              <DetailGrid items={[['DT thông thủy', `${area} m²`], ['DT tim tường', 'File chưa có']]} />
              {extras && Object.keys(extras).length > 0 &&
              <div className="mt-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Cột khác trong file
                  </p>
                  <DetailGrid items={Object.entries(extras)} />
                </div>
              }
            </DetailSection>
            <DetailSection title="CSBH & Quà tặng" action="Chi tiết">
              <DetailGrid items={[['CSBH áp dụng', '04/07/2026']]} />
            </DetailSection>
            <DetailSection title="Thông tin bàn giao">
              <DetailGrid items={[['Tòa nhà', `Tòa ${buildingCode}`], ['Tầng', floor], ['Trục căn', unit], ['Hướng ban công', direction], ['Tiêu chuẩn bàn giao', handover || 'Chưa có dữ liệu'], ['Quỹ căn', fundNames?.length ? fundNames.join(', ') : 'Không thuộc quỹ nào']]} />
            </DetailSection>
            <DetailSection title="Trạng thái">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-stone-400">Check gần nhất: <span className="font-medium text-[#4a3728]">17/07/2026 11:57:32</span></p>
                <span className={`rounded px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[detail.status]}`}>{detail.status}</span>
              </div>
            </DetailSection>

            <div className="mt-5 flex items-center gap-3 rounded-lg bg-stone-50 p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5921f] text-lg font-bold text-white">PV</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#4a3728]">Phạm Huy Việt</p>
                <p className="text-xs text-stone-400">Quản lý giao dịch</p>
              </div>
              <button className="rounded bg-emerald-500 p-2 text-white" aria-label="Gọi tư vấn viên"><MessageCircleIcon className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {isAvailable && <footer className="sticky bottom-0 border-t border-stone-100 bg-white p-3 text-center">
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#f5921f] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#dd7f0e]">
              <CheckSquareIcon className="h-4 w-4" /> BOOKING LOCK
            </button>
          </footer>}
      </section>
    </div>;
}
interface DetailSectionProps {
  title: string;
  action?: string;
  children: React.ReactNode;
}
function DetailSection({
  title,
  action,
  children
}: DetailSectionProps) {
  return <section className="border-b border-stone-100 py-4 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[#4a3728]">{title}</h3>
        {action && <button className="rounded border border-stone-200 px-2 py-1 text-xs font-medium text-[#8a6a3f] hover:bg-stone-50">{action}</button>}
      </div>
      {children}
    </section>;
}
interface DetailGridProps {
  items: [string, string][];
}
function DetailGrid({
  items
}: DetailGridProps) {
  return <dl className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      {items.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3">
          <dt className="text-stone-400">{label}:</dt>
          <dd className="font-semibold text-[#4a3728]">{value}</dd>
        </div>)}
    </dl>;
}