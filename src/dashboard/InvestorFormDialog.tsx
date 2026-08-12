import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangleIcon,
  ImageIcon,
  LoaderIcon,
  PlusIcon,
  Trash2Icon,
  XIcon } from
'lucide-react';
import {
  INVESTOR_DESCRIPTION_SOFT_LIMIT,
  MAX_INVESTOR_ADVANTAGES,
  MAX_INVESTOR_NUMBERS,
  createEmptyInvestor,
  type Investor,
  type InvestorNumber } from
'../types/investor';
import {
  generateInvestorCode,
  generateInvestorSlug,
  suggestInvestorCode,
  suggestInvestorSlug } from
'./investorMatching';
import { searchInvestors } from './dashboardData';
import { CURRENT_USER } from './dashboardData';
import {
  isValidPhone,
  lookupContactByPhone,
  type ProjectContact } from
'./contactData';

interface InvestorFormDialogProps {
  /** Bản ghi đang sửa; bỏ trống nghĩa là tạo mới. */
  investor?: Investor;
  /** Tên gõ dở ở ô tìm kiếm, dùng làm giá trị khởi tạo khi tạo mới. */
  initialName?: string;
  /** Toàn bộ bản ghi hiện có, dùng để tránh trùng mã và đường dẫn. */
  existing: Investor[];
  currentUserId: string;
  /** Admin mới được đổi trạng thái sang Ngừng sử dụng (UC-CDT-05). */
  canChangeStatus?: boolean;
  onClose: () => void;
  onSave: (investor: Investor) => void;
  /** Người dùng nhận ra bản ghi đã tồn tại và chọn dùng lại thay vì tạo mới. */
  onUseExisting?: (investor: Investor) => void;
  /** Kho đầu mối hiện có, dùng để tra trùng theo số điện thoại. */
  contacts?: ProjectContact[];
  onCreateContact?: (contact: ProjectContact) => void;
}

const LABEL_CLASS = 'mb-1 block text-xs font-semibold text-neutral-700';
const INPUT_CLASS =
'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-100 disabled:text-neutral-500';

