export interface OrgGuidelineItem {
  id: string;
  title: string;
  description: string;
  version: string;
  publishDate: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  isPublished: boolean;
}

export interface GuidelineInputDto {
  title: string;
  content: string;
  published: boolean;
  description?: string;
  isPublished?: boolean;
  version?: string;
  publishDate?: string;
  sequenceOrder?: number;
}

export interface GuidelineFormData {
  title: string;
  description: string;
  version: string;
  publishDate: string;
  isPublished: boolean;
  fileName?: string;
  fileSize?: string;
  file?: File;
}
