import { useEffect, useState } from 'react';
import { VideoIcon, XIcon } from 'lucide-react';

/**
 * Nút Video call nổi ở góc dưới bên phải. Bấm vào mở màn hình gọi video với
 * trợ lý AI "Bích Ngọc" (repo mesh-avatar), nhúng qua iframe ở chế độ ?embed=1.
 *
 * Địa chỉ app Bích Ngọc cấu hình bằng VITE_VIDEO_CALL_URL; mặc định là container
 * dev chạy ở cổng 8080 trên máy.
 */
const VIDEO_CALL_URL =
// Repo chưa có vite-env.d.ts nên ép kiểu tại chỗ.
(import.meta as ImportMeta & {env: Record<string, string | undefined>;}).env.
VITE_VIDEO_CALL_URL?.trim() ||
'http://localhost:8080/';

function embedUrl(base: string, projectId?: string | null): string {
  try {
    const url = new URL(base, window.location.href);
    url.searchParams.set('embed', '1');
    // Ngọc dùng projectId để đọc kho tri thức và bảng hàng của đúng dự án.
    if (projectId) url.searchParams.set('projectId', projectId);
    return url.toString();
  } catch {
    return base;
  }
}

export function VideoCallWidget({ projectId }: {projectId?: string | null;}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    // Ngọc báo kết thúc cuộc gọi qua postMessage → tự đóng khung gọi.
    function onMessage(event: MessageEvent) {
      let origin = '';
      try {
        origin = new URL(VIDEO_CALL_URL, window.location.href).origin;
      } catch {
        return;
      }
      if (event.origin !== origin) return;
      if ((event.data as {type?: string;} | null)?.type === 'mesh-avatar:hangup') {
        window.setTimeout(() => setOpen(false), 1200);
      }
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('message', onMessage);
    };
  }, [open]);

  return (
    <>
      {open &&
      <div
        role="dialog"
        aria-label="Gọi video với trợ lý tư vấn"
        className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-black shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(720px,calc(100vh-8rem))] sm:w-[380px] sm:rounded-3xl sm:border sm:border-white/10">

          <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Đóng video call"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/60">

            <XIcon className="h-5 w-5" />
          </button>
          {/* Gỡ iframe khi đóng để dừng giọng đọc và micro của cuộc gọi. */}
          <iframe
          src={embedUrl(VIDEO_CALL_URL, projectId)}
          title="Video call với trợ lý tư vấn Bích Ngọc"
          allow="microphone; camera; autoplay; clipboard-write"
          className="h-full w-full flex-1 border-0" />

        </div>
      }

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Đóng video call' : 'Mở video call'}
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-[61] items-center gap-2 rounded-full bg-[#f5921f] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/25 transition-all hover:bg-[#db7214] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 ${open ? 'hidden sm:inline-flex' : 'inline-flex'}`}>

        {open ?
        <XIcon className="h-5 w-5" /> :
        <VideoIcon className="h-5 w-5" />
        }
        <span>{open ? 'Đóng' : 'Video call'}</span>
      </button>
    </>);

}
