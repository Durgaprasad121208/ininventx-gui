import { OfficialDocument } from '../types/guidelines.types';

export const OFFICIAL_DOCUMENTS: OfficialDocument[] = [
  {
    id: 'doc-1',
    title: 'InventX 2026 Participant Guide',
    description: 'Rules, timeline, categories and submission requirements.',
    version: 'v0.9 (draft)',
    date: '12 Oct 2026',
    fileSize: '420 KB',
    fileType: 'pdf',
  },
  {
    id: 'doc-2',
    title: 'OT Safety & Cybersecurity Checklist',
    description: 'Mandatory checks before any demo touches OT-like environments.',
    version: 'v1.0',
    date: '12 Oct 2026',
    fileSize: '96 KB',
    fileType: 'checklist',
  },
];

export const getOfficialDocuments = async (): Promise<OfficialDocument[]> => {
  return OFFICIAL_DOCUMENTS;
};
