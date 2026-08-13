-- ─────────────────────────────────────────────────────────────────────────────
-- Bổ sung cho bảng projects: mã dự án, tên gọi khác, slogan.
-- Chạy SAU schema-dau-moi-lien-he.sql. Chạy lại nhiều lần được.
-- ─────────────────────────────────────────────────────────────────────────────

alter table projects
  -- FR-07: sinh từ tên dự án. FR-08: sửa được trước khi xuất bản, khóa sau đó.
  --
  -- ⚠️ CHƯA đặt ràng buộc duy nhất. SRS phụ lục 7.8.3 ghi rõ quy tắc chống trùng
  -- mã dự án còn chờ làm rõ; đặt ràng buộc bây giờ sẽ chặn nhầm những trường hợp
  -- hợp lệ mà nghiệp vụ chưa mô tả.
  add column if not exists project_code text,

  -- Nhiều tên gọi, một mã duy nhất. Mảng text thay vì bảng con vì các tên này
  -- luôn đọc và ghi cùng bản ghi dự án, không truy vấn riêng.
  add column if not exists aliases text[] not null default '{}',

  -- Slogan hiển thị dưới tên dự án trên băng ảnh đầu trang.
  add column if not exists slogan text;

comment on column projects.project_code is
  'Mã dự án. Chưa có ràng buộc duy nhất — xem SRS phụ lục 7.8.3.';
comment on column projects.aliases is
  'Tên gọi khác của dự án, phục vụ tìm kiếm. Không ảnh hưởng tới mã dự án.';

-- Chỉ mục cho tra cứu theo mã. Không unique, xem ghi chú ở trên.
create index if not exists projects_project_code_idx
  on projects (upper(project_code));

/**
 * Tìm dự án theo tên chính hoặc bất kỳ tên gọi khác nào.
 *
 * Dùng chỉ mục GIN trên mảng aliases để câu truy vấn `aliases && array[...]`
 * và các phép so khớp mảng không phải quét toàn bảng.
 */
create index if not exists projects_aliases_idx
  on projects using gin (aliases);
