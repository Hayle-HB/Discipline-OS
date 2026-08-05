import { getDataProvider } from "@/lib/data";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOrError = requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await params;
  const habit = getDataProvider().toggleHabit(userIdOrError, id);

  if (!habit) {
    return apiError("Habit not found.", 404, "NOT_FOUND");
  }

  return apiSuccess(habit);
}
