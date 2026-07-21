import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3Icon,
  BotIcon,
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDollarSignIcon,
  EyeIcon,
  FacebookIcon,
  FileTextIcon,
  ImageIcon,
  ImagesIcon,
  LayoutGridIcon,
  LinkIcon,
  MapPinIcon,
  MessageCircleIcon,
  PenToolIcon,
  PhoneIcon,
  PlayCircleIcon,
  PlusIcon,
  RulerIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Trash2Icon,
  UsersIcon,
  UsersRoundIcon,
  PencilIcon } from
'lucide-react';
import { HeroBannerBlock } from './HeroBannerBlock';
import { VerticalBanner } from './VerticalBanner';
import {
  AmenitiesBlock,
  AmenitiesCarouselType,
  AmenityImage,
  CmsProjectContent,
  CmsRole,
  CmsTextEditorId,
  FeaturedItem,
  FeaturedProduct,
  HeroSlide,
  OverviewStyles } from
'../types/cms';
import { sanitizeRichText } from '../utils/richText';
type DisplayMode = 'editor' | 'preview';
interface ProjectContentEditorProps {
  content: CmsProjectContent;
  role: CmsRole;
  displayMode: DisplayMode;
  activeMenu: string;
  slides: HeroSlide[];
  activeSlide: number;
  leftBanner: HeroSlide | null;
  rightBanner: HeroSlide | null;
  overviewBackgroundImage: HeroSlide | null;
  overviewCoverImage: HeroSlide | null;
  overviewStyles: OverviewStyles;
  amenitiesStyles: OverviewStyles;
  amenitiesBackgroundImage: HeroSlide | null;
  customStyles: OverviewStyles;
  customBackgroundImage: HeroSlide | null;
  customCoverImage: HeroSlide | null;
  hotlineDutyPhone: string;
  onContentChange: (content: CmsProjectContent) => void;
  onActiveMenuChange: (menu: string) => void;
  onActiveSlideChange: (index: number) => void;
  onSelectHero: () => void;
  onSelectBanners: () => void;
  onSelectOverview: () => void;
  onSelectAmenities: () => void;
  onSelectAmenityImage: (imageId: string) => void;
  onSelectCustom: () => void;
  onSelectCustomCover: () => void;
  onSelectContactTitle: () => void;
  onSelectTextEditor: (editorId: CmsTextEditorId) => void;
  onSelectOverviewCover: () => void;
  onSelectProductsTitle: () => void;
  onSelectProductImage: (index: number) => void;
  onSelectFloorPlanImage: (blockId: string) => void;
  onReplaceProductImage: (id: string, file: File) => void;
  onRemoveProductImage: (id: string) => void;
  onRemoveProduct: (id: string) => void;
  onReplaceFloorPlanImage: (tabId: string, blockId: string, file: File) => void;
  onAddAmenityImages: (type: AmenitiesCarouselType, files: File[]) => void;
  onClearAmenitiesBlock: () => void;
  onReplaceOverviewCoverImage: (file: File) => void;
  onRemoveOverviewCoverImage: () => void;
  onReplaceCustomCoverImage: (file: File) => void;
  onRemoveCustomCoverImage: () => void;
  onUploadLeftBanner: (file: File) => void;
  onUploadRightBanner: (file: File) => void;
  onRequestUpload: () => void;
}
interface MenuItem {
  label: string;
  icon: React.ElementType;
}
const HIERARCHY_OPTIONS = [
'Đại đô thị',
'Khu đô thị',
'Dự án',
'Phân khu',
'Tiểu khu',
'Tòa'];

const FEATURE_OPTIONS = [
'Quy mô dự án',
'Tổng vốn đầu tư',
'Quy mô dân số',
'Mật độ xây dựng',
'Thiết kê',
'Số tòa'];

const MENU_ITEMS: MenuItem[] = [
{
  label: 'Tổng quan',
  icon: Building2Icon
},
{
  label: 'Vị trí',
  icon: MapPinIcon
},
{
  label: 'Đào tạo',
  icon: UsersIcon
},
{
  label: 'Phân khu',
  icon: LayoutGridIcon
},
{
  label: 'Mặt bằng',
  icon: ImagesIcon
},
{
  label: 'Bảng hàng',
  icon: BarChart3Icon
},
{
  label: 'Quỹ căn',
  icon: Building2Icon
},
{
  label: 'Ảnh 360',
  icon: SparklesIcon
},
{
  label: 'CSBH',
  icon: ShieldCheckIcon
},
{
  label: 'Tiến độ',
  icon: PlayCircleIcon
},
{
  label: 'Tài liệu',
  icon: FileTextIcon
},
{
  label: 'Tin tức',
  icon: FileTextIcon
}];

function XBrandIcon({ className }: {className?: string;}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      className={className}
      aria-hidden="true">
      
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>);

}
const SHARE_ACTIONS = [
{
  label: 'Chia sẻ qua Facebook',
  icon: FacebookIcon
},
{
  label: 'Chia sẻ qua Zalo',
  icon: MessageCircleIcon
},
{
  label: 'Chia sẻ qua X',
  icon: XBrandIcon
},
{
  label: 'Sao chép liên kết',
  icon: LinkIcon
}];

