import { analyzeSheet, type Grid, type SheetAnalysis } from './inventoryParser';
import { isTowerSheet, parseTowerSheet, type TowerSheet } from './towerSheet';

/**
 * Bốn loại sheet:
 *  tower     — sheet Tòa dạng bảng biểu, dùng làm template (Kiểu 1)
 *  inventory — sheet quỹ căn chứa dữ liệu căn
 *  fund      — sheet đánh dấu căn thuộc quỹ nào
 *  skip      — quy trình, biểu mẫu, ghi chú
 */
export type SheetKind = 'tower' | 'inventory' | 'fund' | 'skip';

/** Vùng ô gộp, chỉ số 0-based, bao gồm cả hai đầu. */
export interface MergeRange {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

export interface DetectedSheet {
  name: string;
  rows: number;
  columns: number;
  kind: SheetKind;
  analysis: SheetAnalysis;
  /** Ô gộp trong file gốc — mang thông tin penthouse và duplex. */
  merges: MergeRange[];
  /** Số dòng bị ẩn hoặc bị lọc, đã loại khỏi phân tích. */
  hiddenRowCount: number;
  /** Sheet bị ẩn trong file gốc. */
  hidden: boolean;
  /** Template đọc được, chỉ có ở sheet Tòa. */
  tower?: TowerSheet;
}

/** Loại hình dự án — quyết định tab nào hiển thị và cảnh báo chọn nhầm sheet. */
export type ProjectLayout = 'cao-tang' | 'thap-tang';

export interface WorkbookResult {
  sheets: DetectedSheet[];
  /** Đường đọc đã dùng — hiển thị khi bị giảm chất lượng. */
  source: 'sheets-api' | 'drive-export' | 'drive-download' | 'file';
  /** Lời nhắc khi đường đọc không lấy được đủ thông tin. */
  degraded?: string;
  /** Thời điểm chủ đầu tư sửa file lần cuối. */
  modifiedTime?: string;
}

/** Đoán phân loại ban đầu từ tên sheet — người dùng vẫn sửa lại được. */
function guessKind(
name: string,
analysis: SheetAnalysis,
hidden: boolean,
isTower: boolean)
: SheetKind {
  if (isTower) return 'tower';
  const plain = name.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/gi, 'd').
  toLowerCase();

  if (hidden) return 'skip';
  // Sheet quy trình, biểu mẫu, hướng dẫn không phải dữ liệu căn.
  if (/quy\s*trinh|bieu\s*mau|cau\s*tra\s*loi|ghi\s*chu|note|huong\s*dan|readme|template|form/.test(plain)) {
    return 'skip';
  }
  if (!analysis.units.length) return 'skip';
  if (/quy\s*(doc\s*quyen|cheo|rieng|chung)/.test(plain)) return 'fund';
  return 'inventory';
}

/**
 * Loại dòng ẩn khỏi lưới trước khi phân tích.
 *
 * Sheets API trả về cả dòng bị ẩn và bị lọc — tức hệ thống có thể thấy dữ liệu
 * mà người dùng không thấy trên màn hình. Bỏ chúng đi để những gì nhập vào
 * khớp với những gì QLGD nhìn thấy.
 */
function dropHiddenRows(grid: Grid, hiddenRows: number[]): {grid: Grid;dropped: number;} {
  if (!hiddenRows.length) return { grid, dropped: 0 };
  const hidden = new Set(hiddenRows);
  const kept = grid.filter((_, index) => !hidden.has(index));
  return { grid: kept, dropped: grid.length - kept.length };
}

/** Dời chỉ số vùng gộp theo các dòng đã bị loại. */
function shiftMerges(merges: MergeRange[], hiddenRows: number[]): MergeRange[] {
  if (!hiddenRows.length) return merges;
  const sorted = [...hiddenRows].sort((a, b) => a - b);
  const before = (row: number) => sorted.filter((index) => index < row).length;

  return merges.
  map((merge) => ({
    ...merge,
    startRow: merge.startRow - before(merge.startRow),
    endRow: merge.endRow - before(merge.endRow)
  })).
  filter((merge) => merge.endRow >= merge.startRow);
}

function toSheet(
name: string,
grid: Grid,
merges: MergeRange[] = [],
hiddenRows: number[] = [],
hidden = false)
: DetectedSheet {
  const cleaned = dropHiddenRows(grid, hiddenRows);
  const shifted = shiftMerges(merges, hiddenRows);
  const analysis = analyzeSheet(cleaned.grid, name, { merges: shifted });

  // Sheet Tòa nhận diện bằng ô TẦNG/CĂN ở cột đầu.
  const isTower = isTowerSheet(cleaned.grid);
  const tower = isTower ?
  parseTowerSheet(cleaned.grid, shifted, name) :
  undefined;

  return {
    name,
    rows: cleaned.grid.length,
    columns: Math.max(...cleaned.grid.map((row) => row.length), 0),
    kind: guessKind(name, analysis, hidden, isTower),
    analysis,
    merges: shifted,
    hiddenRowCount: cleaned.dropped,
    hidden,
    tower
  };
}

/** base64 → ArrayBuffer, dùng cho file .xlsx do backend trả về. */
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
    const sheet = workbook.Sheets[name];
    const grid = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: true,
      defval: null,
      blankrows: true
    }) as Grid;

    // SheetJS đã dùng chỉ số bao gồm cả hai đầu, không cần đổi.
    const merges: MergeRange[] = (sheet['!merges'] ?? []).map((range) => ({
      startRow: range.s.r,
      endRow: range.e.r,
      startColumn: range.s.c,
      endColumn: range.e.c
    }));

    return toSheet(name, grid, merges);
  });
}

/** Đọc file Excel người dùng tải lên. */
export async function parseWorkbookFile(file: File): Promise<WorkbookResult> {
  return {
    sheets: await readWorkbookBuffer(await file.arrayBuffer()),
    source: 'file'
  };
}

/**
 * Đọc Google Sheet qua backend.
 *
 * Backend trả về một trong hai dạng: lưới ô kèm ô gộp và dòng ẩn (Sheets API),
 * hoặc cả file .xlsx dạng base64 (dự phòng qua Drive).
 */
export async function parseWorkbookLink(url: string): Promise<WorkbookResult> {
  const response = await fetch('/api/read-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Không đọc được Google Sheet.');

  if (typeof data.workbook === 'string') {
    return {
      sheets: await readWorkbookBuffer(decodeBase64(data.workbook)),
      source: data.source ?? 'drive-export',
      degraded: data.degraded,
      modifiedTime: data.modifiedTime
    };
  }

  const sheets = (data.sheets as Array<{
    name: string;
    grid: Grid;
    merges?: MergeRange[];
    hiddenRows?: number[];
    hidden?: boolean;
  }>).map((sheet) =>
  toSheet(sheet.name, sheet.grid, sheet.merges, sheet.hiddenRows, sheet.hidden)
  );

  return { sheets, source: 'sheets-api', modifiedTime: data.modifiedTime };
}

export interface SheetStatus {
  fileName: string;
  modifiedTime: string;
  modifiedBy: string;
  unavailable?: boolean;
}

/**
 * Hỏi Drive xem chủ đầu tư đã sửa file chưa. Chỉ đọc metadata nên đủ nhẹ để
 * gọi định kỳ mà không ảnh hưởng quota.
 */
export async function checkSheetStatus(url: string): Promise<SheetStatus | null> {
  try {
    const response = await fetch(`/api/check-sheet?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (!response.ok || data.unavailable) return null;
    return data as SheetStatus;
  } catch {
    return null;
  }
}
