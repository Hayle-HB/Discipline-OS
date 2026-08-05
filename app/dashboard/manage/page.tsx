"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DashboardLoading,
  useDashboardAuth,
} from "@/components/dashboard/DashboardLoading";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { TaskManageView } from "@/components/dashboard/tasks";
import {
  createTask,
  deleteTask,
  getDashboardData,
  updateTask,
} from "@/lib/api/tasks";
import type { CreateTaskPayload, DashboardData, UpdateTaskPayload } from "@/lib/data/types";
import { withUpdatedTasks } from "@/lib/data/dashboard";

export default function ManagePage() {
  const { user, isAuthLoading } = useDashboardAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setData(await getDashboardData());
      setError(null);
    } catch {
      setError("Failed to load tasks. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user) loadTasks();
  }, [isAuthLoading, user, loadTasks]);

  async function handleAdd(payload: CreateTaskPayload) {
    const created = await createTask(payload);
    setData((prev) => {
      if (!prev) return prev;
      return withUpdatedTasks(prev, [...prev.tasks, created]);
    });
  }

  async function handleUpdate(id: string, payload: UpdateTaskPayload) {
    const updated = await updateTask(id, payload);
    setData((prev) => {
      if (!prev) return prev;
      return withUpdatedTasks(
        prev,
        prev.tasks.map((t) => (t.id === id ? updated : t))
      );
    });
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setData((prev) => {
      if (!prev) return prev;
      return withUpdatedTasks(
        prev,
        prev.tasks.filter((t) => t.id !== id)
      );
    });
  }

  if (isAuthLoading || isLoading) return <DashboardLoading />;
  if (!user || !data) return null;

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Manage
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Create and organize your tasks. Check them off on Today when you&apos;re
            ready to work.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-8">
          <TaskManageView
            tasks={data.tasks}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
