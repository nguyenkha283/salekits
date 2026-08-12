import React from 'react';
import { MailIcon, PhoneIcon } from 'lucide-react';
import { EmptySlot } from './EmptySlot';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  initials: string;
}

interface TeamContentProps {
  /** Đội ngũ lấy từ HRM theo mục 2.4 của SRS. */
  members?: TeamMember[];
}

export function TeamContent({ members }: TeamContentProps = {}) {
  const TEAM = members ?? [];
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

      {TEAM.length === 0 &&
      <EmptySlot
        variant="content"
        label="Chưa có thành viên nào"
        className="mt-6 min-h-[180px] rounded-lg" />

      }

      {TEAM.length > 0 &&
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
      }
    </section>);

}
