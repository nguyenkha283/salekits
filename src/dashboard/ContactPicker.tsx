import React, { useEffect, useState } from 'react';
import {
  CheckCircle2Icon,
  LoaderIcon,
  PhoneIcon,
  PlusIcon,
  UserRoundIcon,
  XIcon } from
'lucide-react';
import {
  DEMO_CONTACTS,
  isValidPhone,
  lookupContactByPhone,
  normalizePhone,
  type ProjectContact } from
'./contactData';
import { CURRENT_USER } from './dashboardData';

interface ContactPickerProps {
  /** Chủ đầu tư đang chọn. Chưa chọn thì chưa nhập đầu mối được. */
  investorId?: string;
  investorName?: string;
  /** Kho đầu mối hiện có. */
  contacts: ProjectContact[];
  value?: ProjectContact;
  onChange: (contact?: ProjectContact) => void;
  /** Bản ghi mới tạo, để màn cha nạp vào kho chung. */
  onCreate: (contact: ProjectContact) => void;
}

const LABEL = 'mb-1.5 block text-xs font-semibold text-neutral-700';
const FIELD =
'w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100';

/**
 * Nhập đầu mối liên hệ cho dự án — UC-CDT-04.
 *
 * Số điện thoại là thứ định danh bản ghi, nên nó là ô nhập đầu tiên: gõ xong là
 * hệ thống tra ngay, có rồi thì dùng lại bản ghi đó thay vì tạo bản trùng. Nhờ
 * vậy hai APM của hai dự án cùng chủ đầu tư không tạo ra hai bản ghi cho cùng
 * một người.
 */
