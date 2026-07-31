import React, { useState } from 'react';
import { DownloadIcon, FileTextIcon, PlayIcon } from 'lucide-react';

const TRAINING_VIDEO = {
  poster: '/ecad2fff-460f-457c-8688-eff20828df9d.jpg',
  /** Thay bằng link nhúng video thật (YouTube/Vimeo/CDN nội bộ). */
  embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
  title: '[TOÀN CẢNH BĐS T04.2026] TOP 6 LÝ DO NÊN SỞ HỮU BĐS NGAY!'
};

const TRAINING_SUMMARY =
'Imperia Sky Park là tổ hợp chung cư cao cấp – dịch vụ thương mại nằm tại ô HH3 Nam An Khánh, An Khánh, thành phố Hà Nội. Dự án có quy mô hơn 4ha gồm 6 toà căn hộ cao cấp, cung cấp ra thị trường khoảng hơn 3000 căn hộ thuộc phân khúc I Series của MIK Group.';

const TRAINING_FILES = [
{ name: 'Recap-Hop-Du-an-20032026.pdf', type: 'PDF', href: '#' },
{ name: 'Bo-cau-hoi-thuong-gap.pdf', type: 'PDF', href: '#' }];


export function TrainingContent() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Video đào tạo */}
      <figure>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-stone-900">
          {isPlaying ?
          <iframe
            src={TRAINING_VIDEO.embedUrl}
            title={TRAINING_VIDEO.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full" /> :


          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label={`Phát video: ${TRAINING_VIDEO.title}`}
            className="group absolute inset-0 h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] focus-visible:ring-offset-2">
              <img src={TRAINING_VIDEO.poster} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" aria-hidden="true" />
              <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                <PlayIcon className="ml-0.5 h-6 w-6 fill-current" />
              </span>
            </button>}

        </div>
        <figcaption className="mt-3 text-center text-sm font-medium text-[#4a3728] sm:text-[15px]">
          {TRAINING_VIDEO.title}
        </figcaption>
      </figure>

      {/* Nội dung */}
      <section className="mt-10 border-t border-stone-200 pt-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#4a3728]">
          <FileTextIcon className="h-5 w-5 text-[#f5921f]" />
          Nội dung
        </h2>
        <div className="mt-4 rounded-lg border border-stone-200 border-l-4 border-l-[#f5921f] bg-white px-5 py-4">
          <p className="text-[15px] leading-7 text-stone-700">{TRAINING_SUMMARY}</p>
        </div>
      </section>

      {/* Tài liệu đính kèm */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#4a3728]">
          <DownloadIcon className="h-5 w-5 text-[#f5921f]" />
          Tài liệu
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {TRAINING_FILES.map((file) =>
          <li key={file.name}>
              <a
              href={file.href}
              download
              className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3.5 transition-colors hover:border-[#f5921f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-red-50 text-red-500">
                  <FileTextIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[#4a3728]">{file.name}</span>
                  <span className="block text-xs text-stone-500">{file.type}</span>
                </span>
                <DownloadIcon className="h-4 w-4 shrink-0 text-stone-400" />
              </a>
            </li>
          )}
        </ul>
      </section>
    </div>);

}