import { GetAPIRequest, PostAPIRequest, PutAPIRequest } from '@/api-client/apiClient';
import { ORGANIZER_ANNOUNCEMENTS_ENDPOINT } from '@/constants/endpoints';
import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  OrgAnnouncementItem,
  OrgAnnouncementState,
} from '../types/orgAnnouncements.types';

const normalizeOrgAnnouncement = (raw: any): OrgAnnouncementItem => {
  const state = String(raw?.state || raw?.status || 'DRAFT').toUpperCase();
  const status = (raw?.status ? String(raw.status).toLowerCase() : state.toLowerCase());
  const pinned = Boolean(raw?.pinned ?? raw?.isPinned ?? false);
  const publishAt = raw?.publishAt || raw?.publishedAt || raw?.createdAt || null;

  return {
    id: String(raw?.id || ''),
    title: String(raw?.title || ''),
    content: String(raw?.content || ''),
    state,
    status,
    pinned,
    isPinned: pinned,
    publishAt,
    publishDate:
      raw?.publishDate ||
      (publishAt
        ? new Date(publishAt).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''),
    priority: (raw?.priority || 'normal').toLowerCase(),
    author: raw?.author || 'Organizer',
    link: raw?.link || undefined,
    createdAt: String(raw?.createdAt || new Date().toISOString()),
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
  };
};

/**
 * Fetch organizer announcements from backend (GET /api/organizer/announcements)
 */
export const getOrgAnnouncements = async (): Promise<OrgAnnouncementItem[]> => {
  try {
    const res = await GetAPIRequest({ url: ORGANIZER_ANNOUNCEMENTS_ENDPOINT });

    if (Array.isArray(res)) {
      return res.map(normalizeOrgAnnouncement);
    }
    if (res && typeof res === 'object') {
      if (Array.isArray((res as any).content)) {
        return (res as any).content.map(normalizeOrgAnnouncement);
      }
      if (Array.isArray((res as any).data)) {
        return (res as any).data.map(normalizeOrgAnnouncement);
      }
    }

    return [];
  } catch (error) {
    console.error('[orgAnnouncementsApi] Failed to fetch organizer announcements:', error);
    return [];
  }
};

/**
 * Create a new organizer announcement (POST /api/organizer/announcements)
 */
export const createOrgAnnouncement = async (
  data: CreateAnnouncementRequest
): Promise<OrgAnnouncementItem> => {
  try {
    const res = await PostAPIRequest({
      url: ORGANIZER_ANNOUNCEMENTS_ENDPOINT,
      data,
    });
    return normalizeOrgAnnouncement(res);
  } catch (error) {
    console.error('[orgAnnouncementsApi] Failed to create announcement:', error);
    throw error;
  }
};

/**
 * Update an existing organizer announcement (PUT /api/organizer/announcements/{id})
 */
export const updateOrgAnnouncement = async (
  id: string,
  data: UpdateAnnouncementRequest
): Promise<OrgAnnouncementItem> => {
  try {
    const res = await PutAPIRequest({
      url: `${ORGANIZER_ANNOUNCEMENTS_ENDPOINT}/${id}`,
      data,
    });
    return normalizeOrgAnnouncement(res);
  } catch (error) {
    console.error(`[orgAnnouncementsApi] Failed to update announcement ${id}:`, error);
    throw error;
  }
};

/**
 * Change announcement state (e.g. PUBLISHED, ARCHIVED, DRAFT)
 * POST /api/organizer/announcements/{id}/state
 */
export const changeOrgAnnouncementState = async (
  id: string,
  state: OrgAnnouncementState
): Promise<OrgAnnouncementItem | any> => {
  try {
    const res = await PostAPIRequest({
      url: `${ORGANIZER_ANNOUNCEMENTS_ENDPOINT}/${id}/state?state=${state}`,
      data: { state },
    });
    return res ? normalizeOrgAnnouncement(res) : null;
  } catch (error) {
    console.error(`[orgAnnouncementsApi] Failed to change state for announcement ${id}:`, error);
    throw error;
  }
};
