import { GetAPIRequest, PutAPIRequest } from '@/api-client/apiClient';
import { ORGANIZER_USERS_ENDPOINT } from '@/constants/endpoints';
import type {
  UserItem,
  GetOrganizerUsersParams,
  OrganizerUsersResponse,
} from '../types/users.types';

const normalizeUserItem = (raw: any): UserItem => ({
  id: String(raw?.id || ''),
  name: String(raw?.name || 'Unnamed User'),
  email: String(raw?.email || ''),
  company: String(raw?.company || 'MANTIX'),
  role: String(raw?.role || 'EMPLOYEE').toUpperCase(),
  department: raw?.department ? String(raw.department) : undefined,
  designation: raw?.designation ? String(raw.designation) : undefined,
});

/**
 * Fetch organizer users from Spring Boot backend (GET /api/organizer/users)
 * Query params: q (string), role (string), page (int, default 0), size (int, default 20)
 */
export const getOrganizerUsers = async (
  params?: GetOrganizerUsersParams
): Promise<OrganizerUsersResponse> => {
  try {
    const queryParams: Record<string, any> = {};
    if (params?.q && params.q.trim()) {
      queryParams.q = params.q.trim();
    }
    if (params?.role && params.role !== 'ALL') {
      queryParams.role = params.role.toUpperCase();
    }
    if (typeof params?.page === 'number') {
      queryParams.page = params.page;
    }
    if (typeof params?.size === 'number') {
      queryParams.size = params.size;
    }

    const res = await GetAPIRequest({
      url: ORGANIZER_USERS_ENDPOINT,
      params: queryParams,
    });

    if (res && Array.isArray(res.content)) {
      return {
        content: res.content.map(normalizeUserItem),
        page: Number(res.page || 0),
        size: Number(res.size || (params?.size ?? 20)),
        totalElements: Number(res.totalElements ?? res.content.length),
        totalPages: Number(
          res.totalPages || Math.ceil((res.totalElements || res.content.length) / (res.size || 20))
        ),
      };
    }

    if (Array.isArray(res)) {
      return {
        content: res.map(normalizeUserItem),
        page: 0,
        size: res.length,
        totalElements: res.length,
        totalPages: 1,
      };
    }

    if (res && typeof res === 'object') {
      const list = Array.isArray(res.data) ? res.data : Array.isArray(res.items) ? res.items : [];
      return {
        content: list.map(normalizeUserItem),
        page: Number(res.page || 0),
        size: Number(res.size || (params?.size ?? 20)),
        totalElements: Number(res.totalElements ?? list.length),
        totalPages: Number(res.totalPages || 1),
      };
    }

    return {
      content: [],
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      totalElements: 0,
      totalPages: 0,
    };
  } catch (error) {
    console.error('[usersApi] Failed to fetch organizer users:', error);
    throw error;
  }
};

/**
 * Update user role (PUT /api/organizer/users/{id})
 */
export const updateUserRole = async (userId: string, newRole: string): Promise<boolean> => {
  try {
    await PutAPIRequest({
      url: `${ORGANIZER_USERS_ENDPOINT}/${userId}`,
      data: { role: newRole.toUpperCase() },
    });
    return true;
  } catch (error) {
    console.error(`[usersApi] Failed to update role for user ${userId}:`, error);
    throw error;
  }
};
