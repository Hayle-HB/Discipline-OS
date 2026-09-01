import { tryProxyBackendRoute } from "@/lib/api/backend";
import { getGoalStore } from "@/lib/data/goal-store";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { CreateGoalTaskPayload } from "@/lib/data/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const bodyText = await request.text();
  const proxied = await tryProxyBackendRoute(`/api/goals/${id}/tasks`, request, {
    method: "POST",
    body: bodyText,
    headers: { "Content-Type": "application/json" },
  });
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  try {
    const body = (bodyText ? JSON.parse(bodyText) : {}) as CreateGoalTaskPayload;
    if (!body.title?.trim()) {
      return apiError("Task title is required.", 400, "VALIDATION_ERROR");
    }
    const task = getGoalStore().createTask(userIdOrError, id, body);
    if (!task) return apiError("Goal not found.", 404, "NOT_FOUND");
    return apiSuccess(task, "Task added", 201);
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}
