/**
 * Đọc sheet Tòa dạng bảng biểu (Kiểu 1) thành mô hình lưới.
 *
 * Sheet Tòa chính là template hiển thị: ô dữ liệu để trống, mọi thông tin nằm
 * ở các dòng tiêu đề. Nhờ vậy đọc thẳng được, không phải suy diễn gì — kể cả
 * khối penthouse và ô gộp duplex.
 */

import { cellText, type Cell, type Grid } from './inventoryParser';
import {
  HEADER_ROWS,
  type ColumnDef,
  type GridBlock,
  type GridModel,
  type HeaderCell,
  type HeaderRowId } from
'./gridModel';

/** Vùng ô gộp, chỉ số 0-based, bao gồm cả hai đầu. */
export interface MergeRange {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

function plain(value: string): string {
  return value.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/gi, 'd').
  toLowerCase().
  replace(/\s+/g, ' ').
  trim();
}

/** Ô góc trái mở đầu mỗi khối. */
function isBlockAnchor(value: Cell): boolean {
  return /^tang\s*\/\s*can$/.test(plain(cellText(value)));
}

/** Nhận tên dòng tiêu đề theo nhiều cách viết khác nhau của các chủ đầu tư. */
const ROW_PATTERNS: Array<{id: HeaderRowId;patterns: RegExp[];}> = [
{ id: 'loai-hinh', patterns: [/loai can/, /loai hinh/, /^so pn$/, /so phong ngu/] },
{ id: 'huong', patterns: [/huong/, /ban cong/] },
{ id: 'dt-tim-tuong', patterns: [/tim tuong/] },
{ id: 'dt-thong-thuy', patterns: [/thong thuy/] },
{ id: 'view', patterns: [/^view/] }];


function matchHeaderRow(value: Cell): HeaderRowId | null {
  const text = plain(cellText(value));
  if (!text) return null;
  for (const { id, patterns } of ROW_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) return id;
  }
  return null;
}

/** Nhãn tầng: "24", "05A", "12A". */
function isFloorLabel(value: Cell): boolean {
  return /^\d+\s*[A-Za-z]?$/.test(cellText(value));
}

/** Excel đọc "10" thành 10.0 — chuẩn hóa lại thành chuỗi. */
function label(value: Cell): string {
  const text = cellText(value);
  return /^\d+\.0$/.test(text) ? text.slice(0, -2) : text;
}

