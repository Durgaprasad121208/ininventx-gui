import { OrgGuidelineItem } from '../types/orgGuideliness.types';

export const INITIAL_ORG_GUIDELINES: OrgGuidelineItem[] = [
  {
    id: 'guide-1',
    title: 'InventX 2026 Participant Guide',
    description: 'Rules, timeline, categories and submission requirements.',
    version: 'v0.9 (draft)',
    publishDate: '12 Oct 2026',
    fileName: 'InventX2026-Participant-Guide-DEMO.pdf',
    fileSize: '420 KB',
    isPublished: true,
  },
  {
    id: 'guide-2',
    title: 'OT Safety & Cybersecurity Checklist',
    description: 'Mandatory checks before any demo touches OT-like environments.',
    version: 'v1.0',
    publishDate: '12 Oct 2026',
    fileName: 'OT-Safety-Checklist-DEMO.docx',
    fileSize: '96 KB',
    isPublished: true,
  },
  {
    id: 'guide-3',
    title: 'Judging Rubric (unpublished)',
    description: 'Draft rubric for jury members.',
    version: 'v0.3',
    publishDate: '1 Nov 2026',
    fileName: undefined,
    fileSize: undefined,
    isPublished: false,
  },
];

export const getOrgGuidelines = async (): Promise<OrgGuidelineItem[]> => {
  return INITIAL_ORG_GUIDELINES;
};
