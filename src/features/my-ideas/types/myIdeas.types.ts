export type MyIdeaStatus = 'Draft' | 'Under review' | 'Submitted' | 'Approved' | 'Changes requested';

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
