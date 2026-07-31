import React from 'react';
import { ExternalLinkIcon, InfoIcon } from 'lucide-react';

/** Thứ tự hiển thị theo cột: 1–4 cột trái, 5–8 cột giữa, 9–12 cột phải. */
const DOCUMENTS = [
{ label: 'File đào tạo', href: '#' },
{ label: 'TMB', href: '#' },
{ label: 'Mặt bằng tầng', href: '#' },
{ label: 'Layout căn hộ', href: '#' },
{ label: 'Hình ảnh', href: '#' },
{ label: 'Video', href: '#' },
{ label: 'Ảnh thực tế', href: '#' },
{ label: 'Trục căn', href: '#' },
{ label: 'Nhà mẫu', href: '#' },
{ label: 'Bản đồ vị trí', href: '#' },
{ label: 'Nhận diện thương hiệu', href: '#' },
{ label: 'Tiêu chuẩn bàn giao', href: '#' }];


const ROWS_PER_COLUMN = 4;

export function DocumentsContent() {
  return (
    <section aria-label="Tài liệu dự án">
      <header className="text-center">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-[#4a3728] sm:text-3xl">Tài liệu dự án</h2>
        <span className="mx-auto mt-3 block h-1 w-24 bg-[#f5921f]" aria-hidden="true" />
      </header>

      <ul className="mt-10 grid grid-cols-1 overflow-hidden rounded-lg border border-stone-200 bg-white lg:grid-flow-col lg:grid-cols-3 lg:grid-rows-4">
        {DOCUMENTS.map((document, index) => {
          const isLastColumn = index >= DOCUMENTS.length - ROWS_PER_COLUMN;
          const isLastInColumn = (index + 1) % ROWS_PER_COLUMN === 0;
          return (
            <li
              key={document.label}
              className={`flex items-center gap-3 border-b border-stone-200 px-4 py-3.5 last:border-b-0 ${
              isLastColumn ? '' : 'lg:border-r'} ${
              isLastInColumn ? 'lg:border-b-0' : ''}`
              }>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#f5921f] text-sm font-bold text-white">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide text-[#4a3728]">
                {document.label}
              </span>
              <a
                href={document.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Mở tài liệu ${document.label}`}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded bg-stone-100 text-stone-500 transition-colors hover:bg-[#fdeed8] hover:text-[#f5921f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f]">
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            </li>);

        })}
      </ul>

      <p className="mt-6 flex items-start gap-2.5 rounded-md border-l-4 border-[#f5921f] bg-[#fdf8ee] px-4 py-3.5 text-sm leading-6 text-[#5f5347]">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#f5921f]" />
        <span><strong className="font-semibold text-[#4a3728]">Lưu ý:</strong> Thông tin tài liệu dự án ban đầu có thể được cập nhật, chỉnh sửa theo từng đợt.</span>
      </p>
    </section>);

}