import { computeDashboardStats } from "@/lib/data/compute";
import { getDataProvider } from "@/lib/data";
import { groupTasksByPeriod } from "@/lib/data/task-periods";
import { requireUserId } from "@/lib/api/server-auth";
import { apiSuccess } from "@/lib/api/response";

/** @deprecated Use /api/tasks — kept for backward compatibility */
export async function GET(request: Request) {
  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const provider = getDataProvider();
  const tasks = provider.getTasks(userIdOrError);
  const stats = computeDashboardStats(tasks);
  const analytics = provider.getAnalytics(userIdOrError);

  return apiSuccess({
    tasks,
    tasksByPeriod: groupTasksByPeriod(tasks),
    commitments: tasks,
    stats,
    weeklyActivity: analytics.weeklyActivity,
    routines: provider.getRoutines(userIdOrError),
  });
}

export { POST } from "../tasks/route";
