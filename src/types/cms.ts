import type { ProjectDraft } from './project';

export const PROJECT_PREVIEW_STORAGE_KEY = 'cenhomes-project-preview';

export interface HeroSlide {
  id: string;
  name: string;
  url: string;
  alt?: string;
}

export interface FeaturedItem {
  metric: string;
  value: string;
  valueColor?: string;
}

export interface FeaturedProduct {
  id: string;
  image: HeroSlide | null;
  name: string;
  nameColor?: string;
  price: string;
  description: string;
  descriptionColor?: string;
}

export interface FloorPlanParagraphBlock {
  id: string;
  type: 'paragraph';
  paragraph: string;
  paragraphColor?: string;
}

export interface FloorPlanImageBlock {
  id: string;
  type: 'image';
  image: HeroSlide;
}

export type FloorPlanContentBlock =
FloorPlanParagraphBlock |
FloorPlanImageBlock;

export interface FloorPlanTab {
  id: string;
  label: string;
  blocks: FloorPlanContentBlock[];
}

export interface DriveFileRef {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

export interface SalesPolicyGroup {
  id: string;
  label: string;
  files: DriveFileRef[];
}

export interface DocumentsSection {
  training: DriveFileRef[];
  salesPolicyCoverImage: HeroSlide | null;
  salesPolicyGroups: SalesPolicyGroup[];
  progress: DriveFileRef[];
  general: DriveFileRef[];
}

export interface AmenityImage {
  id: string;
  image: HeroSlide;
  caption: string;
}

export interface OverviewFloorPlanPreviewItem {
  id: string;
  label: string;
  image: HeroSlide;
}

export type AmenitiesCarouselType = 'carousel-single' | 'carousel-grid';

export interface AmenitiesParagraphBlock {
  id: string;
  type: 'paragraph';
  paragraph: string;
  paragraphColor?: string;
}

export interface AmenitiesCarouselBlock {
  id: string;
  type: AmenitiesCarouselType;
  images: AmenityImage[];
}

export type AmenitiesBlock = AmenitiesParagraphBlock | AmenitiesCarouselBlock;

export interface CmsProjectContent {
  hierarchy: string;
  projectName: string;
  description: string;
  descriptionColor?: string;
  overviewContent: string;
  overviewImages: HeroSlide[];
  locationContent: string;
  locationContentColor?: string;
  locationImages: HeroSlide[];
  overviewFloorPlanPreview: OverviewFloorPlanPreviewItem[];
  image360: HeroSlide[];
  salesSheetFolderName: string;
  documents: DocumentsSection;
  featuredItems: FeaturedItem[];
  featuredProductsTitleColor?: string;
  featuredProductsDescription: string;
  featuredProductsDescriptionColor?: string;
  featuredProducts: FeaturedProduct[];
  floorPlansDescription: string;
  floorPlansDescriptionColor?: string;
  floorPlanTabs: FloorPlanTab[];
  amenitiesDescription: string;
  amenitiesDescriptionColor?: string;
  amenitiesBlock: AmenitiesBlock | null;
  customTitle: string;
  customContent: string;
  contactTitleColor?: string;
  contactDescription: string;
  contactDescriptionColor?: string;
}

export type CmsTextEditorId =
'description' |
'overviewContent' |
'locationContent' |
'featuredProductsDescription' |
'floorPlansDescription' |
'amenitiesDescription' |
'amenitiesParagraph' |
'customTitle' |
'customContent' |
'contactDescription' |
`featured-${number}` |
`product-name-${number}` |
`product-desc-${number}` |
`floorPlanParagraph-${string}`;

export interface ProjectPreviewSnapshot {
  project: ProjectDraft;
  content: CmsProjectContent;
  slides: HeroSlide[];
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
  activeSlide: number;
  activeMenu: string;
}

export interface OverviewStyles {
  backgroundColor: string;
  backgroundOpacity: number;
  headingColor: string;
  contentColor: string;
}

export type SelectedEditorBlock =
'hero' |
'banners' |
'overview' |
'overviewCover' |
'productsTitle' |
'amenities' |
'custom' |
'customCover' |
'contactTitle' |
`productImage-${number}` |
`floorPlanImage-${string}` |
`amenityImage-${string}` |
CmsTextEditorId |
null;

export type CmsRole = 'APM' | 'Trưởng line' | 'Quản lý bán hàng' | 'Marketing';