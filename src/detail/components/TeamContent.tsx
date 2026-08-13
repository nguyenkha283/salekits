import React, { useEffect, useState } from 'react';
import {
  CheckIcon,
  LoaderIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon } from
'lucide-react';
import {
  MARKETING_DEPARTMENT,
  SALES_DEPARTMENT,
  lookupEmployee,
  type Department,
  type Employee } from
'../../data/hrm';
import type { TeamAssignment } from '../../app/workflowStore';

interface TeamContentProps {
  projectName: string;
  team: TeamAssignment;
  /** APM sửa được nhóm phụ trách dự án (APM, Trợ lý, Hành chính). */
  canEditRoster: boolean;
  /** Trưởng phòng QLGD gán được nhân sự phòng Quản lý giao dịch. */
  canAssignSales: boolean;
  /** Trưởng phòng Marketing gán được nhân sự phòng Marketing. */
  canAssignMarketing: boolean;
  onChange: (patch: Partial<TeamAssignment>) => void;
  onToggleAssignment: (
  group: 'salesCodes' | 'marketingCodes',
  code: string)
  => void;
}

/**
 * Đội ngũ dự án — UC-05.
 *
 * Trưởng line gắn tự động từ HRM theo line của dự án. APM, Trợ lý dự án và
 * Hành chính dự án nhập bằng mã nhân viên rồi hệ thống tự điền thông tin; APM
 * sửa nhóm này. Quản lý giao dịch và Marketing hiển thị dạng cây theo phòng;
 * người gán là trưởng phòng tương ứng, mỗi người chỉ gán trong phòng mình.
 *
 * Vai trò chỉ xem không thấy cây phòng ban đầy đủ — chỉ thấy những người đã
 * được gán vào dự án.
 */
export function TeamContent({
  projectName,
  team,
  canEditRoster,
  canAssignSales,
  canAssignMarketing,
  onChange,
  onToggleAssignment
}: TeamContentProps) {
  // Nhóm phụ trách: người chỉ xem chỉ thấy vị trí đã có người.
  const rosterVisible =
  canEditRoster || team.apm || team.assistant || team.admin;

  return (
    <section
      data-cms-section="team"
      data-cms-label="Đội ngũ dự án"
      aria-labelledby="team-title">
      
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a08b6c]">
        Đội ngũ dự án
      </p>
      <h2
        id="team-title"
        className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-[#3b2c1d]">
        
        {projectName || 'Dự án chưa đặt tên'}
      </h2>
      <p className="mt-1.5 text-sm text-stone-500">
        Thông tin nhân sự đồng bộ từ HRM. Chỉ hiển thị với người dùng nội bộ.
      </p>

      {/* Trưởng line — gắn tự động, không sửa được */}
      <TeamGroup title="Trưởng line" note="Gắn tự động theo line của dự án">
        <PersonCard person={team.lineLeader} locked />
      </TeamGroup>

      {rosterVisible &&
      <TeamGroup
        title="Người phụ trách dự án"
        note={
        canEditRoster ?
        'Nhập mã nhân viên, hệ thống tự điền thông tin từ HRM' :
        undefined
        }>
        
        <div className="grid gap-3 lg:grid-cols-3">
          {(canEditRoster || team.apm) &&
          <EmployeeSlot
            label="APM"
            person={team.apm}
            editable={canEditRoster}
            onPick={(person) => onChange({ apm: person })} />
          }
          {(canEditRoster || team.assistant) &&
          <EmployeeSlot
            label="Trợ lý dự án"
            person={team.assistant}
            editable={canEditRoster}
            onPick={(person) => onChange({ assistant: person })} />
          }
          {(canEditRoster || team.admin) &&
          <EmployeeSlot
            label="Hành chính dự án"
            person={team.admin}
            editable={canEditRoster}
            onPick={(person) => onChange({ admin: person })} />
          }
        </div>
      </TeamGroup>
      }

      <DepartmentTree
        department={SALES_DEPARTMENT}
        assigned={team.salesCodes}
        canAssign={canAssignSales}
        onToggle={(code) => onToggleAssignment('salesCodes', code)} />
      

      <DepartmentTree
        department={MARKETING_DEPARTMENT}
        assigned={team.marketingCodes}
        canAssign={canAssignMarketing}
        onToggle={(code) => onToggleAssignment('marketingCodes', code)} />
      
    </section>);

}

