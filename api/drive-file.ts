import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient } from './_lib/googleAuth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fileId = req.query.id;
  if (typeof fileId !== 'string') {
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).send('Thiếu tham số id.');
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
    // Cache 1 giờ CHỈ khi thành công — response lỗi không được cache (xem catch
    // bên dưới), tránh giữ lại lỗi cũ sau khi đã sửa quyền truy cập/deployment.
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(Buffer.from(fileResponse.data as ArrayBuffer));
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(404).send(
      error instanceof Error ?
      error.message :
      'Không tải được file từ Drive — kiểm tra lại quyền chia sẻ.'
    );
  }
}
