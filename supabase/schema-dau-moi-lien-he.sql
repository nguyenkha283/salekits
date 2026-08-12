-- ─────────────────────────────────────────────────────────────────────────────
-- Đầu mối liên hệ của chủ đầu tư — bảng riêng, dùng chung giữa các dự án.
-- Chạy SAU schema-chu-dau-tu.sql. Chạy lại nhiều lần được.
--
-- ⚠️ Đối chiếu đặc tả module Quản lý chủ đầu tư v1.0:
--    FR-CDT-10 quy định bốn trường đầu mối nằm TRỰC TIẾP trên bản ghi dự án.
--    File này tách ra bảng riêng để hai dự án cùng một đầu mối dùng chung một
--    bản ghi. Ý định nghiệp vụ ở mục 1.2 vẫn giữ nguyên — mỗi dự án vẫn có đầu
--    mối riêng, một chủ đầu tư vẫn có nhiều đầu mối — nhưng câu chữ của
--    FR-CDT-10 cần được sửa cho khớp.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Chuẩn hóa số điện thoại ───────────────────────────────────────────────

/**
 * Đưa số điện thoại về một dạng duy nhất trước khi so trùng.
 * "+84 912 345 678", "0912.345.678" và "912345678" đều thành "0912345678".
 *
 * Bắt buộc phải có: nếu so trùng trên chuỗi thô thì cùng một người nhập ba kiểu
 * sẽ lọt qua ràng buộc duy nhất và tạo ba bản ghi — đúng thứ mà bảng này sinh
 * ra để ngăn.
 */
create or replace function public.contact_normalize_phone(input text)
returns text
language sql
immutable
strict
parallel safe
as $$
  with digits as (select regexp_replace(input, '\D', '', 'g') as d)
  select case
    -- 84xxxxxxxxx hoặc +84xxxxxxxxx → 0xxxxxxxxx
    when d ~ '^84[0-9]{9}$' then '0' || substr(d, 3)
    -- thiếu số 0 đầu, ví dụ dán từ Excel làm mất số 0
    when d ~ '^[1-9][0-9]{8}$' then '0' || d
    else d
  end
  from digits
$$;


-- ── 2. Bảng đầu mối liên hệ ──────────────────────────────────────────────────

create table if not exists project_contacts (
  id uuid primary key default gen_random_uuid(),

  -- Đầu mối là người CỦA chủ đầu tư, nên gắn với chủ đầu tư. RESTRICT vì xóa
  -- chủ đầu tư mà bỏ rơi đầu mối sẽ để lại bản ghi mồ côi.
  property_owner_id uuid not null
    references property_owners (id) on delete restrict,

  -- contact_name
  name text not null check (btrim(name) <> ''),

  -- contact_phone — bắt buộc vì đây là thứ định danh bản ghi
  phone text not null check (btrim(phone) <> ''),

  -- Khóa chống trùng thật sự nằm ở đây, không nằm ở cột phone thô
  phone_key text generated always as (public.contact_normalize_phone(phone)) stored,

  -- contact_dob — phục vụ chăm sóc quan hệ
  dob date,

  -- contact_note — thói quen, sở thích
  note text,

  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Số sau chuẩn hóa phải còn là số điện thoại nhận ra được
  constraint project_contacts_phone_key_valid
    check (phone_key ~ '^0[0-9]{8,10}$')
);

comment on table project_contacts is
  'Đầu mối liên hệ của chủ đầu tư. Nhiều dự án cùng trỏ tới một bản ghi khi '
  'cùng làm việc với một người.';
comment on column project_contacts.phone_key is
  'Số điện thoại đã chuẩn hóa. Đây là khóa chống trùng, không phải cột phone.';
comment on column project_contacts.note is
  'Dữ liệu cá nhân của người ngoài tổ chức — xem RR-04 của đặc tả module.';

/**
 * Một số điện thoại chỉ có một bản ghi trên toàn hệ thống.
 *
 * Phạm vi TOÀN HỆ THỐNG chứ không phải theo từng chủ đầu tư: hệ quả là một
 * người làm đại diện cho hai chủ đầu tư khác nhau sẽ không tạo được bản ghi thứ
 * hai. Xem điểm mở OI-05 ở cuối file.
 */
create unique index if not exists project_contacts_phone_key_uniq
  on project_contacts (phone_key);

create index if not exists project_contacts_owner_idx
  on project_contacts (property_owner_id);
create index if not exists project_contacts_name_idx
  on project_contacts (lower(name));

drop trigger if exists trg_project_contacts_updated_at on project_contacts;
create trigger trg_project_contacts_updated_at
before update on project_contacts
for each row execute function set_updated_at();


