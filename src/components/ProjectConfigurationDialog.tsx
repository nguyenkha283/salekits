import React, { useEffect, useState, useRef } from 'react';
import {
  Building2Icon,
  CheckIcon,
  ChevronDownIcon,
  CircleUserRoundIcon,
  FileImageIcon,
  HandshakeIcon,
  PackageIcon,
  PlusIcon,
  Settings2Icon,
  Trash2Icon,
  UsersRoundIcon,
  XIcon } from
'lucide-react';
import {
  ConfigTeamRole,
  ProjectConfiguration,
  ProjectDraft,
  ProjectTeamMember } from
'../types/project';
import { CmsRole } from '../types/cms';
type ConfigurationSection =
'general' |
'project' |
'product' |
'team' |
'partners';
type PartnerField = 'contractorManager' | 'constructionManager';
interface ProjectConfigurationDialogProps {
  configuration: ProjectConfiguration;
  project: ProjectDraft;
  role: CmsRole;
  onChange: (configuration: ProjectConfiguration) => void;
  onSave: () => void;
  onClose: () => void;
}
interface DemoProject {
  code: string;
  name: string;
}
interface DemoEmployee {
  code: string;
  name: string;
  title: string;
}
const DEMO_PROJECTS: DemoProject[] = [
{
  code: 'CHV-2401',
  name: 'Vinhomes Ocean Park 3'
},
{
  code: 'CHV-2402',
  name: 'The Matrix One'
},
{
  code: 'CHV-2403',
  name: 'Masteri Waterfront'
},
{
  code: 'CHH-2401',
  name: 'The Global City'
},
{
  code: 'CHH-2402',
  name: 'Eaton Park'
},
{
  code: 'CHD-2401',
  name: 'The Filmore Da Nang'
},
{
  code: 'CHP-2401',
  name: 'The Marq Hải Phòng'
},
{
  code: 'CHQ-2401',
  name: 'Sun Grand City Quảng Ninh'
},
{
  code: 'CHB-2401',
  name: 'Grand Marina Saigon'
},
{
  code: 'CHN-2401',
  name: 'Nobu Danang'
}];

const DEMO_EMPLOYEES: DemoEmployee[] = [
{
  code: 'MS002401',
  name: 'Nguyễn Minh Anh',
  title: 'Chuyên viên phát triển dự án'
},
{
  code: 'MS002402',
  name: 'Trần Quốc Bảo',
  title: 'Quản lý kinh doanh'
},
{
  code: 'MS002403',
  name: 'Lê Thu Hà',
  title: 'Chuyên viên Marketing'
},
{
  code: 'MS002404',
  name: 'Phạm Đức Long',
  title: 'Trưởng nhóm kinh doanh'
},
{
  code: 'MS002405',
  name: 'Đỗ Hải Yến',
  title: 'Chuyên viên vận hành'
},
{
  code: 'MS002406',
  name: 'Vũ Hoàng Nam',
  title: 'Chuyên viên phát triển dự án'
},
{
  code: 'MS002407',
  name: 'Bùi Khánh Linh',
  title: 'Quản lý Marketing'
},
{
  code: 'MS002408',
  name: 'Hoàng Gia Huy',
  title: 'Chuyên viên kinh doanh'
},
{
  code: 'MS002409',
  name: 'Ngô Phương Thảo',
  title: 'Chuyên viên đối tác'
},
{
  code: 'MS002410',
  name: 'Đặng Nhật Minh',
  title: 'Quản lý dự án'
}];

const DEMO_PARTNERS = [
'Coteccons Construction JSC',
'Hòa Bình Construction Group',
'Unicons Investment Construction',
'Ricons Construction Investment',
'Delta Group',
'Viettel Construction',
'An Phong Construction',
'Central Construction JSC',
'Newtecons Construction',
'Tập đoàn Xây dựng Hưng Thịnh Incons'];

