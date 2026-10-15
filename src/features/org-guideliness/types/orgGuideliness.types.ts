export interface OrgGuidelineItem {
  id: string;
  title: string;
  description: string;
  version: string;
  publishDate: string;
  fileName?: string;
  fileSize?: string;
  isPublished: boolean;
}

export interface GuidelineFormData {
  title: string;
  description: string;
  version: string;
  publishDate: string;
  isPublished: boolean;
  fileName?: string;
  fileSize?: string;
}
