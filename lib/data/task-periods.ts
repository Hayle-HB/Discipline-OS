import type { Task } from "@/lib/data/types";
import {
  Calendar,
  CalendarDays,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";

export type TaskPeriod = Task["period"];

export const TASK_PERIODS = [
  {
    id: "daily" as const,
    label: "Daily Tasks",
    description: "Done every day — build consistency through repetition.",
    accent: "border-sky-500/30 bg-sky-500/5",
  },
  {
    id: "weekly" as const,
    label: "Weekly Tasks",
    description: "Due this week — complete before Sunday.",
    accent: "border-violet-500/30 bg-violet-500/5",
  },
  {
    id: "monthly" as const,
    label: "Monthly Tasks",
    description: "Due this month — bigger goals, steady progress.",
    accent: "border-amber-500/30 bg-amber-500/5",
  },
  {
    id: "yearly" as const,
    label: "Yearly Tasks",
    description: "Due this year — long-term commitments that matter.",
    accent: "border-emerald-500/30 bg-emerald-500/5",
  },
] as const;

export const PERIOD_THEME: Record<
  TaskPeriod,
  {
    icon: LucideIcon;
    ring: string;
    dot: string;
    badge: string;
    gradient: string;
  }
> = {
  daily: {
    icon: Sun,
    ring: "ring-sky-500/20",
    dot: "bg-sky-400",
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    gradient: "from-sky-500/[0.08] to-transparent",
  },
  weekly: {
    icon: CalendarDays,
    ring: "ring-violet-500/20",
    dot: "bg-violet-400",
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    gradient: "from-violet-500/[0.08] to-transparent",
  },
  monthly: {
    icon: Calendar,
    ring: "ring-amber-500/20",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    gradient: "from-amber-500/[0.08] to-transparent",
  },
  yearly: {
    icon: Target,
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    gradient: "from-emerald-500/[0.08] to-transparent",
  },
};

export function groupTasksByPeriod(tasks: Task[]) {
  return {
    daily: tasks.filter((t) => t.period === "daily"),
    weekly: tasks.filter((t) => t.period === "weekly"),
    monthly: tasks.filter((t) => t.period === "monthly"),
    yearly: tasks.filter((t) => t.period === "yearly"),
  };
}

export type TasksByPeriod = ReturnType<typeof groupTasksByPeriod>;
