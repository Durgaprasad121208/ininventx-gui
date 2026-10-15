import { GetAPIRequest } from '@/api-client/apiClient';
import { ORGANIZER_OVERVIEW_ENDPOINT } from '@/constants/endpoints';
import type { BackendOverviewResponse } from '../types/overview.types';

/**
 * Fetch organizer programme overview stats (GET /api/organizer/overview)
 */
export const getOverviewData = async (): Promise<BackendOverviewResponse> => {
  return GetAPIRequest({ url: ORGANIZER_OVERVIEW_ENDPOINT });
};
