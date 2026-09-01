"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DashboardContentLoading,
} from "@/components/dashboard/DashboardLoading";
import { useDashboardUser } from "@/components/dashboard/DashboardLayoutClient";
import { DailyProgress } from "@/components/dashboard/DailyProgress";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RoutinesPanel } from "@/components/dashboard/RoutinesPanel";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { CalendarPanel } from "@/components/dashboard/calendar";
import { TaskCheckView } from "@/components/dashboard/tasks";
import { WeekOverview } from "@/components/dashboard/WeekOverview";
import { getDashboardData, recordTaskCompletion } from "@/lib/api/tasks";
import { toggleRoutineStep } from "@/lib/api/habits";
import { todayKey } from "@/lib/data/dates";
import { replaceTaskInList, withUpdatedTasks } from "@/lib/data/dashboard";
import type { DashboardData, TaskDayStatus } from "@/lib/data/types";

export default function DashboardPage() {
  const user = useDashboardUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyStepId, setBusyStepId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const loadDashboard = useCallback(async () => {
    try {
      const dashboard = await getDashboardData();
      setData(dashboard);
      setError(null);
    } catch {
      setError("Failed to load your tasks. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleAction(id: string, status: TaskDayStatus) {
    const updated = await recordTaskCompletion(id, status);
    setData((prev) => {
      if (!prev) return prev;
      return withUpdatedTasks(prev, replaceTaskInList(prev.tasks, updated));
    });
  }

  async function handleToggleRoutineStep(routineId: string, stepId: string) {
    setBusyStepId(stepId);
    try {
      const updated = await toggleRoutineStep(routineId, stepId);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          routines: (prev.routines ?? []).map((r) =>
            r.id === routineId ? updated : r
          ),
        };
      });
    } finally {
      setBusyStepId(null);
    }
  }

  if (isLoading) return <DashboardContentLoading />;
  if (!data) return null;

  return (
    <div className="dashboard-page">
      <DashboardHeader name={user.name} />

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 space-y-5 sm:mt-8 sm:space-y-6">
        <StatsGrid stats={data.stats} />

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-5">
          <div className="order-2 space-y-5 sm:space-y-6 lg:order-none lg:col-span-3">
            <TaskCheckView
              tasksByPeriod={data.tasksByPeriod}
              dateKey={selectedDate}
              onAction={handleAction}
              onBackToToday={() => setSelectedDate(todayKey())}
            />
            {data.routines && data.routines.length > 0 && (
              <RoutinesPanel
                routines={data.routines}
                onToggleStep={handleToggleRoutineStep}
                busyStepId={busyStepId}
              />
            )}
          </div>

          <div className="order-1 space-y-5 sm:space-y-6 lg:order-none lg:col-span-2">
            <CalendarPanel
              tasks={data.tasks}
              compact
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
            />
            <DailyProgress
              progress={data.stats.progress}
              completed={data.stats.completed}
              total={data.stats.total}
            />
            <WeekOverview activity={data.weeklyActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}
