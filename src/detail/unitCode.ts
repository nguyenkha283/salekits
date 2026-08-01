/**
 * Tách mã căn thành tòa / tầng / căn, và dựng thang tầng đầy đủ.
 *
 * Thực tế mã căn không có một quy ước duy nhất — ngay trong cùng một file đã
 * gặp `A1-22.07`, `A4-06A-06A` và `A4-28-6A`. Vì vậy toàn bộ logic ở đây dò
 * theo mẫu chứ không giả định một định dạng cố định.
 */

/** Một nhãn tầng hoặc căn: giữ nguyên cách viết, kèm khóa sắp xếp. */
export interface LabelParts {
  /** Nguyên văn trong file, ví dụ "06A". */
  raw: string;
  /** Phần số, ví dụ 6. */
  number: number;
  /** Hậu tố chữ, ví dụ "A". Rỗng nghĩa là tầng thường. */
  suffix: string;
}

export function parseLabel(value: string): LabelParts | null {
  const match = value.trim().match(/^(\d+)\s*([A-Za-z]*)$/);
  if (!match) return null;
  return {
    raw: value.trim(),
    number: Number(match[1]),
    suffix: match[2].toUpperCase()
  };
}

/**
 * Thứ tự: theo số trước, rồi tầng thường đứng trước tầng có hậu tố.
 * Nhờ vậy 8 → 8A → 9, và 12 → 12A → 13.
 */
export function labelOrder(value: string): [number, number, string] {
  const parts = parseLabel(value);
  if (!parts) return [Number.MAX_SAFE_INTEGER, 0, value];
  return [parts.number, parts.suffix ? 1 : 0, parts.suffix];
}

export function compareLabels(a: string, b: string): number {
  const [na, sa, ta] = labelOrder(a);
  const [nb, sb, tb] = labelOrder(b);
  return na - nb || sa - sb || ta.localeCompare(tb);
}

/* ─────────────────────────────────────────────────────────────
   Tách mã căn
   ───────────────────────────────────────────────────────────── */

export interface CodeParts {
  towerCode: string;
  floor: string;
  unit: string;
  /** Cách tách đã dùng — hiển thị để người dùng kiểm chứng. */
  method: 'separated' | 'by-floor-hint' | 'fixed-width' | 'failed';
}

/**
 * Tách mã có dấu phân cách: `A1-22.07`, `A4-06A-06A`, `A3-8A.04`.
 * Chấp nhận mọi tổ hợp của `-`, `.`, `_`, `/` và khoảng trắng.
 */
function splitSeparated(code: string): CodeParts | null {
  const parts = code.trim().split(/[-._/\s]+/).filter(Boolean);
  if (parts.length < 3) return null;

  // Phần đầu là tòa; hai phần cuối là tầng và căn.
  const towerCode = parts.slice(0, parts.length - 2).join('-');
  const floor = parts[parts.length - 2];
  const unit = parts[parts.length - 1];

  if (!parseLabel(floor) || !parseLabel(unit)) return null;
  return { towerCode, floor, unit, method: 'separated' };
}

/**
 * Mã dính liền như `A12207`: dùng cột Tầng làm mốc để cắt.
 *
 * Đây là cách đáng tin nhất vì nó dựa trên dữ liệu có thật trong file thay vì
 * đoán độ rộng. `A12207` + tầng `22` → tòa `A1`, căn `07`.
 */
function splitByFloorHint(code: string, floorHint: string): CodeParts | null {
  const hint = floorHint.trim();
  if (!hint) return null;

  const text = code.trim();
  // Tầng có thể được viết đệm số 0 trong mã: tầng "8" → "08".
  const variants = new Set([hint, hint.padStart(2, '0'), hint.replace(/^0+/, '')]);

  for (const variant of variants) {
    if (!variant) continue;
    const at = text.lastIndexOf(variant);
    if (at <= 0) continue;

    const towerCode = text.slice(0, at).replace(/[-._/\s]+$/, '');
    const unit = text.slice(at + variant.length).replace(/^[-._/\s]+/, '');
    if (!towerCode || !unit || !parseLabel(unit)) continue;

    return { towerCode, floor: hint, unit, method: 'by-floor-hint' };
  }
  return null;
}

/**
 * Mã dính liền, không có cột Tầng: cắt theo độ rộng khai báo.
 * Mặc định 2 chữ số cho tầng và 2 cho căn — quy ước phổ biến nhất.
 */
function splitFixedWidth(
code: string,
floorWidth: number,
unitWidth: number,
towerCodes: string[])
: CodeParts | null {
  const text = code.trim();

  // Ký hiệu tòa thường chứa số (A1, A4, CT2), nên phải cắt bỏ trước khi đếm
  // chữ số — nếu không "A12207" sẽ bị hiểu thành tầng 122.
  // Thử ký hiệu dài trước để "A12" không bị "A1" chiếm mất.
  const known = [...towerCodes].sort((a, b) => b.length - a.length);
  let towerCode = '';
  let rest = text;

  for (const candidate of known) {
    if (!candidate) continue;
    if (text.toUpperCase().startsWith(candidate.toUpperCase())) {
      towerCode = text.slice(0, candidate.length);
      rest = text.slice(candidate.length).replace(/^[-._/\s]+/, '');
      break;
    }
  }

  if (!towerCode) {
    // Không biết danh sách tòa: lấy phần chữ ở đầu làm ký hiệu. Chỉ đúng khi
    // ký hiệu tòa không chứa số.
    const prefix = text.match(/^([A-Za-z]+)[-._/\s]*/);
    if (!prefix) return null;
    towerCode = prefix[1];
    rest = text.slice(prefix[0].length);
  }

  const tail = rest.match(/^(\d+[A-Za-z]?)$/)?.[1];
  if (!tail || tail.length < floorWidth + unitWidth) return null;

  const floor = tail.slice(0, tail.length - unitWidth);
  const unit = tail.slice(tail.length - unitWidth);

  if (!parseLabel(floor) || !parseLabel(unit)) return null;
  return { towerCode, floor, unit, method: 'fixed-width' };
}

