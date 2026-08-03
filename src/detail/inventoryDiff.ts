import type { ParsedUnit } from './inventoryParser';

/**
 * So sánh bảng hàng cũ với bảng hàng mới để QLGD biết chủ đầu tư đã đổi gì
 * TRƯỚC khi quyết định ghi đè.
 *
 * Đây là bước bắt buộc trong luồng: hệ thống phát hiện thay đổi tự động,
 * nhưng việc áp dụng luôn do người dùng quyết định.
 */

export interface UnitChange {
  code: string;
  field: string;
  before: string;
  after: string;
}

export interface InventoryDiff {
  added: ParsedUnit[];
  removed: ParsedUnit[];
  changed: Array<{unit: ParsedUnit;changes: UnitChange[];}>;
  unchangedCount: number;
}

function priceOf(unit: ParsedUnit, index: number): number {
  return unit.prices[index] ?? 0;
}

/** Chỉ so những trường QLGD thực sự quan tâm khi bảng hàng đổi. */
function compareUnit(
before: ParsedUnit,
after: ParsedUnit,
priceIndex: number)
: UnitChange[] {
  const changes: UnitChange[] = [];

  if (before.status !== after.status) {
    changes.push({
      code: after.code,
      field: 'Tình trạng',
      before: before.status,
      after: after.status
    });
  }

  const priceBefore = priceOf(before, priceIndex);
  const priceAfter = priceOf(after, priceIndex);
  if (priceBefore !== priceAfter) {
    changes.push({
      code: after.code,
      field: 'Giá',
      before: priceBefore.toLocaleString('vi-VN'),
      after: priceAfter.toLocaleString('vi-VN')
    });
  }

  if (before.area !== after.area) {
    changes.push({
      code: after.code,
      field: 'Diện tích',
      before: String(before.area ?? '—'),
      after: String(after.area ?? '—')
    });
  }

  if (before.bedrooms !== after.bedrooms) {
    changes.push({
      code: after.code,
      field: 'Loại hình',
      before: before.bedrooms || '—',
      after: after.bedrooms || '—'
    });
  }

  return changes;
}

export function diffInventory(
before: ParsedUnit[],
after: ParsedUnit[],
priceIndex = 0)
: InventoryDiff {
  const beforeMap = new Map(before.map((unit) => [unit.code, unit]));
  const afterMap = new Map(after.map((unit) => [unit.code, unit]));

  const added = after.filter((unit) => !beforeMap.has(unit.code));
  const removed = before.filter((unit) => !afterMap.has(unit.code));

  const changed: InventoryDiff['changed'] = [];
  let unchangedCount = 0;

  after.forEach((unit) => {
    const previous = beforeMap.get(unit.code);
    if (!previous) return;
    const changes = compareUnit(previous, unit, priceIndex);
    if (changes.length) changed.push({ unit, changes });else
    unchangedCount += 1;
  });

  return { added, removed, changed, unchangedCount };
}

export function isEmptyDiff(diff: InventoryDiff): boolean {
  return !diff.added.length && !diff.removed.length && !diff.changed.length;
}

/** Tóm tắt một dòng để hiển thị ở thông báo. */
export function summarizeDiff(diff: InventoryDiff): string {
  const parts: string[] = [];
  if (diff.added.length) parts.push(`${diff.added.length} căn mới`);
  if (diff.removed.length) parts.push(`${diff.removed.length} căn bị gỡ`);
  if (diff.changed.length) parts.push(`${diff.changed.length} căn đổi thông tin`);
  return parts.length ? parts.join(' · ') : 'Không có thay đổi';
}
