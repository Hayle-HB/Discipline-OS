"use client";

import { ArrowLeft, CalendarDays } from "lucide-react";
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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<TaskPeriod>("daily");
  const viewingToday = isToday(dateKey);
  const dayMetrics = computeDayMetrics(
    Object.values(tasksByPeriod).flat(),
    dateKey
  );

  async function handleAction(id: string, status: TaskDayStatus) {
    if (!viewingToday) return;
    setBusyId(id);
    try {
      await onAction(id, status);
    } finally {
      setBusyId(null);
    }
  }

  const activeTasks = tasksByPeriod[activePeriod];
  const { pending, missed, done } = partitionTasks(activeTasks, dateKey);
  const completed = done.length;
  const total = activeTasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const theme = PERIOD_THEME[activePeriod];
  const PeriodIcon = theme.icon;

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-medium">
              {viewingToday ? "Check off" : formatDateLabel(dateKey)}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {viewingToday
                ? "Use ✓ for done or ✗ for missed. Streaks update once per day."
                : `${dayMetrics.done} done · ${dayMetrics.missed} missed · ${dayMetrics.rate}% daily completion`}
            </p>
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
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/20 px-3 py-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            Viewing history — select Today to check off tasks.
          </div>
        )}

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Task frequency">
          {TASK_PERIODS.map((p) => {
            const count = tasksByPeriod[p.id].length;
            const doneCount = tasksByPeriod[p.id].filter(
              (t) => getTaskStatusForDate(t, dateKey) === "done"
            ).length;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={activePeriod === p.id}
                onClick={() => setActivePeriod(p.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left transition-all",
                  activePeriod === p.id
                    ? "border-foreground/20 bg-secondary text-foreground"
                    : "border-transparent bg-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <span className="block text-xs font-medium">
                  {p.label.replace(" Tasks", "")}
                </span>
                <span className="block text-[10px] tabular-nums opacity-70">
                  {doneCount}/{count}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border/60 bg-secondary/20 px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                theme.badge
              )}
            >
              <PeriodIcon className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {TASK_PERIODS.find((p) => p.id === activePeriod)?.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {TASK_PERIODS.find((p) => p.id === activePeriod)?.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold tabular-nums">{progress}%</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              complete
            </p>
          </div>
        </div>

        <div className="mb-4 h-px bg-border" />

        {total === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks in this category yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Go to Manage in the sidebar to add one.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 rounded-lg border border-border/60">
            {pending.length > 0 && (
              <ul aria-label="Pending tasks">
                {pending.map((task) => (
                  <li key={task.id}>
                    <TaskActionRow
                      task={task}
                      dateKey={dateKey}
                      onAction={handleAction}
                      disabled={busyId === task.id || !viewingToday}
                    />
                  </li>
                ))}
              </ul>
            )}

            {missed.length > 0 && (
              <>
                {pending.length > 0 && (
                  <div className="bg-red-500/5 px-4 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-red-400/80">
                      Missed ({missed.length})
                    </p>
                  </div>
                )}
                <ul aria-label="Missed tasks">
                  {missed.map((task) => (
                    <li key={task.id}>
                      <TaskActionRow
                        task={task}
                        dateKey={dateKey}
                        onAction={handleAction}
                        disabled={busyId === task.id || !viewingToday}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}

            {done.length > 0 && (
              <>
                {(pending.length > 0 || missed.length > 0) && (
                  <div className="bg-emerald-500/5 px-4 py-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/80">
                      Done ({done.length})
                    </p>
                  </div>
                )}
                <ul aria-label="Completed tasks">
                  {done.map((task) => (
                    <li key={task.id}>
                      <TaskActionRow
                        task={task}
                        dateKey={dateKey}
                        onAction={handleAction}
                        disabled={busyId === task.id || !viewingToday}
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
