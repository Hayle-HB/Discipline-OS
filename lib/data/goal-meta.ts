import type { GoalCategory, GoalPriority } from "@/lib/data/types";

export const GOAL_CATEGORIES: Array<{ id: GoalCategory; label: string }> = [
  { id: "career", label: "Career" },
  { id: "health", label: "Health" },
  { id: "finance", label: "Finance" },
  { id: "education", label: "Education" },
  { id: "personal", label: "Personal" },
  { id: "other", label: "Other" },
];

export const GOAL_PRIORITIES: Array<{ id: GoalPriority; label: string }> = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export function formatGoalCategory(category: GoalCategory): string {
  return GOAL_CATEGORIES.find((item) => item.id === category)?.label ?? category;
}

export function formatGoalDeadline(deadline?: string | null): string | null {
  if (!deadline) return null;
  const date = new Date(`${deadline.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDaysRemaining(days?: number | null): string | null {
  if (days === null || days === undefined) return null;
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export function goalCategoryColor(category: GoalCategory): string {
  switch (category) {
    case "career":
      return "bg-blue-500/15 text-blue-300";
    case "health":
      return "bg-emerald-500/15 text-emerald-300";
    case "finance":
      return "bg-amber-500/15 text-amber-300";
    case "education":
      return "bg-violet-500/15 text-violet-300";
    case "personal":
      return "bg-rose-500/15 text-rose-300";
    default:
      return "bg-secondary text-muted-foreground";
  }
}
