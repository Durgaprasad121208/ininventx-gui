export type StageCode = 'S1' | 'S2' | 'S3' | 'S4';

export type OrganizerDecision =
  | 'PROMOTE'
  | 'APPROVE'
  | 'REQUEST_CHANGES'
  | 'REJECT'
  | 'ARCHIVE'
  | 'RESTORE';

export interface BackendTeamMemberDto {
  name: string;
  email?: string;
  department?: string;
  roleInTeam: string;
}

export interface BackendStageHistoryDto {
  id: string;
  decision: string;
  fromStage: string;
  toStage: string;
  fromStatus: string;
  toStatus: string;
  reason?: string;
  changedById?: string;
  changedByName?: string;
  changedAt: string;
}

export interface BackendOrganizerIdeaDetail {
  id: string;
  title: string;
  summary?: string;
  description: string;
  category: string;
  targetCustomer?: string;
  businessImpact?: string;
  stage: string;
  status: string;
  ownerId?: string;
  ownerName?: string;
  likeCount?: number;
  likedByMe?: boolean;
  teamMembers?: BackendTeamMemberDto[];
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  tags?: string[];
  stageHistory?: BackendStageHistoryDto[];
  allowedDecisions?: OrganizerDecision[];
  nextStage?: string;
  attachments?: Array<{
    id?: string;
    fileName?: string;
    name?: string;
    sizeBytes?: number;
    url?: string;
  } | string>;
}

export interface StageTransitionPayload {
  decision: OrganizerDecision;
  reason: string;
  toStage?: string;
}

export interface UpdateIdeaMetadataPayload {
  category?: string;
  adminNotes?: string;
  tags?: string[];
}

export interface StageHistoryEntry {
  id: string;
  action: string;
  reason?: string;
  author: string;
  timestamp: string;
  decision?: string;
}

export interface NormalizedTeamMember {
  name: string;
  email?: string;
  department: string;
  company: string;
  roleInTeam: string;
  isOwner?: boolean;
}

export interface IdeaDetailData {
  id: string;
  title: string;
  summary?: string;
  description: string;
  targetCustomer?: string;
  businessImpact?: string;
  category: string;
  rawCategory: string;
  rawStage?: string;
  stageCode: StageCode;
  stageName: string;
  status: string;
  isDemoContent?: boolean;
  likes: number;
  hasLiked: boolean;
  createdAt: string;
  updatedAt: string;
  teamName: string;
  ownerName: string;
  ownerRole: string;
  company: string;
  companyDotColor: string;
  teamMembersCount: string;
  teamMembers: NormalizedTeamMember[];
  attachments: Array<{ id: string; name: string; size?: string; url?: string }>;
  stageHistory: StageHistoryEntry[];
  internalNotes?: string;
  tags?: string[];
  allowedDecisions: OrganizerDecision[];
  nextStage?: string;
}
