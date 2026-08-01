/**
 * Mô hình lưới bảng hàng có thể soạn thảo.
 *
 * Một bảng hàng gồm nhiều KHỐI. Mỗi khối có bộ dòng tiêu đề riêng và danh sách
 * tầng riêng — phục vụ trường hợp thực tế các tầng trên cùng là penthouse
 * (thông tầng) hoặc duplex (thông căn), có cấu trúc trục khác hẳn phần dưới.
 */

import type { InventoryData, ParsedUnit } from './inventoryParser';
import { axesOf } from './inventoryParser';

/** Sáu dòng tiêu đề bắt buộc của một bảng hàng. */
export const HEADER_ROWS = [
{ id: 'loai-hinh', label: 'LOẠI HÌNH' },
{ id: 'huong', label: 'HƯỚNG' },
{ id: 'dt-thong-thuy', label: 'DT THÔNG THỦY' },
{ id: 'dt-tim-tuong', label: 'DT TIM TƯỜNG' },
{ id: 'view', label: 'VIEW' }] as
const;

export type HeaderRowId = (typeof HEADER_ROWS)[number]['id'];

/** null nghĩa là ô bị một ô gộp phía trước phủ lên. */
export type HeaderCell = {value: string;span: number;} | null;

export interface GridBlock {
  id: string;
  name: string;
  /** Mã trục căn, ví dụ 01, 05A, 08A. */
  columns: string[];
  /** Mỗi dòng tiêu đề là một mảng ô dài bằng số cột. */
  headers: Record<HeaderRowId, HeaderCell[]>;
  floors: string[];
}

export interface GridModel {
  blocks: GridBlock[];
}

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

function plainCells(values: string[]): HeaderCell[] {
  return values.map((value) => ({ value, span: 1 }));
}

/* ─────────────────────────────────────────────────────────────
   Dựng lưới ban đầu từ dữ liệu đã bóc
   ───────────────────────────────────────────────────────────── */

/** Lấy giá trị đại diện của một trục; rỗng nếu file không có dữ liệu. */
function columnValue(
units: ParsedUnit[],
tower: string,
column: string,
pick: (unit: ParsedUnit) => string)
: string {
  const found = units.find((unit) => unit.tower === tower && unit.unit === column);
  return found ? pick(found) : '';
}

/** Cột tim tường nếu file có — tên cột thay đổi theo từng chủ đầu tư. */
function findTimTuong(unit: ParsedUnit): string {
  const key = Object.keys(unit.extras).find((name) =>
  name.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  toLowerCase().
  includes('tim tuong')
  );
  return key ? unit.extras[key] : '';
}

function findHuong(unit: ParsedUnit): string {
  const key = Object.keys(unit.extras).find((name) => {
    const plain = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return plain.includes('huong') || plain.includes('ban cong');
  });
  return key ? unit.extras[key] : '';
}

function findView(unit: ParsedUnit): string {
  const key = Object.keys(unit.extras).find((name) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('view')
  );
  return key ? unit.extras[key] : '';
}

/**
 * Dựng lưới cho một tòa. Dòng nào file không có dữ liệu thì để trống để người
 * dùng tự điền — không bịa số.
 */
export function buildGrid(data: InventoryData, tower: string): GridModel {
  const axes = axesOf(data.units, tower);
  const columns = axes.columns;

  const headers: Record<HeaderRowId, HeaderCell[]> = {
    'loai-hinh': plainCells(
      columns.map((column) => columnValue(data.units, tower, column, (unit) => unit.bedrooms))
    ),
    'huong': plainCells(
      columns.map((column) => columnValue(data.units, tower, column, findHuong))
    ),
    'dt-thong-thuy': plainCells(
      columns.map((column) =>
      columnValue(data.units, tower, column, (unit) =>
      unit.area ? unit.area.toFixed(1) : ''
      )
      )
    ),
    'dt-tim-tuong': plainCells(
      columns.map((column) => columnValue(data.units, tower, column, findTimTuong))
    ),
    'view': plainCells(
      columns.map((column) => columnValue(data.units, tower, column, findView))
    )
  };

  return {
    blocks: [
    {
      id: nextId('block'),
      name: 'Khối căn hộ',
      columns,
      headers,
      floors: axes.floors
    }]

  };
}

/** Khối mới cho penthouse hoặc duplex — trống để người dùng tự khai. */
export function createBlock(name: string, columnCount = 2, floorCount = 1): GridBlock {
  const columns = Array.from({ length: columnCount }, (_, index) =>
  String(index + 1).padStart(2, '0')
  );
  const headers = Object.fromEntries(
    HEADER_ROWS.map((row) => [row.id, plainCells(columns.map(() => ''))])
  ) as Record<HeaderRowId, HeaderCell[]>;

  return {
    id: nextId('block'),
    name,
    columns,
    headers,
    floors: Array.from({ length: floorCount }, (_, index) => String(index + 1))
  };
}

/* ─────────────────────────────────────────────────────────────
   Gộp và tách ô
   ───────────────────────────────────────────────────────────── */

