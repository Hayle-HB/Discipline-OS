"use client";

import { Target } from "lucide-react";

import {
  formatDaysRemaining,
  formatGoalCategory,
  formatGoalDeadline,
  goalCategoryColor,
} from "@/lib/data/goal-meta";
import type { SharedGoal } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface SharedGoalsSectionProps {
  goals: SharedGoal[];
}

export function SharedGoalsSection({ goals }: SharedGoalsSectionProps) {
  if (goals.length === 0) {
    return (
      <div className="py-10 text-center">
        <Target className="mx-auto size-8 text-muted-foreground/50" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-foreground">No goals shared</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This person hasn&apos;t added any goals yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <article
          key={goal.id}
          className="rounded-2xl border border-border/60 bg-background/30 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">{goal.title}</h3>
              {goal.description && (
                <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
              )}
            </div>
            <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold tabular-nums">
              {goal.progressPercent}%
            </div>
          </div>

          {goal.why && (
            <p className="mt-3 rounded-xl bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Why: </span>
              {goal.why}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 font-medium",
                goalCategoryColor(goal.category)
              )}
            >
              {formatGoalCategory(goal.category)}
            </span>
            {formatGoalDeadline(goal.deadline) && (
              <span>Due {formatGoalDeadline(goal.deadline)}</span>
            )}
            {formatDaysRemaining(goal.daysRemaining) && (
              <span>{formatDaysRemaining(goal.daysRemaining)}</span>
            )}
            <span>
              {goal.tasksCompleted}/{goal.tasksTotal} tasks done
            </span>
          </div>

          {goal.tasks.length > 0 && (
            <ul className="mt-4 space-y-2">
              {goal.tasks.map((task) => (
                <li
                  key={task.id}
                  className={cn(
                    "rounded-lg border border-border/50 px-3 py-2 text-sm",
                    task.completed && "opacity-70"
                  )}
                >
                  <p className={cn("font-medium", task.completed && "line-through")}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
