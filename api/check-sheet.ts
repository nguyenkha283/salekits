import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient } from './_lib/googleAuth.js';

/**
 * Kiểm tra chủ đầu tư đã sửa bảng hàng chưa.
 *
 * Chỉ đọc metadata nên rất nhẹ — một lệnh gọi Drive, không tải dữ liệu ô. Nhờ
 * vậy gọi thường xuyên được mà không lo quota hay chi phí.
 */
function extractFileId(url: string): string | null {
  const text = url.trim();
  const patterns = [
  /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
  /\/file\/d\/([a-zA-Z0-9-_]+)/,
  /\/d\/([a-zA-Z0-9-_]+)/,
  /[?&]id=([a-zA-Z0-9-_]+)/];


  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return /^[a-zA-Z0-9-_]{20,}$/.test(text) ? text : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = typeof req.query.url === 'string' ? req.query.url : '';
  const fileId = extractFileId(url);

  res.setHeader('Cache-Control', 'no-store');

  if (!fileId) {
    res.status(400).json({ error: 'Liên kết không hợp lệ.' });
    return;
  }

  try {
    const drive = getDriveClient();
    const meta = await drive.files.get({
      fileId,
      fields: 'name, modifiedTime, lastModifyingUser(displayName)',
      supportsAllDrives: true
    });

    res.status(200).json({
      fileName: meta.data.name ?? '',
      modifiedTime: meta.data.modifiedTime ?? '',
      modifiedBy: meta.data.lastModifyingUser?.displayName ?? ''
    });
  } catch (error) {
    // Không đọc được thì im lặng — đây là kiểm tra nền, không nên làm phiền.
    res.status(200).json({
      unavailable: true,
      reason: error instanceof Error ? error.message : 'unknown'
    });
  }
}
