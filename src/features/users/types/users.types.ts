export type UserRole = 'Employee' | 'Organizer' | 'Admin';

export type UserCompany = 'MANTIX' | 'Nexsys Process Automations' | 'Stability';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  company: UserCompany;
  department: string;
  role: UserRole;
  isCurrentUser?: boolean;
}
