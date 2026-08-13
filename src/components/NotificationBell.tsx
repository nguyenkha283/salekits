import React, { useEffect, useRef, useState } from 'react';
import { BellIcon, CheckCircle2Icon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import {
  markNotificationsRead,
  notificationsFor,
  unreadCountFor,
  useWorkflow,
  type WorkflowRole } from
'../app/workflowStore';

const TONE_ICON = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: TriangleAlertIcon
};

const TONE_CLASS = {
  info: 'text-sky-600 bg-sky-50',
  success: 'text-emerald-600 bg-emerald-50',
  warning: 'text-amber-600 bg-amber-50'
};

/**
 * Hộp thông báo theo vai trò đang đóng.
 *
 * Thông báo gửi tới vai trò chứ chưa tới người cụ thể, vì hệ thống chưa có đăng
 * nhập. Đổi vai trò trên thanh đầu là thấy hộp thư của vai trò đó.
 */
export function NotificationBell({ role }: {role: WorkflowRole;}) {
  const { notifications } = useWorkflow();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const mine = notificationsFor(notifications, role);
  const unread = unreadCountFor(notifications, role);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && unread > 0) markNotificationsRead(role);
        }}
        aria-label={`Thông báo${unread > 0 ? `, ${unread} chưa đọc` : ''}`}
        aria-expanded={open}
        className="relative grid h-8 w-8 place-items-center rounded-md text-neutral-700 transition-colors hover:bg-neutral-100">
        
        <BellIcon className="h-5 w-5" />
        {unread > 0 &&
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        }
      </button>

      {open &&
      <div
        role="menu"
        className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-neutral-200">
        
          <div className="border-b border-neutral-100 px-4 py-2.5">
            <p className="text-sm font-bold text-neutral-900">Thông báo</p>
            <p className="text-[11px] text-neutral-500">Vai trò {role}</p>
          </div>

          {mine.length === 0 ?
        <p className="px-4 py-6 text-center text-xs text-neutral-500">
              Chưa có thông báo nào cho vai trò này.
            </p> :

        <ul className="max-h-80 divide-y divide-neutral-100 overflow-y-auto">
              {mine.map((item) => {
            const Icon = TONE_ICON[item.tone];
            return (
              <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                    <span
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${TONE_CLASS[item.tone]}`}>
                  
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
                        {item.body}
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-400">
                        {item.createdAt}
                      </p>
                    </div>
                  </li>);

          })}
            </ul>
        }
        </div>
      }
    </div>);

}

/**
 * Dải thông báo mới nhất, hiện ngay trên nội dung để người vừa đổi vai trò
 * thấy việc cần làm mà không phải mở chuông.
 */
export function NotificationBanner({ role }: {role: WorkflowRole;}) {
  const { notifications } = useWorkflow();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const latest = notificationsFor(notifications, role).find(
    (item) => !dismissed.includes(item.id)
  );
  if (!latest) return null;

  const Icon = TONE_ICON[latest.tone];
  const tone =
  latest.tone === 'success' ?
  'border-emerald-200 bg-emerald-50 text-emerald-900' :
  latest.tone === 'warning' ?
  'border-amber-200 bg-amber-50 text-amber-900' :
  'border-sky-200 bg-sky-50 text-sky-900';

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center gap-2 border-b px-4 py-2.5 text-xs ${tone}`}>
      
      <Icon className="h-4 w-4 shrink-0" />
      <span className="font-bold">{latest.title}</span>
      <span className="min-w-0 flex-1">{latest.body}</span>
      <button
        type="button"
        onClick={() => setDismissed((current) => [...current, latest.id])}
        className="shrink-0 font-semibold underline underline-offset-2">
        
        Ẩn
      </button>
    </div>);

}
