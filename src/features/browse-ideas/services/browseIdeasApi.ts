import { GetAPIRequest, PostAPIRequest, DeleteAPIRequest } from '@/api-client/apiClient';
import { IDEAS_ENDPOINT } from '@/constants/endpoints';
import { BackendIdeasPageResponse, GetIdeasParams } from '../types/browseIdeas.types';

/**
 * Fetch paginated ideas from Spring Boot backend (GET /api/ideas).
 * Supports sort, page, size, and filters.
 */
export const getBrowseIdeas = async (
  params?: GetIdeasParams
): Promise<BackendIdeasPageResponse> => {
  const query = new URLSearchParams();

  query.set('sort', params?.sort || 'newest');
  query.set('page', String(params?.page ?? 0));
  query.set('size', String(params?.size ?? 20));

  if (params?.category && params.category !== 'all') {
    query.set('category', params.category);
  }
  if (params?.stage && params.stage !== 'all') {
    query.set('stage', params.stage);
  }
  if (params?.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }

  const queryString = query.toString();
  const url = queryString ? `${IDEAS_ENDPOINT}?${queryString}` : IDEAS_ENDPOINT;

  try {
    const res = await GetAPIRequest({ url });

    if (res && typeof res === 'object') {
      // If backend returns array directly
      if (Array.isArray(res)) {
        return {
          content: res,
          page: 0,
          size: res.length,
          totalElements: res.length,
          totalPages: 1,
        };
      }
      // If backend returns standard Spring Data Page (res.content)
      if (Array.isArray((res as any).content)) {
        return res as BackendIdeasPageResponse;
      }
      // If wrapped in res.data
      if (Array.isArray((res as any).data)) {
        return {
          content: (res as any).data,
          page: (res as any).page ?? 0,
          size: (res as any).size ?? 20,
          totalElements: (res as any).totalElements ?? (res as any).data.length,
          totalPages: (res as any).totalPages ?? 1,
        };
      }
    }

    return {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    };
  } catch (err) {
    console.error('[browseIdeasApi] Failed to fetch ideas:', err);
    return {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    };
  }
};

/**
 * Like an idea (POST /api/ideas/{id}/like)
 */
export const likeIdea = async (id: string): Promise<any> => {
  try {
    return await PostAPIRequest({ url: `${IDEAS_ENDPOINT}/${id}/like` });
  } catch (err) {
    console.error(`[browseIdeasApi] Failed to like idea ${id}:`, err);
    throw err;
  }
};

/**
 * Unlike an idea (DELETE /api/ideas/{id}/like)
 */
export const unlikeIdea = async (id: string): Promise<any> => {
  try {
    return await DeleteAPIRequest({ url: `${IDEAS_ENDPOINT}/${id}/like` });
  } catch (err) {
    console.error(`[browseIdeasApi] Failed to unlike idea ${id}:`, err);
    throw err;
  }
};

