import { google, drive_v3 } from 'googleapis';

let cachedAuth: InstanceType<typeof google.auth.GoogleAuth> | null = null;

/**
 * Đọc GOOGLE_SERVICE_ACCOUNT_KEY (toàn bộ nội dung file JSON của Service
 * Account, dán nguyên vào Vercel Environment Variables — KHÔNG có tiền tố
 * VITE_ vì biến này chỉ được đọc ở backend, không được lộ ra trình duyệt).
 */
export function getGoogleAuth() {
  if (cachedAuth) return cachedAuth;

  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    throw new Error(
      'Thiếu biến môi trường GOOGLE_SERVICE_ACCOUNT_KEY trên server.'
    );
  }

  let credentials: Record<string, string>;
  try {
    credentials = JSON.parse(rawKey);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY không phải JSON hợp lệ.');
  }

  cachedAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });

  return cachedAuth;
}

export function getDriveClient(): drive_v3.Drive {
  return google.drive({ version: 'v3', auth: getGoogleAuth() as any });
}
