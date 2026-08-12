import React, { useEffect, useState } from 'react';
import {
  CheckCircle2Icon,
  LoaderIcon,
  PhoneIcon,
  UserRoundIcon } from
'lucide-react';
import {
  DEMO_CONTACTS,
  isValidPhone,
  lookupContactByPhone,
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
  /** Bản ghi mới, để màn cha nạp vào kho chung và gửi lên khi tạo dự án. */
  onCreate: (contact: ProjectContact) => void;
}

const LABEL = 'mb-1.5 block text-xs font-semibold text-neutral-700';
const FIELD =
'w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100';

/**
 * Nhập đầu mối liên hệ cho dự án — UC-CDT-04.
 *
 * Số điện thoại là thứ định danh bản ghi nên nó là ô nhập đầu tiên và là ô duy
 * nhất hiện ra lúc đầu: gõ đủ số, hệ thống tra ngay. Trùng thì hiện luôn thông
 * tin đầu mối đã có; chưa có mới mở các trường còn lại. Nhờ vậy hai APM của hai
 * dự án cùng chủ đầu tư không tạo ra hai bản ghi cho cùng một người.
 */
export function ContactPicker({
  investorId,
  investorName,
  contacts,
  value,
  onChange,
  onCreate
}: ContactPickerProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [note, setNote] = useState('');
  const [matched, setMatched] = useState<ProjectContact | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  const phoneReady = isValidPhone(phone);

  /** Tra số điện thoại ngay khi số đã đủ dài. */
  useEffect(() => {
    if (!phoneReady) {
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
  }, [phone, phoneReady, contacts]);

  /** Trùng hoàn toàn thì chọn luôn, không bắt bấm thêm một nút nữa. */
  useEffect(() => {
    if (matched) onChange(matched);
    // onChange đến từ màn cha, không đưa vào deps để tránh chạy lặp
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  function reset() {
    setPhone('');
    setName('');
    setDob('');
    setNote('');
    setMatched(null);
    onChange(undefined);
  }

  function saveNew() {
    if (!investorId || !phoneReady || !name.trim()) return;
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
  }

  if (!investorId) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-3 text-xs text-neutral-500">
        Chọn chủ đầu tư trước — đầu mối là người của chủ đầu tư đó.
      </p>);

  }

  // Đã chốt được đầu mối, dù là bản ghi cũ hay vừa tạo
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
            onClick={reset}
            className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
            
            Đổi
          </button>
        </div>
        {matched &&
        <p className="mt-2 flex items-start gap-1.5 border-t border-neutral-100 pt-2 text-[11px] text-emerald-700">
            <CheckCircle2Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Số này đã có trong hệ thống — dùng lại bản ghi cũ, không tạo bản
            trùng.
          </p>
        }
      </div>);

  }

  return (
    <div className="space-y-3">
      <div>
        <label className={LABEL} htmlFor="contact-phone">
          Số điện thoại đầu mối
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
        {phone.trim().length > 0 && !phoneReady ?
        <p className="mt-1 text-[11px] text-neutral-500">
            Nhập đủ 10 hoặc 11 số để hệ thống tra.
          </p> :

        <p className="mt-1 text-[11px] text-neutral-500">
            Nhập số để tra xem {investorName ?? 'chủ đầu tư'} đã có đầu mối trong
            hệ thống chưa. Để trống cũng được, bổ sung sau.
          </p>
        }
      </div>

      {phoneReady && !isLooking && !matched &&
      <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50/60 p-3">
          <p className="text-[11px] font-semibold text-neutral-700">
            Chưa có đầu mối nào dùng số này. Nhập thông tin để tạo mới.
          </p>

          <div>
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

          <div>
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

          <div>
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

          <button
          type="button"
          onClick={saveNew}
          disabled={name.trim().length === 0}
          className="rounded-md bg-orange-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300">
          
            Dùng đầu mối này
          </button>
        </div>
      }

      <p className="text-[11px] text-neutral-500">
        Thông tin nội bộ, không hiển thị trên trang công khai. Đầu mối được gắn
        vào dự án ngay khi bấm Tạo dự án.
      </p>
    </div>);

}

export { DEMO_CONTACTS };
