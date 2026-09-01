"use client";

import { useMemo } from "react";

import { CalendarPanel } from "@/components/dashboard/calendar";
import type { SharedCalendarData } from "@/lib/data/types";
import { sharedCalendarToMetricsMap } from "@/lib/sharing/calendar-metrics";

interface SharedCalendarHeatmapProps {
  calendar: SharedCalendarData;
  className?: string;
  selectedDate?: string;
  onSelectedDateChange?: (dateKey: string) => void;
}

/** @deprecated Use CalendarPanel with metricsByDate instead. */
export function SharedCalendarHeatmap({
  calendar,
  className,
  selectedDate,
  onSelectedDateChange,
}: SharedCalendarHeatmapProps) {
  const metricsByDate = useMemo(
    () => sharedCalendarToMetricsMap(calendar),
    [calendar]
  );

  return (
    <CalendarPanel
      metricsByDate={metricsByDate}
      compact
      className={className}
      selectedDate={selectedDate}
      onSelectedDateChange={onSelectedDateChange}
    />
  );
}
