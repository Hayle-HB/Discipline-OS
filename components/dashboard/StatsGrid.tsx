import { CheckCircle2, Flame, Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/api/types";

interface StatsGridProps {
  stats: DashboardStats;
}

const statConfig = [
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
    format: (stats: DashboardStats) => `${stats.completed}/${stats.total}`,
  },
  {
    key: "bestStreak" as const,
    label: "Best Streak",
    icon: Flame,
    format: (stats: DashboardStats) => `${stats.bestStreak}d`,
  },
  {
    key: "score" as const,
    label: "Discipline Score",
    icon: Target,
    format: (stats: DashboardStats) => `${stats.score}%`,
  },
];

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {statConfig.map((stat, index) => (
        <Card
          key={stat.key}
          className="border-border/60 bg-card/50 backdrop-blur-sm animate-fade-up"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
              <stat.icon className="size-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-foreground">
                {stat.format(stats)}
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
