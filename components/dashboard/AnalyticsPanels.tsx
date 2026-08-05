import type { AnalyticsData } from "@/lib/data/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeekOverview } from "@/components/dashboard/WeekOverview";

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsData["summary"];
}

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const cards = [
    { label: "Days Tracked", value: summary.daysTracked },
    { label: "Current Streak", value: `${summary.currentStreak}d` },
    { label: "Longest Streak", value: `${summary.longestStreak}d` },
    { label: "Avg. Score", value: `${summary.averageScore}%` },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.label}
          className="border-border/60 bg-card/50 animate-fade-up"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <CardContent className="p-5">
            <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface MonthlyTrendProps {
  scores: AnalyticsData["monthlyScores"];
}

export function MonthlyTrend({ scores }: MonthlyTrendProps) {
  const max = Math.max(...scores.map((s) => s.score), 1);

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          {scores.map((entry) => (
            <div key={entry.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-foreground">
                {entry.score}%
              </span>
              <div className="flex h-28 w-full items-end justify-center">
                <div
                  className="w-full max-w-[2.5rem] rounded-md bg-foreground/80 transition-all"
                  style={{ height: `${(entry.score / max) * 100}%` }}
                />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {entry.month}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryBreakdownProps {
  categories: AnalyticsData["categoryBreakdown"];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">By Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat) => {
          const pct = Math.round((cat.completed / cat.total) * 100);
          return (
            <div key={cat.category}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-foreground">{cat.category}</span>
                <span className="text-muted-foreground">
                  {cat.completed}/{cat.total} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface InsightsPanelProps {
  insights: string[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Discipline Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight, i) => (
            <li
              key={i}
              className="rounded-lg border border-border bg-background/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
            >
              {insight}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function AnalyticsWeeklyChart({
  activity,
}: {
  activity: number[];
}) {
  return <WeekOverview activity={activity} />;
}
