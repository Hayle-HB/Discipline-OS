import { tryProxyBackendRoute } from "@/lib/api/backend";
import { getGoalStore } from "@/lib/data/goal-store";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { CreateGoalPayload } from "@/lib/data/types";

export async function GET(request: Request) {
  const proxied = await tryProxyBackendRoute("/api/goals", request, { method: "GET" });
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  return apiSuccess(getGoalStore().listGoals(userIdOrError));
}

export async function POST(request: Request) {
  const bodyText = await request.text();

  const proxied = await tryProxyBackendRoute("/api/goals", request, {
    method: "POST",
    body: bodyText,
    headers: { "Content-Type": "application/json" },
  });
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  try {
    const body = (bodyText ? JSON.parse(bodyText) : {}) as CreateGoalPayload;
    if (!body.title?.trim()) {
      return apiError("Goal title is required.", 400, "VALIDATION_ERROR");
    }
    const goal = getGoalStore().createGoal(userIdOrError, body);
    return apiSuccess(goal, "Goal created", 201);
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}
