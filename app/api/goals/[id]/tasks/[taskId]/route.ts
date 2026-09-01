import { tryProxyBackendRoute } from "@/lib/api/backend";
import { getGoalStore } from "@/lib/data/goal-store";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { UpdateGoalTaskPayload } from "@/lib/data/types";

type RouteContext = { params: Promise<{ id: string; taskId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id, taskId } = await context.params;
  const bodyText = await request.text();
  const proxied = await tryProxyBackendRoute(
    `/api/goals/${id}/tasks/${taskId}`,
    request,
    {
      method: "PATCH",
      body: bodyText,
      headers: { "Content-Type": "application/json" },
    }
  );
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  try {
    const body = (bodyText ? JSON.parse(bodyText) : {}) as UpdateGoalTaskPayload;
    const task = getGoalStore().updateTask(userIdOrError, id, taskId, body);
    if (!task) return apiError("Task not found.", 404, "NOT_FOUND");
    return apiSuccess(task, "Task updated");
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id, taskId } = await context.params;
  const proxied = await tryProxyBackendRoute(
    `/api/goals/${id}/tasks/${taskId}`,
    request,
    { method: "DELETE" }
  );
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  if (!getGoalStore().deleteTask(userIdOrError, id, taskId)) {
    return apiError("Task not found.", 404, "NOT_FOUND");
  }
  return apiSuccess(null, "Task deleted");
}
