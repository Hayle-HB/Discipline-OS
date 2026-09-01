import { API_CONFIG } from "@/lib/api/config";
import { apiClient } from "@/lib/api/client";
import { getStoredToken } from "@/lib/api/auth";
import type {
  CreateGoalPayload,
  CreateGoalTaskPayload,
  GoalDetail,
  GoalSummary,
  GoalTask,
  UpdateGoalPayload,
  UpdateGoalTaskPayload,
} from "@/lib/data/types";

const { goals: goalRoutes } = API_CONFIG.routes;

function authHeaders() {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export async function listGoals(): Promise<GoalSummary[]> {
  return apiClient<GoalSummary[]>(goalRoutes.list, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getGoal(id: string): Promise<GoalDetail> {
  return apiClient<GoalDetail>(goalRoutes.byId(id), {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function createGoal(payload: CreateGoalPayload): Promise<GoalDetail> {
  return apiClient<GoalDetail>(goalRoutes.list, {
    method: "POST",
    headers: authHeaders(),
    body: payload,
  });
}

export async function updateGoal(
  id: string,
  payload: UpdateGoalPayload
): Promise<GoalDetail> {
  return apiClient<GoalDetail>(goalRoutes.byId(id), {
    method: "PATCH",
    headers: authHeaders(),
    body: payload,
  });
}

export async function deleteGoal(id: string): Promise<void> {
  return apiClient<void>(goalRoutes.byId(id), {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function createGoalTask(
  goalId: string,
  payload: CreateGoalTaskPayload
): Promise<GoalTask> {
  return apiClient<GoalTask>(goalRoutes.tasks(goalId), {
    method: "POST",
    headers: authHeaders(),
    body: payload,
  });
}

export async function updateGoalTask(
  goalId: string,
  taskId: string,
  payload: UpdateGoalTaskPayload
): Promise<GoalTask> {
  return apiClient<GoalTask>(goalRoutes.taskById(goalId, taskId), {
    method: "PATCH",
    headers: authHeaders(),
    body: payload,
  });
}

export async function deleteGoalTask(goalId: string, taskId: string): Promise<void> {
  return apiClient<void>(goalRoutes.taskById(goalId, taskId), {
    method: "DELETE",
    headers: authHeaders(),
  });
}
