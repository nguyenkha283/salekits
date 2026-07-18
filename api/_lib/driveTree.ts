import type { drive_v3 } from 'googleapis';

export interface DriveNode {
  id: string;
  name: string;
  mimeType: string;
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

/** Trích ID folder từ link dạng https://drive.google.com/drive/folders/<ID>... */
export function extractFolderId(driveUrl: string): string {
  const match = driveUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    throw new Error('Link Drive không đúng định dạng folder.');
  }
  return match[1];
}

function normalize(name: string): string {
  return name.normalize('NFC').trim().toLowerCase();
}

/** Bỏ số thứ tự dạng "01. " ở đầu tên để so khớp không phụ thuộc số. */
function stripOrderPrefix(name: string): string {
  return name.replace(/^\d+\.\s*/, '');
}

export async function listChildren(
  drive: drive_v3.Drive,
  folderId: string
): Promise<DriveNode[]> {
  const nodes: DriveNode[] = [];
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageToken,
      pageSize: 200,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    nodes.push(...(response.data.files ?? []).map((file) => ({
      id: file.id ?? '',
      name: file.name ?? '',
      mimeType: file.mimeType ?? ''
    })));
    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  // Đã có số thứ tự ở đầu tên (vd "01. ") nên sort theo tên giữ đúng thứ tự.
  return nodes.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
}

/**
 * Tìm 1 thư mục/file con theo tên, bỏ qua số thứ tự đầu, không phân biệt
 * hoa/thường, có chuẩn hóa Unicode NFC để tránh lệch dấu giữa các hệ điều hành.
 */
export function findChildByName(
  children: DriveNode[],
  targetName: string,
  options: { folderOnly?: boolean } = {}
): DriveNode | undefined {
  const target = normalize(stripOrderPrefix(targetName));
  return children.find((child) => {
    if (options.folderOnly && child.mimeType !== FOLDER_MIME) return false;
    return normalize(stripOrderPrefix(child.name)) === target;
  });
}

export function isFolder(node: DriveNode): boolean {
  return node.mimeType === FOLDER_MIME;
}

export function isImage(node: DriveNode): boolean {
  return node.mimeType.startsWith('image/');
}

/** Tên file bỏ đuôi mở rộng và số thứ tự đầu — dùng làm label (vd tên tab mặt bằng). */
export function fileLabel(name: string): string {
  return stripOrderPrefix(name).replace(/\.[a-zA-Z0-9]+$/, '').trim();
}
