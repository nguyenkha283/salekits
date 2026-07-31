import type { UnitDetail } from '../components/UnitDetailModal';

export type Building = 'Tòa 1' | 'Tòa 2' | 'Tòa 3' | 'Tòa 4';

export interface FundInventoryRow {
  id: string;
  building: Building;
  buildingCode: string;
  floor: string;
  unit: string;
  apartmentType: string;
  direction: string;
  area: string;
  detail: UnitDetail;
}

export const BUILDINGS: Building[] = ['Tòa 1', 'Tòa 2', 'Tòa 3', 'Tòa 4'];
export const UNIT_CODES = Array.from({ length: 19 }, (_, index) => String(index + 1).padStart(2, '0'));
export const FLOORS = Array.from({ length: 16 }, (_, index) => String(index + 4).padStart(2, '0'));

export const UNIT_TYPES = ['STU', '2 BR', '2 BR', '2 BR+1', '2 BR+1', '2 BR', '2 BR', 'STU', '1 BR+1', '2 BR+1', 'STU', '1 BR+1', 'STU', '3 BR', '3 BR', 'STU', '2 BR', '2 BR', '2 BR+1'];
export const UNIT_AREAS = ['29.7', '54.4', '54.4', '63', '63.3', '54.3', '54.4', '30.3', '43', '64', '30.1', '43.1', '24.6', '87', '83.4', '26.9', '54.2', '54.4', '63.3'];
export const UNIT_DIRECTIONS = ['ĐN', 'ĐN', 'ĐN', 'ĐN-TN', 'TN-TB', 'TB', 'TB', 'TB', 'TB', 'TB-ĐB', 'TB', 'TB', 'TB', 'TB-ĐB', 'ĐN-ĐB', 'ĐN', 'ĐN', 'ĐN', 'ĐN-TN'];

export const BUILDING_CODES: Record<Building, string> = {
  'Tòa 1': 'T1',
  'Tòa 2': 'T2',
  'Tòa 3': 'T3',
  'Tòa 4': 'T4'
};

export const DIRECTION_NAMES: Record<string, string> = {
  'ĐN': 'Đông Nam',
  'ĐN-TN': 'Đông Nam - Tây Nam',
  'TN-TB': 'Tây Nam - Tây Bắc',
  'TB': 'Tây Bắc',
  'TB-ĐB': 'Tây Bắc - Đông Bắc',
  'ĐN-ĐB': 'Đông Nam - Đông Bắc'
};

/** The inventory source used by both Bảng hàng and Quỹ căn. */
export const INVENTORY_BY_BUILDING: Record<Building, Record<string, UnitDetail>> = {
  'Tòa 1': createDenseTowerOneInventory(),
  'Tòa 2': createVariantInventory(['04-02', '05-06', '06-11', '07-15', '08-03', '09-08', '10-13', '11-17', '12-05', '13-10', '14-14', '15-18']),
  'Tòa 3': createVariantInventory(['04-04', '05-09', '06-14', '07-18', '08-02', '09-07', '10-12', '11-16', '12-04', '13-09', '14-13', '15-17']),
  'Tòa 4': createVariantInventory(['04-05', '05-10', '06-15', '07-01', '08-06', '09-11', '10-16', '11-03', '12-08', '13-12', '14-17', '15-02'])
};

function createVariantInventory(positions: string[]): Record<string, UnitDetail> {
  const statuses: UnitDetail['status'][] = ['Còn hàng', 'Đã lock', 'Đã cọc', 'Đã bán'];

  return positions.reduce<Record<string, UnitDetail>>((inventory, position, index) => {
    inventory[position] = {
      fund: index % 2 === 0 ? 'exclusive' : 'cross',
      price: `${(5.18 + index * 0.27).toFixed(2)} tỷ`,
      status: statuses[index % statuses.length]
    };
    return inventory;
  }, {});
}

function createDenseTowerOneInventory(): Record<string, UnitDetail> {
  const inventory: Record<string, UnitDetail> = {
    '04-03': { fund: 'cross', price: '5.32 tỷ', status: 'Còn hàng' },
    '05-11': { fund: 'exclusive', price: '6.28 tỷ', status: 'Còn hàng' },
    '06-16': { fund: 'cross', price: '5.61 tỷ', status: 'Đã cọc' },
    '07-08': { fund: 'exclusive', price: '5.94 tỷ', status: 'Đã lock' },
    '08-14': { fund: 'cross', price: '7.02 tỷ', status: 'Còn hàng' },
    '09-04': { fund: 'exclusive', price: '7.14 tỷ', status: 'Còn hàng' },
    '10-18': { fund: 'exclusive', price: '6.41 tỷ', status: 'Đã bán' },
    '11-06': { fund: 'cross', price: '5.77 tỷ', status: 'Đã lock' },
    '12-16': { fund: 'cross', price: '5.86 tỷ', status: 'Đã cọc' },
    '13-02': { fund: 'exclusive', price: '5.48 tỷ', status: 'Còn hàng' },
    '14-12': { fund: 'cross', price: '6.96 tỷ', status: 'Đã bán' },
    '15-09': { fund: 'exclusive', price: '6.63 tỷ', status: 'Đã cọc' },
    '16-17': { fund: 'cross', price: '5.96 tỷ', status: 'Còn hàng' },
    '17-07': { fund: 'cross', price: '6.72 tỷ', status: 'Đã bán' },
    '18-13': { fund: 'exclusive', price: '7.38 tỷ', status: 'Đã lock' },
    '19-05': { fund: 'cross', price: '5.69 tỷ', status: 'Còn hàng' }
  };
  const emptyCells = new Set(['04-01', '04-18', '05-05', '06-10', '07-15', '08-02', '09-17', '10-06', '11-12', '12-04', '13-19', '14-08', '15-03', '16-15', '17-10', '18-01', '19-18']);
  const statuses: UnitDetail['status'][] = ['Còn hàng', 'Còn hàng', 'Đã lock', 'Còn hàng', 'Đã cọc', 'Còn hàng', 'Đã bán'];

  FLOORS.forEach((floor, floorIndex) => {
    UNIT_CODES.forEach((unit, unitIndex) => {
      const key = `${floor}-${unit}`;
      if (inventory[key] || emptyCells.has(key)) return;

      const sequence = floorIndex * UNIT_CODES.length + unitIndex;
      inventory[key] = {
        fund: sequence % 2 === 0 ? 'exclusive' : 'cross',
        price: `${(4.82 + (floorIndex * 19 + unitIndex * 7) % 289 / 100).toFixed(2)} tỷ`,
        status: statuses[sequence % statuses.length]
      };
    });
  });

  return Object.fromEntries(Object.entries(inventory).filter((_, index) => index % 2 === 0));
}

export function getFundInventoryRows(): FundInventoryRow[] {
  return Object.entries(INVENTORY_BY_BUILDING).
  flatMap(([buildingName, units]) => Object.entries(units).map(([position, detail]) => {
    const building = buildingName as Building;
    const [floor, unit] = position.split('-');
    const columnIndex = UNIT_CODES.indexOf(unit);
    return {
      id: `${BUILDING_CODES[building]}-${floor}-${unit}`,
      building,
      buildingCode: BUILDING_CODES[building],
      floor,
      unit,
      apartmentType: UNIT_TYPES[columnIndex],
      direction: DIRECTION_NAMES[UNIT_DIRECTIONS[columnIndex]],
      area: UNIT_AREAS[columnIndex],
      detail
    };
  })).
  sort((a, b) => a.id.localeCompare(b.id));
}