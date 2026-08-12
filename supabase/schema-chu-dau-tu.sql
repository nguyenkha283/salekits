-- ─────────────────────────────────────────────────────────────────────────────
-- Module Quản lý chủ đầu tư — theo "Đặc tả module Quản lý chủ đầu tư" v1.0
-- Chạy trong Supabase Dashboard > SQL Editor > New query > dán toàn bộ > Run.
-- Chạy lại nhiều lần được, không làm mất dữ liệu.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;


-- ── 1. Hàm chuẩn hóa tên, dùng cho tìm kiếm gợi ý (đặc tả mục 3.2) ───────────

/**
 * Mức 2: bỏ dấu tiếng Việt, bỏ phân biệt hoa thường, chuẩn hóa khoảng trắng.
 *
 * Đánh dấu IMMUTABLE để dùng được trong cột sinh và chỉ mục, dù unaccent chỉ là
 * STABLE. An toàn với điều kiện không sửa từ điển unaccent về sau — sửa thì
 * phải REINDEX lại các chỉ mục bên dưới.
 */
create or replace function public.po_normalize(input text)
returns text
language sql
immutable
strict
parallel safe
as $$
  select regexp_replace(
    lower(extensions.unaccent(translate(input, 'đĐ', 'dD'))),
    '\s+', ' ', 'g'
  )
$$;

/** Mức 3: bỏ tiền tố pháp nhân ở đầu tên đã chuẩn hóa. */
create or replace function public.po_strip_prefix(input text)
returns text
language sql
immutable
strict
parallel safe
as $$
  select btrim(
    regexp_replace(
      public.po_normalize(input),
      '^((cong ty|tong cong ty|tap doan|cty)\s+)?((co phan|cp|tnhh mot thanh vien|tnhh)\s+)?((tap doan)\s+)?',
      ''
    )
  )
$$;


-- ── 2. Bảng chủ đầu tư ───────────────────────────────────────────────────────

create table if not exists property_owners (
  -- po_id
  id uuid primary key default gen_random_uuid(),

  -- po_code — sinh từ tên ở tầng ứng dụng, duy nhất, không sửa sau khi tạo
  code text not null unique,

  -- po_name
  name text not null check (btrim(name) <> ''),

  -- po_tax_code — phase này chỉ lưu trữ, chưa dùng để chặn trùng (FR-CDT-09)
  tax_code text,

  -- po_slug — đường dẫn trang công khai, duy nhất toàn hệ thống, sửa được
  slug text not null unique,

  -- po_logo — PNG hoặc JPG, lưu ở Supabase Storage rồi giữ đường dẫn ở đây
  logo_url text,

  -- po_description — khuyến nghị ≤ 200 ký tự; vượt thì ứng dụng cảnh báo
  -- nhưng vẫn cho lưu, nên KHÔNG đặt ràng buộc độ dài ở đây (FR-CDT-05)
  description text not null check (btrim(description) <> ''),

  -- po_usp — mảng chuỗi, tối đa 4 mục (FR-CDT-06)
  advantages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(advantages) = 'array' and jsonb_array_length(advantages) <= 4),

  -- po_numbers — tối đa 4 mục, mỗi mục {value, label, description} đều là text
  numbers jsonb not null default '[]'::jsonb
    check (jsonb_typeof(numbers) = 'array' and jsonb_array_length(numbers) <= 4),

  address text,
  website text,
  founded_year smallint check (founded_year between 1800 and 2100),

  -- po_status — mặc định Đang sử dụng; chỉ Admin chuyển sang Ngừng sử dụng
  status text not null default 'Đang sử dụng'
    check (status in ('Đang sử dụng', 'Ngừng sử dụng')),

  -- po_created_by — quyết định quyền sửa bản ghi (FR-CDT-12).
  -- Chưa có bảng người dùng nên để dạng text; khi gắn HRM thì đổi thành
  -- uuid references users(id) và chuyển về Admin khi người tạo nghỉ việc.
  created_by text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Cột sinh phục vụ tìm kiếm, luôn khớp với name nên không lệch dữ liệu
  search_name text generated always as (public.po_normalize(name)) stored,
  search_core text generated always as (public.po_strip_prefix(name)) stored
);

comment on table property_owners is
  'Chủ đầu tư — bản ghi dùng chung, nhiều dự án cùng tham chiếu tới.';
comment on column property_owners.code is
  'Sinh từ tên, trùng thì thêm hậu tố. Không cho sửa sau khi tạo (FR-CDT-03).';
comment on column property_owners.created_by is
  'Chỉ người này và Admin được sửa bản ghi (FR-CDT-12).';

-- Chỉ mục cho gợi ý khi gõ: trigram chạy được cả truy vấn LIKE '%...%'
create index if not exists property_owners_search_name_trgm
  on property_owners using gin (search_name extensions.gin_trgm_ops);
create index if not exists property_owners_search_core_trgm
  on property_owners using gin (search_core extensions.gin_trgm_ops);
create index if not exists property_owners_status_idx
  on property_owners (status);
create index if not exists property_owners_created_by_idx
  on property_owners (created_by);


-- ── 3. Trigger cập nhật updated_at ───────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_property_owners_updated_at on property_owners;
create trigger trg_property_owners_updated_at
before update on property_owners
for each row execute function set_updated_at();


-- ── 4. Bổ sung vào bảng projects ─────────────────────────────────────────────
-- Đầu mối liên hệ thuộc về DỰ ÁN, không thuộc về chủ đầu tư (đặc tả mục 1.2):
-- một chủ đầu tư có nhiều dự án, mỗi dự án làm việc với một đầu mối khác nhau.

alter table projects
  -- Quan hệ 1 chủ đầu tư — nhiều dự án. RESTRICT vì hệ thống không xóa bản ghi
  -- chủ đầu tư đang được dự án tham chiếu; muốn dừng thì đổi status (FR-CDT-15).
  add column if not exists property_owner_id uuid
    references property_owners (id) on delete restrict,

  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists contact_dob date,
  add column if not exists contact_note text;

create index if not exists projects_property_owner_id_idx
  on projects (property_owner_id);

comment on column projects.property_owner_id is
  'Chủ đầu tư của dự án. Bắt buộc khi khởi tạo dự án (FR-CDT-19) — ràng buộc '
  'NOT NULL sẽ bật sau khi điền xong dữ liệu cho các dự án cũ.';
comment on column projects.contact_name is
  'Đầu mối liên hệ — chỉ hiển thị nội bộ, không lên trang công khai (FR-CDT-11).';


-- ── 5. Row Level Security ────────────────────────────────────────────────────
-- Tắt như bảng projects hiện có: backend dùng Service Role Key (bỏ qua RLS) và
-- frontend chưa truy cập trực tiếp bằng anon key. Khi mở cho anon key thì bật
-- lại và viết policy theo ma trận phân quyền ở mục 4 của đặc tả.

alter table property_owners disable row level security;
