import React, { useMemo, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ExternalLinkIcon, EyeIcon, PlusCircleIcon } from 'lucide-react';

const GALLERY_IMAGES = [
'/af90a9a2-cfa1-4e06-bf16-c3467b5c5fff.jpg',
'/622df78d-e579-4f25-aef4-6c31185313c8.jpg',
'/ebd3240e-6608-4c50-8739-cfe41926dd74.jpg',
'/85bed7b1-ee07-4e5d-ae92-d9ea75fb82be.jpg',
'/73dda9ab-a667-4bd9-a168-fc13267d6901.jpg',
'/af1ffc9b-36a7-4608-9ff1-165cbcf660be.jpg'];


/** Số ảnh tiến độ của từng đợt cập nhật. */
const DEFAULT_PROGRESS_MONTHS = [
{ key: '2026-07', label: 'Tháng 7.2026', total: 63 },
{ key: '2026-06', label: 'Tháng 6.2026', total: 41 },
{ key: '2026-05', label: 'Tháng 5.2026', total: 28 },
{ key: '2026-04', label: 'Tháng 4.2026', total: 20 },
{ key: '2026-03', label: 'Tháng 3.2026', total: 17 },
{ key: '2026-02', label: 'Tháng 2.2026', total: 9 }];


const COLLAPSED_MONTHS = 3;
const PAGE_SIZE_OPTIONS = [20, 40, 60];

function buildPhotos(monthLabel: string, total: number) {
  return Array.from({ length: total }, (_, index) => ({
    id: `${monthLabel}-${index}`,
    src: GALLERY_IMAGES[index % GALLERY_IMAGES.length],
    alt: `Hình ảnh tiến độ ${monthLabel} — ảnh ${index + 1}`
  }));
}

/** Danh sách số trang hiển thị, chèn '…' khi có quá nhiều trang. */
function buildPageList(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages: Array<number | 'gap'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('gap');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('gap');
  pages.push(total);
  return pages;
}

interface ProgressContentProps {
  /** Ảnh tiến độ đồng bộ từ thư mục "06. Tiến độ". */
  photos?: {id: string;src: string;alt: string;}[];
}

