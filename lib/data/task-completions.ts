import {
  addDays,
  getISOWeekKey,
  getMonthKey,
  getYearKey,
  parseDateKey,
  todayKey,
  toDateKey,
} from "@/lib/data/dates";
import type {
  Task,
  TaskCompletionEntry,
  TaskDayStatus,
  TaskPeriod,
} from "@/lib/data/types";

export type CompletionLog = Record<string, TaskCompletionEntry>;

/** Migrate legacy string logs to TaskCompletionEntry objects */
export function normalizeCompletionLog(
  log?: Record<string, TaskDayStatus | TaskCompletionEntry>
): CompletionLog {
  if (!log) return {};
  const out: CompletionLog = {};
  for (const [key, value] of Object.entries(log)) {
    out[key] =
      typeof value === "string" ? { status: value } : { ...value };
  }
  return out;
}

export function getPeriodLogKey(date: Date, period: TaskPeriod): string {
  switch (period) {
    case "daily":
      return toDateKey(date);
    case "weekly":
      return getISOWeekKey(date);
    case "monthly":
      return getMonthKey(date);
    case "yearly":
      return getYearKey(date);
  }
}

export function getCompletionEntryForDate(
  task: Task,
  dateKey: string
): TaskCompletionEntry | null {
  const log = normalizeCompletionLog(task.completionLog);
  const periodKey = getPeriodLogKey(parseDateKey(dateKey), task.period);
  return log[periodKey] ?? null;
}

export function getTaskStatusForDate(
  task: Task,
  dateKey: string
): TaskDayStatus | null {
  return getCompletionEntryForDate(task, dateKey)?.status ?? null;
}

export function isTaskDoneOnDate(task: Task, dateKey: string): boolean {
  return getTaskStatusForDate(task, dateKey) === "done";
}

/**
 * Current streak = consecutive "done" periods ending at the reference period.
 * - Today done → includes today.
 * - Today pending → counts from yesterday (grace until you log today).
 * - Today missed → streak is broken (0).
 */
export function computeTaskStreak(
  task: Pick<Task, "period" | "completionLog">,
  referenceDate: Date = new Date()
): number {
  const log = normalizeCompletionLog(task.completionLog);
  const todayPeriodKey = getPeriodLogKey(parseDateKey(todayKey()), task.period);
  let cursor = new Date(referenceDate);
  const refKey = getPeriodLogKey(cursor, task.period);
  const refEntry = log[refKey];

  if (refKey === todayPeriodKey) {
    if (refEntry?.status === "missed") {
      return 0;
    }
    if (refEntry?.status !== "done") {
      cursor = stepPeriodBack(cursor, task.period);
    }
  } else if (refEntry?.status === "missed") {
    return 0;
  } else if (refEntry?.status !== "done") {
    cursor = stepPeriodBack(cursor, task.period);
  }

  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const key = getPeriodLogKey(cursor, task.period);
    if (log[key]?.status === "done") {
      streak++;
      cursor = stepPeriodBack(cursor, task.period);
    } else {
      break;
    }
  }

  return streak;
}

export function stepPeriodBack(date: Date, period: TaskPeriod): Date {
  switch (period) {
    case "weekly":
      return addDays(date, -7);
    case "monthly":
      return new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
    case "yearly":
      return new Date(date.getFullYear() - 1, date.getMonth(), date.getDate());
    default:
      return addDays(date, -1);
  }
}

export function normalizeTask(task: Task, referenceDate = new Date()): Task {
  const completionLog = normalizeCompletionLog(task.completionLog);
  const today = todayKey();
  const todayPeriodKey = getPeriodLogKey(parseDateKey(today), task.period);
  const completed = completionLog[todayPeriodKey]?.status === "done";

  return {
    ...task,
    completionLog,
    completed,
    streak: computeTaskStreak({ ...task, completionLog }, referenceDate),
  };
}

/** Seed consecutive "done" periods for demo tasks that have no log yet */
export function seedCompletionLog(task: Task): CompletionLog {
  const log = normalizeCompletionLog(task.completionLog);
  if (Object.keys(log).length > 0 || task.streak <= 0) return log;

  const period = task.period;
  let cursor = new Date();
  let remaining = task.streak;

  if (task.completed) {
    log[getPeriodLogKey(cursor, period)] = {
      status: "done",
      completedAt: new Date().toISOString(),
      durationMinutes: task.estimatedMinutes,
    };
    remaining = task.streak - 1;
    cursor = stepPeriodBack(cursor, period);
  } else {
    cursor = stepPeriodBack(cursor, period);
  }

  for (let i = 0; i < remaining; i++) {
    const key = getPeriodLogKey(cursor, period);
    if (!log[key]) {
      log[key] = { status: "done" };
    }
    cursor = stepPeriodBack(cursor, period);
  }

  return log;
}

export function applyTaskCompletion(
  task: Task,
  status: TaskDayStatus,
  dateKey: string = todayKey()
): Task {
  const completionLog = normalizeCompletionLog(task.completionLog);
  const periodKey = getPeriodLogKey(parseDateKey(dateKey), task.period);
  const previous = completionLog[periodKey];

  if (previous?.status === status) {
    return normalizeTask(task, parseDateKey(dateKey));
  }

  if (status === "done") {
    completionLog[periodKey] = {
      status: "done",
      completedAt: new Date().toISOString(),
      durationMinutes: task.estimatedMinutes,
    };
  } else {
    completionLog[periodKey] = { status: "missed" };
  }

  return normalizeTask({ ...task, completionLog }, parseDateKey(dateKey));
}

export interface DayMetrics {
  dateKey: string;
  done: number;
  missed: number;
  pending: number;
  total: number;
  rate: number;
}

export function computeDayMetrics(tasks: Task[], dateKey: string): DayMetrics {
  const dailyTasks = tasks.filter((t) => t.period === "daily");
  let done = 0;
  let missed = 0;

  for (const task of dailyTasks) {
    const status = getTaskStatusForDate(task, dateKey);
    if (status === "done") done++;
    else if (status === "missed") missed++;
  }

  const total = dailyTasks.length;
  const pending = total - done - missed;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  return { dateKey, done, missed, pending, total, rate };
}

export function computeMonthMetrics(
  tasks: Task[],
  viewDate: Date
): Map<string, DayMetrics> {
  const map = new Map<string, DayMetrics>();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= lastDay; day++) {
    const dateKey = toDateKey(new Date(year, month, day));
    map.set(dateKey, computeDayMetrics(tasks, dateKey));
  }

  return map;
}
