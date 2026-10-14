export type ManageIdeaStatus =
  | 'Approved'
  | 'Draft'
  | 'Submitted'
  | 'Under review'
  | 'Rejected';

export interface ManageIdeaRecord {
  id: string;
  title: string;
  team: string;
  attachmentsCount?: number;
  author: string;
  company: 'MANTIX' | 'Nexsys Process Automations' | 'Stability' | string;
  companyDotColor: string;
  category: string;
  stageCode: string; // e.g. 'S1', 'S2', 'S4'
  stageName: string; // e.g. 'Idea Submission', 'Screening', 'Demo'
  status: ManageIdeaStatus;
  likes: number;
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
