export type AnnouncementStatus = 'published' | 'draft' | 'archived';
export type AnnouncementPriority = 'normal' | 'critical' | 'important' | 'info';

export interface OrgAnnouncementItem {
  id: string;
  title: string;
  content: string;
  status: AnnouncementStatus;
  priority?: AnnouncementPriority;
  isPinned?: boolean;
  publishDate: string;
  author: string;
  link?: string;
}

export interface AnnouncementFormData {
  title: string;
  body: string;
  priority: string;
  publishTime: string;
  link?: string;
  pinToTop: boolean;
}
