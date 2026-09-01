"use client";

import {
  ChevronDown,
  Clock,
  Flame,
  Loader2,
  Timer,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTimeLabel } from "@/lib/data/dates";
import { groupTasksByPeriod, PERIOD_THEME, TASK_PERIODS } from "@/lib/data/task-periods";
import type { CreateTaskPayload, Task, TaskPeriod } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export type TaskFormValues = {
  label: string;
  description: string;
  period: TaskPeriod;
  priority: Task["priority"];
  preferredTime: string;
  estimatedMinutes: string;
};

export const emptyFormValues = (): TaskFormValues => ({
  label: "",
  description: "",
  period: "daily",
  priority: "medium",
  preferredTime: "",
  estimatedMinutes: "",
});

export function formValuesFromTask(task: Task): TaskFormValues {
  return {
    label: task.label,
    description: task.description ?? "",
    period: task.period,
    priority: task.priority ?? "medium",
    preferredTime: task.preferredTime ?? "",
    estimatedMinutes: task.estimatedMinutes ? String(task.estimatedMinutes) : "",
  };
}

export function formValuesToPayload(values: TaskFormValues): CreateTaskPayload {
  return {
    label: values.label.trim(),
    period: values.period,
    description: values.description.trim() || undefined,
    priority: values.priority,
    preferredTime: values.preferredTime || undefined,
    estimatedMinutes: values.estimatedMinutes
      ? Number(values.estimatedMinutes)
      : undefined,
  };
}

const PRIORITIES = [
  { id: "low" as const, label: "Low", dot: "bg-sky-400" },
  { id: "medium" as const, label: "Medium", dot: "bg-amber-400" },
  { id: "high" as const, label: "High", dot: "bg-red-400" },
];

