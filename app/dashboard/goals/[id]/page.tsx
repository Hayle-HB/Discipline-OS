"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Loader2, Trash2 } from "lucide-react";

import { DashboardContentLoading } from "@/components/dashboard/DashboardLoading";
import { GoalTasksPanel } from "@/components/goals/GoalTasksPanel";
import { Button } from "@/components/ui/button";
import { deleteGoal, getGoal } from "@/lib/api/goals";
import { ApiError } from "@/lib/api/types";
import {
  formatDaysRemaining,
  formatGoalCategory,
  formatGoalDeadline,
  goalCategoryColor,
} from "@/lib/data/goal-meta";
import type { GoalDetail } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [goal, setGoal] = useState<GoalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoal = useCallback(async () => {
    try {
      setGoal(await getGoal(params.id));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load goal.");
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  async function handleDelete() {
    if (!goal || isDeleting) return;
    if (!window.confirm("Delete this goal and all its tasks?")) return;

    setIsDeleting(true);
    try {
      await deleteGoal(goal.id);
      router.push("/dashboard/goals");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete goal.");
      setIsDeleting(false);
    }
  }

  if (isLoading) return <DashboardContentLoading />;

  if (!goal) {
    return (
      <div className="dashboard-page dashboard-page-narrow">
        <p className="text-sm text-destructive">{error ?? "Goal not found."}</p>
        <Link href="/dashboard/goals" className="mt-4 inline-block text-sm font-medium">
          ← Back to goals
        </Link>
      </div>
    );
  }

  const deadlineLabel = formatGoalDeadline(goal.deadline);
  const daysLabel = formatDaysRemaining(goal.daysRemaining);

  return (
    <div className="dashboard-page dashboard-page-narrow">
      <div className="animate-fade-up">
        <Link
          href="/dashboard/goals"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Goals
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  goalCategoryColor(goal.category)
                )}
              >
                {formatGoalCategory(goal.category)}
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {goal.priority} priority
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {goal.title}
            </h1>
            {goal.description && (
              <p className="mt-2 text-sm text-muted-foreground">{goal.description}</p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px]">
        <section className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Why this matters
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {goal.why || "You can add why this matters when you create a goal — it helps on tough days."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-background/30 px-4 py-3">
              <p className="text-xs text-muted-foreground">Goal progress</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{goal.progressPercent}%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {goal.tasksCompleted} of {goal.tasksTotal} tasks complete
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-500"
                  style={{ width: `${goal.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/30 px-4 py-3">
              <p className="text-xs text-muted-foreground">Timeline</p>
              {deadlineLabel ? (
                <>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
                    <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
                    {deadlineLabel}
                  </p>
                  {daysLabel && (
                    <p
                      className={cn(
                        "mt-2 text-sm font-medium",
                        (goal.daysRemaining ?? 0) < 0
                          ? "text-destructive"
                          : (goal.daysRemaining ?? 0) <= 7
                            ? "text-amber-400"
                            : "text-muted-foreground"
                      )}
                    >
                      {daysLabel}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">No deadline set</p>
              )}
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            At a glance
          </p>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">What am I trying to achieve?</dt>
              <dd className="mt-0.5 font-medium text-foreground">{goal.title}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">What do I need to do?</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {goal.tasksTotal} linked {goal.tasksTotal === 1 ? "task" : "tasks"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">How much progress have I made?</dt>
              <dd className="mt-0.5 font-medium text-foreground">{goal.progressPercent}%</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-6">
        <GoalTasksPanel goal={goal} onGoalChange={setGoal} />
      </div>
    </div>
  );
}