export interface CodeSplitOptions {
  /** Giá trị cột Tầng của chính dòng đó, nếu file có. */
  floorHint?: string;
  floorWidth?: number;
  unitWidth?: number;
  /** Ký hiệu tòa đã biết, giúp cắt đúng mã dính liền như "A12207". */
  towerCodes?: string[];
}

export function splitUnitCode(code: string, options: CodeSplitOptions = {}): CodeParts {
  const {
    floorHint = '',
    floorWidth = 2,
    unitWidth = 2,
    towerCodes = []
  } = options;

  return (
    splitSeparated(code) ??
    splitByFloorHint(code, floorHint) ??
    splitFixedWidth(code, floorWidth, unitWidth, towerCodes) ?? {
      towerCode: '',
      floor: floorHint,
      unit: '',
      method: 'failed'
    });

}

/* ─────────────────────────────────────────────────────────────
   Thang tầng và thang căn
   ───────────────────────────────────────────────────────────── */

/**
 * Sinh thang tầng đầy đủ từ 1 tới tầng cao nhất, giữ nguyên các tầng đặc biệt
 * quan sát được ở đúng vị trí của chúng.
 *
 * Ví dụ thấy {8, 8A, 12A, 22} thì sinh ra
 * 1, 2, … 8, 8A, … 12, 12A, 13, … 22.
 *
 * Tầng đặc biệt KHÔNG được suy diễn thêm: hệ thống chỉ giữ những tầng thật sự
 * xuất hiện trong file, vì không có cách nào biết tòa nhà bỏ tầng 4 hay tầng 13.
 */
export function buildLadder(observed: string[]): string[] {
  const parts = observed.
  map(parseLabel).
  filter((item): item is LabelParts => Boolean(item));

  if (!parts.length) return [...observed];

  const max = Math.max(...parts.map((item) => item.number));
  const specialsByNumber = new Map<number, string[]>();
  const plainNumbers = new Set<number>();

  parts.forEach((item) => {
    if (item.suffix) {
      specialsByNumber.set(item.number, [
      ...(specialsByNumber.get(item.number) ?? []),
      item.raw]
      );
    } else {
      plainNumbers.add(item.number);
    }
  });

  const ladder: string[] = [];
  for (let number = 1; number <= max; number++) {
    // Giữ đúng cách viết trong file, ví dụ "08" thay vì "8".
    const original = parts.find((item) => !item.suffix && item.number === number);
    ladder.push(original?.raw ?? String(number));

    const specials = specialsByNumber.get(number);
    if (specials) {
      [...new Set(specials)].sort().forEach((value) => ladder.push(value));
    }
  }

  // Tầng đặc biệt vượt quá tầng cao nhất (hiếm) vẫn phải xuất hiện.
  specialsByNumber.forEach((values, number) => {
    if (number > max) values.forEach((value) => ladder.push(value));
  });

  return ladder;
}

/**
 * Thang căn: khác thang tầng ở chỗ số căn mỗi tầng thường liên tục từ 01.
 * Vẫn giữ nguyên căn đặc biệt như 6A, 06A.
 */
export function buildUnitLadder(observed: string[]): string[] {
  const ladder = buildLadder(observed);
  // Số căn thường viết đệm 0 cho đủ hai chữ số.
  const width = Math.max(
    2,
    ...observed.map((value) => parseLabel(value)?.raw.replace(/\D/g, '').length ?? 0)
  );
  // Chuẩn hóa độ rộng rồi khử trùng: "6A" và "06A" là cùng một căn.
  const normalized = ladder.map((value) => {
    const parts = parseLabel(value);
    if (!parts) return value;
    return `${String(parts.number).padStart(width, '0')}${parts.suffix}`;
  });
  return [...new Set(normalized)];
}

/* ─────────────────────────────────────────────────────────────
   Ánh xạ tên tòa
   ───────────────────────────────────────────────────────────── */

/**
 * Nối tên tòa trong cột dữ liệu ("ALUMI 1") với ký hiệu trong mã căn ("A1").
 * Trả về map ký hiệu → tên hiển thị.
 */
export function mapTowerCodes(
rows: Array<{towerName: string;towerCode: string;}>)
: Map<string, string> {
  const map = new Map<string, string>();
  rows.forEach(({ towerName, towerCode }) => {
    if (!towerCode) return;
    const name = towerName.trim();
    if (name && !map.has(towerCode)) map.set(towerCode, name);
  });
  return map;
}
