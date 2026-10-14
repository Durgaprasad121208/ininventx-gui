export interface OfficialDocument {
  id: string;
  title: string;
  description: string;
  version: string;
  date: string;
  fileSize: string;
  downloadUrl?: string;
  fileType: 'pdf' | 'doc' | 'checklist';
}

export interface GuidelineSection {
  title: string;
  description?: string;
  items?: string[];
}
