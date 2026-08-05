import { API_CONFIG } from "@/lib/api/config";
import { apiClient } from "@/lib/api/client";
import { getStoredToken } from "@/lib/api/auth";
import type { AnalyticsData, Habit, HabitsData } from "@/lib/api/types";
import type { Routine } from "@/lib/data/types";

const { habits: habitRoutes, analytics: analyticsRoutes, routines: routineRoutes } =
  API_CONFIG.routes;

function authHeaders() {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export async function getHabitsData(): Promise<HabitsData> {
  return apiClient<HabitsData>(habitRoutes.list, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function toggleHabit(id: string): Promise<Habit> {
  return apiClient<Habit>(habitRoutes.byId(id), {
    method: "PATCH",
    headers: authHeaders(),
  });
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  return apiClient<AnalyticsData>(analyticsRoutes.overview, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getRoutines(): Promise<Routine[]> {
  return apiClient<Routine[]>(routineRoutes.list, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function toggleRoutineStep(routineId: string, stepId: string) {
  return apiClient<Routine>(routineRoutes.list, {
    method: "PATCH",
    headers: authHeaders(),
    body: { routineId, stepId },
  });
}
