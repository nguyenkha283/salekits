import React, { useState } from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, XIcon } from 'lucide-react';
import type { DetectedSheet, SheetKind } from '../parseWorkbook';

const FIELD_LABELS: Record<string, string> = {
  code: 'Mã căn',
  tower: 'Tòa',
  floor: 'Tầng',
  unit: 'Căn số',
  area: 'Diện tích',
  bedrooms: 'Số PN',
  handover: 'Bàn giao',
  status: 'Tình trạng'
};

const KIND_LABEL: Record<SheetKind, string> = {
  inventory: 'Bảng hàng',
  fund: 'Quỹ căn',
  skip: 'Bỏ qua'
};

interface SheetPickerDialogProps {
  sheets: DetectedSheet[];
  /** Tên file hoặc liên kết nguồn, hiển thị để đối chiếu. */
  sourceLabel?: string;
  onCancel: () => void;
  onConfirm: (sheets: DetectedSheet[]) => void;
}

/**
 * Popup chọn sheet sau khi bóc tách file. Dùng chung cho lần nhập đầu tiên và
 * cho mỗi lần đồng bộ lại.
 */
export function SheetPickerDialog({
  sheets: initial,
  sourceLabel,
  onCancel,
  onConfirm
}: SheetPickerDialogProps) {
  const [sheets, setSheets] = useState(initial);

  function setKind(index: number, kind: SheetKind) {
    setSheets((current) =>
    current.map((sheet, i) => i === index ? { ...sheet, kind } : sheet)
    );
  }

  const inventoryCount = sheets.filter((sheet) => sheet.kind === 'inventory').length;
  const fundCount = sheets.filter((sheet) => sheet.kind === 'fund').length;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-dialog-title"
        className="flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        <div className="flex items-start gap-3 border-b border-[#eee4d5] px-5 py-4">
          <div className="min-w-0 flex-1">
            <h3 id="sheet-dialog-title" className="text-base font-bold text-[#3b2c1d]">
              Chọn sheet cần nhập
            </h3>
            <p className="mt-0.5 text-[12px] text-stone-500">
              Tìm thấy {sheets.length} sheet trong file. Phân loại từng sheet — hệ
              thống không tự đoán theo tên. Tòa nhà lấy từ cột dữ liệu, không lấy
              từ tên sheet.
            </p>
            {sourceLabel &&
            <p className="mt-1 truncate font-mono text-[11px] text-stone-400">
                {sourceLabel}
              </p>
            }
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
            aria-label="Đóng">

            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4">
          {sheets.map((sheet, index) =>
          <div
            key={`${sheet.name}-${index}`}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-[#e9e1d5] p-3">

              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[13px] font-bold text-[#3b2c1d]">
                  {sheet.name}
                </p>
                <p className="text-[11px] text-stone-500">
                  {sheet.rows} dòng · {sheet.columns} cột ·{' '}
                  <b className="text-stone-700">{sheet.analysis.units.length} căn đọc được</b>
                </p>
                {sheet.analysis.units.length > 0 &&
                <p className="mt-1 flex flex-wrap gap-1">
                    {Object.keys(sheet.analysis.mapping).map((field) =>
                  <span key={field} className="rounded bg-[#e6f0e8] px-1.5 py-px text-[10px] font-semibold text-[#2c6e3f]">
                        {FIELD_LABELS[field] ?? field}
                      </span>
                  )}
                    {sheet.analysis.priceFields.length > 0 &&
                  <span className="rounded bg-[#e6edfb] px-1.5 py-px text-[10px] font-semibold text-[#2a55b8]">
                        {sheet.analysis.priceFields.length} cột giá
                      </span>
                  }
                  </p>
                }
              </div>
              <div className="flex gap-1 rounded-lg bg-[#f3ece1] p-1">
                {(['inventory', 'fund', 'skip'] as SheetKind[]).map((kind) =>
              <button
                key={kind}
                type="button"
                onClick={() => setKind(index, kind)}
                aria-pressed={sheet.kind === kind}
                className={`rounded px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                sheet.kind === kind ?
                'bg-white text-[#8a5a12] shadow-sm' :
                'text-stone-500 hover:text-stone-700'}`
                }>

                    {KIND_LABEL[kind]}
                  </button>
              )}
              </div>
            </div>
          )}

          {inventoryCount === 0 &&
          <p className="flex gap-2 rounded-lg border border-[#f0dcb6] bg-[#fdf3e2] p-3 text-[12px] leading-relaxed text-[#92600a]">
              <AlertTriangleIcon className="mt-px h-4 w-4 shrink-0" />
              Cần ít nhất một sheet Bảng hàng để nhập dữ liệu.
            </p>
          }
        </div>

        <div className="flex items-center gap-3 border-t border-[#eee4d5] px-5 py-3.5">
          <span className="text-[12px] text-stone-500">
            {inventoryCount} sheet bảng hàng · {fundCount} sheet quỹ
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="ml-auto rounded-lg border border-[#e0d2bd] px-3 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef]">

            Hủy
          </button>
          <button
            type="button"
            disabled={inventoryCount === 0}
            onClick={() => onConfirm(sheets.filter((sheet) => sheet.kind !== 'skip'))}
            className="flex items-center gap-1.5 rounded-lg bg-[#f5921f] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#db7214] disabled:cursor-not-allowed disabled:bg-stone-300">

            <CheckCircle2Icon className="h-4 w-4" />
            Nhập vào hệ thống
          </button>
        </div>
      </div>
    </div>);

}
