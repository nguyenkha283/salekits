import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSheetsClient } from './_lib/googleAuth.js';

/** Lấy spreadsheetId từ mọi dạng liên kết Google Sheet. */
function extractSpreadsheetId(url: string): string | null {
  const direct = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (direct) return direct[1];
  // Người dùng có thể dán thẳng ID.
  return /^[a-zA-Z0-9-_]{20,}$/.test(url.trim()) ? url.trim() : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Chỉ hỗ trợ POST.' });
    return;
  }

  const url = typeof req.body?.url === 'string' ? req.body.url : '';
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    res.status(400).json({ error: 'Liên kết không hợp lệ — cần link Google Sheet.' });
    return;
  }

  try {
    const sheets = getSheetsClient();

    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title'
    });
    const titles = (meta.data.sheets ?? []).
    map((sheet) => sheet.properties?.title).
    filter((title): title is string => Boolean(title));

    if (!titles.length) {
      res.status(404).json({ error: 'File không có sheet nào.' });
      return;
    }

    // Lấy toàn bộ giá trị của mọi sheet trong một lần gọi.
    const values = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: titles,
      valueRenderOption: 'UNFORMATTED_VALUE'
    });

    const result = titles.map((name, index) => ({
      name,
      grid: values.data.valueRanges?.[index]?.values ?? []
    }));

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ sheets: result });
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({
      error:
      error instanceof Error ?
      `Không đọc được Google Sheet: ${error.message}` :
      'Không đọc được Google Sheet — kiểm tra quyền chia sẻ với service account.'
    });
  }
}
