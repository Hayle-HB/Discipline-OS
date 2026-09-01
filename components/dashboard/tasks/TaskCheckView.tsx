"use client";

import { ArrowLeft, CalendarDays, Check, X } from "lucide-react";
import { useState } from "react";

import { TaskActionRow } from "@/components/dashboard/tasks/TaskActionRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateLabel, isToday, todayKey } from "@/lib/data/dates";
import {
  computeDayMetrics,
  getTaskStatusForDate,
} from "@/lib/data/task-completions";
import type { Task, TaskDayStatus, TaskPeriod } from "@/lib/data/types";
import { PERIOD_THEME, TASK_PERIODS } from "@/lib/data/task-periods";
import { cn } from "@/lib/utils";

interface TaskCheckViewProps {
  tasksByPeriod: Record<TaskPeriod, Task[]>;
  dateKey?: string;
  onAction: (id: string, status: TaskDayStatus) => Promise<void>;
  onBackToToday?: () => void;
}

function partitionTasks(tasks: Task[], dateKey: string) {
  const pending: Task[] = [];
  const missed: Task[] = [];
  const done: Task[] = [];

  for (const task of tasks) {
    const status = getTaskStatusForDate(task, dateKey);
    if (status === "done") done.push(task);
    else if (status === "missed") missed.push(task);
    else pending.push(task);
  }

  return { pending, missed, done };
}

export function TaskCheckView({
  tasksByPeriod,
  dateKey = todayKey(),
  onAction,
  onBackToToday,
}: TaskCheckViewProps) {
  const [busy, setBusy] = useState<{ id: string; status: TaskDayStatus } | null>(
    null
  );
  const [activePeriod, setActivePeriod] = useState<TaskPeriod>("daily");
  const viewingToday = isToday(dateKey);
  const dayMetrics = computeDayMetrics(
    Object.values(tasksByPeriod).flat(),
    dateKey
  );

  async function handleAction(id: string, status: TaskDayStatus) {
    if (!viewingToday || busy) return;
    setBusy({ id, status });
    try {
      await onAction(id, status);
    } finally {
      setBusy(null);
    }
  }

  const activeMeta = TASK_PERIODS.find((p) => p.id === activePeriod)!;
  const activeTasks = tasksByPeriod[activePeriod];
  const { pending, missed, done } = partitionTasks(activeTasks, dateKey);
  const completed = done.length;
  const total = activeTasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const theme = PERIOD_THEME[activePeriod];
  const PeriodIcon = theme.icon;

  return (
    <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-4 border-b border-border/50 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold tracking-tight">
              {viewingToday ? "Check off" : formatDateLabel(dateKey)}
            </CardTitle>
            {viewingToday ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Tap</span>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                  <Check className="size-3 stroke-[2.5]" aria-hidden="true" />
                  Done
                </span>
                <span>or</span>
                <span className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-medium text-red-700 dark:text-red-400">
                  <X className="size-3 stroke-[2.5]" aria-hidden="true" />
                  Miss
                </span>
                <span className="hidden sm:inline">· streaks update once per day</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {dayMetrics.done} done · {dayMetrics.missed} missed ·{" "}
                {dayMetrics.rate}% daily completion
              </p>
            )}
          </div>
          {!viewingToday && onBackToToday && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={onBackToToday}
            >
              <ArrowLeft className="size-3.5" />
              Today
            </Button>
          )}
        </div>

        {!viewingToday && (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            Viewing history — select Today to check off tasks.
          </div>
        )}

        <div
          className="grid grid-cols-4 gap-1 rounded-xl bg-secondary/40 p-1"
          role="tablist"
          aria-label="Task frequency"
        >
          {TASK_PERIODS.map((p) => {
            const count = tasksByPeriod[p.id].length;
            const doneCount = tasksByPeriod[p.id].filter(
              (t) => getTaskStatusForDate(t, dateKey) === "done"
            ).length;
            const selected = activePeriod === p.id;
            const periodTheme = PERIOD_THEME[p.id];

            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActivePeriod(p.id)}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center rounded-lg px-1 py-2 text-center transition-all",
                  selected
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border/60"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <periodTheme.icon
                  className={cn(
                    "mb-1 size-3.5",
                    selected ? "opacity-100" : "opacity-60"
                  )}
                  aria-hidden="true"
                />
                <span className="text-[11px] font-semibold leading-none sm:text-xs">
                  {p.label.replace(" Tasks", "")}
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] tabular-nums",
                    selected ? "text-foreground/70" : "opacity-60"
                  )}
                >
                  {doneCount}/{count}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div
          className={cn(
            "rounded-xl border border-border/60 bg-gradient-to-br to-transparent p-4",
            theme.gradient
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                  theme.badge
                )}
              >
                <PeriodIcon className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{activeMeta.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {activeMeta.description}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-bold tabular-nums tracking-tight">
                {progress}%
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {completed}/{total} done
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary/80">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress >= 100 ? "bg-emerald-500" : "bg-foreground/70"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {total === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
            <p className="text-sm font-medium text-foreground">
              No tasks in this category yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Go to Manage in the sidebar to add one.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            {pending.length > 0 && (
              <>
                <SectionLabel tone="pending" count={pending.length} />
                <ul aria-label="Pending tasks">
                  {pending.map((task) => (
                    <li key={task.id} className="border-b border-border/50 last:border-0">
                      <TaskActionRow
                        task={task}
                        dateKey={dateKey}
                        onAction={handleAction}
                        loadingStatus={
                          busy?.id === task.id ? busy.status : null
                        }
                        disabled={!viewingToday}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}

            {missed.length > 0 && (
              <>
                <SectionLabel tone="missed" count={missed.length} />
                <ul aria-label="Missed tasks">
                  {missed.map((task) => (
                    <li key={task.id} className="border-b border-border/50 last:border-0">
                      <TaskActionRow
                        task={task}
                        dateKey={dateKey}
                        onAction={handleAction}
                        loadingStatus={
                          busy?.id === task.id ? busy.status : null
                        }
                        disabled={!viewingToday}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}

            {done.length > 0 && (
              <>
                <SectionLabel tone="done" count={done.length} />
                <ul aria-label="Completed tasks">
                  {done.map((task) => (
                    <li key={task.id} className="border-b border-border/50 last:border-0">
                      <TaskActionRow
                        task={task}
                        dateKey={dateKey}
                        onAction={handleAction}
                        loadingStatus={
                          busy?.id === task.id ? busy.status : null
                        }
                        disabled={!viewingToday}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionLabel({
  tone,
  count,
}: {
  tone: "pending" | "done" | "missed";
  count: number;
}) {
  const labels = {
    pending: "Pending",
    missed: "Missed",
    done: "Completed",
  };

  return (
    <div
      className={cn(
        "border-y border-border/50 px-4 py-2",
        tone === "pending" && "bg-secondary/40",
        tone === "missed" && "bg-red-500/[0.08]",
        tone === "done" && "bg-sky-500/[0.08]"
      )}
    >
      <p
        className={cn(
          "text-[11px] font-medium uppercase tracking-wider",
          tone === "pending" && "text-muted-foreground",
          tone === "missed" && "text-red-700/90 dark:text-red-400/90",
          tone === "done" && "text-sky-700/90 dark:text-sky-400/90"
        )}
      >
        {labels[tone]} ({count})
      </p>
    </div>
  );
}
