import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient } from './_lib/googleAuth.js';
import { getSupabaseClient } from './_lib/supabaseClient.js';
import { extractFolderId, listChildren } from './_lib/driveTree.js';
import { findOrCreateContact, type ContactInput } from './_lib/contacts.js';
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

  const {
    driveFolderUrl,
    projectName,
    projectCode,
    aliases,
    slogan,
    propertyOwnerId,
    address,
    province,
    ward,
    contact
  } = (req.body ?? {}) as {
    driveFolderUrl?: string;
    projectName?: string;
    projectCode?: string;
    aliases?: string[];
    slogan?: string;
    propertyOwnerId?: string;
    address?: string;
    province?: string;
    ward?: string;
    contact?: ContactInput;
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

    // Đầu mối và chủ đầu tư gắn qua khóa UUID. Chủ đầu tư dùng để demo có id
    // dạng "i-001" (chỉ tồn tại ở frontend, chưa ghi vào bảng property_owners),
    // nên phải kiểm tra trước: id không phải UUID thì bỏ qua việc gắn thay vì để
    // Postgres từ chối và làm hỏng cả luồng tạo dự án.
    const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const ownerId =
    typeof propertyOwnerId === 'string' && UUID_RE.test(propertyOwnerId) ?
    propertyOwnerId :
    null;
    const ownerSkipped = Boolean(propertyOwnerId) && ownerId === null;

    // Đầu mối được tra trước khi ghi dự án: số đã có thì dùng lại bản ghi cũ,
    // nhờ vậy hai dự án cùng một người liên hệ không sinh hai bản ghi. Chỉ tạo
    // đầu mối khi có chủ đầu tư hợp lệ, vì đầu mối là người của chủ đầu tư.
    let contactResult: {id: string;reused: boolean;} | null = null;
    if (ownerId && contact) {
      contactResult = await findOrCreateContact(ownerId, contact);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.
    from('projects').
    upsert(
      {
        drive_folder_id: rootFolderId,
        drive_folder_url: driveFolderUrl.trim(),
        project_name: projectName.trim(),
        project_code: projectCode?.trim() || null,
        // Nhiều tên gọi nhưng vẫn dùng chung một mã dự án.
        aliases: Array.isArray(aliases) ?
        aliases.map((item) => item.trim()).filter(Boolean) :
        [],
        slogan: slogan?.trim() || null,
        property_owner_id: ownerId,
        address: address?.trim() || null,
        province: province?.trim() || null,
        ward: ward?.trim() || null,
        contact_id: contactResult?.id ?? null,
        content
      },
      { onConflict: 'drive_folder_id' }
    ).
    select('id').
    single();

    if (error) {
      throw new Error(`Lưu vào Supabase thất bại: ${error.message}`);
    }

    res.status(200).json({
      projectId: data.id,
      contactId: contactResult?.id ?? null,
      contactReused: contactResult?.reused ?? false,
      // Báo về client để hiện cảnh báo mềm thay vì âm thầm bỏ chủ đầu tư.
      ownerSkipped,
      content
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Đồng bộ thất bại.'
    });
  }
}
