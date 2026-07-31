import React, { useState } from 'react';
import { ExternalLinkIcon, FileTextIcon, FolderIcon, XIcon } from 'lucide-react';
import { isImageItem, type MediaGroup, type MediaItem } from '../syncedMedia';

interface SyncedGalleryProps {
  groups: MediaGroup[];
  /** Tiêu đề chung, ví dụ tên tab. */
  title?: string;
}

/**
 * Hiển thị ảnh và tài liệu lấy từ Google Drive. Ảnh sắp theo tên file, đúng
 * thứ tự Drive API trả về sau khi đã sort ở lớp driveTree.
 */
export function SyncedGallery({ groups, title }: SyncedGalleryProps) {
  const [preview, setPreview] = useState<MediaItem | null>(null);

  if (!groups.length) return null;

  return (
    <div className="space-y-8">
      {title &&
      <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-[#3b2c1d]">{title}</h2>
          <span className="rounded bg-[#e6f0e8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2c6e3f]">
            Đồng bộ từ Drive
          </span>
        </div>
      }

      {groups.map((group) =>
      <section key={group.id}>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-[15px] font-bold text-[#3b2c1d]">{group.label}</h3>
            <span className="text-xs text-stone-500">{group.items.length} mục</span>
            {group.folder &&
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-400">
                <FolderIcon className="h-3 w-3" />
                {group.folder}
              </span>
          }
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {group.items.map((item, index) =>
          isImageItem(item) ?
          <button
            key={item.id}
            type="button"
            onClick={() => setPreview(item)}
            className="group overflow-hidden rounded-lg border border-[#e9e1d5] bg-white text-left transition-shadow hover:shadow-md">

                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                src={item.url}
                alt={item.caption || item.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />

                    <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-[12px] font-semibold text-stone-700">
                      {item.caption || item.name}
                    </p>
                    {item.caption &&
              <p className="truncate font-mono text-[10px] text-stone-400">
                        {item.name}
                      </p>
              }
                  </div>
                </button> :

          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg border border-[#e9e1d5] bg-white p-3 transition-colors hover:bg-[#faf6ef]">

                  <FileTextIcon className="h-5 w-5 shrink-0 text-[#b08e5c]" />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-stone-700">
                    {item.name}
                  </span>
                  <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                </a>

          )}
          </div>
        </section>
      )}

      {preview &&
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
        onClick={() => setPreview(null)}
        role="presentation">

          <button
          type="button"
          onClick={() => setPreview(null)}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          aria-label="Đóng">

            <XIcon className="h-5 w-5" />
          </button>
          <figure className="max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <img
            src={preview.url}
            alt={preview.caption || preview.name}
            className="max-h-[80vh] w-auto rounded-lg object-contain" />

            <figcaption className="mt-3 text-center text-sm text-white/80">
              {preview.caption || preview.name}
            </figcaption>
          </figure>
        </div>
      }
    </div>);

}
