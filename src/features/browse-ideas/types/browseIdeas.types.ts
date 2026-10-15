export type IdeaStage = 'S1 Idea Submission' | 'S2 Screening' | 'S3 Presentation' | 'S4 Demo' | string;

export type IdeaStatus = 'Submitted' | 'Draft' | 'Changes requested' | 'Approved' | 'Under Review' | string;

export type IdeaCategory =
  | 'Customer & Business'
  | 'AI & Data Analytics'
  | 'Product & Process'
  | 'Modelling & Simulation'
  | 'Energy & Sustainability'
  | string;

export type IdeaThumbnailType = 'handshake' | 'robotics' | 'marketplace' | 'factory' | 'leaf';

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  stage: IdeaStage;
  stageBadge?: string;
  category: IdeaCategory;
  status: IdeaStatus;
  author: string;
  company: string;
  team: string;
  teamDotColor: string;
  date: string;
  likes: number;
  hasLiked?: boolean;
  attachments?: number;
  thumbnailType: IdeaThumbnailType;
}

export interface BackendIdeaItem {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  category?: string;
  stage?: string;
  status?: string;
  ownerId?: string;
  ownerName?: string;
  author?: string;
  company?: string;
  team?: string;
  teamDotColor?: string;
  likeCount?: number;
  likes?: number;
  likedByMe?: boolean;
  hasLiked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  attachments?: number;
}

export interface BackendIdeasPageResponse {
  content: BackendIdeaItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GetIdeasParams {
  sort?: string;
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  stage?: string;
}

export interface BrowseIdeasFilterState {
  searchQuery: string;
  category: string;
  company: string;
  stage: string;
  sortBy: 'newest' | 'oldest' | 'most-liked' | string;
}
