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

/**
 * Một trục căn.
 *
 * Trục có thể rộng hơn một ô khi người dùng gộp trục lại — trường hợp căn
 * duplex thông nhau. Trục bị vô hiệu hóa là khu vực chung (thang máy, sảnh,
 * kỹ thuật): hiển thị màu ghi và không được đánh số.
 */
export interface ColumnDef {
  id: string;
  /** Mã trục gốc trong file, dùng để tra dữ liệu căn. */
  code: string;
  /** Mã của các trục đã gộp vào trục này. */
  mergedCodes: string[];
  /** Số ô vật lý trục chiếm trên lưới. */
  span: number;
  disabled: boolean;
  /** Nhãn hiển thị; hệ thống tự đánh số lại sau mỗi lần gộp hoặc vô hiệu hóa. */
  label: string;
}

export interface GridBlock {
  id: string;
  columns: ColumnDef[];
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

function makeColumn(code: string): ColumnDef {
  return { id: nextId('col'), code, mergedCodes: [code], span: 1, disabled: false, label: code };
}

/* ─────────────────────────────────────────────────────────────
   Chuyển đổi giữa ô gộp và "chủ sở hữu theo trục"
   ───────────────────────────────────────────────────────────── */

/** owners[k] = chỉ số ô tiêu đề đang phủ trục thứ k. */
function toOwners(cells: HeaderCell[], columnCount: number): number[] {
  const owners: number[] = [];
  let index = 0;
  while (index < columnCount) {
    const cell = cells[index];
    const span = cell ? cell.span : 1;
    for (let offset = 0; offset < span && owners.length < columnCount; offset++) {
      owners.push(index);
    }
    index += span;
  }
  return owners;
}

/** Dựng lại mảng ô gộp từ owners, gộp các trục liền nhau cùng chủ. */
function fromOwners(owners: number[], valueOf: (owner: number) => string): HeaderCell[] {
  const cells: HeaderCell[] = new Array(owners.length).fill(null);
  let position = 0;
  while (position < owners.length) {
    const owner = owners[position];
    let span = 1;
    while (position + span < owners.length && owners[position + span] === owner) span += 1;
    cells[position] = { value: valueOf(owner), span };
    position += span;
  }
  return cells;
}

/** Áp một phép biến đổi danh sách trục lên toàn bộ dòng tiêu đề. */
function remapHeaders(
block: GridBlock,
keep: (columnIndex: number) => number | null)
: Record<HeaderRowId, HeaderCell[]> {
  const result = {} as Record<HeaderRowId, HeaderCell[]>;

  HEADER_ROWS.forEach((row) => {
    const cells = block.headers[row.id];
    const owners = toOwners(cells, block.columns.length);
    const values = cells.map((cell) => cell?.value ?? '');

    const nextOwners: number[] = [];
    const ownerValues: string[] = [];
    const ownerMap = new Map<number, number>();

    block.columns.forEach((_, index) => {
      if (keep(index) === null) return;
      const owner = owners[index];
      if (!ownerMap.has(owner)) {
        ownerMap.set(owner, ownerValues.length);
        ownerValues.push(values[owner] ?? '');
      }
      nextOwners.push(ownerMap.get(owner) as number);
    });

    result[row.id] = fromOwners(nextOwners, (owner) => ownerValues[owner] ?? '');
  });

  return result;
}

/**
 * Đánh số lại các trục còn hiệu lực: 01, 02, 03…
 * Trục bị vô hiệu hóa không nhận số, nên trục sau nó dồn lên.
 */
export function renumberColumns(block: GridBlock): GridBlock {
  let counter = 0;
  return {
    ...block,
    columns: block.columns.map((column) => {
      if (column.disabled) return { ...column, label: '' };
      counter += 1;
      return { ...column, label: String(counter).padStart(2, '0') };
    })
  };
}

/** Gộp nhiều trục thành một — dùng cho căn duplex thông nhau. */
export function mergeColumns(block: GridBlock, from: number, to: number): GridBlock {
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  if (end <= start) return block;

  const group = block.columns.slice(start, end + 1);
  const merged: ColumnDef = {
    id: group[0].id,
    code: group[0].code,
    mergedCodes: group.flatMap((column) => column.mergedCodes),
    span: group.reduce((total, column) => total + column.span, 0),
    // Gộp trục thường đi kèm việc trục đó lại thành căn thật, nên bỏ vô hiệu hóa.
    disabled: group.every((column) => column.disabled),
    label: group[0].label
  };

  const headers = remapHeaders(block, (index) =>
  index > start && index <= end ? null : index
  );

  const columns = [...block.columns];
  columns.splice(start, end - start + 1, merged);

  return renumberColumns({ ...block, columns, headers });
}

/** Bật hoặc tắt trạng thái khu vực chung của một trục. */
export function toggleColumnDisabled(block: GridBlock, index: number): GridBlock {
  const columns = block.columns.map((column, position) =>
  position === index ? { ...column, disabled: !column.disabled } : column
  );
  return renumberColumns({ ...block, columns });
}

/** Đặt trạng thái cho cả một dải trục cùng lúc. */
export function setColumnsDisabled(
block: GridBlock,
from: number,
to: number,
disabled: boolean)
: GridBlock {
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  const columns = block.columns.map((column, position) =>
  position >= start && position <= end ? { ...column, disabled } : column
  );
  return renumberColumns({ ...block, columns });
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
      columns: columns.map(makeColumn),
      headers,
      floors: axes.floors
    }]

  };
}

