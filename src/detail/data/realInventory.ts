/**
 * Bảng hàng THẬT — trích từ file "QUỸ CHUNG IMPERIA SKY PARK từ 12/06/2026".
 *
 * Đây là MỘT sheet quỹ, không phải toàn bộ bảng hàng của dự án: 55 căn thuộc
 * 4 tòa, nên lưới hiển thị chỉ phủ khoảng 20% số ô. Đó là hiện trạng dữ liệu
 * thật, không phải lỗi hiển thị.
 *
 * Sinh từ file gốc — không sửa tay.
 */

/** Sáu cột giá trong file, theo đúng thứ tự. */
export const PRICE_COLUMNS = [
{ id: 'base-novat', group: 'Giá tiêu chuẩn', label: 'TGT chưa VAT', short: 'Chưa VAT' },
{ id: 'base-vat', group: 'Giá tiêu chuẩn', label: 'TGT căn hộ (có VAT, chưa PBT)', short: 'Có VAT' },
{ id: 'base-total', group: 'Giá tiêu chuẩn', label: 'Tổng giá trị HĐMB (có VAT và PBT)', short: 'Tổng HĐMB' },
{ id: 'rate-novat', group: 'Chính sách ổn định lãi suất', label: 'TGT chưa VAT', short: 'CS · chưa VAT' },
{ id: 'rate-vat', group: 'Chính sách ổn định lãi suất', label: 'TGT căn hộ (có VAT, chưa PBT)', short: 'CS · có VAT' },
{ id: 'rate-total', group: 'Chính sách ổn định lãi suất', label: 'Tổng giá trị HĐMB (có VAT và PBT)', short: 'CS · tổng HĐMB' }] as const;

export type PriceColumnId = (typeof PRICE_COLUMNS)[number]['id'];

export type RealUnitStatus = 'Còn hàng' | 'Đã lock' | 'Đã cọc' | 'Đã bán';

export interface RealUnit {
  /** Mã căn ĐỌC TỪ FILE, không sinh lại. */
  code: string;
  tower: string;
  /** Chuỗi vì có tầng 05A, 12A, 15A. */
  floor: string;
  /** Chuỗi vì có căn 05A, 08A, 15A. */
  unit: string;
  /** Diện tích thông thủy (m2). File không có diện tích tim tường. */
  area: number;
  bedrooms: string;
  handover: string;
  status: RealUnitStatus;
  /** Sáu giá trị theo đúng thứ tự PRICE_COLUMNS. */
  prices: [number, number, number, number, number, number];
}

/** Ghi chú pháp lý bắt buộc hiển thị kèm bảng hàng. */
export const SHEET_NOTICE =
'Thông tin diện tích và giá bán tại bảng này là tạm tính để tham khảo. Thông tin chính thức sẽ được công bố tại thời điểm ký Hợp đồng mua bán.';

export const SHEET_NAME = 'Quỹ chung Imperia Sky Park';
export const SHEET_EFFECTIVE_DATE = '12/06/2026';

