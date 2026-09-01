"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildMonthGrid,
  buildWeekDays,
  formatDateLabel,
  formatWeekRange,
  MONTH_LABELS,
  parseDateKey,
  todayKey,
  toDateKey,
  addDays,
  WEEKDAY_LABELS,
  type CalendarCell,
  type CalendarViewMode,
} from "@/lib/data/dates";
import {
  DISCIPLINE_LEVEL_LABELS,
  getDisciplineLevel,
} from "@/lib/data/discipline-level";
import {
  computeDayMetrics,
  type DayMetrics,
} from "@/lib/data/task-completions";
import type { Task } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface CalendarPanelProps {
  tasks?: Task[];
  metricsByDate?: Map<string, DayMetrics>;
  compact?: boolean;
  selectedDate?: string;
  onSelectedDateChange?: (dateKey: string) => void;
  className?: string;
}

const VIEW_MODES: { id: CalendarViewMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function CalendarPanel({
  tasks,
  metricsByDate,
  compact = false,
  selectedDate,
  onSelectedDateChange,
  className,
}: CalendarPanelProps) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [internalSelected, setInternalSelected] = useState(todayKey());
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(() => new Date());

  const selectedKey = selectedDate ?? internalSelected;

  useEffect(() => {
    if (selectedDate) {
      const parsed = parseDateKey(selectedDate);
      setAnchorDate(parsed);
      setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    }
  }, [selectedDate]);

  const weekDays = useMemo(() => buildWeekDays(anchorDate), [anchorDate]);
  const monthGrid = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const getMetrics = useMemo(() => {
    return (dateKey: string): DayMetrics => {
      const preset = metricsByDate?.get(dateKey);
      if (preset) return preset;
      if (tasks?.length) return computeDayMetrics(tasks, dateKey);
      return { dateKey, done: 0, missed: 0, pending: 0, total: 0, rate: 0 };
    };
  }, [metricsByDate, tasks]);

  const selectedMetrics = useMemo(
    () => getMetrics(selectedKey),
    [getMetrics, selectedKey]
  );

  function selectDate(dateKey: string, date: Date) {
    if (onSelectedDateChange) {
      onSelectedDateChange(dateKey);
    } else {
      setInternalSelected(dateKey);
    }
    setAnchorDate(date);
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function goToToday() {
    const key = todayKey();
    const now = new Date();
    setAnchorDate(now);
    setViewDate(now);
    if (onSelectedDateChange) {
      onSelectedDateChange(key);
    } else {
      setInternalSelected(key);
    }
  }

  function navigate(delta: number) {
    if (viewMode === "day") {
      const next = addDays(anchorDate, delta);
      selectDate(toDateKey(next), next);
      return;
    }
    if (viewMode === "week") {
      const base = new Date(anchorDate);
      base.setDate(base.getDate() + delta * 7);
      setAnchorDate(base);
      setViewDate(new Date(base.getFullYear(), base.getMonth(), 1));
      return;
    }
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  const headerTitle =
    viewMode === "day"
      ? formatDateLabel(selectedKey)
      : viewMode === "week"
        ? formatWeekRange(anchorDate)
        : `${MONTH_LABELS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  return (
    <Card className={cn("border-border/60 bg-card/50", className)}>
      <CardHeader className="space-y-2.5 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="truncate text-sm font-semibold tracking-tight">
            {headerTitle}
          </CardTitle>
          <div className="flex shrink-0 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => navigate(-1)}
              aria-label={`Previous ${viewMode}`}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => navigate(1)}
              aria-label={`Next ${viewMode}`}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div
          className="grid grid-cols-3 gap-1 rounded-lg bg-secondary/40 p-1"
          role="tablist"
          aria-label="Calendar view"
        >
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={viewMode === mode.id}
              onClick={() => setViewMode(mode.id)}
              className={cn(
                "rounded-md py-1.5 text-xs font-medium transition-colors",
                viewMode === mode.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {compact && viewMode === "week" && (
          <p className="text-[11px] text-muted-foreground">
            Tap a day — dot color shows discipline intensity.
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-4 pt-0 sm:px-4">
        {viewMode === "day" && (
          <DayView
            metrics={selectedMetrics}
            selectedKey={selectedKey}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            days={weekDays}
            getMetrics={getMetrics}
            selectedKey={selectedKey}
            onSelect={selectDate}
          />
        )}

        {viewMode === "month" && (
          <MonthView
            grid={monthGrid}
            getMetrics={getMetrics}
            selectedKey={selectedKey}
            onSelect={selectDate}
          />
        )}

        {viewMode !== "day" && <DisciplineLegend compact={viewMode === "week"} />}
      </CardContent>
    </Card>
  );
}

function DayView({
  metrics,
  selectedKey,
}: {
  metrics: DayMetrics;
  selectedKey: string;
}) {
  const level = getDisciplineLevel(metrics.rate);
  const hasTasks = metrics.total > 0;

  return (
    <div className="flex flex-col items-center rounded-lg border border-border/50 bg-secondary/20 px-4 py-5">
      <span
        className={cn(
          "discipline-dot mb-3 !size-4",
          hasTasks ? `discipline-level-${level}` : "discipline-dot-empty"
        )}
        aria-hidden="true"
      />
      <p className="text-3xl font-bold tabular-nums tracking-tight">
        {metrics.rate}%
      </p>
      <p className="mt-1 text-xs text-muted-foreground">discipline score</p>
      <div className="mt-4 flex gap-4 text-center text-xs">
        <div>
          <p className="font-semibold tabular-nums text-foreground">{metrics.done}</p>
          <p className="text-muted-foreground">done</p>
        </div>
        <div>
          <p className="font-semibold tabular-nums text-foreground">{metrics.pending}</p>
          <p className="text-muted-foreground">pending</p>
        </div>
        <div>
          <p className="font-semibold tabular-nums text-foreground">{metrics.missed}</p>
          <p className="text-muted-foreground">missed</p>
        </div>
      </div>
      {!hasTasks && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          No daily tasks for {formatDateLabel(selectedKey).toLowerCase()}.
        </p>
      )}
    </div>
  );
}

function WeekView({
  days,
  getMetrics,
  selectedKey,
  onSelect,
}: {
  days: CalendarCell[];
  getMetrics: (dateKey: string) => DayMetrics;
  selectedKey: string;
  onSelect: (dateKey: string, date: Date) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((cell, index) => (
        <div key={cell.dateKey} className="flex flex-col items-center">
          <span className="mb-1 text-[10px] font-medium text-muted-foreground">
            {WEEKDAY_LABELS[index].charAt(0)}
          </span>
          <HeatmapDayCell
            cell={cell}
            metrics={getMetrics(cell.dateKey)}
            isSelected={cell.dateKey === selectedKey}
            isTodayCell={cell.dateKey === todayKey()}
            showRate={cell.dateKey === selectedKey}
            onSelect={() => onSelect(cell.dateKey, cell.date)}
          />
        </div>
      ))}
    </div>
  );
}

function MonthView({
  grid,
  getMetrics,
  selectedKey,
  onSelect,
}: {
  grid: CalendarCell[];
  getMetrics: (dateKey: string) => DayMetrics;
  selectedKey: string;
  onSelect: (dateKey: string, date: Date) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[10px] font-medium text-muted-foreground"
          >
            {label.charAt(0)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-x-0.5 gap-y-1">
        {grid.map((cell) => (
          <HeatmapDayCell
            key={cell.dateKey}
            cell={cell}
            metrics={getMetrics(cell.dateKey)}
            isSelected={cell.dateKey === selectedKey}
            isTodayCell={cell.dateKey === todayKey()}
            showRate={cell.dateKey === selectedKey}
            dimmed={!cell.inCurrentMonth}
            onSelect={() => onSelect(cell.dateKey, cell.date)}
          />
        ))}
      </div>
    </>
  );
}

function HeatmapDayCell({
  cell,
  metrics,
  isSelected,
  isTodayCell,
  showRate,
  dimmed,
  onSelect,
}: {
  cell: CalendarCell;
  metrics?: DayMetrics;
  isSelected: boolean;
  isTodayCell: boolean;
  showRate: boolean;
  dimmed?: boolean;
  onSelect: () => void;
}) {
  const rate = metrics?.rate ?? 0;
  const hasTasks = (metrics?.total ?? 0) > 0;
  const level = getDisciplineLevel(rate);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`${cell.dateKey}, ${rate}% discipline`}
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-md py-1 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        dimmed && "opacity-35",
        isSelected && "calendar-heatmap-selected",
        !isSelected && isTodayCell && "ring-1 ring-foreground/25"
      )}
    >
      <span
        className={cn(
          "text-[10px] tabular-nums leading-none",
          isSelected ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {cell.date.getDate()}
      </span>
      <span
        className={cn(
          "discipline-dot my-0.5",
          hasTasks ? `discipline-level-${level}` : "discipline-dot-empty"
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "h-3 text-[9px] font-medium tabular-nums leading-none",
          showRate && hasTasks ? "text-foreground/80" : "text-transparent"
        )}
      >
        {showRate && hasTasks ? `${rate}%` : "·"}
      </span>
    </button>
  );
}

function DisciplineLegend({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-1.5 border-t border-border/50",
        compact ? "pt-2" : "pt-3"
      )}
    >
      <span className="mr-1 text-[10px] text-muted-foreground">Less</span>
      {([0, 1, 2, 3, 4] as const).map((level) => (
        <span
          key={level}
          title={DISCIPLINE_LEVEL_LABELS[level]}
          className={cn(
            "discipline-dot discipline-dot-legend",
            `discipline-level-${level}`,
            level === 0 && "discipline-dot-empty"
          )}
          aria-hidden="true"
        />
      ))}
      <span className="ml-1 text-[10px] text-muted-foreground">More</span>
    </div>
  );
}
