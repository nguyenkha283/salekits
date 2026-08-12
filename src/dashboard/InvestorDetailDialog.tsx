import React from 'react';
import {
  BuildingIcon,
  CalendarDaysIcon,
  EyeOffIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
  UserRoundIcon,
  XIcon } from
'lucide-react';
import type { Investor } from '../types/investor';
import type { ProjectContact } from './contactData';
import type { DashboardProject } from './dashboardData';
import {
  canSeeContacts,
  projectsOfContact,
  visibleContacts,
  type ContactScopeInput,
  type DashboardRole } from
'./roles';

interface InvestorDetailDialogProps {
  investor: Investor;
  contacts: ProjectContact[];
  projects: DashboardProject[];
  role: DashboardRole;
  userId: string;
  lineId: string;
  onClose: () => void;
}

/**
 * Chi tiết một chủ đầu tư.
 *
 * Danh sách đầu mối lọc theo FR-CDT-11: Ban lãnh đạo thấy toàn bộ, Trưởng line
 * chỉ thấy đầu mối gắn với dự án trong line mình, nhóm Người tạo dự án chỉ thấy
 * đầu mối của dự án mình tạo hoặc do chính mình tạo. Quản lý giao dịch và
 * Marketing không thấy gì.
 */
export function InvestorDetailDialog({
  investor,
  contacts,
  projects,
  role,
  userId,
  lineId,
  onClose
}: InvestorDetailDialogProps) {
  const scope: ContactScopeInput = { role, userId, lineId, projects };

  const ofInvestor = contacts.filter(
    (contact) => contact.investorId === investor.id
  );
  const visible = visibleContacts(ofInvestor, scope);
  const hidden = ofInvestor.length - visible.length;

  const investorProjects = projects.filter(
    (project) => project.investorId === investor.id
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-900/50 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết ${investor.name}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#f6efe6] text-sm font-bold text-[#6D3A18]">
              {investor.logoUrl ?
              <img
                src={investor.logoUrl}
                alt=""
                className="h-full w-full rounded-lg object-contain p-1" /> :


              investor.code.slice(0, 2).toUpperCase()
              }
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-neutral-900">
                {investor.name}
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                {investor.code} · {investorProjects.length} dự án ·{' '}
                {investor.status}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
            
            <XIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[calc(100vh-12rem)] space-y-6 overflow-y-auto px-6 py-5">
          <section>
            <p className="text-sm leading-relaxed text-neutral-700">
              {investor.description}
            </p>
            <dl className="mt-3 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
              {investor.address &&
              <div className="flex items-start gap-1.5">
                  <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <dd>{investor.address}</dd>
                </div>
              }
              {investor.website &&
              <div className="flex items-start gap-1.5">
                  <GlobeIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <dd className="truncate">{investor.website}</dd>
                </div>
              }
              {investor.foundedYear &&
              <div className="flex items-start gap-1.5">
                  <CalendarDaysIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <dd>Thành lập {investor.foundedYear}</dd>
                </div>
              }
              {investor.taxCode &&
              <div className="flex items-start gap-1.5">
                  <BuildingIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <dd>MST {investor.taxCode}</dd>
                </div>
              }
            </dl>
          </section>

          {/* Đầu mối liên hệ */}
          <section>
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-bold text-neutral-900">
                Đầu mối liên hệ
              </h3>
              <span className="text-xs text-neutral-500">
                {canSeeContacts(role) ?
                `${visible.length} đầu mối trong phạm vi của bạn` :
                'Không thuộc phạm vi vai trò này'}
              </span>
            </div>

            {!canSeeContacts(role) &&
            <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-xs text-neutral-600">
                <EyeOffIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                <p>
                  Đầu mối liên hệ chỉ hiển thị với nhóm Người tạo dự án, Trưởng
                  line, Ban lãnh đạo và Admin. Vai trò{' '}
                  <span className="font-semibold text-neutral-800">{role}</span>{' '}
                  không xem được, kể cả khi thuộc đội ngũ dự án.
                </p>
              </div>
            }

            {canSeeContacts(role) && visible.length === 0 &&
            <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-4 text-center text-xs text-neutral-500">
                Chưa có đầu mối nào trong phạm vi của bạn.
              </p>
            }

            {visible.length > 0 &&
            <ul className="space-y-2">
                {visible.map((contact) => {
                const linked = projectsOfContact(contact.id, scope);
                return (
                  <li
                    key={contact.id}
                    className="rounded-lg border border-neutral-200 p-3.5">
                    
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f6efe6] text-[#6D3A18]">
                          <UserRoundIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-neutral-900">
                            {contact.name}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                            <span className="inline-flex items-center gap-1 font-medium text-neutral-700">
                              <PhoneIcon className="h-3 w-3" />
                              {contact.phone}
                            </span>
                            {contact.dob &&
                          <>
                                <span aria-hidden="true">·</span>
                                <span>
                                  Sinh{' '}
                                  {contact.dob.split('-').reverse().join('/')}
                                </span>
                              </>
                          }
                            {contact.createdBy === userId &&
                          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-semibold text-orange-700">
                                Tôi tạo
                              </span>
                          }
                          </p>
                          {contact.note &&
                        <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                              {contact.note}
                            </p>
                        }
                        </div>
                      </div>

                      <div className="mt-3 border-t border-neutral-100 pt-2.5">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                          Dự án gắn với đầu mối này
                        </p>
                        {linked.length === 0 ?
                      <p className="text-xs text-neutral-500">
                            Chưa gắn dự án nào trong phạm vi của bạn.
                          </p> :

                      <ul className="flex flex-wrap gap-1.5">
                            {linked.map((project) =>
                        <li
                          key={project.id}
                          className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                          
                                {project.name}
                                <span className="ml-1.5 text-neutral-500">
                                  {project.code}
                                </span>
                              </li>
                        )}
                          </ul>
                      }
                      </div>
                    </li>);

              })}
              </ul>
            }

            {canSeeContacts(role) && hidden > 0 &&
            <p className="mt-2 text-[11px] text-neutral-500">
                Còn {hidden} đầu mối của chủ đầu tư này nằm ngoài phạm vi vai trò{' '}
                {role}.
              </p>
            }
          </section>

          {/* Dự án của chủ đầu tư */}
          <section>
            <h3 className="mb-2.5 text-sm font-bold text-neutral-900">
              Dự án của chủ đầu tư
            </h3>
            {investorProjects.length === 0 ?
            <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3.5 py-4 text-center text-xs text-neutral-500">
                Chưa có dự án nào tham chiếu tới chủ đầu tư này.
              </p> :

            <ul className="divide-y divide-neutral-100 overflow-hidden rounded-lg border border-neutral-200">
                {investorProjects.map((project) =>
              <li
                key={project.id}
                className="flex items-center gap-3 px-3.5 py-2.5">
                
                    <img
                  src={project.coverUrl}
                  alt=""
                  className="h-9 w-14 shrink-0 rounded object-cover" />
                
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-neutral-900">
                        {project.name}
                      </span>
                      <span className="block text-xs text-neutral-500">
                        {project.code} · {project.propertyType}
                      </span>
                    </span>
                  </li>
              )}
              </ul>
            }
          </section>
        </div>
      </div>
    </div>);

}
