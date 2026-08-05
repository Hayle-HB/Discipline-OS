import { getDataProvider } from "@/lib/data";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type {
  RecordTaskCompletionPayload,
  UpdateTaskPayload,
} from "@/lib/data/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOrError = requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await params;

  try {
    const body = (await request.json().catch(() => ({}))) as RecordTaskCompletionPayload;
    const status = body.status ?? "done";

    if (status !== "done" && status !== "missed") {
      return apiError("Status must be 'done' or 'missed'.", 400, "VALIDATION_ERROR");
    }

    const task = getDataProvider().recordTaskCompletion(
      userIdOrError,
      id,
      status,
      body.date
    );

    if (!task) {
      return apiError("Task not found.", 404, "NOT_FOUND");
    }

    return apiSuccess(task);
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOrError = requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await params;

  try {
    const body = (await request.json()) as UpdateTaskPayload;

    if (body.label !== undefined && !body.label.trim()) {
      return apiError("Task label cannot be empty.", 400, "VALIDATION_ERROR");
    }

    if (
      body.period !== undefined &&
      !["daily", "weekly", "monthly", "yearly"].includes(body.period)
    ) {
      return apiError("Invalid period.", 400, "VALIDATION_ERROR");
    }

    const task = getDataProvider().updateTask(userIdOrError, id, body);

    if (!task) {
      return apiError("Task not found.", 404, "NOT_FOUND");
    }

    return apiSuccess(task, "Task updated");
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userIdOrError = requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await params;
  const deleted = getDataProvider().deleteTask(userIdOrError, id);

  if (!deleted) {
    return apiError("Task not found.", 404, "NOT_FOUND");
  }

  return apiSuccess(null, "Task deleted");
}
