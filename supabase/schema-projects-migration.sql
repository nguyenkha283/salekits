-- ─────────────────────────────────────────────────────────────────────────────
-- Migration hợp nhất cho bảng projects.
--
-- Chạy file này MỘT LẦN trong Supabase Dashboard > SQL Editor. Nó bổ sung mọi
-- cột mà /api/sync-project ghi vào nhưng bảng gốc chưa có, gộp từ các file
-- schema-*.sql lại để khỏi phải chạy đúng thứ tự nhiều file. An toàn chạy lại.
--
-- Lỗi "Could not find the 'address' column of 'projects' in the schema cache"
-- xảy ra khi các migration lẻ chưa được chạy trên database thật. File này khắc
-- phục toàn bộ.
-- ─────────────────────────────────────────────────────────────────────────────

alter table projects
  -- Mã dự án, tên gọi khác, slogan (từ schema-ma-du-an.sql)
  add column if not exists project_code text,
  add column if not exists aliases text[] not null default '{}',
  add column if not exists slogan text,

  -- Địa chỉ và địa giới hai cấp (từ schema-dau-moi-lien-he.sql)
  add column if not exists address text,
  add column if not exists province text,
  add column if not exists ward text,

  -- Khóa ngoại tới chủ đầu tư và đầu mối liên hệ
  add column if not exists property_owner_id uuid,
  add column if not exists contact_id uuid;

-- Chỉ mục tra cứu. Không unique trên project_code: quy tắc chống trùng chờ chốt
-- (SRS phụ lục 7.8.3).
create index if not exists projects_project_code_idx
  on projects (upper(project_code));
create index if not exists projects_aliases_idx
  on projects using gin (aliases);
create index if not exists projects_province_idx
  on projects (province);
create index if not exists projects_property_owner_id_idx
  on projects (property_owner_id);
create index if not exists projects_contact_id_idx
  on projects (contact_id);

-- ── Ghi chú về khóa ngoại ────────────────────────────────────────────────────
-- Không đặt ràng buộc khóa ngoại cứng ở đây, vì bảng property_owners và
-- project_contacts phải tồn tại trước. Nếu đã chạy schema-chu-dau-tu.sql và
-- schema-dau-moi-lien-he.sql thì bỏ chú thích hai lệnh dưới để bật ràng buộc:
--
-- alter table projects add constraint projects_property_owner_id_fkey
--   foreign key (property_owner_id) references property_owners (id)
--   on delete set null;
-- alter table projects add constraint projects_contact_id_fkey
--   foreign key (contact_id) references project_contacts (id)
--   on delete set null;

comment on column projects.project_code is
  'Mã dự án. Chưa có ràng buộc duy nhất — xem SRS phụ lục 7.8.3.';
comment on column projects.aliases is
  'Tên gọi khác của dự án, phục vụ tìm kiếm. Không ảnh hưởng tới mã dự án.';
comment on column projects.address is
  'Địa chỉ nhập tự do: số nhà, tên đường, tên khu.';

-- ⚠️ Sau khi chạy, Supabase tự làm mới schema cache trong vài giây. Nếu vẫn báo
-- thiếu cột, vào Dashboard > Settings > API và bấm "Reload schema", hoặc chờ
-- một phút rồi thử lại.
