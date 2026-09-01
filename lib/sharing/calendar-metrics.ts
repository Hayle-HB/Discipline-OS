import type { DayMetrics } from "@/lib/data/task-completions";
import type { SharedCalendarData } from "@/lib/data/types";

export function sharedCalendarToMetricsMap(
  calendar: SharedCalendarData
): Map<string, DayMetrics> {
  return new Map(calendar.days.map((day) => [day.dateKey, day]));
}
