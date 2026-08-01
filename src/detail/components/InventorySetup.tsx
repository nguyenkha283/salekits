import React, { useState } from 'react';
import {
  AlertTriangleIcon,
  FileSpreadsheetIcon,
  LinkIcon,
  Loader2Icon,
  UploadIcon } from
'lucide-react';
import { SheetPickerDialog } from './SheetPickerDialog';
import { parseWorkbookFile, parseWorkbookLink, type DetectedSheet } from '../parseWorkbook';

export interface InventorySource {
  kind: 'link' | 'file';
  label: string;
  syncedAt: string;
  sheets: DetectedSheet[];
  /** Cột giá người dùng chọn khi nhập. */
  priceIndex: number;
}

interface InventorySetupProps {
  /** Gọi khi người dùng hoàn tất chọn sheet — CMS chuyển sang hiển thị bảng. */
  onImported: (source: InventorySource) => void;
  /** Nhãn hiển thị, khác nhau giữa các tab phụ thuộc bảng hàng. */
  context?: string;
}

/**
 * Trạng thái ban đầu của tab Bảng hàng: chưa có dữ liệu, chỉ có ô nhập liên kết
 * hoặc tải file. Bảng hàng KHÔNG nằm trong thư mục Drive chung của dự án nên
 * đây là nguồn dữ liệu riêng.
 */
export function InventorySetup({ onImported, context = 'bảng hàng' }: InventorySetupProps) {
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [sheets, setSheets] = useState<DetectedSheet[] | null>(null);

  const sourceLabel = file ? file.name : link.trim();
  const hasSource = sourceLabel.length > 0;

  async function handleParse() {
    if (!hasSource || isParsing) return;
    setIsParsing(true);
    setError('');
    try {
      const detected = file ?
      await parseWorkbookFile(file) :
      await parseWorkbookLink(link.trim());
      if (!detected.length) throw new Error('File không có sheet nào đọc được.');
      setSheets(detected);
    } catch (parseError) {
      setError(
        parseError instanceof Error ? parseError.message : 'Không đọc được file.'
      );
    } finally {
      setIsParsing(false);
    }
  }

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
                Bảng hàng có nguồn riêng, không nằm trong thư mục Drive chung của
                dự án. Dán liên kết Google Sheet hoặc tải file Excel lên.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Liên kết Google Sheet hoặc file trên Drive
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-[#e0d2bd] px-3 focus-within:border-[#f5921f]">
                <LinkIcon className="h-4 w-4 shrink-0 text-stone-400" />
                <input
                  value={link}
                  onChange={(event) => {
                    setLink(event.target.value);
                    setFile(null);
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="h-10 min-w-0 flex-1 bg-transparent text-[13px] outline-none" />

              </div>
              <span className="mt-1.5 block text-[11px] text-stone-500">
                Nhận Google Sheet gốc và cả file .xlsx, .xls, .csv tải lên Drive.
                File cần được chia sẻ để hệ thống đọc được.
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
                {file ? file.name : 'Chọn file Excel từ máy tính'}
              </span>
              <span className="text-[11px] text-stone-500">
                Hỗ trợ .xlsx và .xls — hệ thống đọc trực tiếp danh sách sheet
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => {
                  const picked = event.target.files?.[0];
                  if (picked) {
                    setFile(picked);
                    setLink('');
                  }
                }} />

            </label>
          </div>

          {error &&
          <p className="mt-4 flex gap-2 rounded-lg border border-[#efcfca] bg-[#fbedeb] p-3 text-[12px] leading-relaxed text-[#992d22]">
              <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          }

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

      {sheets &&
      <SheetPickerDialog
        sheets={sheets}
        sourceLabel={sourceLabel}
        onCancel={() => setSheets(null)}
        onConfirm={(picked, priceIndex) => {
          setSheets(null);
          onImported({
            kind: file ? 'file' : 'link',
            label: sourceLabel,
            syncedAt: new Date().toISOString(),
            sheets: picked,
            priceIndex
          });
        }} />

      }
    </>);

}
