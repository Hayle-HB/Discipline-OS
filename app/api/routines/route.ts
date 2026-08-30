import { proxyBackendRoute } from "@/lib/api/backend";
import { getDataProvider } from "@/lib/data";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const proxied = await proxyBackendRoute("/api/routines", request, { method: "GET" });
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  return apiSuccess(getDataProvider().getRoutines(userIdOrError));
}

export async function PATCH(request: Request) {
  const proxied = await proxyBackendRoute("/api/routines", request);
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  try {
    const body = (await request.json()) as {
      routineId: string;
      stepId: string;
    };

    if (!body.routineId || !body.stepId) {
      return apiError("routineId and stepId are required.", 400, "VALIDATION_ERROR");
    }

    const routine = getDataProvider().toggleRoutineStep(
      userIdOrError,
      body.routineId,
      body.stepId
    );

    if (!routine) {
      return apiError("Routine or step not found.", 404, "NOT_FOUND");
    }

    return apiSuccess(routine);
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}
