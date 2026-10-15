import {
  GetAPIRequest,
  PutAPIRequest,
  DeleteAPIRequest,
  PatchAPIRequest,
  fileUpload,
  PutfileUpload,
} from '@/api-client/apiClient';
import { ORGANIZER_GUIDELINES_ENDPOINT } from '@/constants/endpoints';
import type { OrgGuidelineItem, GuidelineInputDto } from '../types/orgGuideliness.types';

/**
 * Normalizes backend guideline response items into standard frontend OrgGuidelineItem
 */
export const normalizeGuideline = (item: any): OrgGuidelineItem => {
  const sizeVal =
    item.fileSize ||
    item.filesize ||
    (typeof item.fileSizeBytes === 'number'
      ? `${Math.round(item.fileSizeBytes / 1024)} KB`
      : undefined);

  return {
    id: String(item.id || item.guidelineId || `guide-${Date.now()}`),
    title: item.title || '',
    description: item.content || item.description || '',
    version: item.version
      ? String(item.version).startsWith('v')
        ? item.version
        : `v${item.version}`
      : 'v1.0',
    publishDate:
      item.publishDate || item.publishedDate || item.date || item.createdAt || 'Recently',
    fileName:
      item.fileName || item.filename || item.file?.name || item.attachmentName || undefined,
    fileSize: sizeVal,
    fileUrl: item.fileUrl || item.url || item.downloadUrl || undefined,
    isPublished: item.published ?? item.isPublished ?? false,
  };
};

/**
 * Fetch guidelines from GET /api/organizer/guidelines
 */
export const getOrgGuidelines = async (): Promise<OrgGuidelineItem[]> => {
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
    return list.map(normalizeGuideline);
  } catch (error) {
    console.warn('[orgGuidelinessApi] Failed to fetch guidelines from backend:', error);
    return [];
  }
};

/**
 * Create a guideline with an optional PDF or DOCX file via POST /api/organizer/guidelines/with-file
 * Uses fileUpload from apiClient with multipart/form-data
 */
export const createGuidelineWithFile = async (
  input: GuidelineInputDto,
  file?: File | null
): Promise<OrgGuidelineItem> => {
  const formData = new FormData();

  const inputPayload = {
    title: input.title,
    content: input.content || input.description || '',
    published: input.published ?? input.isPublished ?? true,
  };

  const inputBlob = new Blob([JSON.stringify(inputPayload)], {
    type: 'application/json',
  });
  formData.append('input', inputBlob);

  if (file) {
    formData.append('file', file);
  }

  const res = await fileUpload(
    `${ORGANIZER_GUIDELINES_ENDPOINT}/with-file`,
    formData
  );

  return normalizeGuideline(res);
};

/**
 * Update an existing guideline
 */
export const updateOrgGuideline = async (
  id: string,
  input: GuidelineInputDto,
  file?: File | null
): Promise<OrgGuidelineItem> => {
  const inputPayload = {
    title: input.title,
    content: input.content || input.description || '',
    published: input.published ?? input.isPublished ?? true,
  };

  if (file) {
    const formData = new FormData();
    const inputBlob = new Blob([JSON.stringify(inputPayload)], {
      type: 'application/json',
    });
    formData.append('input', inputBlob);
    formData.append('file', file);

    try {
      const res = await PutfileUpload(
        `${ORGANIZER_GUIDELINES_ENDPOINT}/${id}`,
        formData
      );
      return normalizeGuideline(res);
    } catch {
      const res = await fileUpload(
        `${ORGANIZER_GUIDELINES_ENDPOINT}/${id}`,
        formData
      );
      return normalizeGuideline(res);
    }
  }

  const res = await PutAPIRequest({
    url: `${ORGANIZER_GUIDELINES_ENDPOINT}/${id}`,
    data: inputPayload,
  });

  return normalizeGuideline(res);
};

/**
 * Delete a guideline via DELETE /api/organizer/guidelines/{id}
 */
export const deleteOrgGuideline = async (id: string): Promise<any> => {
  return DeleteAPIRequest({
    url: `${ORGANIZER_GUIDELINES_ENDPOINT}/${id}`,
  });
};

/**
 * Toggle published state of a guideline
 */
export const toggleGuidelinePublish = async (
  id: string,
  isPublished: boolean
): Promise<any> => {
  try {
    return await PutAPIRequest({
      url: `${ORGANIZER_GUIDELINES_ENDPOINT}/${id}`,
      data: { isPublished, published: isPublished },
    });
  } catch {
    return await PatchAPIRequest({
      url: `${ORGANIZER_GUIDELINES_ENDPOINT}/${id}`,
      data: { isPublished, published: isPublished },
    });
  }
};
