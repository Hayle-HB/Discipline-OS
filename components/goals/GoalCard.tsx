"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, Target } from "lucide-react";

import {
  formatDaysRemaining,
  formatGoalCategory,
  formatGoalDeadline,
  goalCategoryColor,
} from "@/lib/data/goal-meta";
import type { GoalSummary } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  goal: GoalSummary;
}

export function GoalCard({ goal }: GoalCardProps) {
  const deadlineLabel = formatGoalDeadline(goal.deadline);
  const daysLabel = formatDaysRemaining(goal.daysRemaining);

  return (
    <Link
      href={`/dashboard/goals/${goal.id}`}
      className="group block rounded-2xl border border-border/60 bg-card/50 p-4 transition-colors hover:border-foreground/20 hover:bg-card/80 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex size-14 shrink-0 items-center justify-center">
          <svg className="size-14 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-secondary"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-foreground transition-all duration-500"
              strokeWidth="3"
              strokeDasharray={`${goal.progressPercent} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-semibold tabular-nums">
            {goal.progressPercent}%
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground group-hover:underline">
                {goal.title}
              </h3>
              {goal.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {goal.description}
                </p>
              )}
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                goalCategoryColor(goal.category)
              )}
            >
              {formatGoalCategory(goal.category)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="size-3" aria-hidden="true" />
              {goal.tasksCompleted}/{goal.tasksTotal} tasks
            </span>
            {deadlineLabel && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3" aria-hidden="true" />
                {deadlineLabel}
              </span>
            )}
            {daysLabel && (
              <span
                className={cn(
                  "text-xs font-medium",
                  (goal.daysRemaining ?? 0) < 0
                    ? "text-destructive"
                    : (goal.daysRemaining ?? 0) <= 7
                      ? "text-amber-400"
                      : "text-muted-foreground"
                )}
              >
                {daysLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
