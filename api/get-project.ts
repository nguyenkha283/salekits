import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './_lib/supabaseClient.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Thiếu id.' });
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.
    from('projects').
    select('id, project_name, drive_folder_url, content, configuration, updated_at').
    eq('id', id).
    single();

    if (error || !data) {
      res.status(404).json({ error: 'Không tìm thấy dự án.' });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Tải dự án thất bại.'
    });
  }
}
