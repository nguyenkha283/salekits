import React from 'react';
import { MailIcon, PhoneIcon } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  initials: string;
}

/** Đội ngũ mẫu — bản thật lấy từ HRM theo mục 2.4 của SRS. */
const TEAM: TeamMember[] = [
{
  id: 'apm', name: 'Nguyễn Thị An', title: 'APM — Quản lý dự án',
  phone: '0912 448 207', email: 'an.nguyen@cenhomes.vn', initials: 'NA'
},
{
  id: 'gd', name: 'Lê Minh Hoàng', title: 'Quản lý giao dịch',
  phone: '0983 112 640', email: 'hoang.le@cenhomes.vn', initials: 'LH'
},
{
  id: 'tro-ly', name: 'Phạm Thu Trang', title: 'Trợ lý dự án',
  phone: '0977 305 118', email: 'trang.pham@cenhomes.vn', initials: 'PT'
},
{
  id: 'mkt', name: 'Đỗ Quang Huy', title: 'Marketing dự án',
  phone: '0968 774 921', email: 'huy.do@cenhomes.vn', initials: 'ĐH'
},
{
  id: 'hc', name: 'Vũ Hải Yến', title: 'Hành chính dự án',
  phone: '0932 660 507', email: 'yen.vu@cenhomes.vn', initials: 'VY'
},
{
  id: 'line', name: 'Trần Đức Thắng', title: 'Trưởng line 2',
  phone: '0905 218 334', email: 'thang.tran@cenhomes.vn', initials: 'TT'
}];


export function TeamContent() {
  return (
    <section
      data-cms-section="team"
      data-cms-label="Đội ngũ dự án"
      aria-labelledby="team-title">

      <h2
        id="team-title"
        className="text-xl font-bold uppercase tracking-wide text-[#4a3728]">

        Đội ngũ dự án
      </h2>
      <p className="mt-1.5 text-sm text-stone-500">
        Thông tin đồng bộ từ HRM. Chỉ hiển thị với người dùng nội bộ.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM.map((member) =>
        <article
          key={member.id}
          className="flex items-start gap-3 rounded-lg border border-[#e9e1d5] bg-white p-4">

            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f3ece1] text-sm font-bold text-[#8a6a3f]">
              {member.initials}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[14px] font-bold text-[#3b2c1d]">
                {member.name}
              </h3>
              <p className="mt-0.5 text-[12px] text-stone-500">{member.title}</p>
              <div className="mt-2.5 space-y-1">
                <a
                href={`tel:${member.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-1.5 text-[12px] text-stone-600 transition-colors hover:text-[#f5921f]">

                  <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-[#b08e5c]" />
                  {member.phone}
                </a>
                <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-1.5 text-[12px] text-stone-600 transition-colors hover:text-[#f5921f]">

                  <MailIcon className="h-3.5 w-3.5 shrink-0 text-[#b08e5c]" />
                  <span className="truncate">{member.email}</span>
                </a>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>);

}
