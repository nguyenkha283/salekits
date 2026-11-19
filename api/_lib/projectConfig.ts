import { getSupabaseClient } from './supabaseClient.js';

export const UUID_RE =
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProjectConfigurationRow = Record<string, unknown> & {
  projectType?: string;
  knowledgeBaseUrl?: string;
  inventory?: unknown;
};

export async function readProjectConfiguration(
projectId: string)
: Promise<{name: string;configuration: ProjectConfigurationRow;content: Record<string, unknown>;} | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.
  from('projects').
  select('project_name, configuration, content').
  eq('id', projectId).
  maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as {project_name?: string;configuration?: ProjectConfigurationRow | null;content?: Record<string, unknown> | null;};
  return {
    name: row.project_name ?? '',
    configuration: row.configuration ?? {},
    content: row.content ?? {}
  };
}

/**
 * Gộp patch vào cột configuration (jsonb) thay vì ghi đè — cột này chứa nhiều
 * phần do các màn khác nhau lưu (loại hình, link kho tri thức, bản chụp bảng
 * hàng), ghi đè sẽ làm mất phần của màn khác.
 */
export async function patchProjectConfiguration(
projectId: string,
patch: ProjectConfigurationRow)
: Promise<ProjectConfigurationRow> {
  const current = await readProjectConfiguration(projectId);
  if (!current) throw new Error('Không tìm thấy dự án.');
  const next = { ...current.configuration, ...patch };
  const { error } = await getSupabaseClient().
  from('projects').
  update({ configuration: next }).
  eq('id', projectId);
  if (error) throw new Error(error.message);
  return next;
}
