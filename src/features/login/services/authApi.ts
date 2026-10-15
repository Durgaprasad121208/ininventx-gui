import { PostAPIRequest } from '@/api-client/apiClient';
import { AUTH_LOGIN, AUTH_REGISTER } from '@/constants/endpoints';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'EMPLOYEE' | 'ORGANIZER' | 'ORGANISER' | string;
  department?: string;
  designation?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

export const loginUser = async (data: LoginParams): Promise<LoginResponse> => {
  return PostAPIRequest({
    url: AUTH_LOGIN,
    data,
  }) as Promise<LoginResponse>;
};

export const registerUser = async (data: RegisterParams): Promise<any> => {
  return PostAPIRequest({
    url: AUTH_REGISTER,
    data,
  });
};
