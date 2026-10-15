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

/**
 * Fetch a single idea detail by ID (GET /api/ideas/{id})
 */
export const getMyIdeaDetail = async (id: string): Promise<any> => {
  try {
    const res = await GetAPIRequest({ url: `${IDEAS_ENDPOINT}/${id}` });
    return res;
  } catch (error) {
    console.error(`[myIdeasApi] Failed to fetch idea details for ${id}:`, error);
    // If specific endpoint fails, try to find in my ideas list
    try {
      const allMine = await getMyIdeas();
      const match = allMine.find((item) => String(item.id) === String(id));
      if (match) return match;
    } catch {
      // ignore
    }
    throw error;
  }
};

