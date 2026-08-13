import React from 'react';
import { FileTextIcon, ImageIcon } from 'lucide-react';

/**
 * Chỗ trống hiển thị khi một mục chưa có nội dung.
 *
 * Trước đây mỗi component có sẵn dữ liệu mẫu, nên dự án mới trông như đã đầy
 * nội dung và không ai biết còn thiếu gì. Khối này thay thế: giữ nguyên khung
 * bố cục, nói rõ chỗ này cần gì và lấy từ thư mục Drive nào.
 */
interface EmptySlotProps {
  /** 'image' cho ảnh, 'content' cho văn bản và tài liệu. */
  variant?: 'image' | 'content';
  /** Dòng chính. Bỏ trống thì lấy theo variant. */
  label?: string;
  /** Thư mục Drive chứa nội dung này, ví dụ "01. Tổng quan". */
  source?: string;
  /** Lớp bố cục do nơi gọi quyết định — chiều cao, tỉ lệ, bo góc. */
  className?: string;
  /** Ẩn chữ khi ô quá nhỏ, chỉ để lại biểu tượng. */
  compact?: boolean;
  /** Nút hành động đặt giữa khung, ngay dưới dòng chỉ thư mục Drive. */
  action?: React.ReactNode;
}

export function EmptySlot({
  variant = 'image',
  label,
  source,
  className = '',
  compact = false,
  action
}: EmptySlotProps) {
  const Icon = variant === 'image' ? ImageIcon : FileTextIcon;
  const text =
  label ?? (variant === 'image' ? 'Tải hình ảnh lên' : 'Tải nội dung lên');

  return (
    <div
      role="note"
      aria-label={text}
      className={`flex flex-col items-center justify-center gap-2 border border-dashed border-[#d8cab4] bg-[#faf6ef] text-center text-[#a08b6c] ${className}`}>
      
      <Icon className={compact ? 'h-5 w-5' : 'h-7 w-7'} aria-hidden="true" />
      {!compact &&
      <>
          <span className="px-3 text-[13px] font-semibold text-[#8a6a3f]">
            {text}
          </span>
          {source &&
        <span className="px-3 text-[11px] leading-snug">
              Đặt file vào thư mục{' '}
              <span className="font-mono text-[10.5px]">{source}</span> trên
              Drive rồi bấm Đồng bộ
            </span>
        }
          {action && <span className="mt-1.5">{action}</span>}
        </>
      }
    </div>);

}

/**
 * Chỗ trống cho một đoạn văn bản. Dùng khi khối chữ nằm giữa dòng chảy nội
 * dung, không phải một ô riêng.
 */
export function EmptyText({
  label = 'Tải nội dung lên',
  source
}: {label?: string;source?: string;}) {
  return (
    <p className="rounded-md border border-dashed border-[#d8cab4] bg-[#faf6ef] px-4 py-3 text-[13px] text-[#8a6a3f]">
      <span className="font-semibold">{label}</span>
      {source &&
      <span className="text-[#a08b6c]">
          {' '}— nội dung lấy từ thư mục{' '}
          <span className="font-mono text-[11px]">{source}</span> trên Drive
        </span>
      }
    </p>);

}
