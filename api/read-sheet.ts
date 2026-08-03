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


/** Vùng ô gộp, chỉ số 0-based và bao gồm cả hai đầu. */
interface MergeRange {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

interface SheetPayload {
  name: string;
  grid: unknown[][];
  merges: MergeRange[];
  /** Chỉ số dòng bị ẩn hoặc bị lọc — 0-based theo lưới trả về. */
  hiddenRows: number[];
  /** Sheet bị ẩn trong file gốc. */
  hidden: boolean;
}

/** Lấy fileId từ mọi dạng liên kết Drive. */
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

/**
 * Đọc Google Sheet gốc bằng Sheets API.
 *
 * Đây là đường CHÍNH vì nó đọc được cả file bị chặn tải xuống — chặn tải xuống
 * chỉ giới hạn ở giao diện, không giới hạn quyền đọc dữ liệu. Điều kiện duy
 * nhất là service account nhìn thấy file, tức link để "bất kỳ ai có liên kết"
 * hoặc file được chia sẻ cho địa chỉ của service account.
 *
 * Ngoài giá trị ô, đường này còn lấy được hai thứ mà xuất file không có:
 * vùng ô gộp (penthouse thông tầng, duplex thông căn) và danh sách dòng bị ẩn.
 */
async function readViaSheetsApi(spreadsheetId: string): Promise<SheetPayload[]> {
  const sheets = getSheetsClient();

  // Metadata: tên sheet, vùng gộp, trạng thái ẩn của từng dòng.
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: true,
    fields:
    'sheets(properties(title,hidden),merges,data(rowMetadata(hiddenByUser,hiddenByFilter)))'
  });

  const sheetList = meta.data.sheets ?? [];
  const titles = sheetList.
  map((sheet) => sheet.properties?.title).
  filter((title): title is string => Boolean(title));

  if (!titles.length) throw new Error('File không có sheet nào.');

  // Giá trị ô của mọi sheet trong một lần gọi.
  const values = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: titles,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING'
  });

  return titles.map((name, index) => {
    const sheet = sheetList[index];
    const rowMetadata = sheet?.data?.[0]?.rowMetadata ?? [];

    const hiddenRows: number[] = [];
    rowMetadata.forEach((row, position) => {
      if (row?.hiddenByUser || row?.hiddenByFilter) hiddenRows.push(position);
    });

    // Sheets API dùng endRow/endColumn loại trừ; chuyển sang bao gồm cả hai đầu.
    const merges: MergeRange[] = (sheet?.merges ?? []).map((range) => ({
      startRow: range.startRowIndex ?? 0,
      endRow: (range.endRowIndex ?? 1) - 1,
      startColumn: range.startColumnIndex ?? 0,
      endColumn: (range.endColumnIndex ?? 1) - 1
    }));

    return {
      name,
      grid: (values.data.valueRanges?.[index]?.values ?? []) as unknown[][],
      merges,
      hiddenRows,
      hidden: Boolean(sheet?.properties?.hidden)
    };
  });
}

/** Google Sheet gốc: xuất sang .xlsx. Dự phòng khi Sheets API chưa bật. */
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

/** Trích link bật API từ thông báo lỗi của Google, nếu có. */
function enableUrl(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/https:\/\/console\.developers\.google\.com\S+/);
  return match ? match[0].replace(/[.,)]+$/, '') : null;
}

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
      'Không mở được file. Kiểm tra link đã đặt chế độ "Bất kỳ ai có liên kết — ' +
      'Người xem" chưa, hoặc chia sẻ file cho địa chỉ service account.');

  }
  if (/exportSizeLimitExceeded|too large/i.test(message)) {
    return 'File quá lớn để xuất. Hãy bật Google Sheets API cho project để đọc trực tiếp.';
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

  // Bước 1: hỏi Drive xem đây là loại file gì.
  let mimeType = '';
  let fileName = '';
  /** Thời điểm chủ đầu tư sửa file lần cuối — mốc để phát hiện thay đổi. */
  let modifiedTime = '';
  try {
    const drive = getDriveClient();
    const meta = await drive.files.get({
      fileId,
      fields: 'mimeType, name, modifiedTime',
      supportsAllDrives: true
    });
    mimeType = meta.data.mimeType ?? '';
    fileName = meta.data.name ?? '';
    modifiedTime = meta.data.modifiedTime ?? '';
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
        modifiedTime,
        workbook: await downloadBinary(fileId)
      });
    } catch (error) {
      res.status(502).json({ error: describe(error) });
    }
    return;
  }

  // Bước 2b: không phải bảng tính.
  if (mimeType !== GOOGLE_SHEET_MIME) {
    res.status(400).json({
      error:
      `File "${fileName || fileId}" không phải bảng tính (${mimeType || 'không rõ định dạng'}). ` +
      'Cần Google Sheet hoặc file .xlsx, .xls, .csv trên Drive.'
    });
    return;
  }

  // Bước 3: Google Sheet gốc — Sheets API là đường chính.
  let sheetsError: unknown = null;
  try {
    res.status(200).json({
      source: 'sheets-api',
      fileName,
      modifiedTime,
      sheets: await readViaSheetsApi(fileId)
    });
    return;
  } catch (error) {
    if (!isApiDisabled(error)) {
      res.status(502).json({ error: describe(error) });
      return;
    }
    // Sheets API chưa bật — thử xuất file, nhưng đường này mất ô gộp và
    // sẽ hỏng nếu chủ đầu tư chặn tải xuống.
    sheetsError = error;
  }

  try {
    res.status(200).json({
      source: 'drive-export',
      fileName,
      modifiedTime,
      degraded: 'Sheets API chưa bật — không lấy được thông tin ô gộp và dòng ẩn.',
      workbook: await exportGoogleSheet(fileId)
    });
  } catch (error) {
    // Cả hai đường đều hỏng. Nguyên nhân gốc là Sheets API chưa bật, không
    // phải lỗi xuất file — nên báo đúng nguyên nhân đó thay vì lỗi phái sinh.
    const cannotExport = /cannot be exported|exportSizeLimitExceeded/i.test(
      error instanceof Error ? error.message : String(error)
    );

    if (sheetsError && cannotExport) {
      // Đây là lỗi CẤU HÌNH HỆ THỐNG, không phải lỗi của người dùng hay của
      // chủ đầu tư. Hướng dẫn kỹ thuật đi vào log; người dùng chỉ thấy thông
      // báo phù hợp với việc họ làm được.
      const link = enableUrl(sheetsError);
      console.error(
        '[read-sheet] Google Sheets API chưa được bật trên project của hệ thống. ' +
        'Đây là cấu hình một lần của đội kỹ thuật, không liên quan tới chủ đầu tư. ' +
        (link ? `Bật tại: ${link}` : '')
      );

      res.status(503).json({
        error:
        'Hệ thống chưa đọc được Google Sheet do thiếu cấu hình phía máy chủ. ' +
        'Vui lòng báo đội kỹ thuật — không cần liên hệ chủ đầu tư.',
        code: 'SHEETS_API_DISABLED'
      });
      return;
    }

    res.status(502).json({ error: describe(sheetsError ?? error) });
  }
}
