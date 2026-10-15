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
  file?: File;
}

export interface TeamMember {
  name: string;
  email: string;
  department: string;
  roleInTeam: string;
}

export interface IdeaCreateRequest {
  title: string;
  summary: string;
  description: string;
  category: string;
  targetCustomer: string;
  businessImpact: string;
  teamMembers: TeamMember[];
}

export interface IdeaCreateResponse {
  id: string;
  title?: string;
  summary?: string;
  description?: string;
  category?: string;
  [key: string]: any;
}

export interface IdeaSubmission {
  id?: string;
  title: string;
  summary?: string;
  description: string;
  problemStatement?: string;
  expectedBusinessValue?: string;
  primaryCategory: string;
  teamName?: string;
  teamMembers?: TeamMember[];
  posterName?: string;
  posterUrl?: string;
  attachments?: AttachmentFile[];
  status: 'Draft' | 'Submitted';
  createdAt: string;
}