export function ProjectContentEditor({
  content,
  role,
  displayMode,
  activeMenu,
  slides,
  activeSlide,
  leftBanner,
  rightBanner,
  overviewBackgroundImage,
  overviewCoverImage,
  overviewStyles,
  amenitiesStyles,
  amenitiesBackgroundImage,
  customStyles,
  customBackgroundImage,
  customCoverImage,
  hotlineDutyPhone,
  onContentChange,
  onActiveMenuChange,
  onActiveSlideChange,
  onSelectHero,
  onSelectBanners,
  onSelectOverview,
  onSelectAmenities,
  onSelectAmenityImage,
  onSelectCustom,
  onSelectCustomCover,
  onSelectContactTitle,
  onSelectTextEditor,
  onSelectOverviewCover,
  onSelectProductsTitle,
  onSelectProductImage,
  onSelectFloorPlanImage: _onSelectFloorPlanImage,
  onReplaceProductImage,
  onRemoveProductImage,
  onRemoveProduct,
  onReplaceFloorPlanImage: _onReplaceFloorPlanImage,
  onAddAmenityImages,
  onClearAmenitiesBlock,
  onReplaceOverviewCoverImage,
  onRemoveOverviewCoverImage,
  onReplaceCustomCoverImage,
  onRemoveCustomCoverImage,
  onUploadLeftBanner,
  onUploadRightBanner,
  onRequestUpload
}: ProjectContentEditorProps) {
  const [floorPlanLevel, setFloorPlanLevel] = useState<1 | 2>(1);
  const titleRowRef = useRef<HTMLDivElement>(null);
  const hierarchyMeasureRef = useRef<HTMLSpanElement>(null);
  const nameMeasureRef = useRef<HTMLSpanElement>(null);
  const [titleLayout, setTitleLayout] = useState({
    stacked: false,
    hierarchyWidth: 0,
    nameWidth: 0
  });
  const isTitleStacked = titleLayout.stacked;
  useEffect(() => {
    const row = titleRowRef.current;
    if (!row) return;
    function measure() {
      const rowElement = titleRowRef.current;
      const hierarchyMeasure = hierarchyMeasureRef.current;
      const nameMeasure = nameMeasureRef.current;
      if (!rowElement || !hierarchyMeasure || !nameMeasure) return;
      const hierarchyWidth = hierarchyMeasure.scrollWidth;
      const nameWidth = nameMeasure.scrollWidth;
      const bothFilled =
      content.hierarchy.trim() !== '' && content.projectName.trim() !== '';
      const gap = 20;
      setTitleLayout({
        stacked:
        bothFilled &&
        hierarchyWidth + gap + nameWidth > rowElement.clientWidth,
        hierarchyWidth,
        nameWidth
      });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [content.projectName, content.hierarchy, displayMode]);
  const isEditor = displayMode === 'editor';
  const editableMenus = useMemo(() => getEditableMenus(role), [role]);
  const canEditActiveMenu = isEditor && editableMenus.has(activeMenu);
  const canEditFloorPlanLevelOne = isEditor && role === 'APM';
  const canEditFloorPlanLevelTwo = isEditor && role === 'Quản lý bán hàng';
  const canEditActiveFloorPlan =
  floorPlanLevel === 1 ? canEditFloorPlanLevelOne : canEditFloorPlanLevelTwo;
  const canEditBanners = isEditor && role === 'APM';
  const canEditProjectInfo = isEditor && role === 'APM';
  const canEditOverview =
  isEditor && role === 'APM' && activeMenu === 'Tổng quan';
  const gridColumnsClass = 'lg:grid-cols-[15%_minmax(0,70%)_15%]';
  const overviewBackgroundStyle = {
    backgroundColor: hexToRgba(
      overviewStyles.backgroundColor,
      overviewStyles.backgroundOpacity / 100
    ),
    ...(overviewBackgroundImage ?
    {
      backgroundImage: `linear-gradient(${hexToRgba(overviewStyles.backgroundColor, overviewStyles.backgroundOpacity / 100)}, ${hexToRgba(overviewStyles.backgroundColor, overviewStyles.backgroundOpacity / 100)}), url(${overviewBackgroundImage.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    } :
    {})
  };
  function updateContent(nextContent: Partial<CmsProjectContent>) {
    onContentChange({
      ...content,
      ...nextContent
    });
  }
  function updateFeature(
  index: number,
  field: keyof FeaturedItem,
  value: string)
  {
    updateContent({
      featuredItems: content.featuredItems.map((item, itemIndex) =>
      itemIndex === index ?
      {
        ...item,
        [field]: value
      } :
      item
      )
    });
  }
  return (
    <main
      className={
      isEditor ?
      'h-full min-w-0 overflow-y-auto bg-white py-[10px]' :
      'min-h-screen min-w-0 bg-white py-[10px]'
      }
      aria-label={
      isEditor ? 'Trình soạn thảo nội dung dự án' : 'Chi tiết dự án'
      }>
      
      <div
        className={`grid min-h-full w-full grid-cols-1 gap-3 ${gridColumnsClass} lg:gap-0`}>
        
        <div className="hidden lg:block lg:col-start-1">
          <div className="sticky top-0">
            <VerticalBanner
              label="Banner trái"
              image={leftBanner}
              canEdit={canEditBanners}
              displayMode={displayMode}
              onSelect={onSelectBanners}
              onUpload={onUploadLeftBanner} />
            
          </div>
        </div>

        <div className="min-w-0 px-[30px] lg:col-start-2">
          <section
            className={`mt-4 py-8 ${canEditProjectInfo ? 'border border-dashed border-[#6D3A18]' : ''}`}
            aria-label="Thông tin tiêu đề dự án">
            
            <div className="flex w-full items-start justify-between gap-4 sm:gap-8">
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <div
                  ref={titleRowRef}
                  className={`flex w-full gap-y-1 justify-start ${isTitleStacked ? 'flex-col items-start' : 'flex-wrap items-center gap-x-2 sm:gap-x-3'} ${isEditor ? '' : 'text-left'}`}>
                  
                  <span
                    ref={hierarchyMeasureRef}
                    aria-hidden="true"
                    className="pointer-events-none invisible absolute left-0 top-0 -z-10 whitespace-pre text-[30px] font-bold uppercase leading-tight">
                    
                    {content.hierarchy || (isEditor ? '--Lựa chọn--' : '')}
                  </span>
                  <span
                    ref={nameMeasureRef}
                    aria-hidden="true"
                    className={`pointer-events-none invisible absolute left-0 top-0 -z-10 whitespace-pre text-[30px] font-bold leading-tight ${content.projectName ? 'uppercase' : 'normal-case'}`}>
                    
                    {content.projectName || (isEditor ? 'Nhập tên dự án' : '')}
                  </span>
                  {isEditor ?
                  <select
                    aria-label="Cấp độ dự án"
                    disabled={!canEditProjectInfo}
                    value={content.hierarchy}
                    style={
                    titleLayout.hierarchyWidth ?
                    {
                      width: titleLayout.hierarchyWidth + 12
                    } :
                    undefined
                    }
                    onChange={(event) =>
                    updateContent({
                      hierarchy: event.target.value
                    })
                    }
                    className={`max-w-full shrink-0 cursor-pointer appearance-none bg-transparent text-left text-[30px] font-bold uppercase leading-tight text-[#f5881f] outline-none disabled:cursor-not-allowed disabled:opacity-50`}>
                    
                      <option
                      style={{
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                      value="">
                      
                        --Lựa chọn--
                      </option>
                      {HIERARCHY_OPTIONS.map((option) =>
                    <option
                      key={option}
                      style={{
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                      value={option}>
                      
                          {option}
                        </option>
                    )}
                    </select> :
                  content.hierarchy ?
                  <p className="max-w-full shrink-0 whitespace-nowrap text-left text-[30px] font-bold uppercase leading-tight text-[#f5881f]">
                      {content.hierarchy}
                    </p> :
                  null}
                  {isEditor ?
                  <span
                    className={`${isTitleStacked ? 'grid w-full grid-cols-1' : 'inline-grid max-w-full items-center'}`}>
                    
                      <span
                      aria-hidden="true"
                      className={`pointer-events-none col-start-1 row-start-1 min-w-0 px-1 text-[30px] font-bold uppercase leading-tight text-transparent ${isTitleStacked ? 'w-full whitespace-pre-wrap break-words text-left' : 'whitespace-pre'}`}>
                      
                        {content.projectName || 'Nhập tên dự án'}
                      </span>
                      <textarea
                      aria-label="Tên dự án"
                      readOnly={!canEditProjectInfo}
                      rows={1}
                      value={content.projectName}
                      placeholder="Nhập tên dự án"
                      onChange={(event) =>
                      updateContent({
                        projectName: event.target.value
                      })
                      }
                      className={`col-start-1 row-start-1 w-full min-w-0 resize-none overflow-hidden bg-transparent px-1 text-[30px] font-bold uppercase leading-tight text-[#f5881f] outline-none placeholder:normal-case placeholder:text-[#f5881f]/45 read-only:cursor-not-allowed read-only:opacity-50 ${isTitleStacked ? 'whitespace-pre-wrap break-words text-left' : 'whitespace-pre text-left'}`} />
                    
                    </span> :
                  content.projectName ?
                  <h1
                    className={`max-w-full break-normal whitespace-normal ${isTitleStacked ? 'w-full' : ''} text-left text-[30px] font-bold uppercase leading-tight text-[#f5881f]`}>
                    
                      {content.projectName}
                    </h1> :
                  null}
                </div>
                {isEditor ?
                <RichTextInput
                  editorId="description"
                  editable={canEditProjectInfo}
                  label="Mô tả dự án"
                  placeholder="Nhập một đoạn mô tả ngắn cho dự án này"
                  value={content.description}
                  onChange={(description) =>
                  updateContent({
                    description
                  })
                  }
                  onSelect={() => onSelectTextEditor('description')}
                  className={`mt-4 min-h-7 w-full text-left text-lg leading-7 text-neutral-700 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 ${canEditProjectInfo ? 'cursor-text' : 'cursor-not-allowed opacity-50'}`}
                  style={{
                    color: content.descriptionColor ?? '#404040'
                  }} /> :

                content.description ?
                <div
                  className="mt-4 w-full text-left text-lg leading-7 text-neutral-700"
                  style={{
                    color: content.descriptionColor ?? '#404040'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichText(content.description)
                  }} /> :

                null}
              </div>

              <div className="shrink-0">
                <p className="whitespace-nowrap text-[12px] text-neutral-500">
                  Chia sẻ dự án
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {SHARE_ACTIONS.map(({ label, icon: Icon }) =>
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    title={label}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-600 text-white transition-colors hover:bg-neutral-700">
                    
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="sticky top-0 z-20 mt-2 bg-white p-[10px] shadow-sm">
            <div
              className="flex flex-wrap justify-center gap-1"
              role="tablist"
              aria-label="Nội dung dự án">
              
              {MENU_ITEMS.map(({ label, icon: Icon }) => {
                const active = label === activeMenu;
                const canEdit = isEditor && editableMenus.has(label);
                return (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    title={
                    isEditor ?
                    canEdit ?
                    `Chỉnh sửa ${label}` :
                    `Chỉ xem ${label}` :
                    label
                    }
                    onClick={() => onActiveMenuChange(label)}
                    className={`inline-flex items-center gap-1.5 rounded px-2 py-2 text-[13px] font-medium transition-colors ${isEditor ? canEdit ? active ? 'bg-orange-50 text-[#f5881f]' : 'text-neutral-900 hover:bg-neutral-100' : active ? 'bg-neutral-100 text-neutral-900 opacity-50' : 'text-neutral-900 opacity-50 hover:bg-neutral-100' : active ? 'bg-orange-50 text-[#f5881f]' : 'text-neutral-900 hover:bg-neutral-100'}`}>
                    
                    {isEditor && !canEdit ?
                    <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" /> :

                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    }
                    {label}
                  </button>);

              })}
            </div>
          </div>

          {activeMenu === 'Tổng quan' ?
          <>
              <HeroBannerBlock
              slides={slides}
              activeSlide={activeSlide}
              canEdit={canEditActiveMenu}
              displayMode={displayMode}
              onActiveSlideChange={onActiveSlideChange}
              onSelect={onSelectHero}
              onRequestUpload={onRequestUpload} />
            

              <section
              className={`mt-[46px] grid grid-cols-1 gap-5 sm:grid-cols-3 ${canEditOverview ? 'border border-dashed border-[#6D3A18] p-1' : ''}`}
              aria-label="Thông tin nổi bật dự án">
              
                {content.featuredItems.map((item, index) =>
              <FeaturedCard
                key={index}
                item={item}
                textEditorId={`featured-${index}`}
                selectedMetrics={content.featuredItems.map(
                  ({ metric }) => metric
                )}
                canEdit={canEditOverview}
                displayMode={displayMode}
                onMetricChange={(value) =>
                updateFeature(index, 'metric', value)
                }
                onValueChange={(value) =>
                updateFeature(index, 'value', value)
                }
                onSelectText={() => onSelectTextEditor(`featured-${index}`)} />

              )}
              </section>

              <section
              aria-labelledby="overview-heading"
              onClick={canEditOverview ? onSelectOverview : undefined}
              className={`mt-[46px] cursor-default bg-cover bg-center ${canEditOverview ? 'cursor-pointer border border-dashed border-[#6D3A18]' : ''}`}
              style={overviewBackgroundStyle}>
              
                <div className="grid min-h-[360px] grid-cols-1 gap-8 px-6 py-10 sm:px-10 md:grid-cols-2 md:gap-16 md:px-16 md:py-10">
                  <div className="flex min-w-0 flex-col justify-center">
                    <h2
                    id="overview-heading"
                    className="text-[32px] font-semibold leading-tight"
                    style={{
                      color: overviewStyles.headingColor
                    }}>
                    
                      Tổng quan dự án
                    </h2>
                    {isEditor ?
                  <RichTextInput
                    editorId="overviewContent"
                    editable={canEditOverview}
                    label="Nội dung tổng quan dự án"
                    placeholder="Nhập nội dung ở đây"
                    value={content.overviewContent}
                    onChange={(overviewContent) =>
                    updateContent({
                      overviewContent
                    })
                    }
                    onSelect={() => onSelectTextEditor('overviewContent')}
                    className={`mt-6 min-h-24 text-[16px] leading-[26px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-500 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc ${canEditOverview ? 'cursor-text' : ''}`}
                    style={{
                      color: overviewStyles.contentColor
                    }} /> :

                  content.overviewContent ?
                  <div
                    className="mt-6 min-h-24 text-[16px] leading-[26px] [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
                    style={{
                      color: overviewStyles.contentColor
                    }}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichText(content.overviewContent)
                    }} /> :

                  null}
                  </div>
                  <OverviewCoverMedia
                  image={overviewCoverImage}
                  canEdit={canEditOverview}
                  displayMode={displayMode}
                  onSelect={onSelectOverviewCover}
                  onReplace={onReplaceOverviewCoverImage}
                  onRemove={onRemoveOverviewCoverImage} />
                
                </div>
              </section>

              <FeaturedProductsSection
              content={content}
              canEdit={canEditOverview}
              displayMode={displayMode}
              onUpdateContent={updateContent}
              onSelectTitle={onSelectProductsTitle}
              onSelectText={onSelectTextEditor}
              onSelectImage={onSelectProductImage}
              onReplaceImage={onReplaceProductImage}
              onRemoveImage={onRemoveProductImage}
              onRemoveProduct={onRemoveProduct} />
            

              <ProjectFloorPlansSection
              content={content}
              canEdit={canEditOverview}
              displayMode={displayMode}
              onUpdateContent={updateContent}
              onSelectText={onSelectTextEditor} />
            

              <AmenitiesSection
              content={content}
              canEdit={canEditOverview}
              displayMode={displayMode}
              styles={amenitiesStyles}
              backgroundImage={amenitiesBackgroundImage}
              onUpdateContent={updateContent}
              onSelectSection={onSelectAmenities}
              onSelectText={onSelectTextEditor}
              onSelectImage={onSelectAmenityImage}
              onAddImages={onAddAmenityImages}
              onClearBlock={onClearAmenitiesBlock} />
            

              <CustomOverviewSection
              content={content}
              canEdit={canEditOverview}
              displayMode={displayMode}
              styles={customStyles}
              backgroundImage={customBackgroundImage}
              coverImage={customCoverImage}
              onUpdateContent={updateContent}
              onSelectSection={onSelectCustom}
              onSelectText={onSelectTextEditor}
              onSelectCover={onSelectCustomCover}
              onReplaceCoverImage={onReplaceCustomCoverImage}
              onRemoveCoverImage={onRemoveCustomCoverImage} />
            

              <ContactSection
              content={content}
              canEdit={canEditOverview}
              displayMode={displayMode}
              hotlineDutyPhone={hotlineDutyPhone}
              onUpdateContent={updateContent}
              onSelectTitle={onSelectContactTitle}
              onSelectText={onSelectTextEditor} />
            
            </> :
          activeMenu === 'Mặt bằng' ?
          <section
            className={`mt-[46px] bg-white p-5 ${canEditActiveFloorPlan ? 'border border-dashed border-[#6D3A18]' : ''}`}
            aria-labelledby="floor-plan-title">
            
              <h2
              id="floor-plan-title"
              className="text-sm font-bold text-neutral-900">
              
                Mặt bằng
              </h2>
              <div
              className="mt-4 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Cấp độ mặt bằng">
              
                <LevelButton
                level={1}
                activeLevel={floorPlanLevel}
                canEdit={canEditFloorPlanLevelOne}
                displayMode={displayMode}
                onSelect={setFloorPlanLevel} />
              

                <LevelButton
                level={2}
                activeLevel={floorPlanLevel}
                canEdit={canEditFloorPlanLevelTwo}
                displayMode={displayMode}
                onSelect={setFloorPlanLevel} />
              
              </div>

              <div className="mt-6">
                {content.floorPlanImage ?
              <img
                src={content.floorPlanImage.url}
                alt={content.floorPlanImage.alt || 'Mặt bằng dự án'}
                className="mx-auto max-h-[70vh] w-full object-contain" /> :


              <div className="grid min-h-[320px] place-items-center rounded-md border border-dashed border-neutral-300 text-center text-sm text-neutral-500">
                    Chưa có ảnh mặt bằng. Đưa ảnh vào folder Drive "02. Mặt
                    bằng" rồi bấm "Đồng bộ lại".
                  </div>
              }
              </div>
            </section> :

          activeMenu === 'Ảnh 360' ?
          <section
            className={`mt-[46px] bg-white p-5 ${isEditor && canEditActiveMenu ? 'border border-dashed border-[#6D3A18]' : ''}`}
            aria-labelledby="image360-title">
            
              <h2
              id="image360-title"
              className="text-sm font-bold text-neutral-900">
              
                Ảnh 360
              </h2>
              {content.image360.length > 0 ?
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {content.image360.map((image) =>
              <div
                key={image.id}
                className="overflow-hidden rounded-md bg-neutral-100">
                
                      <img
                  src={image.url}
                  alt={image.alt || image.name || 'Ảnh 360'}
                  className="h-56 w-full object-cover" />
                
                      <p className="truncate px-3 py-2 text-xs text-neutral-600">
                        {image.name}
                      </p>
                    </div>
              )}
                </div> :

            <div className="mt-4 grid min-h-[240px] place-items-center rounded-md border border-dashed border-neutral-300 text-center text-sm text-neutral-500">
                  Chưa có ảnh 360. Đưa ảnh vào folder Drive "04. Ảnh 360" rồi
                  bấm "Đồng bộ lại".
                </div>
            }
            </section> :

          <ReadOnlySection
            section={activeMenu}
            canEdit={canEditActiveMenu}
            displayMode={displayMode} />

          }
        </div>

        <div className="hidden lg:block lg:col-start-3">
          <div className="sticky top-0">
            <VerticalBanner
              label="Banner phải"
              image={rightBanner}
              canEdit={canEditBanners}
              displayMode={displayMode}
              onSelect={onSelectBanners}
              onUpload={onUploadRightBanner} />
            
          </div>
        </div>
      </div>
    </main>);

}
function RichTextInput({
  editorId,
  editable,
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  className,
  style










}: {editorId: CmsTextEditorId;editable: boolean;label: string;placeholder: string;value: string;onChange: (value: string) => void;onSelect: () => void;className: string;style: React.CSSProperties;}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const sanitizedValue = sanitizeRichText(value);
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    if (editor.innerHTML !== sanitizedValue) editor.innerHTML = sanitizedValue;
  }, [sanitizedValue]);
  return (
    <div
      ref={editorRef}
      data-text-editor-id={editorId}
      contentEditable={editable}
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      aria-readonly={!editable}
      data-placeholder={placeholder}
      onClick={(event) => {
        event.stopPropagation();
        if (editable) onSelect();
      }}
      onFocus={() => {
        if (editable) onSelect();
      }}
      onKeyUp={() => {
        if (editable) onSelect();
      }}
      onMouseUp={() => {
        if (editable) onSelect();
      }}
      onBlur={(event) => {
        const nextValue = sanitizeRichText(event.currentTarget.innerHTML);
        if (nextValue !== value) onChange(nextValue);
      }}
      onInput={(event) =>
      onChange(sanitizeRichText(event.currentTarget.innerHTML))
      }
      className={className}
      style={style} />);


}
function OverviewCoverMedia({
  image,
  canEdit,
  displayMode,
  onSelect,
  onReplace,
  onRemove







}: {image: HeroSlide | null;canEdit: boolean;displayMode: DisplayMode;onSelect: () => void;onReplace: (file: File) => void;onRemove: () => void;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditor = displayMode === 'editor';
  function stopParentEvent(event: React.SyntheticEvent) {
    event.stopPropagation();
  }
  return (
    <div
      className={`group relative min-h-[260px] overflow-hidden bg-[#173020]/10 md:min-h-0 ${isEditor && canEdit ? 'border border-dashed border-[#6D3A18]' : ''}`}
      onClick={
      isEditor ?
      (event) => {
        stopParentEvent(event);
        if (canEdit) onSelect();
      } :
      undefined
      }>
      
      {isEditor &&
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onReplace(file);
          event.target.value = '';
        }} />

      }
      {image ?
      <>
          <img
          src={image.url}
          alt={image.alt || 'Hình minh họa tổng quan dự án'}
          className="h-full w-full object-cover" />
        

          {isEditor && canEdit &&
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              <button
            type="button"
            onClick={(event) => {
              stopParentEvent(event);
              inputRef.current?.click();
            }}
            className="grid h-9 w-9 place-items-center rounded-md bg-white text-[#6D3A18] shadow-sm hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Thay ảnh minh họa tổng quan">
            
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
            type="button"
            onClick={(event) => {
              stopParentEvent(event);
              onRemove();
            }}
            className="grid h-9 w-9 place-items-center rounded-md bg-white text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Xóa ảnh minh họa tổng quan">
            
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
        }
        </> :
      isEditor && canEdit ?
      <button
        type="button"
        onClick={(event) => {
          stopParentEvent(event);
          inputRef.current?.click();
        }}
        className="flex h-full min-h-[260px] w-full flex-col items-center justify-center gap-3 px-5 text-center text-[#6D3A18] hover:bg-orange-50/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400"
        aria-label="Tải ảnh minh họa tổng quan">
        
          <ImageIcon className="h-8 w-8" aria-hidden="true" />
          <span className="text-sm font-semibold">Tải ảnh minh họa</span>
          <span className="text-xs text-neutral-500">
            JPEG, JPG, PNG · tối đa 50MB
          </span>
        </button> :
      null}
    </div>);

}
function FeaturedCard({
  item,
  textEditorId,
  selectedMetrics,
  canEdit,
  displayMode,
  onMetricChange,
  onValueChange,
  onSelectText









}: {item: FeaturedItem;textEditorId: CmsTextEditorId;selectedMetrics: string[];canEdit: boolean;displayMode: DisplayMode;onMetricChange: (value: string) => void;onValueChange: (value: string) => void;onSelectText: () => void;}) {
  const Icon = item.metric ? getFeaturedIcon(item.metric) : null;
  const options = FEATURE_OPTIONS.filter(
    (option) => option === item.metric || !selectedMetrics.includes(option)
  );
  const isEditor = displayMode === 'editor';
  return (
    <article className="flex min-w-0 items-center gap-5 border border-[#ebebeb] bg-white p-5 shadow-sm">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[10px] bg-[#FFEDD5] text-[#F58720]">
        {Icon && <Icon className="h-[22.5px] w-[22.5px]" aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-1">
        {isEditor ?
        <select
          aria-label="Loại thông tin nổi bật"
          disabled={!canEdit}
          value={item.metric}
          onChange={(event) => onMetricChange(event.target.value)}
          className="w-full cursor-pointer appearance-none bg-transparent text-xs font-bold uppercase tracking-wide text-[#424843] outline-none disabled:cursor-not-allowed disabled:opacity-50">
          
            <option value="">-- Chọn tiêu chí --</option>
            {options.map((option) =>
          <option key={option} value={option}>
                {option}
              </option>
          )}
          </select> :
        item.metric ?
        <p className="text-xs font-bold uppercase tracking-wide text-[#424843]">
            {item.metric}
          </p> :
        null}
        {isEditor ?
        <RichTextInput
          editorId={textEditorId}
          editable={canEdit}
          label={
          item.metric ?
          `Giá trị ${item.metric}` :
          'Giá trị thông tin nổi bật'
          }
          placeholder="Nhập nội dung ở đây"
          value={item.value}
          onChange={onValueChange}
          onSelect={onSelectText}
          className={`mt-2 min-h-7 w-full min-w-0 text-2xl font-semibold leading-tight outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-base empty:before:font-medium empty:before:normal-case ${canEdit ? 'cursor-text' : 'cursor-default opacity-50'}`}
          style={{
            color: item.valueColor ?? '#6D3A18'
          }} /> :

        item.value ?
        <div
          className="mt-2 text-2xl font-semibold leading-tight"
          style={{
            color: item.valueColor ?? '#6D3A18'
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(item.value)
          }} /> :

        null}
      </div>
    </article>);

}
function getFeaturedIcon(metric: string) {
  if (metric === 'Tổng vốn đầu tư') return CircleDollarSignIcon;
  if (metric === 'Quy mô dân số') return UsersRoundIcon;
  if (metric === 'Mật độ xây dựng') return RulerIcon;
  if (metric === 'Thiết kê') return PenToolIcon;
  if (metric === 'Số tòa') return Building2Icon;
  return MapPinIcon;
}
function LevelButton({
  level,
  activeLevel,
  canEdit,
  displayMode,
  onSelect






}: {level: 1 | 2;activeLevel: 1 | 2;canEdit: boolean;displayMode: DisplayMode;onSelect: (level: 1 | 2) => void;}) {
  const isEditor = displayMode === 'editor';
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activeLevel === level}
      onClick={() => onSelect(level)}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-semibold ${isEditor ? canEdit ? activeLevel === level ? 'border-[#f5881f] bg-orange-50 text-[#f5881f]' : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50' : 'border-neutral-200 text-neutral-500 opacity-50' : activeLevel === level ? 'border-[#f5881f] bg-orange-50 text-[#f5881f]' : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>
      
      {isEditor && !canEdit ? <EyeIcon className="h-3.5 w-3.5" /> : null} Cấp độ{' '}
      {level}
    </button>);

}
function ReadOnlySection({
  section,
  canEdit,
  displayMode




}: {section: string;canEdit: boolean;displayMode: DisplayMode;}) {
  const isEditor = displayMode === 'editor';
  return (
    <section
      className={`mt-[46px] bg-white p-8 text-center ${isEditor && canEdit ? 'border border-dashed border-[#6D3A18]' : ''}`}>
      
      {isEditor && !canEdit &&
      <EyeIcon
        className="mx-auto mb-3 h-5 w-5 text-neutral-400"
        aria-hidden="true" />

      }
      <p className="text-sm font-semibold text-neutral-800">
        {isEditor ?
        canEdit ?
        `Đang chỉnh sửa: ${section}` :
        `Đang xem: ${section}` :
        section}
      </p>
      {isEditor &&
      <p className="mt-2 text-xs text-neutral-500">
          {canEdit ?
        'Nội dung cho mục này sẽ được thiết lập tại đây.' :
        'Nội dung hiển thị ở chế độ chỉ xem theo quyền hiện tại.'}
        </p>
      }
    </section>);

}
const PRODUCTS_PER_VIEW = 3;
const PRODUCTS_GAP = 20;
function isRichTextEmpty(html: string) {
  return (
    html.
    replace(/<[^>]*>/g, '').
    replace(/&nbsp;/g, ' ').
    trim() === '');

}
function hasProductContent(product: FeaturedProduct) {
  return (
    Boolean(product.image) ||
    !isRichTextEmpty(product.name) ||
    product.price.trim() !== '' ||
    !isRichTextEmpty(product.description));

}
function createEmptyProduct(): FeaturedProduct {
  return {
    id: crypto.randomUUID(),
    image: null,
    name: '',
    price: '',
    description: ''
  };
}
function FeaturedProductsSection({
  content,
  canEdit,
  displayMode,
  onUpdateContent,
  onSelectTitle,
  onSelectText,
  onSelectImage,
  onReplaceImage,
  onRemoveImage,
  onRemoveProduct











}: {content: CmsProjectContent;canEdit: boolean;displayMode: DisplayMode;onUpdateContent: (content: Partial<CmsProjectContent>) => void;onSelectTitle: () => void;onSelectText: (editorId: CmsTextEditorId) => void;onSelectImage: (index: number) => void;onReplaceImage: (id: string, file: File) => void;onRemoveImage: (id: string) => void;onRemoveProduct: (id: string) => void;}) {
  const isEditor = displayMode === 'editor';
  const [startIndex, setStartIndex] = useState(0);
  const products = isEditor ?
  content.featuredProducts :
  content.featuredProducts.filter(hasProductContent);
  const showPlusTile = isEditor && canEdit;
  const showNav = products.length > PRODUCTS_PER_VIEW;
  const maxStart = Math.max(0, products.length - PRODUCTS_PER_VIEW);
  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStart));
  }, [maxStart]);
  if (
  !isEditor &&
  products.length === 0 &&
  isRichTextEmpty(content.featuredProductsDescription))
  {
    return null;
  }
  function addProduct() {
    onUpdateContent({
      featuredProducts: [...content.featuredProducts, createEmptyProduct()]
    });
  }
  function updateProduct(id: string, patch: Partial<FeaturedProduct>) {
    onUpdateContent({
      featuredProducts: content.featuredProducts.map((product) =>
      product.id === id ?
      {
        ...product,
        ...patch
      } :
      product
      )
    });
  }
  const columnWidth = `calc((100% - ${(PRODUCTS_PER_VIEW - 1) * PRODUCTS_GAP}px) / ${PRODUCTS_PER_VIEW})`;
  return (
    <section
      className={`mt-[46px] py-[96px] ${isEditor && canEdit ? 'border border-dashed border-[#6D3A18]' : ''}`}
      aria-label="Sản phẩm nổi bật">
      
      <div className="mx-auto w-3/4">
        <h2
          onClick={isEditor && canEdit ? onSelectTitle : undefined}
          className={`text-center text-[32px] font-semibold leading-tight ${isEditor && canEdit ? 'cursor-pointer' : ''}`}
          style={{
            color: content.featuredProductsTitleColor ?? '#333333'
          }}>
          
          Sản phẩm nổi bật
        </h2>
        {isEditor ?
        <RichTextInput
          editorId="featuredProductsDescription"
          editable={canEdit}
          label="Mô tả sản phẩm nổi bật"
          placeholder="Nhập đoạn mô tả ngắn cho mục này"
          value={content.featuredProductsDescription}
          onChange={(featuredProductsDescription) =>
          onUpdateContent({
            featuredProductsDescription
          })
          }
          onSelect={() => onSelectText('featuredProductsDescription')}
          className={`mt-3 min-h-7 w-full text-center text-[16px] leading-[26px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 ${canEdit ? 'cursor-text' : 'cursor-not-allowed opacity-50'}`}
          style={{
            color: content.featuredProductsDescriptionColor ?? '#424843'
          }} /> :

        !isRichTextEmpty(content.featuredProductsDescription) ?
        <div
          className="mt-3 w-full text-center text-[16px] leading-[26px]"
          style={{
            color: content.featuredProductsDescriptionColor ?? '#424843'
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(content.featuredProductsDescription)
          }} /> :

        null}

        <div className="mt-10 flex items-stretch gap-5">
          <div className="relative min-w-0 flex-1">
            {showNav &&
            <button
              type="button"
              aria-label="Sản phẩm trước"
              disabled={startIndex === 0}
              onClick={() => setStartIndex((index) => Math.max(0, index - 1))}
              className="absolute -left-5 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[#6D3A18] shadow-md transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-200">
              
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
            }
            <div className="overflow-hidden">
              <div
                className={`grid grid-flow-col items-stretch gap-5 transition-transform duration-300 ${products.length < PRODUCTS_PER_VIEW ? 'justify-center' : ''}`}
                style={{
                  gridAutoColumns: columnWidth,
                  transform: showNav ?
                  `translateX(calc(${-startIndex} * (${columnWidth} + ${PRODUCTS_GAP}px)))` :
                  undefined
                }}>
                
                {products.map((product, index) =>
                <FeaturedProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  canEdit={canEdit}
                  displayMode={displayMode}
                  onUpdate={updateProduct}
                  onSelectText={onSelectText}
                  onSelectImage={onSelectImage}
                  onReplaceImage={onReplaceImage}
                  onRemoveImage={onRemoveImage}
                  onRemove={onRemoveProduct} />

                )}
              </div>
            </div>
            {showNav &&
            <button
              type="button"
              aria-label="Sản phẩm tiếp theo"
              disabled={startIndex >= maxStart}
              onClick={() =>
              setStartIndex((index) => Math.min(maxStart, index + 1))
              }
              className="absolute -right-5 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[#6D3A18] shadow-md transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-200">
              
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            }
          </div>
          {showPlusTile &&
          <button
            type="button"
            onClick={addProduct}
            aria-label="Thêm sản phẩm mới"
            className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 self-stretch rounded-xl border border-dashed border-[#6D3A18] text-[#6D3A18] transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200">
            
              <PlusIcon className="h-7 w-7" />
              <span className="text-[11px] font-semibold leading-tight">
                Thêm
              </span>
            </button>
          }
        </div>
      </div>
    </section>);

}
function FeaturedProductCard({
  product,
  index,
  canEdit,
  displayMode,
  onUpdate,
  onSelectText,
  onSelectImage,
  onReplaceImage,
  onRemoveImage,
  onRemove











}: {product: FeaturedProduct;index: number;canEdit: boolean;displayMode: DisplayMode;onUpdate: (id: string, patch: Partial<FeaturedProduct>) => void;onSelectText: (editorId: CmsTextEditorId) => void;onSelectImage: (index: number) => void;onReplaceImage: (id: string, file: File) => void;onRemoveImage: (id: string) => void;onRemove: (id: string) => void;}) {
  const isEditor = displayMode === 'editor';
  const imageInputRef = useRef<HTMLInputElement>(null);
  function stopParentEvent(event: React.SyntheticEvent) {
    event.stopPropagation();
  }
  return (
    <article className="relative flex min-w-0 flex-col bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      {isEditor && canEdit &&
      <button
        type="button"
        aria-label="Xóa sản phẩm"
        onClick={(event) => {
          stopParentEvent(event);
          onRemove(product.id);
        }}
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-md bg-white/90 text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100">
        
          <Trash2Icon className="h-4 w-4" />
        </button>
      }
      <div
        className={`group relative aspect-[368/256] w-full overflow-hidden rounded-t-xl bg-[#173020]/10 ${isEditor && canEdit ? 'cursor-pointer' : ''}`}
        onClick={
        isEditor && canEdit ?
        (event) => {
          stopParentEvent(event);
          onSelectImage(index);
        } :
        undefined
        }>
        
        {isEditor &&
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onReplaceImage(product.id, file);
            event.target.value = '';
          }} />

        }
        {product.image ?
        <>
            <img
            src={product.image.url}
            alt={product.image.alt || 'Ảnh sản phẩm'}
            className="h-full w-full object-cover" />
          

            {isEditor && canEdit &&
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                <button
              type="button"
              onClick={(event) => {
                stopParentEvent(event);
                imageInputRef.current?.click();
              }}
              className="grid h-9 w-9 place-items-center rounded-md bg-white text-[#6D3A18] shadow-sm hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Thay ảnh sản phẩm">
              
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
              type="button"
              onClick={(event) => {
                stopParentEvent(event);
                onRemoveImage(product.id);
              }}
              className="grid h-9 w-9 place-items-center rounded-md bg-white text-red-600 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Xóa ảnh sản phẩm">
              
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
          }
          </> :
        isEditor && canEdit ?
        <button
          type="button"
          onClick={(event) => {
            stopParentEvent(event);
            imageInputRef.current?.click();
          }}
          className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-[#6D3A18] hover:bg-orange-50/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400"
          aria-label="Tải ảnh sản phẩm">
          
            <ImageIcon className="h-8 w-8" aria-hidden="true" />
            <span className="text-sm font-semibold">Tải ảnh sản phẩm</span>
            <span className="text-xs text-neutral-500">
              JPEG, JPG, PNG · khuyến nghị 368 × 256px
            </span>
          </button> :
        null}
      </div>
      <div className="flex flex-1 flex-col p-8">
        {isEditor ?
        <RichTextInput
          editorId={`product-name-${index}`}
          editable={canEdit}
          label="Tên sản phẩm"
          placeholder="Nhập tên sản phẩm"
          value={product.name}
          onChange={(name) =>
          onUpdate(product.id, {
            name
          })
          }
          onSelect={() => onSelectText(`product-name-${index}`)}
          className={`min-h-7 w-full text-[20px] font-semibold leading-snug outline-none empty:before:content-[attr(data-placeholder)] empty:before:font-normal empty:before:text-neutral-400 ${canEdit ? 'cursor-text' : 'cursor-not-allowed opacity-50'}`}
          style={{
            color: product.nameColor ?? '#6D3A18'
          }} /> :

        !isRichTextEmpty(product.name) ?
        <h3
          className="text-[20px] font-semibold leading-snug"
          style={{
            color: product.nameColor ?? '#6D3A18'
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(product.name)
          }} /> :

        null}
        {isEditor || product.price.trim() !== '' ?
        <div className="mt-3 flex items-baseline justify-between gap-3">
            <span className="shrink-0 text-[16px] leading-[26px] text-[#424843]">
              Giá
            </span>
            {isEditor ?
          <input
            type="text"
            aria-label="Giá sản phẩm"
            readOnly={!canEdit}
            value={product.price}
            placeholder="Số tiền"
            onChange={(event) =>
            onUpdate(product.id, {
              price: event.target.value
            })
            }
            className="min-w-0 flex-1 bg-transparent text-right text-[24px] font-semibold text-[#F58720] outline-none placeholder:text-[16px] placeholder:font-normal placeholder:text-neutral-400 read-only:cursor-not-allowed read-only:opacity-50" /> :


          <span className="min-w-0 break-words text-right text-[24px] font-semibold text-[#F58720]">
                {product.price}
              </span>
          }
          </div> :
        null}
        <div className="my-4 border-t border-[#C2C8C1]/30" />
        {isEditor ?
        <RichTextInput
          editorId={`product-desc-${index}`}
          editable={canEdit}
          label="Mô tả sản phẩm"
          placeholder="Nhập mô tả sản phẩm"
          value={product.description}
          onChange={(description) =>
          onUpdate(product.id, {
            description
          })
          }
          onSelect={() => onSelectText(`product-desc-${index}`)}
          className={`min-h-14 w-full flex-1 text-[16px] leading-[26px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc ${canEdit ? 'cursor-text' : 'cursor-not-allowed opacity-50'}`}
          style={{
            color: product.descriptionColor ?? '#424843'
          }} /> :

        !isRichTextEmpty(product.description) ?
        <div
          className="flex-1 text-[16px] leading-[26px] [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
          style={{
            color: product.descriptionColor ?? '#424843'
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(product.description)
          }} /> :


        <div className="flex-1" />
        }
        {isEditor ?
        <button
          type="button"
          onClick={(event) => {
            stopParentEvent(event);
            window.open('/chi-tiet-san-pham', '_blank');
          }}
          className="mt-6 w-full bg-[#F58720] py-4 text-center text-[16px] font-semibold text-white transition-colors hover:bg-[#e07b12] focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            Xem chi tiết
          </button> :

        <Link
          to="/chi-tiet-san-pham"
          className="mt-6 block w-full bg-[#F58720] py-4 text-center text-[16px] font-semibold text-white transition-colors hover:bg-[#e07b12] focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            Xem chi tiết
          </Link>
        }
      </div>
    </article>);

}
/**
 * Section "Mặt bằng dự án" hiển thị trong tab Tổng quan — nguồn dữ liệu là
 * `overviewFloorPlanPreview` đồng bộ từ folder Drive "01. Tổng quan / Ảnh mặt
 * bằng" (mỗi ảnh trong folder = 1 tab, tên file = tên tab). Read-only, muốn
 * cập nhật thì đổi ảnh trong Drive rồi bấm "Đồng bộ lại".
 */
function ProjectFloorPlansSection({
  content,
  canEdit,
  displayMode,
  onUpdateContent,
  onSelectText






}: {content: CmsProjectContent;canEdit: boolean;displayMode: DisplayMode;onUpdateContent: (content: Partial<CmsProjectContent>) => void;onSelectText: (editorId: CmsTextEditorId) => void;}) {
  const isEditor = displayMode === 'editor';
  const previewItems = content.overviewFloorPlanPreview;
  const [activeTabId, setActiveTabId] = useState(previewItems[0]?.id ?? '');
  const activeItem =
  previewItems.find((item) => item.id === activeTabId) ?? previewItems[0] ?? null;
  useEffect(() => {
    if (previewItems.length > 0 && !previewItems.some((item) => item.id === activeTabId)) {
      setActiveTabId(previewItems[0].id);
    }
  }, [activeTabId, previewItems]);
  if (!isEditor && previewItems.length === 0) return null;
  return (
    <section
      className={`mt-[46px] py-[96px] ${isEditor && canEdit ? 'border border-dashed border-[#6D3A18]' : ''}`}
      aria-labelledby="floor-plans-heading">
      
      <div className="mx-auto w-3/4">
        <h2
          id="floor-plans-heading"
          className="text-center text-[32px] font-semibold leading-tight text-[#333333]">
          
          Mặt bằng dự án
        </h2>
        {isEditor ?
        <RichTextInput
          editorId="floorPlansDescription"
          editable={canEdit}
          label="Mô tả mặt bằng dự án"
          placeholder="Nhập đoạn mô tả ngắn cho mục này"
          value={content.floorPlansDescription}
          onChange={(floorPlansDescription) =>
          onUpdateContent({
            floorPlansDescription
          })
          }
          onSelect={() => onSelectText('floorPlansDescription')}
          className={`mt-3 min-h-7 w-full text-center text-[16px] leading-[26px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 ${canEdit ? 'cursor-text' : 'cursor-not-allowed opacity-50'}`}
          style={{
            color: content.floorPlansDescriptionColor ?? '#424843'
          }} /> :

        !isRichTextEmpty(content.floorPlansDescription) ?
        <div
          className="mt-3 w-full text-center text-[16px] leading-[26px]"
          style={{
            color: content.floorPlansDescriptionColor ?? '#424843'
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(content.floorPlansDescription)
          }} /> :

        null}

        {previewItems.length === 0 && isEditor ?
        <p className="mt-8 text-center text-sm text-neutral-500">
            Chưa có ảnh mặt bằng. Đưa ảnh vào folder Drive "01. Tổng quan / Ảnh
            mặt bằng" rồi bấm "Đồng bộ lại".
          </p> :

        <>
            <div
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            role="tablist"
            aria-label="Mặt bằng dự án">
            
              {previewItems.map((item) => {
              const active = item.id === activeItem?.id;
              const tabClassName = `rounded-full text-[16px] font-medium leading-6 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 px-5 py-2 ${active ? 'bg-[#F58720] text-white' : 'bg-[#F58720]/20 text-[#424843] hover:bg-[#F58720]/30'}`;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`floor-plan-panel-${item.id}`}
                  onClick={() => setActiveTabId(item.id)}
                  className={tabClassName}>
                  
                    {item.label}
                  </button>);

            })}
            </div>

            {activeItem &&
          <div
            id={`floor-plan-panel-${activeItem.id}`}
            className="mt-8"
            role="tabpanel"
            aria-label={activeItem.label || 'Nội dung mặt bằng'}>
            
                <img
              src={activeItem.image.url}
              alt={activeItem.image.alt || activeItem.label || 'Mặt bằng dự án'}
              className="mx-auto max-h-[560px] w-full object-contain" />
              
              </div>
          }
          </>
        }
      </div>
    </section>);

}
function amenityImageAlt(caption: string, projectName: string) {
  const parts = [caption.trim(), projectName.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(' - ') : 'Tiện ích dự án';
}
function hasAmenitiesBlockContent(block: AmenitiesBlock | null) {
  if (!block) return false;
  if (block.type === 'paragraph') return !isRichTextEmpty(block.paragraph);
  return block.images.length > 0;
}
function sectionBackgroundStyle(
styles: OverviewStyles,
backgroundImage: HeroSlide | null)
: React.CSSProperties {
  const overlay = hexToRgba(
    styles.backgroundColor,
    styles.backgroundOpacity / 100
  );
  return {
    backgroundColor: overlay,
    ...(backgroundImage ?
    {
      backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${backgroundImage.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    } :
    {})
  };
}
function AmenityCaptionOverlay({
  caption,
  placeholderVisible


}: {caption: string;placeholderVisible: boolean;}) {
  if (isRichTextEmpty(caption) && !placeholderVisible) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-5">
      {isRichTextEmpty(caption) ?
      <p className="text-left text-sm italic text-white/70">
          Thêm mô tả cho ảnh trong bảng điều khiển
        </p> :

      <p className="text-left text-[16px] leading-[26px] text-white">
          {caption}
        </p>
      }
    </div>);

}
function AmenitySingleCarousel({
  images,
  projectName,
  canEdit,
  displayMode,
  onSelectImage,
  onRequestMoreImages,
  onClearBlock







}: {images: AmenityImage[];projectName: string;canEdit: boolean;displayMode: DisplayMode;onSelectImage: (imageId: string) => void;onRequestMoreImages: () => void;onClearBlock: () => void;}) {
  const isEditor = displayMode === 'editor';
  const [slideIndex, setSlideIndex] = useState(0);
  const maxIndex = Math.max(0, images.length - 1);
  useEffect(() => {
    setSlideIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);
  const showNav = images.length > 1;
  return (
    <div>
      <div className="relative">
        {showNav &&
        <button
          type="button"
          aria-label="Ảnh trước"
          disabled={slideIndex === 0}
          onClick={(event) => {
            event.stopPropagation();
            setSlideIndex((index) => Math.max(0, index - 1));
          }}
          className="absolute left-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#6D3A18] shadow-md transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        }
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${slideIndex * 100}%)`
            }}>
            
            {images.map((item) =>
            <div
              key={item.id}
              className={`group relative w-full shrink-0 ${isEditor && canEdit ? 'cursor-pointer' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                if (isEditor && canEdit) onSelectImage(item.id);
              }}>
              
                <img
                src={item.image.url}
                alt={
                item.image.alt || amenityImageAlt(item.caption, projectName)
                }
                className="aspect-[16/9] w-full object-cover" />
              
                <AmenityCaptionOverlay
                caption={item.caption}
                placeholderVisible={isEditor && canEdit} />
              
                {isEditor && canEdit &&
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-[#6D3A18]">
                      Chỉnh sửa hình ảnh
                    </span>
                  </div>
              }
              </div>
            )}
          </div>
        </div>
        {showNav &&
        <button
          type="button"
          aria-label="Ảnh tiếp theo"
          disabled={slideIndex >= maxIndex}
          onClick={(event) => {
            event.stopPropagation();
            setSlideIndex((index) => Math.min(maxIndex, index + 1));
          }}
          className="absolute right-4 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#6D3A18] shadow-md transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        }
      </div>
      {isEditor && canEdit &&
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRequestMoreImages();
          }}
          className="inline-flex items-center gap-2 rounded-md border border-dashed border-[#6D3A18] px-4 py-2.5 text-sm font-semibold text-[#6D3A18] transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Thêm ảnh
          </button>
          <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClearBlock();
          }}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100">
          
            <Trash2Icon className="h-4 w-4" aria-hidden="true" />
            Xóa nội dung
          </button>
        </div>
      }
    </div>);

}
const AMENITY_GRID_PER_VIEW = 4;
const AMENITY_GRID_GAP = 20;
function AmenityGridCarousel({
  images,
  projectName,
  canEdit,
  displayMode,
  onSelectImage,
  onRequestMoreImages,
  onClearBlock







}: {images: AmenityImage[];projectName: string;canEdit: boolean;displayMode: DisplayMode;onSelectImage: (imageId: string) => void;onRequestMoreImages: () => void;onClearBlock: () => void;}) {
  const isEditor = displayMode === 'editor';
  const [startIndex, setStartIndex] = useState(0);
  const maxStart = Math.max(0, images.length - AMENITY_GRID_PER_VIEW);
  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStart));
  }, [maxStart]);
  const showNav = images.length > AMENITY_GRID_PER_VIEW;
  const columnWidth = `calc((100% - ${(AMENITY_GRID_PER_VIEW - 1) * AMENITY_GRID_GAP}px) / ${AMENITY_GRID_PER_VIEW})`;
  return (
    <div>
      <div className="relative">
        {showNav &&
        <button
          type="button"
          aria-label="Ảnh trước"
          disabled={startIndex === 0}
          onClick={(event) => {
            event.stopPropagation();
            setStartIndex((index) => Math.max(0, index - 1));
          }}
          className="absolute -left-5 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[#6D3A18] shadow-md transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        }
        <div className="overflow-hidden">
          <div
            className={`grid grid-flow-col items-stretch gap-5 transition-transform duration-300 ${images.length < AMENITY_GRID_PER_VIEW ? 'justify-center' : ''}`}
            style={{
              gridAutoColumns: columnWidth,
              transform: showNav ?
              `translateX(calc(${-startIndex} * (${columnWidth} + ${AMENITY_GRID_GAP}px)))` :
              undefined
            }}>
            
            {images.map((item) =>
            <div
              key={item.id}
              className={`group relative min-w-0 overflow-hidden ${isEditor && canEdit ? 'cursor-pointer' : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                if (isEditor && canEdit) onSelectImage(item.id);
              }}>
              
                <img
                src={item.image.url}
                alt={
                item.image.alt || amenityImageAlt(item.caption, projectName)
                }
                className="aspect-[368/256] w-full object-cover" />
              
                <AmenityCaptionOverlay
                caption={item.caption}
                placeholderVisible={false} />
              
                {isEditor && canEdit &&
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-[#6D3A18]">
                      Chỉnh sửa
                    </span>
                  </div>
              }
              </div>
            )}
          </div>
        </div>
        {showNav &&
        <button
          type="button"
          aria-label="Ảnh tiếp theo"
          disabled={startIndex >= maxStart}
          onClick={(event) => {
            event.stopPropagation();
            setStartIndex((index) => Math.min(maxStart, index + 1));
          }}
          className="absolute -right-5 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-[#6D3A18] shadow-md transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        }
      </div>
      {isEditor && canEdit &&
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRequestMoreImages();
          }}
          className="inline-flex items-center gap-2 rounded-md border border-dashed border-[#6D3A18] px-4 py-2.5 text-sm font-semibold text-[#6D3A18] transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Thêm ảnh
          </button>
          <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClearBlock();
          }}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100">
          
            <Trash2Icon className="h-4 w-4" aria-hidden="true" />
            Xóa nội dung
          </button>
        </div>
      }
    </div>);

}
function AmenitiesSection({
  content,
  canEdit,
  displayMode,
  styles,
  backgroundImage,
  onUpdateContent,
  onSelectSection,
  onSelectText,
  onSelectImage,
  onAddImages,
  onClearBlock










}: {content: CmsProjectContent;canEdit: boolean;displayMode: DisplayMode;styles: OverviewStyles;backgroundImage: HeroSlide | null;onUpdateContent: (content: Partial<CmsProjectContent>) => void;onSelectSection: () => void;onSelectText: (editorId: CmsTextEditorId) => void;onSelectImage: (imageId: string) => void;onAddImages: (type: AmenitiesCarouselType, files: File[]) => void;onClearBlock: () => void;}) {
  const isEditor = displayMode === 'editor';
  const [showChoices, setShowChoices] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pendingTypeRef = useRef<AmenitiesCarouselType>('carousel-single');
  const block = content.amenitiesBlock;
  if (
  !isEditor &&
  isRichTextEmpty(content.amenitiesDescription) &&
  !hasAmenitiesBlockContent(block))
  {
    return null;
  }
  function chooseParagraph() {
    onUpdateContent({
      amenitiesBlock: {
        id: crypto.randomUUID(),
        type: 'paragraph',
        paragraph: ''
      }
    });
    setShowChoices(false);
    window.setTimeout(() => onSelectText('amenitiesParagraph'), 0);
  }
  function requestImages(type: AmenitiesCarouselType) {
    pendingTypeRef.current = type;
    imageInputRef.current?.click();
  }
  return (
    <section
      onClick={isEditor && canEdit ? onSelectSection : undefined}
      className={`mt-[46px] cursor-default bg-cover bg-center py-[96px] ${isEditor && canEdit ? 'cursor-pointer border border-dashed border-[#6D3A18]' : ''}`}
      style={sectionBackgroundStyle(styles, backgroundImage)}
      aria-labelledby="amenities-heading">
      
      <div className="mx-auto w-3/4">
        <h2
          id="amenities-heading"
          className="text-center text-[32px] font-semibold leading-tight"
          style={{
            color: styles.headingColor
          }}>
          
          Tiện ích
        </h2>
        {isEditor ?
        <RichTextInput
          editorId="amenitiesDescription"
          editable={canEdit}
          label="Mô tả tiện ích"
          placeholder="Nhập mô tả ngắn cho mục này"
          value={content.amenitiesDescription}
          onChange={(amenitiesDescription) =>
          onUpdateContent({
            amenitiesDescription
          })
          }
          onSelect={() => onSelectText('amenitiesDescription')}
          className={`mt-3 min-h-7 w-full text-center text-[16px] leading-[26px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-500 ${canEdit ? 'cursor-text' : 'cursor-not-allowed opacity-50'}`}
          style={{
            color: content.amenitiesDescriptionColor ?? '#424843'
          }} /> :

        !isRichTextEmpty(content.amenitiesDescription) ?
        <div
          className="mt-3 w-full text-center text-[16px] leading-[26px]"
          style={{
            color: content.amenitiesDescriptionColor ?? '#424843'
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(content.amenitiesDescription)
          }} /> :

        null}

        <div className="mt-10">
          {block ?
          block.type === 'paragraph' ?
          <div onClick={(event) => event.stopPropagation()}>
                {isEditor ?
            <RichTextInput
              editorId="amenitiesParagraph"
              editable={canEdit}
              label="Đoạn văn tiện ích"
              placeholder="Nhập nội dung ở đây"
              value={block.paragraph}
              onChange={(paragraph) =>
              onUpdateContent({
                amenitiesBlock: {
                  ...block,
                  paragraph
                }
              })
              }
              onSelect={() => onSelectText('amenitiesParagraph')}
              className={`min-h-32 w-full rounded-md text-[16px] leading-[26px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-500 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc ${canEdit ? 'cursor-text border border-dashed border-[#6D3A18] p-5' : 'cursor-not-allowed opacity-50'}`}
              style={{
                color: block.paragraphColor ?? '#424843'
              }} /> :

            <div
              className="text-[16px] leading-[26px] [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
              style={{
                color: block.paragraphColor ?? '#424843'
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(block.paragraph)
              }} />
            }
                {isEditor && canEdit &&
            <div className="mt-4 flex justify-center">
                    <button
                type="button"
                onClick={onClearBlock}
                className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100">
                
                      <Trash2Icon className="h-4 w-4" aria-hidden="true" />
                      Xóa nội dung
                    </button>
                  </div>
            }
              </div> :
          block.type === 'carousel-single' ?
          <AmenitySingleCarousel
            images={block.images}
            projectName={content.projectName}
            canEdit={canEdit}
            displayMode={displayMode}
            onSelectImage={onSelectImage}
            onRequestMoreImages={() => requestImages('carousel-single')}
            onClearBlock={onClearBlock} /> :


          <AmenityGridCarousel
            images={block.images}
            projectName={content.projectName}
            canEdit={canEdit}
            displayMode={displayMode}
            onSelectImage={onSelectImage}
            onRequestMoreImages={() => requestImages('carousel-grid')}
            onClearBlock={onClearBlock} /> :


          isEditor && canEdit ?
          <div
            className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-[#6D3A18] px-6 py-10 text-center"
            onClick={(event) => event.stopPropagation()}>
            
              {showChoices ?
            <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <button
                type="button"
                onClick={chooseParagraph}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#6D3A18] bg-white px-5 py-3 text-sm font-semibold text-[#6D3A18] transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200">
                
                    <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                    Thêm đoạn văn
                  </button>
                  <button
                type="button"
                onClick={() => requestImages('carousel-single')}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#F58720] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e07b12] focus:outline-none focus:ring-2 focus:ring-orange-200">
                
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    Carousel 1 cột
                  </button>
                  <button
                type="button"
                onClick={() => requestImages('carousel-grid')}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#6D3A18] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5b3013] focus:outline-none focus:ring-2 focus:ring-orange-200">
                
                    <LayoutGridIcon className="h-4 w-4" aria-hidden="true" />
                    Carousel 4 cột
                  </button>
                </div> :

            <button
              type="button"
              onClick={() => setShowChoices(true)}
              aria-label="Thêm nội dung tiện ích"
              className="grid h-14 w-14 place-items-center rounded-full border border-dashed border-[#6D3A18] text-[#6D3A18] transition-colors hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200">
              
                  <PlusIcon className="h-7 w-7" aria-hidden="true" />
                </button>
            }
              <p className="mt-4 text-sm text-neutral-500">
                Thêm nội dung cho mục tiện ích
              </p>
            </div> :
          null}
        </div>

        {isEditor &&
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="sr-only"
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length > 0)
            onAddImages(pendingTypeRef.current, files);
            event.target.value = '';
            setShowChoices(false);
          }} />

        }
      </div>
    </section>);

}
function CustomOverviewSection({
  content,
  canEdit,
  displayMode,
  styles,
  backgroundImage,
  coverImage,
  onUpdateContent,
  onSelectSection,
  onSelectText,
  onSelectCover,
  onReplaceCoverImage,
  onRemoveCoverImage











}: {content: CmsProjectContent;canEdit: boolean;displayMode: DisplayMode;styles: OverviewStyles;backgroundImage: HeroSlide | null;coverImage: HeroSlide | null;onUpdateContent: (content: Partial<CmsProjectContent>) => void;onSelectSection: () => void;onSelectText: (editorId: CmsTextEditorId) => void;onSelectCover: () => void;onReplaceCoverImage: (file: File) => void;onRemoveCoverImage: () => void;}) {
  const isEditor = displayMode === 'editor';
  if (
  !isEditor &&
  isRichTextEmpty(content.customTitle) &&
  isRichTextEmpty(content.customContent) &&
  !coverImage)
  {
    return null;
  }
  return (
    <section
      aria-label="Section tùy chỉnh"
      onClick={isEditor && canEdit ? onSelectSection : undefined}
      className={`mt-[46px] cursor-default bg-cover bg-center ${isEditor && canEdit ? 'cursor-pointer border border-dashed border-[#6D3A18]' : ''}`}
      style={sectionBackgroundStyle(styles, backgroundImage)}>
      
      <div className="grid min-h-[360px] grid-cols-1 gap-8 px-6 py-10 sm:px-10 md:grid-cols-2 md:gap-16 md:px-16 md:py-10">
        <div className="flex min-w-0 flex-col justify-center">
          {isEditor ?
          <RichTextInput
            editorId="customTitle"
            editable={canEdit}
            label="Tiêu đề section"
            placeholder="Nhập tiêu đề section"
            value={content.customTitle}
            onChange={(customTitle) =>
            onUpdateContent({
              customTitle
            })
            }
            onSelect={() => onSelectText('customTitle')}
            className={`text-[32px] font-semibold leading-tight outline-none empty:before:content-[attr(data-placeholder)] empty:before:font-normal empty:before:text-neutral-500 ${canEdit ? 'cursor-text' : ''}`}
            style={{
              color: styles.headingColor
            }} /> :

          !isRichTextEmpty(content.customTitle) ?
          <h2
            className="text-[32px] font-semibold leading-tight"
            style={{
              color: styles.headingColor
            }}
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(content.customTitle)
            }} /> :

          null}
          {isEditor ?
          <RichTextInput
            editorId="customContent"
            editable={canEdit}
            label="Nội dung section tùy chỉnh"
            placeholder="Nhập nội dung ở đây"
            value={content.customContent}
            onChange={(customContent) =>
            onUpdateContent({
              customContent
            })
            }
            onSelect={() => onSelectText('customContent')}
            className={`mt-6 min-h-24 text-[16px] leading-[26px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-500 [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc ${canEdit ? 'cursor-text' : ''}`}
            style={{
              color: styles.contentColor
            }} /> :

          !isRichTextEmpty(content.customContent) ?
          <div
            className="mt-6 min-h-24 text-[16px] leading-[26px] [&_ol]:ml-5 [&_ol]:list-decimal [&_ul]:ml-5 [&_ul]:list-disc"
            style={{
              color: styles.contentColor
            }}
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(content.customContent)
            }} /> :

          null}
        </div>
        <OverviewCoverMedia
          image={coverImage}
          canEdit={canEdit}
          displayMode={displayMode}
          onSelect={onSelectCover}
          onReplace={onReplaceCoverImage}
          onRemove={onRemoveCoverImage} />
        
      </div>
    </section>);

}
const CONTACT_BASE_COLUMNS = [
{
  key: 'hotline',
  icon: PhoneIcon,
  name: 'Hotline',
  value: '1800 6268',
  buttonLabel: 'Gọi ngay',
  buttonClassName: 'bg-white text-[#6D3A18] hover:bg-orange-50'
},
{
  key: 'zalo',
  icon: MessageCircleIcon,
  name: 'Chat Zalo',
  value: 'Nhắn tin zalo',
  buttonLabel: 'Mở Zalo',
  buttonClassName: 'bg-[#0068FF] text-white hover:bg-[#0058d6]'
},
{
  key: 'ai',
  icon: BotIcon,
  name: 'Trợ lý AI',
  value: 'Hỗ trợ 24/7',
  buttonLabel: 'Bắt đầu chat',
  buttonClassName: 'bg-[#402402] text-white hover:bg-[#33210a]'
}];

function ContactSection({
  content,
  canEdit,
  displayMode,
  hotlineDutyPhone,
  onUpdateContent,
  onSelectTitle,
  onSelectText






}: {content: CmsProjectContent;canEdit: boolean;displayMode: DisplayMode;hotlineDutyPhone: string;onUpdateContent: (content: Partial<CmsProjectContent>) => void;onSelectTitle: () => void;onSelectText: (editorId: CmsTextEditorId) => void;}) {
  const isEditor = displayMode === 'editor';
  const columns = hotlineDutyPhone.trim() ?
  [
  {
    key: 'manager',
    icon: PhoneIcon,
    name: 'Quản lý dự án',
    value: hotlineDutyPhone.trim(),
    buttonLabel: 'Gọi ngay',
    buttonClassName: 'bg-white text-[#6D3A18] hover:bg-orange-50'
  },
  ...CONTACT_BASE_COLUMNS] :

  CONTACT_BASE_COLUMNS;
  return (
    <section
      className={`mt-[46px] py-[96px] ${isEditor && canEdit ? 'border border-dashed border-[#6D3A18]' : ''}`}
      aria-labelledby="contact-heading">
      
      <div className="mx-auto w-3/4">
        <h2
          id="contact-heading"
          onClick={isEditor && canEdit ? onSelectTitle : undefined}
          className={`text-center text-[32px] font-semibold leading-tight ${isEditor && canEdit ? 'cursor-pointer' : ''}`}
          style={{
            color: content.contactTitleColor ?? '#333333'
          }}>
          
          Liên hệ tư vấn
        </h2>
        {isEditor ?
        <RichTextInput
          editorId="contactDescription"
          editable={canEdit}
          label="Mô tả liên hệ tư vấn"
          placeholder="Nhập mô tả cho nội dung này"
          value={content.contactDescription}
          onChange={(contactDescription) =>
          onUpdateContent({
            contactDescription
          })
          }
          onSelect={() => onSelectText('contactDescription')}
          className={`mt-3 min-h-7 w-full text-center text-[16px] leading-[26px] outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400 ${canEdit ? 'cursor-text' : 'cursor-not-allowed opacity-50'}`}
          style={{
            color: content.contactDescriptionColor ?? '#424843'
          }} /> :

        !isRichTextEmpty(content.contactDescription) ?
        <div
          className="mt-3 w-full text-center text-[16px] leading-[26px]"
          style={{
            color: content.contactDescriptionColor ?? '#424843'
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(content.contactDescription)
          }} /> :

        null}

        <div className="mt-10 flex flex-wrap items-stretch justify-center gap-6">
          {columns.map((column) => {
            const Icon = column.icon;
            return (
              <div
                key={column.key}
                className="flex w-full max-w-[300px] flex-col items-center rounded-[40px] bg-[#6D3A18] p-10 text-center">
                
                <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
                  <Icon
                    aria-hidden="true"
                    className="text-[#F58720]"
                    style={{
                      width: 27,
                      height: 27
                    }} />
                  
                </div>
                <p className="mt-5 text-[16px] font-semibold uppercase tracking-wide text-white">
                  {column.name}
                </p>
                <p className="mt-2 min-h-[28px] text-[20px] font-semibold text-white">
                  {column.value}
                </p>
                <button
                  type="button"
                  className={`mt-6 w-full rounded-full py-4 text-[16px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 ${column.buttonClassName}`}>
                  
                  {column.buttonLabel}
                </button>
              </div>);

          })}
        </div>
      </div>
    </section>);

}
function getEditableMenus(role: CmsRole): Set<string> {
  if (role === 'Trưởng line') return new Set();
  if (role === 'Quản lý bán hàng')
  return new Set(['Mặt bằng', 'Bảng hàng', 'Quỹ căn']);
  if (role === 'Marketing') return new Set(['Tin tức']);
  return new Set(
    MENU_ITEMS.map(({ label }) => label).filter(
      (label) => !['Bảng hàng', 'Quỹ căn', 'Tin tức'].includes(label)
    )
  );
}
function hexToRgba(hex: string, opacity: number) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const red = value >> 16 & 255;
  const green = value >> 8 & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}