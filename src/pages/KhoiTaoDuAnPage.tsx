import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  Building2Icon,
  ExternalLinkIcon,
  ImageIcon,
  MapPinIcon,
  Trash2Icon } from
'lucide-react';
import { ProjectDraft } from '../types/project';
import type { Investor } from '../types/investor';
import { PROVINCES, getWards, hasWardData } from '../data/administrativeUnits';
import { InvestorPicker } from '../dashboard/InvestorPicker';
import { DASHBOARD_INVESTORS } from '../dashboard/dashboardData';

/**
 * URL Web App Apps Script, lấy từ biến môi trường VITE_DRIVE_WEBAPP_URL.
 * Trên Vercel: Project Settings > Environment Variables > thêm biến này.
 * Khi chạy local: tạo file .env.local với dòng
 *   VITE_DRIVE_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 */
const DRIVE_WEBAPP_URL = import.meta.env.VITE_DRIVE_WEBAPP_URL ?? '';

const isWebAppConfigured = DRIVE_WEBAPP_URL.length > 0;

const DRIVE_FOLDER_URL_PATTERN =
/^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/;

const LABEL = 'mb-1.5 block text-xs font-semibold text-neutral-700';
const FIELD =
'w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-100';

/** Nhóm trường trong biểu mẫu, đánh số vì đây là trình tự người dùng đi qua. */
function Section({
  step,
  title,
  hint,
  children
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-baseline gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#6D3A18] text-[11px] font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="text-base font-bold text-neutral-900">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
        </div>
      </div>
      {children}
    </section>);

}

