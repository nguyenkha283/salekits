import { FloorPlanContentBlock, FloorPlanTab, HeroSlide } from '../types/cms';

type UnknownRecord = Record<string, unknown>;

export function normalizeFloorPlanTabs(value: unknown): FloorPlanTab[] {
  if (!Array.isArray(value)) return [];

  return value.
  map((tab, index) => normalizeFloorPlanTab(tab, index)).
  filter((tab): tab is FloorPlanTab => Boolean(tab));
}

function normalizeFloorPlanTab(
value: unknown,
index: number)
: FloorPlanTab | null {
  if (!isRecord(value)) return null;

  const id =
  typeof value.id === 'string' && value.id ?
  value.id :
  `floor-plan-tab-${index + 1}`;
  const label =
  typeof value.label === 'string' && value.label.trim() ?
  value.label :
  `Mặt bằng ${index + 1}`;
  const blocks = Array.isArray(value.blocks) ?
  value.blocks.
  map((block, blockIndex) => normalizeBlock(block, id, blockIndex)).
  filter((block): block is FloorPlanContentBlock => Boolean(block)) :
  normalizeLegacyBlock(value, id);

  return { id, label, blocks };
}

function normalizeBlock(
value: unknown,
tabId: string,
index: number)
: FloorPlanContentBlock | null {
  if (!isRecord(value) || typeof value.type !== 'string') return null;
  const id =
  typeof value.id === 'string' && value.id ?
  value.id :
  `${tabId}-block-${index + 1}`;

  if (value.type === 'paragraph') {
    return {
      id,
      type: 'paragraph',
      paragraph: typeof value.paragraph === 'string' ? value.paragraph : '',
      ...(typeof value.paragraphColor === 'string' ?
      { paragraphColor: value.paragraphColor } :
      {})
    };
  }

  if (value.type === 'image') {
    const image = normalizeImage(value.image);
    return image ? { id, type: 'image', image } : null;
  }

  return null;
}

function normalizeLegacyBlock(
value: UnknownRecord,
tabId: string)
: FloorPlanContentBlock[] {
  if (value.contentType === 'paragraph') {
    return [
    {
      id: `${tabId}-paragraph-1`,
      type: 'paragraph',
      paragraph: typeof value.paragraph === 'string' ? value.paragraph : '',
      ...(typeof value.paragraphColor === 'string' ?
      { paragraphColor: value.paragraphColor } :
      {})
    }];

  }

  if (value.contentType === 'image') {
    const image = normalizeImage(value.image);
    return image ? [{ id: `${tabId}-image-1`, type: 'image', image }] : [];
  }

  return [];
}

function normalizeImage(value: unknown): HeroSlide | null {
  if (!isRecord(value) || typeof value.url !== 'string' || !value.url)
  return null;
  return {
    id: typeof value.id === 'string' && value.id ? value.id : value.url,
    name: typeof value.name === 'string' ? value.name : 'Ảnh mặt bằng',
    url: value.url,
    ...(typeof value.alt === 'string' ? { alt: value.alt } : {})
  };
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}