import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient } from './_lib/googleAuth.js';
import { getSupabaseClient } from './_lib/supabaseClient.js';
import { extractFolderId, listChildren } from './_lib/driveTree.js';
import {
  readOverviewSection,
  readFloorPlanSection,
  readSalesSheetSection,
  read360Section,
  readDocumentsSection,
  readBannerSection } from
'./_lib/syncSections.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { driveFolderUrl, projectName } = (req.body ?? {}) as {
    driveFolderUrl?: string;
    projectName?: string;
  };

  if (typeof driveFolderUrl !== 'string' || !driveFolderUrl.trim()) {
    res.status(400).json({ error: 'Thiếu driveFolderUrl.' });
    return;
  }
  if (typeof projectName !== 'string' || !projectName.trim()) {
    res.status(400).json({ error: 'Thiếu projectName.' });
    return;
  }

  try {
    const drive = getDriveClient();
    const rootFolderId = extractFolderId(driveFolderUrl);
    const rootChildren = await listChildren(drive, rootFolderId);

    // Đọc song song 6 mục — không phụ thuộc lẫn nhau, chạy song song cho nhanh.
    const [overview, floorPlanImage, salesSheetFolderName, image360, documents, banners] =
    await Promise.all([
    readOverviewSection(drive, rootChildren),
    readFloorPlanSection(drive, rootChildren),
    readSalesSheetSection(rootChildren),
    read360Section(drive, rootChildren),
    readDocumentsSection(drive, rootChildren),
    readBannerSection(drive, rootChildren)]
    );

    const content = {
      overviewContent: overview.overviewContent,
      overviewImages: overview.overviewImages,
      locationContent: overview.locationContent,
      locationImages: overview.locationImages,
      overviewFloorPlanPreview: overview.overviewFloorPlanPreview,
      heroSlides: overview.heroSlides,
      amenityImages: overview.amenityImages,
      floorPlanImage,
      salesSheetFolderName,
      image360,
      documents,
      leftBanner: banners.leftBanner,
      rightBanner: banners.rightBanner
    };

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.
    from('projects').
    upsert(
      {
        drive_folder_id: rootFolderId,
        drive_folder_url: driveFolderUrl.trim(),
        project_name: projectName.trim(),
        content
      },
      { onConflict: 'drive_folder_id' }
    ).
    select('id').
    single();

    if (error) {
      throw new Error(`Lưu vào Supabase thất bại: ${error.message}`);
    }

    res.status(200).json({ projectId: data.id, content });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Đồng bộ thất bại.'
    });
  }
}
