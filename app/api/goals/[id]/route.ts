import { tryProxyBackendRoute } from "@/lib/api/backend";
import { getGoalStore } from "@/lib/data/goal-store";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { UpdateGoalPayload } from "@/lib/data/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const proxied = await tryProxyBackendRoute(`/api/goals/${id}`, request, { method: "GET" });
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const goal = getGoalStore().getGoal(userIdOrError, id);
  if (!goal) return apiError("Goal not found.", 404, "NOT_FOUND");
  return apiSuccess(goal);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const bodyText = await request.text();
  const proxied = await tryProxyBackendRoute(`/api/goals/${id}`, request, {
    method: "PATCH",
    body: bodyText,
    headers: { "Content-Type": "application/json" },
  });
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  try {
    const body = (bodyText ? JSON.parse(bodyText) : {}) as UpdateGoalPayload;
    const goal = getGoalStore().updateGoal(userIdOrError, id, body);
    if (!goal) return apiError("Goal not found.", 404, "NOT_FOUND");
    return apiSuccess(goal, "Goal updated");
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const proxied = await tryProxyBackendRoute(`/api/goals/${id}`, request, { method: "DELETE" });
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  if (!getGoalStore().deleteGoal(userIdOrError, id)) {
    return apiError("Goal not found.", 404, "NOT_FOUND");
  }
  return apiSuccess(null, "Goal deleted");
}
