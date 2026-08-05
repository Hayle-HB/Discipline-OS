"use client";

                                                                      import { Check, Clock, Flame, Timer, X } from "lucide-react";

                                                                      import {
                                                                        getCompletionEntryForDate,
                                                                        getTaskStatusForDate,
                                                                      } from "@/lib/data/task-completions";
                                                                      import {
                                                                        formatCompletedAt,
                                                                        formatTimeLabel,
                                                                        isToday,
                                                                        todayKey,
                                                                      } from "@/lib/data/dates";
                                                                      import type { Task, TaskDayStatus } from "@/lib/data/types";
                                                                      import { cn } from "@/lib/utils";

                                                                      const PRIORITY_DOT: Record<NonNullable<Task["priority"]>, string> = {
                                                                        low: "bg-sky-400",
                                                                        medium: "bg-amber-400",
                                                                        high: "bg-red-400",
                                                                      };

                                                                      interface TaskActionRowProps {
                                                                        task: Task;
                                                                        onAction: (id: string, status: TaskDayStatus) => void;
                                                                        disabled?: boolean;
                                                                        dateKey?: string;
                                                                      }

                                                                      export function TaskActionRow({
                                                                        task,
                                                                        onAction,
                                                                        disabled = false,
                                                                        dateKey = todayKey(),
                                                                      }: TaskActionRowProps) {
                                                                        const entry = getCompletionEntryForDate(task, dateKey);
                                                                        const status = entry?.status ?? null;
                                                                        const isDone = status === "done";
                                                                        const isMissed = status === "missed";
                                                                        const canAct = isToday(dateKey);
                                                                        const preferredLabel = formatTimeLabel(task.preferredTime);
                                                                        const completedLabel = formatCompletedAt(entry?.completedAt);

                                                                        return (
                                                                          <div
                                                                            className={cn(
                                                                              "flex w-full items-center gap-3 px-3 py-3.5",
                                                                              !canAct && "opacity-90"
                                                                            )}
                                                                          >
                                                                            <div className="min-w-0 flex-1">
                                                                              <div className="flex items-center gap-2">
                                                                                {task.priority && (
                                                                                  <span
                                                                                    className={cn(
                                                                                      "size-1.5 shrink-0 rounded-full",
                                                                                      PRIORITY_DOT[task.priority]
                                                                                    )}
                                                                                    title={`${task.priority} priority`}
                                                                                  />
                                                                                )}
                                                                                <span
                                                                                  className={cn(
                                                                                    "text-[15px] leading-snug",
                                                                                    isDone
                                                                                      ? "text-muted-foreground line-through decoration-muted-foreground/50"
                                                                                      : isMissed
                                                                                        ? "text-muted-foreground/70"
                                                                                        : "text-foreground"
                                                                                  )}
                                                                                >
                                                                                  {task.label}
                                                                                </span>
                                                                              </div>

                                                                              {(task.description || preferredLabel || task.estimatedMinutes) && (
                                                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                                                  {task.description}
                                                                                  {task.description && (preferredLabel || task.estimatedMinutes)
                                                                                    ? " · "
                                                                                    : ""}
                                                                                  {preferredLabel && (
                                                                                    <span className="inline-flex items-center gap-0.5">
                                                                                      <Clock className="inline size-3" />
                                                                                      {preferredLabel}
                                                                                    </span>
                                                                                  )}
                                                                                  {preferredLabel && task.estimatedMinutes ? " · " : ""}
                                                                                  {task.estimatedMinutes ? `${task.estimatedMinutes}m` : ""}
                                                                                </p>
                                                                              )}

                                                                              {isDone && completedLabel && (
                                                                                <p className="mt-0.5 text-[10px] text-emerald-400/80">
                                                                                  Completed at {completedLabel}
                                                                                  {entry?.durationMinutes ? ` · ${entry.durationMinutes}m` : ""}
                                                                                </p>
                                                                              )}
                                                                            </div>

                                                                            <div className="flex shrink-0 items-center gap-2">
                                                                              {task.streak > 0 && (
                                                                                <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                                                                                  <Flame className="size-3.5 text-orange-400/80" aria-hidden="true" />
                                                                                  {task.streak}
                                                                                </span>
                                                                              )}

                                                                              {task.estimatedMinutes && !isDone && (
                                                                                <span
                                                                                  className="hidden items-center gap-0.5 text-[10px] text-muted-foreground sm:flex"
                                                                                  title="Estimated duration"
                                                                                >
                                                                                  <Timer className="size-3" />
                                                                                  {task.estimatedMinutes}m
                                                                                </span>
                                                                              )}

                                                                              {canAct ? (
                                                                                <div className="flex items-center gap-1.5">
                                                                                  <button
                                                                                    type="button"
                                                                                    onClick={() => onAction(task.id, "done")}
                                                                                    disabled={disabled}
                                                                                    aria-pressed={isDone}
                                                                                    aria-label={`Mark "${task.label}" as done`}
                                                                                    className={cn(
                                                                                      "flex size-8 items-center justify-center rounded-lg border transition-colors",
                                                                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                                                      isDone
                                                                                        ? "border-emerald-500/50 bg-emerald-500 text-emerald-950"
                                                                                        : "border-border bg-secondary/30 text-muted-foreground hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400",
                                                                                      disabled && "pointer-events-none opacity-40"
                                                                                    )}
                                                                                  >
                                                                                    <Check className="size-4 stroke-[2.5]" aria-hidden="true" />
                                                                                  </button>
                                                                                  <button
                                                                                    type="button"
                                                                                    onClick={() => onAction(task.id, "missed")}
                                                                                    disabled={disabled}
                                                                                    aria-pressed={isMissed}
                                                                                    aria-label={`Mark "${task.label}" as missed`}
                                                                                    className={cn(
                                                                                      "flex size-8 items-center justify-center rounded-lg border transition-colors",
                                                                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                                                      isMissed
                                                                                        ? "border-red-500/50 bg-red-500 text-white"
                                                                                        : "border-border bg-secondary/30 text-muted-foreground hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400",
                                                                                      disabled && "pointer-events-none opacity-40"
                                                                                    )}
                                                                                  >
                                                                                    <X className="size-4 stroke-[2.5]" aria-hidden="true" />
                                                                                  </button>
                                                                                </div>
                                                                              ) : (
                                                                                <span
                                                                                  className={cn(
                                                                                    "rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wide",
                                                                                    isDone && "bg-emerald-500/10 text-emerald-400",
                                                                                    isMissed && "bg-red-500/10 text-red-400",
                                                                                    !isDone && !isMissed && "bg-secondary text-muted-foreground"
                                                                                  )}
                                                                                >
                                                                                  {isDone ? "Done" : isMissed ? "Missed" : "—"}
                                                                                </span>
                                                                              )}
                                                                            </div>
                                                                          </div>
  );
}
