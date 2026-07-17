export type ConfigTeamRole = 'APM' | 'Quản lý bán hàng' | 'Marketing';

export interface ProjectTeamMember {
  id: string;
  employeeCode: string;
  name: string;
  title: string;
  phoneNumber: string;
  isHotlineOnDuty: boolean;
  roles: ConfigTeamRole[];
  isOwner?: boolean;
}

export interface ProjectConfiguration {
  avatarUrl: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  projectCode: string;
  projectType: string;
  address: string;
  province: string;
  ward: string;
  salesStatus: string;
  segment: string;
  category: string;
  minimumArea: string;
  maximumArea: string;
  minimumPrice: string;
  maximumPrice: string;
  contractorManager: string;
  constructionManager: string;
  publishingStatus: string;
  soldUnits: number;
  teamMembers: ProjectTeamMember[];
}

export interface ProjectDraft {
  hierarchy: string;
  name: string;
  propertyType: string;
  province: string;
  district: string;
  status: string;
}