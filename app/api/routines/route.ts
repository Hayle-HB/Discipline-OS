import { getDataProvider } from "@/lib/data";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const userIdOrError = requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  return apiSuccess(getDataProvider().getRoutines(userIdOrError));
}

export async function PATCH(request: Request) {
  const userIdOrError = requireUserId(request);
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
