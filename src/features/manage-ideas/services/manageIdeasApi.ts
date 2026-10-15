import { GetAPIRequest } from '@/api-client/apiClient';
import { ORGANIZER_IDEAS_ENDPOINT } from '@/constants/endpoints';
import type {
  BackendOrganizerIdeasResponse,
  OrganizerIdeasQueryParams,
} from '../types/manageIdeas.types';

/**
 * Fetch organizer ideas from GET /api/organizer/ideas
 * Supports search (q), category, company, stage, status, ownerId, sort, page, size.
 */
export const getOrganizerIdeas = async (
  params?: OrganizerIdeasQueryParams
): Promise<BackendOrganizerIdeasResponse> => {
  const query = new URLSearchParams();

  if (params?.q && params.q.trim()) {
    query.set('q', params.q.trim());
  }
  if (params?.category && params.category !== 'all') {
    query.set('category', params.category);
  }
  if (params?.company && params.company !== 'all') {
    query.set('company', params.company);
  }
  if (params?.stage && params.stage !== 'all') {
    query.set('stage', params.stage);
  }
  if (params?.status && params.status !== 'all') {
    query.set('status', params.status);
  }
  if (params?.ownerId) {
    query.set('ownerId', params.ownerId);
  }
  if (params?.sort) {
    query.set('sort', params.sort);
  }
  if (typeof params?.page === 'number') {
    query.set('page', String(params.page));
  }
  if (typeof params?.size === 'number') {
    query.set('size', String(params.size));
  }

  const queryString = query.toString();
  const url = queryString ? `${ORGANIZER_IDEAS_ENDPOINT}?${queryString}` : ORGANIZER_IDEAS_ENDPOINT;

  try {
    const res = await GetAPIRequest({ url });

    if (res && typeof res === 'object') {
      if (Array.isArray(res)) {
        return {
          content: res,
          page: 0,
          size: res.length,
          totalElements: res.length,
          totalPages: 1,
        };
      }
      if (Array.isArray((res as any).content)) {
        return res as BackendOrganizerIdeasResponse;
      }
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
      size: params?.size ?? 20,
      totalElements: 0,
      totalPages: 0,
    };
  } catch (error) {
    console.error('[manageIdeasApi] Failed to fetch organizer ideas:', error);
    return {
      content: [],
      page: 0,
      size: params?.size ?? 20,
      totalElements: 0,
      totalPages: 0,
    };
  }
};
