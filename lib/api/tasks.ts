import { API_CONFIG } from "@/lib/api/config";
import { apiClient } from "@/lib/api/client";
import { getStoredToken } from "@/lib/api/auth";
import type { DashboardData } from "@/lib/data/types";
import type { CreateTaskPayload, Task, TaskDayStatus, TaskPeriod } from "@/lib/data/types";

const { tasks: taskRoutes } = API_CONFIG.routes;

function authHeaders() {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export async function getDashboardData(): Promise<DashboardData> {
  return apiClient<DashboardData>(taskRoutes.list, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  return apiClient<Task>(taskRoutes.list, {
    method: "POST",
    headers: authHeaders(),
    body: payload,
  });
}

export async function recordTaskCompletion(
  id: string,
  status: TaskDayStatus,
  date?: string
): Promise<Task> {
  return apiClient<Task>(taskRoutes.byId(id), {
    method: "PATCH",
    headers: authHeaders(),
    body: { status, date },
  });
}

/** @deprecated Use recordTaskCompletion */
export async function toggleTask(id: string): Promise<Task> {
  return recordTaskCompletion(id, "done");
}

export async function updateTask(
  id: string,
  payload: import("@/lib/data/types").UpdateTaskPayload
): Promise<Task> {
  return apiClient<Task>(taskRoutes.byId(id), {
    method: "PUT",
    headers: authHeaders(),
    body: payload,
  });
}

export async function deleteTask(id: string): Promise<void> {
  return apiClient<void>(taskRoutes.byId(id), {
    method: "DELETE",
    headers: authHeaders(),
  });
}

/** Convenience alias — adds a task to a specific period */
export async function addTaskToPeriod(
  label: string,
  period: TaskPeriod
): Promise<Task> {
  return createTask({ label, period });
}
