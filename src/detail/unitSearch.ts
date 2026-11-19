/**
 * Tra cứu quỹ căn — dùng chung cho form tìm kiếm ở tab Quỹ căn (trình duyệt)
 * và API /api/inventory-search mà trợ lý AI Bích Ngọc gọi (server). Một hàm lọc
 * duy nhất để khách tự tìm và hỏi Ngọc luôn ra cùng một kết quả.
 *
 * File này KHÔNG import gì ngoài kiểu dữ liệu, để chạy được cả hai phía.
 */
import type { InventoryData, ParsedUnit } from './inventoryParser';

/**
 * Bản công khai của một căn — chỉ gồm các cột hiển thị ở tab Quỹ căn. Không
 * mang theo cột phụ (extras) vì đó có thể là ghi chú nội bộ, tên khách giữ chỗ,
 * chiết khấu… (HANDOFF mesh-avatar mục 9.2).
 */
export interface PublicUnit {
  code: string;
  /** Loại hình: studio, 1PN… (cao tầng) hoặc liền kề, biệt thự… (thấp tầng). */
  propertyType: string;
  tower: string;
  floor: string;
  unit: string;
  direction: string;
  view: string;
  /** DT thông thủy (cao tầng). */
  area: number | null;
  /** DT tim tường (cao tầng). */
  wallArea: number | null;
  /** DT đất, DT xây dựng, loại lô, phân khu (thấp tầng). */
  landArea: number | null;
  buildArea: number | null;
  lotType: string;
  subdivision: string;
  handover: string;
  status: string;
  fund: string;
  /** Giá theo cột giá đã chọn khi nhập bảng hàng, đơn vị đồng. */
  price: number | null;
}

export interface InventorySnapshot {
  syncedAt: string;
  layout: 'cao-tang' | 'thap-tang';
  priceLabel: string;
  units: PublicUnit[];
}

/** Điều kiện tìm — mọi trường đều tùy chọn; chữ so khớp không dấu, chứa là đạt. */
export interface UnitQuery {
  code?: string;
  propertyType?: string;
  tower?: string;
  floor?: string;
  unit?: string;
  direction?: string;
  view?: string;
  lotType?: string;
  subdivision?: string;
  handover?: string;
  status?: string;
  fund?: string;
  areaMin?: number;
  areaMax?: number;
  wallAreaMin?: number;
  wallAreaMax?: number;
  landAreaMin?: number;
  landAreaMax?: number;
  buildAreaMin?: number;
  buildAreaMax?: number;
  /** Giá theo đồng. */
  priceMin?: number;
  priceMax?: number;
}

export const TEXT_FIELDS = [
'code', 'propertyType', 'tower', 'floor', 'unit', 'direction', 'view',
'lotType', 'subdivision', 'handover', 'status', 'fund'] as
const;

export const RANGE_FIELDS = [
['areaMin', 'areaMax', 'area'],
['wallAreaMin', 'wallAreaMax', 'wallArea'],
['landAreaMin', 'landAreaMax', 'landArea'],
['buildAreaMin', 'buildAreaMax', 'buildArea'],
['priceMin', 'priceMax', 'price']] as
const;

export function fold(value: string): string {
  return value.
  normalize('NFD').
  replace(/[̀-ͯ]/g, '').
  replace(/đ/gi, 'd').
  toLowerCase().
  replace(/\s+/g, ' ').
  trim();
}

function parseArea(value: string | undefined): number | null {
  if (!value) return null;
  const number = Number.parseFloat(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function extraByKeyword(unit: ParsedUnit, keyword: string): string {
  const key = Object.keys(unit.extras).find((name) => fold(name).includes(keyword));
  return key ? unit.extras[key] : '';
}

export function toPublicUnits(data: InventoryData): PublicUnit[] {
  return data.units.map((unit) => ({
    code: unit.code,
    propertyType: unit.bedrooms,
    tower: unit.tower,
    floor: unit.floor,
    unit: unit.unit,
    direction: extraByKeyword(unit, 'huong'),
    view: extraByKeyword(unit, 'view'),
    area: unit.area,
    wallArea: parseArea(extraByKeyword(unit, 'tim tuong')),
    landArea: unit.landArea,
    buildArea: unit.buildArea,
    lotType: unit.lotType,
    subdivision: unit.subdivision,
    handover: unit.handover,
    status: unit.status,
    fund: unit.fundLabel ?? '',
    price: unit.prices[data.priceIndex] ?? null
  }));
}

export function buildSnapshot(
data: InventoryData,
layout: 'cao-tang' | 'thap-tang',
syncedAt: string)
: InventorySnapshot {
  return {
    syncedAt,
    layout,
    priceLabel: data.priceFields[data.priceIndex]?.label ?? 'Giá',
    units: toPublicUnits(data)
  };
}

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const number = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : undefined;
}

/** Chuẩn hóa điều kiện nhận từ form hoặc từ query string / JSON của API. */
export function normalizeQuery(raw: Record<string, unknown>): UnitQuery {
  const query: UnitQuery = {};
  for (const key of TEXT_FIELDS) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim()) query[key] = value.trim();
  }
  for (const [minKey, maxKey] of RANGE_FIELDS) {
    const min = toNumber(raw[minKey]);
    const max = toNumber(raw[maxKey]);
    if (min !== undefined) query[minKey] = min;
    if (max !== undefined) query[maxKey] = max;
  }
  return query;
}

export function isEmptyQuery(query: UnitQuery): boolean {
  return Object.keys(query).length === 0;
}

export function matchesUnit(unit: PublicUnit, query: UnitQuery): boolean {
  for (const key of TEXT_FIELDS) {
    const wanted = query[key];
    if (!wanted) continue;
    const actual = fold(String(unit[key] ?? ''));
    // Nhiều lựa chọn ngăn bằng dấu phẩy hoặc "|" — khớp một trong số đó là đạt.
    const options = wanted.split(/[|,]/).map(fold).filter(Boolean);
    if (!options.some((option) => actual.includes(option))) return false;
  }
  for (const [minKey, maxKey, field] of RANGE_FIELDS) {
    const min = query[minKey];
    const max = query[maxKey];
    if (min === undefined && max === undefined) continue;
    const value = unit[field];
    if (value === null || value === undefined) return false;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
  }
  return true;
}

export function searchUnits(units: PublicUnit[], query: UnitQuery): PublicUnit[] {
  if (isEmptyQuery(query)) return units;
  return units.filter((unit) => matchesUnit(unit, query));
}
