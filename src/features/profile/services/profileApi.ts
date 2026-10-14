import { UserProfile } from '../types/profile.types';

export const CURRENT_USER_PROFILE: UserProfile = {
  name: 'Priya Nair (Demo)',
  initials: 'PN',
  roleBadge: 'organizer',
  email: 'priya.demo@example.com',
  company: 'Nexsys Process Automations',
  department: 'Innovation Office',
  role: 'Organizer',
  avatarGradient: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
};

export const getUserProfile = async (): Promise<UserProfile> => {
  return CURRENT_USER_PROFILE;
};
