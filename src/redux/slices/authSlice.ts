import { createSlice, type PayloadAction, type Middleware } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  department?: string | null;
  designation?: string | null;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  error: any;
}

const initialState: AuthState = {
  user: null,
  isAuth: false,
  loading: false,
  error: null,
};

export const authMiddleware =
  (navigate?: (path: string) => void): Middleware =>
  (store) =>
  (next) =>
  (action: any) => {
    if (action?.type === 'API_ERROR' && action?.payload?.status === 401) {
      store.dispatch(logout());
      if (navigate && typeof navigate === 'function') {
        navigate('/login');
      } else if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return next(action);
  };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.isAuth = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.isAuth = false;
      state.user = null;
      state.error = action.payload;
      Cookies.remove('accessToken');
      Cookies.remove('userId');
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
        } catch {
          // ignore
        }
      }
      Cookies.remove('accessToken');
      Cookies.remove('userId');
      return initialState;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export const logoutAsync = logout;
export default authSlice.reducer;
