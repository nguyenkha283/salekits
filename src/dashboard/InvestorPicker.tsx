import React, { useEffect, useRef, useState } from 'react';
import {
  Building2Icon,
  CheckIcon,
  LoaderIcon,
  PlusIcon,
  SearchIcon,
  XIcon } from
'lucide-react';
import type { Investor } from '../types/investor';
import { CURRENT_USER, searchInvestors } from './dashboardData';
import { InvestorFormDialog } from './InvestorFormDialog';

interface InvestorPickerProps {
  /** Toàn bộ bản ghi hiện có. */
  investors: Investor[];
  /** Bản ghi đang chọn. */
  value?: Investor;
  onChange: (investor?: Investor) => void;
  /** Bản ghi mới tạo trong popup, để màn cha nạp vào danh sách chung. */
  onCreate: (investor: Investor) => void;
  invalid?: boolean;
}

/**
 * Ô chọn chủ đầu tư dùng ở màn Khởi tạo dự án — UC-CDT-01 và FR-CDT-01/02.
 *
 * Gõ tên thì gợi ý bản ghi đã có; không thấy thì tạo mới ngay tại đây, và popup
 * tạo mới tự dò trùng lần nữa. Bản ghi Ngừng sử dụng bị ẩn khỏi gợi ý theo
 * FR-CDT-15 — vẫn giữ cho dự án cũ, nhưng không cho chọn cho dự án mới.
 */
export function InvestorPicker({
  investors,
  value,
  onChange,
  onCreate,
  invalid = false
}: InvestorPickerProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Investor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const selectable = investors.filter((item) => item.status === 'Đang sử dụng');

  useEffect(() => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    const controller = new AbortController();
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchInvestors(trimmed, selectable, controller.signal).
      then((found) => {
        setResults(found.slice(0, 6));
        setIsSearching(false);
        setHighlight(-1);
      }).
      catch(() => {/* lệnh bị hủy vì người dùng gõ tiếp */});
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // selectable dựng lại mỗi lần render nên chỉ theo dõi mảng gốc
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, investors]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  function pick(investor: Investor) {
    onChange(investor);
    setKeyword('');
    setIsOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((current) => (current + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' && highlight >= 0) {
      event.preventDefault();
      pick(results[highlight]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-neutral-300 bg-white px-3 py-2.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f6efe6] text-xs font-bold text-[#6D3A18]">
          {value.logoUrl ?
          <img
            src={value.logoUrl}
            alt=""
            className="h-full w-full rounded-lg object-contain p-1" /> :


          value.code.slice(0, 2).toUpperCase()
          }
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-neutral-900">
            {value.name}
          </span>
          <span className="block truncate text-xs text-neutral-500">
            {value.code} ·{' '}
            {value.projectCount > 0 ?
            `${value.projectCount} dự án` :
            'Chưa gắn dự án'}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
          
          Đổi
        </button>
      </div>);

  }

  return (
    <div ref={boxRef} className="relative">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        value={keyword}
        onChange={(event) => {
          setKeyword(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Gõ tên chủ đầu tư để tìm"
        aria-label="Chọn chủ đầu tư"
        className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:ring-2 focus:ring-orange-100 ${invalid ? 'border-red-400 focus:border-red-500' : 'border-neutral-300 focus:border-[#6D3A18]'}`} />
      
      {isSearching &&
      <LoaderIcon className="absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
      }
      {keyword &&
      <button
        type="button"
        aria-label="Xóa từ khóa"
        onClick={() => setKeyword('')}
        className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
        
          <XIcon className="h-4 w-4" />
        </button>
      }

      {isOpen &&
      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
          {keyword.trim().length === 0 ?
   
        <p className="px-4 py-3 text-xs text-neutral-500">
              Gõ vài chữ trong tên doanh nghiệp. Không dấu hoặc bỏ tiền tố Công
              ty, CP đều tìm được.
            </p> :
        results.length > 0 ?

        <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((investor, index) =>
          <li key={investor.id}>
                  <button
              type="button"
              onMouseEnter={() => setHighlight(index)}
              onClick={() => pick(investor)}
              className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${index === highlight ? 'bg-orange-50' : 'hover:bg-neutral-50'}`}>
              
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f6efe6] text-xs font-bold text-[#6D3A18]">
                      {investor.code.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-neutral-900">
                        {investor.name}
                      </span>
                      <span className="block truncate text-xs text-neutral-500">
                        {investor.code} ·{' '}
                        {investor.projectCount > 0 ?
                  `${investor.projectCount} dự án` :
                  'Chưa gắn dự án'}
                      </span>
                    </span>
                    <CheckIcon className="h-4 w-4 shrink-0 text-transparent" />
                  </button>
                </li>
          )}
            </ul> :

        <p className="px-4 pt-3 text-sm text-neutral-600">
              Không có chủ đầu tư nào khớp{' '}
              <span className="font-semibold text-neutral-900">
                “{keyword.trim()}”
              </span>
              .
            </p>
        }

          <div className="border-t border-neutral-100 px-3 py-2">
            <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700">
            
              <PlusIcon className="h-4 w-4" />
              Thêm chủ đầu tư mới
            </button>
          </div>
        </div>
      }

      {isFormOpen &&
      <InvestorFormDialog
        initialName={keyword.trim()}
        existing={investors}
        currentUserId={CURRENT_USER.id}
        onClose={() => setIsFormOpen(false)}
        onSave={(investor) => {
          onCreate(investor);
          onChange(investor);
          setKeyword('');
          setIsFormOpen(false);
        }}
        onUseExisting={(investor) => {
          onChange(investor);
          setKeyword('');
          setIsFormOpen(false);
        }} />

      }
    </div>);

}