/** Ô gộp bắt đầu ở vị trí nào và phủ tới đâu. */
export function segmentAt(cells: HeaderCell[], index: number): {start: number;span: number;} {
  for (let start = index; start >= 0; start--) {
    const cell = cells[start];
    if (cell) {
      return { start, span: cell.span };
    }
  }
  return { start: index, span: 1 };
}

export function mergeCells(cells: HeaderCell[], from: number, to: number): HeaderCell[] {
  const start = Math.min(from, to);
  const end = Math.max(from, to);

  // Mở rộng biên ra hết các ô gộp đang chồng lấn để không cắt đôi ô có sẵn.
  const left = segmentAt(cells, start).start;
  const rightSegment = segmentAt(cells, end);
  const right = rightSegment.start + rightSegment.span - 1;

  // Giữ giá trị đầu tiên không rỗng trong vùng gộp.
  const value =
  cells.
  slice(left, right + 1).
  map((cell) => cell?.value ?? '').
  find((text) => text.trim()) ?? '';

  const next = [...cells];
  next[left] = { value, span: right - left + 1 };
  for (let index = left + 1; index <= right; index++) next[index] = null;
  return next;
}

export function splitCells(cells: HeaderCell[], index: number): HeaderCell[] {
  const { start, span } = segmentAt(cells, index);
  if (span <= 1) return cells;

  const next = [...cells];
  const value = next[start]?.value ?? '';
  next[start] = { value, span: 1 };
  for (let offset = 1; offset < span; offset++) {
    next[start + offset] = { value: '', span: 1 };
  }
  return next;
}

export function setCellValue(cells: HeaderCell[], index: number, value: string): HeaderCell[] {
  const { start } = segmentAt(cells, index);
  const next = [...cells];
  const current = next[start];
  if (current) next[start] = { ...current, value };
  return next;
}

/* ─────────────────────────────────────────────────────────────
   Thêm và xóa cột, tầng, khối
   ───────────────────────────────────────────────────────────── */

/** Chèn cột vào vị trí index. Nếu rơi giữa ô gộp thì nới rộng ô đó. */
function insertIntoRow(cells: HeaderCell[], index: number): HeaderCell[] {
  const next = [...cells];
  const { start, span } = segmentAt(next, Math.min(index, next.length - 1));
  const insideMerge = index > start && index < start + span;

  if (insideMerge) {
    const current = next[start];
    if (current) next[start] = { ...current, span: current.span + 1 };
    next.splice(index, 0, null);
    return next;
  }

  next.splice(index, 0, { value: '', span: 1 });
  return next;
}

export function addColumn(block: GridBlock, index: number, name: string): GridBlock {
  const columns = [...block.columns];
  columns.splice(index, 0, name);

  const headers = { ...block.headers };
  HEADER_ROWS.forEach((row) => {
    headers[row.id] = insertIntoRow(block.headers[row.id], index);
  });

  return { ...block, columns, headers };
}

export function removeColumn(block: GridBlock, index: number): GridBlock {
  if (block.columns.length <= 1) return block;

  const columns = block.columns.filter((_, position) => position !== index);
  const headers = { ...block.headers };

  HEADER_ROWS.forEach((row) => {
    const cells = [...block.headers[row.id]];
    const { start, span } = segmentAt(cells, index);

    if (span > 1) {
      const current = cells[start];
      if (current) cells[start] = { ...current, span: current.span - 1 };
      // Nếu xóa đúng ô mở đầu vùng gộp thì đẩy giá trị sang ô kế tiếp.
      if (start === index) {
        cells[index + 1] = { value: current?.value ?? '', span: current ? current.span - 1 : 1 };
      }
    }

    cells.splice(index, 1);
    headers[row.id] = cells;
  });

  return { ...block, columns, headers };
}

export function renameColumn(block: GridBlock, index: number, name: string): GridBlock {
  const columns = [...block.columns];
  columns[index] = name;
  return { ...block, columns };
}

export function addFloor(block: GridBlock, index: number, name: string): GridBlock {
  const floors = [...block.floors];
  floors.splice(index, 0, name);
  return { ...block, floors };
}

export function removeFloor(block: GridBlock, index: number): GridBlock {
  if (block.floors.length <= 1) return block;
  return { ...block, floors: block.floors.filter((_, position) => position !== index) };
}

export function renameFloor(block: GridBlock, index: number, name: string): GridBlock {
  const floors = [...block.floors];
  floors[index] = name;
  return { ...block, floors };
}

/** Gợi ý tên cột kế tiếp: 01, 02, 03… bỏ qua tên đã dùng. */
export function suggestColumnName(block: GridBlock): string {
  const numbers = block.columns.
  map((column) => Number(column.replace(/\D/g, ''))).
  filter((value) => Number.isFinite(value) && value > 0);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return String(next).padStart(2, '0');
}

export function suggestFloorName(block: GridBlock): string {
  const numbers = block.floors.
  map((floor) => Number(floor.replace(/\D/g, ''))).
  filter((value) => Number.isFinite(value) && value > 0);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return String(next);
}
