import React, { useState } from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, XIcon } from 'lucide-react';
import type { DetectedSheet, SheetKind } from '../parseWorkbook';

/** Các trường hiển thị trạng thái nhận diện — thiếu cái nào thấy ngay. */
const REQUIRED_FIELDS = [
'code', 'tower', 'floor', 'unit', 'bedrooms', 'area', 'status', 'fund'];


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
  tower: 'Sheet tòa',
  inventory: 'Quỹ căn',
  fund: 'Đánh dấu quỹ',
  skip: 'Bỏ qua'
};

interface SheetPickerDialogProps {
  sheets: DetectedSheet[];
  /** Tên file hoặc liên kết nguồn, hiển thị để đối chiếu. */
  sourceLabel?: string;
  /** Lời nhắc khi đường đọc không lấy được đủ thông tin. */
  degraded?: string;
  onCancel: () => void;
  onConfirm: (sheets: DetectedSheet[], priceIndex: number) => void;
}

/**
 * Popup chọn sheet sau khi bóc tách file. Dùng chung cho lần nhập đầu tiên và
 * cho mỗi lần đồng bộ lại.
 */
export function SheetPickerDialog({
  sheets: initial,
  sourceLabel,
  degraded,
  onCancel,
  onConfirm
}: SheetPickerDialogProps) {
  const [sheets, setSheets] = useState(initial);
  /** Bước 2: chọn cột giá hiển thị. -1 nghĩa là chưa sang bước này. */
  const [priceIndex, setPriceIndex] = useState<number | null>(null);

  function setKind(index: number, kind: SheetKind) {
    setSheets((current) =>
    current.map((sheet, i) => i === index ? { ...sheet, kind } : sheet)
    );
  }

  const inventoryCount = sheets.filter((sheet) => sheet.kind === 'inventory').length;
  const fundCount = sheets.filter((sheet) => sheet.kind === 'fund').length;
  const towerCount = sheets.filter((sheet) => sheet.kind === 'tower').length;

  /** Cột giá lấy từ sheet bảng hàng đầu tiên. */
  const priceFields =
  sheets.find((sheet) => sheet.kind === 'inventory')?.analysis.priceFields ?? [];
  const priceGroups = [...new Set(priceFields.map((field) => field.group))];
  const isPricingStep = priceIndex !== null;

  /** Mặc định: cột cuối của nhóm đầu — thường là tổng giá trị HĐMB. */
  function defaultPriceIndex(): number {
    const firstGroup = priceFields[0]?.group;
    const last = priceFields.
    map((field, index) => ({ field, index })).
    filter((entry) => entry.field.group === firstGroup).
    pop();
    return last?.index ?? 0;
  }

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

        {isPricingStep ?
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <p className="mb-3 text-[12px] leading-relaxed text-stone-600">
              File có <b>{priceFields.length} cột giá</b>. Chọn cột dùng để hiển
              thị trên bảng hàng và quỹ căn. Đổi lại được sau trong CMS.
            </p>
            <div className="space-y-3">
              {priceGroups.map((group) =>
            <div key={group}>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    {group}
                  </p>
                  <div className="space-y-1">
                    {priceFields.
                map((field, index) => ({ field, index })).
                filter((entry) => entry.field.group === group).
                map((entry) =>
                <label
                  key={entry.index}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-colors ${
                  priceIndex === entry.index ?
                  'border-[#f5921f] bg-[#fdf3e2]' :
                  'border-[#e9e1d5] hover:bg-[#faf6ef]'}`
                  }>

                          <input
                    type="radio"
                    name="price-column"
                    checked={priceIndex === entry.index}
                    onChange={() => setPriceIndex(entry.index)}
                    className="accent-[#f5921f]" />

                          <span className="text-[13px] text-stone-700">{entry.field.label}</span>
                        </label>
                )}
                  </div>
                </div>
            )}
            </div>
          </div> :

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4">
          {degraded &&
          <p className="flex gap-2 rounded-lg border border-[#f0dcb6] bg-[#fdf3e2] p-3 text-[12px] leading-relaxed text-[#92600a]">
              <AlertTriangleIcon className="mt-px h-4 w-4 shrink-0" />
              {degraded}
            </p>
          }
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
                  {sheet.hiddenRowCount > 0 &&
                  <> · <span className="text-[#92600a]">bỏ qua {sheet.hiddenRowCount} dòng ẩn</span></>
                  }
                  {sheet.merges.length > 0 &&
                  <> · <span className="text-[#2a55b8]">{sheet.merges.length} ô gộp</span></>
                  }
                </p>
                {sheet.tower &&
                <p className="mt-0.5 text-[11px] text-[#2c6e3f]">
                    Template: {sheet.tower.model.blocks.length} khối ·{' '}
                    {sheet.tower.model.blocks.reduce((total, block) => total + block.floors.length, 0)} tầng ·{' '}
                    {sheet.tower.model.blocks[0]?.columns.length ?? 0} trục
                  </p>
                }
                {sheet.analysis.units.length > 0 &&
                <>
                    <p className="mt-1 flex flex-wrap gap-1">
                      {REQUIRED_FIELDS.map((field) => {
                      const found = sheet.analysis.mapping[field] !== undefined;
                      return (
                        <span
                          key={field}
                          className={`rounded px-1.5 py-px text-[10px] font-semibold ${
                          found ?
                          'bg-[#e6f0e8] text-[#2c6e3f]' :
                          'bg-[#fbedeb] text-[#992d22] line-through'}`
                          }>

                            {FIELD_LABELS[field]}
                          </span>);

                    })}
                      <span
                      className={`rounded px-1.5 py-px text-[10px] font-semibold ${
                      sheet.analysis.priceFields.length ?
                      'bg-[#e6edfb] text-[#2a55b8]' :
                      'bg-[#fbedeb] text-[#992d22] line-through'}`
                      }>

                        {sheet.analysis.priceFields.length} cột giá
                      </span>
                    </p>

                    {sheet.analysis.unknownColumns.length > 0 &&
                  <details className="mt-1">
                        <summary className="cursor-pointer text-[10.5px] text-stone-400 hover:text-stone-600">
                          {sheet.analysis.unknownColumns.length} cột không nhận diện được
                        </summary>
                        <p className="mt-1 flex flex-wrap gap-1">
                          {sheet.analysis.unknownColumns.map((column, position) =>
                      <span
                        key={`${column}-${position}`}
                        className="rounded bg-[#f0eae0] px-1.5 py-px font-mono text-[10px] text-stone-500">

                              {column}
                            </span>
                      )}
                        </p>
                      </details>
                  }
                  </>
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
              Cần ít nhất một sheet Quỹ căn để nhập dữ liệu.
            </p>
          }
        </div>
        }

        <div className="flex items-center gap-3 border-t border-[#eee4d5] px-5 py-3.5">
          <span className="text-[12px] text-stone-500">
            {isPricingStep ?
            'Bước 2/2 — chọn cột giá' :
            `${towerCount} sheet tòa · ${inventoryCount} sheet quỹ căn · ${fundCount} sheet đánh dấu`}
          </span>
          <button
            type="button"
            onClick={isPricingStep ? () => setPriceIndex(null) : onCancel}
            className="ml-auto rounded-lg border border-[#e0d2bd] px-3 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef]">

            {isPricingStep ? 'Quay lại' : 'Hủy'}
          </button>
          {isPricingStep ?
          <button
            type="button"
            onClick={() =>
            onConfirm(sheets.filter((sheet) => sheet.kind !== 'skip'), priceIndex ?? 0)
            }
            className="flex items-center gap-1.5 rounded-lg bg-[#f5921f] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#db7214]">

              <CheckCircle2Icon className="h-4 w-4" />
              Nhập vào hệ thống
            </button> :

          <button
            type="button"
            disabled={inventoryCount === 0}
            onClick={() => setPriceIndex(defaultPriceIndex())}
            className="rounded-lg bg-[#f5921f] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#db7214] disabled:cursor-not-allowed disabled:bg-stone-300">

              Tiếp tục
            </button>
          }
        </div>
      </div>
    </div>);

}
