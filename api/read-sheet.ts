import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDriveClient, getSheetsClient } from './_lib/googleAuth.js';

const GOOGLE_SHEET_MIME = 'application/vnd.google-apps.spreadsheet';
const XLSX_MIME =
'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Các định dạng bảng tính tải lên Drive mà SheetJS đọc được. */
const BINARY_SHEET_MIMES = [
XLSX_MIME,
'application/vnd.ms-excel',
'application/vnd.ms-excel.sheet.macroEnabled.12',
'application/vnd.oasis.opendocument.spreadsheet',
'text/csv'];


/**
 * Lấy fileId từ mọi dạng liên kết Drive — không chỉ link Google Sheet.
 * File .xlsx tải lên Drive có link dạng /file/d/<id>/view.
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

  // Người dùng có thể dán thẳng ID.
  return /^[a-zA-Z0-9-_]{20,}$/.test(text) ? text : null;
}

/**
 * Đọc bằng Sheets API — cho giá trị đã tách sẵn theo từng sheet, không giới
 * hạn dung lượng. Chỉ dùng được với Google Sheet gốc.
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

/** Google Sheet gốc: xuất sang .xlsx (giới hạn 10 MB của Drive export). */
async function exportGoogleSheet(fileId: string): Promise<string> {
  const drive = getDriveClient();
  const response = await drive.files.export(
    { fileId, mimeType: XLSX_MIME },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(response.data as ArrayBuffer).toString('base64');
}

/** File bảng tính tải lên Drive: tải thẳng nội dung nhị phân. */
async function downloadBinary(fileId: string): Promise<string> {
  const drive = getDriveClient();
  const response = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(response.data as ArrayBuffer).toString('base64');
}

/** Nhận diện lỗi "API chưa được bật" để chuyển sang đường dự phòng. */
function isApiDisabled(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /has not been used in project|SERVICE_DISABLED|accessNotConfigured/i.test(
    message
  );
}

/** Thông báo lỗi viết cho người dùng cuối, không phải cho dev. */
function describe(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/permission|notFound|not found|forbidden|403|404/i.test(message)) {
    return (
      'Không mở được file. Hãy chia sẻ file cho service account ' +
      '(quyền Người xem là đủ), hoặc đặt chế độ "Bất kỳ ai có liên kết".');

  }
  if (/exportSizeLimitExceeded|too large/i.test(message)) {
    return 'File vượt giới hạn 10 MB khi xuất. Hãy bật Google Sheets API cho project để đọc trực tiếp.';
  }
  return `Không đọc được file: ${message}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Chỉ hỗ trợ POST.' });
    return;
  }

  const url = typeof req.body?.url === 'string' ? req.body.url : '';
  const fileId = extractFileId(url);
  if (!fileId) {
    res.status(400).json({
      error: 'Liên kết không hợp lệ — cần link Google Sheet hoặc file bảng tính trên Drive.'
    });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');

  // Bước 1: hỏi Drive xem đây là loại file gì rồi mới chọn cách đọc.
  let mimeType = '';
  let fileName = '';
  try {
    const drive = getDriveClient();
    const meta = await drive.files.get({
      fileId,
      fields: 'mimeType, name',
      supportsAllDrives: true
    });
    mimeType = meta.data.mimeType ?? '';
    fileName = meta.data.name ?? '';
  } catch (error) {
    res.status(502).json({ error: describe(error) });
    return;
  }

  // Bước 2a: file bảng tính tải lên Drive — tải thẳng nội dung.
  if (BINARY_SHEET_MIMES.includes(mimeType)) {
    try {
      res.status(200).json({
        source: 'drive-download',
        fileName,
        workbook: await downloadBinary(fileId)
      });
    } catch (error) {
      res.status(502).json({ error: describe(error) });
    }
    return;
  }

  // Bước 2b: không phải Google Sheet gốc và cũng không phải bảng tính.
  if (mimeType !== GOOGLE_SHEET_MIME) {
    res.status(400).json({
      error:
      `File "${fileName || fileId}" không phải bảng tính (${mimeType || 'không rõ định dạng'}). ` +
      'Cần Google Sheet hoặc file .xlsx, .xls, .csv trên Drive.'
    });
    return;
  }

  // Bước 3: Google Sheet gốc — ưu tiên Sheets API, thiếu thì xuất qua Drive.
  try {
    res.status(200).json({
      source: 'sheets-api',
      fileName,
      sheets: await readViaSheetsApi(fileId)
    });
    return;
  } catch (error) {
    if (!isApiDisabled(error)) {
      res.status(502).json({ error: describe(error) });
      return;
    }
  }

  try {
    res.status(200).json({
      source: 'drive-export',
      fileName,
      workbook: await exportGoogleSheet(fileId)
    });
  } catch (error) {
    res.status(502).json({ error: describe(error) });
  }
}
