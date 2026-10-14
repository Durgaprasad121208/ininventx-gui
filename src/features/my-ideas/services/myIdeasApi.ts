import { MyIdeaItem } from '../types/myIdeas.types';

export const INITIAL_MY_IDEAS: MyIdeaItem[] = [
  {
    id: 'my-idea-1',
    title: 'Shift Handover Digital Logbook',
    description:
      'Replaces paper shift logs with a structured digital logbook linked to alarms and work orders across the plant.',
    category: 'Smart Factories',
    status: 'Under review',
    stage: 'S2 Screening',
    stageBadge: 'DEMO',
    author: 'Aarav Mehta (Demo)',
    company: 'MANTIX',
    team: 'Handover Heroes',
    teamDotColor: '#38bdf8',
    date: '12 Oct 2026',
    attachments: 2,
    likes: 4,
    thumbnailType: 'factory',
  },
  {
    id: 'my-idea-2',
    title: 'Proposal Drafting Accelerator',
    description:
      'Draft idea: reuse approved past proposal sections to assemble first drafts for new client requirements.',
    category: 'AI & Data Analytics',
    status: 'Draft',
    stage: 'S1 Idea Submission',
    stageBadge: 'DEMO',
    author: 'Aarav Mehta (Demo)',
    company: 'MANTIX',
    team: 'BidBoost',
    teamDotColor: '#38bdf8',
    date: '14 Oct 2026',
    attachments: 1,
    likes: 0,
    thumbnailType: 'robotics',
  },
];

const STORAGE_KEY = 'inventx_my_ideas_list';

export const getMyIdeas = async (): Promise<MyIdeaItem[]> => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading my ideas from localStorage', e);
    }
  }
  return INITIAL_MY_IDEAS;
};

export const saveMyIdeas = async (ideas: MyIdeaItem[]): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch (e) {
      console.error('Failed saving my ideas', e);
    }
  }
};
