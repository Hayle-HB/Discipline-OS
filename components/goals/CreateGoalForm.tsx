"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoal } from "@/lib/api/goals";
import { ApiError } from "@/lib/api/types";
import { GOAL_CATEGORIES, GOAL_PRIORITIES } from "@/lib/data/goal-meta";
import type { CreateGoalPayload, GoalDetail } from "@/lib/data/types";

interface CreateGoalFormProps {
  onCreated: (goal: GoalDetail) => void;
}

export function CreateGoalForm({ onCreated }: CreateGoalFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateGoalPayload>({
    title: "",
    description: "",
    why: "",
    deadline: "",
    category: "personal",
    priority: "medium",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Give your goal a title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const goal = await createGoal({
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        why: form.why?.trim() || undefined,
        deadline: form.deadline || undefined,
        category: form.category,
        priority: form.priority,
      });
      onCreated(goal);
      setForm({
        title: "",
        description: "",
        why: "",
        deadline: "",
        category: "personal",
        priority: "medium",
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create goal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="gap-2">
        <Plus className="size-4" aria-hidden="true" />
        New goal
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-5"
    >
      <h2 className="text-base font-semibold text-foreground">Create a goal</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        What do you want to achieve? Add tasks later to break it down.
      </p>

      <div className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal-title">Goal title</Label>
          <Input
            id="goal-title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Become a Software Engineer"
            maxLength={200}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-description">What is this goal?</Label>
          <textarea
            id="goal-description"
            value={form.description ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Land a full-time role building backend systems."
            rows={2}
            maxLength={2000}
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal-why">Why does it matter to you?</Label>
          <textarea
            id="goal-why"
            value={form.why ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, why: event.target.value }))}
            placeholder="I want meaningful work that lets me build products I care about."
            rows={2}
            maxLength={2000}
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="goal-deadline">Deadline</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={form.deadline ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, deadline: event.target.value }))
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-category">Category</Label>
            <select
              id="goal-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as CreateGoalPayload["category"],
                }))
              }
              disabled={isSubmitting}
              className="h-10 w-full rounded-xl border border-border/60 bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              {GOAL_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-priority">Priority</Label>
            <select
              id="goal-priority"
              value={form.priority}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priority: event.target.value as CreateGoalPayload["priority"],
                }))
              }
              disabled={isSubmitting}
              className="h-10 w-full rounded-xl border border-border/60 bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              {GOAL_PRIORITIES.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Creating…
            </>
          ) : (
            "Create goal"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