export const REAL_UNITS: RealUnit[] = [
{ code: 'E1.0305', tower: 'E1', floor: '03', unit: '05', area: 65.27, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5432422100, 5975664310, 6084312752, 5704043205, 6274447526, 6388528390] },
{ code: 'E1.2805', tower: 'E1', floor: '28', unit: '05', area: 67.24, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5988132164, 6586945380, 6706708023, 6287538772, 6916292649, 7042043424] },
{ code: 'E1.15A05', tower: 'E1', floor: '15A', unit: '05', area: 66.44, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5833940266, 6417334293, 6534013098, 6125637313, 6738201044, 6860713790] },
{ code: 'E1.05A08', tower: 'E1', floor: '05A', unit: '08', area: 68.66, bedrooms: '2PN+1', handover: 'HTCB', status: 'Còn hàng', prices: [5514561787, 6066017966, 6176309202, 5790289911, 6369318902, 6485124700] },
{ code: 'E1.0610', tower: 'E1', floor: '06', unit: '10', area: 67.5, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5603979938, 6164377932, 6276457531, 5884178918, 6472596810, 6590280388] },
{ code: 'E1.1010', tower: 'E1', floor: '10', unit: '10', area: 67.5, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5758475625, 6334323188, 6449492701, 6046399440, 6651039384, 6771967373] },
{ code: 'E1.05A10', tower: 'E1', floor: '05A', unit: '10', area: 67.34, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5464590495, 6011049545, 6120341355, 5737820053, 6311602058, 6426358459] },
{ code: 'E1.1115', tower: 'E1', floor: '11', unit: '15', area: 65.25, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5566526438, 6123179082, 6234509611, 5844852792, 6429338071, 6546235127] },
{ code: 'E1.3715', tower: 'E1', floor: '37', unit: '15', area: 65.49, bedrooms: '2PN', handover: 'Thô', status: 'Còn hàng', prices: [5101317354, 5611449089, 5713475436, 5379304722, 5917235194, 6024821288] },
{ code: 'E1.1716', tower: 'E1', floor: '17', unit: '16', area: 65.25, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5647987800, 6212786580, 6325746336, 5930387190, 6523425909, 6642033653] },
{ code: 'E1.05A16', tower: 'E1', floor: '05A', unit: '16', area: 65.06, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5333719643, 5867091607, 5973766000, 5600405658, 6160446224, 6272454337] },
{ code: 'E1.0518', tower: 'E1', floor: '05', unit: '18', area: 66.69, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5689373918, 6258311310, 6372098788, 5973842647, 6571226912, 6690703765] },
{ code: 'E1.1818', tower: 'E1', floor: '18', unit: '18', area: 67.61, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [6105490626, 6716039689, 6838149502, 6410765191, 7051841710, 7180057014] },
{ code: 'E1.15A18', tower: 'E1', floor: '15A', unit: '18', area: 67.61, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5936675217, 6530342739, 6649076243, 6233509011, 6856859912, 6981530092] },
{ code: 'E1.1805A', tower: 'E1', floor: '18', unit: '05A', area: 65.79, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5995893362, 6595482698, 6715400565, 6295688062, 6925256868, 7051170629] },
{ code: 'E1.05A05A', tower: 'E1', floor: '05A', unit: '05A', area: 64.65, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5488435890, 6037279479, 6147048197, 5762857685, 6339143454, 6454400608] },
{ code: 'E1.0515A', tower: 'E1', floor: '05', unit: '15A', area: 67.16, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5729469970, 6302416967, 6417006366, 6015943502, 6617537852, 6737856722] },
{ code: 'S1.0501', tower: 'S1', floor: '05', unit: '01', area: 64.4, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5386812060, 5925493266, 6033229507, 5656152695, 6221767965, 6334891019] },
{ code: 'S1.05A01', tower: 'S1', floor: '05A', unit: '01', area: 64.4, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5360012000, 5896013200, 6003213440, 5628012600, 6190813860, 6303374112] },
{ code: 'S1.1906', tower: 'S1', floor: '19', unit: '06', area: 66.98, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [6006788169, 6607466986, 6727602749, 6307127560, 6937840316, 7063982867] },
{ code: 'S1.3406', tower: 'S1', floor: '34', unit: '06', area: 67.55, bedrooms: '2PN', handover: 'Thô', status: 'Còn hàng', prices: [5430445825, 5973490408, 6082099325, 5725610616, 6298171678, 6412683890] },
{ code: 'S1.12A06', tower: 'S1', floor: '12A', unit: '06', area: 66.98, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5839545807, 6423500388, 6540291304, 6131523080, 6744675388, 6867305850] },
{ code: 'S1.3208', tower: 'S1', floor: '32', unit: '08', area: 69.35, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5829720505, 6412692556, 6529286966, 6121206530, 6733327183, 6855751314] },
{ code: 'S1.3508', tower: 'S1', floor: '35', unit: '08', area: 69.35, bedrooms: '2PN', handover: 'Thô', status: 'Còn hàng', prices: [5286550500, 5815205550, 5920936560, 5575150525, 6132665578, 6244168589] },
{ code: 'S1.15A08', tower: 'S1', floor: '15A', unit: '08', area: 69.1, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5722437035, 6294680739, 6409129480, 6008558921, 6609414813, 6729585991] },
{ code: 'S1.1610', tower: 'S1', floor: '16', unit: '10', area: 57.26, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4908722294, 5399594523, 5497768969, 5154158409, 5669574250, 5772657418] },
{ code: 'S1.2110', tower: 'S1', floor: '21', unit: '10', area: 57.51, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4978019592, 5475821551, 5575381943, 5226920572, 5749612629, 5854151040] },
{ code: 'S1.1611', tower: 'S1', floor: '16', unit: '11', area: 57.02, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4888147838, 5376962622, 5474725579, 5132555230, 5645810753, 5748461858] },
{ code: 'S1.3511', tower: 'S1', floor: '35', unit: '11', area: 57.33, bedrooms: '2PN', handover: 'Thô', status: 'Còn hàng', prices: [4394123780, 4833536158, 4921418634, 4633895497, 5097285047, 5189962957] },
{ code: 'S1.05A11', tower: 'S1', floor: '05A', unit: '11', area: 56.87, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4614957848, 5076453633, 5168752790, 4845705768, 5330276345, 5427190460] },
{ code: 'S1.3415A', tower: 'S1', floor: '34', unit: '15A', area: 69.11, bedrooms: '2PN+1', handover: 'Thô', status: 'Còn hàng', prices: [5397675869, 5937443456, 6045396973, 5691748180, 6260922998, 6374757962] },
{ code: 'S2.0801', tower: 'S2', floor: '08', unit: '01', area: 68.94, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5780910272, 6359001299, 6474619504, 6069955768, 6676951345, 6798350460] },
{ code: 'S2.05A01', tower: 'S2', floor: '05A', unit: '01', area: 68.94, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5651808057, 6216988863, 6330025024, 5934398494, 6527838343, 6646526313] },
{ code: 'S2.08A01', tower: 'S2', floor: '08A', unit: '01', area: 68.94, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5723531510, 6295884661, 6410355291, 6009708068, 6610678875, 6730873036] },
{ code: 'S2.05A03', tower: 'S2', floor: '05A', unit: '03', area: 66.88, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5677750848, 6245525933, 6359080950, 5961638390, 6557802229, 6677034997] },
{ code: 'S2.05A08', tower: 'S2', floor: '05A', unit: '08', area: 64.4, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5440412180, 5984453398, 6093261642, 5712432821, 6283676103, 6397924759] },
{ code: 'S2.0811', tower: 'S2', floor: '08', unit: '11', area: 68.45, bedrooms: '2PN+1', handover: 'HTCB', status: 'Còn hàng', prices: [5896491773, 6486140950, 6604070785, 6191316395, 6810448035, 6934274363] },
{ code: 'S2.2911', tower: 'S2', floor: '29', unit: '11', area: 69.11, bedrooms: '2PN+1', handover: 'Thô', status: 'Còn hàng', prices: [5541476502, 6095624152, 6206453682, 5842738810, 6427012691, 6543867467] },
{ code: 'S2.0615', tower: 'S2', floor: '06', unit: '15', area: 57.1, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4752433000, 5227676300, 5322724960, 4990054650, 5489060115, 5588861208] },
{ code: 'S2.0815', tower: 'S2', floor: '08', unit: '15', area: 57.1, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4835600578, 5319160636, 5415872648, 5077380592, 5585118651, 5686666263] },
{ code: 'S3.0501', tower: 'S3', floor: '05', unit: '01', area: 64.4, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5467212240, 6013933464, 6123277709, 5740572852, 6314630137, 6429441594] },
{ code: 'S3.1901', tower: 'S3', floor: '19', unit: '01', area: 64.49, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5863998312, 6450398143, 6567678109, 6157198228, 6772918051, 6896062016] },
{ code: 'S3.0505', tower: 'S3', floor: '05', unit: '05', area: 68.27, bedrooms: '2PN+1', handover: 'HTCB', status: 'Còn hàng', prices: [5738933221, 6312826543, 6427605207, 6025879882, 6628467870, 6748985468] },
{ code: 'S3.0506', tower: 'S3', floor: '05', unit: '06', area: 66.88, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5733415072, 6306756579, 6421424880, 6020085826, 6622094409, 6742496126] },
{ code: 'S3.15A06', tower: 'S3', floor: '15A', unit: '06', area: 66.98, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5909230124, 6500153136, 6618337738, 6204691630, 6825160793, 6949254626] },
{ code: 'S3.0608', tower: 'S3', floor: '06', unit: '08', area: 68.94, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5681062746, 6249169021, 6362790276, 5965115883, 6561627471, 6680929789] },
{ code: 'S3.2408', tower: 'S3', floor: '24', unit: '08', area: 69.35, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [6073825570, 6681208127, 6802684638, 6377516849, 7015268534, 7142818871] },
{ code: 'S3.05A09', tower: 'S3', floor: '05A', unit: '09', area: 52.5, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4478817000, 4926698700, 5016275040, 4702757850, 5173033635, 5267088792] },
{ code: 'S3.1210', tower: 'S3', floor: '12', unit: '10', area: 57.26, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4980211404, 5478232544, 5577836772, 5229221974, 5752144171, 5856728610] },
{ code: 'S3.2110', tower: 'S3', floor: '21', unit: '10', area: 57.51, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [5145551973, 5660107170, 5763018209, 5402829572, 5943112529, 6051169120] },
{ code: 'S3.1211', tower: 'S3', floor: '12', unit: '11', area: 57.02, bedrooms: '2PN', handover: 'HTCB', status: 'Còn hàng', prices: [4959337308, 5455271039, 5554457785, 5207304173, 5728034590, 5832180673] },
{ code: 'S3.1911', tower: 'S3', floor: '19', unit: '11', area: 57.02, bedrooms: '2PN', handover: 'HTCB', status: 'Đã lock', prices: [5101710546, 5611881601, 5713915812, 5356796073, 5892475680, 5999611601] },
{ code: 'S3.2116', tower: 'S3', floor: '21', unit: '16', area: 55.56, bedrooms: '2PN', handover: 'HTCB', status: 'Đã lock', prices: [4890157848, 5379173633, 5476976790, 5134665740, 5648132314, 5750825629] },
{ code: 'S1.3202', tower: 'S1', floor: '32', unit: '02', area: 44.02, bedrooms: '1PN+1', handover: 'HTCB', status: 'Đã cọc', prices: [3764538677, 4140992545, 4216283319, 3952765599, 4348042159, 4427097471] },
{ code: 'S2.15A08A', tower: 'S2', floor: '15A', unit: '08A', area: 43.57, bedrooms: '1PN+1', handover: 'HTCB', status: 'Đã cọc', prices: [3762318516, 4138550368, 4213796738, 3950434431, 4345477874, 4424486563] }];