/**
 * Tách khối tại một tầng: mọi tầng SAU tầng được chọn chuyển sang khối mới.
 *
 * Khối mới sao chép danh sách trục và toàn bộ dòng tiêu đề của khối gốc, vì
 * penthouse thường bắt đầu từ layout cũ rồi mới chỉnh.
 */
export function splitBlockAt(
model: GridModel,
blockId: string,
floorIndex: number)
: GridModel {
  const index = model.blocks.findIndex((block) => block.id === blockId);
  if (index === -1) return model;

  const block = model.blocks[index];
  // Tầng cuối thì không còn gì để tách.
  if (floorIndex >= block.floors.length - 1) return model;

  const upper: GridBlock = {
    ...block,
    floors: block.floors.slice(0, floorIndex + 1)
  };
  const lower: GridBlock = {
    id: nextId('block'),
    columns: block.columns.map((column) => ({ ...column, id: nextId('col') })),
    headers: Object.fromEntries(
      HEADER_ROWS.map((row) => [row.id, block.headers[row.id].map((cell) => cell ? { ...cell } : null)])
    ) as Record<HeaderRowId, HeaderCell[]>,
    floors: block.floors.slice(floorIndex + 1)
  };

  const blocks = [...model.blocks];
  blocks.splice(index, 1, upper, lower);
  return { blocks };
}

/** Xóa một khối cùng toàn bộ tầng của nó. Luôn giữ lại ít nhất một khối. */
export function removeBlock(model: GridModel, blockId: string): GridModel {
  if (model.blocks.length <= 1) return model;
  return { blocks: model.blocks.filter((block) => block.id !== blockId) };
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
  columns.splice(index, 0, makeColumn(name));

  const headers = { ...block.headers };
  HEADER_ROWS.forEach((row) => {
    headers[row.id] = insertIntoRow(block.headers[row.id], index);
  });

  return renumberColumns({ ...block, columns, headers });
}

export function removeColumn(block: GridBlock, index: number): GridBlock {
  if (block.columns.length <= 1) return block;

  const headers = remapHeaders(block, (position) => position === index ? null : position);
  const columns = block.columns.filter((_, position) => position !== index);

  return renumberColumns({ ...block, columns, headers });
}

export function renameColumn(block: GridBlock, index: number, name: string): GridBlock {
  const columns = block.columns.map((column, position) =>
  position === index ? { ...column, label: name } : column
  );
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
  map((column) => Number(column.label.replace(/\D/g, ''))).
  filter((value) => Number.isFinite(value) && value > 0);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return String(next).padStart(2, '0');
}

/** Tổng số ô vật lý của một khối — các trục gộp chiếm nhiều ô. */
export function physicalWidth(block: GridBlock): number {
  return block.columns.reduce((total, column) => total + column.span, 0);
}

/** Độ rộng thực tế của một ô tiêu đề, quy ra số ô vật lý. */
export function cellWidth(block: GridBlock, index: number, span: number): number {
  return block.columns.
  slice(index, index + span).
  reduce((total, column) => total + column.span, 0);
}

export function suggestFloorName(block: GridBlock): string {
  const numbers = block.floors.
  map((floor) => Number(floor.replace(/\D/g, ''))).
  filter((value) => Number.isFinite(value) && value > 0);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return String(next);
}
