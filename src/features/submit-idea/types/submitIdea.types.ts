export interface CategoryOption {
  id: string;
  title: string;
  description: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface IdeaSubmission {
  id?: string;
  title: string;
  description: string;
  problemStatement?: string;
  expectedBusinessValue?: string;
  primaryCategory: string;
  posterName?: string;
  posterUrl?: string;
  attachments?: AttachmentFile[];
  status: 'Draft' | 'Submitted';
  createdAt: string;
}
