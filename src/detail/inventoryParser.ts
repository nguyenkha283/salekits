/**
 * Bóc tách bảng hàng từ lưới ô thô (mảng hai chiều) của một sheet.
 *
 * Không giả định vị trí cột hay dòng tiêu đề: mọi thứ dò từ nội dung. Đây là
 * yêu cầu thực tế vì mỗi chủ đầu tư đặt tên cột một kiểu, tiêu đề có thể nằm ở
 * dòng bất kỳ và thường trải trên nhiều dòng.
 */

import {
  buildLadder,
  buildUnitLadder,
  compareLabels,
  splitUnitCode } from
'./unitCode';

export type Cell = string | number | null | undefined;
export type Grid = Cell[][];

export interface PriceField {
  /** Chỉ số cột trong lưới. */
  index: number;
  label: string;
  /** Nhãn nhóm lấy từ dòng phía trên, ví dụ "Chính sách ổn định lãi suất". */
  group: string;
}

export interface ParsedUnit {
  code: string;
  tower: string;
  floor: string;
  unit: string;
  /** Ký hiệu tòa lấy từ mã căn, ví dụ "A1" của "A1-22.07". */
  towerCode?: string;
  /** Trường nào được suy ra từ mã căn thay vì đọc thẳng từ cột. */
  derived?: Array<'tower' | 'floor' | 'unit'>;
  area: number | null;
  bedrooms: string;
  handover: string;
  status: UnitStatusValue;
  /** Tên quỹ nếu cột Tình trạng ghi phân loại quỹ thay vì trạng thái bán. */
  fundLabel?: string;
  /** Giá theo đúng thứ tự priceFields. */
  prices: number[];
  /** Các cột không nhận diện được, giữ nguyên để hiển thị ở chi tiết căn. */
  extras: Record<string, string>;
}

export type UnitStatusValue = 'Còn hàng' | 'Đã lock' | 'Đã cọc' | 'Đã bán';

export interface ColumnMapping {
  code?: number;
  tower?: number;
  floor?: number;
  unit?: number;
  area?: number;
  bedrooms?: number;
  handover?: number;
  status?: number;
  fund?: number;
}

/** Căn thông tầng hoặc thông căn, suy từ ô gộp trong file gốc. */
export interface SpanHint {
  code: string;
  /** Số tầng căn này chiếm — 2 nghĩa là penthouse thông hai tầng. */
  floorSpan: number;
  /** Số trục căn này chiếm — 2 nghĩa là duplex thông hai căn. */
  columnSpan: number;
}

export interface SheetAnalysis {
  headerRow: number;
  mapping: ColumnMapping;
  priceFields: PriceField[];
  units: ParsedUnit[];
  /** Nhãn cột không nhận diện được, hiển thị để người dùng biết bị bỏ qua. */
  unknownColumns: string[];
  warnings: string[];
  /** Ô gộp ở cột Mã căn cho biết căn nào thông tầng. */
  spanHints: SpanHint[];
}

/* ─────────────────────────────────────────────────────────────
   Chuẩn hoá
   ───────────────────────────────────────────────────────────── */

export function cellText(value: Cell): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

/** Bỏ dấu, hạ chữ thường — để so khớp tên cột không phụ thuộc cách gõ. */
function plain(value: string): string {
  return value.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/gi, 'd').
  toLowerCase().
  replace(/\s+/g, ' ').
  trim();
}

