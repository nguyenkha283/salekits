import { getSupabaseClient } from './supabaseClient.js';

export interface ContactInput {
  name?: string;
  phone?: string;
  dob?: string;
  note?: string;
  createdBy?: string;
}

/**
 * Chuẩn hóa số điện thoại — phải khớp với hàm contact_normalize_phone trong
 * supabase/schema-dau-moi-lien-he.sql và normalizePhone ở frontend. Ba nơi lệch
 * nhau là lọt bản ghi trùng.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (/^84[0-9]{9}$/.test(digits)) return `0${digits.slice(2)}`;
  if (/^[1-9][0-9]{8}$/.test(digits)) return `0${digits}`;
  return digits;
}

export function isValidPhone(input: string): boolean {
  return /^0[0-9]{8,10}$/.test(normalizePhone(input));
}

/**
 * Tra đầu mối theo số điện thoại, chưa có thì tạo mới.
 *
 * Không dùng upsert vì hai lý do: cột khóa `phone_key` là cột sinh nên không
 * ghi thẳng được, và khi bản ghi đã tồn tại thì phải GIỮ NGUYÊN thông tin cũ —
 * ghi đè sẽ xóa mất ghi chú mà APM của dự án khác đã nhập.
 *
 * Trả về id của đầu mối, hoặc null nếu đầu vào không đủ để tạo bản ghi.
 */
export async function findOrCreateContact(
propertyOwnerId: string,
contact: ContactInput)
: Promise<{id: string;reused: boolean;} | null> {
  const phone = (contact.phone ?? '').trim();
  if (!phone || !isValidPhone(phone)) return null;

  const supabase = getSupabaseClient();
  const phoneKey = normalizePhone(phone);

  const { data: existing, error: lookupError } = await supabase.
  from('project_contacts').
  select('id').
  eq('phone_key', phoneKey).
  maybeSingle();

  if (lookupError) {
    throw new Error(`Tra đầu mối thất bại: ${lookupError.message}`);
  }
  if (existing) {
    return { id: existing.id as string, reused: true };
  }

  const name = (contact.name ?? '').trim();
  if (!name) return null;

  const { data, error } = await supabase.
  from('project_contacts').
  insert({
    property_owner_id: propertyOwnerId,
    name,
    phone,
    dob: contact.dob?.trim() ? contact.dob : null,
    note: contact.note?.trim() ? contact.note.trim() : null,
    created_by: contact.createdBy ?? 'unknown'
  }).
  select('id').
  single();

  if (error) {
    // Hai yêu cầu cùng số gửi lên sát nhau: bản sau bị ràng buộc duy nhất chặn,
    // tra lại để lấy bản ghi bản trước vừa tạo thay vì báo lỗi cho người dùng.
    const { data: raced } = await supabase.
    from('project_contacts').
    select('id').
    eq('phone_key', phoneKey).
    maybeSingle();
    if (raced) return { id: raced.id as string, reused: true };

    throw new Error(`Tạo đầu mối thất bại: ${error.message}`);
  }

  return { id: data.id as string, reused: false };
}
