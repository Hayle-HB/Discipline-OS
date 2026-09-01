"use client";

import { Loader2, Plus, Target } from "lucide-react";
import { useState } from "react";

import { GoalTaskRow } from "@/components/goals/GoalTaskRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoalTask } from "@/lib/api/goals";
import { ApiError } from "@/lib/api/types";
import type { GoalDetail, GoalTask } from "@/lib/data/types";

interface GoalTasksPanelProps {
  goal: GoalDetail;
  onGoalChange: (goal: GoalDetail) => void;
}

export function GoalTasksPanel({ goal, onGoalChange }: GoalTasksPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function recomputeGoal(tasks: GoalTask[]): GoalDetail {
    const tasksCompleted = tasks.filter((task) => task.completed).length;
    const tasksTotal = tasks.length;
    return {
      ...goal,
      tasks,
      tasksCompleted,
      tasksTotal,
      progressPercent: tasksTotal ? Math.round((tasksCompleted / tasksTotal) * 100) : 0,
    };
  }

  async function handleAddTask(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const task = await createGoalTask(goal.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onGoalChange(recomputeGoal([...goal.tasks, task]));
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not add task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleTaskUpdated(task: GoalTask) {
    onGoalChange(
      recomputeGoal(goal.tasks.map((current) => (current.id === task.id ? task : current)))
    );
  }

  function handleTaskDeleted(taskId: string) {
    onGoalChange(recomputeGoal(goal.tasks.filter((task) => task.id !== taskId)));
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Target className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">Tasks for this goal</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Every task should connect to your bigger goal — explain why it matters when you add it.
      </p>

      {goal.tasks.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-border/60 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">No tasks yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Break your goal into concrete steps you can complete.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-2">
          {goal.tasks.map((task) => (
            <GoalTaskRow
              key={task.id}
              goalId={goal.id}
              task={task}
              onUpdated={handleTaskUpdated}
              onDeleted={handleTaskDeleted}
            />
          ))}
        </ul>
      )}

      <form onSubmit={handleAddTask} className="mt-5 space-y-3 border-t border-border/60 pt-5">
        <div className="space-y-2">
          <Label htmlFor="new-task-title">Add a task</Label>
          <Input
            id="new-task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Learn FastAPI"
            maxLength={200}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-task-description">How does this help?</Label>
          <textarea
            id="new-task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Backend skills are essential for the roles I want."
            rows={2}
            maxLength={1000}
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting || !title.trim()} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Adding…
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden="true" />
              Add task
            </>
          )}
        </Button>
      </form>
    </section>
  );
}
