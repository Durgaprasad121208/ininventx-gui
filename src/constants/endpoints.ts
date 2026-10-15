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

// Dashboard Endpoints
export const DASHBOARD_ENDPOINT = `${BASE_URL}/dashboard`;

// Ideas Endpoints
export const IDEAS_ENDPOINT = `${BASE_URL}/ideas`;

// Users Endpoints
export const USERS_CONTROLLER = `${BASE_URL}/users`;

// Announcements Endpoints
export const ANNOUNCEMENTS_ENDPOINT = `${BASE_URL}/announcements`;

// Organizer Endpoints
export const ORGANIZER_IDEAS_ENDPOINT = `${BASE_URL}/organizer/ideas`;
export const ORGANIZER_ANNOUNCEMENTS_ENDPOINT = `${BASE_URL}/organizer/announcements`;
export const ORGANIZER_USERS_ENDPOINT = `${BASE_URL}/organizer/users`;
export const ORGANIZER_OVERVIEW_ENDPOINT = `${BASE_URL}/organizer/overview`;
export const ORGANIZER_GUIDELINES_ENDPOINT = `${BASE_URL}/organizer/guidelines`;

