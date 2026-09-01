"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Target } from "lucide-react";

import { DashboardContentLoading } from "@/components/dashboard/DashboardLoading";
import { CreateGoalForm } from "@/components/goals/CreateGoalForm";
import { GoalCard } from "@/components/goals/GoalCard";
import { listGoals } from "@/lib/api/goals";
import { ApiError } from "@/lib/api/types";
import type { GoalDetail, GoalSummary } from "@/lib/data/types";

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    try {
      setGoals(await listGoals());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load goals.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  function handleCreated(goal: GoalDetail) {
    router.push(`/dashboard/goals/${goal.id}`);
  }

  if (isLoading) return <DashboardContentLoading />;

  return (
    <div className="dashboard-page dashboard-page-narrow">
      <div className="animate-fade-up flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Goals</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            What are you trying to achieve? Set a goal, add the tasks that get you there, and
            track your progress.
          </p>
        </div>
        <CreateGoalForm onCreated={handleCreated} />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {goals.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border/60 px-6 py-12 text-center">
          <Target className="mx-auto size-10 text-muted-foreground/50" aria-hidden="true" />
          <p className="mt-4 text-base font-medium text-foreground">No goals yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Start with one thing that matters — like becoming a software engineer, running a
            marathon, or saving for a trip.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
