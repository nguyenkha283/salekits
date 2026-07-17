import React, { useEffect, useState, useRef } from 'react';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  EyeIcon,
  FileTextIcon,
  ImageIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  PencilIcon,
  PlusIcon,
  SubscriptIcon,
  SuperscriptIcon,
  Trash2Icon,
  UnderlineIcon,
  XIcon } from
'lucide-react';
import { CmsRightPanelMode } from './CmsHeader';
import {
  AmenitiesBlock,
  AmenityImage,
  FeaturedProduct,
  FloorPlanImageBlock,
  FloorPlanTab,
  HeroSlide,
  OverviewStyles,
  SelectedEditorBlock } from
'../types/cms';
type BannerSide = 'left' | 'right';
interface CmsRightPanelProps {
  mode: Exclude<CmsRightPanelMode, null>;
  selectedBlock: SelectedEditorBlock;
  slides: HeroSlide[];
  leftBanner: HeroSlide | null;
  rightBanner: HeroSlide | null;
  overviewBackgroundImage: HeroSlide | null;
  overviewCoverImage: HeroSlide | null;
  overviewStyles: OverviewStyles;
  amenitiesStyles: OverviewStyles;
  amenitiesBackgroundImage: HeroSlide | null;
  amenitiesBlock: AmenitiesBlock | null;
  customStyles: OverviewStyles;
  customBackgroundImage: HeroSlide | null;
  customCoverImage: HeroSlide | null;
  featuredProducts: FeaturedProduct[];
  floorPlanTabs: FloorPlanTab[];
  productsTitleColor: string;
  contactTitleColor: string;
  projectName: string;
  canEditHero: boolean;
  canEditBanners: boolean;
  canEditOverview: boolean;
  textColor: string;
  onRemoveSlide: (id: string) => void;
  onRequestUpload: () => void;
  onSlideAltChange: (id: string, alt: string) => void;
  onReplaceBanner: (side: BannerSide, file: File) => void;
  onRemoveBanner: (side: BannerSide) => void;
  onBannerAltChange: (side: BannerSide, alt: string) => void;
  onReplaceOverviewBackgroundImage: (file: File) => void;
  onRemoveOverviewBackgroundImage: () => void;
  onOverviewBackgroundAltChange: (alt: string) => void;
  onOverviewCoverAltChange: (alt: string) => void;
  onAmenitiesStylesChange: (styles: Partial<OverviewStyles>) => void;
  onReplaceAmenitiesBackgroundImage: (file: File) => void;
  onRemoveAmenitiesBackgroundImage: () => void;
  onAmenitiesBackgroundAltChange: (alt: string) => void;
  onReplaceAmenityImage: (imageId: string, file: File) => void;
  onRemoveAmenityImage: (imageId: string) => void;
  onAmenityImageCaptionChange: (imageId: string, caption: string) => void;
  onCustomStylesChange: (styles: Partial<OverviewStyles>) => void;
  onReplaceCustomBackgroundImage: (file: File) => void;
  onRemoveCustomBackgroundImage: () => void;
  onCustomBackgroundAltChange: (alt: string) => void;
  onCustomCoverAltChange: (alt: string) => void;
  onContactTitleColorChange: (color: string) => void;
  onProductsTitleColorChange: (color: string) => void;
  onReplaceProductImage: (id: string, file: File) => void;
  onRemoveProductImage: (id: string) => void;
  onProductImageAltChange: (id: string, alt: string) => void;
  onReplaceFloorPlanImage: (tabId: string, blockId: string, file: File) => void;
  onRemoveFloorPlanImage: (blockId: string) => void;
  onFloorPlanImageAltChange: (blockId: string, alt: string) => void;
  onFormatText: (command: string, color?: string) => void;
  onOverviewStylesChange: (styles: Partial<OverviewStyles>) => void;
  onClose: () => void;
}
interface BannerEditorCardProps {
  label: string;
  side: BannerSide;
  image: HeroSlide | null;
  canEdit: boolean;
  onReplace: (side: BannerSide, file: File) => void;
  onRemove: (side: BannerSide) => void;
  onAltChange: (side: BannerSide, alt: string) => void;
}
export function CmsRightPanel({
  mode,
  selectedBlock,
  slides,
  leftBanner,
  rightBanner,
  overviewBackgroundImage,
  overviewCoverImage,
  overviewStyles,
  amenitiesStyles,
  amenitiesBackgroundImage,
  amenitiesBlock,
  customStyles,
  customBackgroundImage,
  customCoverImage,
  featuredProducts,
  floorPlanTabs,
  productsTitleColor,
  contactTitleColor,
  projectName,
  canEditHero,
  canEditBanners,
  canEditOverview,
  textColor,
  onRemoveSlide,
  onRequestUpload,
  onSlideAltChange,
  onReplaceBanner,
  onRemoveBanner,
  onBannerAltChange,
  onReplaceOverviewBackgroundImage,
  onRemoveOverviewBackgroundImage,
  onOverviewBackgroundAltChange,
  onOverviewCoverAltChange,
  onAmenitiesStylesChange,
  onReplaceAmenitiesBackgroundImage,
  onRemoveAmenitiesBackgroundImage,
  onAmenitiesBackgroundAltChange,
  onReplaceAmenityImage,
  onRemoveAmenityImage,
  onAmenityImageCaptionChange,
  onCustomStylesChange,
  onReplaceCustomBackgroundImage,
  onRemoveCustomBackgroundImage,
  onCustomBackgroundAltChange,
  onCustomCoverAltChange,
  onContactTitleColorChange,
  onProductsTitleColorChange,
  onReplaceProductImage,
  onRemoveProductImage,
  onProductImageAltChange,
  onReplaceFloorPlanImage,
  onRemoveFloorPlanImage,
  onFloorPlanImageAltChange,
  onFormatText,
  onOverviewStylesChange,
  onClose
}: CmsRightPanelProps) {
  const isHeroEditor = mode === 'document' && selectedBlock === 'hero';
  const isBannerEditor = mode === 'document' && selectedBlock === 'banners';
  const isOverviewEditor = mode === 'document' && selectedBlock === 'overview';
  const isOverviewCoverEditor =
  mode === 'document' && selectedBlock === 'overviewCover';
  const isAmenitiesEditor =
  mode === 'document' && selectedBlock === 'amenities';
  const isCustomEditor = mode === 'document' && selectedBlock === 'custom';
  const isCustomCoverEditor =
  mode === 'document' && selectedBlock === 'customCover';
  const isContactTitleEditor =
  mode === 'document' && selectedBlock === 'contactTitle';
  const isAmenityImageEditor =
  mode === 'document' && Boolean(selectedBlock?.startsWith('amenityImage-'));
  const isProductsTitleEditor =
  mode === 'document' && selectedBlock === 'productsTitle';
  const isProductImageEditor =
  mode === 'document' && Boolean(selectedBlock?.startsWith('productImage-'));
  const isFloorPlanImageEditor =
  mode === 'document' && Boolean(selectedBlock?.startsWith('floorPlanImage-'));
  const isTextEditor =
  mode === 'document' && (
  selectedBlock === 'description' ||
  selectedBlock === 'overviewContent' ||
  selectedBlock === 'featuredProductsDescription' ||
  selectedBlock === 'floorPlansDescription' ||
  selectedBlock === 'amenitiesDescription' ||
  selectedBlock === 'amenitiesParagraph' ||
  selectedBlock === 'customTitle' ||
  selectedBlock === 'customContent' ||
  selectedBlock === 'contactDescription' ||
  selectedBlock?.startsWith('featured-') ||
  selectedBlock?.startsWith('product-name-') ||
  selectedBlock?.startsWith('product-desc-') ||
  selectedBlock?.startsWith('floorPlanParagraph-'));
  if (
  !isHeroEditor &&
  !isBannerEditor &&
  !isOverviewEditor &&
  !isOverviewCoverEditor &&
  !isAmenitiesEditor &&
  !isCustomEditor &&
  !isCustomCoverEditor &&
  !isContactTitleEditor &&
  !isAmenityImageEditor &&
  !isProductsTitleEditor &&
  !isProductImageEditor &&
  !isFloorPlanImageEditor &&
  !isTextEditor)
  {
    return (
      <aside
        className="relative h-full overflow-y-auto border-l border-neutral-200 bg-white p-3"
        aria-label="Bảng điều khiển nội dung">
        
        <CloseButton onClose={onClose} />
        <p className="pr-8 text-xs leading-5 text-neutral-500">
          Chọn khối nội dung cần chỉnh sửa để xem các tùy chọn.
        </p>
      </aside>);

  }
  const panelTitle = isTextEditor ?
  'Chỉnh sửa đoạn văn' :
  isProductsTitleEditor ?
  'Chỉnh sửa tiêu đề section' :
  isContactTitleEditor ?
  'Chỉnh sửa tiêu đề section' :
  isAmenitiesEditor ?
  'Thiết lập Tiện ích' :
  isCustomEditor ?
  'Thiết lập section tùy chỉnh' :
  isCustomCoverEditor ?
  'Chỉnh sửa ảnh minh họa' :
  isAmenityImageEditor ?
  'Chỉnh sửa ảnh tiện ích' :
  isProductImageEditor ?
  'Chỉnh sửa ảnh sản phẩm' :
  isFloorPlanImageEditor ?
  'Chỉnh sửa ảnh mặt bằng' :
  isBannerEditor ?
  'Chỉnh sửa banner 2 bên' :
  isOverviewEditor ?
  'Thiết lập Tổng quan' :
  isOverviewCoverEditor ?
  'Chỉnh sửa ảnh minh họa' :
  'Chỉnh sửa hero banner';
  return (
    <aside
      className="h-full overflow-y-auto border-l border-neutral-200 bg-white p-3"
      aria-label={panelTitle}>
      
      <div className="flex items-start gap-2 border-b border-neutral-100 pb-3">
        {isTextEditor ?
        <FileTextIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#6D3A18]" /> :

        <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#6D3A18]" />
        }
        <h2 className="min-w-0 flex-1 break-words text-xs font-bold leading-5 text-neutral-900 sm:text-sm">
          {panelTitle}
        </h2>
        <CloseButton onClose={onClose} />
      </div>

      {isTextEditor ?
      <TextFormatPanel
        color={textColor}
        canEdit={canEditOverview}
        onFormat={onFormatText} /> :

      isProductsTitleEditor ?
      <div className="mt-4 space-y-4">
          <ColorField
          label="Màu chữ"
          value={productsTitleColor}
          disabled={!canEditOverview}
          onChange={onProductsTitleColorChange} />
        

          <p className="text-[11px] leading-4 text-neutral-500">
            Nội dung tiêu đề section là cố định, chỉ có thể thay đổi màu chữ.
          </p>
        </div> :
      isContactTitleEditor ?
      <div className="mt-4 space-y-4">
          <ColorField
          label="Màu chữ"
          value={contactTitleColor}
          disabled={!canEditOverview}
          onChange={onContactTitleColorChange} />
        
          <p className="text-[11px] leading-4 text-neutral-500">
            Nội dung tiêu đề section là cố định, chỉ có thể thay đổi màu chữ.
          </p>
        </div> :
      isAmenitiesEditor ?
      <OverviewSettings
        image={amenitiesBackgroundImage}
        styles={amenitiesStyles}
        canEdit={canEditOverview}
        onReplaceImage={onReplaceAmenitiesBackgroundImage}
        onRemoveImage={onRemoveAmenitiesBackgroundImage}
        onAltChange={onAmenitiesBackgroundAltChange}
        onStylesChange={onAmenitiesStylesChange} /> :

      isCustomEditor ?
      <OverviewSettings
        image={customBackgroundImage}
        styles={customStyles}
        canEdit={canEditOverview}
        onReplaceImage={onReplaceCustomBackgroundImage}
        onRemoveImage={onRemoveCustomBackgroundImage}
        onAltChange={onCustomBackgroundAltChange}
        onStylesChange={onCustomStylesChange} /> :

      isCustomCoverEditor ?
      <OverviewCoverAltPanel
        image={customCoverImage}
        canEdit={canEditOverview}
        onAltChange={onCustomCoverAltChange} /> :

      isAmenityImageEditor ?
      <AmenityImagePanel
        item={findAmenityImage(
          amenitiesBlock,
          String(selectedBlock).replace('amenityImage-', '')
        )}
        projectName={projectName}
        canEdit={canEditOverview}
        onReplace={onReplaceAmenityImage}
        onRemove={onRemoveAmenityImage}
        onCaptionChange={onAmenityImageCaptionChange} /> :

      isProductImageEditor ?
      <ProductImagePanel
        product={
        featuredProducts[
        Number(String(selectedBlock).replace('productImage-', ''))] ??
        null
        }
        canEdit={canEditOverview}
        onReplace={onReplaceProductImage}
        onRemove={onRemoveProductImage}
        onAltChange={onProductImageAltChange} /> :

      isFloorPlanImageEditor ?
      <FloorPlanImagePanel
        imageItem={findFloorPlanImage(
          floorPlanTabs,
          String(selectedBlock).replace('floorPlanImage-', '')
        )}
        canEdit={canEditOverview}
        onReplace={onReplaceFloorPlanImage}
        onRemove={onRemoveFloorPlanImage}
        onAltChange={onFloorPlanImageAltChange} /> :

      isBannerEditor ?
      <div className="mt-4 space-y-4">
          <BannerEditorCard
          label="Banner trái"
          side="left"
          image={leftBanner}
          canEdit={canEditBanners}
          onReplace={onReplaceBanner}
          onRemove={onRemoveBanner}
          onAltChange={onBannerAltChange} />
        

          <BannerEditorCard
          label="Banner phải"
          side="right"
          image={rightBanner}
          canEdit={canEditBanners}
          onReplace={onReplaceBanner}
          onRemove={onRemoveBanner}
          onAltChange={onBannerAltChange} />
        
        </div> :
      isOverviewEditor ?
      <OverviewSettings
        image={overviewBackgroundImage}
        styles={overviewStyles}
        canEdit={canEditOverview}
        onReplaceImage={onReplaceOverviewBackgroundImage}
        onRemoveImage={onRemoveOverviewBackgroundImage}
        onAltChange={onOverviewBackgroundAltChange}
        onStylesChange={onOverviewStylesChange} /> :

      isOverviewCoverEditor ?
      <OverviewCoverAltPanel
        image={overviewCoverImage}
        canEdit={canEditOverview}
        onAltChange={onOverviewCoverAltChange} /> :


      <HeroEditor
        slides={slides}
        canEdit={canEditHero}
        onRemoveSlide={onRemoveSlide}
        onRequestUpload={onRequestUpload}
        onAltChange={onSlideAltChange} />

      }
    </aside>);

}
function CloseButton({ onClose }: {onClose: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Đóng bảng điều khiển"
      className="grid h-7 w-7 shrink-0 place-items-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-orange-200">
      
      <XIcon className="h-4 w-4" />
    </button>);

}
function TextFormatPanel({
  color,
  canEdit,
  onFormat




}: {color: string;canEdit: boolean;onFormat: (command: string, color?: string) => void;}) {
  const controls = [
  {
    label: 'In đậm',
    command: 'bold',
    icon: BoldIcon
  },
  {
    label: 'In nghiêng',
    command: 'italic',
    icon: ItalicIcon
  },
  {
    label: 'Gạch chân',
    command: 'underline',
    icon: UnderlineIcon
  },
  {
    label: 'Căn trái',
    command: 'justifyLeft',
    icon: AlignLeftIcon
  },
  {
    label: 'Căn giữa',
    command: 'justifyCenter',
    icon: AlignCenterIcon
  },
  {
    label: 'Căn phải',
    command: 'justifyRight',
    icon: AlignRightIcon
  },
  {
    label: 'Căn đều',
    command: 'justifyFull',
    icon: AlignJustifyIcon
  },
  {
    label: 'Danh sách không thứ tự',
    command: 'insertUnorderedList',
    icon: ListIcon
  },
  {
    label: 'Danh sách có thứ tự',
    command: 'insertOrderedList',
    icon: ListOrderedIcon
  },
  {
    label: 'Chỉ số dưới',
    command: 'subscript',
    icon: SubscriptIcon
  },
  {
    label: 'Chỉ số trên',
    command: 'superscript',
    icon: SuperscriptIcon
  }];

  return (
    <div className="mt-4 space-y-5">
      <ColorField
        label="Màu chữ"
        value={color}
        disabled={!canEdit}
        onChange={(nextColor) => onFormat('foreColor', nextColor)} />
      

      <div>
        <p className="text-xs font-semibold text-neutral-700">Định dạng</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {controls.map(({ label, command, icon: Icon }) =>
          <button
            key={command}
            type="button"
            disabled={!canEdit}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onFormat(command)}
            title={label}
            aria-label={label}
            className="grid h-8 w-8 place-items-center rounded border border-neutral-200 text-neutral-700 hover:bg-orange-50 hover:text-[#6D3A18] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-200">
            
              <Icon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>);

}
function OverviewSettings({
  image,
  styles,
  canEdit,
  onReplaceImage,
  onRemoveImage,
  onAltChange,
  onStylesChange








}: {image: HeroSlide | null;styles: OverviewStyles;canEdit: boolean;onReplaceImage: (file: File) => void;onRemoveImage: () => void;onAltChange: (alt: string) => void;onStylesChange: (styles: Partial<OverviewStyles>) => void;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mt-4 space-y-5">
      <ColorField
        label="Màu nền"
        value={styles.backgroundColor}
        disabled={!canEdit}
        onChange={(backgroundColor) =>
        onStylesChange({
          backgroundColor
        })
        } />
      

      <label className="block text-xs font-semibold leading-5 text-neutral-700">
        Độ trong suốt: {styles.backgroundOpacity}%
        <input
          type="range"
          min="0"
          max="100"
          value={styles.backgroundOpacity}
          disabled={!canEdit}
          onChange={(event) =>
          onStylesChange({
            backgroundOpacity: Number(event.target.value)
          })
          }
          className="mt-2 w-full accent-[#f5881f] disabled:cursor-not-allowed" />
        
      </label>
      <ColorField
        label="Màu tiêu đề"
        value={styles.headingColor}
        disabled={!canEdit}
        onChange={(headingColor) =>
        onStylesChange({
          headingColor
        })
        } />
      

      <section
        className="border-t border-neutral-100 pt-4"
        aria-label="Ảnh nền tổng quan">
        
        <p className="text-xs font-semibold text-neutral-700">Ảnh nền</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onReplaceImage(file);
            event.target.value = '';
          }} />
        

        {image ?
        <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-2">
            <img
            src={image.url}
            alt={image.alt || 'Ảnh nền Tổng quan'}
            className="aspect-video w-full rounded object-cover" />
          

            <ImageAltField
            value={image.alt ?? ''}
            disabled={!canEdit}
            onChange={onAltChange} />
          

            {canEdit &&
          <div className="mt-2 flex flex-wrap gap-1.5">
                <IconButton
              label="Thay ảnh nền"
              onClick={() => inputRef.current?.click()}>
              
                  <PencilIcon className="h-4 w-4" />
                </IconButton>
                <IconButton
              label="Xóa ảnh nền"
              tone="danger"
              onClick={onRemoveImage}>
              
                  <Trash2Icon className="h-4 w-4" />
                </IconButton>
              </div>
          }
          </div> :

        <button
          type="button"
          disabled={!canEdit}
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex w-full flex-col items-center rounded-md border border-dashed border-[#6D3A18] px-3 py-4 text-center text-[#6D3A18] hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-200">
          
            <PlusIcon className="h-5 w-5" />
            <span className="mt-1 text-xs font-semibold">Tải ảnh nền</span>
            <span className="mt-1 text-[11px] leading-4 text-neutral-500">
              JPEG, JPG, PNG · tối đa 50MB
            </span>
          </button>
        }
      </section>
    </div>);

}
function OverviewCoverAltPanel({
  image,
  canEdit,
  onAltChange




}: {image: HeroSlide | null;canEdit: boolean;onAltChange: (alt: string) => void;}) {
  if (!image) {
    return (
      <p className="mt-4 text-xs leading-5 text-neutral-500">
        Tải ảnh minh họa để thêm mô tả thay thế.
      </p>);

  }
  return (
    <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-2">
      <img
        src={image.url}
        alt={image.alt || 'Ảnh minh họa tổng quan'}
        className="aspect-video w-full rounded object-cover" />
      

      <ImageAltField
        value={image.alt ?? ''}
        disabled={!canEdit}
        onChange={onAltChange} />
      
    </div>);

}
function findAmenityImage(
block: AmenitiesBlock | null,
imageId: string)
: AmenityImage | null {
  if (!block || block.type === 'paragraph') return null;
  return block.images.find((item) => item.id === imageId) ?? null;
}
function AmenityImagePanel({
  item,
  projectName,
  canEdit,
  onReplace,
  onRemove,
  onCaptionChange






}: {item: AmenityImage | null;projectName: string;canEdit: boolean;onReplace: (imageId: string, file: File) => void;onRemove: (imageId: string) => void;onCaptionChange: (imageId: string, caption: string) => void;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  if (!item) {
    return (
      <p className="mt-4 text-xs leading-5 text-neutral-500">
        Không tìm thấy hình ảnh. Vui lòng chọn lại ảnh cần chỉnh sửa.
      </p>);

  }
  const altPreview = [item.caption.trim(), projectName.trim()].
  filter(Boolean).
  join(' - ');
  return (
    <div className="mt-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onReplace(item.id, file);
          event.target.value = '';
        }} />
      
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
        <img
          src={item.image.url}
          alt={item.image.alt || altPreview || 'Ảnh tiện ích'}
          className="aspect-video w-full rounded object-cover" />
        
        <label className="mt-2 block text-xs font-semibold leading-5 text-neutral-700">
          Mô tả ảnh
          <textarea
            value={item.caption}
            disabled={!canEdit}
            rows={3}
            placeholder="Nhập mô tả cho ảnh"
            onChange={(event) => onCaptionChange(item.id, event.target.value)}
            className="mt-1 w-full resize-none rounded-md border border-neutral-200 px-2.5 py-2 text-xs font-normal leading-5 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#f5881f] disabled:cursor-not-allowed disabled:bg-neutral-100" />
          
        </label>
        <p className="mt-1.5 text-[11px] leading-4 text-neutral-500">
          Thẻ alt của ảnh: {altPreview || 'Tiện ích dự án'}
        </p>
        {canEdit &&
        <div className="mt-2 flex flex-wrap gap-1.5">
            <IconButton
            label="Thay ảnh tiện ích"
            onClick={() => inputRef.current?.click()}>
            
              <PencilIcon className="h-4 w-4" />
            </IconButton>
            <IconButton
            label="Xóa ảnh tiện ích"
            tone="danger"
            onClick={() => onRemove(item.id)}>
            
              <Trash2Icon className="h-4 w-4" />
            </IconButton>
          </div>
        }
      </div>
    </div>);

}
function ProductImagePanel({
  product,
  canEdit,
  onReplace,
  onRemove,
  onAltChange






}: {product: FeaturedProduct | null;canEdit: boolean;onReplace: (id: string, file: File) => void;onRemove: (id: string) => void;onAltChange: (id: string, alt: string) => void;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  if (!product) {
    return (
      <p className="mt-4 text-xs leading-5 text-neutral-500">
        Không tìm thấy sản phẩm. Vui lòng chọn lại ảnh cần chỉnh sửa.
      </p>);

  }
  return (
    <div className="mt-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onReplace(product.id, file);
          event.target.value = '';
        }} />
      

      {product.image ?
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2">
          <img
          src={product.image.url}
          alt={product.image.alt || 'Ảnh sản phẩm'}
          className="aspect-[368/256] w-full rounded object-cover" />
        

          <ImageAltField
          value={product.image.alt ?? ''}
          disabled={!canEdit}
          onChange={(alt) => onAltChange(product.id, alt)} />
        

          {canEdit &&
        <div className="mt-2 flex flex-wrap gap-1.5">
              <IconButton
            label="Thay ảnh sản phẩm"
            onClick={() => inputRef.current?.click()}>
            
                <PencilIcon className="h-4 w-4" />
              </IconButton>
              <IconButton
            label="Xóa ảnh sản phẩm"
            tone="danger"
            onClick={() => onRemove(product.id)}>
            
                <Trash2Icon className="h-4 w-4" />
              </IconButton>
            </div>
        }
        </div> :

      <button
        type="button"
        disabled={!canEdit}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center rounded-md border border-dashed border-[#6D3A18] px-3 py-4 text-center text-[#6D3A18] hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-200">
        
          <PlusIcon className="h-5 w-5" />
          <span className="mt-1 text-xs font-semibold">Tải ảnh sản phẩm</span>
          <span className="mt-1 text-[11px] leading-4 text-neutral-500">
            JPEG, JPG, PNG · khuyến nghị 368 × 256px
          </span>
        </button>
      }
    </div>);

}
interface FloorPlanImageItem {
  tabId: string;
  label: string;
  block: FloorPlanImageBlock;
}
function findFloorPlanImage(
tabs: FloorPlanTab[],
blockId: string)
: FloorPlanImageItem | null {
  for (const tab of tabs) {
    const block = tab.blocks.find(
      (item): item is FloorPlanImageBlock =>
      item.id === blockId && item.type === 'image'
    );
    if (block)
    return {
      tabId: tab.id,
      label: tab.label,
      block
    };
  }
  return null;
}
function FloorPlanImagePanel({
  imageItem,
  canEdit,
  onReplace,
  onRemove,
  onAltChange






}: {imageItem: FloorPlanImageItem | null;canEdit: boolean;onReplace: (tabId: string, blockId: string, file: File) => void;onRemove: (blockId: string) => void;onAltChange: (blockId: string, alt: string) => void;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  if (!imageItem) {
    return (
      <p className="mt-4 text-xs leading-5 text-neutral-500">
        Chọn ảnh mặt bằng để chỉnh sửa.
      </p>);

  }
  const { tabId, label, block } = imageItem;
  return (
    <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onReplace(tabId, block.id, file);
          event.target.value = '';
        }} />
      

      <img
        src={block.image.url}
        alt={block.image.alt || label || 'Ảnh mặt bằng'}
        className="aspect-video w-full rounded object-cover" />
      

      <ImageAltField
        value={block.image.alt ?? ''}
        disabled={!canEdit}
        onChange={(alt) => onAltChange(block.id, alt)} />
      

      {canEdit &&
      <div className="mt-2 flex flex-wrap gap-1.5">
          <IconButton
          label="Thay ảnh mặt bằng"
          onClick={() => inputRef.current?.click()}>
          
            <PencilIcon className="h-4 w-4" />
          </IconButton>
          <IconButton
          label="Xóa ảnh mặt bằng"
          tone="danger"
          onClick={() => onRemove(block.id)}>
          
            <Trash2Icon className="h-4 w-4" />
          </IconButton>
        </div>
      }
    </div>);

}
function HeroEditor({
  slides,
  canEdit,
  onRemoveSlide,
  onRequestUpload,
  onAltChange






}: {slides: HeroSlide[];canEdit: boolean;onRemoveSlide: (id: string) => void;onRequestUpload: () => void;onAltChange: (id: string, alt: string) => void;}) {
  return (
    <div className="mt-4">
      <p className="text-xs leading-5 text-neutral-500">
        Slider hình ảnh giới thiệu dự án
      </p>
      <div className="mt-4 space-y-3">
        {slides.map((slide, index) =>
        <div
          key={slide.id}
          className="rounded-md border border-neutral-200 p-2">
          
            <img
            src={slide.url}
            alt={slide.alt || `Slide ${index + 1}`}
            className="h-20 w-full rounded object-cover" />
          

            <ImageAltField
            value={slide.alt ?? ''}
            disabled={!canEdit}
            onChange={(alt) => onAltChange(slide.id, alt)} />
          

            <div className="mt-2 flex items-center gap-2">
              <span className="min-w-0 flex-1 break-all text-[11px] text-neutral-600">
                {slide.name}
              </span>
              {canEdit ?
            <IconButton
              label={`Xóa ${slide.name}`}
              tone="danger"
              onClick={() => onRemoveSlide(slide.id)}>
              
                  <Trash2Icon className="h-4 w-4" />
                </IconButton> :

            <EyeIcon
              className="h-4 w-4 text-neutral-400"
              aria-label="Chỉ xem" />

            }
            </div>
          </div>
        )}
      </div>
      {canEdit ?
      <button
        type="button"
        onClick={onRequestUpload}
        className="mt-4 grid h-9 w-full place-items-center rounded-md border border-dashed border-[#6D3A18] text-[#6D3A18] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
        aria-label="Tải thêm slide">
        
          <PlusIcon className="h-5 w-5" />
        </button> :

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
          <EyeIcon className="h-3.5 w-3.5" />
          Chỉ xem
        </p>
      }
    </div>);

}
function BannerEditorCard({
  label,
  side,
  image,
  canEdit,
  onReplace,
  onRemove,
  onAltChange
}: BannerEditorCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <section aria-label={label}>
      <h3 className="text-xs font-bold text-neutral-800">{label}</h3>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onReplace(side, file);
          event.target.value = '';
        }} />
      

      {image ?
      <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-2">
          <img
          src={image.url}
          alt={image.alt || label}
          className="aspect-[1/2] w-full rounded object-cover" />
        

          <ImageAltField
          value={image.alt ?? ''}
          disabled={!canEdit}
          onChange={(alt) => onAltChange(side, alt)} />
        

          {canEdit ?
        <div className="mt-2 flex flex-wrap gap-1.5">
              <IconButton
            label={`Thay ảnh ${label}`}
            onClick={() => inputRef.current?.click()}>
            
                <PencilIcon className="h-4 w-4" />
              </IconButton>
              <IconButton
            label={`Xóa ảnh ${label}`}
            tone="danger"
            onClick={() => onRemove(side)}>
            
                <Trash2Icon className="h-4 w-4" />
              </IconButton>
            </div> :

        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
              <EyeIcon className="h-3.5 w-3.5" />
              Chỉ xem
            </p>
        }
        </div> :

      <button
        type="button"
        disabled={!canEdit}
        onClick={() => inputRef.current?.click()}
        className="mt-2 grid min-h-20 w-full place-items-center rounded-md border border-dashed border-[#6D3A18] text-[#6D3A18] hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
        aria-label={`Tải ảnh ${label}`}>
        
          {canEdit ?
        <PlusIcon className="h-5 w-5" /> :

        <EyeIcon className="h-5 w-5" />
        }
        </button>
      }
    </section>);

}
function ImageAltField({
  value,
  disabled,
  onChange




}: {value: string;disabled: boolean;onChange: (value: string) => void;}) {
  return (
    <label className="mt-2 block text-[11px] font-semibold text-neutral-600">
      Thẻ alt
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder="Nhập mô tả cho ảnh"
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-xs font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-neutral-100" />
      
    </label>);

}
function IconButton({
  label,
  tone = 'default',
  onClick,
  children





}: {label: string;tone?: 'default' | 'danger';onClick: () => void;children: React.ReactNode;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid h-8 w-8 place-items-center rounded border border-neutral-200 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 ${tone === 'danger' ? 'text-red-600 focus:ring-red-100' : 'text-[#6D3A18] focus:ring-orange-200'}`}>
      
      {children}
    </button>);

}
function ColorField({
  label,
  value,
  disabled,
  onChange





}: {label: string;value: string;disabled: boolean;onChange: (value: string) => void;}) {
  const [draftValue, setDraftValue] = useState(value);
  useEffect(() => setDraftValue(value), [value]);
  return (
    <label className="block text-xs font-semibold leading-5 text-neutral-700">
      {label}
      <span className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border border-neutral-300 bg-white p-0.5 disabled:cursor-not-allowed"
          aria-label={`${label} bằng bộ chọn màu`} />
        

        <input
          type="text"
          value={draftValue}
          disabled={disabled}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);
            if (/^#[0-9a-fA-F]{6}$/.test(nextValue)) onChange(nextValue);
          }}
          onBlur={() => setDraftValue(value)}
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-2 py-1.5 font-mono text-xs uppercase outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-neutral-100"
          aria-label={`${label} mã hex`} />
        
      </span>
    </label>);

}