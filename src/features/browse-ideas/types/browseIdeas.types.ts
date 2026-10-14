export type IdeaStage = 'S1 Idea Submission' | 'S2 Screening' | 'S3 Presentation' | 'S4 Demo';

export type IdeaStatus = 'Submitted' | 'Draft' | 'Changes requested' | 'Approved' | 'Under Review';

export type IdeaCategory =
  | 'Customer & Business'
  | 'AI & Data Analytics'
  | 'Product & Process'
  | 'Modelling & Simulation'
  | 'Energy & Sustainability';

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

export interface BrowseIdeasFilterState {
  searchQuery: string;
  category: string;
  company: string;
  stage: string;
  sortBy: 'newest' | 'oldest' | 'most-liked';
}
