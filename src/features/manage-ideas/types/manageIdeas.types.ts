export type ManageIdeaStatus =
  | 'Approved'
  | 'Draft'
  | 'Submitted'
  | 'Under review'
  | 'Rejected'
  | 'Archived'
  | 'Changes requested'
  | string;

export interface BackendOrganizerIdea {
  id: string;
  title: string;
  summary?: string;
  category: string;
  stage: string;
  status: string;
  ownerId?: string;
  ownerName?: string;
  likeCount?: number;
  likedByMe?: boolean;
  createdAt: string;
  updatedAt?: string;
  company?: string;
  team?: string;
  attachmentsCount?: number;
}

export interface BackendOrganizerIdeasResponse {
  content: BackendOrganizerIdea[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OrganizerIdeasQueryParams {
  q?: string;
  category?: string;
  company?: string;
  stage?: string;
  status?: string;
  ownerId?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface ManageIdeaRecord {
  id: string;
  title: string;
  summary?: string;
  team: string;
  attachmentsCount?: number;
  author: string;
  company: string;
  companyDotColor: string;
  category: string;
  stageCode: string;
  stageName: string;
  status: string;
  likes: number;
  likedByMe?: boolean;
  createdAt: string;
}

export interface ManageIdeasFilterState {
  search: string;
  category: string;
  company: string;
  stage: string;
  status: string;
  sortBy: string;
}
