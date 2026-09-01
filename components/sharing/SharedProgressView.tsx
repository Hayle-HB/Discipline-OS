"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  Flame,
  ListTodo,
  MessageCircle,
  Repeat,
  Target,
  X,
} from "lucide-react";

import { CalendarPanel } from "@/components/dashboard/calendar";
import { SharedGoalsSection } from "@/components/goals/SharedGoalsSection";
import { ShareCommentsPanel } from "@/components/sharing/ShareCommentsPanel";
import { Button } from "@/components/ui/button";
import { formatDateLabel, todayKey } from "@/lib/data/dates";
import { getTaskStatusForDate } from "@/lib/data/task-completions";
import type { SharedProgressPayload, SharedTasksData } from "@/lib/data/types";
import { sharedCalendarToMetricsMap } from "@/lib/sharing/calendar-metrics";
import { SHARE_RESOURCES } from "@/lib/sharing/resources";
import { cn } from "@/lib/utils";

interface SharedProgressViewProps {
  payload: SharedProgressPayload;
  hideHeader?: boolean;
}

type DetailTab = "tasks" | "habits" | "analytics" | "goals" | "comments";

function resourceLabel(id: string): string {
  return SHARE_RESOURCES.find((resource) => resource.id === id)?.label ?? id;
}

export function SharedProgressView({
  payload,
  hideHeader = false,
}: SharedProgressViewProps) {
  const { ownerName, resources, data, shareId } = payload;
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const calendarMetrics = useMemo(
    () => (data.calendar ? sharedCalendarToMetricsMap(data.calendar) : undefined),
    [data.calendar]
  );

  const availableTabs = useMemo(() => {
    const tabs: DetailTab[] = [];
    if (data.tasks) tabs.push("tasks");
    if (data.habits) tabs.push("habits");
    if (data.analytics) tabs.push("analytics");
    if (data.goals) tabs.push("goals");
    if (shareId) tabs.push("comments");
    return tabs;
  }, [data.tasks, data.habits, data.analytics, data.goals, shareId]);

  const [activeTab, setActiveTab] = useState<DetailTab>(
    availableTabs[0] ?? "comments"
  );

  useEffect(() => {
    if (!availableTabs.includes(activeTab) && availableTabs.length > 0) {
      setActiveTab(availableTabs[0]);
    }
  }, [activeTab, availableTabs]);

  const isToday = selectedDate === todayKey();
  const dateLabel = formatDateLabel(selectedDate);

  const hasLeftColumn =
    Boolean(data.streak || data.discipline_score) || availableTabs.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {!hideHeader && (
        <header className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Shared progress
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {ownerName}
            </h2>
          </div>
          <ResourcePills resources={resources} />
        </header>
      )}

      {hideHeader && <ResourcePills resources={resources} compact />}

      <div
        className={cn(
          "grid gap-5 sm:gap-6",
          data.calendar && hasLeftColumn && "lg:grid-cols-5"
        )}
      >
        {hasLeftColumn && (
        <div className="order-2 space-y-5 sm:space-y-6 lg:order-none lg:col-span-3">
          {(data.streak || data.discipline_score) && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {data.streak && (
                <MiniStat
                  icon={<Flame className="size-3.5 text-orange-400" />}
                  label="Current streak"
                  value={data.streak.currentStreak}
                  suffix="d"
                />
              )}
              {data.streak && (
                <MiniStat
                  icon={<Flame className="size-3.5 text-orange-300/80" />}
                  label="Best streak"
                  value={data.streak.bestStreak}
                  suffix="d"
                />
              )}
              {data.discipline_score && (
                <MiniStat
                  icon={<Target className="size-3.5" />}
                  label="Discipline"
                  value={data.discipline_score.score}
                  suffix="%"
                />
              )}
            </div>
          )}

          {availableTabs.length > 0 && (
            <section
              className={cn(
                "overflow-hidden rounded-2xl border border-border/60 bg-card/40",
                activeTab === "comments" &&
                  "flex h-[min(420px,52vh)] flex-col sm:h-[min(480px,56vh)]"
              )}
            >
              <div className="scroll-tabs shrink-0 border-b border-border/60 px-3 py-2">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      activeTab === tab
                        ? "bg-foreground text-background"
                        : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "tasks" && <ListTodo className="size-3.5" />}
                    {tab === "habits" && <Repeat className="size-3.5" />}
                    {tab === "analytics" && <BarChart3 className="size-3.5" />}
                    {tab === "goals" && <Target className="size-3.5" />}
                    {tab === "comments" && <MessageCircle className="size-3.5" />}
                    {tab === "tasks"
                      ? "Daily tasks"
                      : tab === "habits"
                        ? "Habits"
                        : tab === "analytics"
                          ? "Insights"
                          : tab === "goals"
                            ? "Goals"
                            : "Comments"}
                  </button>
                ))}
              </div>

              <div
                className={cn(
                  "p-4 sm:p-5",
                  activeTab === "comments" && "flex min-h-0 flex-1 flex-col p-0"
                )}
              >
                {activeTab === "tasks" && data.tasks && (
                  <TasksSection
                    tasks={data.tasks.tasks}
                    selectedDate={selectedDate}
                    isToday={isToday}
                    dateLabel={dateLabel}
                    onBackToToday={() => setSelectedDate(todayKey())}
                  />
                )}

                {activeTab === "habits" && data.habits && (
                  <HabitsSection habits={data.habits} />
                )}

                {activeTab === "analytics" && data.analytics && (
                  <AnalyticsSection analytics={data.analytics} />
                )}

                {activeTab === "goals" && data.goals && (
                  <SharedGoalsSection goals={data.goals.goals} />
                )}

                {activeTab === "comments" && shareId && (
                  <ShareCommentsPanel shareId={shareId} partnerName={ownerName} />
                )}
              </div>
            </section>
          )}
        </div>
        )}

        {data.calendar && calendarMetrics && (
        <div
          className={cn(
            "order-1 space-y-4 sm:space-y-5 lg:order-none",
            hasLeftColumn ? "lg:col-span-2" : "max-w-2xl"
          )}
        >
            <CalendarPanel
              metricsByDate={calendarMetrics}
              compact
              selectedDate={selectedDate}
              onSelectedDateChange={setSelectedDate}
            />

          {data.calendar && (
            <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarDays className="size-4 text-muted-foreground" />
                Tracking summary
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                <SummaryItem label="Tracked" value={data.calendar.summary.daysTracked} />
                <SummaryItem label="Done" value={data.calendar.summary.totalDone} />
                <SummaryItem label="Missed" value={data.calendar.summary.totalMissed} />
              </dl>
            </div>
          )}

          {data.streak && !data.discipline_score && (
            <SideStatCard
              title="Active tasks"
              value={data.streak.activeTasks}
              icon={<ListTodo className="size-4" />}
            />
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function ResourcePills({
  resources,
  compact = false,
}: {
  resources: string[];
  compact?: boolean;
}) {
  return (
    <div className={cn("scroll-tabs", compact ? "py-0" : "py-0.5")}>
      {resources.map((resource) => (
        <span
          key={resource}
          className="inline-flex shrink-0 items-center rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
        >
          {resourceLabel(resource)}
        </span>
      ))}
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  suffix = "",
}: {
  icon?: ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 px-3 py-3 sm:px-4 sm:py-4">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
        {suffix && (
          <span className="text-sm font-medium text-muted-foreground">{suffix}</span>
        )}
      </p>
    </div>
  );
}

function SideStatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/30 px-2 py-2">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function TasksSection({
  tasks,
  selectedDate,
  isToday,
  dateLabel,
  onBackToToday,
}: {
  tasks: SharedTasksData["tasks"];
  selectedDate: string;
  isToday: boolean;
  dateLabel: string;
  onBackToToday: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            {isToday ? "Today" : dateLabel}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            View-only snapshot for the selected day.
          </p>
        </div>
        {!isToday && (
          <Button type="button" variant="outline" size="sm" onClick={onBackToToday}>
            Today
          </Button>
        )}
      </div>

      <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-background/40">
        {tasks.map((task) => {
          const status = getTaskStatusForDate(
            { ...task, userId: "", category: task.category, createdAt: "" },
            selectedDate
          );
          return (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{task.label}</p>
                {task.streak > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{task.streak}d streak</p>
                )}
              </div>
              <StatusBadge status={status} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HabitsSection({
  habits,
}: {
  habits: NonNullable<SharedProgressPayload["data"]["habits"]>;
}) {
  return (
    <div className="space-y-4">
      {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => {
        const items = habits.tasksByPeriod[period] ?? [];
        if (items.length === 0) return null;
        return (
          <div key={period}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {period}
            </p>
            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-background/40">
              {items.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <p className="truncate text-sm text-foreground">{task.label}</p>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {task.streak}d
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsSection({
  analytics,
}: {
  analytics: NonNullable<SharedProgressPayload["data"]["analytics"]>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <MiniStat label="Current streak" value={analytics.summary.currentStreak} suffix="d" />
        <MiniStat label="Longest streak" value={analytics.summary.longestStreak} suffix="d" />
        <MiniStat label="Average score" value={analytics.summary.averageScore} suffix="%" />
        <MiniStat label="Days tracked" value={analytics.summary.daysTracked} />
      </div>
      {analytics.insights.length > 0 && (
        <ul className="space-y-2">
          {analytics.insights.map((insight) => (
            <li
              key={insight}
              className="rounded-xl border border-border/60 bg-secondary/20 px-3 py-2.5 text-sm text-muted-foreground"
            >
              {insight}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "done" | "missed" | null }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wide",
        status === "done" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        status === "missed" && "bg-red-500/10 text-red-700 dark:text-red-400",
        !status && "bg-secondary text-muted-foreground"
      )}
    >
      {status === "done" ? (
        <>
          <Check className="size-3" aria-hidden="true" />
          Done
        </>
      ) : status === "missed" ? (
        <>
          <X className="size-3" aria-hidden="true" />
          Missed
        </>
      ) : (
        "Pending"
      )}
    </span>
  );
}
