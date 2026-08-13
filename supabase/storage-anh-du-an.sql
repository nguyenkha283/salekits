-- ─────────────────────────────────────────────────────────────────────────────
-- Kho ảnh dự án trên Supabase Storage.
-- Chạy trong Supabase Dashboard > SQL Editor. Chạy lại nhiều lần được.
--
-- Sau khi chạy, endpoint /api/upload-image sẽ ghi được ảnh vào bucket này và
-- trả về đường dẫn công khai để hiển thị trên trang.
-- ─────────────────────────────────────────────────────────────────────────────

/**
 * Bucket công khai: ảnh dự án hiển thị trên trang công khai nên không cần ký
 * URL. Giới hạn 3 MB khớp với giới hạn của endpoint, để phía Storage chặn nốt
 * những gì lọt qua tầng ứng dụng.
 */
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  3145728,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ── Chính sách truy cập ──────────────────────────────────────────────────────
-- Ghi chỉ đi qua backend bằng Service Role Key (bỏ qua RLS), nên không cần
-- policy ghi cho anon. Chỉ cần cho phép đọc công khai.

drop policy if exists "project_images_public_read" on storage.objects;
create policy "project_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'project-images');


-- ⚠️ Chưa có cơ chế dọn ảnh mồ côi: xóa một sản phẩm hay gỡ một ảnh khỏi băng
-- ảnh chỉ bỏ đường dẫn trong dữ liệu, file vẫn nằm lại trong bucket. Với bản
-- demo thì không sao, nhưng bản thật cần một tác vụ dọn định kỳ.
