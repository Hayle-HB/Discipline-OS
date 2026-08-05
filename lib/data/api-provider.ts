import { assertApiConfig, DATA_CONFIG } from "@/lib/data/config";
import type {
  AnalyticsData,
  Commitment,
  Habit,
  Routine,
  UserRecord,
} from "@/lib/data/types";

/**
 * External API data provider template.
 *
 * When you're ready to connect a real backend:
 * 1. Set DISCIPLINE_OS_DATA_SOURCE=api in .env
 * 2. Set DISCIPLINE_OS_API_KEY and DISCIPLINE_OS_API_URL
 * 3. Implement these functions to match your API
 * 4. Wire them up in lib/data/index.ts getDataProvider()
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  assertApiConfig();

  const response = await fetch(`${DATA_CONFIG.apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      [DATA_CONFIG.apiKeyHeader]: DATA_CONFIG.apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

/** Template — implement and connect in getDataProvider() */
export const externalApiTemplate = {
  authenticateUser(email: string, password: string) {
    return apiFetch<UserRecord | null>("/users/authenticate", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getUserById(id: string) {
    return apiFetch<UserRecord>(`/users/${id}`);
  },

  getCommitments(userId: string) {
    return apiFetch<Commitment[]>(`/users/${userId}/commitments`);
  },

  createCommitment(userId: string, label: string, category?: string) {
    return apiFetch<Commitment>(`/users/${userId}/commitments`, {
      method: "POST",
      body: JSON.stringify({ label, category }),
    });
  },

  toggleCommitment(userId: string, id: string) {
    return apiFetch<Commitment>(
      `/users/${userId}/commitments/${id}/toggle`,
      { method: "PATCH" }
    );
  },

  deleteCommitment(userId: string, id: string) {
    return apiFetch<boolean>(`/users/${userId}/commitments/${id}`, {
      method: "DELETE",
    });
  },

  getHabits(userId: string) {
    return apiFetch<Habit[]>(`/users/${userId}/habits`);
  },

  toggleHabit(userId: string, id: string) {
    return apiFetch<Habit>(`/users/${userId}/habits/${id}/toggle`, {
      method: "PATCH",
    });
  },

  getRoutines(userId: string) {
    return apiFetch<Routine[]>(`/users/${userId}/routines`);
  },

  toggleRoutineStep(userId: string, routineId: string, stepId: string) {
    return apiFetch<Routine>(
      `/users/${userId}/routines/${routineId}/steps/${stepId}/toggle`,
      { method: "PATCH" }
    );
  },

  getAnalytics(userId: string) {
    return apiFetch<AnalyticsData>(`/users/${userId}/analytics`);
  },
};
