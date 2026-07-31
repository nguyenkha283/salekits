import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  PhoneIcon,
  RulerIcon,
  TreesIcon,
  XIcon } from
'lucide-react';
import { InlineRichText, InlineText } from './InlineRichText';
import { HIERARCHY_OPTIONS } from '../sectionRegistry';

interface OverviewContentProps {
  tabs: React.ReactNode;
  /** Dữ liệu đồng bộ từ Google Drive — có thì thay dữ liệu mẫu, không thì giữ nguyên. */
  heroSlides?: string[];
  overviewImage?: string;
  overviewHtml?: string;
  locationImage?: string;
  locationHtml?: string;
  amenities?: {image: string;title: string;}[];
  stats?: {value: string;label: string;}[];
  /** Dòng cấp độ trên tiêu đề hero — chọn từ danh sách. */
  hierarchy?: string;
  /** Tên dự án, lấy từ bước Khởi tạo dự án. */
  projectName?: string;
  /** Slogan hiển thị dưới tên dự án. */
  tagline?: string;
  /** Bật sửa chữ trực tiếp trên trang khi đang ở CMS. */
  editing?: {
    enabled: boolean;
    onChange: (field: string, value: string) => void;
    onFocusBlock?: (element: HTMLElement | null) => void;
  };
  floorPlans?: {key: string;label: string;title: string;image: string;}[];
}

const IMAGES = {
  hero: '/af90a9a2-cfa1-4e06-bf16-c3467b5c5fff.jpg',
  heroSeries: '/f757d0c2-1880-4786-9ade-d83bdf5ffd51.jpg',
  heroBanner: '/f04fab1e-81cd-4b76-9643-996fa55133e2.jpg',
  overview: '/bc3b6fbd-aac1-4c49-be3b-976b35aa7a67.jpg',
  location: '/73dda9ab-a667-4bd9-a168-fc13267d6901.jpg',
  lakeside: "/73dda9ab-a667-4bd9-a168-fc13267d6901.jpg",
  communityLounge: "/07cbf50c-5744-4f14-b5ff-5cc571eb8411.jpg",
  infinityPool: "/fe21ba4f-5222-446a-beea-10c7a3640e0f.jpg",
  gardenWalk: "/688da3c2-8d95-4650-9f33-bb0bfb6d4692.jpg",
  hotelLobby: "/ebd3240e-6608-4c50-8739-cfe41926dd74.jpg",
  skyLounge: "/85bed7b1-ee07-4e5d-ae92-d9ea75fb82be.jpg",
  fitnessYoga: "/ffbb15b7-c56b-4b5d-b7e3-ed3affc9fd36.jpg",
  kidsPlay: "/622df78d-e579-4f25-aef4-6c31185313c8.jpg",
  bbqGarden: "/af1ffc9b-36a7-4608-9ff1-165cbcf660be.jpg"
};

const DEFAULT_HERO_SLIDES = [
IMAGES.hero,
IMAGES.heroSeries,
IMAGES.heroBanner];


const PRODUCTS = [
{ image: IMAGES.overview, title: 'Căn hộ Studio', description: 'Thiết kế tối ưu cho nhịp sống trẻ trung, riêng tư và linh hoạt.' },
{ image: IMAGES.hero, title: 'Căn hộ 2 phòng ngủ', description: 'Không gian cân bằng cho một gia đình hiện đại, luôn đầy ắp ánh sáng.' },
{ image: IMAGES.heroSeries, title: 'Căn hộ 3 phòng ngủ', description: 'Một chốn về rộng rãi, tinh tế, mở ra những khoảnh khắc sum vầy.' },
{ image: IMAGES.heroBanner, title: 'Căn hộ Dual Key', description: 'Hai không gian độc lập trong một căn hộ, linh hoạt ở và cho thuê.' },
{ image: IMAGES.skyLounge, title: 'Căn hộ Sky Villa', description: 'Đặc quyền trên cao với tầm nhìn toàn cảnh và không gian mở rộng rãi.' },
{ image: IMAGES.lakeside, title: 'Căn hộ Duplex', description: 'Hai tầng thông nhau, tôn vinh chiều cao và ánh sáng tự nhiên.' }];


const DEFAULT_FEATURED_STATS = [
{ value: '150+', label: 'Căn hộ bàn giao' },
{ value: '100+', label: 'Tiện ích nội khu' },
{ value: '200+', label: 'Khách hàng hài lòng' }];


