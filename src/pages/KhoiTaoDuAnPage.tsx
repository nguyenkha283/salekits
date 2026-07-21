import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, ExternalLinkIcon } from 'lucide-react';
import { ProjectDraft } from '../types/project';

/**
 * URL Web App Apps Script, lấy từ biến môi trường VITE_DRIVE_WEBAPP_URL.
 * Trên Vercel: Project Settings > Environment Variables > thêm biến này.
 * Khi chạy local: tạo file .env.local với dòng
 *   VITE_DRIVE_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 *
 * Lưu ý: công cụ này là 1 URL độc lập, không cần đăng nhập CMS — có thể dùng
 * bất cứ lúc nào, không nhất thiết phải mở từ trang này trước khi tạo dự án.
 */
const DRIVE_WEBAPP_URL = import.meta.env.VITE_DRIVE_WEBAPP_URL ?? '';

const isWebAppConfigured = DRIVE_WEBAPP_URL.length > 0;

const DRIVE_FOLDER_URL_PATTERN = /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/;

export function KhoiTaoDuAnPage() {
  const navigate = useNavigate();
  const [tenDuAn, setTenDuAn] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const trimmedDriveLink = driveLink.trim();
  const isDriveLinkValid = DRIVE_FOLDER_URL_PATTERN.test(trimmedDriveLink);
  const canSubmit = tenDuAn.trim().length > 0 && isDriveLinkValid && !isSyncing;

  async function handleSubmit() {
    setSyncError('');
    setIsSyncing(true);

    const project: ProjectDraft = {
      hierarchy: '',
      name: tenDuAn.trim(),
      propertyType: '',
      province: '',
      district: '',
      status: ''
    };

    try {
      const response = await fetch('/api/sync-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveFolderUrl: trimmedDriveLink,
          projectName: tenDuAn.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Đồng bộ thất bại, vui lòng thử lại.');
      }

      // Truyền projectId qua query string (không chỉ location.state) để
      // ProjectCreatedPage tải lại được đúng dữ liệu này kể cả khi reload
      // trang — vì location.state của React Router bị mất khi tải lại.
      navigate(`/hoan-tat?projectId=${encodeURIComponent(data.projectId)}`, {
        state: { project }
      });
    } catch (error) {
      setIsSyncing(false);
      setSyncError(
        error instanceof Error ?
        error.message :
        'Đồng bộ thất bại, vui lòng thử lại.'
      );
    }
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

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Tạo dự án mới
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Dành cho dự án đã có folder Drive chuẩn bị sẵn nội dung — nhập tên dự
          án và dán link folder để liên kết vào CMS.
        </p>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-700">
              Tên dự án
            </label>
            <input
              value={tenDuAn}
              onChange={(event) => setTenDuAn(event.target.value)}
              placeholder="Vinhomes Ocean Park 3"
              disabled={isSyncing}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-100" />
            
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold text-neutral-700">
              Link folder Drive
            </label>
            <input
              value={driveLink}
              onChange={(event) => setDriveLink(event.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              disabled={isSyncing}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-100" />
            
            {driveLink.length > 0 && !isDriveLinkValid &&
            <p className="mt-1 text-xs text-red-600">
                Link chưa đúng định dạng folder Drive.
              </p>
            }

            {isWebAppConfigured &&
            <p className="mt-2 text-xs text-neutral-500">
                Chưa có folder?{' '}
                <a
                href={DRIVE_WEBAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#f5881f] hover:underline">
                
                  Tạo folder chuẩn tại đây
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
                {' '}rồi chuẩn bị nội dung xong quay lại dán link — không cần
                làm ngay bây giờ.
              </p>
            }

            {!isWebAppConfigured &&
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Chưa cấu hình công cụ tạo folder. Deploy Apps Script Web App
                rồi thêm biến môi trường{' '}
              <code className="rounded bg-amber-100 px-1">
                  VITE_DRIVE_WEBAPP_URL
                </code>
                .
              </div>
            }
          </div>

          {isSyncing &&
          <div className="mt-4 flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600">
              <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-neutral-300 border-t-[#f5881f]" />
              Đang đọc nội dung từ folder Drive và đồng bộ vào CMS...
            </div>
          }

          {syncError &&
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {syncError}
            </div>
          }

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300">
              
              {isSyncing ? 'Đang tạo dự án...' : 'Tạo dự án'}
              {!isSyncing && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>);

}