export const REAL_TOWERS = ["E1", "S1", "S2", "S3"];

/** Thứ tự tầng: KHÔNG sort số được vì có 05A, 12A, 15A. */
function floorRank(value: string): [number, string] {
  const match = value.match(/^(\d+)([A-Z]*)$/);
  return match ? [Number(match[1]), match[2]] : [999, value];
}

function compareLabel(a: string, b: string): number {
  const [na, sa] = floorRank(a);
  const [nb, sb] = floorRank(b);
  return na - nb || sa.localeCompare(sb);
}

/** Danh sách tầng và căn CÓ MẶT trong dữ liệu của một tòa. */
export function axesOf(tower: string) {
  const units = REAL_UNITS.filter((item) => item.tower === tower);
  return {
    floors: [...new Set(units.map((item) => item.floor))].sort(compareLabel).reverse(),
    columns: [...new Set(units.map((item) => item.unit))].sort(compareLabel)
  };
}

export function unitAt(tower: string, floor: string, column: string) {
  return REAL_UNITS.find(
    (item) => item.tower === tower && item.floor === floor && item.unit === column
  );
}

/** Rút gọn thành "6,08 tỷ" để vừa ô lưới. */
export function shortPrice(value: number): string {
  return `${(value / 1e9).toFixed(2).replace('.', ',')} tỷ`;
}

export function fullPrice(value: number): string {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

/** Đơn giá mỗi m2, tính từ cột giá đang chọn. */
export function unitPrice(value: number, area: number): string {
  return `${(value / area / 1e6).toFixed(1).replace('.', ',')} tr/m²`;
}
