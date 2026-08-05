"use client";

import { CheckCircle2, Repeat } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Routine } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface RoutinesPanelProps {
  routines: Routine[];
  onToggleStep: (routineId: string, stepId: string) => Promise<void>;
  busyStepId?: string | null;
}

export function RoutinesPanel({
  routines,
  onToggleStep,
  busyStepId,
}: RoutinesPanelProps) {
  if (routines.length === 0) return null;

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm animate-fade-up animation-delay-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Repeat className="size-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-base font-medium">Daily Routines</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {routines.map((routine) => {
          const done = routine.steps.filter((s) => s.completed).length;
          const total = routine.steps.length;
          const progress = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <div
              key={routine.id}
              className="rounded-lg border border-border bg-background/50 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {routine.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {routine.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {done}/{total}
                </span>
              </div>

              <div className="mb-3 h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-foreground/70 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ul className="space-y-2">
                {routine.steps.map((step) => (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => onToggleStep(routine.id, step.id)}
                      disabled={busyStepId === step.id}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-secondary/50"
                      aria-pressed={step.completed}
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border",
                          step.completed
                            ? "border-emerald-500/50 bg-emerald-500/10"
                            : "border-border bg-secondary"
                        )}
                      >
                        {step.completed && (
                          <CheckCircle2 className="size-3 text-emerald-400" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          step.completed
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
