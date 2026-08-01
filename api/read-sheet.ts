import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient, getSheetsClient } from './_lib/googleAuth.js';

const XLSX_MIME =
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Lấy spreadsheetId từ mọi dạng liên kết Google Sheet. */
function extractSpreadsheetId(url: string): string | null {
  const direct = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (direct) return direct[1];
  // Người dùng có thể dán thẳng ID.
  return /^[a-zA-Z0-9-_]{20,}$/.test(url.trim()) ? url.trim() : null;
}

/**
 * Đọc bằng Sheets API — cho giá trị đã tách sẵn theo từng sheet, không giới
 * hạn dung lượng. Cần bật Google Sheets API trên project.
 */
async function readViaSheetsApi(spreadsheetId: string) {
  const sheets = getSheetsClient();

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title'
  });
  const titles = (meta.data.sheets ?? []).
  map((sheet) => sheet.properties?.title).
  filter((title): title is string => Boolean(title));

  if (!titles.length) throw new Error('File không có sheet nào.');

  const values = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: titles,
    valueRenderOption: 'UNFORMATTED_VALUE'
  });

  return titles.map((name, index) => ({
    name,
    grid: values.data.valueRanges?.[index]?.values ?? []
  }));
}

/**
 * Dự phòng: xuất file sang .xlsx qua Drive API rồi để trình duyệt tự bóc tách
 * bằng chính bộ đọc dùng cho file tải lên.
 *
 * Drive API vốn đã được bật cho tính năng đồng bộ ảnh, nên đường này chạy được
 * ngay cả khi Sheets API chưa bật. Giới hạn 10 MB của Drive export không phải
 * vấn đề với bảng hàng.
 */
async function exportAsWorkbook(fileId: string): Promise<string> {
  const drive = getDriveClient();
  const response = await drive.files.export(
    { fileId, mimeType: XLSX_MIME },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(response.data as ArrayBuffer).toString('base64');
}

/** Nhận diện lỗi "API chưa được bật" để chuyển sang đường dự phòng. */
function isApiDisabled(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /has not been used in project|SERVICE_DISABLED|accessNotConfigured/i.test(message));

}

/** Thông báo lỗi viết cho người dùng cuối, không phải cho dev. */
function describe(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/permission|not found|notFound|forbidden|403|404/i.test(message)) {
    return (
      'Không mở được file. Hãy chia sẻ Google Sheet cho service account ' +
      '(quyền Người xem là đủ), hoặc đặt chế độ "Bất kỳ ai có liên kết".');

  }
  if (/exportSizeLimitExceeded|too large/i.test(message)) {
    return 'File vượt giới hạn 10 MB khi xuất. Hãy bật Google Sheets API cho project để đọc trực tiếp.';
  }
  return `Không đọc được Google Sheet: ${message}`;
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

  res.setHeader('Cache-Control', 'no-store');

  try {
    res.status(200).json({ source: 'sheets-api', sheets: await readViaSheetsApi(spreadsheetId) });
    return;
  } catch (error) {
    if (!isApiDisabled(error)) {
      res.status(502).json({ error: describe(error) });
      return;
    }
    // Sheets API chưa bật — rơi xuống đường xuất file qua Drive.
  }

  try {
    res.status(200).json({
      source: 'drive-export',
      workbook: await exportAsWorkbook(spreadsheetId)
    });
  } catch (error) {
    res.status(502).json({ error: describe(error) });
  }
}
