import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { drive_v3 } from 'googleapis';
import mammoth from 'mammoth';
import { extractText, getDocumentProxy } from 'unpdf';
import { getDriveClient } from './_lib/googleAuth.js';
import { readProjectConfiguration, UUID_RE } from './_lib/projectConfig.js';

/**
 * Kho tri thức của một dự án cho trợ lý AI Bích Ngọc.
 *
 *   GET /api/project-knowledge?projectId=…
 *   → { projectName, knowledgeBaseUrl, docs: [{ id, title, date, text }], skipped }
 *
 * Nguồn (bản demo): nội dung tab Tổng quan / Vị trí đã đồng bộ, cộng mọi tài
 * liệu đọc được trong folder Google Drive "Link kho tri thức dự án". Sau này
 * thay bằng API kho tri thức — giữ nguyên hình dạng phản hồi này.
 */

const FOLDER = 'application/vnd.google-apps.folder';
const MAX_FILES = 60;
const MAX_DEPTH = 3;
const MAX_CHARS_PER_DOC = 120_000;
const MAX_TOTAL_CHARS = 600_000;
const CACHE_MS = 5 * 60 * 1000;

interface KnowledgeDoc {
  id: string;
  title: string;
  date: string;
  text: string;
}

interface KnowledgeResponse {
  projectId: string;
  projectName: string;
  knowledgeBaseUrl: string;
  generatedAt: string;
  docs: KnowledgeDoc[];
  skipped: Array<{name: string;reason: string;}>;
}

const cache = new Map<string, {at: number;data: KnowledgeResponse;}>();

function htmlToText(html: string): string {
  return html.
  replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n').
  replace(/<br\s*\/?>/gi, '\n').
  replace(/<[^>]*>/g, '').
  replace(/&nbsp;/g, ' ').
  replace(/&amp;/g, '&').
  replace(/&lt;/g, '<').
  replace(/&gt;/g, '>').
  replace(/&quot;/g, '"').
  replace(/[ \t]+/g, ' ').
  replace(/\n\s*\n+/g, '\n\n').
  trim();
}

function folderIdFromUrl(url: string): {kind: 'folder' | 'file';id: string;} | null {
  const folder = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folder) return { kind: 'folder', id: folder[1] };
  const file = url.match(/\/(?:file|document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/) ??
  url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (file) return { kind: 'file', id: file[1] };
  return null;
}

async function download(drive: drive_v3.Drive, fileId: string): Promise<Buffer> {
  const response = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(response.data as ArrayBuffer);
}

async function exportAs(drive: drive_v3.Drive, fileId: string, mimeType: string): Promise<string> {
  const response = await drive.files.export({ fileId, mimeType }, { responseType: 'text' });
  return String(response.data ?? '');
}

/** Đọc chữ của một file; trả null kèm lý do nếu định dạng chưa hỗ trợ. */
async function readFileText(
drive: drive_v3.Drive,
file: drive_v3.Schema$File)
: Promise<{text: string;} | {reason: string;}> {
  const id = file.id ?? '';
  const mime = file.mimeType ?? '';
  const name = (file.name ?? '').toLowerCase();

  if (mime === 'application/vnd.google-apps.document') return { text: await exportAs(drive, id, 'text/plain') };
  if (mime === 'application/vnd.google-apps.spreadsheet') return { text: await exportAs(drive, id, 'text/csv') };
  if (mime === 'application/vnd.google-apps.presentation') return { text: await exportAs(drive, id, 'text/plain') };
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: await download(drive, id) });
    return { text: result.value };
  }
  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    const pdf = await getDocumentProxy(new Uint8Array(await download(drive, id)));
    const { text } = await extractText(pdf, { mergePages: true });
    const content = String(text ?? '').trim();
    // PDF scan chỉ có ảnh, không có lớp chữ — cần OCR, chưa hỗ trợ.
    if (content.length < 40) return { reason: 'PDF dạng ảnh scan, cần OCR' };
    return { text: content };
  }
  if (mime.startsWith('text/') || /\.(txt|md|csv)$/.test(name)) {
    return { text: (await download(drive, id)).toString('utf8') };
  }
  return { reason: `Chưa hỗ trợ định dạng ${mime || name}` };
}

