import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient } from './_lib/googleAuth.js';

/**
 * Proxy tải ảnh từ Drive: /api/drive-file?id=<fileId>
 * Dùng query param thay cho route động [fileId] để tránh trường hợp Vercel
 * không match route động → rewrite trả nhầm index.html (lỗi ảnh không hiện).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fileId = req.query.id;
  if (typeof fileId !== 'string' || !fileId.trim()) {
    res.status(400).send('Thiếu id.');
    return;
  }

  try {
    const drive = getDriveClient();

    const meta = await drive.files.get({
      fileId,
      fields: 'mimeType, name',
      supportsAllDrives: true
    });
    const mimeType = meta.data.mimeType ?? 'application/octet-stream';

    const fileResponse = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' }
    );

    res.setHeader('Content-Type', mimeType);
    // Chỉ cache khi tải thành công (status 200) — response lỗi bên dưới
    // dùng no-store để trình duyệt không cache nhầm bản lỗi trong 1 giờ.
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(fileResponse.data as ArrayBuffer));
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định.';
    // Trả message gốc để dễ chẩn đoán (quyền chia sẻ, quota, env...).
    res.status(502).send(`Không tải được file từ Drive: ${message}`);
  }
}
