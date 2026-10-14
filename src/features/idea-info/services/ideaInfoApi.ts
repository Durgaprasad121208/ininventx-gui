import { IdeaDetailData } from '../types/ideaInfo.types';

export const MOCK_IDEA_DETAILS: Record<string, IdeaDetailData> = {
  'manage-2': {
    id: 'manage-2',
    title: 'Proposal Drafting Accelerator',
    description:
      'Draft idea: reuse approved past proposal sections to assemble first drafts for new tenders, with human review of every section.',
    category: 'Artificial Intelligence & Data Analytics',
    stageCode: 'S1',
    stageName: 'Idea Submission',
    status: 'Draft',
    isDemoContent: true,
    likes: 0,
    createdAt: '14 Oct 2026',
    updatedAt: '14 Oct 2026',
    teamName: 'BidBoost',
    ownerName: 'Aarav Mehta (Demo)',
    ownerRole: 'Owner',
    company: 'MANTIX',
    companyDotColor: '#38bdf8',
    teamMembersCount: '1/4 members · Single company team',
    attachments: [],
    stageHistory: [
      {
        id: 'hist-1',
        action: 'Created → Draft',
        author: 'Aarav Mehta (Demo)',
        timestamp: '14 Oct 2026, 11:30',
      },
    ],
    internalNotes: '',
    tags: ['ai-drafting', 'tenders', 'accelerator'],
  },
  'manage-1': {
    id: 'manage-1',
    title: 'Remote Support Subscription Bundle',
    description:
      'Packages secure remote OT support, quarterly health checks and spare-parts planning into a tiered subscription for mid-size plants.',
    category: 'Customer & Business Solutions',
    stageCode: 'S4',
    stageName: 'Demo',
    status: 'Approved',
    isDemoContent: true,
    likes: 0,
    createdAt: '14 Oct 2026',
    updatedAt: '15 Oct 2026',
    teamName: 'Always On',
    ownerName: 'Rohan Iyer (Demo)',
    ownerRole: 'Owner',
    company: 'Nexsys Process Automations',
    companyDotColor: '#10b981',
    teamMembersCount: '2/4 members · Cross-functional team',
    attachments: ['remote_support_sla_v1.pdf'],
    stageHistory: [
      {
        id: 'hist-3',
        action: 'Promote · Presentation → Demo → Approved',
        reason: 'ghjhio',
        author: 'Priya Nair (Demo)',
        timestamp: '15 Oct 2026, 03:26',
      },
      {
        id: 'hist-2',
        action: 'Promote · Screening → Presentation → Approved',
        author: 'Priya Nair (Demo)',
        timestamp: '14 Oct 2026, 18:40',
      },
      {
        id: 'hist-1',
        action: 'Created → Submitted',
        author: 'Rohan Iyer (Demo)',
        timestamp: '14 Oct 2026, 14:10',
      },
    ],
    internalNotes: 'Architecture validated with Nexsys OT gateway team.',
    tags: ['subscription', 'remote-ot', 'automation'],
  },
};

export const getIdeaDetail = async (id?: string): Promise<IdeaDetailData> => {
  if (id && MOCK_IDEA_DETAILS[id]) {
    return MOCK_IDEA_DETAILS[id];
  }
  // Default to Proposal Drafting Accelerator from screenshot
  return MOCK_IDEA_DETAILS['manage-2'];
};