const WARDS_BY_PROVINCE: Record<string, string[]> = {
  'Hà Nội': [
  'Phường Ba Đình',
  'Phường Cầu Giấy',
  'Phường Tây Hồ',
  'Phường Hoàn Kiếm'],

  'TP. Hồ Chí Minh': [
  'Phường Bến Thành',
  'Phường Thảo Điền',
  'Phường Tân Định',
  'Phường An Khánh'],

  'Đà Nẵng': [
  'Phường Hải Châu',
  'Phường An Hải',
  'Phường Hòa Xuân',
  'Phường Mỹ An'],

  'Hải Phòng': [
  'Phường Lê Chân',
  'Phường Ngô Quyền',
  'Phường Hồng Bàng',
  'Phường Hải An'],

  'Quảng Ninh': [
  'Phường Hạ Long',
  'Phường Bãi Cháy',
  'Phường Móng Cái',
  'Phường Cẩm Phả']

};
const PROVINCES = [
'An Giang',
'Bà Rịa - Vũng Tàu',
'Bắc Giang',
'Bắc Kạn',
'Bạc Liêu',
'Bắc Ninh',
'Bến Tre',
'Bình Định',
'Bình Dương',
'Bình Phước',
'Bình Thuận',
'Cà Mau',
'Cần Thơ',
'Cao Bằng',
'Đà Nẵng',
'Đắk Lắk',
'Đắk Nông',
'Điện Biên',
'Đồng Nai',
'Đồng Tháp',
'Gia Lai',
'Hà Giang',
'Hà Nam',
'Hà Nội',
'Hà Tĩnh',
'Hải Dương',
'Hải Phòng',
'Hậu Giang',
'TP. Hồ Chí Minh',
'Hòa Bình',
'Hưng Yên',
'Khánh Hòa',
'Kiên Giang',
'Kon Tum',
'Lai Châu',
'Lâm Đồng',
'Lạng Sơn',
'Lào Cai',
'Long An',
'Nam Định',
'Nghệ An',
'Ninh Bình',
'Ninh Thuận',
'Phú Thọ',
'Phú Yên',
'Quảng Bình',
'Quảng Nam',
'Quảng Ngãi',
'Quảng Ninh',
'Quảng Trị',
'Sóc Trăng',
'Sơn La',
'Tây Ninh',
'Thái Bình',
'Thái Nguyên',
'Thanh Hóa',
'Huế',
'Tiền Giang',
'Trà Vinh',
'Tuyên Quang',
'Vĩnh Long',
'Vĩnh Phúc',
'Yên Bái'];

const DEFAULT_WARDS = [
'Phường Trung tâm',
'Phường 1',
'Phường An Phú',
'Xã Tân Lập'];

const TEAM_ROLES: ConfigTeamRole[] = ['APM', 'Quản lý bán hàng', 'Marketing'];
const NAVIGATION: Array<{
  id: ConfigurationSection;
  label: string;
  icon: React.ElementType;
}> = [
{
  id: 'general',
  label: 'Cấu hình chung',
  icon: Settings2Icon
},
{
  id: 'project',
  label: 'Thông tin dự án',
  icon: Building2Icon
},
{
  id: 'product',
  label: 'Thông tin sản phẩm',
  icon: PackageIcon
},
{
  id: 'team',
  label: 'Quản lý đội ngũ',
  icon: UsersRoundIcon
},
{
  id: 'partners',
  label: 'Quản lý đối tác',
  icon: HandshakeIcon
}];

