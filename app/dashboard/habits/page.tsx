"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, TrendingUp } from "lucide-react";

import { DashboardContentLoading } from "@/components/dashboard/DashboardLoading";
import { TaskActionRow } from "@/components/dashboard/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData, recordTaskCompletion } from "@/lib/api/tasks";
import { replaceTaskInList, withUpdatedTasks } from "@/lib/data/dashboard";
import type { DashboardData, Task, TaskDayStatus, TaskPeriod } from "@/lib/data/types";
import { PERIOD_THEME, TASK_PERIODS } from "@/lib/data/task-periods";
import { cn } from "@/lib/utils";

function periodStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const bestStreak =
    tasks.length > 0 ? Math.max(...tasks.map((t) => t.streak)) : 0;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, bestStreak, rate };
}

export default function HabitsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<{ id: string; status: TaskDayStatus } | null>(
    null
  );
  const [activePeriod, setActivePeriod] = useState<TaskPeriod>("daily");

  const loadData = useCallback(async () => {
    try {
      setData(await getDashboardData());
      setError(null);
    } catch {
      setError("Failed to load habits. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAction(id: string, status: TaskDayStatus) {
    if (busy) return;
    setBusy({ id, status });
    try {
      const updated = await recordTaskCompletion(id, status);
      setData((prev) => {
        if (!prev) return prev;
        return withUpdatedTasks(prev, replaceTaskInList(prev.tasks, updated));
      });
    } catch {
      setError("Could not update habit. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) return <DashboardContentLoading />;
  if (!data) return null;

  const periodTasks = data.tasksByPeriod[activePeriod];
  const stats = periodStats(periodTasks);
  const theme = PERIOD_THEME[activePeriod];
  const PeriodIcon = theme.icon;

  return (
    <div className="dashboard-page">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Habits
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track consistency across daily, weekly, monthly, and yearly habits.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="scroll-tabs mt-5 sm:mt-6" role="tablist">
          {TASK_PERIODS.map((p) => {
            const ps = periodStats(data.tasksByPeriod[p.id]);
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={activePeriod === p.id}
                onClick={() => setActivePeriod(p.id)}
                className={cn(
                  "min-h-11 rounded-xl border px-4 py-2.5 text-left transition-all",
                  activePeriod === p.id
                    ? "border-foreground/20 bg-secondary text-foreground"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <span className="block text-sm font-medium">
                  {p.label.replace(" Tasks", "")}
                </span>
                <span className="block text-xs tabular-nums opacity-70">
                  {ps.completed}/{ps.total} · {ps.rate}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center gap-3 p-5">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg",
                  theme.badge
                )}
              >
                <PeriodIcon className="size-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{stats.rate}%</p>
                <p className="text-xs text-muted-foreground">Completion</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center gap-3 p-5">
              <Flame className="size-5 text-orange-400/80" />
              <div>
                <p className="text-2xl font-semibold tabular-nums">
                  {stats.bestStreak}d
                </p>
                <p className="text-xs text-muted-foreground">Best streak</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/50">
            <CardContent className="flex items-center gap-3 p-5">
              <TrendingUp className="size-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold tabular-nums">
                  {stats.completed}/{stats.total}
                </p>
                <p className="text-xs text-muted-foreground">Done today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-border/60 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              {TASK_PERIODS.find((p) => p.id === activePeriod)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {periodTasks.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No habits in this category yet.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add tasks from Manage in the sidebar.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                {periodTasks.map((task) => (
                  <li key={task.id}>
                    <TaskActionRow
                      task={task}
                      onAction={handleAction}
                      loadingStatus={
                        busy?.id === task.id ? busy.status : null
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
