"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AnalyticsSummaryCards,
  AnalyticsWeeklyChart,
  CategoryBreakdown,
  InsightsPanel,
  MonthlyTrend,
} from "@/components/dashboard/AnalyticsPanels";
import { DashboardContentLoading } from "@/components/dashboard/DashboardLoading";
import { getAnalyticsData } from "@/lib/api/habits";
import type { AnalyticsData } from "@/lib/data/types";

export default function AnalyticsPage() {
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
    loadAnalytics();
  }, [loadAnalytics]);

  if (isLoading) return <DashboardContentLoading />;
  if (!data) return null;

  return (
    <div className="dashboard-page">
        <div className="animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Personal Analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Understand your discipline patterns and where to improve.
          </p>
        </div>

        <div className="mt-5 space-y-5 sm:mt-8 sm:space-y-6">
          <AnalyticsSummaryCards summary={data.summary} />

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            <AnalyticsWeeklyChart activity={data.weeklyActivity} />
            <MonthlyTrend scores={data.monthlyScores} />
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            <CategoryBreakdown categories={data.categoryBreakdown} />
            <InsightsPanel insights={data.insights} />
          </div>
        </div>
    </div>
  );
}