export function createProjectConfiguration(
project: ProjectDraft)
: ProjectConfiguration {
  return {
    avatarUrl: '',
    seoTitle: '',
    seoKeywords: '',
    seoDescription: '',
    projectCode: '',
    projectType: project.propertyType,
    address: '',
    province: project.province,
    ward: project.district,
    salesStatus: project.status,
    segment: '',
    category: '',
    minimumArea: '',
    maximumArea: '',
    minimumPrice: '',
    maximumPrice: '',
    contractorManager: '',
    constructionManager: '',
    publishingStatus: 'Chưa xuất bản',
    soldUnits: 0,
    teamMembers: [
    {
      id: 'publisher-owner',
      employeeCode: 'MS000001',
      name: 'Tên người đăng',
      title: 'Chủ sở hữu',
      phoneNumber: '',
      isHotlineOnDuty: false,
      roles: ['APM'],
      isOwner: true
    }]

  };
}
export function ProjectConfigurationDialog({
  configuration,
  project,
  role,
  onChange,
  onSave,
  onClose
}: ProjectConfigurationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [activeSection, setActiveSection] =
  useState<ConfigurationSection>('general');
  const [projectCodeFocused, setProjectCodeFocused] = useState(false);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [activePartnerField, setActivePartnerField] =
  useState<PartnerField | null>(null);
  onCloseRef.current = onClose;
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => !element.hasAttribute('hidden'));
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, []);
  const codeQuery = configuration.projectCode.trim().toLowerCase();
  const projectMatches = codeQuery ?
  DEMO_PROJECTS.filter(
    (item) =>
    item.code.toLowerCase().includes(codeQuery) ||
    item.name.toLowerCase().includes(codeQuery)
  ).slice(0, 5) :
  [];
  const wards = configuration.province ?
  WARDS_BY_PROVINCE[configuration.province] ?? DEFAULT_WARDS :
  [];
  const canEdit = role === 'APM';
  function patchConfiguration(patch: Partial<ProjectConfiguration>) {
    if (!canEdit) return;
    onChange({
      ...configuration,
      ...patch
    });
  }
  function handleAvatarUpload(file: File) {
    if (!canEdit || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string')
      patchConfiguration({
        avatarUrl: reader.result
      });
    });
    reader.readAsDataURL(file);
  }
  function updateMember(id: string, patch: Partial<ProjectTeamMember>) {
    patchConfiguration({
      teamMembers: configuration.teamMembers.map((member) =>
      member.id === id ?
      {
        ...member,
        ...patch
      } :
      member
      )
    });
  }
  function addMember() {
    const id = crypto.randomUUID();
    patchConfiguration({
      teamMembers: [
      ...configuration.teamMembers,
      {
        id,
        employeeCode: '',
        name: '',
        title: '',
        phoneNumber: '',
        isHotlineOnDuty: false,
        roles: []
      }]

    });
    setActiveEmployeeId(id);
  }
  function removeMember(id: string) {
    patchConfiguration({
      teamMembers: configuration.teamMembers.filter(
        (member) => member.id !== id
      )
    });
    setActiveEmployeeId(null);
  }
  function toggleMemberRole(
  member: ProjectTeamMember,
  teamRole: ConfigTeamRole)
  {
    updateMember(member.id, {
      roles: member.roles.includes(teamRole) ?
      member.roles.filter((item) => item !== teamRole) :
      [...member.roles, teamRole]
    });
  }
  function toggleHotlineDuty(member: ProjectTeamMember) {
    if (!member.isHotlineOnDuty && !member.phoneNumber.trim()) return;
    patchConfiguration({
      teamMembers: configuration.teamMembers.map((item) => ({
        ...item,
        isHotlineOnDuty:
        item.id === member.id ? !member.isHotlineOnDuty : false
      }))
    });
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/45 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-configuration-title"
        tabIndex={-1}
        className="flex h-[90dvh] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-xl bg-white shadow-2xl outline-none sm:w-[90vw] xl:w-[70vw]">
        
        <header className="relative flex min-h-[70px] shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-4 sm:min-h-[78px] sm:px-7">
          <div className="min-w-0 pr-2">
            <h2
              id="project-configuration-title"
              className="truncate text-base font-bold text-[#173020] sm:text-xl">
              
              Cấu hình dự án
            </h2>
            <p className="mt-0.5 hidden truncate text-xs text-neutral-500 sm:block">
              {project.name || 'Thiết lập thông tin vận hành dự án'}
            </p>
          </div>
          {role !== 'Marketing' ?
          <p className="absolute left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-[#9A4F14] sm:block">
              Đã bán: {configuration.soldUnits} căn
            </p> :
          null}
          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500 sm:text-[11px]">
                Trạng thái đăng
              </p>
              <p className="mt-0.5 whitespace-nowrap text-xs font-semibold text-neutral-800 sm:text-sm">
                {configuration.publishingStatus || 'Chưa xuất bản'}
              </p>
            </div>
            <button
              type="button"
              disabled={!canEdit}
              onClick={onSave}
              className="h-9 shrink-0 rounded-md bg-[#f5881f] px-3 text-xs font-bold text-white transition-colors hover:bg-[#db7214] focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 sm:text-sm">
              
              Lưu
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cấu hình dự án"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-300">
              
              <XIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[56px_minmax(0,1fr)] sm:grid-cols-[208px_minmax(0,1fr)]">
          <nav
            className="border-r border-neutral-200 bg-[#FCFAF8] p-2 sm:p-4"
            aria-label="Danh mục cấu hình">
            
            <p className="hidden px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400 sm:block">
              Cấu hình
            </p>
            <div className="space-y-1">
              {NAVIGATION.map(({ id, label, icon: Icon }) => {
                const active = id === activeSection;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    title={label}
                    aria-label={label}
                    className={`flex w-full items-center justify-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 sm:justify-start sm:px-2.5 sm:text-sm ${active ? 'bg-[#6D3A18] text-white shadow-sm' : 'text-neutral-700 hover:bg-orange-50 hover:text-[#6D3A18]'}`}>
                    
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden min-w-0 leading-5 sm:inline">
                      {label}
                    </span>
                  </button>);

              })}
            </div>
          </nav>

          <section
            className="min-h-0 overflow-y-auto p-5 sm:p-6"
            aria-live="polite">
            
            {!canEdit &&
            <p className="mb-4 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
                Chỉ xem theo quyền hiện tại
              </p>
            }
            {activeSection === 'general' &&
            <GeneralConfigurationPanel
              configuration={configuration}
              canEdit={canEdit}
              onChange={patchConfiguration}
              onAvatarUpload={handleAvatarUpload} />

            }
            {activeSection === 'project' &&
            <ProjectInformationPanel
              configuration={configuration}
              projectMatches={projectMatches}
              wards={wards}
              showSuggestions={projectCodeFocused}
              canEdit={canEdit}
              onChange={patchConfiguration}
              onProjectCodeFocus={() => setProjectCodeFocused(true)}
              onProjectCodeBlur={() =>
              window.setTimeout(() => setProjectCodeFocused(false), 120)
              } />

            }
            {activeSection === 'product' &&
            <ProductInformationPanel
              configuration={configuration}
              canEdit={canEdit}
              onChange={patchConfiguration} />

            }
            {activeSection === 'team' &&
            <TeamManagementPanel
              members={configuration.teamMembers}
              activeEmployeeId={activeEmployeeId}
              canEdit={canEdit}
              onAddMember={addMember}
              onUpdateMember={updateMember}
              onRemoveMember={removeMember}
              onToggleRole={toggleMemberRole}
              onToggleHotlineDuty={toggleHotlineDuty}
              onActiveEmployeeChange={setActiveEmployeeId} />

            }
            {activeSection === 'partners' &&
            <PartnerManagementPanel
              configuration={configuration}
              activeField={activePartnerField}
              canEdit={canEdit}
              onChange={patchConfiguration}
              onActiveFieldChange={setActivePartnerField} />

            }
          </section>
        </div>
      </div>
    </div>);

}
function GeneralConfigurationPanel({
  configuration,
  canEdit,
  onChange,
  onAvatarUpload





}: {configuration: ProjectConfiguration;canEdit: boolean;onChange: (patch: Partial<ProjectConfiguration>) => void;onAvatarUpload: (file: File) => void;}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mx-auto max-w-4xl">
      <SectionHeading
        title="Cấu hình chung"
        description="Thiết lập hình ảnh đại diện và metadata hiển thị trên công cụ tìm kiếm." />
      
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[176px_minmax(0,1fr)]">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-neutral-700">
            Ảnh đại diện
          </p>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            disabled={!canEdit}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAvatarUpload(file);
              event.target.value = '';
            }} />
          
          <button
            type="button"
            disabled={!canEdit}
            onClick={() => imageInputRef.current?.click()}
            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#9A4F14] bg-orange-50/40 text-[#9A4F14] transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-200">
            
            {configuration.avatarUrl ?
            <img
              src={configuration.avatarUrl}
              alt="Ảnh đại diện dự án"
              className="h-full w-full object-cover" /> :


            <span className="flex flex-col items-center gap-2 px-3 text-center">
                <FileImageIcon className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs font-semibold">Tải ảnh đại diện</span>
              </span>
            }
            {configuration.avatarUrl && canEdit &&
            <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                Thay ảnh
              </span>
            }
          </button>
        </div>
        <div className="grid content-start gap-4">
          <TextField
            label="Tiêu đề SEO"
            value={configuration.seoTitle}
            placeholder="Nhập tiêu đề SEO"
            readOnly={!canEdit}
            onChange={(seoTitle) =>
            onChange({
              seoTitle
            })
            } />
          
          <TextField
            label="Từ khóa SEO"
            value={configuration.seoKeywords}
            placeholder="VD: căn hộ cao cấp, bất động sản Hà Nội"
            readOnly={!canEdit}
            onChange={(seoKeywords) =>
            onChange({
              seoKeywords
            })
            } />
          
          <TextAreaField
            label="Mô tả SEO"
            value={configuration.seoDescription}
            placeholder="Nhập mô tả ngắn hiển thị trên kết quả tìm kiếm"
            readOnly={!canEdit}
            onChange={(seoDescription) =>
            onChange({
              seoDescription
            })
            } />
          
        </div>
      </div>
    </div>);

}
function ProductInformationPanel({
  configuration,
  canEdit,
  onChange




}: {configuration: ProjectConfiguration;canEdit: boolean;onChange: (patch: Partial<ProjectConfiguration>) => void;}) {
  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeading
        title="Thông tin sản phẩm"
        description="Khai báo khoảng diện tích và mức giá tham chiếu của sản phẩm trong dự án." />
      
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Diện tích tối thiểu"
          value={configuration.minimumArea}
          placeholder="VD: 45"
          suffix="m²"
          inputMode="decimal"
          readOnly={!canEdit}
          onChange={(minimumArea) =>
          onChange({
            minimumArea
          })
          } />
        
        <TextField
          label="Diện tích tối đa"
          value={configuration.maximumArea}
          placeholder="VD: 120"
          suffix="m²"
          inputMode="decimal"
          readOnly={!canEdit}
          onChange={(maximumArea) =>
          onChange({
            maximumArea
          })
          } />
        
        <TextField
          label="Giá tối thiểu"
          value={configuration.minimumPrice}
          placeholder="VD: 2.5 tỷ đồng"
          readOnly={!canEdit}
          onChange={(minimumPrice) =>
          onChange({
            minimumPrice
          })
          } />
        
        <TextField
          label="Giá tối đa"
          value={configuration.maximumPrice}
          placeholder="VD: 2.5 tỷ đồng"
          readOnly={!canEdit}
          onChange={(maximumPrice) =>
          onChange({
            maximumPrice
          })
          } />
        
      </div>
    </div>);

}
function ProjectInformationPanel({
  configuration,
  projectMatches,
  wards,
  showSuggestions,
  canEdit,
  onChange,
  onProjectCodeFocus,
  onProjectCodeBlur









}: {configuration: ProjectConfiguration;projectMatches: DemoProject[];wards: string[];showSuggestions: boolean;canEdit: boolean;onChange: (patch: Partial<ProjectConfiguration>) => void;onProjectCodeFocus: () => void;onProjectCodeBlur: () => void;}) {
  return (
    <div className="mx-auto max-w-5xl">
      <SectionHeading
        title="Thông tin dự án"
        description="Thông tin này được dùng để nhận diện và vận hành dự án." />
      
      <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <FieldLabel label="Mã dự án" required>
            <input
              type="text"
              value={configuration.projectCode}
              placeholder="Nhập mã hoặc tên dự án"
              readOnly={!canEdit}
              onFocus={canEdit ? onProjectCodeFocus : undefined}
              onBlur={canEdit ? onProjectCodeBlur : undefined}
              onChange={(event) =>
              onChange({
                projectCode: event.target.value
              })
              }
              className={getFieldClassName(!canEdit)} />
            
          </FieldLabel>
          {canEdit && showSuggestions && projectMatches.length > 0 &&
          <SuggestionList>
              {projectMatches.map((item) =>
            <button
              key={item.code}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() =>
              onChange({
                projectCode: item.code
              })
              }
              className="flex w-full items-center justify-between gap-4 px-3 py-2.5 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none">
              
                  <span className="font-mono text-xs font-bold text-[#6D3A18]">
                    {item.code}
                  </span>
                  <span className="min-w-0 truncate text-xs text-neutral-700">
                    {item.name}
                  </span>
                </button>
            )}
            </SuggestionList>
          }
        </div>
        <SelectField
          label="Loại hình dự án"
          value={configuration.projectType}
          disabled={!canEdit}
          onChange={(projectType) =>
          onChange({
            projectType
          })
          }
          options={['Cao tầng', 'Thấp tầng']}
          placeholder="Chọn loại hình" />
        
        <div>
          <FieldLabel label="Địa chỉ dự án">
            <input
              type="text"
              value={configuration.address}
              placeholder="Số nhà, tên đường, khu vực"
              readOnly={!canEdit}
              onChange={(event) =>
              onChange({
                address: event.target.value
              })
              }
              className={getFieldClassName(!canEdit)} />
            
          </FieldLabel>
        </div>
        <SelectField
          label="Tỉnh thành"
          value={configuration.province}
          disabled={!canEdit}
          onChange={(province) =>
          onChange({
            province,
            ward: ''
          })
          }
          options={PROVINCES}
          placeholder="Chọn tỉnh thành" />
        
        <SelectField
          label="Phường/Xã"
          value={configuration.ward}
          disabled={!canEdit || !configuration.province}
          onChange={(ward) =>
          onChange({
            ward
          })
          }
          options={wards}
          placeholder={
          configuration.province ? 'Chọn phường/xã' : 'Chọn tỉnh thành trước'
          } />
        
        <SelectField
          label="Phân khúc"
          value={configuration.segment}
          disabled={!canEdit}
          onChange={(segment) =>
          onChange({
            segment
          })
          }
          options={['Cao cấp', 'Trung cấp', 'Nhà ở xã hội']}
          placeholder="Chọn phân khúc" />
        
        <SelectField
          label="Danh mục"
          value={configuration.category}
          disabled={!canEdit}
          onChange={(category) =>
          onChange({
            category
          })
          }
          options={['Căn hộ', 'Biệt thự', 'Sàn thương mại', 'Nhà phố']}
          placeholder="Chọn danh mục" />
        
        <SelectField
          label="Trạng thái mở bán"
          value={configuration.salesStatus}
          disabled={!canEdit}
          onChange={(salesStatus) =>
          onChange({
            salesStatus
          })
          }
          options={['Đang bán', 'Sắp mở bán', 'Dừng bán']}
          placeholder="Chọn trạng thái" />
        
      </div>
    </div>);

}
function TeamManagementPanel({
  members,
  activeEmployeeId,
  canEdit,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onToggleRole,
  onToggleHotlineDuty,
  onActiveEmployeeChange










}: {members: ProjectTeamMember[];activeEmployeeId: string | null;canEdit: boolean;onAddMember: () => void;onUpdateMember: (id: string, patch: Partial<ProjectTeamMember>) => void;onRemoveMember: (id: string) => void;onToggleRole: (member: ProjectTeamMember, role: ConfigTeamRole) => void;onToggleHotlineDuty: (member: ProjectTeamMember) => void;onActiveEmployeeChange: (id: string | null) => void;}) {
  const hasIncompleteMember = members.some(
    (member) =>
    !member.isOwner && (
    !/^MS[A-Z0-9]{6}$/.test(member.employeeCode) ||
    member.roles.length === 0)
  );
  return (
    <div className="mx-auto max-w-4xl">
      <SectionHeading
        title="Quản lý đội ngũ"
        description="Phân quyền thành viên theo vai trò trên dự án." />
      
      <div className="mt-5 space-y-3">
        {members.map((member) => {
          const employeeQuery = member.employeeCode.toLowerCase();
          const employeeMatches = employeeQuery ?
          DEMO_EMPLOYEES.filter(
            (employee) =>
            employee.code.toLowerCase().includes(employeeQuery) ||
            employee.name.toLowerCase().includes(employeeQuery)
          ).slice(0, 4) :
          [];
          const isCodeValid = /^MS[A-Z0-9]{6}$/.test(member.employeeCode);
          const hasRole = member.roles.length > 0;
          return (
            <article
              key={member.id}
              className="rounded-lg border border-neutral-200 bg-white p-4">
              
              {member.isOwner ?
              <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-100 text-[#9A4F14]">
                      <CircleUserRoundIcon
                      className="h-5 w-5"
                      aria-hidden="true" />
                    
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-neutral-900">
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {member.title} · {member.employeeCode}
                      </p>
                    </div>
                    <RolePills roles={member.roles} />
                  </div>
                  <MemberContactFields
                  member={member}
                  canEdit={canEdit}
                  onUpdateMember={onUpdateMember}
                  onToggleHotlineDuty={onToggleHotlineDuty} />
                
                </div> :

              <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(260px,1fr)_auto] md:items-start">
                    <div className="relative">
                      <FieldLabel label="Mã nhân viên" required>
                        <input
                        type="text"
                        maxLength={8}
                        value={member.employeeCode}
                        placeholder="VD: MS002401"
                        readOnly={!canEdit}
                        onFocus={
                        canEdit ?
                        () => onActiveEmployeeChange(member.id) :
                        undefined
                        }
                        onBlur={
                        canEdit ?
                        () =>
                        window.setTimeout(
                          () => onActiveEmployeeChange(null),
                          120
                        ) :
                        undefined
                        }
                        onChange={(event) =>
                        onUpdateMember(member.id, {
                          employeeCode: event.target.value.toUpperCase(),
                          name: '',
                          title: ''
                        })
                        }
                        className={`${getFieldClassName(!canEdit)} ${!isCodeValid ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''}`} />
                      
                      </FieldLabel>
                      {canEdit &&
                    activeEmployeeId === member.id &&
                    employeeMatches.length > 0 &&
                    <SuggestionList>
                            {employeeMatches.map((employee) =>
                      <button
                        key={employee.code}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() =>
                        onUpdateMember(member.id, {
                          employeeCode: employee.code,
                          name: employee.name,
                          title: employee.title
                        })
                        }
                        className="block w-full px-3 py-2.5 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none">
                        
                                <span className="block text-xs font-bold text-neutral-800">
                                  {employee.name}{' '}
                                  <span className="font-mono text-[#6D3A18]">
                                    {employee.code}
                                  </span>
                                </span>
                                <span className="block pt-0.5 text-[11px] text-neutral-500">
                                  {employee.title}
                                </span>
                              </button>
                      )}
                          </SuggestionList>
                    }
                      {!isCodeValid &&
                    <p className="mt-1 text-[11px] text-red-600">
                          {member.employeeCode ?
                      'Mã nhân viên gồm 8 ký tự và bắt đầu bằng MS.' :
                      'Cần nhập mã nhân viên.'}
                        </p>
                    }
                    </div>
                    <div>
                      <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-neutral-700">
                        Vai trò trong đội ngũ
                        <span className="text-orange-600" aria-hidden="true">
                          *
                        </span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {TEAM_ROLES.map((teamRole) =>
                      <button
                        key={teamRole}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => onToggleRole(member, teamRole)}
                        aria-pressed={member.roles.includes(teamRole)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-70 ${member.roles.includes(teamRole) ? 'border-[#6D3A18] bg-[#6D3A18] text-white' : 'border-neutral-300 bg-white text-neutral-600 hover:border-orange-300 hover:bg-orange-50'}`}>
                        
                            {member.roles.includes(teamRole) &&
                        <CheckIcon
                          className="h-3 w-3"
                          aria-hidden="true" />

                        }
                            {teamRole}
                          </button>
                      )}
                      </div>
                      {!hasRole &&
                    <p className="mt-1 text-[11px] text-red-600">
                          Chọn ít nhất một vai trò.
                        </p>
                    }
                    </div>
                    <button
                    type="button"
                    disabled={!canEdit}
                    onClick={() => onRemoveMember(member.id)}
                    className="mt-1 inline-flex h-9 items-center justify-center rounded-md px-2 text-xs font-semibold text-neutral-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40 md:mt-6"
                    aria-label="Xóa nhân sự">
                    
                      <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="ml-1 md:hidden">Xóa</span>
                    </button>
                  </div>
                  <MemberContactFields
                  member={member}
                  canEdit={canEdit}
                  onUpdateMember={onUpdateMember}
                  onToggleHotlineDuty={onToggleHotlineDuty} />
                
                </>
              }
              {member.name &&
              <p className="mt-2 text-xs text-neutral-500">
                  Đã chọn:{' '}
                  <span className="font-semibold text-neutral-700">
                    {member.name}
                  </span>
                  {member.title ? ` · ${member.title}` : ''}
                </p>
              }
            </article>);

        })}
      </div>
      <button
        type="button"
        disabled={!canEdit || hasIncompleteMember}
        onClick={onAddMember}
        title={
        hasIncompleteMember ?
        'Hoàn tất mã nhân viên và vai trò trước khi thêm người mới' :
        undefined
        }
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#9A4F14] hover:text-[#6D3A18] focus:outline-none focus:underline disabled:cursor-not-allowed disabled:text-neutral-400">
        
        <PlusIcon className="h-4 w-4" aria-hidden="true" />
        Thêm người
      </button>
      {hasIncompleteMember && canEdit &&
      <p className="mt-1.5 text-xs text-neutral-500">
          Hoàn tất mã nhân viên và vai trò trước khi thêm người mới.
        </p>
      }
    </div>);

}
function MemberContactFields({
  member,
  canEdit,
  onUpdateMember,
  onToggleHotlineDuty





}: {member: ProjectTeamMember;canEdit: boolean;onUpdateMember: (id: string, patch: Partial<ProjectTeamMember>) => void;onToggleHotlineDuty: (member: ProjectTeamMember) => void;}) {
  const hasPhoneNumber = Boolean(member.phoneNumber.trim());
  const canToggleHotline = canEdit && (member.isHotlineOnDuty || hasPhoneNumber);
  return (
    <div className="grid grid-cols-1 items-end gap-3 border-t border-neutral-100 pt-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <FieldLabel label="Số điện thoại" required={member.isHotlineOnDuty}>
          <input
            type="tel"
            inputMode="tel"
            value={member.phoneNumber}
            placeholder="VD: 0901 234 567"
            readOnly={!canEdit}
            onChange={(event) => {
              const phoneNumber = event.target.value;
              onUpdateMember(member.id, {
                phoneNumber,
                isHotlineOnDuty: phoneNumber.trim() ?
                member.isHotlineOnDuty :
                false
              });
            }}
            className={getFieldClassName(!canEdit)} />
          
        </FieldLabel>
        {!hasPhoneNumber && canEdit &&
        <p className="mt-1 text-[11px] text-neutral-500">
            Nhập số điện thoại để chọn trực hotline.
          </p>
        }
      </div>
      <label
        className={`flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition-colors ${member.isHotlineOnDuty ? 'border-[#9A4F14] bg-orange-50 text-[#6D3A18]' : 'border-neutral-200 bg-white text-neutral-600'} ${canToggleHotline ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
        
        <input
          type="checkbox"
          checked={member.isHotlineOnDuty}
          disabled={!canToggleHotline}
          onChange={() => onToggleHotlineDuty(member)}
          className="h-4 w-4 rounded border-neutral-300 text-[#6D3A18] focus:ring-orange-200 disabled:cursor-not-allowed" />
        
        Trực hotline
      </label>
    </div>);

}
function PartnerManagementPanel({
  configuration,
  activeField,
  canEdit,
  onChange,
  onActiveFieldChange






}: {configuration: ProjectConfiguration;activeField: PartnerField | null;canEdit: boolean;onChange: (patch: Partial<ProjectConfiguration>) => void;onActiveFieldChange: (field: PartnerField | null) => void;}) {
  const fields: Array<{
    key: PartnerField;
    label: string;
    placeholder: string;
  }> = [
  {
    key: 'contractorManager',
    label: 'Quản lý nhà thầu',
    placeholder: 'Nhập tên đơn vị quản lý nhà thầu'
  },
  {
    key: 'constructionManager',
    label: 'Quản lý đơn vị thi công',
    placeholder: 'Nhập tên đơn vị thi công'
  }];

  return (
    <div className="mx-auto max-w-3xl">
      <SectionHeading
        title="Quản lý đối tác"
        description="Thiết lập các đơn vị tham gia vận hành và thi công dự án." />
      
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {fields.map(({ key, label, placeholder }) => {
          const query = configuration[key].trim().toLowerCase();
          const matches = query ?
          DEMO_PARTNERS.filter((partner) =>
          partner.toLowerCase().includes(query)
          ).slice(0, 5) :
          [];
          return (
            <div key={key} className="relative">
              <FieldLabel label={label}>
                <input
                  type="text"
                  value={configuration[key]}
                  placeholder={placeholder}
                  readOnly={!canEdit}
                  onFocus={canEdit ? () => onActiveFieldChange(key) : undefined}
                  onBlur={
                  canEdit ?
                  () =>
                  window.setTimeout(
                    () => onActiveFieldChange(null),
                    120
                  ) :
                  undefined
                  }
                  onChange={(event) =>
                  onChange({
                    [key]: event.target.value
                  })
                  }
                  className={getFieldClassName(!canEdit)} />
                
              </FieldLabel>
              {canEdit && activeField === key && matches.length > 0 &&
              <SuggestionList>
                  {matches.map((partner) =>
                <button
                  key={partner}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() =>
                  onChange({
                    [key]: partner
                  })
                  }
                  className="block w-full px-3 py-2.5 text-left text-xs text-neutral-700 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none">
                  
                      {partner}
                    </button>
                )}
                </SuggestionList>
              }
            </div>);

        })}
      </div>
    </div>);

}
function SectionHeading({
  title,
  description



}: {title: string;description: string;}) {
  return (
    <div>
      <h3 className="text-base font-bold text-[#173020] sm:text-lg">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
    </div>);

}
function FieldLabel({
  label,
  required = false,
  children




}: {label: string;required?: boolean;children: React.ReactNode;}) {
  return (
    <label className="block text-xs font-semibold text-neutral-700">
      <span className="mb-1.5 flex items-center gap-1">
        {label}
        {required &&
        <span className="text-orange-600" aria-hidden="true">
            *
          </span>
        }
      </span>
      {children}
    </label>);

}
function TextField({
  label,
  value,
  placeholder,
  readOnly,
  suffix,
  inputMode,
  onChange








}: {label: string;value: string;placeholder: string;readOnly: boolean;suffix?: string;inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];onChange: (value: string) => void;}) {
  return (
    <FieldLabel label={label}>
      <span className="relative block">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          className={`${getFieldClassName(readOnly)} ${suffix ? 'pr-11' : ''}`} />
        
        {suffix &&
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500">
            {suffix}
          </span>
        }
      </span>
    </FieldLabel>);

}
function TextAreaField({
  label,
  value,
  placeholder,
  readOnly,
  onChange






}: {label: string;value: string;placeholder: string;readOnly: boolean;onChange: (value: string) => void;}) {
  return (
    <FieldLabel label={label}>
      <textarea
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className={`${getFieldClassName(readOnly)} h-auto min-h-[76px] resize-none py-2.5`} />
      
    </FieldLabel>);

}
function SelectField({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  onChange







}: {label: string;value: string;options: string[];placeholder: string;disabled?: boolean;onChange: (value: string) => void;}) {
  return (
    <FieldLabel label={label}>
      <span className="relative block">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClassName} appearance-none pr-9 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400`}>
          
          <option value="">{placeholder}</option>
          {options.map((option) =>
          <option key={option} value={option}>
              {option}
            </option>
          )}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true" />
        
      </span>
    </FieldLabel>);

}
function RolePills({ roles }: {roles: ConfigTeamRole[];}) {
  return (
    <div className="hidden flex-wrap justify-end gap-1 sm:flex">
      {roles.map((teamRole) =>
      <span
        key={teamRole}
        className="rounded-full bg-orange-50 px-2 py-1 text-[11px] font-bold text-[#9A4F14]">
        
          {teamRole}
        </span>
      )}
    </div>);

}
function SuggestionList({ children }: {children: React.ReactNode;}) {
  return (
    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
      {children}
    </div>);

}
const fieldClassName =
'h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#6D3A18] focus:ring-2 focus:ring-orange-100';
function getFieldClassName(readOnly: boolean) {
  return `${fieldClassName} ${readOnly ? 'cursor-default border-neutral-200 bg-neutral-50 text-neutral-600 focus:border-neutral-200 focus:ring-0' : ''}`;
}