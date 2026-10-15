import { GetAPIRequest, PostAPIRequest, PutAPIRequest } from '@/api-client/apiClient';
import { ORGANIZER_IDEAS_ENDPOINT } from '@/constants/endpoints';
import type {
  BackendOrganizerIdeaDetail,
  StageTransitionPayload,
  UpdateIdeaMetadataPayload,
} from '../types/ideaInfo.types';

/**
 * Fetch idea details for organizer review (GET /api/organizer/ideas/{id})
 */
export const getOrganizerIdeaDetail = async (
  id: string
): Promise<BackendOrganizerIdeaDetail> => {
  return GetAPIRequest({ url: `${ORGANIZER_IDEAS_ENDPOINT}/${id}` });
};

/**
 * Execute stage transition decision (POST /api/organizer/ideas/{id}/stage-transitions)
 */
export const postStageTransition = async (
  id: string,
  payload: StageTransitionPayload
): Promise<BackendOrganizerIdeaDetail> => {
  return PostAPIRequest({
    url: `${ORGANIZER_IDEAS_ENDPOINT}/${id}/stage-transitions`,
    data: payload,
  });
};

/**
 * Update administrative metadata (PUT /api/organizer/ideas/{id})
 */
export const updateOrganizerIdeaMetadata = async (
  id: string,
  payload: UpdateIdeaMetadataPayload
): Promise<BackendOrganizerIdeaDetail> => {
  return PutAPIRequest({
    url: `${ORGANIZER_IDEAS_ENDPOINT}/${id}`,
    data: payload,
  });
};
