import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient } from './_lib/googleAuth';
import {
  extractFolderId,
  listChildren,
  findChildByName,
  isImage,
  fileLabel,
  type DriveNode } from
'./_lib/driveTree';
import {
  convertContentFileToHtml,
  findContentFileByBaseName,
  readCaptionIfExists } from
'./_lib/convertContentFile';

interface SyncedImage {
  id: string;
  name: string;
  url: string;
}

function toImageUrl(fileId: string): string {
  // Ảnh được stream qua endpoint proxy /api/drive-file/[fileId] vì folder chỉ
  // share Viewer cho service account, không public trực tiếp được cho trình
  // duyệt của người dùng cuối.
  return `/api/drive-file/${fileId}`;
}

function toSyncedImage(node: DriveNode): SyncedImage {
  return { id: node.id, name: node.name, url: toImageUrl(node.id) };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { driveFolderUrl } = (req.body ?? {}) as { driveFolderUrl?: string };
  if (typeof driveFolderUrl !== 'string' || !driveFolderUrl.trim()) {
    res.status(400).json({ error: 'Thiếu driveFolderUrl.' });
    return;
  }

  try {
    const drive = getDriveClient();
    const rootFolderId = extractFolderId(driveFolderUrl);

    const rootChildren = await listChildren(drive, rootFolderId);
    const overviewFolder = findChildByName(rootChildren, 'Tổng quan', {
      folderOnly: true
    });
    if (!overviewFolder) {
      throw new Error(
        'Không tìm thấy thư mục "Tổng quan" trong folder dự án — kiểm tra lại folder đã dán đúng cấu trúc mẫu chưa.'
      );
    }

    const overviewChildren = await listChildren(drive, overviewFolder.id);

    // 1. Ảnh hero banner
    const heroFolder = findChildByName(overviewChildren, 'Ảnh hero banner', {
      folderOnly: true
    });
    const heroSlides = heroFolder ?
    (await listChildren(drive, heroFolder.id)).filter(isImage).map(toSyncedImage) :
    [];

    // 2. Nội dung tổng quan
    const overviewContentFile = findContentFileByBaseName(
      overviewChildren,
      'Nội dung tổng quan'
    );
    const overviewContent = overviewContentFile ?
    await convertContentFileToHtml(drive, overviewContentFile) :
    '';

    // 3. Ảnh tổng quan
    const overviewImagesFolder = findChildByName(overviewChildren, 'Ảnh tổng quan', {
      folderOnly: true
    });
    const overviewImages = overviewImagesFolder ?
    (await listChildren(drive, overviewImagesFolder.id)).filter(isImage).map(toSyncedImage) :
    [];

    // 4. Vị trí (đã gộp vào Tổng quan)
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

    // 5. Ảnh mặt bằng preview trong Tổng quan (tên ảnh = tên tab)
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

    // 6. Ảnh tiện ích (caption đọc từ file .txt cùng tên nếu có)
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

    res.status(200).json({
      heroSlides,
      overviewContent,
      overviewImages,
      locationContent,
      locationImages,
      overviewFloorPlanPreview,
      amenityImages
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Đồng bộ thất bại.'
    });
  }
}
