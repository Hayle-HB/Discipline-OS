import { computeDashboardStats } from "@/lib/data/compute";
import { getDataProvider } from "@/lib/data";
import { groupTasksByPeriod } from "@/lib/data/task-periods";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { CreateTaskPayload } from "@/lib/data/types";

export async function GET(request: Request) {
  const userIdOrError = requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const provider = getDataProvider();
  const tasks = provider.getTasks(userIdOrError);
  const stats = computeDashboardStats(tasks);
  const analytics = provider.getAnalytics(userIdOrError);

  return apiSuccess({
    tasks,
    tasksByPeriod: groupTasksByPeriod(tasks),
    stats,
    weeklyActivity: analytics.weeklyActivity,
    routines: provider.getRoutines(userIdOrError),
  });
}

export async function POST(request: Request) {
  const userIdOrError = requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  try {
    const body = (await request.json()) as CreateTaskPayload;

    if (!body.label?.trim()) {
      return apiError("Task label is required.", 400, "VALIDATION_ERROR");
    }

    if (!body.period) {
      body.period = "daily";
    }

    if (!["daily", "weekly", "monthly", "yearly"].includes(body.period)) {
      return apiError(
        "Valid period is required (daily, weekly, monthly, yearly).",
        400,
        "VALIDATION_ERROR"
      );
    }

    const task = getDataProvider().addTask(userIdOrError, {
      label: body.label,
      period: body.period,
      category: body.category,
      description: body.description,
      priority: body.priority,
      preferredTime: body.preferredTime,
      estimatedMinutes: body.estimatedMinutes,
    });
    return apiSuccess(task, "Task added");
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}
