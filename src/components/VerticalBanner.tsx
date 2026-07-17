import React, { useRef } from 'react';
import { EyeIcon, ImageIcon } from 'lucide-react';
import { HeroSlide } from '../types/cms';
type DisplayMode = 'editor' | 'preview';
interface VerticalBannerProps {
  label: string;
  image: HeroSlide | null;
  canEdit: boolean;
  displayMode: DisplayMode;
  onSelect: () => void;
  onUpload: (file: File) => void;
}
export function VerticalBanner({
  label,
  image,
  canEdit,
  displayMode,
  onSelect,
  onUpload
}: VerticalBannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditor = displayMode === 'editor';
  const indicatorClassName =
  isEditor && canEdit ? 'border border-dashed border-[#6D3A18]' : '';
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
  }
  if (!isEditor && !image) return null;
  return (
    <aside
      className="hidden h-screen min-w-0 self-start border border-neutral-200 bg-white lg:flex"
      aria-label={label}>
      
      {isEditor &&
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={handleFileChange} />

      }
      {image ?
      isEditor && canEdit ?
      <button
        type="button"
        onClick={onSelect}
        className={`group relative h-full w-full overflow-hidden bg-neutral-100 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${indicatorClassName}`}
        aria-label={`Chỉnh sửa ${label}`}>
        
            <img
          src={image.url}
          alt={image.alt || label}
          className="h-full w-full object-cover" />
        
          </button> :

      <div className="relative h-full w-full overflow-hidden bg-neutral-100">
            <img
          src={image.url}
          alt={image.alt || label}
          className="h-full w-full object-cover" />
        
            {isEditor &&
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/60 p-2 text-xs font-medium text-white">
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
                Chỉ xem
              </span>
        }
          </div> :

      isEditor ?
      <button
        type="button"
        disabled={!canEdit}
        onClick={() => inputRef.current?.click()}
        className={`flex h-full w-full flex-col items-center justify-center px-3 text-center transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${indicatorClassName}`}>
        
          {canEdit ?
        <ImageIcon className="h-5 w-5 text-[#6D3A18]" /> :

        <EyeIcon className="h-5 w-5 text-neutral-400" />
        }
          <span className="mt-2 text-xs font-semibold text-neutral-600">
            {canEdit ? 'Tải ảnh banner' : 'Banner trống'}
          </span>
          <span className="mt-1 max-w-[180px] text-[11px] leading-4 text-neutral-500">
            Chấp nhận JPEG, JPG, PNG. Dung lượng tối đa 50MB.
          </span>
          <span className="mt-1 text-[11px] leading-4 text-neutral-500">
            Kích thước khuyến nghị 284 × 1142px.
          </span>
        </button> :
      null}
    </aside>);

}