import type { ParsedSheet, SheetKind } from './components/SheetPickerDialog';

/**
 * Cấu trúc sheet của file bảng hàng mẫu đã nhận. Dùng khi nguồn là liên kết
 * Google Sheet — trình duyệt không đọc trực tiếp được, phải qua backend.
 */
const SAMPLE_SHEETS: ParsedSheet[] = [
{ name: 'Quy chung', rows: 55, columns: 15, kind: 'inventory' },
{ name: 'Quy doc quyen', rows: 48, columns: 15, kind: 'fund' },
{ name: 'Quy cheo', rows: 22, columns: 15, kind: 'fund' },
{ name: 'Ghi chu noi bo', rows: 12, columns: 3, kind: 'skip' }];


/** Đoán phân loại ban đầu từ tên sheet — người dùng vẫn sửa lại được. */
function guessKind(name: string, columns: number): SheetKind {
  const plain = name.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  toLowerCase();

  // Sheet quá hẹp gần như chắc chắn là ghi chú, không phải dữ liệu căn.
  if (columns < 5) return 'skip';
  if (/ghi\s*chu|note|huong\s*dan|readme/.test(plain)) return 'skip';
  if (/quy\s*(doc\s*quyen|cheo|rieng)/.test(plain)) return 'fund';
  return 'inventory';
}

/**
 * Đọc danh sách sheet từ file Excel người dùng tải lên.
 *
 * SheetJS được nạp động: nếu gói chưa cài thì rơi về cấu trúc mẫu thay vì làm
 * hỏng màn hình. Bản chính thức sẽ đọc ở backend để dùng chung một bộ luật
 * với đường nhập bằng liên kết Google Sheet.
 */
export async function parseWorkbook(file: File): Promise<ParsedSheet[]> {
  try {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const sheets = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      const range = sheet['!ref'] ? XLSX.utils.decode_range(sheet['!ref']) : null;
      const rows = range ? range.e.r - range.s.r + 1 : 0;
      const columns = range ? range.e.c - range.s.c + 1 : 0;
      return { name, rows, columns, kind: guessKind(name, columns) };
    });

    return sheets.length ? sheets : SAMPLE_SHEETS;
  } catch {
    return SAMPLE_SHEETS;
  }
}

/** Nguồn là liên kết — trình duyệt không đọc được, dùng cấu trúc mẫu. */
export function sampleWorkbook(): ParsedSheet[] {
  return SAMPLE_SHEETS.map((sheet) => ({ ...sheet }));
}