/** "5,432,422,100" hoặc "5.432.422.100" → 5432422100 */
export function parseNumber(value: Cell): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const text = cellText(value);
  if (!text) return null;

  const cleaned = text.replace(/[^\d.,-]/g, '');
  if (!cleaned) return null;

  const commas = (cleaned.match(/,/g) ?? []).length;
  const dots = (cleaned.match(/\./g) ?? []).length;

  /** Dấu đứng sau cùng là thập phân, dấu còn lại là phân tách nghìn. */
  function split(decimal: ',' | '.'): string {
    const thousands = decimal === ',' ? /\./g : /,/g;
    return cleaned.replace(thousands, '').replace(decimal, '.');
  }

  /** Chỉ một loại dấu: là phân tách nghìn nếu xuất hiện nhiều lần hoặc nhóm cuối đủ 3 chữ số. */
  function single(separator: ',' | '.'): string {
    const parts = cleaned.split(separator);
    const isThousands =
    parts.length > 2 || parts.slice(1).every((part) => part.length === 3);
    return isThousands ?
    parts.join('') :
    parts.join('.');
  }

  let normalized: string;
  if (commas && dots) {
    normalized = cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.') ? split(',') : split('.');
  } else if (commas) {
    normalized = single(',');
  } else if (dots) {
    normalized = single('.');
  } else {
    normalized = cleaned;
  }

  const result = Number(normalized);
  return Number.isFinite(result) ? result : null;
}

/* ─────────────────────────────────────────────────────────────
   Nhận diện cột
   ───────────────────────────────────────────────────────────── */

/** Từ khoá nhận diện, xếp theo độ ưu tiên giảm dần. */
const FIELD_PATTERNS: Array<{field: keyof ColumnMapping;patterns: RegExp[];}> = [
{ field: 'code', patterns: [/ma can/, /^ma sp$/, /ma san pham/, /^ma căn/, /^unit code$/] },
{ field: 'tower', patterns: [/^toa/, /truc.*toa/, /toa.*truc/, /^block$/, /^phan khu$/, /^tower$/] },
{ field: 'floor', patterns: [/^tang/, /^so tang$/, /^floor$/, /^lau$/] },
{ field: 'unit', patterns: [/^can so$/, /^so can$/, /^can$/, /^truc/, /^ma so can$/, /^vi tri can$/] },
{
  field: 'area',
  // "DT thông thủy (m2)", "Diện tích thông thủy", "DTTT", "DT TT" — ưu tiên
  // thông thủy vì đó là diện tích tính tiền.
  patterns: [
  /thong thuy/, /^dttt/, /^dt tt/, /^s tt/, /dien tich/, /^dt\b/, /^area$/, /^s\s*\(m2\)/]
},
{
  field: 'bedrooms',
  patterns: [
  /^so pn$/, /so phong ngu/, /^pn$/, /loai can/, /loai hinh/, /loai sp/,
  /loai san pham/, /^bedroom/, /^type$/, /^loai$/]
},
{ field: 'handover', patterns: [/ban giao/, /^hoan thien$/] },
{ field: 'status', patterns: [/tinh trang/, /^trang thai/, /^status$/, /^tt$/] },
{ field: 'fund', patterns: [/^quy$/, /loai quy/, /phan loai quy/, /^quy can$/, /^nguon hang$/] }];


/**
 * Tên cột giá rất đa dạng: "ĐƠN GIÁ", "TỔNG GIÁ", "GIÁ HTLS", "GIÁ TTS",
 * "TGT chưa VAT", "Tổng giá trị HĐMB"… nên bắt rộng theo tên rồi kiểm chứng
 * lại bằng dữ liệu để tránh nhận nhầm cột ghi chú.
 */
const PRICE_PATTERNS = [
/(^|[^a-z])gia([^a-z]|$)/, /^tgt/, /\btgt\b/, /thanh tien/, /\bvnd\b/, /\bvat\b/];

/** Giá căn hộ luôn là số lớn; dùng ngưỡng này để loại cột không phải giá. */
const MIN_PRICE_VALUE = 1_000_000;


function matchField(label: string): keyof ColumnMapping | null {
  const text = plain(label);
  if (!text) return null;
  // Tim tường là cột riêng, không phải diện tích chính.
  if (isTimTuong(label)) return null;
  for (const { field, patterns } of FIELD_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) return field;
  }
  return null;
}

/** Cột tim tường phải loại trước khi so với mẫu diện tích thông thủy. */
function isTimTuong(label: string): boolean {
  return /tim tuong/.test(plain(label));
}

