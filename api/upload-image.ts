import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './_lib/supabaseClient.js';

/**
 * Nhận ảnh người dùng chọn từ máy và lưu vào Supabase Storage.
 *
 * Vì sao dùng Supabase Storage: dự án đã có sẵn Supabase và Service Role Key
 * trên server, nên không phải thêm tài khoản hay khóa của bên thứ ba. Gói miễn
 * phí cho 1 GB dung lượng và 2 GB băng thông ra mỗi tháng — thừa cho bản demo.
 *
 * Trước khi dùng, chạy supabase/storage-anh-du-an.sql để tạo bucket.
 */

const BUCKET = 'project-images';
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];
/**
 * Giới hạn 3 MB: Vercel chặn request body quá 4,5 MB, mà base64 làm ảnh phình
 * thêm khoảng một phần ba. 3 MB ảnh gốc thành khoảng 4 MB khi mã hóa.
 */
const MAX_BYTES = 3 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
};

/** Tách data URL thành kiểu MIME và dữ liệu nhị phân. */
function parseDataUrl(dataUrl: string): {mime: string;buffer: Buffer;} | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Chỉ nhận POST.' });
    return;
  }

  const { dataUrl, folder } = (req.body ?? {}) as {
    dataUrl?: string;
    folder?: string;
  };

  if (!dataUrl) {
    res.status(400).json({ error: 'Thiếu dataUrl.' });
    return;
  }

  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    res.status(400).json({ error: 'dataUrl không đúng định dạng.' });
    return;
  }
  if (!ALLOWED.includes(parsed.mime)) {
    res.status(400).json({ error: 'Chỉ nhận ảnh PNG, JPG hoặc WebP.' });
    return;
  }
  if (parsed.buffer.byteLength > MAX_BYTES) {
    res.status(413).json({ error: 'Ảnh vượt quá 3 MB.' });
    return;
  }

  // Tên file ngẫu nhiên để hai người tải cùng lúc không ghi đè lên nhau.
  const safeFolder = (folder ?? 'chung').replace(/[^a-zA-Z0-9_-]/g, '-');
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `${safeFolder}/${name}.${EXTENSIONS[parsed.mime]}`;

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage.
    from(BUCKET).
    upload(path, parsed.buffer, {
      contentType: parsed.mime,
      cacheControl: '31536000',
      upsert: false
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    res.status(200).json({ url: data.publicUrl, path });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tải ảnh thất bại.';
    res.status(500).json({ error: message });
  }
}
