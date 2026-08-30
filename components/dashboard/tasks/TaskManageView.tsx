"use client";

import { useState } from "react";
import { ListTodo, Loader2, Plus, Sparkles } from "lucide-react";

import {
  emptyFormValues,
  formValuesFromTask,
  formValuesToPayload,
  ManagePeriodTabs,
  TaskFormFields,
  TaskManageCard,
  useFilteredTasks,
} from "@/components/dashboard/tasks/manage-ui";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { groupTasksByPeriod } from "@/lib/data/task-periods";
import { ApiError } from "@/lib/api/types";
import type { CreateTaskPayload, Task, TaskPeriod, UpdateTaskPayload } from "@/lib/data/types";

interface TaskManageViewProps {
  tasks: Task[];
  onAdd: (payload: CreateTaskPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateTaskPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function actionErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function TaskManageView({
  tasks,
  onAdd,
  onUpdate,
  onDelete,
}: TaskManageViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addValues, setAddValues] = useState(emptyFormValues);
  const [isAdding, setIsAdding] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<TaskPeriod | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState(emptyFormValues());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tasksByPeriod = groupTasksByPeriod(tasks);
  const filteredTasks = useFilteredTasks(tasks, periodFilter);

  function flashSuccess(message: string) {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addValues.label.trim()) return;

    setError(null);
    setIsAdding(true);
    try {
      await onAdd(formValuesToPayload(addValues));
      setAddValues(emptyFormValues());
      setShowAddForm(false);
      flashSuccess("Task added.");
    } catch (err) {
      setError(actionErrorMessage(err, "Could not add task. Please try again."));
    } finally {
      setIsAdding(false);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditValues(formValuesFromTask(task));
    setDeleteConfirmId(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    if (!editValues.label.trim()) return;

    setError(null);
    setBusyId(id);
    try {
      await onUpdate(id, formValuesToPayload(editValues));
      setEditingId(null);
      flashSuccess("Task updated.");
    } catch (err) {
      setError(actionErrorMessage(err, "Could not save changes. Please try again."));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete(id: string) {
    setError(null);
    setBusyId(id);
    try {
      await onDelete(id);
      setDeleteConfirmId(null);
      if (editingId === id) setEditingId(null);
      flashSuccess("Task deleted.");
    } catch (err) {
      setError(actionErrorMessage(err, "Could not delete task. Please try again."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && <AuthAlert variant="error" message={error} />}
      {success && <AuthAlert variant="success" message={success} />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => {
          const count = tasksByPeriod[period].length;
          return (
            <div
              key={period}
              className="rounded-xl border border-border/60 bg-card/40 px-4 py-3"
            >
              <p className="text-2xl font-semibold tabular-nums">{count}</p>
              <p className="text-xs capitalize text-muted-foreground">{period}</p>
            </div>
          );
        })}
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/50 backdrop-blur-sm">
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              setError(null);
            }}
            className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-secondary/30"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
              <Plus className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-medium text-foreground">
                Add a new task
              </span>
              <span className="block text-xs text-muted-foreground">
                Name it, pick a frequency, optionally set time & priority
              </span>
            </span>
          </button>
        ) : (
          <>
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-muted-foreground" />
                <CardTitle className="text-base font-medium">New task</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={handleAdd} className="space-y-5">
                <TaskFormFields
                  values={addValues}
                  onChange={setAddValues}
                  disabled={isAdding}
                  idPrefix="new"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isAdding || !addValues.label.trim()}>
                    {isAdding ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Add task
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddValues(emptyFormValues());
                    }}
                    disabled={isAdding}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>

      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ListTodo className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Your tasks</CardTitle>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {tasks.length} total
            </span>
          </div>
          <ManagePeriodTabs
            tasksByPeriod={tasksByPeriod}
            active={periodFilter}
            onChange={setPeriodFilter}
          />
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {tasks.length === 0
                  ? "No tasks yet — add your first one above."
                  : "No tasks in this category."}
              </p>
              {tasks.length === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="size-3.5" />
                  Add task
                </Button>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskManageCard
                  key={task.id}
                  task={task}
                  isEditing={editingId === task.id}
                  editValues={editValues}
                  onEditChange={setEditValues}
                  onStartEdit={() => startEdit(task)}
                  onCancelEdit={cancelEdit}
                  onSave={() => saveEdit(task.id)}
                  onDelete={() => {
                    setDeleteConfirmId(task.id);
                    setEditingId(null);
                  }}
                  busy={busyId === task.id}
                  confirmDelete={deleteConfirmId === task.id}
                  onConfirmDelete={() => confirmDelete(task.id)}
                  onCancelDelete={() => setDeleteConfirmId(null)}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Check off tasks on{" "}
        <span className="text-foreground/80">Today</span> — manage them here.
      </p>
    </div>
  );
}
