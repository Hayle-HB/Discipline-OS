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
    shares: {
      list: "/api/shares",
      incoming: "/api/shares/incoming",
      incomingById: (id: string) => `/api/shares/incoming/${id}`,
      incomingData: (id: string) => `/api/shares/incoming/${id}/data`,
      byId: (id: string) => `/api/shares/${id}`,
      reciprocal: (id: string) => `/api/shares/incoming/${id}/reciprocal`,
      comments: (id: string) => `/api/shares/incoming/${id}/comments`,
      preview: (token: string) => `/api/shares/access/${token}`,
      data: (token: string) => `/api/shares/access/${token}/data`,
    },
    goals: {
      list: "/api/goals",
      byId: (id: string) => `/api/goals/${id}`,
      tasks: (goalId: string) => `/api/goals/${goalId}/tasks`,
      taskById: (goalId: string, taskId: string) =>
        `/api/goals/${goalId}/tasks/${taskId}`,
    },
  },
} as const;

export type ApiRoutes = typeof API_CONFIG.routes;
