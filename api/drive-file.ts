import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient } from './_lib/googleAuth.js';

/**
 * Các bề rộng được phép, tránh việc client tự đặt số tuỳ ý làm phân mảnh cache
 * và tránh bị lạm dụng để tạo vô số biến thể.
 */
const ALLOWED_WIDTHS = [160, 320, 640, 960, 1280, 1600, 2048];

function normalizeWidth(raw: unknown): number | null {
  if (typeof raw !== 'string') return null;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) return null;
  // Làm tròn lên mức gần nhất trong danh sách cho phép.
  return ALLOWED_WIDTHS.find((width) => width >= value) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

/**
 * thumbnailLink của Drive có đuôi kích thước dạng "=s220" hoặc "=w200-h150".
 * Thay đuôi đó bằng bề rộng mong muốn để lấy đúng bản đã resize sẵn.
 */
function resizeThumbnailLink(link: string, width: number): string {
  return link.replace(/=[-\w]+$/, `=w${width}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fileId = req.query.id;
  if (typeof fileId !== 'string') {
    res.setHeader('Cache-Control', 'no-store');
    res.status(400).send('Thiếu tham số id.');
    return;
  }

  const width = normalizeWidth(req.query.w);

  try {
    const drive = getDriveClient();

    const meta = await drive.files.get({
      fileId,
      fields: 'mimeType, name, thumbnailLink',
      supportsAllDrives: true
    });
    const mimeType = meta.data.mimeType ?? 'application/octet-stream';
    const thumbnailLink = meta.data.thumbnailLink ?? null;
    const isImage = mimeType.startsWith('image/');

    // ── Đường nhanh: ảnh có yêu cầu bề rộng ────────────────────────────
    // Google đã render sẵn nhiều kích thước cho mọi file ảnh trên Drive.
    // Lấy bản nhỏ nhẹ hơn rất nhiều so với tải file gốc rồi tự nén: không
    // cần thư viện xử lý ảnh, không tốn CPU của hàm serverless, và ảnh đi
    // thẳng từ CDN của Google.
    if (isImage && width && thumbnailLink) {
      try {
        const sized = await fetch(resizeThumbnailLink(thumbnailLink, width));
        if (sized.ok) {
          const buffer = Buffer.from(await sized.arrayBuffer());
          res.setHeader(
            'Content-Type',
            sized.headers.get('content-type') ?? 'image/jpeg'
          );
          res.setHeader('Content-Length', String(buffer.byteLength));
          res.setHeader('X-Image-Variant', `w${width}`);
          res.setHeader(
            'Cache-Control',
            'public, max-age=86400, stale-while-revalidate=604800'
          );
          res.status(200).send(buffer);
          return;
        }
      } catch {
        // Thumbnail lỗi thì rơi xuống đường tải file gốc bên dưới.
      }
    }

    // ── Đường mặc định: tải nguyên bản ─────────────────────────────────
    const fileResponse = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'arraybuffer' }
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('X-Image-Variant', 'original');
    // Cache CHỈ khi thành công — response lỗi không được cache (xem catch bên
    // dưới), tránh giữ lại lỗi cũ sau khi đã sửa quyền truy cập/deployment.
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=604800'
    );
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