/** Mặt bằng từng tầng — thay `image` bằng file bản vẽ thật khi có. */
const DEFAULT_FLOOR_PLANS = [
{ key: 'sky2', label: 'SKY 2', title: 'Mặt bằng tầng điển hình — Sky 2', image: '/ebd3240e-6608-4c50-8739-cfe41926dd74.jpg' },
{ key: 'sky2-t30', label: 'SKY 2 TẦNG 30', title: 'Mặt bằng tầng điển hình — Sky 2, tầng 30', image: '/85bed7b1-ee07-4e5d-ae92-d9ea75fb82be.jpg' },
{ key: 'sky2-t31', label: 'SKY 2 TẦNG 31', title: 'Mặt bằng tầng điển hình — Sky 2, tầng 31', image: '/fe21ba4f-5222-446a-beea-10c7a3640e0f.jpg' }];


/** Tiện ích — hiển thị 7 ô đầu, phần còn lại gộp vào lớp phủ ở ô cuối. */
const DEFAULT_AMENITIES = [
{ image: IMAGES.lakeside, title: 'Không gian xanh bên hồ' },
{ image: IMAGES.communityLounge, title: 'Sảnh sinh hoạt cộng đồng' },
{ image: IMAGES.infinityPool, title: 'Bể bơi vô cực' },
{ image: IMAGES.gardenWalk, title: 'Vườn dạo bộ nội khu' },
{ image: IMAGES.hotelLobby, title: 'Sảnh đón chuẩn khách sạn' },
{ image: IMAGES.skyLounge, title: 'Sky lounge tầng thượng' },
{ image: IMAGES.fitnessYoga, title: 'Phòng gym & yoga' },
{ image: IMAGES.kidsPlay, title: 'Khu vui chơi trẻ em' },
{ image: IMAGES.lakeside, title: 'Công viên trung tâm' },
{ image: IMAGES.bbqGarden, title: 'Khu BBQ ngoài trời' }];


const VISIBLE_AMENITIES = 7;

const DEFAULT_OVERVIEW_TEXT =
'Imperia Sky Park hướng tới một chuẩn sống cân bằng: không gian riêng tư đủ tĩnh tại, những kết nối đủ đầy và cảnh quan xanh len vào từng nhịp sống.';
const DEFAULT_LOCATION_TEXT =
'Tọa lạc tại Minh Khai, Imperia Sky Park đưa bạn đến gần hơn với nhịp sống trung tâm, đồng thời gìn giữ một khoảng riêng yên bình để trở về.';

/** Vị trí từng ô trong lưới mosaic ở breakpoint lg (4 cột × 6 hàng). */
const MOSAIC_POSITIONS = [
'lg:col-start-1 lg:row-start-1 lg:row-span-6',
'lg:col-start-2 lg:row-start-1 lg:row-span-4',
'lg:col-start-2 lg:row-start-5 lg:row-span-2',
'lg:col-start-3 lg:row-start-1 lg:row-span-3',
'lg:col-start-3 lg:row-start-4 lg:row-span-3',
'lg:col-start-4 lg:row-start-1 lg:row-span-2',
'lg:col-start-4 lg:row-start-3 lg:row-span-4'];



function scrollCarousel(element: HTMLDivElement | null, direction: number) {
  element?.scrollBy({ left: direction * Math.min(element.clientWidth * 0.82, 420), behavior: 'smooth' });
}

