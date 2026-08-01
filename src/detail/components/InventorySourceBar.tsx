import React, { useState } from 'react';
import {
  AlertTriangleIcon,
  ExternalLinkIcon,
  FileSpreadsheetIcon,
  LinkIcon,
  Loader2Icon,
  RefreshCwIcon,
  UploadIcon,
  XIcon } from
'lucide-react';
import { SheetPickerDialog } from './SheetPickerDialog';
import { parseWorkbookFile, parseWorkbookLink, type DetectedSheet } from '../parseWorkbook';
import type { InventorySource } from './InventorySetup';

interface InventorySourceBarProps {
  source: InventorySource;
  onResynced: (source: InventorySource) => void;
}

type Stage = 'idle' | 'warning' | 'source' | 'picking';

/**
 * Thanh nguồn dữ liệu bảng hàng, chỉ hiện trong CMS.
 *
 * Bảng hàng có nguồn RIÊNG, không thuộc thư mục Drive chung của dự án, nên nó
 * cần nút đồng bộ riêng thay vì dùng nút "Đồng bộ lại" trên thanh đầu.
 */
export function InventorySourceBar({ source, onResynced }: InventorySourceBarProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [link, setLink] = useState(source.kind === 'link' ? source.label : '');
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [sheets, setSheets] = useState<DetectedSheet[] | null>(null);

  const nextLabel = file ? file.name : link.trim();
  const inventorySheets = source.sheets.filter((sheet) => sheet.kind === 'inventory').length;
  const fundSheets = source.sheets.filter((sheet) => sheet.kind === 'fund').length;

  async function handleParse() {
    if (!nextLabel || isParsing) return;
    setIsParsing(true);
    setError('');
    try {
      const detected = file ?
      await parseWorkbookFile(file) :
      await parseWorkbookLink(link.trim());
      if (!detected.length) throw new Error('File không có sheet nào đọc được.');
      setSheets(detected);
      setStage('picking');
    } catch (parseError) {
      setError(
        parseError instanceof Error ? parseError.message : 'Không đọc được file.'
      );
    } finally {
      setIsParsing(false);
    }
  }

  function close() {
    setStage('idle');
    setSheets(null);
    setFile(null);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-[#e0d2bd] bg-white px-4 py-3">
        <FileSpreadsheetIcon className="h-4 w-4 shrink-0 text-[#8a6a3f]" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-[12px]">
            <span className="font-semibold text-[#3b2c1d]">Nguồn bảng hàng</span>
            <span className="rounded bg-[#f3ece1] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a6a3f]">
              {source.kind === 'link' ? 'Google Sheet' : 'File Excel'}
            </span>
            <span className="text-stone-500">
              {inventorySheets} sheet bảng hàng · {fundSheets} sheet quỹ
            </span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate font-mono text-[11px] text-stone-400">
            {source.kind === 'link' && <LinkIcon className="h-3 w-3 shrink-0" />}
            <span className="truncate">{source.label}</span>
          </p>
        </div>

        <span className="shrink-0 text-[11px] text-stone-400">
          Đồng bộ {new Date(source.syncedAt).toLocaleString('vi-VN')}
        </span>

        {source.kind === 'link' &&
        <a
          href={source.label}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#e0d2bd] text-stone-600 transition-colors hover:bg-[#faf6ef]"
          title="Mở file nguồn">

            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </a>
        }

        <button
          type="button"
          onClick={() => setStage('warning')}
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-[#4a3728] px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#33251a]">

          <RefreshCwIcon className="h-3.5 w-3.5" />
          Đồng bộ lại bảng hàng
        </button>
      </div>

      {/* ── Cảnh báo trước khi cho đồng bộ ────────────────────────── */}
      {stage === 'warning' &&
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resync-warning-title"
          className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">

            <div className="flex items-start gap-3 border-b border-[#eee4d5] px-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fdecea]">
                <AlertTriangleIcon className="h-4.5 w-4.5 text-[#c0392b]" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 id="resync-warning-title" className="text-base font-bold text-[#3b2c1d]">
                  Đồng bộ lại sẽ ghi đè toàn bộ bảng hàng
                </h3>
                <p className="mt-0.5 text-[12px] text-stone-500">
                  Đọc kỹ trước khi tiếp tục.
                </p>
              </div>
              <button
              type="button"
              onClick={close}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
              aria-label="Đóng">

                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-4">
              <ul className="space-y-2 text-[13px] leading-relaxed text-stone-700">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c0392b]" />
                  <span>
                    Toàn bộ dữ liệu căn hiện có <b>bị thay thế</b> bằng nội dung
                    của file mới.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c0392b]" />
                  <span>
                    Căn <b>không còn trong file mới sẽ bị gỡ</b> khỏi bảng hàng,
                    quỹ căn và mặt bằng.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c97a0a]" />
                  <span>
                    Tình trạng căn lấy theo file. Hệ thống không giữ lại thay đổi
                    thủ công nào.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0e9f6e]" />
                  <span>
                    File của lần đồng bộ này <b>được lưu lại</b>, có thể khôi phục
                    về lần trước.
                  </span>
                </li>
              </ul>

              <p className="rounded-lg bg-[#faf6ef] p-3 text-[12px] leading-relaxed text-stone-600">
                Nội dung các tab khác và ảnh đồng bộ từ Drive <b>không bị ảnh
                hưởng</b> — bảng hàng là nguồn dữ liệu riêng.
              </p>
            </div>

            <div className="flex items-center gap-3 border-t border-[#eee4d5] px-5 py-3.5">
              <button
              type="button"
              onClick={close}
              className="ml-auto rounded-lg border border-[#e0d2bd] px-3 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef]">

                Hủy
              </button>
              <button
              type="button"
              onClick={() => setStage('source')}
              className="rounded-lg bg-[#c0392b] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#a03024]">

                Tôi hiểu, tiếp tục
              </button>
            </div>
          </div>
        </div>
      }

      {/* ── Chọn nguồn mới ────────────────────────────────────────── */}
      {stage === 'source' &&
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resync-source-title"
          className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">

            <div className="flex items-start gap-3 border-b border-[#eee4d5] px-5 py-4">
              <div className="min-w-0 flex-1">
                <h3 id="resync-source-title" className="text-base font-bold text-[#3b2c1d]">
                  Nguồn bảng hàng mới
                </h3>
                <p className="mt-0.5 text-[12px] text-stone-500">
                  Giữ nguyên liên kết cũ hoặc chọn file khác.
                </p>
              </div>
              <button
              type="button"
              onClick={close}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-stone-400 transition-colors hover:bg-[#faf6ef] hover:text-stone-700"
              aria-label="Đóng">

                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-4">
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
              </label>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-[#eee4d5]" />
                <span className="text-[11px] text-stone-400">hoặc</span>
                <span className="h-px flex-1 bg-[#eee4d5]" />
              </div>

              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-[#e0d2bd] px-4 py-5 text-center transition-colors hover:border-[#f5921f] hover:bg-[#faf6ef]">
                <UploadIcon className="h-5 w-5 text-[#b08e5c]" />
                <span className="text-[13px] font-semibold text-stone-700">
                  {file ? file.name : 'Chọn file Excel từ máy tính'}
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
            <p className="mx-5 mb-3 flex gap-2 rounded-lg border border-[#efcfca] bg-[#fbedeb] p-3 text-[12px] leading-relaxed text-[#992d22]">
                <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            }

            <div className="flex items-center gap-3 border-t border-[#eee4d5] px-5 py-3.5">
              <button
              type="button"
              onClick={close}
              className="ml-auto rounded-lg border border-[#e0d2bd] px-3 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef]">

                Hủy
              </button>
              <button
              type="button"
              onClick={handleParse}
              disabled={!nextLabel || isParsing}
              className="flex items-center gap-1.5 rounded-lg bg-[#f5921f] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#db7214] disabled:cursor-not-allowed disabled:bg-stone-300">

                {isParsing ?
              <>
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    Đang đọc…
                  </> :

              'Đọc file'
              }
              </button>
            </div>
          </div>
        </div>
      }

      {stage === 'picking' && sheets &&
      <SheetPickerDialog
        sheets={sheets}
        sourceLabel={nextLabel}
        onCancel={close}
        onConfirm={(picked) => {
          close();
          onResynced({
            kind: file ? 'file' : 'link',
            label: nextLabel,
            syncedAt: new Date().toISOString(),
            sheets: picked
          });
        }} />

      }
    </>);

}
