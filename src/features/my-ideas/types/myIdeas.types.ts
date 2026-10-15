export type MyIdeaStatus =
  | 'Draft'
  | 'Under review'
  | 'Submitted'
  | 'Approved'
  | 'Changes requested'
  | string;

export interface BackendMyIdeaItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  stage: string;
  status: string;
  ownerId?: string;
  ownerName?: string;
  likeCount?: number;
  likedByMe?: boolean;
  createdAt?: string;
  updatedAt?: string;
  attachments?: number;
  company?: string;
  team?: string;
}

export interface MyIdeaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: MyIdeaStatus;
  stage: string;
  stageBadge?: string;
  author: string;
  company: string;
  team: string;
  teamDotColor: string;
  date: string;
  attachments?: number;
  likes: number;
  thumbnailType: 'factory' | 'robotics' | 'handshake' | 'leaf';
}

