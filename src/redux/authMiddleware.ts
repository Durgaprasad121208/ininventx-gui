import type { Middleware } from '@reduxjs/toolkit';

export const createAuthMiddleware =
  (navigate?: (path: string) => void): Middleware =>
  (store) =>
  (next) =>
  (action: any) => {
    // Handle 401 errors - use action type instead of imported action creator
    if (action?.type === 'API_ERROR' && action?.payload?.status === 401) {
      // Dispatch logout using action type to avoid circular imports
      store.dispatch({ type: 'auth/logout' });

      if (navigate && typeof navigate === 'function') {
        navigate('/login');
      } else if (typeof window !== 'undefined') {
        // Fallback if navigate is not available
        window.location.href = '/login';
      }
    }

    return next(action);
  };

export default createAuthMiddleware;
