import type { VercelRequest, VercelResponse } from '@vercel/node';
import { patchProjectConfiguration, UUID_RE } from './_lib/projectConfig.js';
import type { InventorySnapshot, PublicUnit } from '../src/detail/unitSearch.js';

const MAX_UNITS = 10000;

const TEXT_KEYS = [
'code', 'propertyType', 'tower', 'floor', 'unit', 'direction', 'view',
'lotType', 'subdivision', 'handover', 'status', 'fund'] as
const;
const NUMBER_KEYS = ['area', 'wallArea', 'landArea', 'buildArea', 'price'] as const;

/** Chỉ giữ đúng các trường công khai — chặn client gửi kèm dữ liệu nội bộ. */
function cleanUnit(raw: Record<string, unknown>): PublicUnit {
  const unit = {} as Record<string, unknown>;
  for (const key of TEXT_KEYS) unit[key] = String(raw[key] ?? '').slice(0, 200);
  for (const key of NUMBER_KEYS) {
    const value = raw[key];
    unit[key] = typeof value === 'number' && Number.isFinite(value) ? value : null;
  }
  return unit as unknown as PublicUnit;
}

/**
 * Lưu bản chụp quỹ căn (sau mỗi lần nhập / đồng bộ bảng hàng trong CMS) vào
 * configuration.inventory, để trợ lý AI Bích Ngọc tra cứu phía server.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { projectId, snapshot } = (req.body ?? {}) as {
    projectId?: string;
    snapshot?: Partial<InventorySnapshot>;
  };

  if (typeof projectId !== 'string' || !UUID_RE.test(projectId)) {
    res.status(400).json({ error: 'Thiếu hoặc sai projectId.' });
    return;
  }
  if (!snapshot || !Array.isArray(snapshot.units)) {
    res.status(400).json({ error: 'Thiếu dữ liệu quỹ căn.' });
    return;
  }
  if (snapshot.units.length > MAX_UNITS) {
    res.status(413).json({ error: `Bảng hàng vượt quá ${MAX_UNITS} căn.` });
    return;
  }

  const clean: InventorySnapshot = {
    syncedAt: typeof snapshot.syncedAt === 'string' ? snapshot.syncedAt : new Date().toISOString(),
    layout: snapshot.layout === 'thap-tang' ? 'thap-tang' : 'cao-tang',
    priceLabel: String(snapshot.priceLabel ?? 'Giá').slice(0, 120),
    units: snapshot.units.map((unit) => cleanUnit(unit as unknown as Record<string, unknown>))
  };

  try {
    await patchProjectConfiguration(projectId, { inventory: clean });
    res.status(200).json({ ok: true, units: clean.units.length, syncedAt: clean.syncedAt });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Lưu bảng hàng thất bại.'
    });
  }
}
