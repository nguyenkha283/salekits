import React, { useEffect, useState, useRef } from 'react';
import { ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { CmsHeader, CmsRightPanelMode } from '../components/CmsHeader';
import { CmsRightPanel } from '../components/CmsRightPanel';
import {
  createProjectConfiguration,
  ProjectConfigurationDialog } from
'../components/ProjectConfigurationDialog';
import { ProjectContentEditor } from '../components/ProjectContentEditor';
import {
  AmenitiesBlock,
  AmenitiesCarouselType,
  AmenityImage,
  CmsProjectContent,
  CmsRole,
  CmsTextEditorId,
  FeaturedItem,
  FeaturedProduct,
  FloorPlanTab,
  HeroSlide,
  OverviewStyles,
  ProjectPreviewSnapshot,
  PROJECT_PREVIEW_STORAGE_KEY,
  SelectedEditorBlock } from
'../types/cms';
import { ProjectDraft } from '../types/project';
interface ProjectEditorLocationState {
  project?: ProjectDraft;
}
const FALLBACK_PROJECT: ProjectDraft = {
  hierarchy: '',
  name: '',
  propertyType: '',
  province: '',
  district: '',
  status: ''
};
const DEFAULT_OVERVIEW_STYLES: OverviewStyles = {
  backgroundColor: '#f5881f',
  backgroundOpacity: 20,
  headingColor: '#333333',
  contentColor: '#424843'
};
function createEmptyFeaturedItems(): FeaturedItem[] {
  return Array.from(
    {
      length: 3
    },
    () => ({
      metric: '',
      value: ''
    })
  );
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
function createEmptyFloorPlanTab(index = 1): FloorPlanTab {
  return {
    id: crypto.randomUUID(),
    label: `Mặt bằng ${index}`,
    blocks: []
  };
}
function createInitialContent(project: ProjectDraft): CmsProjectContent {
  return {
    hierarchy: project.hierarchy || 'Dự án',
    projectName: '',
    description: '',
    overviewContent: '',
    featuredItems: createEmptyFeaturedItems(),
    featuredProductsDescription: '',
    featuredProducts: [createEmptyProduct()],
    floorPlansDescription: '',
    floorPlanTabs: [createEmptyFloorPlanTab()],
    amenitiesDescription: '',
    amenitiesBlock: null,
    customTitle: '',
    customContent: '',
    contactDescription: ''
  };
}
export function ProjectCreatedPage() {
  const location = useLocation();
  const project =
  (location.state as ProjectEditorLocationState | null)?.project ??
  FALLBACK_PROJECT;
  const [role, setRole] = useState<CmsRole>('APM');
  const [rightPanelMode, setRightPanelMode] = useState<CmsRightPanelMode>(null);
  const [configurationOpen, setConfigurationOpen] = useState(false);
  const [projectConfiguration, setProjectConfiguration] = useState(() =>
  createProjectConfiguration(project)
  );
  const [selectedBlock, setSelectedBlock] = useState<SelectedEditorBlock>(null);
  const [content, setContent] = useState<CmsProjectContent>(() =>
  createInitialContent(project)
  );
  const [activeMenu, setActiveMenu] = useState('Tổng quan');
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [leftBanner, setLeftBanner] = useState<HeroSlide | null>(null);
  const [rightBanner, setRightBanner] = useState<HeroSlide | null>(null);
  const [overviewBackgroundImage, setOverviewBackgroundImage] =
  useState<HeroSlide | null>(null);
  const [overviewCoverImage, setOverviewCoverImage] =
  useState<HeroSlide | null>(null);
  const [overviewStyles, setOverviewStyles] = useState<OverviewStyles>(
    DEFAULT_OVERVIEW_STYLES
  );
  const [amenitiesStyles, setAmenitiesStyles] = useState<OverviewStyles>(
    DEFAULT_OVERVIEW_STYLES
  );
  const [amenitiesBackgroundImage, setAmenitiesBackgroundImage] =
  useState<HeroSlide | null>(null);
  const [customStyles, setCustomStyles] = useState<OverviewStyles>(
    DEFAULT_OVERVIEW_STYLES
  );
  const [customBackgroundImage, setCustomBackgroundImage] =
  useState<HeroSlide | null>(null);
  const [customCoverImage, setCustomCoverImage] = useState<HeroSlide | null>(
    null
  );
  const hotlineDutyPhone =
  projectConfiguration.teamMembers.find(
    (member) => member.isHotlineOnDuty && member.phoneNumber.trim()
  )?.phoneNumber ?? '';
  const [activeSlide, setActiveSlide] = useState(0);
  const [textSelection, setTextSelection] = useState<Range | null>(null);
  const [notice, setNotice] = useState('');
  const [uploadError, setUploadError] = useState('');
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<{
    slides: HeroSlide[];
    leftBanner: HeroSlide | null;
    rightBanner: HeroSlide | null;
    overviewBackgroundImage: HeroSlide | null;
    overviewCoverImage: HeroSlide | null;
    amenitiesBackgroundImage: HeroSlide | null;
    customBackgroundImage: HeroSlide | null;
    customCoverImage: HeroSlide | null;
    productImages: HeroSlide[];
    floorPlanImages: HeroSlide[];
    amenityImages: HeroSlide[];
  }>({
    slides: [],
    leftBanner: null,
    rightBanner: null,
    overviewBackgroundImage: null,
    overviewCoverImage: null,
    amenitiesBackgroundImage: null,
    customBackgroundImage: null,
    customCoverImage: null,
    productImages: [],
    floorPlanImages: [],
    amenityImages: []
  });
  useEffect(() => {
    mediaRef.current = {
      slides,
      leftBanner,
      rightBanner,
      overviewBackgroundImage,
      overviewCoverImage,
      amenitiesBackgroundImage,
      customBackgroundImage,
      customCoverImage,
      productImages: content.featuredProducts.flatMap((product) =>
      product.image ? [product.image] : []
      ),
      floorPlanImages: content.floorPlanTabs.flatMap((tab) =>
      tab.blocks.flatMap((block) =>
      block.type === 'image' ? [block.image] : []
      )
      ),
      amenityImages:
      content.amenitiesBlock && content.amenitiesBlock.type !== 'paragraph' ?
      content.amenitiesBlock.images.map((item) => item.image) :
      []
    };
  }, [
  slides,
  leftBanner,
  rightBanner,
  overviewBackgroundImage,
  overviewCoverImage,
  amenitiesBackgroundImage,
  customBackgroundImage,
  customCoverImage,
  content.featuredProducts,
  content.floorPlanTabs,
  content.amenitiesBlock]
  );
  useEffect(
    () => () => {
      mediaRef.current.slides.forEach((slide) => URL.revokeObjectURL(slide.url));
      if (mediaRef.current.leftBanner)
      URL.revokeObjectURL(mediaRef.current.leftBanner.url);
      if (mediaRef.current.rightBanner)
      URL.revokeObjectURL(mediaRef.current.rightBanner.url);
      if (mediaRef.current.overviewBackgroundImage)
      URL.revokeObjectURL(mediaRef.current.overviewBackgroundImage.url);
      if (mediaRef.current.overviewCoverImage)
      URL.revokeObjectURL(mediaRef.current.overviewCoverImage.url);
      if (mediaRef.current.amenitiesBackgroundImage)
      URL.revokeObjectURL(mediaRef.current.amenitiesBackgroundImage.url);
      if (mediaRef.current.customBackgroundImage)
      URL.revokeObjectURL(mediaRef.current.customBackgroundImage.url);
      if (mediaRef.current.customCoverImage)
      URL.revokeObjectURL(mediaRef.current.customCoverImage.url);
      mediaRef.current.productImages.forEach((image) =>
      URL.revokeObjectURL(image.url)
      );
      mediaRef.current.floorPlanImages.forEach((image) =>
      URL.revokeObjectURL(image.url)
      );
      mediaRef.current.amenityImages.forEach((image) =>
      URL.revokeObjectURL(image.url)
      );
    },
    []
  );
  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  }
  function requestUpload() {
    uploadInputRef.current?.click();
  }
  function isValidImage(file: File) {
    return (
      ['image/jpeg', 'image/png'].includes(file.type) &&
      file.size <= 50 * 1024 * 1024);

  }
  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const invalidFile = files.find((file) => !isValidImage(file));
    if (invalidFile) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      event.target.value = '';
      return;
    }
    setSlides((current) => [...current, ...files.map(createMedia)]);
    setUploadError('');
    selectHero();
    event.target.value = '';
  }
  function removeSlide(id: string) {
    setSlides((current) => {
      const slide = current.find((item) => item.id === id);
      if (slide) URL.revokeObjectURL(slide.url);
      return current.filter((item) => item.id !== id);
    });
    setActiveSlide((current) =>
    Math.max(0, Math.min(current, slides.length - 2))
    );
  }
  function selectHero() {
    setSelectedBlock('hero');
    setRightPanelMode('document');
  }
  function selectBanners() {
    setSelectedBlock('banners');
    setRightPanelMode('document');
  }
  function selectOverview() {
    setSelectedBlock('overview');
    setRightPanelMode('document');
  }
  function selectTextEditor(editorId: CmsTextEditorId) {
    const selection = window.getSelection();
    setTextSelection(
      selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null
    );
    setSelectedBlock(editorId);
    setRightPanelMode('document');
  }
  function selectOverviewCover() {
    setSelectedBlock('overviewCover');
    setRightPanelMode('document');
  }
  function selectProductsTitle() {
    setSelectedBlock('productsTitle');
    setRightPanelMode('document');
  }
  function selectProductImage(index: number) {
    setSelectedBlock(`productImage-${index}`);
    setRightPanelMode('document');
  }
  function selectFloorPlanImage(blockId: string) {
    setSelectedBlock(`floorPlanImage-${blockId}`);
    setRightPanelMode('document');
  }
  function selectAmenities() {
    setSelectedBlock('amenities');
    setRightPanelMode('document');
  }
  function selectAmenityImage(imageId: string) {
    setSelectedBlock(`amenityImage-${imageId}`);
    setRightPanelMode('document');
  }
  function selectCustom() {
    setSelectedBlock('custom');
    setRightPanelMode('document');
  }
  function selectCustomCover() {
    setSelectedBlock('customCover');
    setRightPanelMode('document');
  }
  function selectContactTitle() {
    setSelectedBlock('contactTitle');
    setRightPanelMode('document');
  }
  function restoreTextSelection() {
    if (!textSelection) return false;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(textSelection);
    return true;
  }
  function formatSelectedText(command: string, color?: string) {
    if (!restoreTextSelection()) return;
    const selection = window.getSelection();
    if (command === 'foreColor' && selection?.isCollapsed) return;
    document.execCommand(command, false, color);
    const editor = document.querySelector<HTMLElement>(
      `[data-text-editor-id="${selectedBlock}"]`
    );
    if (editor)
    editor.dispatchEvent(
      new Event('input', {
        bubbles: true
      })
    );
  }
  function getSelectedTextColor(): string {
    if (selectedBlock === 'description')
    return content.descriptionColor ?? '#404040';
    if (selectedBlock === 'overviewContent') return overviewStyles.contentColor;
    if (selectedBlock === 'featuredProductsDescription')
    return content.featuredProductsDescriptionColor ?? '#424843';
    if (selectedBlock === 'floorPlansDescription')
    return content.floorPlansDescriptionColor ?? '#424843';
    if (selectedBlock === 'amenitiesDescription')
    return content.amenitiesDescriptionColor ?? '#424843';
    if (selectedBlock === 'amenitiesParagraph')
    return content.amenitiesBlock?.type === 'paragraph' ?
    content.amenitiesBlock.paragraphColor ?? '#424843' :
    '#424843';
    if (selectedBlock === 'customTitle') return customStyles.headingColor;
    if (selectedBlock === 'customContent') return customStyles.contentColor;
    if (selectedBlock === 'contactDescription')
    return content.contactDescriptionColor ?? '#424843';
    if (selectedBlock?.startsWith('floorPlanParagraph-')) {
      const blockId = selectedBlock.replace('floorPlanParagraph-', '');
      const block = content.floorPlanTabs.
      flatMap((tab) => tab.blocks).
      find((item) => item.id === blockId);
      return block?.type === 'paragraph' ?
      block.paragraphColor ?? '#424843' :
      '#424843';
    }
    if (selectedBlock?.startsWith('product-name-')) {
      const index = Number(selectedBlock.replace('product-name-', ''));
      return content.featuredProducts[index]?.nameColor ?? '#6D3A18';
    }
    if (selectedBlock?.startsWith('product-desc-')) {
      const index = Number(selectedBlock.replace('product-desc-', ''));
      return content.featuredProducts[index]?.descriptionColor ?? '#424843';
    }
    if (selectedBlock?.startsWith('featured-')) {
      const index = Number(selectedBlock.replace('featured-', ''));
      return content.featuredItems[index]?.valueColor ?? '#6D3A18';
    }
    return '#404040';
  }
  function createMedia(file: File): HeroSlide {
    return {
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      alt: ''
    };
  }
  function replaceBanner(side: 'left' | 'right', file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextBanner = createMedia(file);
    const updateBanner = side === 'left' ? setLeftBanner : setRightBanner;
    updateBanner((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return nextBanner;
    });
    setUploadError('');
  }
  function removeBanner(side: 'left' | 'right') {
    const updateBanner = side === 'left' ? setLeftBanner : setRightBanner;
    updateBanner((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }
  function replaceOverviewBackgroundImage(file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImage = createMedia(file);
    setOverviewBackgroundImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return nextImage;
    });
    setUploadError('');
  }
  function removeOverviewBackgroundImage() {
    setOverviewBackgroundImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }
  function replaceOverviewCoverImage(file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImage = createMedia(file);
    setOverviewCoverImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return nextImage;
    });
    setUploadError('');
  }
  function removeOverviewCoverImage() {
    setOverviewCoverImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }
  function updateProducts(
  updater: (products: FeaturedProduct[]) => FeaturedProduct[])
  {
    setContent((current) => ({
      ...current,
      featuredProducts: updater(current.featuredProducts)
    }));
  }
  function replaceProductImage(id: string, file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImage = createMedia(file);
    updateProducts((products) =>
    products.map((product) => {
      if (product.id !== id) return product;
      if (product.image) URL.revokeObjectURL(product.image.url);
      return {
        ...product,
        image: nextImage
      };
    })
    );
    setUploadError('');
  }
  function removeProductImage(id: string) {
    updateProducts((products) =>
    products.map((product) => {
      if (product.id !== id) return product;
      if (product.image) URL.revokeObjectURL(product.image.url);
      return {
        ...product,
        image: null
      };
    })
    );
  }
  function removeProduct(id: string) {
    updateProducts((products) =>
    products.filter((product) => {
      if (product.id !== id) return true;
      if (product.image) URL.revokeObjectURL(product.image.url);
      return false;
    })
    );
    setSelectedBlock((current) =>
    current?.startsWith('productImage-') ? null : current
    );
  }
  function updateProductImageAlt(id: string, alt: string) {
    updateProducts((products) =>
    products.map((product) =>
    product.id === id && product.image ?
    {
      ...product,
      image: {
        ...product.image,
        alt
      }
    } :
    product
    )
    );
  }
  function updateProductsTitleColor(color: string) {
    setContent((current) => ({
      ...current,
      featuredProductsTitleColor: color
    }));
  }
  function updateContactTitleColor(color: string) {
    setContent((current) => ({
      ...current,
      contactTitleColor: color
    }));
  }
  function addAmenityImages(type: AmenitiesCarouselType, files: File[]) {
    const invalidFile = files.find((file) => !isValidImage(file));
    if (invalidFile) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImages: AmenityImage[] = files.map((file) => ({
      id: crypto.randomUUID(),
      image: createMedia(file),
      caption: ''
    }));
    setContent((current) => {
      const block = current.amenitiesBlock;
      if (block && block.type === type) {
        return {
          ...current,
          amenitiesBlock: {
            ...block,
            images: [...block.images, ...nextImages]
          }
        };
      }
      if (block && block.type !== 'paragraph') {
        block.images.forEach((item) => URL.revokeObjectURL(item.image.url));
      }
      return {
        ...current,
        amenitiesBlock: {
          id: crypto.randomUUID(),
          type,
          images: nextImages
        }
      };
    });
    setUploadError('');
  }
  function replaceAmenityImage(imageId: string, file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImage = createMedia(file);
    setContent((current) => {
      const block = current.amenitiesBlock;
      if (!block || block.type === 'paragraph') return current;
      return {
        ...current,
        amenitiesBlock: {
          ...block,
          images: block.images.map((item) => {
            if (item.id !== imageId) return item;
            URL.revokeObjectURL(item.image.url);
            return {
              ...item,
              image: nextImage
            };
          })
        }
      };
    });
    setUploadError('');
  }
  function removeAmenityImage(imageId: string) {
    setContent((current) => {
      const block = current.amenitiesBlock;
      if (!block || block.type === 'paragraph') return current;
      return {
        ...current,
        amenitiesBlock: {
          ...block,
          images: block.images.filter((item) => {
            if (item.id !== imageId) return true;
            URL.revokeObjectURL(item.image.url);
            return false;
          })
        }
      };
    });
    setSelectedBlock((current) =>
    current === `amenityImage-${imageId}` ? null : current
    );
  }
  function updateAmenityImageCaption(imageId: string, caption: string) {
    setContent((current) => {
      const block = current.amenitiesBlock;
      if (!block || block.type === 'paragraph') return current;
      return {
        ...current,
        amenitiesBlock: {
          ...block,
          images: block.images.map((item) =>
          item.id === imageId ?
          {
            ...item,
            caption
          } :
          item
          )
        }
      };
    });
  }
  function clearAmenitiesBlock() {
    setContent((current) => {
      const block = current.amenitiesBlock;
      if (block && block.type !== 'paragraph') {
        block.images.forEach((item) => URL.revokeObjectURL(item.image.url));
      }
      return {
        ...current,
        amenitiesBlock: null
      };
    });
    setSelectedBlock((current) =>
    current === 'amenitiesParagraph' ||
    current?.startsWith('amenityImage-') ?
    null :
    current
    );
  }
  function replaceAmenitiesBackgroundImage(file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImage = createMedia(file);
    setAmenitiesBackgroundImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return nextImage;
    });
    setUploadError('');
  }
  function removeAmenitiesBackgroundImage() {
    setAmenitiesBackgroundImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }
  function updateAmenitiesBackgroundAlt(alt: string) {
    setAmenitiesBackgroundImage((current) =>
    current ?
    {
      ...current,
      alt
    } :
    current
    );
  }
  function replaceCustomBackgroundImage(file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImage = createMedia(file);
    setCustomBackgroundImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return nextImage;
    });
    setUploadError('');
  }
  function removeCustomBackgroundImage() {
    setCustomBackgroundImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }
  function updateCustomBackgroundAlt(alt: string) {
    setCustomBackgroundImage((current) =>
    current ?
    {
      ...current,
      alt
    } :
    current
    );
  }
  function replaceCustomCoverImage(file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImage = createMedia(file);
    setCustomCoverImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return nextImage;
    });
    setUploadError('');
  }
  function removeCustomCoverImage() {
    setCustomCoverImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }
  function updateCustomCoverAlt(alt: string) {
    setCustomCoverImage((current) =>
    current ?
    {
      ...current,
      alt
    } :
    current
    );
  }
  function updateFloorPlanTabs(
  updater: (tabs: FloorPlanTab[]) => FloorPlanTab[])
  {
    setContent((current) => ({
      ...current,
      floorPlanTabs: updater(current.floorPlanTabs)
    }));
  }
  function replaceFloorPlanImage(tabId: string, blockId: string, file: File) {
    if (!isValidImage(file)) {
      setUploadError('Chỉ hỗ trợ ảnh JPEG, JPG hoặc PNG dưới 50MB.');
      return;
    }
    const nextImage = createMedia(file);
    updateFloorPlanTabs((tabs) =>
    tabs.map((tab) => {
      if (tab.id !== tabId) return tab;
      const existingBlock = tab.blocks.find((block) => block.id === blockId);
      if (existingBlock?.type === 'image')
      URL.revokeObjectURL(existingBlock.image.url);
      const blocks = existingBlock ?
      tab.blocks.map((block) =>
      block.id === blockId ?
      {
        id: blockId,
        type: 'image' as const,
        image: nextImage
      } :
      block
      ) :
      [
      ...tab.blocks,
      {
        id: blockId,
        type: 'image' as const,
        image: nextImage
      }];

      return {
        ...tab,
        blocks
      };
    })
    );
    setUploadError('');
  }
  function removeFloorPlanImage(blockId: string) {
    updateFloorPlanTabs((tabs) =>
    tabs.map((tab) => ({
      ...tab,
      blocks: tab.blocks.filter((block) => {
        if (block.id !== blockId) return true;
        if (block.type === 'image') URL.revokeObjectURL(block.image.url);
        return false;
      })
    }))
    );
    setSelectedBlock((current) =>
    current === `floorPlanImage-${blockId}` ? null : current
    );
  }
  function updateFloorPlanImageAlt(blockId: string, alt: string) {
    updateFloorPlanTabs((tabs) =>
    tabs.map((tab) => ({
      ...tab,
      blocks: tab.blocks.map((block) =>
      block.id === blockId && block.type === 'image' ?
      {
        ...block,
        image: {
          ...block.image,
          alt
        }
      } :
      block
      )
    }))
    );
  }
  function updateSlideAlt(id: string, alt: string) {
    setSlides((current) =>
    current.map((slide) =>
    slide.id === id ?
    {
      ...slide,
      alt
    } :
    slide
    )
    );
  }
  function updateBannerAlt(side: 'left' | 'right', alt: string) {
    const updateBanner = side === 'left' ? setLeftBanner : setRightBanner;
    updateBanner((current) =>
    current ?
    {
      ...current,
      alt
    } :
    current
    );
  }
  function updateOverviewBackgroundAlt(alt: string) {
    setOverviewBackgroundImage((current) =>
    current ?
    {
      ...current,
      alt
    } :
    current
    );
  }
  function updateOverviewCoverAlt(alt: string) {
    setOverviewCoverImage((current) =>
    current ?
    {
      ...current,
      alt
    } :
    current
    );
  }
  function openPreview() {
    const snapshot: ProjectPreviewSnapshot = {
      project,
      content,
      slides,
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
      activeSlide,
      activeMenu
    };
    try {
      window.sessionStorage.setItem(
        PROJECT_PREVIEW_STORAGE_KEY,
        JSON.stringify(snapshot)
      );
      const previewWindow = window.open('/xem-truoc', '_blank');
      if (!previewWindow) showNotice('Trình duyệt đang chặn cửa sổ xem trước.');
    } catch {
      showNotice('Không thể mở bản xem trước. Vui lòng thử lại.');
    }
  }
  const editorProps = {
    content,
    role,
    displayMode: 'editor' as const,
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
    onContentChange: setContent,
    onActiveMenuChange: setActiveMenu,
    onActiveSlideChange: setActiveSlide,
    onSelectHero: selectHero,
    onSelectBanners: selectBanners,
    onSelectOverview: selectOverview,
    onSelectAmenities: selectAmenities,
    onSelectAmenityImage: selectAmenityImage,
    onSelectCustom: selectCustom,
    onSelectCustomCover: selectCustomCover,
    onSelectContactTitle: selectContactTitle,
    onSelectTextEditor: selectTextEditor,
    onSelectOverviewCover: selectOverviewCover,
    onSelectProductsTitle: selectProductsTitle,
    onSelectProductImage: selectProductImage,
    onSelectFloorPlanImage: selectFloorPlanImage,
    onReplaceProductImage: replaceProductImage,
    onRemoveProductImage: removeProductImage,
    onRemoveProduct: removeProduct,
    onReplaceFloorPlanImage: replaceFloorPlanImage,
    onAddAmenityImages: addAmenityImages,
    onClearAmenitiesBlock: clearAmenitiesBlock,
    onReplaceOverviewCoverImage: replaceOverviewCoverImage,
    onRemoveOverviewCoverImage: removeOverviewCoverImage,
    onReplaceCustomCoverImage: replaceCustomCoverImage,
    onRemoveCustomCoverImage: removeCustomCoverImage,
    onUploadLeftBanner: (file: File) => {
      replaceBanner('left', file);
      selectBanners();
    },
    onUploadRightBanner: (file: File) => {
      replaceBanner('right', file);
      selectBanners();
    },
    onRequestUpload: requestUpload
  };
  const panelProps = {
    selectedBlock,
    canEditHero: role === 'APM',
    canEditBanners: role === 'APM',
    canEditOverview: role === 'APM',
    slides,
    leftBanner,
    rightBanner,
    overviewBackgroundImage,
    overviewCoverImage,
    overviewStyles,
    amenitiesStyles,
    amenitiesBackgroundImage,
    amenitiesBlock: content.amenitiesBlock,
    customStyles,
    customBackgroundImage,
    customCoverImage,
    featuredProducts: content.featuredProducts,
    floorPlanTabs: content.floorPlanTabs,
    productsTitleColor: content.featuredProductsTitleColor ?? '#333333',
    contactTitleColor: content.contactTitleColor ?? '#333333',
    projectName: content.projectName,
    onProductsTitleColorChange: updateProductsTitleColor,
    onContactTitleColorChange: updateContactTitleColor,
    onAmenitiesStylesChange: (styles: Partial<OverviewStyles>) =>
    setAmenitiesStyles((current) => ({
      ...current,
      ...styles
    })),
    onReplaceAmenitiesBackgroundImage: replaceAmenitiesBackgroundImage,
    onRemoveAmenitiesBackgroundImage: removeAmenitiesBackgroundImage,
    onAmenitiesBackgroundAltChange: updateAmenitiesBackgroundAlt,
    onReplaceAmenityImage: replaceAmenityImage,
    onRemoveAmenityImage: removeAmenityImage,
    onAmenityImageCaptionChange: updateAmenityImageCaption,
    onCustomStylesChange: (styles: Partial<OverviewStyles>) =>
    setCustomStyles((current) => ({
      ...current,
      ...styles
    })),
    onReplaceCustomBackgroundImage: replaceCustomBackgroundImage,
    onRemoveCustomBackgroundImage: removeCustomBackgroundImage,
    onCustomBackgroundAltChange: updateCustomBackgroundAlt,
    onCustomCoverAltChange: updateCustomCoverAlt,
    onReplaceProductImage: replaceProductImage,
    onRemoveProductImage: removeProductImage,
    onProductImageAltChange: updateProductImageAlt,
    onReplaceFloorPlanImage: replaceFloorPlanImage,
    onRemoveFloorPlanImage: removeFloorPlanImage,
    onFloorPlanImageAltChange: updateFloorPlanImageAlt,
    onRemoveSlide: removeSlide,
    onRequestUpload: requestUpload,
    onSlideAltChange: updateSlideAlt,
    onReplaceBanner: replaceBanner,
    onRemoveBanner: removeBanner,
    onBannerAltChange: updateBannerAlt,
    onReplaceOverviewBackgroundImage: replaceOverviewBackgroundImage,
    onRemoveOverviewBackgroundImage: removeOverviewBackgroundImage,
    onOverviewBackgroundAltChange: updateOverviewBackgroundAlt,
    onOverviewCoverAltChange: updateOverviewCoverAlt,
    textColor: getSelectedTextColor(),
    onFormatText: formatSelectedText,
    onOverviewStylesChange: (styles: Partial<OverviewStyles>) =>
    setOverviewStyles((current) => ({
      ...current,
      ...styles
    })),
    onClose: () => setRightPanelMode(null)
  };
  return (
    <div className="h-screen w-full overflow-hidden bg-white font-sans text-neutral-900">
      <CmsHeader
        rightPanelMode={rightPanelMode}
        role={role}
        onRoleChange={setRole}
        onChangeRightPanel={setRightPanelMode}
        onOpenConfiguration={() => setConfigurationOpen(true)}
        onPreview={openPreview}
        onSaveDraft={() => showNotice('Đã lưu bản nháp')}
        onPublish={() => showNotice('Dự án đã được xuất bản')} />
      

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="sr-only"
        onChange={handleUpload} />
      

      <div className="relative h-[calc(100vh-64px)] overflow-hidden">
        <div className="hidden h-full lg:flex">
          <div
            className={`h-full shrink-0 ${rightPanelMode === 'document' ? 'w-[85vw]' : 'w-screen'}`}>
            
            <ProjectContentEditor {...editorProps} />
          </div>
          {rightPanelMode === 'document' &&
          <div className="h-full w-[15vw] min-w-0">
              <CmsRightPanel mode={rightPanelMode} {...panelProps} />
            </div>
          }
        </div>
        <div className="h-full lg:hidden">
          <ProjectContentEditor {...editorProps} />
          {rightPanelMode === 'document' &&
          <div className="absolute inset-y-0 right-0 z-20 w-[85vw] max-w-sm bg-white shadow-xl">
              <CmsRightPanel mode={rightPanelMode} {...panelProps} />
            </div>
          }
        </div>
      </div>

      {configurationOpen &&
      <ProjectConfigurationDialog
        configuration={projectConfiguration}
        project={project}
        role={role}
        onChange={setProjectConfiguration}
        onSave={() => showNotice('Đã lưu cấu hình dự án')}
        onClose={() => setConfigurationOpen(false)} />

      }

      {uploadError &&
      <p
        role="alert"
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
        
          {uploadError}
        </p>
      }
      {notice &&
      <div
        role="status"
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
        
          {notice}
        </div>
      }
    </div>);

}