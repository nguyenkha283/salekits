import sanitizeHtml from 'sanitize-html';

/**
 * Bản tương đương chạy trên Node.js của src/utils/richText.ts (file đó dùng
 * DOMParser — chỉ chạy được trên trình duyệt, tự bỏ qua bước lọc nếu chạy ở
 * backend). Giữ đúng whitelist thẻ để 2 bên nhất quán.
 */
export function sanitizeRichTextServer(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
    'b',
    'br',
    'div',
    'em',
    'font',
    'i',
    'li',
    'ol',
    'p',
    'span',
    'strong',
    'sub',
    'sup',
    'u',
    'ul'],

    allowedAttributes: {
      '*': ['style']
    },
    allowedStyles: {
      '*': {
        color: [/^.*$/],
        'text-align': [/^.*$/]
      }
    },
    disallowedTagsMode: 'discard'
  });
}
