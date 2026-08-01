/**
 * Ánh xạ dữ liệu `content` do /api/sync-project trả về sang từng tab của CMS
 * và trang chi tiết dự án. Mỗi thư mục Drive rơi vào đúng một tab.
 */

export interface SyncedImage {
  id: string;
  name: string;
  url: string;
}

export interface SyncedFile extends SyncedImage {
  mimeType?: string;
}

export interface SyncedContent {
  overviewContent?: string;
  overviewImages?: SyncedImage[];
  locationContent?: string;
  locationImages?: SyncedImage[];
  overviewFloorPlanPreview?: {id: string;label: string;image: SyncedImage;}[];
  heroSlides?: SyncedImage[];
  amenityImages?: {id: string;image: SyncedImage;caption: string;}[];
  floorPlanImage?: SyncedImage | null;
  salesSheetFolderName?: string;
  image360?: SyncedImage[];
  documents?: {
    training?: SyncedFile[];
    salesPolicyCoverImage?: SyncedImage | null;
    salesPolicyGroups?: {id: string;label: string;files: SyncedFile[];}[];
    progress?: SyncedFile[];
    general?: SyncedFile[];
  };
  leftBanner?: SyncedImage | null;
  rightBanner?: SyncedImage | null;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  caption?: string;
  mimeType?: string;
}

export interface MediaGroup {
  id: string;
  label: string;
  /** Đường dẫn thư mục Drive, hiển thị để đối chiếu khi đồng bộ sai chỗ. */
  folder?: string;
  items: MediaItem[];
}

export type SyncedMedia = Record<string, MediaGroup[]>;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|avif|heic)$/i;

export function isImageItem(item: MediaItem): boolean {
  if (item.mimeType) return item.mimeType.startsWith('image/');
  return IMAGE_EXT.test(item.name);
}

function toItems(images?: SyncedImage[] | null): MediaItem[] {
  if (!images) return [];
  return images.map((image) => ({
    id: image.id,
    name: image.name,
    url: image.url
  }));
}

function group(
id: string,
label: string,
folder: string | undefined,
items: MediaItem[])
: MediaGroup | null {
  return items.length ? { id, label, folder, items } : null;
}

function compact(groups: (MediaGroup | null)[]): MediaGroup[] {
  return groups.filter((item): item is MediaGroup => Boolean(item));
}

/** Trả về map tabId → các nhóm ảnh/tài liệu đã đồng bộ, bỏ nhóm rỗng. */
export function buildSyncedMedia(content?: SyncedContent | null): SyncedMedia {
  if (!content) return {};
  const documents = content.documents ?? {};

  const media: SyncedMedia = {
    'tong-quan': compact([
    group('hero', 'Ảnh hero banner', '01. Tổng quan / Ảnh hero banner',
    toItems(content.heroSlides)),
    group('overview', 'Ảnh tổng quan', '01. Tổng quan / Ảnh tổng quan',
    toItems(content.overviewImages)),
    group('location', 'Ảnh vị trí', '01. Tổng quan / Vị trí',
    toItems(content.locationImages)),
    group('amenity', 'Ảnh tiện ích', '01. Tổng quan / Ảnh tiện ích',
    (content.amenityImages ?? []).map((entry) => ({
      id: entry.id,
      name: entry.image.name,
      url: entry.image.url,
      caption: entry.caption
    }))),
    group('plan-preview', 'Ảnh mặt bằng xem nhanh', '01. Tổng quan / Ảnh mặt bằng',
    (content.overviewFloorPlanPreview ?? []).map((entry) => ({
      id: entry.id,
      name: entry.image.name,
      url: entry.image.url,
      caption: entry.label
    }))),
    group('banner', 'Banner dọc', 'Banner dọc',
    toItems(
      [content.leftBanner, content.rightBanner].filter(
        (item): item is SyncedImage => Boolean(item)
      )
    ))]
    ),

    'mat-bang': compact([
    group('floor-plan', 'Mặt bằng tổng thể', '03. Mặt bằng',
    toItems(content.floorPlanImage ? [content.floorPlanImage] : []))]
    ),

    'anh-360': compact([
    group('p360', 'Ảnh 360', '04. Ảnh 360', toItems(content.image360))]
    ),

    'chinh-sach': compact([
    group('policy-cover', 'Ảnh bìa chính sách', '05. Chính sách bán hàng',
    toItems(documents.salesPolicyCoverImage ? [documents.salesPolicyCoverImage] : [])),
    ...(documents.salesPolicyGroups ?? []).map((entry) =>
    group(entry.id, entry.label, `05. Chính sách bán hàng / ${entry.label}`,
    entry.files.map((file) => ({
      id: file.id, name: file.name, url: file.url, mimeType: file.mimeType
    })))
    )]
    ),

    'tien-do': compact([
    group('progress', 'Ảnh tiến độ', '06. Tiến độ',
    (documents.progress ?? []).map((file) => ({
      id: file.id, name: file.name, url: file.url, mimeType: file.mimeType
    })))]
    ),

    'tai-lieu': compact([
    group('general', 'Tài liệu dự án', '07. Tài liệu',
    (documents.general ?? []).map((file) => ({
      id: file.id, name: file.name, url: file.url, mimeType: file.mimeType
    })))]
    )
  };

  Object.keys(media).forEach((key) => {
    if (!media[key].length) delete media[key];
  });

  return media;
}

export function countMedia(media: SyncedMedia): number {
  return Object.values(media).reduce(
    (total, groups) =>
    total + groups.reduce((sum, entry) => sum + entry.items.length, 0),
    0
  );
}

/** Bỏ phần mở rộng để lấy nhãn hiển thị từ tên file. */
export function stripExt(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

/** Phần mở rộng viết hoa, dùng làm nhãn loại tài liệu. */
export function fileExt(name: string): string {
  const match = name.match(/\.([^.]+)$/);
  return match ? match[1].toUpperCase() : 'FILE';
}

/** Lấy các mục của một nhóm; bỏ trống id để gộp toàn bộ nhóm. */
export function pickItems(groups?: MediaGroup[], groupId?: string): MediaItem[] {
  if (!groups?.length) return [];
  if (!groupId) return groups.flatMap((group) => group.items);
  return groups.find((group) => group.id === groupId)?.items ?? [];
}

/**
 * Gắn tham số bề rộng vào URL ảnh để endpoint trả về bản đã resize sẵn của
 * Google thay vì file gốc. Chỉ áp dụng cho URL do hệ thống sinh ra.
 */
export function sized(url: string, width: number): string {
  if (!url.startsWith('/api/drive-file')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}w=${width}`;
}

/** Bề rộng dùng cho từng ngữ cảnh hiển thị. */
export const IMG = {
  thumb: 160,
  card: 640,
  wide: 1280,
  hero: 1600
} as const;