export function ProgressContent({ photos: syncedPhotos }: ProgressContentProps = {}) {
  const hasSynced = Boolean(syncedPhotos && syncedPhotos.length);
  const PROGRESS_MONTHS = hasSynced ?
  [{ key: 'drive', label: 'Đồng bộ từ Drive', total: syncedPhotos!.length }] :
  DEFAULT_PROGRESS_MONTHS;

  const [activeMonth, setActiveMonth] = useState(PROGRESS_MONTHS[0].key);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const month = PROGRESS_MONTHS.find((item) => item.key === activeMonth) ?? PROGRESS_MONTHS[0];
  const photos = useMemo(() => hasSynced ? syncedPhotos! : buildPhotos(month.label, month.total), [hasSynced, syncedPhotos, month.label, month.total]);
  const visibleMonths = showAllMonths ? PROGRESS_MONTHS : PROGRESS_MONTHS.slice(0, COLLAPSED_MONTHS);

  const totalPages = Math.max(1, Math.ceil(photos.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagePhotos = photos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function selectMonth(key: string) {
    setActiveMonth(key);
    setPage(1);
  }

  return (
    <div data-cms-section="progress" data-cms-label="Ảnh tiến độ" className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-12">
      {/* Dòng thời gian các đợt cập nhật */}
      <aside>
        <h2 className="border-b border-stone-200 pb-4 text-center text-xl font-bold uppercase tracking-wide text-[#4a3728]">
          Tiến độ dự án
        </h2>

        <ol className="relative mt-6 space-y-3 pl-6">
          <span className="absolute bottom-4 left-[3px] top-4 w-px bg-[#4a3728]/30" aria-hidden="true" />
          {visibleMonths.map((item) => {
            const isActive = item.key === activeMonth;
            return (
              <li key={item.key} className="relative">
                <span className={`absolute -left-6 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full ${isActive ? 'bg-[#f5921f]' : 'bg-[#4a3728]'}`} aria-hidden="true" />
                <div className={`flex items-center justify-between gap-2 rounded-md border px-4 py-3 transition-colors ${
                isActive ?
                'border-[#f5921f] bg-[#fdf6ec]' :
                'border-transparent bg-stone-100 hover:bg-stone-200/70'}`
                }>
                  <button
                    type="button"
                    onClick={() => selectMonth(item.key)}
                    aria-pressed={isActive}
                    className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[#4a3728] focus:outline-none focus-visible:underline">
                    {item.label}
                  </button>
                  <span className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => selectMonth(item.key)}
                      aria-label={`Xem ảnh tiến độ ${item.label}`}
                      className="rounded p-1 text-stone-500 transition-colors hover:bg-white hover:text-[#f5921f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f]">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <a
                      href={GALLERY_IMAGES[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Mở ảnh tiến độ ${item.label} trong tab mới`}
                      className="rounded p-1 text-stone-500 transition-colors hover:bg-white hover:text-[#f5921f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f]">
                      <ExternalLinkIcon className="h-4 w-4" />
                    </a>
                  </span>
                </div>
              </li>);

          })}
        </ol>

        {PROGRESS_MONTHS.length > COLLAPSED_MONTHS &&
        <button
          type="button"
          onClick={() => setShowAllMonths((current) => !current)}
          className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-[#f5921f] focus:outline-none focus-visible:underline">
            <PlusCircleIcon className="h-4 w-4" />
            {showAllMonths ? 'Thu gọn' : 'Xem thêm'}
          </button>}

      </aside>

      {/* Thư viện ảnh tiến độ */}
      <section>
        <h3 className="inline-block border-b-2 border-[#f5921f] pb-2 text-base font-semibold text-[#4a3728]">
          Hình ảnh tiến độ
        </h3>

        {pagePhotos.length > 0 ?
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {pagePhotos.map((photo) =>
          <figure key={photo.id} className="group relative overflow-hidden rounded-sm bg-stone-100">
                <img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-2.5 pt-8 text-[11px] font-medium uppercase tracking-wide text-white">
                  Cập nhật tiến độ {month.label}
                </figcaption>
              </figure>
          )}
          </div> :

        <p className="mt-6 rounded-md border border-stone-200 bg-white px-4 py-16 text-center text-sm text-stone-500">
            Chưa có ảnh tiến độ cho đợt cập nhật này.
          </p>}


        {/* Phân trang */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-500">
            Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, photos.length)} / {photos.length} ảnh
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm sm:justify-end">
          <PagerButton label="Trang đầu" onClick={() => setPage(1)} disabled={currentPage === 1}>
            <ChevronsLeftIcon className="h-4 w-4" />
          </PagerButton>
          <PagerButton label="Trang trước" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeftIcon className="h-4 w-4" />
          </PagerButton>

          {buildPageList(currentPage, totalPages).map((entry, index) =>
            entry === 'gap' ?
            <span key={`gap-${index}`} className="px-1 text-stone-400">…</span> :

            <button
              key={entry}
              type="button"
              onClick={() => setPage(entry)}
              aria-current={entry === currentPage ? 'page' : undefined}
              className={`h-8 min-w-8 rounded border px-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] ${
              entry === currentPage ?
              'border-[#f5921f] bg-[#fdf6ec] text-[#4a3728]' :
              'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`
              }>
              {entry}
            </button>

            )}

          <PagerButton label="Trang sau" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
            <ChevronRightIcon className="h-4 w-4" />
          </PagerButton>
          <PagerButton label="Trang cuối" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
            <ChevronsRightIcon className="h-4 w-4" />
          </PagerButton>

          <label className="ml-2 flex items-center gap-2 text-stone-500">
            <span className="sr-only">Số ảnh mỗi trang</span>
            <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-8 rounded border border-stone-200 bg-white px-2 text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f]">
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <span className="whitespace-nowrap">/ tổng {photos.length}</span>
          </label>
          </div>
        </div>
      </section>
    </div>);

}

interface PagerButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

function PagerButton({ label, onClick, disabled, children }: PagerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded border border-stone-200 bg-white text-stone-500 transition-colors hover:border-stone-300 hover:text-[#4a3728] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f]">
      {children}
    </button>);

}