export function ContactPicker({
  investorId,
  investorName,
  contacts,
  value,
  onChange,
  onCreate
}: ContactPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [note, setNote] = useState('');
  const [matched, setMatched] = useState<ProjectContact | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  /** Tra số điện thoại trong lúc gõ. */
  useEffect(() => {
    if (!isValidPhone(phone)) {
      setMatched(null);
      setIsLooking(false);
      return;
    }
    const controller = new AbortController();
    setIsLooking(true);
    const timer = setTimeout(() => {
      lookupContactByPhone(phone, contacts, controller.signal).
      then((found) => {
        setMatched(found);
        setIsLooking(false);
      }).
      catch(() => {/* lệnh bị hủy vì người dùng gõ tiếp */});
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [phone, contacts]);

  const contactsOfInvestor = contacts.filter(
    (item) => item.investorId === investorId
  );

  function reset() {
    setPhone('');
    setName('');
    setDob('');
    setNote('');
    setMatched(null);
    setIsOpen(false);
  }

  function useMatched() {
    if (!matched) return;
    onChange(matched);
    reset();
  }

  function createContact() {
    if (!investorId || !isValidPhone(phone) || !name.trim()) return;
    const contact: ProjectContact = {
      id: `c-${Date.now()}`,
      investorId,
      name: name.trim(),
      phone: phone.trim(),
      dob,
      note: note.trim(),
      createdBy: CURRENT_USER.id
    };
    onCreate(contact);
    onChange(contact);
    reset();
  }

  if (!investorId) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-3 text-xs text-neutral-500">
        Chọn chủ đầu tư trước, đầu mối là người của chủ đầu tư đó.
      </p>);

  }

  if (value) {
    return (
      <div className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f6efe6] text-[#6D3A18]">
            <UserRoundIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {value.name}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">{value.phone}</span>
              {value.dob &&
              <>
                  <span aria-hidden="true">·</span>
                  <span>Sinh {value.dob.split('-').reverse().join('/')}</span>
                </>
              }
              {value.createdBy !== CURRENT_USER.id &&
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-600">
                  Dùng chung
                </span>
              }
            </p>
            {value.note &&
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                {value.note}
              </p>
            }
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
            
            Đổi
          </button>
        </div>
      </div>);

  }

  if (!isOpen) {
    return (
      <div className="space-y-2">
        {contactsOfInvestor.length > 0 &&
        <ul className="space-y-1.5">
            {contactsOfInvestor.map((contact) =>
          <li key={contact.id}>
                <button
              type="button"
              onClick={() => onChange(contact)}
              className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-left transition-colors hover:border-orange-200 hover:bg-orange-50">
              
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f6efe6] text-[#6D3A18]">
                    <UserRoundIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-900">
                      {contact.name}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">
                      {contact.phone}
                    </span>
                  </span>
                </button>
              </li>
          )}
          </ul>
        }
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
          
          <PlusIcon className="h-3.5 w-3.5" />
          {contactsOfInvestor.length > 0 ? 'Đầu mối khác' : 'Thêm đầu mối liên hệ'}
        </button>
        <p className="text-[11px] text-neutral-500">
          Thông tin nội bộ, không hiển thị trên trang công khai. Có thể để trống
          và bổ sung sau.
        </p>
      </div>);

  }

  return (
    <div className="rounded-lg border border-neutral-300 bg-white p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-neutral-800">
          Đầu mối mới của {investorName ?? 'chủ đầu tư'}
        </p>
        <button
          type="button"
          onClick={reset}
          aria-label="Đóng"
          className="grid h-7 w-7 place-items-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
          
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className={LABEL} htmlFor="contact-phone">
          Số điện thoại <span className="text-orange-600">*</span>
        </label>
        <div className="relative">
          <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            id="contact-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="0912 345 678"
            inputMode="tel"
            className={`${FIELD} pl-10`} />
          
          {isLooking &&
          <LoaderIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
          }
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Số điện thoại là thứ định danh đầu mối. Nhập trước để hệ thống tra xem
          đã có bản ghi chưa.
        </p>
        {phone.trim().length > 0 && !isValidPhone(phone) &&
        <p className="mt-1 text-xs font-medium text-red-600">
            Số điện thoại chưa đúng định dạng.
          </p>
        }
      </div>

      {matched &&
      <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="flex items-start gap-2 text-xs font-bold text-emerald-900">
            <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" />
            Số này đã có đầu mối trong hệ thống
          </p>
          <p className="mt-1.5 text-sm font-semibold text-neutral-900">
            {matched.name}
          </p>
          <p className="text-xs text-neutral-600">
            {matched.phone}
            {matched.investorId !== investorId &&
          ' · thuộc chủ đầu tư khác'}
          </p>
          {matched.note &&
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-600">
              {matched.note}
            </p>
        }
          <button
          type="button"
          onClick={useMatched}
          className="mt-2.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700">
          
            Dùng đầu mối này
          </button>
        </div>
      }

      {!matched &&
      <>
          <div className="mt-3">
            <label className={LABEL} htmlFor="contact-name">
              Tên đại diện <span className="text-orange-600">*</span>
            </label>
            <input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Chị Nguyễn Thanh Lan"
            className={FIELD} />
          
          </div>

          <div className="mt-3">
            <label className={LABEL} htmlFor="contact-dob">
              Ngày sinh
            </label>
            <input
            id="contact-dob"
            type="date"
            value={dob}
            onChange={(event) => setDob(event.target.value)}
            className={FIELD} />
          
          </div>

          <div className="mt-3">
            <label className={LABEL} htmlFor="contact-note">
              Ghi chú
            </label>
            <textarea
            id="contact-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder="Thói quen, sở thích, cách liên hệ thuận tiện"
            className={`${FIELD} resize-y`} />
          
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
            type="button"
            onClick={reset}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
            
              Hủy
            </button>
            <button
            type="button"
            onClick={createContact}
            disabled={!isValidPhone(phone) || name.trim().length === 0}
            className="rounded-md bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300">
            
              Lưu đầu mối
            </button>
          </div>
        </>
      }
    </div>);

}

export { DEMO_CONTACTS };
