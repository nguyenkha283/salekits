import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptySlot } from './EmptySlot';
import { ImageUploadButton, useExtraImages } from './EditableImage';
import { CompassIcon, MaximizeIcon, PauseIcon, PlayIcon, RotateCcwIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';

const MIN_ZOOM = 100;
const MAX_ZOOM = 260;
const AUTO_ROTATE_SPEED = 0.35; // px mỗi frame

interface Panorama360ContentProps {
  /** Ảnh 360 đồng bộ từ thư mục "04. Ảnh 360". */
  scenes?: {key: string;label: string;image: string;}[];
}

export function Panorama360Content({ scenes }: Panorama360ContentProps = {}) {
  const uploaded = useExtraImages('scene-360');
  const SCENES = useMemo(
    () => [
    ...scenes ?? [],
    ...uploaded.map((image, index) => ({
      key: `upload-${index}`,
      label: `Ảnh tải lên ${index + 1}`,
      image
    }))],

    [scenes, uploaded]
  );

  const [sceneKey, setSceneKey] = useState(SCENES[0]?.key ?? '');
  const [offset, setOffset] = useState(0);
  const [zoom, setZoom] = useState(140);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ pointerX: 0, offset: 0 });

  const scene = SCENES.find((item) => item.key === sceneKey) ?? SCENES[0];
  const hasScenes = SCENES.length > 0;

  // Tự động xoay
  useEffect(() => {
    if (!isAutoRotating || isDragging) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    function step() {
      setOffset((current) => current - AUTO_ROTATE_SPEED);
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isAutoRotating, isDragging]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { pointerX: event.clientX, offset };
    setIsDragging(true);
  }, [offset]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset(dragStart.current.offset + (event.clientX - dragStart.current.pointerX));
  }, [isDragging]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {setOffset((current) => current + 40);event.preventDefault();}
    if (event.key === 'ArrowRight') {setOffset((current) => current - 40);event.preventDefault();}
  }

  function selectScene(key: string) {
    setSceneKey(key);
    setOffset(0);
  }

  function resetView() {
    setOffset(0);
    setZoom(140);
    setIsAutoRotating(false);
  }

  function openFullscreen() {
    viewportRef.current?.requestFullscreen?.();
  }

  // Góc quay quy đổi 0–360° để hiển thị la bàn
  const heading = (-offset / 12 % 360 + 360) % 360;

  return (
    <section data-cms-section="p360" data-cms-label="Ảnh 360" aria-label="Ảnh 360 độ dự án">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Trải nghiệm thực tế</p>
          <h2 className="mt-2 text-2xl font-bold text-[#4a3728]">
            Ảnh 360°{scene ? ` — ${scene.label}` : ''}
          </h2>
        </div>
        <p className="text-sm text-stone-500">Kéo chuột để xoay, dùng phím ← → hoặc nút phóng to để quan sát kỹ hơn.</p>
      </div>

      {!hasScenes &&
      <EmptySlot
        label="Tải ảnh 360° lên"
        source="04. Ảnh 360"
        className="mt-6 aspect-[16/9] w-full rounded-lg" />

      }

      <div className="mt-4">
        <ImageUploadButton collectionKey="scene-360" label="Tải ảnh 360° từ máy" />
      </div>

      {/* Khung xem 360 */}
      {hasScenes &&
      <div
        ref={viewportRef}
        role="application"
        aria-label={`Khung xem 360 độ: ${scene?.label ?? ''}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative mt-6 aspect-[16/9] w-full touch-none select-none overflow-hidden rounded-lg bg-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] focus-visible:ring-offset-2 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'}`
        }>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: scene ? `url(${scene.image})` : undefined,
            backgroundRepeat: 'repeat-x',
            backgroundSize: `auto ${zoom}%`,
            backgroundPosition: `${offset}px center`
          }}
          aria-hidden="true" />


        {/* Viền tối giả chiều sâu ống kính */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.45)_100%)]" aria-hidden="true" />

        {/* La bàn */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          <CompassIcon className="h-4 w-4" style={{ transform: `rotate(${heading}deg)` }} />
          {Math.round(heading)}°
        </div>

        {/* Thanh điều khiển */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 px-2 py-1.5 backdrop-blur-sm">
          <ViewerButton label={isAutoRotating ? 'Dừng xoay tự động' : 'Xoay tự động'} onClick={() => setIsAutoRotating((current) => !current)}>
            {isAutoRotating ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </ViewerButton>
          <ViewerButton label="Thu nhỏ" onClick={() => setZoom((current) => Math.max(MIN_ZOOM, current - 20))} disabled={zoom <= MIN_ZOOM}>
            <ZoomOutIcon className="h-4 w-4" />
          </ViewerButton>
          <ViewerButton label="Phóng to" onClick={() => setZoom((current) => Math.min(MAX_ZOOM, current + 20))} disabled={zoom >= MAX_ZOOM}>
            <ZoomInIcon className="h-4 w-4" />
          </ViewerButton>
          <ViewerButton label="Đặt lại góc nhìn" onClick={resetView}>
            <RotateCcwIcon className="h-4 w-4" />
          </ViewerButton>
          <ViewerButton label="Toàn màn hình" onClick={openFullscreen}>
            <MaximizeIcon className="h-4 w-4" />
          </ViewerButton>
        </div>
      </div>
      }

      {/* Chọn điểm nhìn */}
      {hasScenes &&
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SCENES.map((item) => {
          const isActive = item.key === sceneKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => selectScene(item.key)}
              aria-pressed={isActive}
              className={`group relative overflow-hidden rounded-md border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] ${
              isActive ? 'border-[#f5921f]' : 'border-transparent hover:border-stone-300'}`
              }>
              <img src={item.image} alt="" className="aspect-[4/3] w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-6 text-left text-xs font-semibold text-white">
                {item.label}
              </span>
            </button>);

        })}
      </div>
      }

      {hasScenes &&
      <p className="mt-5 rounded-md border-l-4 border-[#f5921f] bg-[#fdf8ee] px-4 py-3 text-sm leading-6 text-[#5f5347]">
        Ảnh panorama 360° cần tỉ lệ 2:1, dạng equirectangular thì điểm đầu và cuối ảnh mới nối liền và góc nhìn xoay trọn vòng.
      </p>
      }
    </section>);

}

interface ViewerButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function ViewerButton({ label, onClick, disabled = false, children }: ViewerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
      {children}
    </button>);

}