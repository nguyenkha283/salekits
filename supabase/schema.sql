-- Chạy trong Supabase Dashboard > SQL Editor > New query > dán toàn bộ > Run

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  drive_folder_id text unique not null,
  drive_folder_url text not null,
  project_name text not null,
  content jsonb not null default '{}'::jsonb,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tự động cập nhật updated_at mỗi khi record được sửa
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
before update on projects
for each row execute function set_updated_at();

-- Tắt Row Level Security vì backend dùng Service Role Key (bỏ qua RLS),
-- chưa có nhu cầu truy cập trực tiếp từ frontend bằng anon key.
alter table projects disable row level security;
