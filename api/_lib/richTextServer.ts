import { JSDOM } from 'jsdom';

/**
 * Bản tương đương chạy trên Node.js của src/utils/richText.ts (file đó dùng
 * DOMParser của trình duyệt — chạy trên Node sẽ tự bỏ qua bước lọc). Dùng
 * jsdom để tái tạo môi trường DOM, giữ NGUYÊN logic lọc thẻ giống hệt bản
 * frontend để 2 phía luôn nhất quán.
 *
 * (Không dùng gói `sanitize-html` vì 1 dependency con của nó — htmlparser2 —
 * publish dưới dạng ESM thuần, gây lỗi ERR_REQUIRE_ESM khi chạy trong môi
 * trường Vercel Serverless Function.)
 */

const ALLOWED_TAGS = new Set([
'B',
'BR',
'DIV',
'EM',
'FONT',
'I',
'LI',
'OL',
'P',
'SPAN',
'STRONG',
'SUB',
'SUP',
'U',
'UL']
);

const BLOCKED_TAGS = new Set(['IFRAME', 'OBJECT', 'SCRIPT', 'STYLE']);

export function sanitizeRichTextServer(html: string): string {
  const dom = new JSDOM('');
  const documentFragment = new dom.window.DOMParser().parseFromString(
    html,
    'text/html'
  );
  sanitizeChildren(documentFragment.body, dom.window);
  return documentFragment.body.innerHTML;
}

function sanitizeChildren(element: Element, windowRef: typeof globalThis): void {
  Array.from(element.children).forEach((child) => {
    if (BLOCKED_TAGS.has(child.tagName)) {
      child.remove();
      return;
    }

    if (!ALLOWED_TAGS.has(child.tagName)) {
      sanitizeChildren(child, windowRef);
      while (child.firstChild) element.insertBefore(child.firstChild, child);
      child.remove();
      return;
    }

    const isHtmlElement = child instanceof (windowRef as any).HTMLElement;
    const color =
    child.getAttribute('color') ?? (
    isHtmlElement ? (child as HTMLElement).style.color : '');
    const textAlign = isHtmlElement ? (child as HTMLElement).style.textAlign : '';

    Array.from(child.attributes).forEach((attribute) => {
      if (attribute.name !== 'style') child.removeAttribute(attribute.name);
    });

    if (isHtmlElement) {
      const htmlChild = child as HTMLElement;
      htmlChild.removeAttribute('style');
      if (color) htmlChild.style.color = color;
      if (textAlign) htmlChild.style.textAlign = textAlign;
    }

    sanitizeChildren(child, windowRef);
  });
}
