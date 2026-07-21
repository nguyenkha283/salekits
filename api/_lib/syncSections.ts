import type { drive_v3 } from 'googleapis';
import {
  listChildren,
  findChildByName,
  isImage,
  fileLabel,
  type DriveNode } from
'./driveTree.js';
import {
  convertContentFileToHtml,
  findContentFileByBaseName,
  readCaptionIfExists } from
'./convertContentFile.js';

export interface SyncedImage {
  id: string;
  name: string;
  url: string;
}

export function toImageUrl(fileId: string): string {
  return `/api/drive-file?id=${fileId}`;
}

export function toSyncedImage(node: DriveNode): SyncedImage {
  return { id: node.id, name: node.name, url: toImageUrl(node.id) };
}

export function toFileRef(node: DriveNode) {
  return {
    id: node.id,
    name: node.name,
    url: toImageUrl(node.id),
    mimeType: node.mimeType
  };
}

export async function readOverviewSection(
drive: drive_v3.Drive,
rootChildren: DriveNode[])
{
  const overviewFolder = findChildByName(rootChildren, 'Tổng quan', {
    folderOnly: true
  });
  if (!overviewFolder) {
    throw new Error(
      'Không tìm thấy thư mục "Tổng quan" trong folder dự án — kiểm tra lại folder đã dán đúng cấu trúc mẫu chưa.'
    );
  }

  const overviewChildren = await listChildren(drive, overviewFolder.id);

  const heroFolder = findChildByName(overviewChildren, 'Ảnh hero banner', {
    folderOnly: true
  });
  const heroSlides = heroFolder ?
  (await listChildren(drive, heroFolder.id)).filter(isImage).map(toSyncedImage) :
  [];

  const overviewContentFile = findContentFileByBaseName(
    overviewChildren,
    'Nội dung tổng quan'
  );
  const overviewContent = overviewContentFile ?
  await convertContentFileToHtml(drive, overviewContentFile) :
  '';

  const overviewImagesFolder = findChildByName(overviewChildren, 'Ảnh tổng quan', {
    folderOnly: true
  });
  const overviewImages = overviewImagesFolder ?
  (await listChildren(drive, overviewImagesFolder.id)).filter(isImage).map(toSyncedImage) :
  [];

  const locationFolder = findChildByName(overviewChildren, 'Vị trí', {
    folderOnly: true
  });
  let locationContent = '';
  let locationImages: SyncedImage[] = [];
  if (locationFolder) {
    const locationChildren = await listChildren(drive, locationFolder.id);
    const locationContentFile = findContentFileByBaseName(
      locationChildren,
      'Nội dung vị trí'
    );
    locationContent = locationContentFile ?
    await convertContentFileToHtml(drive, locationContentFile) :
    '';
    locationImages = locationChildren.filter(isImage).map(toSyncedImage);
  }

  const floorPlanPreviewFolder = findChildByName(overviewChildren, 'Ảnh mặt bằng', {
    folderOnly: true
  });
  const overviewFloorPlanPreview = floorPlanPreviewFolder ?
  (await listChildren(drive, floorPlanPreviewFolder.id)).
  filter(isImage).
  map((image) => ({
    id: image.id,
    label: fileLabel(image.name),
    image: toSyncedImage(image)
  })) :
  [];

  const amenitiesFolder = findChildByName(overviewChildren, 'Ảnh tiện ích', {
    folderOnly: true
  });
  let amenityImages: {id: string;image: SyncedImage;caption: string;}[] = [];
  if (amenitiesFolder) {
    const amenitiesChildren = await listChildren(drive, amenitiesFolder.id);
    const images = amenitiesChildren.filter(isImage);
    amenityImages = await Promise.all(
      images.map(async (image) => ({
        id: image.id,
        image: toSyncedImage(image),
        caption: await readCaptionIfExists(drive, amenitiesChildren, image.name)
      }))
    );
  }

  return {
    heroSlides,
    overviewContent,
    overviewImages,
    locationContent,
    locationImages,
    overviewFloorPlanPreview,
    amenityImages
  };
}

/** "02. Mặt bằng" — tái dùng đúng shape floorPlanTabs đã có sẵn trong CMS. */
export async function readFloorPlanSection(
drive: drive_v3.Drive,
rootChildren: DriveNode[])
{
  const floorPlanFolder = findChildByName(rootChildren, 'Mặt bằng', {
    folderOnly: true
  });
  if (!floorPlanFolder) return [];

  const towerFolders = (await listChildren(drive, floorPlanFolder.id)).filter(
    (node) => node.mimeType === 'application/vnd.google-apps.folder'
  );

  return Promise.all(
    towerFolders.map(async (tower) => {
      const images = (await listChildren(drive, tower.id)).filter(isImage);
      return {
        id: tower.id,
        label: fileLabel(tower.name),
        blocks: images.map((image) => ({
          id: image.id,
          type: 'image' as const,
          image: toSyncedImage(image)
        }))
      };
    })
  );
}

