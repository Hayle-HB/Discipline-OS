"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AnalyticsSummaryCards,
  AnalyticsWeeklyChart,
  CategoryBreakdown,
  InsightsPanel,
  MonthlyTrend,
} from "@/components/dashboard/AnalyticsPanels";
import {
  DashboardLoading,
  useDashboardAuth,
} from "@/components/dashboard/DashboardLoading";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getAnalyticsData } from "@/lib/api/habits";
import type { AnalyticsData } from "@/lib/data/types";

export default function AnalyticsPage() {
  const { user, isAuthLoading } = useDashboardAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setData(await getAnalyticsData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user) loadAnalytics();
  }, [isAuthLoading, user, loadAnalytics]);

  if (isAuthLoading || isLoading) return <DashboardLoading />;
  if (!user || !data) return null;

  return (
    <DashboardShell user={user}>
      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 lg:py-10">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Personal Analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Understand your discipline patterns and where to improve.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <AnalyticsSummaryCards summary={data.summary} />

          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsWeeklyChart activity={data.weeklyActivity} />
            <MonthlyTrend scores={data.monthlyScores} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBreakdown categories={data.categoryBreakdown} />
            <InsightsPanel insights={data.insights} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
