import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangleIcon,
  ExternalLinkIcon,
  LoaderIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon } from
'lucide-react';
import type { Investor } from '../types/investor';
import { CURRENT_USER, searchInvestors } from './dashboardData';
import { matchInvestorName } from './investorMatching';
import { InvestorFormDialog } from './InvestorFormDialog';

interface InvestorsSectionProps {
  investors: Investor[];
  onChange: (investors: Investor[]) => void;
}

/** Logo trống thì dùng chữ cái đầu để danh sách không bị lỗ hổng thị giác. */
function LogoBadge({
  investor,
  size = 'md'
}: {investor: Investor;size?: 'sm' | 'md';}) {
  const box = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-12 w-12 text-sm';
  if (investor.logoUrl) {
    return (
      <img
        src={investor.logoUrl}
        alt={`Logo ${investor.name}`}
        className={`${box} shrink-0 rounded-lg border border-neutral-200 bg-white object-contain p-1`} />);


  }
  const initials = investor.code.slice(0, 2).toUpperCase();
  return (
    <span
      className={`${box} grid shrink-0 place-items-center rounded-lg bg-[#f6efe6] font-bold text-[#6D3A18]`}
      aria-hidden="true">
      
      {initials}
    </span>);

}

export function InvestorsSection({ investors, onChange }: InvestorsSectionProps) {
  const [keyword, setKeyword] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [suggestions, setSuggestions] = useState<Investor[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [editing, setEditing] = useState<Investor | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Investor | undefined>();
  const searchBoxRef = useRef<HTMLDivElement>(null);

  /**
   * Gợi ý gọi qua hàm bất đồng bộ có debounce và hủy lệnh cũ, nên khi nối vào
   * endpoint thật chỉ cần thay thân hàm searchInvestors.
   */
  useEffect(() => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }
    const controller = new AbortController();
    setIsSuggesting(true);
    const timer = setTimeout(() => {
      searchInvestors(trimmed, investors, controller.signal).
      then((results) => {
        setSuggestions(results.slice(0, 6));
        setIsSuggesting(false);
        setHighlight(-1);
      }).
      catch(() => {/* lệnh bị hủy vì người dùng gõ tiếp */});
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [keyword, investors]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setIsSuggestionOpen(false);
      }
    }
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  /**
   * Danh sách lọc ngay tại chỗ bằng đúng bộ quy tắc của gợi ý, nên bảng không
   * bị trống trong lúc chờ lệnh gợi ý trả về.
   */
  const visible = useMemo(() => {
    const trimmed = keyword.trim();
    return investors.filter((investor) => {
      if (onlyMine && investor.createdBy !== CURRENT_USER.id) return false;
      if (!trimmed) return true;
      return matchInvestorName(investor.name, trimmed) !== null;
    });
  }, [investors, onlyMine, keyword]);

  const mineCount = investors.filter(
    (investor) => investor.createdBy === CURRENT_USER.id
  ).length;

  function openCreate() {
    setEditing(undefined);
    setIsFormOpen(true);
  }

  function openEdit(investor: Investor) {
    setEditing(investor);
    setIsFormOpen(true);
  }

  function handleSave(saved: Investor) {
    const exists = investors.some((investor) => investor.id === saved.id);
    onChange(
      exists ?
      investors.map((investor) => investor.id === saved.id ? saved : investor) :
      [saved, ...investors]
    );
    setIsFormOpen(false);
    setEditing(undefined);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    onChange(investors.filter((investor) => investor.id !== pendingDelete.id));
    setPendingDelete(undefined);
  }

  function pickSuggestion(investor: Investor) {
    setKeyword(investor.name);
    setIsSuggestionOpen(false);
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isSuggestionOpen || suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((current) => (current + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight(
        (current) => (current - 1 + suggestions.length) % suggestions.length
      );
    } else if (event.key === 'Enter' && highlight >= 0) {
      event.preventDefault();
      pickSuggestion(suggestions[highlight]);
    } else if (event.key === 'Escape') {
      setIsSuggestionOpen(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">
            Danh sách chủ đầu tư
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Bản ghi dùng chung cho mọi dự án. Tìm trước khi thêm mới để tránh tạo
            trùng một doanh nghiệp.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600">
          
          <PlusIcon className="h-5 w-5" />
          Thêm mới
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div ref={searchBoxRef} className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setIsSuggestionOpen(true);
            }}
            onFocus={() => setIsSuggestionOpen(true)}
            onKeyDown={onSearchKeyDown}
            placeholder="Tìm theo tên chủ đầu tư — gõ không dấu hoặc bỏ tiền tố Công ty, CP đều ra"
            aria-label="Tìm chủ đầu tư"
            className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100" />
          
          {isSuggesting &&
          <LoaderIcon className="absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
          }
          {keyword &&
          <button
            type="button"
            aria-label="Xóa từ khóa"
            onClick={() => {
              setKeyword('');
              setIsSuggestionOpen(false);
            }}
            className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
            
              <XIcon className="h-4 w-4" />
            </button>
          }

          {isSuggestionOpen && keyword.trim().length > 0 &&
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
              {suggestions.length > 0 ?
       
            <ul className="max-h-72 overflow-y-auto py-1">
                  {suggestions.map((investor, index) =>
              <li key={investor.id}>
                      <button
                  type="button"
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => pickSuggestion(investor)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${index === highlight ? 'bg-orange-50' : 'hover:bg-neutral-50'}`}>
                  
                        <LogoBadge investor={investor} size="sm" />
                        <span className="min-w-0">
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
                      </button>
                    </li>
              )}
                </ul> :

            <div className="px-4 py-3.5">
                  <p className="text-sm text-neutral-600">
                    Không có chủ đầu tư nào khớp{' '}
                    <span className="font-semibold text-neutral-900">
                      “{keyword.trim()}”
                    </span>
                    .
                  </p>
                  <button
                type="button"
                onClick={() => {
                  setIsSuggestionOpen(false);
                  setEditing(undefined);
                  setIsFormOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                
                    <PlusIcon className="h-4 w-4" />
                    Thêm mới chủ đầu tư này
                  </button>
                </div>
            }
            </div>
          }
        </div>

        <label className="inline-flex shrink-0 cursor-pointer select-none items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(event) => setOnlyMine(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-400" />
          
          CĐT do tôi tạo
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-600">
            {mineCount}
          </span>
        </label>
      </div>

      {/* Danh sách */}
      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="hidden grid-cols-[88px_minmax(220px,1.1fr)_2fr_150px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-neutral-500 lg:grid">
          <span>Logo</span>
          <span>Tên chủ đầu tư</span>
          <span>Mô tả</span>
          <span className="text-right">Hành động</span>
        </div>

        {visible.length === 0 ?
        <div className="px-5 py-14 text-center">
            <p className="text-sm font-semibold text-neutral-900">
              Chưa có chủ đầu tư nào ở đây
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">
              {onlyMine ?
            'Bỏ chọn “CĐT do tôi tạo” để xem toàn bộ danh sách dùng chung.' :
            'Thử một từ khóa ngắn hơn, hoặc thêm mới chủ đầu tư.'}
            </p>
          </div> :

        <ul className="divide-y divide-neutral-100">
            {visible.map((investor) => {
            const isMine = investor.createdBy === CURRENT_USER.id;
            return (
              <li
                key={investor.id}
                className="grid grid-cols-1 gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/70 lg:grid-cols-[88px_minmax(220px,1.1fr)_2fr_150px] lg:items-center">
                
                  <div className="flex items-center gap-3">
                    <LogoBadge investor={investor} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-neutral-900">
                      {investor.name}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-700">
                        {investor.code}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {investor.projectCount > 0 ?
                      `${investor.projectCount} dự án` :
                      'Chưa gắn dự án'}
                      </span>
                      {isMine &&
                    <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-semibold text-orange-700">
                          Tôi tạo
                        </span>
                    }
                      {investor.status === 'Ngừng sử dụng' &&
                    <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-700">
                          Ngừng sử dụng
                        </span>
                    }
                    </p>
                  </div>

                  <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">
                    {investor.description}
                  </p>

                  <div className="flex items-center gap-1.5 lg:justify-end">
                    <a
                    href={`/chu-dau-tu/${investor.slug}`}
                    onClick={(event) => event.preventDefault()}
                    title="Xem trang chủ đầu tư"
                    className="grid h-9 w-9 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900">
                    
                      <ExternalLinkIcon className="h-4 w-4" />
                      <span className="sr-only">Xem trang công khai</span>
                    </a>
                    {isMine &&
                  <>
                        <button
                      type="button"
                      onClick={() => openEdit(investor)}
                      title="Sửa"
                      className="grid h-9 w-9 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600">
                      
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Sửa {investor.name}</span>
                        </button>
                        <button
                      type="button"
                      onClick={() => setPendingDelete(investor)}
                      title="Xóa"
                      className="grid h-9 w-9 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                      
                          <Trash2Icon className="h-4 w-4" />
                          <span className="sr-only">Xóa {investor.name}</span>
                        </button>
                      </>
                  }
                  </div>
                </li>);

          })}
          </ul>
        }
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Chỉ người đã tạo bản ghi và Admin sửa được thông tin chủ đầu tư. Bản ghi
        do người khác tạo vẫn chọn được khi tạo dự án.
      </p>

      {isFormOpen &&
      <InvestorFormDialog
        investor={editing}
        initialName={editing ? '' : keyword.trim()}
        existing={investors}
        currentUserId={CURRENT_USER.id}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(undefined);
        }}
        onSave={handleSave} />

      }

      {pendingDelete &&
      <ConfirmDeleteInvestor
        investor={pendingDelete}
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={confirmDelete} />

      }
    </div>);

}

interface ConfirmDeleteInvestorProps {
  investor: Investor;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Bản ghi đang được dự án tham chiếu thì không cho xóa — theo FR-CDT-15, xóa
 * sẽ làm hỏng dữ liệu của các dự án đó. Trường hợp này chuyển sang trạng thái
 * Ngừng sử dụng, việc do Admin làm.
 */
function ConfirmDeleteInvestor({
  investor,
  onCancel,
  onConfirm
}: ConfirmDeleteInvestorProps) {
  const isReferenced = investor.projectCount > 0;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/50 p-4"
      role="dialog"
      aria-modal="true">
      
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${isReferenced ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
            
            <AlertTriangleIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {isReferenced ? 'Không xóa được chủ đầu tư này' : 'Xóa chủ đầu tư?'}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
              {isReferenced ?
              <>
                  <span className="font-semibold text-neutral-900">
                    {investor.name}
                  </span>{' '}
                  đang được {investor.projectCount} dự án tham chiếu. Xóa sẽ làm
                  các dự án đó mất thông tin chủ đầu tư. Muốn ngừng dùng cho dự
                  án mới, đề nghị Admin chuyển bản ghi sang trạng thái Ngừng sử
                  dụng.
                </> :

              <>
                  <span className="font-semibold text-neutral-900">
                    {investor.name}
                  </span>{' '}
                  chưa gắn với dự án nào. Xóa xong trang công khai của chủ đầu tư
                  cũng không còn truy cập được.
                </>
              }
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
            
            {isReferenced ? 'Đã hiểu' : 'Hủy'}
          </button>
          {!isReferenced &&
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">
            
              Xóa chủ đầu tư
            </button>
          }
        </div>
      </div>
    </div>);

}
