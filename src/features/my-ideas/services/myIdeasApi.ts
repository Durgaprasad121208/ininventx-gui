import { GetAPIRequest } from '@/api-client/apiClient';
import { IDEAS_ENDPOINT } from '@/constants/endpoints';
import type { BackendMyIdeaItem } from '../types/myIdeas.types';

/**
 * Fetch the authenticated user's submitted and draft ideas (GET /api/ideas/mine)
 */
export const getMyIdeas = async (): Promise<BackendMyIdeaItem[]> => {
  try {
    const res = await GetAPIRequest({ url: `${IDEAS_ENDPOINT}/mine` });

    if (Array.isArray(res)) {
      return res;
    }
    if (res && typeof res === 'object') {
      if (Array.isArray((res as any).content)) {
        return (res as any).content;
      }
      if (Array.isArray((res as any).data)) {
        return (res as any).data;
      }
    }

    return [];
  } catch (error) {
    console.error('[myIdeasApi] Failed to fetch my ideas:', error);
    return [];
  }
};

