import { GetAPIRequest, PutAPIRequest } from '@/api-client/apiClient';
import { USERS_CONTROLLER } from '@/constants/endpoints';
import type { UserItem, UserRole } from '../types/users.types';

export const mockUsers: UserItem[] = [
  {
    id: 'user-1',
    name: 'Aarav Mehta (Demo)',
    email: 'aarav.demo@example.com',
    company: 'MANTIX',
    department: 'OT Support',
    role: 'Employee',
    isCurrentUser: false,
  },
  {
    id: 'user-2',
    name: 'Priya Nair (Demo)',
    email: 'priya.demo@example.com',
    company: 'Nexsys Process Automations',
    department: 'Innovation Office',
    role: 'Organizer',
    isCurrentUser: true, // Current logged-in organizer
  },
  {
    id: 'user-3',
    name: 'Rohan Iyer (Demo)',
    email: 'rohan.demo@example.com',
    company: 'Nexsys Process Automations',
    department: 'Control Systems',
    role: 'Employee',
    isCurrentUser: false,
  },
  {
    id: 'user-4',
    name: 'Sara Thomas (Demo)',
    email: 'sara.demo@example.com',
    company: 'Stability',
    department: 'Customer Success',
    role: 'Employee',
    isCurrentUser: false,
  },
  {
    id: 'user-5',
    name: 'Kabir Rao (Demo)',
    email: 'kabir.demo@example.com',
    company: 'MANTIX',
    department: 'Software Engineering',
    role: 'Employee',
    isCurrentUser: false,
  },
  {
    id: 'user-6',
    name: 'Ananya Sharma (Demo)',
    email: 'ananya.demo@example.com',
    company: 'Stability',
    department: 'Product Design',
    role: 'Employee',
    isCurrentUser: false,
  },
  {
    id: 'user-7',
    name: 'Vikram Patel (Demo)',
    email: 'vikram.demo@example.com',
    company: 'MANTIX',
    department: 'Industrial IoT',
    role: 'Employee',
    isCurrentUser: false,
  },
  {
    id: 'user-8',
    name: 'Neha Kulkarni (Demo)',
    email: 'neha.demo@example.com',
    company: 'Nexsys Process Automations',
    department: 'Robotics & AI',
    role: 'Employee',
    isCurrentUser: false,
  },
];

export const getUsers = async (): Promise<UserItem[]> => {
  try {
    const res = await GetAPIRequest({ url: USERS_CONTROLLER });
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [...mockUsers];
  } catch (error) {
    console.warn('[usersApi] Backend unavailable, using mock users:', error);
    return [...mockUsers];
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
  try {
    await PutAPIRequest({
      url: `${USERS_CONTROLLER}/${userId}`,
      data: { role: newRole },
    });
    return true;
  } catch (error) {
    console.warn('[usersApi] Update user role fallback:', error);
    return true;
  }
};
