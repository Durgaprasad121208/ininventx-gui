export type AnnouncementPriority = 'critical' | 'important' | 'general' | 'info';

export interface MilestoneItem {
  icon?: string;
  label: string;
  date?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  priority: AnnouncementPriority;
  date: string;
  author: string;
  authorRole?: string;
  milestones?: MilestoneItem[];
  highlights?: string[];
  actionLink?: string;
  actionText?: string;
  actionType?: 'primary' | 'secondary' | 'external';
}
