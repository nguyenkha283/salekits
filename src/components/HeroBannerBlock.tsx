import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from 'lucide-react';
import { HeroSlide } from '../types/cms';
type DisplayMode = 'editor' | 'preview';
interface HeroBannerBlockProps {
  slides: HeroSlide[];
  activeSlide: number;
  canEdit: boolean;
  displayMode: DisplayMode;
  onActiveSlideChange: (index: number) => void;
  onSelect: () => void;
  onRequestUpload: () => void;
}
export function HeroBannerBlock({
  slides,
  activeSlide,
  canEdit,
  displayMode,
  onActiveSlideChange,
  onSelect,
  onRequestUpload
}: HeroBannerBlockProps) {
  const hasSlides = slides.length > 0;
  const canNavigate = slides.length > 1;
  const isEditor = displayMode === 'editor';
  const currentSlide =
  slides[Math.min(activeSlide, Math.max(slides.length - 1, 0))];
  function showPrevious() {
    onActiveSlideChange(activeSlide === 0 ? slides.length - 1 : activeSlide - 1);
  }
  function showNext() {
    onActiveSlideChange(activeSlide === slides.length - 1 ? 0 : activeSlide + 1);
  }
  return (
    <section
      className={`mt-[46px] bg-white ${isEditor && canEdit ? 'border border-dashed border-[#6D3A18]' : ''}`}
      aria-label="Khối hero banner">
      
      {hasSlides && currentSlide ?
      <div
        className={`relative aspect-[1554/867] w-full overflow-hidden bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400 ${isEditor && canEdit ? 'cursor-pointer' : ''}`}
        role={isEditor && canEdit ? 'button' : undefined}
        tabIndex={isEditor && canEdit ? 0 : undefined}
        onClick={isEditor && canEdit ? onSelect : undefined}
        onKeyDown={
        isEditor && canEdit ?
        (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          }
        } :
        undefined
        }
        aria-label={
        isEditor && canEdit ?
        'Chọn hero banner để chỉnh sửa' :
        'Hero banner'
        }>
        
          <img
          src={currentSlide.url}
          alt={currentSlide.alt || `Slide ${activeSlide + 1}`}
          className="h-full w-full object-cover" />
        
          {canNavigate &&
        <>
              <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            aria-label="Slide trước"
            className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white">
            
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Slide tiếp theo"
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white">
            
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <div
            className="absolute inset-x-0 bottom-3 flex justify-center gap-2"
            aria-label="Chọn slide">
            
                {slides.map((slide, index) =>
            <button
              key={slide.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onActiveSlideChange(index);
              }}
              aria-label={`Đi tới slide ${index + 1}`}
              aria-current={index === activeSlide}
              className={`h-2 w-2 rounded-full ring-1 ring-white transition ${index === activeSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`} />

            )}
              </div>
            </>
        }
        </div> :
      isEditor ?
      <button
        type="button"
        disabled={!canEdit}
        onClick={onRequestUpload}
        className="flex min-h-56 w-full flex-col items-center justify-center bg-[#fffaf5] px-6 text-center transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400">
        
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#6D3A18] shadow-sm">
            <ImageIcon className="h-5 w-5" />
          </span>
          <span className="mt-3 text-sm font-semibold text-[#6D3A18]">
            Tải lên slide ảnh
          </span>
          <span className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">
            Chấp nhận JPEG, JPG, PNG. Dung lượng tối đa 50MB · Kích thước khuyến
            nghị 1554 × 867px.
          </span>
        </button> :

      <div
        className="aspect-[1554/867] w-full bg-neutral-100"
        aria-hidden="true" />

      }
    </section>);

}