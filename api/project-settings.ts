import type { VercelRequest, VercelResponse } from '@vercel/node';
import { patchProjectConfiguration, UUID_RE } from './_lib/projectConfig.js';

/**
 * Lưu các thiết lập dự án nhập ở hộp Cấu hình dự án trong CMS. Hiện chỉ có
 * link kho tri thức — folder Google Drive mà trợ lý AI Bích Ngọc đọc.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { projectId, knowledgeBaseUrl } = (req.body ?? {}) as {
    projectId?: string;
    knowledgeBaseUrl?: string;
  };

  if (typeof projectId !== 'string' || !UUID_RE.test(projectId)) {
    res.status(400).json({ error: 'Thiếu hoặc sai projectId.' });
    return;
  }

  const url = typeof knowledgeBaseUrl === 'string' ? knowledgeBaseUrl.trim() : '';
  if (url && !/^https:\/\/(drive|docs)\.google\.com\//.test(url)) {
    res.status(400).json({ error: 'Link kho tri thức phải là link Google Drive.' });
    return;
  }

  try {
    const configuration = await patchProjectConfiguration(projectId, { knowledgeBaseUrl: url });
    res.status(200).json({ ok: true, knowledgeBaseUrl: configuration.knowledgeBaseUrl ?? '' });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Lưu thiết lập thất bại.'
    });
  }
}
