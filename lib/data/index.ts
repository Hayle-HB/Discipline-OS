import { isApiDataSource } from "@/lib/data/config";
import { jsonDataProvider } from "@/lib/data/json-store";
import type { DataProvider } from "@/lib/data/provider";

export function getDataProvider(): DataProvider {
  if (isApiDataSource()) {
    throw new Error(
      "External API mode is enabled but not yet connected. " +
        "Implement lib/data/api-provider.ts and wire it here, " +
        "or set DISCIPLINE_OS_DATA_SOURCE=json to use demo data."
    );
  }
  return jsonDataProvider;
}

export { DATA_CONFIG, isApiDataSource } from "@/lib/data/config";
export { externalApiTemplate } from "@/lib/data/api-provider";
export type { DataProvider } from "@/lib/data/provider";
export type * from "@/lib/data/types";
export { computeDashboardStats } from "@/lib/data/compute";
export { withUpdatedTasks, replaceTaskInList } from "@/lib/data/dashboard";
export {
  applyTaskCompletion,
  computeDayMetrics,
  computeMonthMetrics,
  computeTaskStreak,
  getCompletionEntryForDate,
  getTaskStatusForDate,
  normalizeCompletionLog,
  normalizeTask,
} from "@/lib/data/task-completions";
export {
  buildMonthGrid,
  todayKey,
  toDateKey,
  formatDateLabel,
  formatTimeLabel,
  formatCompletedAt,
  MONTH_LABELS,
  WEEKDAY_LABELS,
} from "@/lib/data/dates";
export { groupTasksByPeriod, TASK_PERIODS, PERIOD_THEME } from "@/lib/data/task-periods";
