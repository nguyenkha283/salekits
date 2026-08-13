import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImagePlusIcon,
  PlusIcon,
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
import { EmptySlot } from './EmptySlot';
import {
  EditableImage,
  ImageUploadButton,
  readImageFiles,
  useExtraImages,
  useImageSlots } from
'./EditableImage';

export interface FeaturedProduct {
  id: string;
  /** Ảnh tải lên từ máy; mục này không lấy nội dung từ Drive. */
  image: string;
  title: string;
  description: string;
}

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
  /** Nhóm sản phẩm — soạn tay trong CMS, không lấy từ Drive. */
  products?: FeaturedProduct[];
  onProductsChange?: (products: FeaturedProduct[]) => void;
  /** Dòng địa chỉ hiển thị trên ảnh vị trí. */
  locationLabel?: string;
}

/** Tiện ích hiển thị 7 ô đầu, phần còn lại gộp vào lớp phủ ở ô cuối. */
const VISIBLE_AMENITIES = 7;


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
  products,
  onProductsChange,
  locationLabel,
  stats,
  hierarchy = 'DỰ ÁN',
  projectName = 'Imperia Sky Park',
  tagline = '',
  editing
}: OverviewContentProps) {
  const canEdit = Boolean(editing?.enabled);
  const emit = (field: string) => (value: string) => editing?.onChange(field, value);
  const onFocusBlock = editing?.onFocusBlock;
  // Không còn dữ liệu mẫu: mục nào Drive chưa có thì hiện khối chỗ trống, để
  // người dùng biết chính xác còn thiếu gì và phải bỏ file vào thư mục nào.
  const uploadedHero = useExtraImages('hero');
  const uploadedAmenities = useExtraImages('amenity');
  const uploadedPlans = useExtraImages('plan-preview');
  const { editable: canUploadImages } = useImageSlots();

  const HERO_SLIDES = useMemo(
    () => [...heroSlides ?? [], ...uploadedHero],
    [heroSlides, uploadedHero]
  );
  const AMENITIES = useMemo(
    () => [
    ...amenities ?? [],
    ...uploadedAmenities.map((image, index) => ({
      image,
      title: `Tiện ích tải lên ${index + 1}`
    }))],

    [amenities, uploadedAmenities]
  );
  const FLOOR_PLANS = useMemo(
    () => [
    ...floorPlans ?? [],
    ...uploadedPlans.map((image, index) => ({
      key: `upload-${index}`,
      label: `Bản vẽ tải lên ${index + 1}`,
      title: `Bản vẽ tải lên ${index + 1}`,
      image
    }))],

    [floorPlans, uploadedPlans]
  );
  const PRODUCTS = products ?? [];
  const FEATURED_STATS = stats ?? [];

  const productsRef = useRef<HTMLDivElement>(null);

  /**
   * Bố cục đổi theo số sản phẩm: một tới hai thì canh giữa, ba thì xếp ba cột,
   * từ bốn trở lên mới chuyển sang băng cuộn kèm hai nút điều hướng.
   */
  const isProductCarousel = PRODUCTS.length >= 4;

  const updateProduct = useCallback(
    (id: string, patch: Partial<FeaturedProduct>) => {
      onProductsChange?.(
        PRODUCTS.map((item) => item.id === id ? { ...item, ...patch } : item)
      );
    },
    [PRODUCTS, onProductsChange]
  );

  const removeProduct = useCallback(
    (id: string) => {
      onProductsChange?.(PRODUCTS.filter((item) => item.id !== id));
    },
    [PRODUCTS, onProductsChange]
  );

  const addProduct = useCallback(() => {
    onProductsChange?.([
    ...PRODUCTS,
    { id: `sp-${Date.now()}`, image: '', title: '', description: '' }]
    );
  }, [PRODUCTS, onProductsChange]);
  const [activeHero, setActiveHero] = useState(0);
  const [activeFloor, setActiveFloor] = useState(FLOOR_PLANS[0]?.key ?? '');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activePlan = FLOOR_PLANS.find((plan) => plan.key === activeFloor) ?? FLOOR_PLANS[0];
  const hasHero = HERO_SLIDES.length > 0;
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
      <section data-cms-section="hero" data-cms-label="Băng ảnh đầu trang" className="relative min-h-[87dvh] overflow-hidden bg-[#4b4035]" aria-label={`Banner dự án ${projectName}`}>
        {HERO_SLIDES.map((image, index) => <img key={image} src={image} alt={`Phối cảnh ${projectName}`} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeHero ? 'opacity-100' : 'opacity-0'}`} />)}
        {!hasHero &&
        <EmptySlot
          label="Tải băng ảnh đầu trang lên"
          source="01. Tổng quan / Ảnh hero banner"
          className="absolute inset-0 border-0 bg-[#4b4035]" />
        }
        <div className="absolute inset-0 bg-[#2e261e]/35" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[87dvh] w-[90vw] flex-col pb-16 pt-7 text-white">
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
            {hasHero && <button type="button" onClick={() => setActiveHero((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="rounded-full border border-white/60 p-2 text-white transition-colors hover:bg-white hover:text-[#302922]" aria-label="Banner trước"><ChevronLeftIcon className="h-4 w-4" /></button>}
            <div className="flex gap-2" aria-label="Chọn banner">{HERO_SLIDES.map((_, index) => <button key={index} type="button" onClick={() => setActiveHero(index)} aria-label={`Banner ${index + 1}`} aria-current={activeHero === index} className={`h-2 rounded-full transition-all ${activeHero === index ? 'w-7 bg-white' : 'w-2 bg-white/55 hover:bg-white'}`} />)}</div>
            {hasHero && <button type="button" onClick={() => setActiveHero((current) => (current + 1) % HERO_SLIDES.length)} className="rounded-full border border-white/60 p-2 text-white transition-colors hover:bg-white hover:text-[#302922]" aria-label="Banner tiếp theo"><ChevronRightIcon className="h-4 w-4" /></button>}
            <ImageUploadButton collectionKey="hero" label="Tải băng ảnh từ máy" className="ml-2" />
          </div>
        </div>
      </section>

      {tabs}

      <section data-cms-section="overview" data-cms-label="Tổng quan dự án" id="overview" className="mx-auto grid w-[90vw] items-center gap-8 py-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
        <div className="max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Tổng quan dự án</h2>
          <InlineRichText
            html={overviewHtml ?? ''}
            placeholder="Tải nội dung tổng quan lên — lấy từ thư mục 01. Tổng quan trên Drive"
            editable={canEdit}
            label="Mô tả tổng quan"
            onChange={emit('overviewHtml')}
            onFocusBlock={onFocusBlock}
            className="prose-cen mt-5 text-sm leading-7 text-[#675e56] sm:text-base" />
          <a href="#location" className="mt-7 inline-flex items-center gap-2 border-b border-[#302922] pb-1 text-xs font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-60">Khám phá dự án <ArrowRightIcon className="h-4 w-4" /></a>
        </div>
        <div className="aspect-[16/10] overflow-hidden bg-stone-100">
          <EditableImage
            slotKey="overview-image"
            src={overviewImage}
            alt="Phối cảnh dự án"
            className="h-full w-full object-cover"
            wrapperClassName="relative h-full w-full"
            emptySource="01. Tổng quan"
            emptyClassName="h-full w-full" />
          
        </div>
      </section>

      <section data-cms-section="stats" data-cms-label="Số liệu nổi bật" aria-label="Số liệu nổi bật" className="border-y border-[#ded6ca] py-16 sm:py-20">
        <div className="mx-auto w-[90vw]">
          {FEATURED_STATS.length === 0 &&
          <EmptySlot
            variant="content"
            label="Tải số liệu nổi bật lên"
            className="min-h-[140px]" />
          }
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
            <EditableImage
              slotKey="location-image"
              src={locationImage}
              alt="Vị trí dự án"
              className="h-auto w-full object-contain"
              wrapperClassName="relative w-full"
              emptyLabel="Tải hình ảnh vị trí lên"
              emptySource="01. Tổng quan"
              emptyClassName="m-6 min-h-[260px] w-full rounded-lg border-white/25 bg-transparent text-white/70" />
            {locationLabel &&
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 bg-[#251c16]/80 px-3 py-2 text-xs font-medium backdrop-blur-sm sm:bottom-6 sm:left-6">
              <MapPinIcon className="h-4 w-4 text-[#f5921f]" />
              {locationLabel}
            </span>
            }
          </div>

          {/* Cột nội dung: padding phải bám theo mép trong của container max-w-7xl */}
          <div className="px-[5vw] py-20 lg:pl-16 lg:pr-[5vw]">
            <div className="lg:max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d0bda5]">Kết nối thuận tiện</p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Vị trí dự án</h2>
              <InlineRichText
                html={locationHtml ?? ''}
                placeholder="Tải nội dung vị trí lên — lấy từ thư mục 01. Tổng quan trên Drive"
                editable={canEdit}
                label="Mô tả vị trí"
                onChange={emit('locationHtml')}
                onFocusBlock={onFocusBlock}
                className="prose-cen prose-cen-invert mt-6 text-sm leading-7 text-white/80 sm:text-base" />

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

          {FLOOR_PLANS.length === 0 &&
          <EmptySlot
            label="Tải bản vẽ mặt bằng lên"
            source="03. Mặt bằng"
            className="mt-10 min-h-[360px] rounded-lg" />
          }
          {canUploadImages &&
          <div className="mt-4">
            <ImageUploadButton collectionKey="plan-preview" label="Tải bản vẽ từ máy" />
          </div>
          }

          {/* Thanh chọn tầng */}
          {FLOOR_PLANS.length > 0 &&
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
          }

          {/* Khung bản vẽ */}
          {activePlan &&
          <figure className="border border-[#ded6ca] bg-white p-4 sm:p-8">
            <figcaption className="text-center">
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#302922] sm:text-xl">{activePlan.title}</h3>
            </figcaption>
            <EditableImage
              slotKey={`plan-${activePlan.key}`}
              src={activePlan.image}
              alt={activePlan.title}
              className="mt-6 max-h-[640px] w-full object-contain"
              wrapperClassName="relative w-full"
              emptySource="03. Mặt bằng"
              emptyClassName="mt-6 min-h-[320px] w-full rounded-lg" />
            <p className="mt-6 text-center text-[11px] leading-5 text-[#847768] sm:text-xs">
              Thông số, bản vẽ mang tính chất tham khảo và có thể được điều chỉnh mà không cần báo trước. Thông tin chính thức của từng căn sẽ được quy định tại văn bản ký kết giữa Bên bán và Bên mua.
            </p>
          </figure>
          }
        </div>
      </section>

      <section data-cms-section="products" data-cms-label="Loại hình sản phẩm" id="products" className="border-b border-[#ded6ca] py-20">
        <div className="mx-auto w-[90vw]">
          <div className="flex items-end justify-between gap-6">
            <div><h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Sản phẩm nổi bật.</h2></div>
            {isProductCarousel &&
            <CarouselControls onPrevious={() => scrollCarousel(productsRef.current, -1)} onNext={() => scrollCarousel(productsRef.current, 1)} />
            }
          </div>

          {isProductCarousel ?
          <div ref={productsRef} className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PRODUCTS.map((product) =>
            <div key={product.id} className="w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-[31.8%]">
                  <ProductCard
                product={product}
                editable={canEdit}
                onChange={updateProduct}
                onRemove={removeProduct} />
                
                </div>
            )}
              {canEdit &&
            <div className="w-[82%] shrink-0 snap-start sm:w-[48%] lg:w-[31.8%]">
                  <AddProductTile onAdd={addProduct} />
                </div>
            }
            </div> :

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PRODUCTS.map((product, index) =>
            <div
              key={product.id}
              className={
              // Một sản phẩm thì đặt vào cột giữa, dấu cộng nằm cột thứ ba.
              PRODUCTS.length === 1 && index === 0 ? 'lg:col-start-2' : ''
              }>
              
                  <ProductCard
                product={product}
                editable={canEdit}
                onChange={updateProduct}
                onRemove={removeProduct} />
                
                </div>
            )}
              {canEdit && PRODUCTS.length < 3 &&
            <AddProductTile onAdd={addProduct} />
            }
            </div>
          }

          {canEdit && !isProductCarousel && PRODUCTS.length === 3 &&
          <div className="mt-6 flex justify-center">
            <AddProductTile onAdd={addProduct} compact />
          </div>
          }

          {!canEdit && PRODUCTS.length === 0 &&
          <EmptySlot
            variant="content"
            label="Chưa có sản phẩm nổi bật"
            className="mt-10 min-h-[240px] rounded-lg" />
          }
        </div>
      </section>

      <section data-cms-section="amenities" data-cms-label="Tiện ích" id="spaces" className="py-20">
        <div className="mx-auto w-[90vw]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#847768]">Không gian sống</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Tiện ích dự án</h2>

          {AMENITIES.length === 0 &&
          <EmptySlot
            label="Tải hình ảnh tiện ích lên"
            source="01. Tổng quan / Tiện ích"
            className="mt-10 min-h-[360px] rounded-lg" />
          }
          {canUploadImages &&
          <div className="mt-4">
            <ImageUploadButton collectionKey="amenity" label="Tải ảnh tiện ích từ máy" />
          </div>
          }
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

interface ProductCardProps {
  product: FeaturedProduct;
  editable: boolean;
  onChange: (id: string, patch: Partial<FeaturedProduct>) => void;
  onRemove: (id: string) => void;
}

/**
 * Một sản phẩm nổi bật. Mục này soạn tay trong CMS, ảnh tải thẳng từ máy chứ
 * không đi qua Drive, nên khung ảnh cũng chính là nút tải lên.
 */
function ProductCard({ product, editable, onChange, onRemove }: ProductCardProps) {
  async function handleFiles(files: FileList | null) {
    const [url] = await readImageFiles(files);
    if (url) onChange(product.id, { image: url });
  }

  return (
    <article className="group/product relative">
      {editable ?
      <label className="relative block aspect-[4/5] w-full cursor-pointer overflow-hidden">
          {product.image ?
        <img src={product.image} alt={product.title} className="h-full w-full object-cover" /> :

        <span className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-[#d8cab4] bg-[#faf6ef] text-center text-[#a08b6c]">
              <ImagePlusIcon className="h-7 w-7" aria-hidden="true" />
              <span className="px-3 text-[13px] font-semibold text-[#8a6a3f]">
                Tải ảnh sản phẩm lên
              </span>
              <span className="px-3 text-[11px] leading-snug">
                Bấm vào khung để chọn ảnh từ máy
              </span>
            </span>
        }
          {product.image &&
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-2 opacity-0 transition-opacity group-hover/product:opacity-100">
              <span className="rounded-md bg-white/95 px-2 py-1.5 text-[11px] font-semibold text-neutral-700 shadow-sm">
                Đổi ảnh
              </span>
            </span>
        }
          <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => handleFiles(event.target.files)}
          className="sr-only" />

        </label> :

      <img
        src={product.image}
        alt={product.title}
        className="aspect-[4/5] w-full object-cover" />
      }

      <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
        <InlineText
          value={product.title}
          editable={editable}
          label="Tên sản phẩm"
          placeholder="Nhập tên loại sản phẩm"
          onChange={(value) => onChange(product.id, { title: value })} />
        
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#675e56]">
        <InlineText
          value={product.description}
          editable={editable}
          label="Mô tả sản phẩm"
          placeholder="Nhập mô tả ngắn cho loại sản phẩm này"
          onChange={(value) => onChange(product.id, { description: value })} />
        
      </p>

      {editable &&
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        aria-label={`Xóa sản phẩm ${product.title || 'chưa đặt tên'}`}
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md bg-white/95 text-neutral-500 opacity-0 shadow-sm transition-opacity hover:text-red-600 group-hover/product:opacity-100">
        
          <XIcon className="h-4 w-4" />
        </button>
      }
    </article>);

}

/** Ô dấu cộng để thêm một sản phẩm mới. */
function AddProductTile({
  onAdd,
  compact = false
}: {onAdd: () => void;compact?: boolean;}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label="Thêm sản phẩm nổi bật"
      className={`group/add flex w-full flex-col items-center justify-center gap-3 text-[#a08b6c] transition-colors hover:text-[#6D3A18] ${
      compact ? 'py-2' : 'aspect-[4/5]'}`
      }>
      
      <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-[#d8cab4] transition-colors group-hover/add:border-[#6D3A18]">
        <PlusIcon className="h-7 w-7" />
      </span>
      <span className="text-[13px] font-semibold">Thêm sản phẩm</span>
    </button>);

}

function CarouselControls({ onPrevious, onNext }: CarouselControlsProps) {
  return (
    <div className="flex items-center gap-3 pb-1" aria-label="Điều hướng carousel">
      <button onClick={onPrevious} className="rounded-full border border-[#a79a8d] p-2 transition-colors hover:bg-[#302922] hover:text-white" aria-label="Mục trước"><ChevronLeftIcon className="h-4 w-4" /></button>
      <button onClick={onNext} className="rounded-full border border-[#a79a8d] p-2 transition-colors hover:bg-[#302922] hover:text-white" aria-label="Mục tiếp theo"><ChevronRightIcon className="h-4 w-4" /></button>
    </div>);

}