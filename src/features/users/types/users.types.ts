export type UserRole = 'EMPLOYEE' | 'ORGANIZER' | 'ADMIN' | string;

export interface UserItem {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  department?: string;
  designation?: string;
  isCurrentUser?: boolean;
}

export interface GetOrganizerUsersParams {
  q?: string;
  role?: string;
  page?: number;
  size?: number;
}

export interface OrganizerUsersResponse {
  content: UserItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

