import type { drive_v3 } from 'googleapis';
import mammoth from 'mammoth';
import { sanitizeRichTextServer } from './richTextServer';
import type { DriveNode } from './driveTree';
import { isImage } from './driveTree';

const GOOGLE_DOC_MIME = 'application/vnd.google-apps.document';
const DOCX_MIME =
'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

async function downloadBuffer(
drive: drive_v3.Drive,
fileId: string)
: Promise<Buffer> {
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(response.data as ArrayBuffer);
}

async function exportGoogleDocAsHtml(
drive: drive_v3.Drive,
fileId: string)
: Promise<string> {
  const response = await drive.files.export(
    { fileId, mimeType: 'text/html' },
    { responseType: 'text' }
  );
  return response.data as string;
}

/** Chuyển .txt thuần thành HTML theo quy tắc heuristic (không cần AI). */
function txtToHtml(text: string): string {
  const blocks = text.
  replace(/\r\n/g, '\n').
  split(/\n{2,}/).
  map((block) => block.trim()).
  filter(Boolean);

  return blocks.
  map((block) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    const isBulletList = lines.every((line) => /^[-*]\s+/.test(line));
    const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line));

    if (isBulletList) {
      const items = lines.
      map((line) => `<li>${line.replace(/^[-*]\s+/, '')}</li>`).
      join('');
      return `<ul>${items}</ul>`;
    }
    if (isOrderedList) {
      const items = lines.
      map((line) => `<li>${line.replace(/^\d+\.\s+/, '')}</li>`).
      join('');
      return `<ol>${items}</ol>`;
    }
    return `<p>${lines.join('<br>')}</p>`;
  }).
  join('');
}

/**
 * Nhận 1 node file (Google Doc / .docx / .txt) và trả về HTML đã lọc sạch,
 * sẵn sàng lưu vào field text dài của CMS (overviewContent, locationContent...).
 */
export async function convertContentFileToHtml(
drive: drive_v3.Drive,
file: DriveNode)
: Promise<string> {
  if (file.mimeType === GOOGLE_DOC_MIME) {
    const html = await exportGoogleDocAsHtml(drive, file.id);
    return sanitizeRichTextServer(html);
  }

  if (file.mimeType === DOCX_MIME) {
    const buffer = await downloadBuffer(drive, file.id);
    const { value: html } = await mammoth.convertToHtml({ buffer });
    return sanitizeRichTextServer(html);
  }

  // Mặc định coi là .txt thuần (mimeType text/plain hoặc không xác định).
  const buffer = await downloadBuffer(drive, file.id);
  return sanitizeRichTextServer(txtToHtml(buffer.toString('utf-8')));
}

/**
 * Tìm 1 file nội dung theo tên gốc, không quan tâm đuôi (.txt/.docx hay
 * Google Doc). Báo lỗi rõ ràng nếu tồn tại nhiều hơn 1 file trùng tên khác
 * đuôi — đúng quy ước đã thống nhất, không tự ý chọn.
 */
export function findContentFileByBaseName(
children: DriveNode[],
baseName: string)
: DriveNode | undefined {
  const normalizedTarget = baseName.normalize('NFC').trim().toLowerCase();
  const matches = children.filter((child) => {
    if (isImage(child)) return false;
    const nameWithoutExt = child.name.
    normalize('NFC').
    trim().
    toLowerCase().
    replace(/\.[a-z0-9]+$/, '');
    return nameWithoutExt === normalizedTarget;
  });

  if (matches.length > 1) {
    throw new Error(
      `Có nhiều hơn 1 file trùng tên "${baseName}" (khác đuôi) trong cùng thư mục — vui lòng xóa bớt, chỉ giữ lại 1 file.`
    );
  }

  return matches[0];
}

/** Đọc nội dung 1 file caption/alt dạng .txt thuần đi kèm ảnh cùng tên (nếu có). */
export async function readCaptionIfExists(
drive: drive_v3.Drive,
children: DriveNode[],
imageName: string)
: Promise<string> {
  const captionFile = findContentFileByBaseName(children, imageBaseName(imageName));
  if (!captionFile) return '';
  const buffer = await downloadBuffer(drive, captionFile.id);
  return buffer.toString('utf-8').trim();
}

function imageBaseName(imageName: string): string {
  return imageName.replace(/\.[a-zA-Z0-9]+$/, '');
}
