import type { Task } from "@/lib/data/types";

export function computeDashboardStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((item) => item.completed).length;
  const bestStreak =
    tasks.length > 0 ? Math.max(...tasks.map((item) => item.streak)) : 0;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    completed,
    total,
    bestStreak,
    score,
    progress: score,
  };
}

export function syncRoutineCompletion(
  steps: { completed: boolean }[]
): boolean {
  return steps.length > 0 && steps.every((step) => step.completed);
}

/** @deprecated Use computeDashboardStats with Task[] */
export function computeStatsFromCommitments(tasks: Task[]) {
  return computeDashboardStats(tasks);
}
