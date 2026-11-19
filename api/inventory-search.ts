import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readProjectConfiguration, UUID_RE } from './_lib/projectConfig.js';
import {
  normalizeQuery,
  searchUnits,
  type InventorySnapshot } from
'../src/detail/unitSearch.js';

/**
 * Tra quỹ căn của một dự án theo đúng các trường của form tìm kiếm ở tab Quỹ
 * căn. Trợ lý AI Bích Ngọc gọi API này làm công cụ search_units.
 *
 *   GET  /api/inventory-search?projectId=…&propertyType=2PN&priceMax=5000000000
 *   POST /api/inventory-search  { projectId, ...điều kiện, limit }
 *
 * Chỉ trả các trường công khai (xem PublicUnit), không bao giờ có cột phụ.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const raw = (req.method === 'GET' ? req.query : req.body ?? {}) as Record<string, unknown>;
  const projectId = String(raw.projectId ?? '');
  if (!UUID_RE.test(projectId)) {
    res.status(400).json({ error: 'Thiếu hoặc sai projectId.' });
    return;
  }
  const limit = Math.min(Math.max(Number(raw.limit) || 10, 1), 50);

  try {
    const project = await readProjectConfiguration(projectId);
    if (!project) {
      res.status(404).json({ error: 'Không tìm thấy dự án.' });
      return;
    }
    const snapshot = project.configuration.inventory as InventorySnapshot | undefined;
    res.setHeader('Cache-Control', 'no-store');
    if (!snapshot?.units?.length) {
      res.status(200).json({
        projectName: project.name,
        available: false,
        message: 'Dự án chưa có bảng hàng.',
        total: 0,
        units: []
      });
      return;
    }

    const query = normalizeQuery(raw);
    const matched = searchUnits(snapshot.units, query);
    // Căn còn hàng lên trước, rồi theo giá tăng dần — khách thường muốn biết
    // căn nào mua được ngay và mức giá thấp nhất.
    const sorted = [...matched].sort((a, b) => {
      const sa = a.status === 'Còn hàng' ? 0 : 1;
      const sb = b.status === 'Còn hàng' ? 0 : 1;
      if (sa !== sb) return sa - sb;
      return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
    });

    const countByStatus: Record<string, number> = {};
    matched.forEach((unit) => {
      countByStatus[unit.status || 'Khác'] = (countByStatus[unit.status || 'Khác'] ?? 0) + 1;
    });

    res.status(200).json({
      projectName: project.name,
      available: true,
      syncedAt: snapshot.syncedAt,
      layout: snapshot.layout,
      priceLabel: snapshot.priceLabel,
      query,
      total: matched.length,
      countByStatus,
      units: sorted.slice(0, limit)
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Tra bảng hàng thất bại.'
    });
  }
}
