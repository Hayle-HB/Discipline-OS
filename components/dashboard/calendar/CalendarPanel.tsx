"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildMonthGrid,
  MONTH_LABELS,
  todayKey,
  viewDateForKey,
  WEEKDAY_LABELS,
  type CalendarCell,
} from "@/lib/data/dates";
import { computeMonthMetrics } from "@/lib/data/task-completions";
import type { Task } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface CalendarPanelProps {
  tasks: Task[];
  compact?: boolean;
  /** Controlled selected date (YYYY-MM-DD) */
  selectedDate?: string;
  onSelectedDateChange?: (dateKey: string) => void;
}

function rateColor(rate: number, hasData: boolean): string {
  if (!hasData) return "bg-secondary/40 text-muted-foreground";
  if (rate >= 80) return "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30";
  if (rate >= 50) return "bg-amber-500/15 text-amber-300 ring-amber-500/25";
  if (rate > 0) return "bg-red-500/15 text-red-300 ring-red-500/25";
  return "bg-secondary/60 text-muted-foreground";
}

export function CalendarPanel({
  tasks,
  compact = false,
  selectedDate,
  onSelectedDateChange,
}: CalendarPanelProps) {
  const [internalSelected, setInternalSelected] = useState(todayKey());
  const [viewDate, setViewDate] = useState(() => new Date());

  const selectedKey = selectedDate ?? internalSelected;

  useEffect(() => {
    if (selectedDate) {
      setViewDate(viewDateForKey(selectedDate));
    }
  }, [selectedDate]);

  const monthMetrics = useMemo(
    () => computeMonthMetrics(tasks, viewDate),
    [tasks, viewDate]
  );
  const grid = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  function selectDate(cell: CalendarCell) {
    if (onSelectedDateChange) {
      onSelectedDateChange(cell.dateKey);
    } else {
      setInternalSelected(cell.dateKey);
    }

    if (!cell.inCurrentMonth) {
      setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
  }

  function shiftMonth(delta: number) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  function goToToday() {
    const key = todayKey();
    setViewDate(new Date());
    if (onSelectedDateChange) {
      onSelectedDateChange(key);
    } else {
      setInternalSelected(key);
    }
  }

  return (
    <Card className="border-border/60 bg-card/50">
      <CardHeader className={cn("pb-3", compact && "py-4")}>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className={cn("font-medium", compact ? "text-sm" : "text-base")}>
            {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        {compact && (
          <p className="text-xs text-muted-foreground">
            Tap a date to load that day&apos;s tasks on the left.
          </p>
        )}
      </CardHeader>
      <CardContent className={cn(compact && "pt-0")}>
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {compact ? label.charAt(0) : label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell) => {
            const metrics = monthMetrics.get(cell.dateKey);
            const rate = metrics?.rate ?? 0;
            const hasData = (metrics?.total ?? 0) > 0;
            const isSelected = cell.dateKey === selectedKey;
            const isTodayCell = cell.dateKey === todayKey();

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => selectDate(cell)}
                aria-pressed={isSelected}
                aria-label={`Select ${cell.dateKey}`}
                className={cn(
                  "relative flex aspect-square w-full flex-col items-center justify-center rounded-lg text-xs transition-all",
                  "ring-1 ring-inset",
                  rateColor(rate, hasData && cell.inCurrentMonth),
                  !cell.inCurrentMonth && "opacity-40",
                  isSelected &&
                    "z-10 scale-[1.03] ring-2 ring-foreground shadow-sm",
                  isTodayCell && !isSelected && "font-semibold ring-foreground/30",
                  isTodayCell && isSelected && "font-semibold"
                )}
              >
                <span>{cell.date.getDate()}</span>
                {hasData && cell.inCurrentMonth && (
                  <span className="text-[9px] tabular-nums opacity-80">
                    {rate}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
