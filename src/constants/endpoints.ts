/**
 * Centralized API Endpoints
 * In Next.js, client requests target '/api/...' (same-origin).
 * Next.js rewrites in next.config.ts automatically proxy these to
 * http://localhost:8080/api/... server-side, eliminating browser CORS errors completely.
 */
export const BASE_URL = '/api';

// Auth Endpoints
export const AUTH_LOGIN = `${BASE_URL}/auth/login`;
export const AUTH_REGISTER = `${BASE_URL}/auth/register`;
export const AUTH_LOGIN_ENDPOINT = AUTH_LOGIN;
export const AUTH_REGISTER_ENDPOINT = AUTH_REGISTER;
export const AUTH_LOGOUT_ENDPOINT = `${BASE_URL}/auth/logout`;
export const AUTH_ME_ENDPOINT = `${BASE_URL}/auth/me`;

// Users Management Endpoints
export const USERS_CONTROLLER = `${BASE_URL}/users`;

// Ideas Endpoints
export const IDEAS_CONTROLLER = `${BASE_URL}/ideas`;

// Announcements Endpoints
export const ANNOUNCEMENTS_CONTROLLER = `${BASE_URL}/announcements`;

// Guidelines Endpoints
export const GUIDELINES_CONTROLLER = `${BASE_URL}/guidelines`;

// File Upload & Export Endpoints
export const FILE_UPLOAD_ENDPOINT = `${BASE_URL}/files/upload`;
export const FILE_DOWNLOAD_ENDPOINT = `${BASE_URL}/files/download`;
