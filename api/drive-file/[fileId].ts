import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient } from '../_lib/googleAuth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fileId = req.query.fileId;
  if (typeof fileId !== 'string') {
    res.status(400).send('Thiếu fileId.');
    return;
  }

  try {
    const drive = getDriveClient();

    const meta = await drive.files.get({ fileId, fields: 'mimeType, name' });
    const mimeType = meta.data.mimeType ?? 'application/octet-stream';

    const fileResponse = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    res.setHeader('Content-Type', mimeType);
    // Cache 1 giờ ở CDN/trình duyệt — ảnh trong Drive hiếm khi đổi liên tục,
    // giảm số lần gọi Drive API (có giới hạn quota).
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(fileResponse.data as ArrayBuffer));
  } catch (error) {
    res.status(404).send('Không tải được file từ Drive — kiểm tra lại quyền chia sẻ.');
  }
}
