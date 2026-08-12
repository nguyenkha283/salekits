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
import { ContactPicker } from '../dashboard/ContactPicker';
import { DEMO_CONTACTS, type ProjectContact } from '../dashboard/contactData';
import { DASHBOARD_INVESTORS } from '../dashboard/dashboardData';

/**
 * URL Web App Apps Script, lấy từ biến môi trường VITE_DRIVE_WEBAPP_URL.
 * Trên Vercel: Project Settings > Environment Variables > thêm biến này.
 */
const DRIVE_WEBAPP_URL = import.meta.env.VITE_DRIVE_WEBAPP_URL ?? '';

const isWebAppConfigured = DRIVE_WEBAPP_URL.length > 0;

const DRIVE_FOLDER_URL_PATTERN =
/^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/;

const LABEL = 'mb-1.5 block text-xs font-semibold text-neutral-700';
const FIELD =
'w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-100';

function Card({
  title,
  hint,
  children
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-3.5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-800">
          {title}
        </h2>
        {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
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

  const [contacts, setContacts] = useState<ProjectContact[]>(DEMO_CONTACTS);
  const [contact, setContact] = useState<ProjectContact | undefined>();

  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverError, setCoverError] = useState('');

  const [showErrors, setShowErrors] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const wards = useMemo(() => getWards(province), [province]);
  const wardIsFreeText = province.length > 0 && !hasWardData(province);

  const trimmedDriveLink = driveLink.trim();
  const hasDriveLink = trimmedDriveLink.length > 0;
  const isDriveLinkValid = DRIVE_FOLDER_URL_PATTERN.test(trimmedDriveLink);

  /** Link Drive KHÔNG bắt buộc — bỏ trống thì vào CMS trắng, liên kết sau. */
  const missing = {
    name: tenDuAn.trim().length === 0,
    province: province.length === 0,
    investor: !investor
  };
  const driveLinkBroken = hasDriveLink && !isDriveLinkValid;
  const canSubmit =
  !Object.values(missing).some(Boolean) && !driveLinkBroken && !isSyncing;

  function handleProvinceChange(value: string) {
    setProvince(value);
    // Phường chỉ có nghĩa trong tỉnh của nó, đổi tỉnh là bỏ lựa chọn cũ.
    setWard('');
  }

  function handleInvestorChange(next?: Investor) {
    setInvestor(next);
    // Đầu mối là người của chủ đầu tư, đổi chủ đầu tư thì đầu mối cũ hết đúng.
    if (next?.id !== investor?.id) setContact(undefined);
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

  function buildDraft(): ProjectDraft {
    return {
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
      contactId: contact?.id,
      contactName: contact?.name,
      contactPhone: contact?.phone,
      coverImageUrl
    };
  }

  async function handleSubmit() {
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }
    setSyncError('');
    const project = buildDraft();

    // Không có link Drive thì không gọi đồng bộ — vào thẳng CMS trắng.
    if (!hasDriveLink) {
      navigate(`/hoan-tat?loaiHinh=${loaiHinh}&nguon=trong`, {
        state: { project }
      });
      return;
    }

    setIsSyncing(true);
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
      // ProjectCmsPage tải lại được đúng dữ liệu này kể cả khi reload trang.
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
      <header className="flex h-14 w-full items-center gap-2.5 border-b border-neutral-200 bg-white px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Về trang chủ">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] bg-[#6D3A18]">
            <span className="h-3 w-3 rotate-45 border-2 border-white" />
          </span>
          <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-[#173020] sm:text-lg">
            CENH<span className="text-[#f5881f]">O</span>MES
            <span className="align-super text-[9px] font-bold">.VN</span>
          </span>
        </Link>
        <span className="h-6 w-px shrink-0 bg-neutral-300" aria-hidden="true" />
        <span className="text-sm font-semibold text-neutral-700">
          Khởi tạo dự án
        </span>
        <Link
          to="/dashboard?muc=du-an"
          className="ml-auto text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900">
          
          Dự án của tôi
        </Link>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Cột trái — biểu mẫu, hai cột bên trong để bớt phải lăn chuột */}
          <div className="space-y-5">
            <Card title="Thông tin dự án">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
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

                <div className="sm:col-span-2">
                  <span className={LABEL}>
                    Loại hình <span className="text-orange-600">*</span>
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
                      hint: 'Liền kề, biệt thự — chỉ có Quỹ căn'
                    }] as
                    const).map((option) =>
                    <button
                      key={option.id}
                      type="button"
                      disabled={isSyncing}
                      onClick={() => setLoaiHinh(option.id)}
                      aria-pressed={loaiHinh === option.id}
                      className={`rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-60 ${
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
                </div>

                <div className="sm:col-span-2">
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
                  
                </div>

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
                </div>
              </div>
            </Card>

            <Card
              title="Chủ đầu tư"
              hint="Bản ghi dùng chung. Tìm trước khi thêm mới để tránh tạo trùng một doanh nghiệp.">
              
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <span className={LABEL}>
                    Chọn chủ đầu tư <span className="text-orange-600">*</span>
                  </span>
                  <InvestorPicker
                    investors={investors}
                    value={investor}
                    onChange={handleInvestorChange}
                    onCreate={(created) =>
                    setInvestors((current) => [created, ...current])
                    }
                    onCreateContact={(created) =>
                    setContacts((current) => [created, ...current])
                    }
                    contacts={contacts}
                    invalid={showErrors && missing.investor} />
                  
                  {showErrors && missing.investor &&
                  <p className="mt-1 text-xs font-medium text-red-600">
                      Chọn chủ đầu tư của dự án.
                    </p>
                  }
                </div>

                <div>
                  <span className={LABEL}>Đầu mối liên hệ</span>
                  <ContactPicker
                    investorId={investor?.id}
                    investorName={investor?.name}
                    contacts={contacts}
                    value={contact}
                    onChange={setContact}
                    onCreate={(created) =>
                    setContacts((current) => [created, ...current])
                    } />
                  
                </div>
              </div>
            </Card>

            <Card title="Ảnh đại diện và nội dung">
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <span className={LABEL}>Ảnh đại diện dự án</span>
                  <div className="flex items-start gap-3">
                    <label className="grid h-[84px] w-[132px] shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-neutral-400 transition-colors hover:border-orange-300 hover:text-orange-500">
                      {coverImageUrl ?
                      <img
                        src={coverImageUrl}
                        alt="Ảnh đại diện dự án"
                        className="h-full w-full object-cover" /> :


                      <span className="flex flex-col items-center gap-1">
                          <ImageIcon className="h-5 w-5" />
                          <span className="text-[11px] font-semibold">
                            Chọn ảnh
                          </span>
                        </span>
                      }
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleCoverUpload}
                        disabled={isSyncing}
                        className="sr-only" />
                      
                    </label>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-[11px] leading-snug text-neutral-500">
                        PNG hoặc JPG, tối đa 5 MB. Ảnh này tách khỏi băng ảnh đầu
                        trang — băng ảnh đầu trang vẫn lấy từ Drive.
                      </p>
                      {coverImageUrl &&
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl('')}
                        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
                        
                          <Trash2Icon className="h-3 w-3" />
                          Gỡ ảnh
                        </button>
                      }
                      {coverError &&
                      <p className="text-[11px] font-medium text-red-600">
                          {coverError}
                        </p>
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <label className={LABEL} htmlFor="drive-link">
                    Link folder Drive{' '}
                    <span className="font-normal text-neutral-500">
                      — không bắt buộc
                    </span>
                  </label>
                  <input
                    id="drive-link"
                    value={driveLink}
                    onChange={(event) => setDriveLink(event.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    disabled={isSyncing}
                    className={FIELD} />
                  
                  {driveLinkBroken &&
                  <p className="mt-1 text-xs font-medium text-red-600">
                      Link chưa đúng định dạng folder Drive. Xóa trắng nếu chưa
                      có folder.
                    </p>
                  }
                  {!hasDriveLink &&
                  <p className="mt-1.5 rounded-md bg-neutral-50 px-2.5 py-2 text-[11px] leading-snug text-neutral-600">
                      Bỏ trống thì dự án vào thẳng CMS với nội dung trống, liên
                      kết Drive và đồng bộ sau cũng được.
                    </p>
                  }
                  {isWebAppConfigured && hasDriveLink &&
                  <p className="mt-1.5 text-[11px] text-neutral-500">
                      Chưa có folder?{' '}
                      <a
                      href={DRIVE_WEBAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#f5881f] hover:underline">
                      
                        Tạo folder chuẩn
                        <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </p>
                  }
                </div>
              </div>
            </Card>
          </div>

          {/* Cột phải — xem trước và nút tạo, dính theo màn hình */}
          <aside className="lg:sticky lg:top-5">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <div className="relative h-[112px] bg-neutral-100">
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
                  {
                    label: hasDriveLink ?
                    'Link folder Drive' :
                    'Drive — để sau cũng được',
                    done: hasDriveLink && !driveLinkBroken,
                    optional: true
                  }].
                  map((item) =>
                  <li key={item.label} className="flex items-center gap-2 text-xs">
                      <span
                      className={`h-1.5 w-1.5 rounded-full ${
                      item.done ?
                      'bg-emerald-500' :
                      item.optional ?
                      'bg-neutral-200' :
                      'bg-neutral-300'}`
                      }
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
