import { normalizeName } from '../dashboard/investorMatching';

/**
 * Sinh mã dự án từ tên — FR-07.
 *
 * Lấy chữ cái đầu của từng từ có nghĩa, giữ nguyên cụm số ở cuối vì đó thường
 * là phân kỳ: "Vinhomes Ocean Park 3" thành "VOP3". Từ nối ngắn như "và", "the"
 * bị bỏ để mã không bị loãng.
 *
 * ⚠️ Quy tắc chống trùng mã dự án chưa được chốt (SRS phụ lục 7.8.3). Hàm này
 * chỉ đề xuất; người dùng sửa được trước khi xuất bản theo FR-08.
 */
const STOP_WORDS = new Set(['va', 'the', 'de', 'du', 'an', 'khu', 'do', 'thi']);

export function suggestProjectCode(name: string): string {
  const words = normalizeName(name).split(' ').filter(Boolean);
  if (words.length === 0) return '';

  const initials: string[] = [];
  const trailingNumbers: string[] = [];

  words.forEach((word, index) => {
    const isLast = index === words.length - 1;
    if (/^\d+$/.test(word)) {
      // Số ở cuối tên là phân kỳ, giữ nguyên; số ở giữa cũng lấy nguyên.
      trailingNumbers.push(word);
      return;
    }
    if (STOP_WORDS.has(word) && !isLast) return;
    initials.push(word[0]);
  });

  // Tên chỉ gồm từ nối thì không bỏ được từ nào, quay về danh sách gốc.
  const parts = initials.length > 0 ? initials : words.map((word) => word[0]);
  const code = `${parts.join('')}${trailingNumbers.join('')}`.toUpperCase();

  // Tên một từ thì viết tắt một chữ cái là vô nghĩa, lấy nguyên từ.
  if (parts.length === 1 && trailingNumbers.length === 0) {
    const single = words.find((word) => !/^\d+$/.test(word)) ?? words[0];
    return single.toUpperCase().slice(0, 8);
  }
  return code.slice(0, 10);
}
