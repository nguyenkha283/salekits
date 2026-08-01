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
}

export interface SheetAnalysis {
  headerRow: number;
  mapping: ColumnMapping;
  priceFields: PriceField[];
  units: ParsedUnit[];
  /** Nhãn cột không nhận diện được, hiển thị để người dùng biết bị bỏ qua. */
  unknownColumns: string[];
  warnings: string[];
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
{ field: 'code', patterns: [/^ma can ho$/, /^ma can$/, /ma can ho/, /^ma sp$/, /ma san pham/] },
{ field: 'tower', patterns: [/^toa$/, /truc.*toa/, /toa.*truc/, /^toa nha$/, /^block$/, /^phan khu$/] },
{ field: 'floor', patterns: [/^tang$/, /^so tang$/, /^floor$/] },
{ field: 'unit', patterns: [/^can so$/, /^so can$/, /^can$/, /^truc$/, /^truc can$/, /^ma so can$/] },
{ field: 'area', patterns: [/dien tich thong thuy/, /^dtt+t?$/, /^dt tt$/, /dien tich/, /^dt$/, /^area$/] },
{ field: 'bedrooms', patterns: [/^so pn$/, /so phong ngu/, /^pn$/, /loai can/, /^bedroom/] },
{ field: 'handover', patterns: [/goi ban giao/, /tieu chuan ban giao/, /^ban giao$/] },
{ field: 'status', patterns: [/tinh trang/, /^trang thai$/, /^status$/] }];


const PRICE_PATTERNS = [
/tong gia tri/, /^tgt/, /gia ban/, /^gia$/, /don gia/, /thanh tien/, /vnd/, /gia tri hdmb/];


function matchField(label: string): keyof ColumnMapping | null {
  const text = plain(label);
  if (!text) return null;
  for (const { field, patterns } of FIELD_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) return field;
  }
  return null;
}

function isPriceColumn(label: string): boolean {
  const text = plain(label);
  if (!text) return false;
  return PRICE_PATTERNS.some((pattern) => pattern.test(text));
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
 * Ô trống là "Còn hàng" — trên file thật đây là giá trị chủ đạo (51/55 dòng).
 * Trả về null khi gặp giá trị lạ để importer báo cho người dùng biết.
 */
export function mapStatus(value: Cell): UnitStatusValue | null {
  const text = plain(cellText(value));
  if (!text) return 'Còn hàng';
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

export function analyzeSheet(grid: Grid, sheetName: string): SheetAnalysis {
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
      priceFields.push({ index, label, group: findGroupLabel(grid, headerRow, labelRow, index) });
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

  if (unknownStatuses.size) {
    warnings.push(
      `Tình trạng chưa có trong danh mục ánh xạ: ${[...unknownStatuses].join(', ')} — tạm coi là Còn hàng.`
    );
  }
  if (duplicates) warnings.push(`${duplicates} dòng trùng mã căn đã bị bỏ qua.`);
  if (!units.length) warnings.push(`Sheet "${sheetName}" không có dòng dữ liệu nào đọc được.`);

  return { headerRow, mapping, priceFields, units, unknownColumns, warnings };
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

  const units: ParsedUnit[] = [];
  const seen = new Set<string>();
  const warnings: string[] = [];

  inventorySheets.forEach((sheet) => {
    sheet.analysis.warnings.forEach((warning) => warnings.push(`${sheet.name}: ${warning}`));
    sheet.analysis.units.forEach((unit) => {
      if (seen.has(unit.code)) return;
      seen.add(unit.code);
      units.push(unit);
    });
  });

  const funds: FundGroup[] = fundSheets.map((sheet, index) => {
    sheet.analysis.warnings.forEach((warning) => warnings.push(`${sheet.name}: ${warning}`));
    return {
      id: `fund-${index}`,
      name: sheet.name,
      color: FUND_COLORS[index % FUND_COLORS.length],
      codes: sheet.analysis.units.map((unit) => unit.code)
    };
  });

  const towers = [...new Set(units.map((unit) => unit.tower))].filter(Boolean).sort();
  const priceFields = inventorySheets[0]?.analysis.priceFields ?? [];

  return {
    units,
    priceFields,
    priceIndex: Math.min(priceIndex, Math.max(priceFields.length - 1, 0)),
    funds,
    towers,
    warnings,
    sheetNames: sheets.map((sheet) => sheet.name)
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