function isPriceColumn(label: string): boolean {
  const text = plain(label);
  if (!text) return false;
  // Cột diện tích cũng chứa chữ "m2" nhưng không phải giá.
  if (/dien tich|^dt\b/.test(text)) return false;
  return PRICE_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Xác nhận một cột thật sự chứa giá: lấy mẫu vài chục dòng, đa số phải là số
 * đủ lớn. Nhờ vậy cột "Ghi chú giá" hay "Chính sách giá" không bị nhận nhầm.
 */
function looksNumeric(grid: Grid, column: number, fromRow: number): boolean {
  let filled = 0;
  let numeric = 0;

  for (let row = fromRow; row < Math.min(grid.length, fromRow + 40); row++) {
    const text = cellText(grid[row]?.[column]);
    if (!text) continue;
    filled += 1;
    const value = parseNumber(grid[row]?.[column]);
    if (value !== null && value >= MIN_PRICE_VALUE) numeric += 1;
  }

  if (!filled) return false;
  return numeric / filled >= 0.6;
}

/* ─────────────────────────────────────────────────────────────
   Tình trạng
   ───────────────────────────────────────────────────────────── */

const STATUS_RULES: Array<{value: UnitStatusValue;patterns: RegExp[];}> = [
{ value: 'Đã bán', patterns: [/^da ban$/, /^ban$/, /da ky hdmb/, /^sold$/, /hop dong/] },
{ value: 'Đã cọc', patterns: [/coc/, /^deposit/, /dat cho/] },
{ value: 'Đã lock', patterns: [/lock/, /^giu cho$/, /^booking$/, /^kho[aá]$/] },
{ value: 'Còn hàng', patterns: [/^con hang$/, /^available$/, /^trong$/, /^con$/] }];


/**
 * Cột Tình trạng của nhiều chủ đầu tư trộn lẫn hai khái niệm: trạng thái bán
 * ("Đã bán") và phân loại quỹ ("Độc quyền", "Quỹ chéo"). Giá trị thuộc nhóm
 * quỹ không phải trạng thái — căn vẫn còn hàng.
 */
const FUND_VALUES = [
/doc quyen/, /quy cheo/, /quy chung/, /^dq$/, /thu cap/, /so cap/];


export function isFundValue(value: Cell): boolean {
  const text = plain(cellText(value));
  return Boolean(text) && FUND_VALUES.some((pattern) => pattern.test(text));
}

/**
 * Ô trống là "Còn hàng" — trên file thật đây là giá trị chủ đạo (51/55 dòng).
 * Trả về null khi gặp giá trị lạ để importer báo cho người dùng biết.
 */
export function mapStatus(value: Cell): UnitStatusValue | null {
  const text = plain(cellText(value));
  if (!text) return 'Còn hàng';
  // Giá trị phân loại quỹ không phải trạng thái bán.
  if (isFundValue(value)) return 'Còn hàng';
  for (const { value: status, patterns } of STATUS_RULES) {
    if (patterns.some((pattern) => pattern.test(text))) return status;
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
   Dò dòng tiêu đề
   ───────────────────────────────────────────────────────────── */

/** Ghép tối đa 3 dòng liền nhau thành nhãn cột — tiêu đề thường xuống dòng. */
function joinHeader(grid: Grid, row: number, column: number, depth: number): string {
  const parts: string[] = [];
  for (let offset = 0; offset < depth; offset++) {
    const text = cellText(grid[row + offset]?.[column]);
    if (text && !parts.includes(text)) parts.push(text);
  }
  return parts.join(' ');
}

/**
 * Trong khối tiêu đề nhiều dòng, dòng có nhiều ô nhất là dòng tên cột; các dòng
 * phía trên là banner gộp ô (ví dụ "GIÁ RIÊNG NẾU CHỌN CHÍNH SÁCH…"). Tách hai
 * loại này để banner trở thành nhãn nhóm chứ không dính vào tên cột.
 */
function findLabelRow(grid: Grid, headerRow: number, depth: number): number {
  let best = headerRow;
  let bestCount = -1;
  for (let offset = 0; offset < depth; offset++) {
    const row = headerRow + offset;
    const count = (grid[row] ?? []).filter((cell) => cellText(cell)).length;
    if (count > bestCount) {
      bestCount = count;
      best = row;
    }
  }
  return best;
}

function scoreRow(grid: Grid, row: number, depth: number): number {
  const width = grid[row]?.length ?? 0;
  const seen = new Set<string>();
  let score = 0;
  for (let column = 0; column < width; column++) {
    const label = joinHeader(grid, row, column, depth);
    const field = matchField(label);
    if (field && !seen.has(field)) {
      seen.add(field);
      score += 2;
    } else if (isPriceColumn(label)) {
      score += 1;
    }
  }
  return score;
}

export function findHeaderRow(grid: Grid): {row: number;depth: number;} {
  let best = { row: 0, depth: 1, score: 0 };
  const limit = Math.min(grid.length, 20);

  for (let row = 0; row < limit; row++) {
    for (const depth of [1, 2, 3]) {
      const score = scoreRow(grid, row, depth);
      // Ưu tiên dòng sớm hơn và độ sâu nhỏ hơn khi điểm bằng nhau.
      if (score > best.score) best = { row, depth, score };
    }
  }
  return { row: best.row, depth: best.depth };
}

/* ─────────────────────────────────────────────────────────────
   Phân tích một sheet
   ───────────────────────────────────────────────────────────── */

export interface AnalyzeOptions {
  /** Ô gộp trong file gốc, chỉ số theo lưới đã truyền vào. */
  merges?: Array<{
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
  }>;
}

export function analyzeSheet(
grid: Grid,
sheetName: string,
options: AnalyzeOptions = {})
: SheetAnalysis {
  const warnings: string[] = [];
  const { row: headerRow, depth } = findHeaderRow(grid);
  const width = Math.max(...grid.slice(0, headerRow + 6).map((row) => row?.length ?? 0), 0);

  const labelRow = findLabelRow(grid, headerRow, depth);
  const labelDepth = depth - (labelRow - headerRow);
  const labels: string[] = [];
  for (let column = 0; column < width; column++) {
    labels.push(joinHeader(grid, labelRow, column, labelDepth));
  }

  const mapping: ColumnMapping = {};
  const priceFields: PriceField[] = [];
  const unknownColumns: string[] = [];

  labels.forEach((label, index) => {
    if (!label) return;
    const field = matchField(label);
    if (field && mapping[field] === undefined) {
      mapping[field] = index;
      return;
    }
    if (isPriceColumn(label)) {
      if (looksNumeric(grid, index, labelRow + labelDepth)) {
        priceFields.push({
          index,
          label,
          group: findGroupLabel(grid, headerRow, labelRow, index)
        });
      } else {
        unknownColumns.push(label);
      }
      return;
    }
    if (!field) unknownColumns.push(label);
  });

  if (mapping.code === undefined) warnings.push('Không tìm thấy cột Mã căn hộ.');
  if (mapping.area === undefined) warnings.push('Không tìm thấy cột Diện tích.');
  if (!priceFields.length) warnings.push('Không tìm thấy cột giá nào.');

  const units: ParsedUnit[] = [];
  const unknownStatuses = new Set<string>();
  const seenCodes = new Set<string>();
  let duplicates = 0;

  for (let row = labelRow + labelDepth; row < grid.length; row++) {
    const cells = grid[row];
    if (!cells) continue;

    const code = cellText(cells[mapping.code ?? -1]);
    // Bỏ dòng trống và dòng tiêu đề lặp lại giữa file.
    if (!code) continue;
    if (matchField(code)) continue;

    if (seenCodes.has(code)) {
      duplicates += 1;
      continue;
    }
    seenCodes.add(code);

    const rawStatus = cells[mapping.status ?? -1];
    const status = mapStatus(rawStatus);
    if (status === null) unknownStatuses.add(cellText(rawStatus));
    // Cột Tình trạng ghi tên quỹ thì giữ lại làm nhãn quỹ của căn.
    // Ưu tiên cột Quỹ riêng; không có thì lấy từ cột Tình trạng nếu nó ghi quỹ.
    const fundColumn = cellText(cells[mapping.fund ?? -1]);
    const fundLabel = fundColumn || (isFundValue(rawStatus) ? cellText(rawStatus) : '');

    const extras: Record<string, string> = {};
    labels.forEach((label, index) => {
      const isMapped =
      Object.values(mapping).includes(index) ||
      priceFields.some((field) => field.index === index);
      if (isMapped || !label) return;
      const text = cellText(cells[index]);
      if (text) extras[label] = text;
    });

    units.push({
      code,
      tower: cellText(cells[mapping.tower ?? -1]) || '—',
      floor: cellText(cells[mapping.floor ?? -1]),
      unit: cellText(cells[mapping.unit ?? -1]),
      area: parseNumber(cells[mapping.area ?? -1]),
      bedrooms: cellText(cells[mapping.bedrooms ?? -1]),
      handover: cellText(cells[mapping.handover ?? -1]),
      status: status ?? 'Còn hàng',
      fundLabel,
      prices: priceFields.map((field) => parseNumber(cells[field.index]) ?? 0),
      extras
    });
  }

  // ── Suy tòa / tầng / căn từ mã căn cho những dòng thiếu ──────────────
  const towerCodes = [
  ...new Set(
    units.
    map((item) => splitUnitCode(item.code).towerCode).
    filter(Boolean)
  )];


  let derivedUnits = 0;
  let derivedFloors = 0;
  let failedSplits = 0;

  units.forEach((item) => {
    const split = splitUnitCode(item.code, {
      floorHint: item.floor,
      towerCodes
    });

    if (split.method === 'failed') {
      if (!item.unit) failedSplits += 1;
      return;
    }

    const derived: Array<'tower' | 'floor' | 'unit'> = [];
    item.towerCode = split.towerCode;

    if (!item.unit && split.unit) {
      item.unit = split.unit;
      derived.push('unit');
      derivedUnits += 1;
    }
    if (!item.floor && split.floor) {
      item.floor = split.floor;
      derived.push('floor');
      derivedFloors += 1;
    }
    if ((!item.tower || item.tower === '—') && split.towerCode) {
      item.tower = split.towerCode;
      derived.push('tower');
    }
    if (derived.length) item.derived = derived;
  });

  if (derivedUnits) warnings.push(`Đã suy số căn từ mã căn cho ${derivedUnits} dòng.`);
  if (derivedFloors) warnings.push(`Đã suy số tầng từ mã căn cho ${derivedFloors} dòng.`);
  if (failedSplits) {
    warnings.push(
      `${failedSplits} mã căn không tách được thành tầng và căn — cần khai quy ước mã căn.`
    );
  }

  // ── Cảnh báo khi loại căn đổi giữa chừng trên cùng một trục ──────────
  // Loại căn là thuộc tính của TRỤC, nên tầng nào lệch thì gần như chắc chắn
  // là penthouse hoặc duplex và cần tách thành khối riêng.
  const byColumn = new Map<string, Map<string, string[]>>();
  units.forEach((item) => {
    if (!item.unit || !item.bedrooms) return;
    const key = `${item.tower}|${item.unit}`;
    const values = byColumn.get(key) ?? new Map<string, string[]>();
    values.set(item.bedrooms, [...(values.get(item.bedrooms) ?? []), item.floor]);
    byColumn.set(key, values);
  });

  byColumn.forEach((values, key) => {
    if (values.size < 2) return;
    const [tower, column] = key.split('|');
    // Nhóm nhỏ nhất là phần lệch — thường là các tầng trên cùng.
    const odd = [...values.entries()].sort((a, b) => a[1].length - b[1].length)[0];
    warnings.push(
      `Trục ${column} tòa ${tower}: loại căn đổi thành "${odd[0]}" ở tầng ${odd[1].join(', ')} — cân nhắc tách thành khối riêng.`
    );
  });

  if (unknownStatuses.size) {
    warnings.push(
      `Tình trạng chưa có trong danh mục ánh xạ: ${[...unknownStatuses].join(', ')} — tạm coi là Còn hàng.`
    );
  }
  if (duplicates) warnings.push(`${duplicates} dòng trùng mã căn đã bị bỏ qua.`);
  if (!units.length) warnings.push(`Sheet "${sheetName}" không có dòng dữ liệu nào đọc được.`);

  // ── Suy căn thông tầng / thông căn từ ô gộp trong file ───────────────
  //
  // Bảng hàng dạng danh sách không có cách nào ghi rằng một căn penthouse
  // chiếm hai tầng. Nhưng khi người lập bảng gộp ô ở cột Mã căn để biểu diễn
  // điều đó thì thông tin nằm trong metadata của file, và Sheets API trả về.
  const spanHints: SpanHint[] = [];
  const codeColumn = mapping.code;

  if (codeColumn !== undefined && options.merges?.length) {
    options.merges.forEach((merge) => {
      if (merge.startColumn > codeColumn || merge.endColumn < codeColumn) return;
      if (merge.startRow <= labelRow) return;

      const code = cellText(grid[merge.startRow]?.[codeColumn]);
      if (!code) return;

      const floorSpan = merge.endRow - merge.startRow + 1;
      const columnSpan = merge.endColumn - merge.startColumn + 1;
      if (floorSpan > 1 || columnSpan > 1) {
        spanHints.push({ code, floorSpan, columnSpan });
      }
    });
  }

  if (spanHints.length) {
    warnings.push(
      `Phát hiện ${spanHints.length} căn thông tầng hoặc thông căn từ ô gộp trong file.`
    );
  }

  return { headerRow, mapping, priceFields, units, unknownColumns, warnings, spanHints };
}

/**
 * Nhãn nhóm giá nằm ở dòng banner NGAY TRONG khối tiêu đề, phía trên dòng tên
 * cột. Ô gộp chỉ có giá trị ở cột đầu vùng gộp nên phải dò ngược sang trái.
 */
function findGroupLabel(
grid: Grid,
headerRow: number,
labelRow: number,
column: number)
: string {
  for (let row = labelRow - 1; row >= headerRow; row--) {
    for (let scan = column; scan >= 0; scan--) {
      const text = cellText(grid[row]?.[scan]);
      if (!text) continue;
      return isPriceColumn(text) ? 'Giá tiêu chuẩn' : text;
    }
  }
  return 'Giá tiêu chuẩn';
}

/* ─────────────────────────────────────────────────────────────
   Gộp nhiều sheet
   ───────────────────────────────────────────────────────────── */

export interface FundGroup {
  id: string;
  name: string;
  color: string;
  codes: string[];
}

export interface InventoryData {
  units: ParsedUnit[];
  priceFields: PriceField[];
  /** Cột giá người dùng chọn khi nhập file. */
  priceIndex: number;
  funds: FundGroup[];
  towers: string[];
  warnings: string[];
  sheetNames: string[];
  /** Căn thông tầng / thông căn suy từ ô gộp — dùng để tự gộp ô trên lưới. */
  spanHints: SpanHint[];
}

const FUND_COLORS = ['#ff0000', '#a77b00', '#2a55b8', '#0e9f6e', '#7b2d5e'];

/**
 * Gộp kết quả các sheet đã chọn thành một bộ dữ liệu.
 * Sheet loại "inventory" cung cấp căn; sheet "fund" chỉ đánh dấu căn thuộc quỹ.
 */
export function buildInventory(
sheets: Array<{name: string;kind: string;analysis: SheetAnalysis;}>,
priceIndex = 0)
: InventoryData {
  const inventorySheets = sheets.filter((sheet) => sheet.kind === 'inventory');
  const fundSheets = sheets.filter((sheet) => sheet.kind === 'fund');
  /**
   * Có sheet tòa thì diện tích, loại hình, hướng, view nằm ở template — sheet
   * quỹ căn không cần các cột đó, nên bỏ cảnh báo thiếu cho khỏi gây hiểu nhầm.
   */
  const hasTemplate = sheets.some((sheet) => sheet.kind === 'tower');
  const fromTemplate = /Không tìm thấy cột (Diện tích|Loại hình|Hướng|View)/;

  const units: ParsedUnit[] = [];
  const seen = new Set<string>();
  const warnings: string[] = [];

  inventorySheets.forEach((sheet) => {
    sheet.analysis.warnings.
    filter((warning) => !(hasTemplate && fromTemplate.test(warning))).
    forEach((warning) => warnings.push(`${sheet.name}: ${warning}`));
    sheet.analysis.units.forEach((unit) => {
      if (seen.has(unit.code)) return;
      seen.add(unit.code);
      units.push(unit);
    });
  });

  // Quỹ khai bằng cột trong sheet quỹ căn.
  const byLabel = new Map<string, string[]>();
  units.forEach((unit) => {
    if (!unit.fundLabel) return;
    byLabel.set(unit.fundLabel, [...(byLabel.get(unit.fundLabel) ?? []), unit.code]);
  });

  const columnFunds: FundGroup[] = [...byLabel.entries()].map(([name, codes], index) => ({
    id: `fund-col-${index}`,
    name,
    color: FUND_COLORS[index % FUND_COLORS.length],
    codes
  }));

  const sheetFunds: FundGroup[] = fundSheets.map((sheet, index) => {
    // Sheet đánh dấu quỹ chỉ cần mã căn — không cảnh báo thiếu cột dữ liệu.
    sheet.analysis.warnings.
    filter((warning) => !/Không tìm thấy cột|Đã suy số căn/.test(warning)).
    forEach((warning) => warnings.push(`${sheet.name}: ${warning}`));
    return {
      id: `fund-${index}`,
      name: sheet.name,
      color: FUND_COLORS[(columnFunds.length + index) % FUND_COLORS.length],
      codes: sheet.analysis.units.map((unit) => unit.code)
    };
  });

  const funds = [...columnFunds, ...sheetFunds];

  const towers = [...new Set(units.map((unit) => unit.tower))].filter(Boolean).sort();
  const spanHints = inventorySheets.flatMap((sheet) => sheet.analysis.spanHints);
  const priceFields = inventorySheets[0]?.analysis.priceFields ?? [];

  return {
    units,
    priceFields,
    priceIndex: Math.min(priceIndex, Math.max(priceFields.length - 1, 0)),
    funds,
    towers,
    warnings,
    sheetNames: sheets.map((sheet) => sheet.name),
    spanHints
  };
}

/* ─────────────────────────────────────────────────────────────
   Trục lưới và định dạng
   ───────────────────────────────────────────────────────────── */

export { compareLabels as compareLabel };

/**
 * Trục của lưới một tòa.
 *
 * Thang tầng và thang căn được sinh ĐẦY ĐỦ từ 1 tới giá trị lớn nhất quan sát
 * được, kèm các tầng đặc biệt (8A, 06A) đặt đúng vị trí. Nhờ vậy bảng hàng
 * hiện đủ lưới kể cả khi file chỉ liệt kê vài chục căn rải rác.
 */
export function axesOf(units: ParsedUnit[], tower: string) {
  const inTower = units.filter((unit) => unit.tower === tower);
  return {
    floors: buildLadder([...new Set(inTower.map((unit) => unit.floor).filter(Boolean))]),
    columns: buildUnitLadder([...new Set(inTower.map((unit) => unit.unit).filter(Boolean))])
  };
}

export function shortPrice(value: number): string {
  if (!value) return '—';
  if (value >= 1e9) return `${(value / 1e9).toFixed(2).replace('.', ',')} tỷ`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)} tr`;
  return value.toLocaleString('vi-VN');
}

export function fullPrice(value: number): string {
  return value ? `${value.toLocaleString('vi-VN')} ₫` : '—';
}

export function unitPrice(value: number, area: number | null): string {
  if (!value || !area) return '—';
  return `${(value / area / 1e6).toFixed(1).replace('.', ',')} tr/m²`;
}
