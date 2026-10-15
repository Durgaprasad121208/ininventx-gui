import type { OrgAnnouncementItem } from '../types/orgAnnouncements.types';

export const mockOrgAnnouncements: OrgAnnouncementItem[] = [
  {
    id: 'ann-org-1',
    title: 'Jury panel announcement (draft)',
    content: 'Draft — not yet visible to employees.',
    status: 'draft',
    priority: 'normal',
    isPinned: false,
    publishDate: '20 Oct 2026, 13:30',
    author: 'Priya Nair (Demo)',
  },
  {
    id: 'ann-org-2',
    title: 'Ask-me-anything session on OT safety',
    content: 'Join a short session on safe demo environments and data handling. Link...',
    status: 'published',
    priority: 'normal',
    isPinned: false,
    publishDate: '14 Oct 2026, 10:30',
    author: 'Priya Nair (Demo)',
  },
  {
    id: 'ann-org-3',
    title: 'Idea submission closes 30 October',
    content: 'Submit your ideas by 30 October 2026. Screening & Selection: 2...',
    status: 'published',
    priority: 'critical',
    isPinned: true,
    publishDate: '13 Oct 2026, 13:30',
    author: 'Priya Nair (Demo)',
  },
];

export const getOrgAnnouncements = async (): Promise<OrgAnnouncementItem[]> => {
  return Promise.resolve([...mockOrgAnnouncements]);
};
