import React, { useState } from 'react';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileSpreadsheetIcon,
  LinkIcon,
  Loader2Icon,
  UploadIcon,
  XIcon } from
'lucide-react';

/** Phân loại sheet theo mục 3.5 và phụ lục 7.3 / 7.5 của SRS. */
export type SheetKind = 'building' | 'fund' | 'skip';

export interface ParsedSheet {
  name: string;
  rows: number;
  kind: SheetKind;
}

/**
 * Danh sách sheet giả lập kết quả bóc tách file. Bản thật do backend trả về
 * sau khi đọc Google Sheet hoặc file Excel đã tải lên.
 */
const DETECTED_SHEETS: ParsedSheet[] = [
{ name: 'Quy chung', rows: 55, kind: 'building' },
{ name: 'Quy doc quyen', rows: 48, kind: 'fund' },
{ name: 'Quy cheo', rows: 22, kind: 'fund' },
{ name: 'Ghi chu noi bo', rows: 12, kind: 'skip' }];


const KIND_LABEL: Record<SheetKind, string> = {
  building: 'Bảng hàng',
  fund: 'Quỹ căn',
  skip: 'Bỏ qua'
};

interface InventorySetupProps {
  /** Gọi khi người dùng hoàn tất chọn sheet — CMS chuyển sang hiển thị bảng. */
  onImported: (sheets: ParsedSheet[]) => void;
  /** Nhãn hiển thị, khác nhau giữa tab Bảng hàng và tab Mặt bằng quỹ căn. */
  context?: string;
}

/**
 * Trạng thái ban đầu của tab Bảng hàng: chưa có dữ liệu, chỉ có ô nhập link
 * hoặc tải file. Sau khi bóc tách sheet và người dùng xác nhận thì mới hiện
 * bảng hàng đầy đủ.
 */
export function InventorySetup({ onImported, context = 'bảng hàng' }: InventorySetupProps) {
  const [link, setLink] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [sheets, setSheets] = useState<ParsedSheet[] | null>(null);

  const hasSource = link.trim().length > 0 || fileName.length > 0;

  function handleParse() {
    if (!hasSource || isParsing) return;
    setIsParsing(true);
    // Giả lập thời gian backend đọc file và bóc tách sheet.
    window.setTimeout(() => {
      setSheets(DETECTED_SHEETS.map((sheet) => ({ ...sheet })));
      setIsParsing(false);
    }, 900);
  }

  function setKind(index: number, kind: SheetKind) {
    setSheets((current) =>
    current ?
    current.map((sheet, i) => i === index ? { ...sheet, kind } : sheet) :
    current
    );
  }

  const buildingCount = sheets?.filter((sheet) => sheet.kind === 'building').length ?? 0;
  const fundCount = sheets?.filter((sheet) => sheet.kind === 'fund').length ?? 0;

  return (
    <>
      <section
        data-cms-section="inventory-setup"
        data-cms-label={`Nguồn dữ liệu ${context}`}
        className="mx-auto max-w-2xl py-4">

        <div className="rounded-xl border border-[#e9e1d5] bg-white p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f3ece1]">
              <FileSpreadsheetIcon className="h-5 w-5 text-[#8a6a3f]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#3b2c1d]">
                Chưa có dữ liệu {context}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
                Dán liên kết Google Sheet hoặc tải file Excel lên. Hệ thống sẽ
                đọc các sheet trong file để bạn chọn sheet cần nhập.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Liên kết Google Sheet
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-[#e0d2bd] px-3 focus-within:border-[#f5921f]">
                <LinkIcon className="h-4 w-4 shrink-0 text-stone-400" />
                <input
                  value={link}
                  onChange={(event) => {
                    setLink(event.target.value);
                    setFileName('');
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="h-10 min-w-0 flex-1 bg-transparent text-[13px] outline-none" />

              </div>
              <span className="mt-1.5 block text-[11px] text-stone-500">
                File cần đặt chế độ chia sẻ để hệ thống đọc được.
              </span>
            </label>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-[#eee4d5]" />
              <span className="text-[11px] text-stone-400">hoặc</span>
              <span className="h-px flex-1 bg-[#eee4d5]" />
            </div>

            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-[#e0d2bd] px-4 py-6 text-center transition-colors hover:border-[#f5921f] hover:bg-[#faf6ef]">
              <UploadIcon className="h-5 w-5 text-[#b08e5c]" />
              <span className="text-[13px] font-semibold text-stone-700">
                {fileName || 'Chọn file Excel từ máy tính'}
              </span>
              <span className="text-[11px] text-stone-500">
                Hỗ trợ .xlsx và .xls
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setFileName(file.name);
                    setLink('');
                  }
                }} />

            </label>
          </div>

          <button
            type="button"
            onClick={handleParse}
            disabled={!hasSource || isParsing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f5921f] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#db7214] disabled:cursor-not-allowed disabled:bg-stone-300">

            {isParsing ?
            <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Đang đọc các sheet…
              </> :

            'Đọc file'
            }
          </button>
        </div>
      </section>

      {/* ── Popup chọn sheet ─────────────────────────────────────── */}
      {sheets &&
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
                  Tìm thấy {sheets.length} sheet. Phân loại từng sheet — hệ thống
                  không tự đoán theo tên. Tòa nhà lấy từ cột trong dữ liệu, không
                  lấy từ tên sheet.
                </p>
              </div>
              <button
              type="button"
              onClick={() => setSheets(null)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
              aria-label="Đóng">

                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4">
              {sheets.map((sheet, index) =>
            <div
              key={sheet.name}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[#e9e1d5] p-3">

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] font-bold text-[#3b2c1d]">
                      {sheet.name}
                    </p>
                    <p className="text-[11px] text-stone-500">{sheet.rows} dòng dữ liệu</p>
                  </div>
                  <div className="flex gap-1 rounded-lg bg-[#f3ece1] p-1">
                    {(['building', 'fund', 'skip'] as SheetKind[]).map((kind) =>
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

              {buildingCount === 0 &&
            <p className="flex gap-2 rounded-lg border border-[#f0dcb6] bg-[#fdf3e2] p-3 text-[12px] leading-relaxed text-[#92600a]">
                  <AlertTriangleIcon className="mt-px h-4 w-4 shrink-0" />
                  Cần ít nhất một sheet Bảng hàng để nhập dữ liệu.
                </p>
            }
            </div>

            <div className="flex items-center gap-3 border-t border-[#eee4d5] px-5 py-3.5">
              <span className="text-[12px] text-stone-500">
                {buildingCount} sheet bảng hàng · {fundCount} sheet quỹ
              </span>
              <button
              type="button"
              onClick={() => setSheets(null)}
              className="ml-auto rounded-lg border border-[#e0d2bd] px-3 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef]">

                Hủy
              </button>
              <button
              type="button"
              disabled={buildingCount === 0}
              onClick={() => onImported(sheets.filter((sheet) => sheet.kind !== 'skip'))}
              className="flex items-center gap-1.5 rounded-lg bg-[#f5921f] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#db7214] disabled:cursor-not-allowed disabled:bg-stone-300">

                <CheckCircle2Icon className="h-4 w-4" />
                Nhập vào hệ thống
              </button>
            </div>
          </div>
        </div>
      }
    </>);

}
