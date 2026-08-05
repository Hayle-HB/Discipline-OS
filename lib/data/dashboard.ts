import { computeDashboardStats } from "@/lib/data/compute";
import { groupTasksByPeriod } from "@/lib/data/task-periods";
import type { DashboardData, Task } from "@/lib/data/types";

/** Merge a single updated task into dashboard state (shared by all dashboard pages) */
export function withUpdatedTasks(
  prev: DashboardData,
  tasks: Task[]
): DashboardData {
  const stats = computeDashboardStats(tasks);
  return {
    ...prev,
    tasks,
    tasksByPeriod: groupTasksByPeriod(tasks),
    stats,
    weeklyActivity: prev.weeklyActivity.map((v, i) =>
      i === prev.weeklyActivity.length - 1 ? stats.progress : v
    ),
  };
}

export function replaceTaskInList(tasks: Task[], updated: Task): Task[] {
  return tasks.map((t) => (t.id === updated.id ? updated : t));
}
