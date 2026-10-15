import { GetAPIRequest } from '@/api-client/apiClient';
import { ANNOUNCEMENTS_ENDPOINT } from '@/constants/endpoints';
import type { AnnouncementItem } from '../types/announcements.types';

const ANNOUNCEMENTS_URL = ANNOUNCEMENTS_ENDPOINT || '/api/announcements';

const normalizeAnnouncement = (raw: any): AnnouncementItem => ({
  id: String(raw.id || ''),
  title: String(raw.title || ''),
  content: String(raw.content || ''),
  publishedAt: String(raw.publishedAt || raw.createdAt || ''),
  pinned: Boolean(raw.pinned ?? raw.isPinned),
});

/**
 * Fetch all announcements from backend (GET /api/announcements)
 */
export const getAnnouncements = async (): Promise<AnnouncementItem[]> => {
  try {
    const res = await GetAPIRequest({ url: ANNOUNCEMENTS_URL || '/api/announcements' });

    if (Array.isArray(res)) {
      return res.map(normalizeAnnouncement);
    }
    if (res && typeof res === 'object') {
      if (Array.isArray((res as any).content)) {
        return (res as any).content.map(normalizeAnnouncement);
      }
      if (Array.isArray((res as any).data)) {
        return (res as any).data.map(normalizeAnnouncement);
      }
    }

    return [];
  } catch (error) {
    console.error('[announcementsApi] Failed to fetch announcements:', error);
    return [];
  }
};