export function KhoiTaoDuAnPage() {
  const navigate = useNavigate();
  const [tenDuAn, setTenDuAn] = useState('');
  const [driveLink, setDriveLink] = useState('');
  /** Cao tầng có tab Bảng hàng dạng lưới; thấp tầng chỉ có Quỹ căn (FR-40a). */
  const [loaiHinh, setLoaiHinh] = useState<'cao-tang' | 'thap-tang'>('cao-tang');

  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [ward, setWard] = useState('');

  const [investors, setInvestors] = useState<Investor[]>(DASHBOARD_INVESTORS);
  const [investor, setInvestor] = useState<Investor | undefined>();

  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverError, setCoverError] = useState('');

  const [showErrors, setShowErrors] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const wards = useMemo(() => getWards(province), [province]);
  const wardIsFreeText = province.length > 0 && !hasWardData(province);

  const trimmedDriveLink = driveLink.trim();
  const isDriveLinkValid = DRIVE_FOLDER_URL_PATTERN.test(trimmedDriveLink);

  const missing = {
    name: tenDuAn.trim().length === 0,
    drive: !isDriveLinkValid,
    investor: !investor,
    province: province.length === 0
  };
  const canSubmit = !Object.values(missing).some(Boolean) && !isSyncing;

  function handleProvinceChange(value: string) {
    setProvince(value);
    // Phường chỉ có nghĩa trong tỉnh của nó, đổi tỉnh là bỏ lựa chọn cũ.
    setWard('');
  }

  function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setCoverError('Chỉ nhận ảnh PNG hoặc JPG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverError('Ảnh nặng quá 5 MB, chọn ảnh nhẹ hơn.');
      return;
    }
    setCoverError('');
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') setCoverImageUrl(reader.result);
    });
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }
    setSyncError('');
    setIsSyncing(true);

    const project: ProjectDraft = {
      hierarchy: '',
      name: tenDuAn.trim(),
      propertyType: loaiHinh === 'cao-tang' ? 'Cao tầng' : 'Thấp tầng',
      address: address.trim(),
      province,
      ward,
      district: '',
      status: '',
      investorId: investor?.id,
      investorName: investor?.name,
      coverImageUrl
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
      // ProjectCmsPage tải lại được đúng dữ liệu này kể cả khi reload trang —
      // vì location.state của React Router bị mất khi tải lại.
      navigate(
        `/hoan-tat?projectId=${encodeURIComponent(data.projectId)}&loaiHinh=${loaiHinh}`,
        { state: { project } }
      );
    } catch (error) {
      setIsSyncing(false);
      setSyncError(
        error instanceof Error ?
        error.message :
        'Đồng bộ thất bại, vui lòng thử lại.'
      );
    }
  }

  const fullAddress = [address.trim(), ward, province].filter(Boolean).join(', ');

  return (
    <div className="min-h-full w-full bg-neutral-50 font-sans text-neutral-900">
      <header className="flex h-16 w-full items-center gap-2.5 border-b border-neutral-200 bg-white px-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Về trang chủ">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-[#6D3A18]">
            <span className="h-3 w-3 rotate-45 border-2 border-white" />
          </span>
          <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-[#173020] sm:text-xl">
            CENH<span className="text-[#f5881f]">O</span>MES
            <span className="align-super text-[9px] font-bold sm:text-[10px]">
              .VN
            </span>
          </span>
        </Link>
        <span className="h-6 w-px shrink-0 bg-neutral-300" aria-hidden="true" />
        <span className="hidden text-sm font-semibold text-neutral-700 sm:block">
          Khởi tạo dự án
        </span>
        <Link
          to="/dashboard?muc=du-an"
          className="ml-auto text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900">
          
          Dự án của tôi
        </Link>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">
          Tạo dự án mới
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Khai báo thông tin cơ bản và liên kết folder Drive đã chuẩn bị nội
          dung. Chi tiết còn lại chỉnh trong CMS ở bước sau.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          {/* Cột trái — biểu mẫu */}
          <div className="space-y-5">
            <Section
              step={1}
              title="Thông tin dự án"
              hint="Tên hiển thị trên trang công khai; loại hình quyết định cấu trúc tab.">
              
              <div>
                <label className={LABEL} htmlFor="ten-du-an">
                  Tên dự án <span className="text-orange-600">*</span>
                </label>
                <input
                  id="ten-du-an"
                  value={tenDuAn}
                  onChange={(event) => setTenDuAn(event.target.value)}
                  placeholder="Imperia Sky Park"
                  disabled={isSyncing}
                  className={FIELD} />
                
                {showErrors && missing.name &&
                <p className="mt-1 text-xs font-medium text-red-600">
                    Nhập tên dự án.
                  </p>
                }
              </div>

              <div className="mt-4">
                <span className={LABEL}>
                  Loại hình dự án <span className="text-orange-600">*</span>
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([
                  {
                    id: 'cao-tang',
                    label: 'Cao tầng',
                    hint: 'Chung cư — có tab Bảng hàng dạng lưới'
                  },
                  {
                    id: 'thap-tang',
                    label: 'Thấp tầng',
                    hint: 'Liền kề, biệt thự, shophouse — chỉ có Quỹ căn'
                  }] as
                  const).map((option) =>
                  <button
                    key={option.id}
                    type="button"
                    disabled={isSyncing}
                    onClick={() => setLoaiHinh(option.id)}
                    aria-pressed={loaiHinh === option.id}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors disabled:opacity-60 ${
                    loaiHinh === option.id ?
                    'border-[#6D3A18] bg-orange-50' :
                    'border-neutral-300 hover:bg-neutral-50'}`
                    }>
                    
                      <span className="block text-sm font-semibold text-neutral-800">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-neutral-500">
                        {option.hint}
                      </span>
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-500">
                  Đổi được cho tới khi nhập bảng hàng lần đầu, sau đó khóa.
                </p>
              </div>
            </Section>

            <Section
              step={2}
              title="Vị trí dự án"
              hint="Đơn vị hành chính hai cấp: Tỉnh / Thành phố rồi tới Phường / Xã.">
              
              <div>
                <label className={LABEL} htmlFor="dia-chi">
                  Địa chỉ
                </label>
                <input
                  id="dia-chi"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Số 4 Minh Khai, Khu đô thị Imperia"
                  disabled={isSyncing}
                  className={FIELD} />
                
                <p className="mt-1 text-[11px] text-neutral-500">
                  Số nhà, tên đường, tên khu. Nhập tự do.
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="tinh-thanh">
                    Tỉnh / Thành phố <span className="text-orange-600">*</span>
                  </label>
                  <select
                    id="tinh-thanh"
                    value={province}
                    onChange={(event) => handleProvinceChange(event.target.value)}
                    disabled={isSyncing}
                    className={FIELD}>
                    
                    <option value="">Chọn tỉnh / thành phố</option>
                    {PROVINCES.map((item) =>
                    <option key={item} value={item}>
                        {item}
                      </option>
                    )}
                  </select>
                  {showErrors && missing.province &&
                  <p className="mt-1 text-xs font-medium text-red-600">
                      Chọn tỉnh / thành phố.
                    </p>
                  }
                </div>

                <div>
                  <label className={LABEL} htmlFor="phuong-xa">
                    Phường / Xã
                  </label>
                  {wardIsFreeText ?
                  <input
                    id="phuong-xa"
                    value={ward}
                    onChange={(event) => setWard(event.target.value)}
                    placeholder="Nhập tên phường / xã"
                    disabled={isSyncing}
                    className={FIELD} /> :


                  <select
                    id="phuong-xa"
                    value={ward}
                    onChange={(event) => setWard(event.target.value)}
                    disabled={isSyncing || province.length === 0}
                    className={FIELD}>
                    
                      <option value="">
                        {province ? 'Chọn phường / xã' : 'Chọn tỉnh trước'}
                      </option>
                      {wards.map((item) =>
                    <option key={item} value={item}>
                          {item}
                        </option>
                    )}
                    </select>
                  }
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {wardIsFreeText ?
                    'Tỉnh này chưa có danh mục phường / xã trong bản prototype — nhập tay.' :
                    'Danh sách lọc theo tỉnh / thành phố đã chọn.'}
                  </p>
                </div>
              </div>
            </Section>

            <Section
              step={3}
              title="Chủ đầu tư"
              hint="Bản ghi dùng chung. Tìm trước khi thêm mới để tránh tạo trùng một doanh nghiệp.">
              
              <span className={LABEL}>
                Chọn chủ đầu tư <span className="text-orange-600">*</span>
              </span>
              <InvestorPicker
                investors={investors}
                value={investor}
                onChange={setInvestor}
                onCreate={(created) =>
                setInvestors((current) => [created, ...current])
                }
                invalid={showErrors && missing.investor} />
              
              {showErrors && missing.investor &&
              <p className="mt-1 text-xs font-medium text-red-600">
                  Chọn chủ đầu tư của dự án.
                </p>
              }
            </Section>

            <Section
              step={4}
              title="Ảnh đại diện dự án"
              hint="Ảnh thu nhỏ đại diện cho dự án trong danh sách và kết quả tìm kiếm.">
              
              <div className="flex flex-wrap items-start gap-4">
                <label className="grid h-[120px] w-[200px] cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition-colors hover:border-orange-300 hover:text-orange-500">
                  {coverImageUrl ?
                  <img
                    src={coverImageUrl}
                    alt="Ảnh đại diện dự án"
                    className="h-full w-full object-cover" /> :


                  <span className="flex flex-col items-center gap-1.5">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-xs font-semibold">Chọn ảnh</span>
                      <span className="text-[11px]">PNG hoặc JPG, tối đa 5 MB</span>
                    </span>
                  }
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleCoverUpload}
                    disabled={isSyncing}
                    className="sr-only" />
                  
                </label>

                <div className="flex-1 space-y-2 text-xs text-neutral-600">
                  <p>
                    Ảnh này tách khỏi băng ảnh đầu trang. Băng ảnh đầu trang vẫn
                    lấy từ thư mục Drive{' '}
                    <code className="rounded bg-neutral-100 px-1">
                      01. Tổng quan / Ảnh hero banner
                    </code>{' '}
                    và bị ghi đè mỗi lần đồng bộ lại.
                  </p>
                  {coverImageUrl &&
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
                    
                      <Trash2Icon className="h-3.5 w-3.5" />
                      Gỡ ảnh
                    </button>
                  }
                  {coverError &&
                  <p className="font-medium text-red-600">{coverError}</p>
                  }
                </div>
              </div>
            </Section>

            <Section
              step={5}
              title="Nội dung từ Google Drive"
              hint="Folder đã chuẩn bị sẵn ảnh và tài liệu theo quy ước thư mục.">
              
              <label className={LABEL} htmlFor="drive-link">
                Link folder Drive <span className="text-orange-600">*</span>
              </label>
              <input
                id="drive-link"
                value={driveLink}
                onChange={(event) => setDriveLink(event.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                disabled={isSyncing}
                className={FIELD} />
              
              {driveLink.length > 0 && !isDriveLinkValid &&
              <p className="mt-1 text-xs font-medium text-red-600">
                  Link chưa đúng định dạng folder Drive.
                </p>
              }
              {showErrors && driveLink.length === 0 &&
              <p className="mt-1 text-xs font-medium text-red-600">
                  Dán link folder Drive của dự án.
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
                  </a>{' '}
                  rồi chuẩn bị nội dung xong quay lại dán link — không cần làm
                  ngay bây giờ.
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
            </Section>
          </div>

          {/* Cột phải — bản xem trước, dính theo màn hình */}
          <aside className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <div className="relative h-[132px] bg-neutral-100">
                {coverImageUrl ?
                <img
                  src={coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover" /> :


                <span className="grid h-full w-full place-items-center text-xs text-neutral-400">
                    Chưa có ảnh đại diện
                  </span>
                }
                <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold text-neutral-700">
                  {loaiHinh === 'cao-tang' ? 'Cao tầng' : 'Thấp tầng'}
                </span>
              </div>

              <div className="p-4">
                <p className="text-base font-bold text-neutral-900">
                  {tenDuAn.trim() || 'Tên dự án'}
                </p>

                <p className="mt-2 flex items-start gap-1.5 text-xs text-neutral-600">
                  <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  {fullAddress || 'Chưa có địa chỉ'}
                </p>

                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-neutral-600">
                  <Building2Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  {investor?.name ?? 'Chưa chọn chủ đầu tư'}
                </p>

                <ul className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3">
                  {[
                  { label: 'Tên dự án', done: !missing.name },
                  { label: 'Tỉnh / Thành phố', done: !missing.province },
                  { label: 'Chủ đầu tư', done: !missing.investor },
                  { label: 'Link folder Drive', done: !missing.drive }].
                  map((item) =>
                  <li
                    key={item.label}
                    className="flex items-center gap-2 text-xs">
                    
                      <span
                      className={`h-1.5 w-1.5 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                      aria-hidden="true" />
                    
                      <span
                      className={item.done ? 'text-neutral-700' : 'text-neutral-400'}>
                      
                        {item.label}
                      </span>
                    </li>
                  )}
                </ul>

                {isSyncing &&
                <div className="mt-4 flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600">
                    <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-neutral-300 border-t-[#f5881f]" />
                    Đang đọc nội dung từ folder Drive…
                  </div>
                }

                {syncError &&
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                    {syncError}
                  </div>
                }

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSyncing}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300">
                  
                  {isSyncing ? 'Đang tạo dự án…' : 'Tạo dự án'}
                  {!isSyncing && <ArrowRightIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>);

}
