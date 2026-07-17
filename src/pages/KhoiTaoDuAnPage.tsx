import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, ExternalLinkIcon } from 'lucide-react';
import { ProjectDraft } from '../types/project';

/**
 * URL Web App Apps Script, lấy từ biến môi trường VITE_DRIVE_WEBAPP_URL.
 * Trên Vercel: Project Settings > Environment Variables > thêm biến này.
 * Khi chạy local: tạo file .env.local với dòng
 *   VITE_DRIVE_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 */
const DRIVE_WEBAPP_URL = import.meta.env.VITE_DRIVE_WEBAPP_URL ?? '';

const isWebAppConfigured = DRIVE_WEBAPP_URL.length > 0;

const DRIVE_FOLDER_URL_PATTERN = /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/;

interface StepNumberProps {
  children: React.ReactNode;
  active?: boolean;
}

function StepNumber({ children, active = false }: StepNumberProps) {
  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
      active ? 'bg-[#f5881f] text-white' : 'bg-neutral-200 text-neutral-500'}`
      }>
      
      {children}
    </span>);

}

export function KhoiTaoDuAnPage() {
  const navigate = useNavigate();
  const [tenDuAn, setTenDuAn] = useState('');
  const [driveLink, setDriveLink] = useState('');

  const trimmedDriveLink = driveLink.trim();
  const isDriveLinkValid = DRIVE_FOLDER_URL_PATTERN.test(trimmedDriveLink);
  const canContinue = tenDuAn.trim().length > 0 && isDriveLinkValid;

  function handleContinue() {
    const project: ProjectDraft = {
      hierarchy: '',
      name: tenDuAn.trim(),
      propertyType: '',
      province: '',
      district: '',
      status: ''
    };

    // driveFolderUrl được truyền qua location.state để ProjectCreatedPage (hoặc
    // bước tiếp theo) lưu lại — hiện tại ProjectCreatedPage chưa đọc field này,
    // cần bổ sung khi nối với backend thật.
    navigate('/hoan-tat', {
      state: { project, driveFolderUrl: trimmedDriveLink }
    });
  }

  return (
    <div className="min-h-full w-full bg-neutral-50 font-sans text-neutral-900">
      <header className="flex h-16 w-full items-center gap-2.5 border-b border-neutral-200 bg-white px-4 sm:px-8">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-[#6D3A18]">
          <span className="h-3 w-3 rotate-45 border-2 border-white" />
        </span>
        <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-[#173020] sm:text-xl">
          CENH<span className="text-[#f5881f]">O</span>MES
          <span className="align-super text-[9px] font-bold sm:text-[10px]">
            .VN
          </span>
        </span>
        <span className="h-6 w-px shrink-0 bg-neutral-300" aria-hidden="true" />
        <span className="hidden text-sm font-semibold text-neutral-700 sm:block">
          Khởi tạo dự án
        </span>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Khởi tạo dự án mới
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Tạo bộ thư mục Google Drive chuẩn để chuẩn bị nội dung, sau đó liên
          kết vào dự án.
        </p>

        <ol className="mt-8 space-y-8">
          <li className="flex gap-4">
            <StepNumber active>1</StepNumber>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-neutral-900">
                Tạo cấu trúc thư mục Drive
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Công cụ bên dưới sẽ tạo folder đúng chuẩn (00 → 08) ngay trong
                Drive cá nhân của bạn. Lần đầu sử dụng, Google có thể yêu cầu
                bạn đăng nhập/cấp quyền — màn hình xác thực của Google không
                hiển thị được trong khung nhúng, nên hãy dùng nút{' '}
                <span className="font-semibold">
                  "Mở công cụ tạo dự án"
                </span>{' '}
                bên dưới cho lần đầu tiên.
              </p>

              {!isWebAppConfigured &&
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Chưa cấu hình link công cụ tạo dự án. Deploy Apps Script Web
                  App rồi cập nhật hằng số{' '}
                <code className="rounded bg-amber-100 px-1">
                    DRIVE_WEBAPP_URL
                  </code>{' '}
                  trong{' '}
                <code className="rounded bg-amber-100 px-1">
                    KhoiTaoDuAnPage.tsx
                  </code>
                  .
                </div>
              }

              {isWebAppConfigured &&
              <>
                  <a
                  href={DRIVE_WEBAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#f5881f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#db7214]">
                  
                    Mở công cụ tạo dự án
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>

                  <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <div className="border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                      Xem nhanh tại đây (chỉ hoạt động nếu bạn đã cấp quyền
                      trước đó qua nút phía trên)
                    </div>
                    <iframe
                    src={DRIVE_WEBAPP_URL}
                    title="Công cụ tạo dự án Drive"
                    className="h-[420px] w-full" />
                  
                  </div>
                </>
              }
            </div>
          </li>

          <li className="flex gap-4">
            <StepNumber active={tenDuAn.length > 0 || driveLink.length > 0}>
              2
            </StepNumber>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-neutral-900">
                Liên kết vào dự án
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Sau khi tạo xong, dán tên dự án và link folder Drive (hiện
                trong công cụ ở bước 1, hoặc trong Sheet nhật ký chung) vào
                đây.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700">
                    Tên dự án
                  </label>
                  <input
                    value={tenDuAn}
                    onChange={(event) => setTenDuAn(event.target.value)}
                    placeholder="Vinhomes Ocean Park 3"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100" />
                  
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700">
                    Link folder Drive
                  </label>
                  <input
                    value={driveLink}
                    onChange={(event) => setDriveLink(event.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100" />
                  
                  {driveLink.length > 0 && !isDriveLinkValid &&
                  <p className="mt-1 text-xs text-red-600">
                      Link chưa đúng định dạng folder Drive.
                    </p>
                  }
                </div>
              </div>
            </div>
          </li>
        </ol>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300">
            
            Tiếp tục
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>);

}
