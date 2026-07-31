import React, { useEffect, useRef } from 'react';

interface InlineBaseProps {
  editable?: boolean;
  onChange?: (value: string) => void;
  /** Báo cho CMS biết khối nào đang được nhập, để hiện thanh công cụ nổi. */
  onFocusBlock?: (element: HTMLElement | null) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  label?: string;
}

interface InlineRichTextProps extends InlineBaseProps {
  html: string;
}

/**
 * Khối văn bản có định dạng, sửa ngay trên trang.
 *
 * Nội dung chỉ được ghi vào DOM khi khối KHÔNG được focus — nếu ghi trong lúc
 * đang gõ thì con trỏ sẽ nhảy về đầu sau mỗi ký tự.
 */
export function InlineRichText({
  html,
  editable = false,
  onChange,
  onFocusBlock,
  className = '',
  style,
  placeholder = 'Nhập nội dung…',
  label
}: InlineRichTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.activeElement === node) return;
    if (node.innerHTML !== html) node.innerHTML = html || '';
  }, [html]);

  if (!editable) {
    return (
      <div
        className={className}
        style={style}
        dangerouslySetInnerHTML={{ __html: html }} />);


  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      data-placeholder={placeholder}
      data-cms-inline="rich"
      onFocus={() => onFocusBlock?.(ref.current)}
      onBlur={() => onFocusBlock?.(null)}
      onInput={(event) =>
      onChange?.((event.currentTarget as HTMLDivElement).innerHTML)
      }
      className={`cms-inline ${className}`}
      style={style} />);


}

interface InlineTextProps extends InlineBaseProps {
  value: string;
}

/** Một dòng chữ thuần, không định dạng — dùng cho tên dự án, slogan, số liệu. */
export function InlineText({
  value,
  editable = false,
  onChange,
  onFocusBlock,
  className = '',
  style,
  placeholder = '…',
  label
}: InlineTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (document.activeElement === node) return;
    if (node.textContent !== value) node.textContent = value || '';
  }, [value]);

  if (!editable) return <span className={className} style={style}>{value}</span>;

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      data-placeholder={placeholder}
      data-cms-inline="text"
      onFocus={() => onFocusBlock?.(ref.current)}
      onBlur={() => onFocusBlock?.(null)}
      onKeyDown={(event) => {
        // Một dòng: Enter kết thúc nhập thay vì xuống dòng.
        if (event.key === 'Enter') {
          event.preventDefault();
          (event.currentTarget as HTMLSpanElement).blur();
        }
      }}
      onInput={(event) =>
      onChange?.((event.currentTarget as HTMLSpanElement).textContent ?? '')
      }
      className={`cms-inline ${className}`}
      style={style} />);


}