function mergeAtCell(
merges: MergeRange[],
row: number,
column: number)
: MergeRange | undefined {
  return merges.find(
    (merge) =>
    row >= merge.startRow &&
    row <= merge.endRow &&
    column >= merge.startColumn &&
    column <= merge.endColumn
  );
}

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-t${counter}`;
}

export interface TowerSheet {
  /** Tên hiển thị lấy từ tên sheet, ví dụ "TÒA TEST1 (T1)" → "TEST1". */
  towerName: string;
  /** Ký hiệu trong ngoặc, ví dụ "T1". Rỗng nếu tên sheet không có. */
  towerCode: string;
  model: GridModel;
  warnings: string[];
}

/**
 * Chuẩn hóa tên tòa để khớp giữa sheet template và cột Tòa của sheet dữ liệu.
 * Hai nơi này thường viết khác nhau về hoa thường, dấu và khoảng trắng.
 */
export function normalizeTowerKey(value: string): string {
  return value.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/gi, 'd').
  replace(/^t[oò]a\s*/i, '').
  replace(/[\s_-]+/g, '').
  toLowerCase();
}

/** "TÒA TEST1 (T1)" → { name: "TEST1", code: "T1" } */
export function parseTowerSheetName(name: string): {name: string;code: string;} {
  const withCode = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const base = (withCode ? withCode[1] : name).replace(/^t[oò]a\s*/i, '').trim();
  return { name: base || name, code: withCode ? withCode[2].trim() : '' };
}

/** Sheet này có phải dạng bảng biểu không — dùng để nhận diện Kiểu 1. */
export function isTowerSheet(grid: Grid): boolean {
  return grid.some((row) => row?.some((cell) => isBlockAnchor(cell)));
}

/**
 * Đọc một sheet Tòa thành mô hình lưới nhiều khối.
 *
 * Mỗi lần gặp ô `TẦNG/CĂN` ở cột đầu là mở một khối mới: các dòng ngay sau đó
 * là dòng tiêu đề, rồi tới danh sách tầng.
 */
export function parseTowerSheet(
grid: Grid,
merges: MergeRange[],
sheetName: string)
: TowerSheet {
  const warnings: string[] = [];
  const { name: towerName, code: towerCode } = parseTowerSheetName(sheetName);

  // Vị trí các dòng mở đầu khối.
  const anchors: number[] = [];
  grid.forEach((row, index) => {
    if (isBlockAnchor(row?.[0])) anchors.push(index);
  });

  if (!anchors.length) {
    return {
      towerName,
      towerCode,
      model: { blocks: [] },
      warnings: [`Sheet "${sheetName}" không có ô TẦNG/CĂN — không phải sheet tòa.`]
    };
  }

  const blocks: GridBlock[] = [];

  anchors.forEach((anchor, position) => {
    const end = position + 1 < anchors.length ? anchors[position + 1] : grid.length;

    // ── Trục căn ────────────────────────────────────────────────
    // Dừng ở ô TẦNG/CĂN thứ hai — nhiều bảng lặp nhãn ở mép phải.
    const anchorRow = grid[anchor] ?? [];
    const columns: ColumnDef[] = [];
    const labelPool: string[] = [];
    let column = 1;

    while (column < anchorRow.length) {
      if (isBlockAnchor(anchorRow[column])) break;

      const merge = mergeAtCell(merges, anchor, column);
      // Ô gộp ngang ở dòng trục = một trục chiếm nhiều ô (căn duplex).
      const span = merge && merge.startRow === anchor ?
      merge.endColumn - merge.startColumn + 1 :
      1;

      const text = label(anchorRow[column]);
      if (text) {
        columns.push({
          id: nextId('col'),
          code: text,
          mergedCodes: [text],
          span,
          disabled: false,
          label: text
        });
        labelPool.push(text);
      } else {
        // Ô trống giữa dải trục = khu vực chung.
        columns.push({
          id: nextId('col'),
          code: '',
          mergedCodes: [],
          span,
          disabled: true,
          label: ''
        });
      }

      column += span;
    }

    // Bỏ các trục trống ở cuối dải — đó là ô thừa của bảng, không phải khu
    // vực chung. Khu vực chung là khoảng trống NẰM GIỮA các trục có nhãn.
    while (columns.length && columns[columns.length - 1].disabled) columns.pop();

    if (!columns.length) {
      warnings.push(`Khối ở dòng ${anchor + 1} không đọc được trục nào.`);
      return;
    }

    /** Chỉ số ô vật lý → chỉ số trục, để quy đổi vùng gộp của dòng tiêu đề. */
    const slotToColumn = new Map<number, number>();
    let slot = 1;
    columns.forEach((item, index) => {
      for (let offset = 0; offset < item.span; offset++) {
        slotToColumn.set(slot + offset, index);
      }
      slot += item.span;
    });

    // ── Dòng tiêu đề ────────────────────────────────────────────
    const headers = Object.fromEntries(
      HEADER_ROWS.map((row) => [
      row.id,
      columns.map(() => ({ value: '', span: 1 }) as HeaderCell)]
      )
    ) as Record<HeaderRowId, HeaderCell[]>;

    const floors: string[] = [];
    const floorRows: number[] = [];

    for (let row = anchor + 1; row < end; row++) {
      const first = grid[row]?.[0];
      const headerId = matchHeaderRow(first);

      if (headerId) {
        const cells: HeaderCell[] = new Array(columns.length).fill(null);
        let index = 0;

        while (index < columns.length) {
          const physical = [...slotToColumn.entries()].find(
            ([, value]) => value === index
          )?.[0];
          if (physical === undefined) break;

          const merge = mergeAtCell(merges, row, physical);
          let span = 1;

          if (merge && merge.startRow === row) {
            const from = slotToColumn.get(merge.startColumn) ?? index;
            const to = slotToColumn.get(merge.endColumn) ?? index;
            span = Math.max(1, to - from + 1);
          }

          cells[index] = { value: cellText(grid[row]?.[physical]), span };
          for (let offset = 1; offset < span && index + offset < columns.length; offset++) {
            cells[index + offset] = null;
          }
          index += span;
        }

        headers[headerId] = cells;
        continue;
      }

      if (isFloorLabel(first)) {
        floors.push(label(first));
        floorRows.push(row);
      }
    }

    if (!floors.length) {
      warnings.push(`Khối ở dòng ${anchor + 1} không có tầng nào.`);
      return;
    }

    // ── Ô gộp trong vùng dữ liệu = penthouse thông tầng ─────────
    const cellMerges = merges.
    filter(
      (merge) =>
      merge.startRow >= floorRows[0] &&
      merge.endRow <= floorRows[floorRows.length - 1] &&
      merge.startColumn >= 1 && (
      merge.endRow > merge.startRow || merge.endColumn > merge.startColumn)
    ).
    map((merge) => {
      const floorStart = floorRows.indexOf(merge.startRow);
      const floorEnd = floorRows.indexOf(merge.endRow);
      const columnStart = slotToColumn.get(merge.startColumn);
      const columnEnd = slotToColumn.get(merge.endColumn);
      if (
      floorStart === -1 ||
      floorEnd === -1 ||
      columnStart === undefined ||
      columnEnd === undefined)
      {
        return null;
      }
      return {
        id: nextId('merge'),
        floorStart,
        floorEnd,
        columnStart,
        columnEnd
      };
    }).
    filter((merge): merge is NonNullable<typeof merge> => merge !== null);

    // Trục không có nhãn nhưng bị một ô gộp dữ liệu phủ lên là căn penthouse
    // đã nuốt trọn trục đó, không phải khu vực chung.
    cellMerges.forEach((merge) => {
      for (let index = merge.columnStart; index <= merge.columnEnd; index++) {
        const target = columns[index];
        if (target?.disabled) {
          columns[index] = { ...target, disabled: false };
        }
      }
    });

    blocks.push({ id: nextId('block'), columns, labelPool, merges: cellMerges, headers, floors });
  });

  return { towerName, towerCode, model: { blocks }, warnings };
}