export function OverviewContent({
  tabs,
  heroSlides,
  overviewImage,
  overviewHtml,
  locationImage,
  locationHtml,
  amenities,
  floorPlans,
  stats,
  hierarchy = 'DỰ ÁN',
  projectName = 'Imperia Sky Park',
  tagline = 'Tuyệt tác trên tầm cao.',
  editing
}: OverviewContentProps) {
  const canEdit = Boolean(editing?.enabled);
  const emit = (field: string) => (value: string) => editing?.onChange(field, value);
  const onFocusBlock = editing?.onFocusBlock;
  // Dữ liệu Drive được ưu tiên; thiếu mục nào thì mục đó dùng dữ liệu mẫu.
  const HERO_SLIDES = useMemo(
    () => heroSlides?.length ? heroSlides : DEFAULT_HERO_SLIDES,
    [heroSlides]
  );
  const AMENITIES = useMemo(
    () => amenities?.length ? amenities : DEFAULT_AMENITIES,
    [amenities]
  );
  const FLOOR_PLANS = useMemo(
    () => floorPlans?.length ? floorPlans : DEFAULT_FLOOR_PLANS,
    [floorPlans]
  );
  const FEATURED_STATS = stats?.length ? stats : DEFAULT_FEATURED_STATS;
  const heroImage = overviewImage || IMAGES.overview;
  const mapImage = locationImage || IMAGES.location;

  const productsRef = useRef<HTMLDivElement>(null);
  const [activeHero, setActiveHero] = useState(0);
  const [activeFloor, setActiveFloor] = useState(FLOOR_PLANS[0].key);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activePlan = FLOOR_PLANS.find((plan) => plan.key === activeFloor) ?? FLOOR_PLANS[0];
  const hiddenAmenityCount = Math.max(0, AMENITIES.length - VISIBLE_AMENITIES);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrevious = useCallback(() => setLightboxIndex((current) => current === null ? current : (current - 1 + AMENITIES.length) % AMENITIES.length), []);
  const showNext = useCallback(() => setLightboxIndex((current) => current === null ? current : (current + 1) % AMENITIES.length), []);

  // Điều khiển lightbox bằng bàn phím + khoá cuộn nền khi đang mở
  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showPrevious();
      if (event.key === 'ArrowRight') showNext();
    }
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, closeLightbox, showPrevious, showNext]);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveHero((current) => (current + 1) % HERO_SLIDES.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="w-full overflow-x-clip bg-[#f5f1e8] font-['Be_Vietnam_Pro'] text-[#302922]">
      <section data-cms-section="hero" data-cms-label="Băng ảnh đầu trang" className="relative min-h-[560px] overflow-hidden bg-[#4b4035] sm:min-h-[680px]" aria-label="Banner dự án Imperia Sky Park">
        {HERO_SLIDES.map((image, index) => <img key={image} src={image} alt="Phối cảnh Imperia Sky Park" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeHero ? 'opacity-100' : 'opacity-0'}`} />)}
        <div className="absolute inset-0 bg-[#2e261e]/35" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[560px] w-[90vw] flex-col pb-16 pt-7 text-white sm:min-h-[680px]">
          <div className="mt-auto max-w-3xl pt-32 sm:pt-44">
            {canEdit ?
            <select
              aria-label="Cấp độ dự án"
              value={hierarchy}
              onChange={(event) => editing?.onChange('hierarchy', event.target.value)}
              className="cms-inline-select -ml-1 cursor-pointer appearance-none bg-transparent px-1 text-[40px] font-medium uppercase leading-none tracking-[-0.04em] text-white outline-none">

                {HIERARCHY_OPTIONS.map((option) =>
              <option key={option} value={option} className="text-black">{option}</option>
              )}
              </select> :
            <p className="text-[40px] font-medium uppercase leading-none tracking-[-0.04em] text-white">{hierarchy}</p>
            }
            <h1 className="mt-5 text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              <InlineText
              value={projectName}
              editable={canEdit}
              label="Tên dự án"
              placeholder="Nhập tên dự án"
              onChange={emit('projectName')}
              onFocusBlock={onFocusBlock} />

            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
              <InlineText
              value={tagline}
              editable={canEdit}
              label="Slogan dự án"
              placeholder="Nhập slogan dự án"
              onChange={emit('tagline')}
              onFocusBlock={onFocusBlock} />

            </p>
          </div>
          <div className="absolute bottom-6 right-0 flex items-center gap-3">
            <button type="button" onClick={() => setActiveHero((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="rounded-full border border-white/60 p-2 text-white transition-colors hover:bg-white hover:text-[#302922]" aria-label="Banner trước"><ChevronLeftIcon className="h-4 w-4" /></button>
            <div className="flex gap-2" aria-label="Chọn banner">{HERO_SLIDES.map((_, index) => <button key={index} type="button" onClick={() => setActiveHero(index)} aria-label={`Banner ${index + 1}`} aria-current={activeHero === index} className={`h-2 rounded-full transition-all ${activeHero === index ? 'w-7 bg-white' : 'w-2 bg-white/55 hover:bg-white'}`} />)}</div>
            <button type="button" onClick={() => setActiveHero((current) => (current + 1) % HERO_SLIDES.length)} className="rounded-full border border-white/60 p-2 text-white transition-colors hover:bg-white hover:text-[#302922]" aria-label="Banner tiếp theo"><ChevronRightIcon className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {tabs}

      <section data-cms-section="overview" data-cms-label="Tổng quan dự án" id="overview" className="mx-auto grid w-[90vw] items-center gap-8 py-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
        <div className="max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Tổng quan dự án</h2>
          <InlineRichText
            html={overviewHtml || DEFAULT_OVERVIEW_TEXT}
            editable={canEdit}
            label="Mô tả tổng quan"
            onChange={emit('overviewHtml')}
            onFocusBlock={onFocusBlock}
            className="prose-cen mt-5 text-sm leading-7 text-[#675e56] sm:text-base" />
          <a href="#location" className="mt-7 inline-flex items-center gap-2 border-b border-[#302922] pb-1 text-xs font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-60">Khám phá dự án <ArrowRightIcon className="h-4 w-4" /></a>
        </div>
        <div className="aspect-[16/10] overflow-hidden bg-stone-100">
          <img src={heroImage} alt="Phối cảnh dự án" className="h-full w-full object-cover" />
        </div>
      </section>

      <section data-cms-section="stats" data-cms-label="Số liệu nổi bật" aria-label="Số liệu nổi bật" className="border-y border-[#ded6ca] py-16 sm:py-20">
        <div className="mx-auto w-[90vw]">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
            {FEATURED_STATS.map((stat, index) =>
            <div key={index} className="text-center">
                <p className="text-4xl font-semibold tracking-[-0.04em] text-[#302922] sm:text-5xl">
                  <InlineText
                  value={stat.value}
                  editable={canEdit}
                  label={`Giá trị số liệu ${index + 1}`}
                  onChange={emit(`stat-${index}-value`)}
                  onFocusBlock={onFocusBlock} />

                </p>
                <p className="mt-3 text-sm leading-7 text-[#675e56] sm:text-base">
                  <InlineText
                  value={stat.label}
                  editable={canEdit}
                  label={`Nhãn số liệu ${index + 1}`}
                  onChange={emit(`stat-${index}-label`)}
                  onFocusBlock={onFocusBlock} />

                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section data-cms-section="location" data-cms-label="Vị trí dự án" id="location" className="bg-[#332920] text-[#f6f0e5]">
        <div className="grid items-stretch lg:grid-cols-2">
          {/* Cột ảnh: tràn hết chiều rộng cột và cao bằng cột text, không giới hạn trong container */}
          <div className="relative flex min-h-[320px] items-center justify-center bg-[#1c2c47] sm:min-h-[440px] lg:min-h-0">
            <img src={mapImage} alt="Vị trí dự án" className="h-auto w-full object-contain" />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-[#251c16]/80 px-3 py-2 text-xs font-medium backdrop-blur-sm sm:bottom-6 sm:left-6">
              <MapPinIcon className="h-4 w-4 text-[#f5921f]" />
              Minh Khai, Hai Bà Trưng, Hà Nội
            </span>
          </div>

          {/* Cột nội dung: padding phải bám theo mép trong của container max-w-7xl */}
          <div className="px-[5vw] py-20 lg:pl-16 lg:pr-[5vw]">
            <div className="lg:max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d0bda5]">Kết nối thuận tiện</p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Vị trí dự án</h2>
              <InlineRichText
                html={locationHtml || DEFAULT_LOCATION_TEXT}
                editable={canEdit}
                label="Mô tả vị trí"
                onChange={emit('locationHtml')}
                onFocusBlock={onFocusBlock}
                className="prose-cen prose-cen-invert mt-6 text-sm leading-7 text-white/80 sm:text-base" />

              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/20 pt-8 text-sm">
                <div><NavigationIcon className="h-4 w-4 text-[#f5921f]" /><p className="mt-2 text-white/65">Kết nối nhanh</p><p className="mt-1 font-semibold">Tới trung tâm</p></div>
                <div><TreesIcon className="h-4 w-4 text-[#f5921f]" /><p className="mt-2 text-white/65">Không gian xanh</p><p className="mt-1 font-semibold">Sát hồ điều hòa</p></div>
                <div><RulerIcon className="h-4 w-4 text-[#f5921f]" /><p className="mt-2 text-white/65">Quy hoạch</p><p className="mt-1 font-semibold">Đồng bộ tiện ích</p></div>
                <div><MapPinIcon className="h-4 w-4 text-[#f5921f]" /><p className="mt-2 text-white/65">Khu vực</p><p className="mt-1 font-semibold">Hai Bà Trưng</p></div>
              </div>

              <a href="https://www.google.com/maps/search/?api=1&query=Minh+Khai,+Hai+Ba+Trung,+Ha+Noi" target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex items-center gap-2 rounded-md bg-[#f5921f] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e08315] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#332920]">
                <MapPinIcon className="h-4 w-4" />
                Xem trên Google Map
              </a>
            </div>
          </div>
        </div>
      </section>

      <section data-cms-section="floorplan" data-cms-label="Mặt bằng xem nhanh" id="floorplan" className="border-b border-[#ded6ca] py-20">
        <div className="mx-auto w-[90vw]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#847768]">Thiết kế chi tiết các tầng</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Mặt bằng dự án</h2>

          {/* Thanh chọn tầng */}
          <div className="no-scrollbar mt-10 flex overflow-x-auto" role="tablist" aria-label="Chọn mặt bằng tầng">
            {FLOOR_PLANS.map((plan) => {
              const isActive = plan.key === activeFloor;
              return (
                <button
                  key={plan.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFloor(plan.key)}
                  className={`shrink-0 px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] sm:px-9 sm:text-sm ${
                  isActive ?
                  'bg-white text-[#302922] shadow-[inset_0_-3px_0_0_#f5921f]' :
                  'bg-[#4a3728] text-white/80 hover:bg-[#3a2b1e] hover:text-white'}`
                  }>
                  {plan.label}
                </button>);

            })}
          </div>

          {/* Khung bản vẽ */}
          <figure className="border border-[#ded6ca] bg-white p-4 sm:p-8">
            <figcaption className="text-center">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#302922] sm:text-xl">{activePlan.title}</h3>
            </figcaption>
            <img src={activePlan.image} alt={activePlan.title} className="mt-6 max-h-[640px] w-full object-contain" />
            <p className="mt-6 text-center text-[11px] leading-5 text-[#847768] sm:text-xs">
              Thông số, bản vẽ mang tính chất tham khảo và có thể được điều chỉnh mà không cần báo trước. Thông tin chính thức của từng căn sẽ được quy định tại văn bản ký kết giữa Bên bán và Bên mua.
            </p>
          </figure>
        </div>
      </section>

      <section data-cms-section="products" data-cms-label="Loại hình sản phẩm" id="products" className="border-b border-[#ded6ca] py-20">
        <div className="mx-auto w-[90vw]">
          <div className="flex items-end justify-between gap-6">
            <div><h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Sản phẩm nổi bật.</h2></div>
            <CarouselControls onPrevious={() => scrollCarousel(productsRef.current, -1)} onNext={() => scrollCarousel(productsRef.current, 1)} />
          </div>
          <div ref={productsRef} className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PRODUCTS.map((product) =>
            <article key={product.title} className="w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-[31.8%]">
                <img src={product.image} alt={product.title} className="aspect-[4/5] w-full object-cover" />
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">{product.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#675e56]">{product.description}</p>
                <a href="#products" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] underline underline-offset-4">Tìm hiểu thêm <ArrowRightIcon className="h-3.5 w-3.5" /></a>
              </article>
            )}
          </div>
        </div>
      </section>

      <section data-cms-section="amenities" data-cms-label="Tiện ích" id="spaces" className="py-20">
        <div className="mx-auto w-[90vw]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#847768]">Không gian sống</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Tiện ích dự án</h2>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:h-[660px] lg:grid-rows-6">
            {AMENITIES.slice(0, VISIBLE_AMENITIES).map((amenity, index) => {
              const isLastTile = index === VISIBLE_AMENITIES - 1;
              const hasMore = isLastTile && hiddenAmenityCount > 0;
              return (
                <button
                  key={amenity.title}
                  type="button"
                  onClick={() => setLightboxIndex(hasMore ? VISIBLE_AMENITIES : index)}
                  aria-label={hasMore ? `Xem thêm ${hiddenAmenityCount} ảnh tiện ích` : `Xem ảnh ${amenity.title}`}
                  className={`group relative h-40 overflow-hidden sm:h-52 lg:h-auto ${MOSAIC_POSITIONS[index]} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] focus-visible:ring-offset-2`}>
                  <img src={amenity.image} alt={amenity.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {hasMore ?
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 px-3 text-center text-sm font-semibold text-white sm:text-base">
                      Xem thêm {hiddenAmenityCount} ảnh
                    </span> :

                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 sm:text-sm">
                      {amenity.title}
                    </span>}

                </button>);

            })}
          </div>
        </div>
      </section>

      {lightboxIndex !== null &&
      <div role="dialog" aria-modal="true" aria-label="Thư viện ảnh tiện ích" className="fixed inset-0 z-[90] flex flex-col bg-black/90" onMouseDown={closeLightbox}>
          <div className="flex items-center justify-between px-4 py-4 text-white sm:px-8">
            <p className="text-sm font-medium">{lightboxIndex + 1} / {AMENITIES.length}</p>
            <button type="button" onClick={closeLightbox} aria-label="Đóng thư viện ảnh" className="rounded-full p-2 transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-4 sm:px-8" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={showPrevious} aria-label="Ảnh trước" className="mr-2 shrink-0 rounded-full p-2 text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:mr-6 sm:p-3">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <figure className="flex max-h-full min-w-0 flex-1 flex-col items-center">
              <img src={AMENITIES[lightboxIndex].image} alt={AMENITIES[lightboxIndex].title} className="max-h-[72vh] w-auto max-w-full object-contain" />
              <figcaption className="mt-4 text-center text-sm font-medium text-white sm:text-base">{AMENITIES[lightboxIndex].title}</figcaption>
            </figure>
            <button type="button" onClick={showNext} aria-label="Ảnh tiếp theo" className="ml-2 shrink-0 rounded-full p-2 text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:ml-6 sm:p-3">
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>}


      <section data-cms-section="contact" data-cms-label="Liên hệ tư vấn" className="bg-[#e5d8c2] py-20 text-[#302922]">
        <div className="mx-auto flex w-[90vw] flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="lg:max-w-[40rem] lg:flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7862]">Thông tin liên hệ</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Nhận thông tin cập nhật từ đội ngũ dự án</h2>
            <p className="mt-5 text-sm leading-7 text-[#5f5347] sm:text-base">Liên hệ trực tiếp để được tư vấn quỹ căn, chính sách bán hàng và tiến độ mới nhất.</p>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-[28rem] lg:shrink-0">
            {/* Gọi điện thoại cho giám đốc dự án */}
            <a href="tel:0912345678" className="group flex flex-col justify-between gap-5 border border-[#c9b89c] bg-white p-5 transition-colors hover:border-[#f5921f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e5d8c2]">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fdeed8] text-[#f5921f]">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a7862]">Giám đốc dự án</p>
                <p className="mt-1.5 text-base font-semibold tracking-[-0.02em]">Nguyễn Minh Quân</p>
                <p className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#f5921f]">0912 345 678</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-opacity group-hover:opacity-70">
                Gọi điện thoại <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </a>

            {/* Chat qua Zalo */}
            <a href="https://zalo.me/0912345678" target="_blank" rel="noopener noreferrer" className="group flex flex-col justify-between gap-5 border border-[#c9b89c] bg-white p-5 transition-colors hover:border-[#f5921f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5921f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e5d8c2]">
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fdeed8] text-[#f5921f]">
                  <MessageCircleIcon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a7862]">Hỗ trợ trực tuyến</p>
                <p className="mt-1.5 text-base font-semibold tracking-[-0.02em]">Chat qua Zalo</p>
                <p className="mt-1 text-lg font-bold tracking-[-0.02em] text-[#f5921f]">0912 345 678</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-opacity group-hover:opacity-70">
                Nhắn tin Zalo <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>);

}

interface CarouselControlsProps {
  onPrevious: () => void;
  onNext: () => void;
}

function CarouselControls({ onPrevious, onNext }: CarouselControlsProps) {
  return (
    <div className="flex items-center gap-3 pb-1" aria-label="Điều hướng carousel">
      <button onClick={onPrevious} className="rounded-full border border-[#a79a8d] p-2 transition-colors hover:bg-[#302922] hover:text-white" aria-label="Mục trước"><ChevronLeftIcon className="h-4 w-4" /></button>
      <button onClick={onNext} className="rounded-full border border-[#a79a8d] p-2 transition-colors hover:bg-[#302922] hover:text-white" aria-label="Mục tiếp theo"><ChevronRightIcon className="h-4 w-4" /></button>
    </div>);

}