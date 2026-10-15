import { GetAPIRequest } from '@/api-client/apiClient';
import { ORGANIZER_GUIDELINES_ENDPOINT } from '@/constants/endpoints';
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
  try {
    const res = await GetAPIRequest({ url: ORGANIZER_GUIDELINES_ENDPOINT });
    let list: any[] = [];
    if (Array.isArray(res)) {
      list = res;
    } else if (res && typeof res === 'object') {
      if (Array.isArray((res as any).content)) {
        list = (res as any).content;
      } else if (Array.isArray((res as any).data)) {
        list = (res as any).data;
      }
    }

    const published = list.filter((item: any) => item.isPublished || item.published);

    if (published.length > 0) {
      return published.map((item: any) => {
        const ext = item.fileName?.split('.').pop()?.toLowerCase();
        let fileType: 'pdf' | 'doc' | 'checklist' = 'pdf';
        if (ext === 'docx' || ext === 'doc') fileType = 'doc';
        else if (ext === 'checklist') fileType = 'checklist';

        return {
          id: String(item.id || item.guidelineId),
          title: item.title || 'Guideline',
          description: item.description || '',
          version: item.version ? (String(item.version).startsWith('v') ? item.version : `v${item.version}`) : 'v1.0',
          date: item.publishDate || item.publishedDate || item.date || item.createdAt || 'Recent',
          fileSize: item.fileSize || item.filesize || (item.fileSizeBytes ? `${Math.round(item.fileSizeBytes / 1024)} KB` : 'Attached'),
          downloadUrl: item.fileUrl || item.url || item.downloadUrl,
          fileType,
        };
      });
    }

    return OFFICIAL_DOCUMENTS;
  } catch (error) {
    console.warn('[guidelinesApi] Using default documents fallback:', error);
    return OFFICIAL_DOCUMENTS;
  }
};

