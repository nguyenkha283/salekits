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
import {
  parseWorkbookFile,
  parseWorkbookLink,
  type DetectedSheet } from
'../parseWorkbook';
import { buildInventory } from '../inventoryParser';
import { diffInventory, isEmptyDiff, summarizeDiff, type InventoryDiff } from '../inventoryDiff';
import type { InventorySource } from './InventorySetup';

export interface UpstreamChange {
  time: string;
  by: string;
}

interface InventorySourceBarProps {
  source: InventorySource;
  onResynced: (source: InventorySource) => void;
  /** Thay đổi phía chủ đầu tư, do trang CMS phát hiện. */
  upstream?: UpstreamChange | null;
  /** Mất quyền đọc file nguồn. */
  accessLost?: boolean;
}

type Stage = 'idle' | 'warning' | 'source' | 'picking' | 'diff';

/**
 * Thanh nguồn dữ liệu bảng hàng, chỉ hiện trong CMS.
 *
 * Bảng hàng có nguồn RIÊNG, không thuộc thư mục Drive chung của dự án, nên nó
 * cần nút đồng bộ riêng thay vì dùng nút "Đồng bộ lại" trên thanh đầu.
 */
export function InventorySourceBar({
  source,
  onResynced,
  upstream = null,
  accessLost = false
}: InventorySourceBarProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [link, setLink] = useState(source.kind === 'link' ? source.label : '');
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  /** Lời nhắc khi đường đọc không lấy được đủ thông tin. */
  const [degraded, setDegraded] = useState('');
  const [sheets, setSheets] = useState<DetectedSheet[] | null>(null);
  const [modifiedTime, setModifiedTime] = useState('');
  const [diff, setDiff] = useState<InventoryDiff | null>(null);
  const [pending, setPending] = useState<InventorySource | null>(null);
  const [forceApply, setForceApply] = useState(false);

  /**
   * Ngưỡng an toàn: khác biệt vượt quá 30% số căn gần như luôn là do ánh xạ
   * cột lệch chứ không phải chủ đầu tư đổi thật. Chặn lại để tránh ghi đè
   * bảng hàng bằng dữ liệu đọc sai.
   */
  const affected = diff ?
  diff.added.length + diff.removed.length + diff.changed.length :
  0;
  const total = affected + (diff?.unchangedCount ?? 0);
  const changeRatio = total ? Math.round(affected / total * 100) : 0;
  const tooManyChanges = Boolean(diff) && total > 20 && changeRatio > 30;

  const nextLabel = file ? file.name : link.trim();
  const inventorySheets = source.sheets.filter((sheet) => sheet.kind === 'inventory').length;
  const fundSheets = source.sheets.filter((sheet) => sheet.kind === 'fund').length;

  async function handleParse() {
    if (!nextLabel || isParsing) return;
    setIsParsing(true);
    setError('');
    try {
      const result = file ?
      await parseWorkbookFile(file) :
      await parseWorkbookLink(link.trim());
      if (!result.sheets.length) throw new Error('File không có sheet nào đọc được.');
      setDegraded(result.degraded ?? '');
      setModifiedTime(result.modifiedTime ?? '');
      setSheets(result.sheets);
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
    setDiff(null);
    setPending(null);
    setForceApply(false);
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

        {accessLost ?
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded bg-[#fbedeb] px-2 py-1 text-[11px] font-semibold text-[#992d22]">
            <AlertTriangleIcon className="h-3.5 w-3.5" />
            Mất quyền đọc file nguồn
          </span> :
        upstream ?
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded bg-[#fdf3e2] px-2 py-1 text-[11px] font-semibold text-[#92600a]">
            <AlertTriangleIcon className="h-3.5 w-3.5" />
            Chủ đầu tư đã sửa file {new Date(upstream.time).toLocaleString('vi-VN')}
            {upstream.by && ` · ${upstream.by}`}
          </span> :

        <span className="shrink-0 text-[11px] text-stone-400">
            Đồng bộ {new Date(source.syncedAt).toLocaleString('vi-VN')}
          </span>
        }

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
          className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[12px] font-semibold text-white transition-colors ${
          upstream ? 'bg-[#f5921f] hover:bg-[#db7214]' : 'bg-[#4a3728] hover:bg-[#33251a]'}`
          }>

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

      {stage === 'diff' && diff && pending &&
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div
          role="dialog"
          aria-modal="true"
          className="flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

            <div className="border-b border-[#eee4d5] px-5 py-4">
              <h3 className="text-base font-bold text-[#3b2c1d]">
                Chủ đầu tư đã thay đổi những gì
              </h3>
              <p className="mt-0.5 text-[12px] text-stone-500">
                {summarizeDiff(diff)} · {diff.unchangedCount} căn giữ nguyên
              </p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {tooManyChanges &&
              <div className="rounded-lg border border-[#efcfca] bg-[#fbedeb] p-3">
                  <p className="flex gap-2 text-[13px] font-semibold text-[#992d22]">
                    <AlertTriangleIcon className="mt-px h-4 w-4 shrink-0" />
                    Thay đổi bất thường — đã tạm chặn áp dụng
                  </p>
                  <p className="mt-1.5 pl-6 text-[12px] leading-relaxed text-[#992d22]">
                    {changeRatio}% số căn bị ảnh hưởng. Mức này thường do chủ đầu
                    tư đổi cấu trúc file khiến ánh xạ cột lệch, chứ hiếm khi là
                    thay đổi kinh doanh thật. Hãy kiểm tra lại việc chọn sheet và
                    ánh xạ cột trước khi áp dụng.
                  </p>
                </div>
              }

              {isEmptyDiff(diff) &&
              <p className="rounded-lg bg-[#e7f6f0] p-3 text-[13px] text-[#0a6e4c]">
                  Bảng hàng không có thay đổi nào so với lần đồng bộ trước.
                </p>
              }

              {diff.added.length > 0 &&
              <DiffGroup
                tone="ok"
                title={`${diff.added.length} căn mới được bổ sung`}
                items={diff.added.map((unit) => unit.code)} />

              }

              {diff.removed.length > 0 &&
              <DiffGroup
                tone="danger"
                title={`${diff.removed.length} căn bị gỡ khỏi bảng hàng`}
                items={diff.removed.map((unit) => unit.code)} />

              }

              {diff.changed.length > 0 &&
              <div>
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wider text-stone-400">
                    {diff.changed.length} căn đổi thông tin
                  </p>
                  <div className="space-y-1.5">
                    {diff.changed.slice(0, 30).map((entry) =>
                  <div
                    key={entry.unit.code}
                    className="rounded-lg border border-[#e9e1d5] px-3 py-2">

                        <p className="font-mono text-[12px] font-bold text-[#3b2c1d]">
                          {entry.unit.code}
                        </p>
                        {entry.changes.map((change) =>
                    <p key={change.field} className="text-[11.5px] text-stone-600">
                            {change.field}:{' '}
                            <span className="text-stone-400 line-through">{change.before}</span>
                            {' → '}
                            <b className="text-[#3b2c1d]">{change.after}</b>
                          </p>
                    )}
                      </div>
                  )}
                    {diff.changed.length > 30 &&
                  <p className="text-[11.5px] text-stone-400">
                        và {diff.changed.length - 30} căn nữa
                      </p>
                  }
                  </div>
                </div>
              }
            </div>

            <div className="flex items-center gap-3 border-t border-[#eee4d5] px-5 py-3.5">
              {tooManyChanges ?
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#992d22]">
                  <input
                  type="checkbox"
                  checked={forceApply}
                  onChange={(event) => setForceApply(event.target.checked)}
                  className="accent-[#c0392b]" />

                  Tôi đã kiểm tra, vẫn muốn áp dụng
                </label> :

              <span className="text-[12px] text-stone-500">
                  Áp dụng sẽ ghi đè bảng hàng hiện tại
                </span>
              }
              <button
              type="button"
              onClick={close}
              className="ml-auto rounded-lg border border-[#e0d2bd] px-3 py-2 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-[#faf6ef]">

                Để sau
              </button>
              <button
              type="button"
              disabled={tooManyChanges && !forceApply}
              onClick={() => {
                onResynced(pending);
                close();
              }}
              className="rounded-lg bg-[#f5921f] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#db7214] disabled:cursor-not-allowed disabled:bg-stone-300">

                Áp dụng thay đổi
              </button>
            </div>
          </div>
        </div>
      }

      {stage === 'picking' && sheets &&
      <SheetPickerDialog
        sheets={sheets}
        sourceLabel={nextLabel}
        degraded={degraded}
        onCancel={close}
        onConfirm={(picked, priceIndex) => {
          const next: InventorySource = {
            kind: file ? 'file' : 'link',
            label: nextLabel,
            syncedAt: new Date().toISOString(),
            sheets: picked,
            priceIndex,
            modifiedTime
          };
          // Không áp ngay: cho QLGD xem chủ đầu tư đã đổi gì trước đã.
          const before = buildInventory(source.sheets, source.priceIndex);
          const after = buildInventory(next.sheets, next.priceIndex);
          setPending(next);
          setDiff(diffInventory(before.units, after.units, after.priceIndex));
          setSheets(null);
          setStage('diff');
        }} />

      }
    </>);

}


/** Một nhóm khác biệt: căn mới hoặc căn bị gỡ. */
function DiffGroup({
  tone,
  title,
  items
}: {tone: 'ok' | 'danger';title: string;items: string[];}) {
  return (
    <div>
      <p
        className={`mb-2 text-[12px] font-bold uppercase tracking-wider ${
        tone === 'ok' ? 'text-[#0a6e4c]' : 'text-[#992d22]'}`
        }>

        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.slice(0, 40).map((code) =>
        <span
          key={code}
          className={`rounded px-2 py-0.5 font-mono text-[11.5px] font-semibold ${
          tone === 'ok' ? 'bg-[#e7f6f0] text-[#0a6e4c]' : 'bg-[#fbedeb] text-[#992d22]'}`
          }>

            {code}
          </span>
        )}
        {items.length > 40 &&
        <span className="text-[11.5px] text-stone-400">và {items.length - 40} căn nữa</span>
        }
      </div>
    </div>);

}