-- ── 3. Nối dự án tới đầu mối ─────────────────────────────────────────────────

alter table projects
  -- Đầu mối vẫn là thông tin TÙY CHỌN của dự án (FR-CDT-10).
  -- SET NULL vì xóa đầu mối không có lý do gì làm hỏng bản ghi dự án.
  add column if not exists contact_id uuid
    references project_contacts (id) on delete set null;

create index if not exists projects_contact_id_idx on projects (contact_id);


-- ── 4. Chuyển dữ liệu từ bốn cột cũ sang bảng mới ────────────────────────────
-- Chỉ chạy khi bốn cột cũ còn tồn tại. Dự án nào chưa có số điện thoại thì bỏ
-- qua — không có gì để định danh bản ghi đầu mối.

do $$
declare
  moved integer := 0;
  skipped integer := 0;
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'projects' and column_name = 'contact_phone'
  ) then
    raise notice 'Bốn cột đầu mối cũ đã được gỡ, bỏ qua bước chuyển dữ liệu.';
    return;
  end if;

  -- Tạo bản ghi đầu mối cho từng số điện thoại phân biệt
  with source as (
    select
      p.property_owner_id,
      public.contact_normalize_phone(p.contact_phone) as phone_key,
      min(p.contact_name) as name,
      min(p.contact_phone) as phone,
      min(p.contact_dob) as dob,
      min(p.contact_note) as note
    from projects p
    where p.contact_phone is not null
      and btrim(p.contact_phone) <> ''
      and p.property_owner_id is not null
      and public.contact_normalize_phone(p.contact_phone) ~ '^0[0-9]{8,10}$'
    group by 1, 2
  )
  insert into project_contacts (property_owner_id, name, phone, dob, note, created_by)
  select
    s.property_owner_id,
    coalesce(nullif(btrim(s.name), ''), 'Chưa rõ tên'),
    s.phone,
    s.dob,
    s.note,
    'migration'
  from source s
  where not exists (
    select 1 from project_contacts c where c.phone_key = s.phone_key
  );

  -- Nối dự án tới bản ghi vừa tạo
  update projects p
  set contact_id = c.id
  from project_contacts c
  where p.contact_id is null
    and p.contact_phone is not null
    and c.phone_key = public.contact_normalize_phone(p.contact_phone);

  get diagnostics moved = row_count;

  select count(*) into skipped
  from projects
  where contact_id is null
    and contact_phone is not null
    and btrim(contact_phone) <> '';

  raise notice 'Đã nối % dự án tới đầu mối. % dự án có số điện thoại nhưng không chuyển được (số không hợp lệ hoặc chưa có chủ đầu tư).', moved, skipped;
end $$;

-- Gỡ bốn cột cũ. Chạy riêng SAU khi đã kiểm tra dữ liệu chuyển sang đúng —
-- bỏ chú thích khi sẵn sàng, vì thao tác này không hoàn tác được.
--
-- alter table projects
--   drop column if exists contact_name,
--   drop column if exists contact_phone,
--   drop column if exists contact_dob,
--   drop column if exists contact_note;


-- ── 5. Row Level Security ────────────────────────────────────────────────────
-- Tắt như các bảng khác: backend dùng Service Role Key. Khi mở cho anon key,
-- bảng này cần policy CHẶT HƠN các bảng còn lại — FR-CDT-11 quy định đầu mối
-- chỉ hiển thị với Người tạo dự án của dự án đó, Trưởng line, Ban lãnh đạo và
-- Admin, và không bao giờ lên trang công khai.

alter table project_contacts disable row level security;


-- ── Điểm mở cần BA xác nhận ──────────────────────────────────────────────────
--
-- OI-05  Một người làm đại diện cho hai chủ đầu tư khác nhau: ràng buộc duy
--        nhất theo số điện thoại toàn hệ thống sẽ chặn bản ghi thứ hai. Nếu
--        tình huống này có thật, khóa duy nhất phải đổi thành
--        (property_owner_id, phone_key).
--
-- OI-06  Bản ghi dùng chung nghĩa là APM của dự án B sửa được ghi chú do APM
--        của dự án A nhập, và đọc được ghi chú đó. Cần xác nhận đây là điều
--        mong muốn — nó mở rộng phạm vi người đọc dữ liệu cá nhân nêu ở RR-04.
--
-- OI-07  Đầu mối đổi số điện thoại: sửa cột phone là phone_key đổi theo, các dự
--        án đang trỏ tới vẫn giữ nguyên liên kết. Nhưng nếu số mới trùng một
--        bản ghi khác thì lệnh sửa bị chặn, chưa có luồng gộp hai bản ghi.
