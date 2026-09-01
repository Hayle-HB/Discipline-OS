"use client";

import { Check, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { deleteGoalTask, updateGoalTask } from "@/lib/api/goals";
import { ApiError } from "@/lib/api/types";
import type { GoalTask } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface GoalTaskRowProps {
  goalId: string;
  task: GoalTask;
  onUpdated: (task: GoalTask) => void;
  onDeleted: (taskId: string) => void;
}

export function GoalTaskRow({ goalId, task, onUpdated, onDeleted }: GoalTaskRowProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleCompleted() {
    setIsBusy(true);
    setError(null);
    try {
      const updated = await updateGoalTask(goalId, task.id, {
        completed: !task.completed,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update task.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    setIsBusy(true);
    setError(null);
    try {
      await deleteGoalTask(goalId, task.id);
      onDeleted(task.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete task.");
      setIsBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-border/60 bg-background/30 px-3 py-3 sm:px-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggleCompleted}
          disabled={isBusy}
          aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
          className={cn(
            "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
            task.completed
              ? "border-foreground bg-foreground text-background"
              : "border-border/80 bg-background hover:border-foreground/40"
          )}
        >
          {isBusy ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : task.completed ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : null}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium text-foreground",
              task.completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {task.description}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isBusy}
          aria-label="Delete task"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}