export function InvestorFormDialog({
  investor,
  initialName = '',
  existing,
  currentUserId,
  canChangeStatus = false,
  onClose,
  onSave,
  onUseExisting,
  contacts = [],
  onCreateContact
}: InvestorFormDialogProps) {
  const isEditing = Boolean(investor);
  const [draft, setDraft] = useState<Investor>(() =>
  investor ?
  { ...investor, advantages: [...investor.advantages], numbers: investor.numbers.map((item) => ({ ...item })) } :
  { ...createEmptyInvestor(currentUserId), name: initialName }
  );
  const [showErrors, setShowErrors] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  /** Bản ghi có tên gần giống, dò trong lúc người dùng gõ tên. */
  const [similar, setSimilar] = useState<Investor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSimilarDismissed, setIsSimilarDismissed] = useState(false);
  /** Đầu mối liên hệ nhập kèm khi tạo chủ đầu tư — tùy chọn. */
  const [contactPhone, setContactPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactDob, setContactDob] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [matchedContact, setMatchedContact] = useState<ProjectContact | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const otherCodes = useMemo(
    () => existing.filter((item) => item.id !== draft.id).map((item) => item.code),
    [existing, draft.id]
  );
  const otherSlugs = useMemo(
    () => existing.filter((item) => item.id !== draft.id).map((item) => item.slug),
    [existing, draft.id]
  );

  /**
   * Dò trùng ngay trong lúc gõ tên. Đây là chốt chặn cuối của mục đích chống
   * trùng: người dùng đã mở popup tạo mới nghĩa là họ tin bản ghi chưa tồn tại,
   * nên phải đưa bản ghi giống ra trước mắt họ chứ không đợi họ đi tìm.
   */
  useEffect(() => {
    const trimmed = draft.name.trim();
    if (trimmed.length < 2) {
      setSimilar([]);
      setIsSearching(false);
      return;
    }
    const pool = existing.filter((item) => item.id !== draft.id);
    const controller = new AbortController();
    setIsSearching(true);
    const timer = setTimeout(() => {
      searchInvestors(trimmed, pool, controller.signal).
      then((results) => {
        setSimilar(results.slice(0, 4));
        setIsSearching(false);
      }).
      catch(() => {/* lệnh bị hủy vì người dùng gõ tiếp */});
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [draft.name, draft.id, existing]);

  const visibleSimilar = isSimilarDismissed ? [] : similar;

  /** Tra số điện thoại đầu mối trong lúc gõ, cùng cơ chế với ContactPicker. */
  useEffect(() => {
    if (!isValidPhone(contactPhone)) {
      setMatchedContact(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      lookupContactByPhone(contactPhone, contacts, controller.signal).
      then(setMatchedContact).
      catch(() => {/* lệnh bị hủy vì người dùng gõ tiếp */});
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [contactPhone, contacts]);

  /** Mã chỉ sinh khi tạo mới; đã tạo rồi thì không sửa được (FR-CDT-03). */
  const previewCode = isEditing ?
  draft.code :
  draft.name.trim() ?
  suggestInvestorCode(draft.name) :
  '';

  const previewSlug = slugTouched ?
  draft.slug :
  draft.name.trim() ?
  suggestInvestorSlug(draft.name) :
  '';

  const nameError = !draft.name.trim();
  const descriptionError = !draft.description.trim();
  const descriptionTooLong =
  draft.description.length > INVESTOR_DESCRIPTION_SOFT_LIMIT;

  function update<K extends keyof Investor>(key: K, value: Investor[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) return;
    update('logoUrl', URL.createObjectURL(file));
  }

  function updateAdvantage(index: number, value: string) {
    setDraft((current) => {
      const advantages = [...current.advantages];
      advantages[index] = value;
      return { ...current, advantages };
    });
  }

  function updateNumber(index: number, key: keyof InvestorNumber, value: string) {
    setDraft((current) => {
      const numbers = current.numbers.map((item) => ({ ...item }));
      numbers[index] = { ...numbers[index], [key]: value };
      return { ...current, numbers };
    });
  }

  function handleSubmit() {
    if (nameError || descriptionError) {
      setShowErrors(true);
      return;
    }
    const name = draft.name.trim();
    const saved: Investor = {
      ...draft,
      name,
      description: draft.description.trim(),
      advantages: draft.advantages.map((item) => item.trim()).filter(Boolean),
      numbers: draft.numbers.filter((item) => item.value.trim() || item.label.trim()),
      id: draft.id || `i-${Date.now()}`,
      code: isEditing ? draft.code : generateInvestorCode(name, otherCodes),
      slug: slugTouched && draft.slug.trim() ?
      draft.slug.trim() :
      generateInvestorSlug(name, otherSlugs),
      createdBy: draft.createdBy || currentUserId,
      createdAt:
      draft.createdAt ||
      new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    };
    // Đầu mối nhập kèm: số đã có thì dùng lại bản ghi cũ, không tạo bản trùng.
    if (
    onCreateContact &&
    !matchedContact &&
    isValidPhone(contactPhone) &&
    contactName.trim())
    {
      onCreateContact({
        id: `c-${Date.now()}`,
        investorId: saved.id,
        name: contactName.trim(),
        phone: contactPhone.trim(),
        dob: contactDob,
        note: contactNote.trim(),
        createdBy: CURRENT_USER.id
      });
    }

    onSave(saved);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-900/50 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Sửa chủ đầu tư' : 'Thêm chủ đầu tư'}
      onMouseDown={(event) => {
        if (!dialogRef.current?.contains(event.target as Node)) onClose();
      }}>
      
      <div
        ref={dialogRef}
        className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {isEditing ? 'Sửa thông tin chủ đầu tư' : 'Thêm chủ đầu tư'}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              {isEditing ?
              'Thay đổi có hiệu lực trên mọi dự án đang tham chiếu tới chủ đầu tư này.' :
              'Bản ghi dùng chung cho nhiều dự án. Kiểm tra kỹ trước khi tạo để tránh trùng.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
            
            <XIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[calc(100vh-14rem)] space-y-6 overflow-y-auto px-6 py-5">
          {/* Thông tin định danh */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="investor-name">
                Tên chủ đầu tư <span className="text-orange-600">*</span>
              </label>
              <input
                id="investor-name"
                value={draft.name}
                onChange={(event) => {
                  setIsSimilarDismissed(false);
                  update('name', event.target.value);
                }}
                placeholder="Công ty Cổ phần Đầu tư ABC"
                className={INPUT_CLASS} />
              
              {showErrors && nameError &&
              <p className="mt-1 text-xs font-medium text-red-600">
                  Nhập tên đầy đủ của pháp nhân.
                </p>
              }

              {isSearching && visibleSimilar.length === 0 &&
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                  <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
                  Đang dò các chủ đầu tư có tên gần giống…
                </p>
              }

              {visibleSimilar.length > 0 &&
              <div className="mt-2 overflow-hidden rounded-lg border border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-2 px-3 py-2.5">
                    <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-amber-900">
                        {visibleSimilar.length} chủ đầu tư có tên gần giống
                      </p>
                      <p className="mt-0.5 text-xs text-amber-800">
                        Nếu là cùng một doanh nghiệp, hãy dùng bản ghi có sẵn.
                        Hệ thống chưa gộp được hai bản ghi trùng.
                      </p>
                    </div>
                    <button
                    type="button"
                    onClick={() => setIsSimilarDismissed(true)}
                    className="shrink-0 text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900">
                    
                      Bỏ qua
                    </button>
                  </div>
                  <ul className="divide-y divide-amber-200 border-t border-amber-200 bg-white/70">
                    {visibleSimilar.map((item) =>
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-3 py-2">
                    
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-neutral-900">
                            {item.name}
                          </span>
                          <span className="block truncate text-xs text-neutral-500">
                            {item.code} ·{' '}
                            {item.projectCount > 0 ?
                        `${item.projectCount} dự án` :
                        'Chưa gắn dự án'}
                            {item.status === 'Ngừng sử dụng' && ' · Ngừng sử dụng'}
                          </span>
                        </span>
                        {onUseExisting &&
                    <button
                      type="button"
                      onClick={() => onUseExisting(item)}
                      className="shrink-0 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700">
                      
                            Dùng bản ghi này
                          </button>
                    }
                      </li>
                  )}
                  </ul>
                </div>
              }
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="investor-code">
                Mã chủ đầu tư
              </label>
              <input
                id="investor-code"
                value={previewCode}
                disabled
                placeholder="Sinh tự động từ tên"
                className={INPUT_CLASS} />
              
              <p className="mt-1 text-[11px] text-neutral-500">
                Hệ thống tự sinh, không sửa được sau khi tạo.
              </p>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="investor-tax">
                Mã số thuế
              </label>
              <input
                id="investor-tax"
                value={draft.taxCode}
                onChange={(event) => update('taxCode', event.target.value)}
                placeholder="0106215426"
                className={INPUT_CLASS} />
              
              <p className="mt-1 text-[11px] text-neutral-500">
                Lưu để chuẩn bị chống trùng ở phase sau.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="investor-slug">
                Đường dẫn trang chủ đầu tư
              </label>
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 text-sm text-neutral-500">
                  cenhomes.vn/chu-dau-tu/
                </span>
                <input
                  id="investor-slug"
                  value={previewSlug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    update('slug', event.target.value);
                  }}
                  placeholder="sinh-tu-ten"
                  className={INPUT_CLASS} />
                
              </div>
              {isEditing && slugTouched && draft.slug !== investor?.slug &&
              <p className="mt-1.5 flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
                  <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Đổi đường dẫn sẽ làm địa chỉ cũ không còn truy cập được.
                </p>
              }
            </div>
          </section>

          {/* Nhận diện */}
          <section className="grid gap-4 sm:grid-cols-[auto_1fr]">
            <div>
              <span className={LABEL_CLASS}>Logo</span>
              <label className="flex h-[88px] w-[88px] cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition-colors hover:border-orange-300 hover:text-orange-500">
                {draft.logoUrl ?
                <img
                  src={draft.logoUrl}
                  alt="Logo chủ đầu tư"
                  className="h-full w-full object-contain" /> :


                <>
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[10px] font-medium">PNG, JPG</span>
                  </>
                }
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleLogo}
                  className="sr-only" />
                
              </label>
            </div>

            <div>
              <label className={LABEL_CLASS} htmlFor="investor-description">
                Mô tả ngắn <span className="text-orange-600">*</span>
              </label>
              <textarea
                id="investor-description"
                value={draft.description}
                onChange={(event) => update('description', event.target.value)}
                rows={4}
                placeholder="Một đoạn giới thiệu ngắn hiển thị trên trang công khai của chủ đầu tư."
                className={`${INPUT_CLASS} resize-y`} />
              
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-[11px] text-neutral-500">
                  Khuyến nghị không quá {INVESTOR_DESCRIPTION_SOFT_LIMIT} ký tự.
                </span>
                <span
                  className={`text-[11px] font-semibold ${descriptionTooLong ? 'text-amber-600' : 'text-neutral-400'}`}>
                  
                  {draft.description.length}/{INVESTOR_DESCRIPTION_SOFT_LIMIT}
                </span>
              </div>
              {descriptionTooLong &&
              <p className="mt-1 text-xs text-amber-700">
                  Mô tả dài hơn khuyến nghị. Vẫn lưu được, nhưng trang công khai
                  có thể bị cắt chữ.
                </p>
              }
              {showErrors && descriptionError &&
              <p className="mt-1 text-xs font-medium text-red-600">
                  Nhập mô tả ngắn cho chủ đầu tư.
                </p>
              }
            </div>
          </section>

          {/* Lợi thế cạnh tranh */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">
                Lợi thế cạnh tranh
              </span>
              <span className="text-[11px] text-neutral-500">
                {draft.advantages.length}/{MAX_INVESTOR_ADVANTAGES} mục
              </span>
            </div>
            <div className="space-y-2">
              {draft.advantages.map((advantage, index) =>
              <div key={index} className="flex items-center gap-2">
                  <input
                  value={advantage}
                  onChange={(event) => updateAdvantage(index, event.target.value)}
                  placeholder="Một dòng chữ, ví dụ: Bàn giao đúng tiến độ 20 dự án"
                  className={INPUT_CLASS} />
                
                  <button
                  type="button"
                  aria-label="Xóa lợi thế"
                  onClick={() =>
                  update(
                    'advantages',
                    draft.advantages.filter((_, item) => item !== index)
                  )
                  }
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600">
                  
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {draft.advantages.length < MAX_INVESTOR_ADVANTAGES &&
            <button
              type="button"
              onClick={() => update('advantages', [...draft.advantages, ''])}
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
              
                <PlusIcon className="h-3.5 w-3.5" /> Thêm lợi thế
              </button>
            }
          </section>

          {/* Con số ấn tượng */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">
                Con số ấn tượng
              </span>
              <span className="text-[11px] text-neutral-500">
                {draft.numbers.length}/{MAX_INVESTOR_NUMBERS} mục
              </span>
            </div>
            <div className="space-y-2">
              {draft.numbers.map((item, index) =>
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border border-neutral-200 p-2.5">
                
                  <div className="grid flex-1 gap-2 sm:grid-cols-3">
                    <input
                    value={item.value}
                    onChange={(event) => updateNumber(index, 'value', event.target.value)}
                    placeholder="Con số — 7.000+"
                    className={INPUT_CLASS} />
                  
                    <input
                    value={item.label}
                    onChange={(event) => updateNumber(index, 'label', event.target.value)}
                    placeholder="Nhãn — Căn hộ bàn giao"
                    className={INPUT_CLASS} />
                  
                    <input
                    value={item.description}
                    onChange={(event) =>
                    updateNumber(index, 'description', event.target.value)
                    }
                    placeholder="Mô tả ngắn — Tính đến 2025"
                    className={INPUT_CLASS} />
                  
                  </div>
                  <button
                  type="button"
                  aria-label="Xóa con số"
                  onClick={() =>
                  update(
                    'numbers',
                    draft.numbers.filter((_, position) => position !== index)
                  )
                  }
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600">
                  
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {draft.numbers.length < MAX_INVESTOR_NUMBERS &&
            <button
              type="button"
              onClick={() =>
              update('numbers', [
              ...draft.numbers,
              { value: '', label: '', description: '' }]
              )
              }
              className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
              
                <PlusIcon className="h-3.5 w-3.5" /> Thêm con số
              </button>
            }
          </section>

          {/* Thông tin doanh nghiệp */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="investor-address">
                Địa chỉ trụ sở
              </label>
              <input
                id="investor-address"
                value={draft.address}
                onChange={(event) => update('address', event.target.value)}
                className={INPUT_CLASS} />
              
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="investor-website">
                Website
              </label>
              <input
                id="investor-website"
                value={draft.website}
                onChange={(event) => update('website', event.target.value)}
                placeholder="https://"
                className={INPUT_CLASS} />
              
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="investor-founded">
                Năm thành lập
              </label>
              <input
                id="investor-founded"
                value={draft.foundedYear}
                onChange={(event) => update('foundedYear', event.target.value)}
                inputMode="numeric"
                placeholder="2014"
                className={INPUT_CLASS} />
              
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="investor-status">
                Trạng thái
              </label>
              <select
                id="investor-status"
                value={draft.status}
                disabled={!canChangeStatus}
                onChange={(event) =>
                update('status', event.target.value as Investor['status'])
                }
                className={INPUT_CLASS}>
                
                <option>Đang sử dụng</option>
                <option>Ngừng sử dụng</option>
              </select>
              {!canChangeStatus &&
              <p className="mt-1 text-[11px] text-neutral-500">
                  Chỉ Admin chuyển được sang Ngừng sử dụng.
                </p>
              }
            </div>
          </section>

          {/* Đầu mối liên hệ — tùy chọn, lưu thành bản ghi dùng chung */}
          {onCreateContact && !isEditing &&
          <section className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-4">
              <div className="mb-3">
                <h3 className="text-xs font-bold text-neutral-800">
                  Đầu mối liên hệ
                </h3>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  Người của chủ đầu tư làm việc trực tiếp với dự án. Tùy chọn,
                  thông tin nội bộ và không lên trang công khai.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor="investor-contact-phone">
                    Số điện thoại
                  </label>
                  <input
                  id="investor-contact-phone"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="0912 345 678"
                  inputMode="tel"
                  className={INPUT_CLASS} />
                
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Số điện thoại định danh đầu mối, nhập trước để tra trùng.
                  </p>
                </div>

                <div>
                  <label className={LABEL_CLASS} htmlFor="investor-contact-name">
                    Tên đại diện
                  </label>
                  <input
                  id="investor-contact-name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="Chị Nguyễn Thanh Lan"
                  disabled={Boolean(matchedContact)}
                  className={INPUT_CLASS} />
                
                </div>
              </div>

              {matchedContact &&
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <p className="text-xs font-bold text-emerald-900">
                    Số này đã có đầu mối: {matchedContact.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-800">
                    Hệ thống dùng lại bản ghi đã có thay vì tạo bản trùng.
                  </p>
                </div>
              }

              {!matchedContact &&
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor="investor-contact-dob">
                      Ngày sinh
                    </label>
                    <input
                  id="investor-contact-dob"
                  type="date"
                  value={contactDob}
                  onChange={(event) => setContactDob(event.target.value)}
                  className={INPUT_CLASS} />
                
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor="investor-contact-note">
                      Ghi chú
                    </label>
                    <input
                  id="investor-contact-note"
                  value={contactNote}
                  onChange={(event) => setContactNote(event.target.value)}
                  placeholder="Thói quen, cách liên hệ thuận tiện"
                  className={INPUT_CLASS} />
                
                  </div>
                </div>
              }

              {contactPhone.trim().length > 0 && !isValidPhone(contactPhone) &&
              <p className="mt-2 text-xs font-medium text-red-600">
                  Số điện thoại chưa đúng định dạng.
                </p>
              }
            </section>
          }
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-neutral-200 px-6 py-4">
          <p className="hidden text-xs text-neutral-500 sm:block">
            Trang công khai của chủ đầu tư hoạt động ngay khi lưu.
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
              
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-md bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
              
              {isEditing ? 'Lưu thay đổi' : 'Tạo chủ đầu tư'}
            </button>
          </div>
        </footer>
      </div>
    </div>);

}
