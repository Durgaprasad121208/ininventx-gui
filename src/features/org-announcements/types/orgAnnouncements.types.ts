export type OrgAnnouncementState = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
export type OrgAnnouncementStatus = 'draft' | 'published' | 'archived' | string;
export type OrgAnnouncementPriority = 'normal' | 'important' | 'critical' | string;

export interface BackendOrgAnnouncementItem {
  id: string;
  title: string;
  content: string;
  state: OrgAnnouncementState;
  publishAt?: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt?: string;
  author?: string;
}

export interface OrgAnnouncementItem {
  id: string;
  title: string;
  content: string;
  state?: OrgAnnouncementState;
  status?: OrgAnnouncementStatus;
  publishAt?: string | null;
  publishDate?: string;
  pinned?: boolean;
  isPinned?: boolean;
  priority?: OrgAnnouncementPriority;
  author?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  pinned: boolean;
  publishAt: string;
}

export interface UpdateAnnouncementRequest {
  title: string;
  content: string;
  pinned: boolean;
  publishAt: string;
}
