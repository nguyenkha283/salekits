import { analyzeSheet, type Grid, type SheetAnalysis } from './inventoryParser';

export type SheetKind = 'inventory' | 'fund' | 'skip';

export interface DetectedSheet {
  name: string;
  rows: number;
  columns: number;
  kind: SheetKind;
  analysis: SheetAnalysis;
}

/** Đoán phân loại ban đầu từ tên sheet — người dùng vẫn sửa lại được. */
function guessKind(name: string, analysis: SheetAnalysis): SheetKind {
  const plain = name.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/gi, 'd').
  toLowerCase();

  if (/ghi\s*chu|note|huong\s*dan|readme|template|mau/.test(plain)) return 'skip';
  // Không có căn nào đọc được thì gần như chắc chắn không phải sheet dữ liệu.
  if (!analysis.units.length) return 'skip';
  if (/quy\s*(doc\s*quyen|cheo|rieng)/.test(plain)) return 'fund';
  return 'inventory';
}

function toSheet(name: string, grid: Grid): DetectedSheet {
  const analysis = analyzeSheet(grid, name);
  return {
    name,
    rows: grid.length,
    columns: Math.max(...grid.map((row) => row.length), 0),
    kind: guessKind(name, analysis),
    analysis
  };
}

/**
 * Đọc file Excel người dùng tải lên. SheetJS nạp động để nếu gói chưa cài thì
 * báo lỗi rõ ràng thay vì làm hỏng màn hình.
 */
export async function parseWorkbookFile(file: File): Promise<DetectedSheet[]> {
  return readWorkbookBuffer(await file.arrayBuffer());
}

/** base64 → ArrayBuffer, dùng cho file .xlsx do backend xuất ra. */
function decodeBase64(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function readWorkbookBuffer(buffer: ArrayBuffer): Promise<DetectedSheet[]> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });

  return workbook.SheetNames.map((name) => {
    const grid = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
      header: 1,
      raw: true,
      defval: null,
      blankrows: true
    }) as Grid;
    return toSheet(name, grid);
  });
}

/**
 * Đọc Google Sheet qua backend — trình duyệt không truy cập trực tiếp được.
 *
 * Backend trả về một trong hai dạng: lưới ô đã tách sẵn (Sheets API), hoặc cả
 * file .xlsx dạng base64 (dự phòng qua Drive export khi Sheets API chưa bật).
 */
export async function parseWorkbookLink(url: string): Promise<DetectedSheet[]> {
  const response = await fetch('/api/read-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Không đọc được Google Sheet.');

  if (typeof data.workbook === 'string') {
    // CSV không có nhiều sheet; SheetJS vẫn đọc được qua cùng một đường.
    return readWorkbookBuffer(decodeBase64(data.workbook));
  }

  return (data.sheets as Array<{name: string;grid: Grid;}>).map((sheet) =>
  toSheet(sheet.name, sheet.grid)
  );
}
