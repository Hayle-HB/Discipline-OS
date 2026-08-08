import demoData from "@/data/demo.json";

import { addDays, toDateKey, todayKey } from "@/lib/data/dates";
import type {
  AnalyticsData,
  DemoDataFile,
  Habit,
  Routine,
  Task,
} from "@/lib/data/types";
import { seedCompletionLog, normalizeCompletionLog } from "@/lib/data/task-completions";

export const DEMO_TEMPLATE_USER_ID = "1";

/** Immutable snapshot from demo.json — never mutated at runtime */
const baseline: DemoDataFile = structuredClone(demoData as DemoDataFile);

export function getBaselineDemoFile(): DemoDataFile {
  return baseline;
}

export function getBaselineTasks(): Task[] {
  return baseline.tasks[DEMO_TEMPLATE_USER_ID] ?? baseline.tasks.default ?? [];
}

export function getBaselineHabits(): Habit[] {
  return baseline.habits[DEMO_TEMPLATE_USER_ID] ?? [];
}

export function getBaselineRoutines(): Routine[] {
  return baseline.routines[DEMO_TEMPLATE_USER_ID] ?? [];
}

export function getBaselineAnalytics(): AnalyticsData {
  return structuredClone(
    baseline.analytics[DEMO_TEMPLATE_USER_ID] ?? baseline.analytics.default
  );
}

/** Clone template tasks for a new user bucket (per-user isolated data) */
export function cloneTasksForUser(tasks: Task[], userId: string): Task[] {
  return structuredClone(tasks).map((task) =>
    enrichTaskCompletionHistory({
      ...task,
      userId,
      completionLog: task.completionLog
        ? structuredClone(task.completionLog)
        : undefined,
    })
  );
}

export function cloneHabitsForUser(habits: Habit[], userId: string): Habit[] {
  return structuredClone(habits).map((h) => ({ ...h, userId }));
}

export function cloneRoutinesForUser(routines: Routine[], userId: string): Routine[] {
  return structuredClone(routines).map((r) => ({ ...r, userId }));
}

/** Deterministic pseudo-variation for demo calendar coloring */
function historyStatus(taskId: string, dayOffset: number): "done" | "missed" | null {
  if (dayOffset === 0) return null;
  const n = (taskId.charCodeAt(taskId.length - 1) + dayOffset * 7) % 10;
  if (n === 0 || n === 1) return "missed";
  if (n <= 7) return "done";
  return null;
}

/** Minimum log entries before we treat history as fully initialized */
const MIN_PERSISTED_HISTORY = 5;

/** Fill demo calendar history — merges with any existing user entries */
export function enrichTaskCompletionHistory(task: Task): Task {
  const existing = normalizeCompletionLog(task.completionLog);
  const hasFullHistory = Object.keys(existing).length >= MIN_PERSISTED_HISTORY;

  const backbone = seedCompletionLog({ ...task, completionLog: undefined });
  const log = hasFullHistory ? existing : { ...backbone, ...existing };

  if (task.period !== "daily") {
    return { ...task, completionLog: log };
  }

  if (hasFullHistory) {
    return { ...task, completionLog: log };
  }

  const today = new Date();
  const historyStart = Math.max(task.streak + 1, 4);

  for (let i = historyStart; i < 30; i++) {
    const date = addDays(today, -i);
    const key = toDateKey(date);
    if (log[key]) continue;

    const status = historyStatus(task.id, i);
    if (!status) continue;

    log[key] =
      status === "done"
        ? {
            status: "done",
            completedAt: new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              8 + (i % 5),
              15
            ).toISOString(),
            durationMinutes: task.estimatedMinutes ?? 20,
          }
        : { status: "missed" };
  }

  if (task.completed && !log[todayKey()]) {
    log[todayKey()] = {
      status: "done",
      completedAt: new Date().toISOString(),
      durationMinutes: task.estimatedMinutes,
    };
  }

  return { ...task, completionLog: log };
}

function needsReseed<T>(existing: T[] | undefined, template: T[]): boolean {
  if (!existing || existing.length === 0) return true;
  return existing.length < template.length;
}

export function ensureUserDemoBucket(
  store: DemoDataFile,
  userId: string
): DemoDataFile {
  const templateTasks = getBaselineTasks();
  const templateHabits = getBaselineHabits();
  const templateRoutines = getBaselineRoutines();

  if (needsReseed(store.tasks[userId], templateTasks)) {
    store.tasks[userId] = cloneTasksForUser(templateTasks, userId);
  }

  if (needsReseed(store.habits[userId], templateHabits)) {
    store.habits[userId] = cloneHabitsForUser(templateHabits, userId);
  }

  if (needsReseed(store.routines[userId], templateRoutines)) {
    store.routines[userId] = cloneRoutinesForUser(templateRoutines, userId);
  }

  if (!store.analytics[userId]) {
    store.analytics[userId] = getBaselineAnalytics();
  }

  return store;
}

/** Reset runtime store back to demo.json baseline (dev / demo reset) */
export function createFreshDemoStore(): DemoDataFile {
  const store = structuredClone(baseline);
  for (const userId of Object.keys(store.tasks)) {
    store.tasks[userId] = store.tasks[userId].map((task) =>
      enrichTaskCompletionHistory(task)
    );
  }
  return store;
}
