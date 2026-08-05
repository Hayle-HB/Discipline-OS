/**
 * Central API configuration.
 *
 * To switch to a real backend later, update `baseUrl` and `routes` below
 * (or override via environment variables).
 */
export const API_CONFIG = {
  /** Empty string = same origin (Next.js /api routes). Set to your backend URL when ready. */
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "",

  routes: {
    auth: {
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      register: "/api/auth/register",
      me: "/api/auth/me",
      forgotPassword: "/api/auth/forgot-password",
      socialLogin: "/api/auth/social",
    },
    tasks: {
      list: "/api/tasks",
      byId: (id: string) => `/api/tasks/${id}`,
    },
    commitments: {
      list: "/api/tasks",
      byId: (id: string) => `/api/tasks/${id}`,
    },
    habits: {
      list: "/api/habits",
      byId: (id: string) => `/api/habits/${id}`,
    },
    analytics: {
      overview: "/api/analytics",
    },
    routines: {
      list: "/api/routines",
    },
  },
} as const;

export type ApiRoutes = typeof API_CONFIG.routes;
