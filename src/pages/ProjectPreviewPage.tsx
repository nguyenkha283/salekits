import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ProjectContentEditor } from '../components/ProjectContentEditor';
import {
  CmsProjectContent,
  CmsRole,
  OverviewStyles,
  ProjectPreviewSnapshot,
  PROJECT_PREVIEW_STORAGE_KEY } from
'../types/cms';
import { normalizeFloorPlanTabs } from '../utils/floorPlans';
import { ProjectDraft } from '../types/project';
const FALLBACK_PROJECT: ProjectDraft = {
  hierarchy: '',
  name: '',
  propertyType: '',
  province: '',
  district: '',
  status: ''
};
const FALLBACK_CONTENT: CmsProjectContent = {
  hierarchy: FALLBACK_PROJECT.hierarchy,
  projectName: '',
  description: '',
  overviewContent: '',
  overviewImages: [],
  locationContent: '',
  locationImages: [],
  overviewFloorPlanPreview: [],
  floorPlanImage: null,
  image360: [],
  salesSheetFolderName: '',
  documents: {
    training: [],
    salesPolicyCoverImage: null,
    salesPolicyGroups: [],
    progress: [],
    general: []
  },
  featuredItems: Array.from(
    {
      length: 3
    },
    () => ({
      metric: '',
      value: ''
    })
  ),
  featuredProductsDescription: '',
  featuredProducts: [],
  floorPlansDescription: '',
  floorPlanTabs: [],
  amenitiesDescription: '',
  amenitiesBlock: null,
  customTitle: '',
  customContent: '',
  contactDescription: ''
};
const FALLBACK_STYLES: OverviewStyles = {
  backgroundColor: '#f5881f',
  backgroundOpacity: 20,
  headingColor: '#333333',
  contentColor: '#424843'
};
const FALLBACK_SNAPSHOT: ProjectPreviewSnapshot = {
  project: FALLBACK_PROJECT,
  content: FALLBACK_CONTENT,
  slides: [],
  leftBanner: null,
  rightBanner: null,
  overviewBackgroundImage: null,
  overviewCoverImage: null,
  overviewStyles: FALLBACK_STYLES,
  amenitiesStyles: FALLBACK_STYLES,
  amenitiesBackgroundImage: null,
  customStyles: FALLBACK_STYLES,
  customBackgroundImage: null,
  customCoverImage: null,
  hotlineDutyPhone: '',
  activeSlide: 0,
  activeMenu: 'Tổng quan'
};
function loadPreviewSnapshot(): ProjectPreviewSnapshot {
  try {
    const storedSnapshot = window.sessionStorage.getItem(
      PROJECT_PREVIEW_STORAGE_KEY
    );
    if (!storedSnapshot) return FALLBACK_SNAPSHOT;
    const snapshot = JSON.parse(
      storedSnapshot
    ) as Partial<ProjectPreviewSnapshot>;
    if (!snapshot.project || !snapshot.content || !snapshot.overviewStyles)
    return FALLBACK_SNAPSHOT;
    return {
      ...FALLBACK_SNAPSHOT,
      ...snapshot,
      content: {
        ...FALLBACK_CONTENT,
        ...snapshot.content,
        featuredItems:
        snapshot.content.featuredItems ?? FALLBACK_CONTENT.featuredItems,
        featuredProducts:
        snapshot.content.featuredProducts ??
        FALLBACK_CONTENT.featuredProducts,
        floorPlansDescription:
        snapshot.content.floorPlansDescription ??
        FALLBACK_CONTENT.floorPlansDescription,
        floorPlanTabs: normalizeFloorPlanTabs(
          snapshot.content.floorPlanTabs ?? FALLBACK_CONTENT.floorPlanTabs
        ),
        amenitiesBlock: snapshot.content.amenitiesBlock ?? null
      }
    };
  } catch {
    return FALLBACK_SNAPSHOT;
  }
}
export function ProjectPreviewPage() {
  const [snapshot] = useState(loadPreviewSnapshot);
  const [activeMenu, setActiveMenu] = useState(snapshot.activeMenu);
  const [activeSlide, setActiveSlide] = useState(snapshot.activeSlide);
  const viewOnlyRole: CmsRole = 'Trưởng line';
  const noop = () => undefined;
  return (
    <div className="min-h-screen w-full bg-white font-sans text-neutral-900">
      <Header variant="light" />
      <ProjectContentEditor
        content={snapshot.content}
        role={viewOnlyRole}
        displayMode="preview"
        activeMenu={activeMenu}
        slides={snapshot.slides}
        activeSlide={activeSlide}
        leftBanner={snapshot.leftBanner}
        rightBanner={snapshot.rightBanner}
        overviewBackgroundImage={snapshot.overviewBackgroundImage}
        overviewCoverImage={snapshot.overviewCoverImage}
        overviewStyles={snapshot.overviewStyles}
        amenitiesStyles={snapshot.amenitiesStyles}
        amenitiesBackgroundImage={snapshot.amenitiesBackgroundImage}
        customStyles={snapshot.customStyles}
        customBackgroundImage={snapshot.customBackgroundImage}
        customCoverImage={snapshot.customCoverImage}
        hotlineDutyPhone={snapshot.hotlineDutyPhone}
        onContentChange={noop}
        onActiveMenuChange={setActiveMenu}
        onActiveSlideChange={setActiveSlide}
        onSelectHero={noop}
        onSelectBanners={noop}
        onSelectOverview={noop}
        onSelectAmenities={noop}
        onSelectAmenityImage={noop}
        onSelectCustom={noop}
        onSelectCustomCover={noop}
        onSelectContactTitle={noop}
        onSelectTextEditor={noop}
        onSelectOverviewCover={noop}
        onSelectProductsTitle={noop}
        onSelectProductImage={noop}
        onSelectFloorPlanImage={noop}
        onReplaceProductImage={noop}
        onRemoveProductImage={noop}
        onRemoveProduct={noop}
        onReplaceFloorPlanImage={noop}
        onAddAmenityImages={noop}
        onClearAmenitiesBlock={noop}
        onReplaceOverviewCoverImage={noop}
        onRemoveOverviewCoverImage={noop}
        onReplaceCustomCoverImage={noop}
        onRemoveCustomCoverImage={noop}
        onUploadLeftBanner={noop}
        onUploadRightBanner={noop}
        onRequestUpload={noop} />
      
    </div>);

}