/**
 * "03. Bảng hàng" — giai đoạn hiện tại chỉ đọc và trả về TÊN folder để test
 * đường truyền đồng bộ, chưa đọc nội dung link.txt thật (cơ chế đồng bộ Bảng
 * hàng thật sẽ định nghĩa sau, như đã thống nhất).
 */
export async function readSalesSheetSection(
rootChildren: DriveNode[])
: Promise<string> {
  const salesSheetFolder = findChildByName(rootChildren, 'Bảng hàng', {
    folderOnly: true
  });
  return salesSheetFolder ? fileLabel(salesSheetFolder.name) : '';
}

/** "04. Ảnh 360" */
export async function read360Section(
drive: drive_v3.Drive,
rootChildren: DriveNode[])
{
  const folder360 = findChildByName(rootChildren, 'Ảnh 360', { folderOnly: true });
  if (!folder360) return [];
  return (await listChildren(drive, folder360.id)).filter(isImage).map(toSyncedImage);
}

/** "05. Tài liệu" — 4 thư mục con: Đào tạo, Chính sách bán hàng, Tiến độ, Tài liệu. */
export async function readDocumentsSection(
drive: drive_v3.Drive,
rootChildren: DriveNode[])
{
  const documentsFolder = findChildByName(rootChildren, 'Tài liệu', {
    folderOnly: true
  });

  const empty = {
    training: [] as ReturnType<typeof toFileRef>[],
    salesPolicyCoverImage: null as SyncedImage | null,
    salesPolicyGroups: [] as {id: string;label: string;files: ReturnType<typeof toFileRef>[];}[],
    progress: [] as ReturnType<typeof toFileRef>[],
    general: [] as ReturnType<typeof toFileRef>[]
  };

  if (!documentsFolder) return empty;

  const documentsChildren = await listChildren(drive, documentsFolder.id);

  const trainingFolder = findChildByName(documentsChildren, 'Đào tạo', {
    folderOnly: true
  });
  const training = trainingFolder ?
  (await listChildren(drive, trainingFolder.id)).map(toFileRef) :
  [];

  const salesPolicyFolder = findChildByName(documentsChildren, 'Chính sách bán hàng', {
    folderOnly: true
  });
  let salesPolicyCoverImage: SyncedImage | null = null;
  let salesPolicyGroups: {id: string;label: string;files: ReturnType<typeof toFileRef>[];}[] = [];
  if (salesPolicyFolder) {
    const salesPolicyChildren = await listChildren(drive, salesPolicyFolder.id);
    const coverImage = salesPolicyChildren.find(isImage);
    salesPolicyCoverImage = coverImage ? toSyncedImage(coverImage) : null;

    const policyGroupFolders = salesPolicyChildren.filter(
      (node) => node.mimeType === 'application/vnd.google-apps.folder'
    );
    salesPolicyGroups = await Promise.all(
      policyGroupFolders.map(async (group) => ({
        id: group.id,
        label: fileLabel(group.name),
        files: (await listChildren(drive, group.id)).map(toFileRef)
      }))
    );
  }

  const progressFolder = findChildByName(documentsChildren, 'Tiến độ', {
    folderOnly: true
  });
  const progress = progressFolder ?
  (await listChildren(drive, progressFolder.id)).map(toFileRef) :
  [];

  const generalFolder = findChildByName(documentsChildren, 'Tài liệu', {
    folderOnly: true
  });
  const general = generalFolder ?
  (await listChildren(drive, generalFolder.id)).map(toFileRef) :
  [];

  return { training, salesPolicyCoverImage, salesPolicyGroups, progress, general };
}

/** "06. Banner dọc" — tái dùng đúng field leftBanner/rightBanner đã có sẵn. */
export async function readBannerSection(
drive: drive_v3.Drive,
rootChildren: DriveNode[])
{
  const bannerFolder = findChildByName(rootChildren, 'Banner dọc', {
    folderOnly: true
  });
  if (!bannerFolder) return { leftBanner: null, rightBanner: null };

  const bannerChildren = (await listChildren(drive, bannerFolder.id)).filter(isImage);
  const leftBannerNode = findChildByName(bannerChildren, 'banner-trai');
  const rightBannerNode = findChildByName(bannerChildren, 'banner-phai');

  return {
    leftBanner: leftBannerNode ? toSyncedImage(leftBannerNode) : null,
    rightBanner: rightBannerNode ? toSyncedImage(rightBannerNode) : null
  };
}
