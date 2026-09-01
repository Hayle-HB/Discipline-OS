export const SHARE_RESOURCES = [
  {
    id: "calendar",
    label: "Calendar",
    description: "See completed and missed days on the heatmap.",
  },
  {
    id: "tasks",
    label: "Daily Tasks",
    description: "Task names and today's completion status.",
  },
  {
    id: "habits",
    label: "Habits",
    description: "Habit consistency across daily, weekly, monthly, and yearly.",
  },
  {
    id: "streak",
    label: "Streak",
    description: "Current streak and best streak.",
  },
  {
    id: "discipline_score",
    label: "Discipline Score",
    description: "Overall completion score and progress.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Charts, trends, and insights.",
  },
  {
    id: "goals",
    label: "Goals",
    description: "Life goals, linked tasks, and progress.",
  },
] as const;

export type ShareResourceId = (typeof SHARE_RESOURCES)[number]["id"];

export const SHARE_EXPIRATION_OPTIONS = [
  { id: "never", label: "Never", days: null },
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
] as const;

export function formatShareResources(
  resources: Array<{ name: string; permission?: string }>
): string {
  const labels = resources.map((resource) => {
    const match = SHARE_RESOURCES.find((item) => item.id === resource.name);
    return match?.label ?? resource.name;
  });
  return labels.join(" · ");
}