async function readDriveKnowledge(
drive: drive_v3.Drive,
url: string,
docs: KnowledgeDoc[],
skipped: KnowledgeResponse['skipped'])
{
  const target = folderIdFromUrl(url);
  if (!target) {
    skipped.push({ name: url, reason: 'Link không phải folder/file Google Drive' });
    return;
  }

  const files: drive_v3.Schema$File[] = [];
  if (target.kind === 'file') {
    const meta = await drive.files.get({ fileId: target.id, fields: 'id, name, mimeType, modifiedTime', supportsAllDrives: true });
    files.push(meta.data);
  } else {
    // Duyệt theo chiều rộng, giới hạn độ sâu và số file để không quá tải.
    let level: Array<{id: string;path: string;}> = [{ id: target.id, path: '' }];
    for (let depth = 0; depth < MAX_DEPTH && level.length && files.length < MAX_FILES; depth++) {
      const next: typeof level = [];
      for (const folder of level) {
        let pageToken: string | undefined;
        do {
          const response = await drive.files.list({
            q: `'${folder.id}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
            pageSize: 200,
            pageToken,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true
          });
          for (const item of response.data.files ?? []) {
            if (item.mimeType === FOLDER) {
              next.push({ id: item.id ?? '', path: `${folder.path}${item.name}/` });
            } else if (files.length < MAX_FILES) {
              files.push({ ...item, name: `${folder.path}${item.name}` });
            }
          }
          pageToken = response.data.nextPageToken ?? undefined;
        } while (pageToken);
      }
      level = next;
    }
  }

  let total = docs.reduce((sum, doc) => sum + doc.text.length, 0);
  for (const file of files) {
    if (total >= MAX_TOTAL_CHARS) {
      skipped.push({ name: file.name ?? '', reason: 'Vượt giới hạn dung lượng kho' });
      continue;
    }
    if ((file.mimeType ?? '').startsWith('image/') || (file.mimeType ?? '').startsWith('video/')) {
      continue;
    }
    try {
      const result = await readFileText(drive, file);
      if ('reason' in result) {
        skipped.push({ name: file.name ?? '', reason: result.reason });
        continue;
      }
      const text = result.text.replace(/\r\n/g, '\n').trim().slice(0, MAX_CHARS_PER_DOC);
      if (!text) continue;
      total += text.length;
      docs.push({
        id: `drive-${file.id}`,
        title: (file.name ?? '').replace(/\.[a-z0-9]+$/i, ''),
        date: (file.modifiedTime ?? '').slice(0, 10),
        text
      });
    } catch (error) {
      skipped.push({
        name: file.name ?? '',
        reason: error instanceof Error ? error.message.slice(0, 160) : 'Lỗi đọc file'
      });
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const projectId = String(req.query.projectId ?? '');
  if (!UUID_RE.test(projectId)) {
    res.status(400).json({ error: 'Thiếu hoặc sai projectId.' });
    return;
  }

  try {
    const project = await readProjectConfiguration(projectId);
    if (!project) {
      res.status(404).json({ error: 'Không tìm thấy dự án.' });
      return;
    }
    const knowledgeBaseUrl = String(project.configuration.knowledgeBaseUrl ?? '').trim();
    const cacheKey = `${projectId}|${knowledgeBaseUrl}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_MS && req.query.refresh !== '1') {
      res.status(200).json(cached.data);
      return;
    }

    const docs: KnowledgeDoc[] = [];
    const skipped: KnowledgeResponse['skipped'] = [];

    const overview = htmlToText(String(project.content.overviewContent ?? ''));
    if (overview) docs.push({ id: 'cms-tong-quan', title: `Tổng quan dự án ${project.name}`, date: '', text: overview });
    const location = htmlToText(String(project.content.locationContent ?? ''));
    if (location) docs.push({ id: 'cms-vi-tri', title: `Vị trí dự án ${project.name}`, date: '', text: location });

    if (knowledgeBaseUrl) {
      await readDriveKnowledge(getDriveClient(), knowledgeBaseUrl, docs, skipped);
    }

    const data: KnowledgeResponse = {
      projectId,
      projectName: project.name,
      knowledgeBaseUrl,
      generatedAt: new Date().toISOString(),
      docs,
      skipped
    };
    cache.set(cacheKey, { at: Date.now(), data });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Đọc kho tri thức thất bại.'
    });
  }
}
