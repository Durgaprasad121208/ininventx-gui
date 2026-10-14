export type StageCode = 'S1' | 'S2' | 'S3' | 'S4';

export interface StageHistoryEntry {
  id: string;
  action: string;
  reason?: string;
  author: string;
  timestamp: string;
}

export interface IdeaDetailData {
  id: string;
  title: string;
  description: string;
  category: string;
  stageCode: StageCode;
  stageName: string;
  status: 'Draft' | 'Submitted' | 'Under review' | 'Approved' | 'Rejected' | 'Archived';
  isDemoContent?: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
  teamName: string;
  ownerName: string;
  ownerRole: string;
  company: string;
  companyDotColor: string;
  teamMembersCount: string;
  attachments: string[];
  stageHistory: StageHistoryEntry[];
  internalNotes?: string;
  tags?: string[];
}
