import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { ImagePlusIcon, UndoIcon, UploadIcon } from 'lucide-react';
import { EmptySlot } from './EmptySlot';

/**
 * Ảnh trong CMS đến từ hai nguồn: đồng bộ từ Google Drive, hoặc tải lên trực
 * tiếp từ máy. Ngữ cảnh này giữ phần tải lên để mọi component con dùng chung
 * mà không phải chuyền prop qua nhiều tầng.
 *
 * ⚠️ Ảnh tải tay ĐÈ LÊN ảnh Drive ở cùng vị trí và được giữ qua các lần đồng
 * bộ. Nếu muốn quay về ảnh Drive thì bấm Hoàn tác trên chính ô ảnh đó.
 */
export interface ImageSlotState {
  /** Bật khi đang ở CMS và vai trò có quyền sửa tab hiện tại. */
  editable: boolean;
  /** Ảnh tải tay thay cho một vị trí cố định, khóa theo slotKey. */
  overrides: Record<string, string>;
  /** Ảnh tải tay thêm vào một bộ sưu tập, khóa theo collectionKey. */
  extras: Record<string, string[]>;
  onUpload?: (slotKey: string, dataUrl: string) => void;
  onClear?: (slotKey: string) => void;
  onAddMany?: (collectionKey: string, dataUrls: string[]) => void;
  onRemoveExtra?: (collectionKey: string, index: number) => void;
}

const EMPTY_STATE: ImageSlotState = {
  editable: false,
  overrides: {},
  extras: {}
};

const ImageSlotContext = createContext<ImageSlotState>(EMPTY_STATE);

export function ImageSlotProvider({
  value,
  children
}: {value: ImageSlotState;children: React.ReactNode;}) {
  return (
    <ImageSlotContext.Provider value={value}>{children}</ImageSlotContext.Provider>);

}

export function useImageSlots(): ImageSlotState {
  return useContext(ImageSlotContext);
}

/** Ảnh tải tay thêm vào một bộ sưu tập, để component nối vào danh sách Drive. */
export function useExtraImages(collectionKey: string): string[] {
  const { extras } = useImageSlots();
  return useMemo(() => extras[collectionKey] ?? [], [extras, collectionKey]);
}

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/** Đọc các file hợp lệ thành data URL; file sai định dạng hoặc quá nặng bị bỏ. */
export function readImageFiles(files: FileList | null): Promise<string[]> {
  if (!files || files.length === 0) return Promise.resolve([]);
  const valid = Array.from(files).filter(
    (file) => ACCEPTED.includes(file.type) && file.size <= MAX_BYTES
  );
  return Promise.all(
    valid.map(
      (file) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.addEventListener('load', () =>
        resolve(typeof reader.result === 'string' ? reader.result : '')
        );
        reader.readAsDataURL(file);
      })
    )
  ).then((urls) => urls.filter(Boolean));
}

interface EditableImageProps {
  /** Định danh vị trí ảnh, phải ổn định giữa các lần render. */
  slotKey: string;
  /** Ảnh từ Drive. Bỏ trống thì hiện khối chỗ trống. */
  src?: string;
  alt: string;
  /** Lớp áp lên thẻ img, giữ nguyên như trước khi bọc. */
  className?: string;
  /** Lớp áp lên khung bọc — cần khi ảnh phải lấp đầy ô cha. */
  wrapperClassName?: string;
  /** Nội dung khối chỗ trống khi chưa có ảnh. */
  emptyLabel?: string;
  emptySource?: string;
  emptyClassName?: string;
  emptyCompact?: boolean;
}

/**
 * Một ô ảnh: hiện ảnh Drive, ảnh tải tay đè lên nếu có, hoặc khối chỗ trống.
 * Ở chế độ sửa, ô có thêm nút tải lên và nút hoàn tác.
 */
export function EditableImage({
  slotKey,
  src,
  alt,
  className = '',
  wrapperClassName = 'relative',
  emptyLabel,
  emptySource,
  emptyClassName = '',
  emptyCompact = false
}: EditableImageProps) {
  const { editable, overrides, onUpload, onClear } = useImageSlots();
  const uploaded = overrides[slotKey];
  const effective = uploaded ?? src;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const [url] = await readImageFiles(files);
      if (url) onUpload?.(slotKey, url);
    },
    [onUpload, slotKey]
  );

  /** Nút tải lên đặt giữa khung trống, ngay dưới dòng chỉ thư mục Drive. */
  const uploadInEmpty =
  editable && !emptyCompact ?
  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d8cab4] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6D3A18] transition-colors hover:bg-white/70">
      <UploadIcon className="h-3.5 w-3.5" />
      Tải ảnh từ máy
      <input
      type="file"
      accept="image/png,image/jpeg,image/webp"
      onChange={(event) => handleFiles(event.target.files)}
      className="sr-only" />

    </label> :

  undefined;

  const picture = effective ?
  <img src={effective} alt={alt} className={className} /> :

  <EmptySlot
    label={emptyLabel}
    source={emptySource}
    className={emptyClassName || className}
    compact={emptyCompact}
    action={uploadInEmpty} />;



  if (!editable) return picture;

  // Khung trống đã có nút tải lên ở giữa; lớp phủ chỉ cần cho ô đã có ảnh.
  if (!effective) return <div className={wrapperClassName}>{picture}</div>;

  return (
    <div className={`group/slot ${wrapperClassName}`}>
      {picture}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end gap-1.5 p-2 opacity-0 transition-opacity group-hover/slot:opacity-100 focus-within:opacity-100">
        {uploaded &&
        <button
          type="button"
          onClick={() => onClear?.(slotKey)}
          title="Quay lại ảnh từ Drive"
          className="pointer-events-auto inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-1.5 text-[11px] font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-white">
          
            <UndoIcon className="h-3.5 w-3.5" />
            Hoàn tác
          </button>
        }
        <label className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 rounded-md bg-white/95 px-2 py-1.5 text-[11px] font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-white">
          <UploadIcon className="h-3.5 w-3.5" />
          Đổi ảnh
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => handleFiles(event.target.files)}
            className="sr-only" />
          
        </label>
      </div>
    </div>);

}

interface ImageUploadButtonProps {
  /** Bộ sưu tập nhận ảnh mới, ví dụ 'hero' hoặc 'amenity'. */
  collectionKey: string;
  label?: string;
  className?: string;
}

/**
 * Nút thêm ảnh vào một bộ sưu tập — băng ảnh đầu trang, tiện ích, ảnh tiến độ.
 * Nhận nhiều file một lần. Chỉ hiện khi đang ở chế độ sửa.
 */
export function ImageUploadButton({
  collectionKey,
  label = 'Tải ảnh lên',
  className = ''
}: ImageUploadButtonProps) {
  const { editable, onAddMany } = useImageSlots();
  if (!editable) return null;

  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#d8cab4] bg-white px-3 py-2 text-xs font-semibold text-[#6D3A18] transition-colors hover:bg-[#faf6ef] ${className}`}>
      
      <ImagePlusIcon className="h-4 w-4" />
      {label}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={async (event) => {
          const urls = await readImageFiles(event.target.files);
          if (urls.length) onAddMany?.(collectionKey, urls);
          event.target.value = '';
        }}
        className="sr-only" />
      
    </label>);

}