interface PeriodPickerProps {
  value: TaskPeriod;
  onChange: (period: TaskPeriod) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function PeriodPicker({
  value,
  onChange,
  disabled,
  compact,
}: PeriodPickerProps) {
  return (
    <div className="scroll-tabs sm:flex-wrap">
      {TASK_PERIODS.map((p) => {
        const theme = PERIOD_THEME[p.id];
        const Icon = theme.icon;
        const selected = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(p.id)}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all",
              compact ? "py-1.5 text-xs" : "text-sm",
              selected
                ? cn("border-foreground/25 bg-secondary shadow-sm", theme.ring, "ring-1")
                : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg",
                theme.badge,
                compact && "size-6"
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <span className="font-medium">
              {p.label.replace(" Tasks", "")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface PriorityPickerProps {
  value: Task["priority"];
  onChange: (p: Task["priority"]) => void;
  disabled?: boolean;
}

export function PriorityPicker({ value, onChange, disabled }: PriorityPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRIORITIES.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(p.id)}
          className={cn(
            "flex min-h-11 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:py-1.5",
            value === p.id
              ? "border-foreground/30 bg-foreground text-background"
              : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
          )}
        >
          <span className={cn("size-1.5 rounded-full", p.dot)} />
          {p.label}
        </button>
      ))}
    </div>
  );
}

interface TaskFormFieldsProps {
  values: TaskFormValues;
  onChange: (values: TaskFormValues) => void;
  disabled?: boolean;
  idPrefix?: string;
  showOptionalByDefault?: boolean;
}

export function TaskFormFields({
  values,
  onChange,
  disabled,
  idPrefix = "task",
  showOptionalByDefault = false,
}: TaskFormFieldsProps) {
  const [showOptional, setShowOptional] = useState(showOptionalByDefault);

  function patch(partial: Partial<TaskFormValues>) {
    onChange({ ...values, ...partial });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-label`}>Task name</Label>
        <Input
          id={`${idPrefix}-label`}
          value={values.label}
          onChange={(e) => patch({ label: e.target.value })}
          placeholder="e.g. Morning workout"
          disabled={disabled}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label>How often?</Label>
        <PeriodPicker
          value={values.period}
          onChange={(period) => patch({ period })}
          disabled={disabled}
          compact
        />
      </div>

      <button
        type="button"
        onClick={() => setShowOptional((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-dashed border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
      >
        <span>Optional details (time, duration, priority)</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            showOptional && "rotate-180"
          )}
        />
      </button>

      {showOptional && (
        <div className="space-y-4 rounded-xl border border-border/60 bg-secondary/20 p-4">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-description`}>Description</Label>
            <Input
              id={`${idPrefix}-description`}
              value={values.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="What does done look like?"
              disabled={disabled}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-time`}>Preferred time</Label>
              <Input
                id={`${idPrefix}-time`}
                type="time"
                value={values.preferredTime}
                onChange={(e) => patch({ preferredTime: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}-duration`}>Duration (minutes)</Label>
              <Input
                id={`${idPrefix}-duration`}
                type="number"
                min={1}
                value={values.estimatedMinutes}
                onChange={(e) => patch({ estimatedMinutes: e.target.value })}
                placeholder="30"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <PriorityPicker
              value={values.priority}
              onChange={(priority) => patch({ priority })}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskManageCardProps {
  task: Task;
  isEditing: boolean;
  editValues: TaskFormValues;
  onEditChange: (values: TaskFormValues) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  busy?: boolean;
  confirmDelete?: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export function TaskManageCard({
  task,
  isEditing,
  editValues,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  busy,
  confirmDelete,
  onConfirmDelete,
  onCancelDelete,
}: TaskManageCardProps) {
  const theme = PERIOD_THEME[task.period];
  const PeriodIcon = theme.icon;
  const timeLabel = formatTimeLabel(task.preferredTime);
  const priority =
    PRIORITIES.find((p) => p.id === task.priority) ?? PRIORITIES[1];

  if (isEditing) {
    return (
      <li className="rounded-2xl border border-foreground/15 bg-card/80 p-5 shadow-sm ring-1 ring-foreground/5">
        <TaskFormFields
          values={editValues}
          onChange={onEditChange}
          disabled={busy}
          idPrefix={`edit-${task.id}`}
          showOptionalByDefault
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={onSave}
            disabled={busy || !editValues.label.trim()}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            Save changes
          </Button>
          <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={busy}>
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  if (confirmDelete) {
    return (
      <li className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <p className="text-sm font-medium text-foreground">
          Delete &ldquo;{task.label}&rdquo;?
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          This cannot be undone. Your streak history for this task will be lost.
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={busy}
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Yes, delete
          </Button>
          <Button size="sm" variant="outline" onClick={onCancelDelete} disabled={busy}>
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "group rounded-2xl border border-border/60 bg-card/50 p-4 transition-all",
        "hover:border-border hover:bg-card/80 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            theme.badge
          )}
        >
          <PeriodIcon className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{task.label}</p>
              {task.description && (
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                  {task.description}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={onStartEdit}
                disabled={busy}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={onDelete}
                disabled={busy}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                theme.badge
              )}
            >
              {task.period}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", priority.dot)} />
              {priority.label}
            </span>
            {timeLabel && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                <Clock className="size-3" />
                {timeLabel}
              </span>
            )}
            {task.estimatedMinutes != null && task.estimatedMinutes > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                <Timer className="size-3" />
                {task.estimatedMinutes}m
              </span>
            )}
            {task.streak > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-400/90">
                <Flame className="size-3" />
                {task.streak} streak
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

interface ManagePeriodTabsProps {
  tasksByPeriod: ReturnType<typeof groupTasksByPeriod>;
  active: TaskPeriod | "all";
  onChange: (period: TaskPeriod | "all") => void;
}

export function ManagePeriodTabs({
  tasksByPeriod,
  active,
  onChange,
}: ManagePeriodTabsProps) {
  const total = Object.values(tasksByPeriod).flat().length;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
          active === "all"
            ? "border-foreground/20 bg-secondary text-foreground"
            : "border-transparent text-muted-foreground hover:bg-secondary/50"
        )}
      >
        All
        <span className="ml-1.5 tabular-nums opacity-60">{total}</span>
      </button>
      {TASK_PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={cn(
            "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            active === p.id
              ? "border-foreground/20 bg-secondary text-foreground"
              : "border-transparent text-muted-foreground hover:bg-secondary/50"
          )}
        >
          {p.label.replace(" Tasks", "")}
          <span className="ml-1.5 tabular-nums opacity-60">
            {tasksByPeriod[p.id].length}
          </span>
        </button>
      ))}
    </div>
  );
}

export function useFilteredTasks(tasks: Task[], filter: TaskPeriod | "all") {
  return useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.period === filter);
  }, [tasks, filter]);
}
