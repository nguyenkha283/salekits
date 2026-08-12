/**
 * Quy tắc so khớp tên chủ đầu tư — đặc tả mục 3.2, và sinh mã / đường dẫn —
 * mục 3.4 và FR-CDT-04.
 *
 * Chất lượng của bộ so khớp này quyết định module có đạt mục đích chống trùng
 * hay không: gõ đúng tên doanh nghiệp mà không tìm ra thì người dùng sẽ tạo
 * thêm một bản ghi trùng.
 */

/** Tiền tố pháp nhân được bỏ khi so khớp ở mức 3. */
const LEGAL_PREFIXES = [
'cong ty co phan',
'cong ty tnhh mot thanh vien',
'cong ty tnhh',
'cong ty cp',
'cong ty',
'tong cong ty',
'tap doan',
'co phan',
'tnhh',
'cty',
'cp'];


/** Mức 2: bỏ dấu tiếng Việt, bỏ phân biệt hoa thường, chuẩn hóa khoảng trắng. */
export function normalizeName(value: string): string {
  return value.
  normalize('NFD').
  replace(/[\u0300-\u036f]/g, '').
  replace(/đ/g, 'd').
  replace(/Đ/g, 'D').
  toLowerCase().
  replace(/[^a-z0-9\s]/g, ' ').
  replace(/\s+/g, ' ').
  trim();
}

/** Mức 3: bỏ tiền tố pháp nhân ở đầu chuỗi đã chuẩn hóa. */
export function stripLegalPrefix(normalized: string): string {
  let result = normalized;
  let changed = true;
  // Lặp vì tên thật hay ghép nhiều tiền tố, ví dụ "Công ty CP Tập đoàn ABC".
  while (changed) {
    changed = false;
    for (const prefix of LEGAL_PREFIXES) {
      if (result === prefix) continue;
      if (result.startsWith(`${prefix} `)) {
        result = result.slice(prefix.length + 1);
        changed = true;
        break;
      }
    }
  }
  return result.trim();
}

export type MatchLevel = 1 | 2 | 3 | null;

/**
 * Trả về mức khớp thấp nhất tìm được, hoặc null nếu không khớp.
 * Ba mức áp dụng đồng thời, mức nhỏ hơn được coi là khớp sát hơn.
 */
export function matchInvestorName(name: string, keyword: string): MatchLevel {
  const rawKeyword = keyword.trim();
  if (!rawKeyword) return null;

  // Mức 1 — khớp chuỗi con, giữ nguyên dấu và hoa thường.
  if (name.includes(rawKeyword)) return 1;

  // Mức 2 — bỏ dấu, bỏ phân biệt hoa thường, chuẩn hóa khoảng trắng.
  const normalizedName = normalizeName(name);
  const normalizedKeyword = normalizeName(keyword);
  if (!normalizedKeyword) return null;
  if (normalizedName.includes(normalizedKeyword)) return 2;

  // Mức 3 — bỏ tiền tố pháp nhân ở cả hai vế rồi so lại.
  const strippedName = stripLegalPrefix(normalizedName);
  const strippedKeyword = stripLegalPrefix(normalizedKeyword);
  if (strippedKeyword && strippedName.includes(strippedKeyword)) return 3;

  // Vẫn ở mức 3: các từ của từ khóa xuất hiện đủ nhưng không liền nhau,
  // ví dụ gõ "cp vinhomes" cho bản ghi "Tập đoàn Đầu tư Vinhomes".
  const words = strippedKeyword.split(' ').filter(Boolean);
  if (words.length > 1 && words.every((word) => strippedName.includes(word))) {
    return 3;
  }

  return null;
}

/**
 * Sinh mã chủ đầu tư từ tên (mục 3.4).
 *
 * Giới hạn đã ghi nhận trong đặc tả: sinh mã từ tên chỉ bảo đảm mã không trùng,
 * không bảo đảm doanh nghiệp không bị tạo hai lần.
 */
export function suggestInvestorCode(name: string): string {
  const words = stripLegalPrefix(normalizeName(name)).split(' ').filter(Boolean);
  if (words.length === 0) return 'CDT';

  const joined = words.join('').toUpperCase();
  if (joined.length <= 12) return joined;

  // Tên dài thì viết tắt các từ đầu, giữ nguyên từ cuối cho dễ nhận ra.
  const initials = words.slice(0, -1).map((word) => word[0]).join('');
  return `${initials}${words[words.length - 1]}`.toUpperCase().slice(0, 12);
}

/** Thêm hậu tố số cho tới khi được mã chưa dùng. */
export function generateInvestorCode(name: string, taken: string[]): string {
  const base = suggestInvestorCode(name);
  const existing = new Set(taken.map((code) => code.toUpperCase()));
  if (!existing.has(base)) return base;
  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/**
 * Đường dẫn bỏ tiền tố pháp nhân cho ngắn và dễ đọc — "Công ty Cổ phần
 * Vinhomes" thành "vinhomes". Người dùng vẫn sửa lại được.
 */
export function suggestInvestorSlug(name: string): string {
  const slug = stripLegalPrefix(normalizeName(name)).
  split(' ').
  filter(Boolean).
  join('-');
  return slug || 'chu-dau-tu';
}

/** Đường dẫn duy nhất toàn hệ thống (FR-CDT-04). */
export function generateInvestorSlug(name: string, taken: string[]): string {
  const base = suggestInvestorSlug(name);
  const existing = new Set(taken);
  if (!existing.has(base)) return base;
  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