function TeamGroup({
  title,
  note,
  children
}: {title: string;note?: string;children: React.ReactNode;}) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-base font-bold text-[#3b2c1d]">{title}</h3>
        {note && <p className="text-xs text-stone-500">{note}</p>}
      </div>
      {children}
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  const last = parts[parts.length - 1][0] ?? '';
  const first = parts[0][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

function PersonCard({
  person,
  locked = false,
  onClear
}: {person: Employee;locked?: boolean;onClear?: () => void;}) {
  return (
    <article className="relative flex items-start gap-3 rounded-lg border border-[#e9e1d5] bg-white p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f3ece1] text-sm font-bold text-[#8a6a3f]">
        {initialsOf(person.name)}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[14px] font-bold text-[#3b2c1d]">
          {person.name}
        </h4>
        <p className="mt-0.5 text-[12px] text-stone-500">
          {person.title} · {person.code}
        </p>
        <div className="mt-2.5 space-y-1 text-[12px] text-stone-600">
          <p className="flex items-center gap-1.5">
            <PhoneIcon className="h-3.5 w-3.5 text-stone-400" />
            {person.phone}
          </p>
          <p className="flex items-center gap-1.5">
            <MailIcon className="h-3.5 w-3.5 text-stone-400" />
            <span className="truncate">{person.email}</span>
          </p>
        </div>
      </div>
      {onClear && !locked &&
      <button
        type="button"
        onClick={onClear}
        aria-label={`Bỏ ${person.name} khỏi vị trí này`}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700">
        
          <XIcon className="h-4 w-4" />
        </button>
      }
    </article>);

}

interface EmployeeSlotProps {
  label: string;
  person?: Employee;
  editable: boolean;
  onPick: (person: Employee | undefined) => void;
}

/** Một vị trí trong đội ngũ: nhập mã nhân viên rồi tra HRM. */
function EmployeeSlot({ label, person, editable, onPick }: EmployeeSlotProps) {
  const [code, setCode] = useState('');
  const [found, setFound] = useState<Employee | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const key = code.trim();
    if (key.length < 3) {
      setFound(null);
      setNotFound(false);
      setIsLooking(false);
      return;
    }
    const controller = new AbortController();
    setIsLooking(true);
    const timer = setTimeout(() => {
      lookupEmployee(key, controller.signal).
      then((result) => {
        setFound(result);
        setNotFound(result === null);
        setIsLooking(false);
      }).
      catch(() => {/* lệnh bị hủy vì người dùng gõ tiếp */});
    }, 220);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [code]);

  if (person) {
    return (
      <div>
        <p className="mb-1.5 text-xs font-semibold text-stone-600">{label}</p>
        <PersonCard
          person={person}
          onClear={
          editable ?
          () => {
            onPick(undefined);
            setCode('');
          } :
          undefined
          } />
        
      </div>);

  }

  if (!editable) {
    return (
      <div>
        <p className="mb-1.5 text-xs font-semibold text-stone-600">{label}</p>
        <p className="rounded-lg border border-dashed border-[#d8cab4] bg-[#faf6ef] px-4 py-6 text-center text-xs text-[#a08b6c]">
          Chưa có người đảm nhiệm
        </p>
      </div>);

  }

  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-semibold text-stone-600"
        htmlFor={`slot-${label}`}>
        
        {label}
      </label>
      <div className="rounded-lg border border-dashed border-[#d8cab4] bg-[#faf6ef] p-3">
        <div className="relative">
          <input
            id={`slot-${label}`}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Nhập mã nhân viên, ví dụ NV-2087"
            className="w-full rounded-md border border-[#d8cab4] bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100" />
          
          {isLooking &&
          <LoaderIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-stone-400" />
          }
        </div>

        {found &&
        <div className="mt-2.5 rounded-md border border-emerald-200 bg-emerald-50 p-2.5">
            <p className="text-sm font-semibold text-neutral-900">{found.name}</p>
            <p className="text-xs text-stone-600">
              {found.title} · {found.phone}
            </p>
            <button
            type="button"
            onClick={() => {
              onPick(found);
              setCode('');
              setFound(null);
            }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700">
            
              <CheckIcon className="h-3.5 w-3.5" />
              Chọn người này
            </button>
          </div>
        }

        {notFound && !isLooking &&
        <p className="mt-2 text-xs font-medium text-red-600">
            Không tìm thấy nhân viên với mã này trong HRM.
          </p>
        }
      </div>
    </div>);

}

interface DepartmentTreeProps {
  department: Department;
  assigned: string[];
  /** Trưởng phòng của phòng này gán được nhân sự vào dự án. */
  canAssign: boolean;
  onToggle: (code: string) => void;
}

/**
 * Cây phòng ban: trưởng phòng ở trên, nhân viên bên dưới.
 *
 * Trưởng phòng cũng có thể tự gán mình vào dự án. Người có quyền gán thấy toàn
 * bộ phòng để chọn; người chỉ xem chỉ thấy những ai đã được gán.
 */
function DepartmentTree({
  department,
  assigned,
  canAssign,
  onToggle
}: DepartmentTreeProps) {
  const managerAssigned = assigned.includes(department.manager.code);
  const visibleStaff = canAssign ?
  department.staff :
  department.staff.filter((person) => assigned.includes(person.code));
  const showManagerRow = canAssign || managerAssigned;

  // Người chỉ xem mà phòng chưa có ai được gán thì không hiện cây rỗng.
  if (!showManagerRow && visibleStaff.length === 0) return null;

  return (
    <TeamGroup
      title={department.name}
      note={`${assigned.length} người đã gán vào dự án`}>
      
      <div className="overflow-hidden rounded-lg border border-[#e9e1d5] bg-white">
        {/* Trưởng phòng — cũng gán được vào dự án */}
        {showManagerRow &&
        <div className="flex items-center gap-3 border-b border-[#e9e1d5] bg-[#faf6ef] px-4 py-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#6D3A18] text-xs font-bold text-white">
              {initialsOf(department.manager.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#3b2c1d]">
                {department.manager.name}
              </p>
              <p className="text-xs text-stone-500">
                {department.manager.title} · {department.manager.phone}
              </p>
            </div>
            <AssignControl
            isAssigned={managerAssigned}
            canAssign={canAssign}
            onToggle={() => onToggle(department.manager.code)} />
          
          </div>
        }

        {/* Nhân viên trong phòng */}
        <ul className="divide-y divide-[#f0e9de]">
          {visibleStaff.map((person) => {
            const isAssigned = assigned.includes(person.code);
            return (
              <li
                key={person.code}
                className="flex items-center gap-3 py-3 pl-8 pr-4">
                
                <span className="text-stone-300" aria-hidden="true">
                  └
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f3ece1] text-[11px] font-bold text-[#8a6a3f]">
                  {initialsOf(person.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#3b2c1d]">
                    {person.name}
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    {person.title} · {person.code} · {person.phone}
                  </p>
                </div>
                <AssignControl
                  isAssigned={isAssigned}
                  canAssign={canAssign}
                  onToggle={() => onToggle(person.code)} />
                
              </li>);

          })}
        </ul>
      </div>
    </TeamGroup>);

}

/**
 * Nút gán và tag trạng thái của một người trong phòng ban.
 *
 * Người gán thấy: nút Gán vào dự án khi chưa gán, hoặc tag Đã gán kèm nút thùng
 * rác để loại bỏ. Người chỉ xem thấy tag Trong đội ngũ, không thao tác được.
 * Người đã loại bỏ vẫn gán lại được vì nút Gán quay lại ngay sau đó.
 */
function AssignControl({
  isAssigned,
  canAssign,
  onToggle
}: {isAssigned: boolean;canAssign: boolean;onToggle: () => void;}) {
  if (!canAssign) {
    if (!isAssigned) return null;
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <UserRoundIcon className="h-3.5 w-3.5" />
        Trong đội ngũ
      </span>);

  }

  if (isAssigned) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 py-1 pl-2.5 pr-1 text-xs font-semibold text-emerald-700">
        <CheckIcon className="h-3.5 w-3.5" />
        Đã gán
        <button
          type="button"
          onClick={onToggle}
          aria-label="Loại khỏi dự án"
          title="Loại khỏi dự án"
          className="ml-0.5 grid h-6 w-6 place-items-center rounded text-emerald-700 transition-colors hover:bg-red-100 hover:text-red-600">
          
          <Trash2Icon className="h-3.5 w-3.5" />
        </button>
      </span>);

  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#d8cab4] px-3 py-1.5 text-xs font-semibold text-[#6D3A18] transition-colors hover:bg-[#faf6ef]">
      
      <PlusIcon className="h-3.5 w-3.5" />
      Gán vào dự án
    </button>);

}
