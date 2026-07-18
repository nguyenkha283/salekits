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

export function sanitizeRichText(html: string): string {
  if (typeof window === 'undefined') return html;

  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  sanitizeChildren(documentFragment.body);
  return documentFragment.body.innerHTML;
}

function sanitizeChildren(element: Element): void {
  Array.from(element.children).forEach((child) => {
    if (BLOCKED_TAGS.has(child.tagName)) {
      child.remove();
      return;
    }

    if (!ALLOWED_TAGS.has(child.tagName)) {
      sanitizeChildren(child);
      while (child.firstChild) element.insertBefore(child.firstChild, child);
      child.remove();
      return;
    }

    const color =
    child.getAttribute('color') ?? (
    child instanceof HTMLElement ? child.style.color : '');
    const textAlign = child instanceof HTMLElement ? child.style.textAlign : '';

    Array.from(child.attributes).forEach((attribute) => {
      if (attribute.name !== 'style') child.removeAttribute(attribute.name);
    });

    if (child instanceof HTMLElement) {
      child.removeAttribute('style');
      if (color) child.style.color = color;
      if (textAlign) child.style.textAlign = textAlign;
    }

    sanitizeChildren(child);
  });
}