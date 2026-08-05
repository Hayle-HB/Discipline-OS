import { computeDashboardStats, syncRoutineCompletion } from "@/lib/data/compute";
import {
  applyTaskCompletion,
  normalizeTask,
} from "@/lib/data/task-completions";
import {
  ensureUserDemoBucket,
  enrichTaskCompletionHistory,
  createFreshDemoStore,
} from "@/lib/data/demo-seed";
import { todayKey } from "@/lib/data/dates";
import type { DataProvider } from "@/lib/data/provider";
import type {
  AnalyticsData,
  DemoDataFile,
  Habit,
  Routine,
  Task,
  TaskDayStatus,
  UserRecord,
} from "@/lib/data/types";

/** In-memory clone — mutations persist until server restart */
let store: DemoDataFile = createFreshDemoStore();

const passwordResetRequests = new Set<string>();

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function ensureUserData(userId: string) {
  store = ensureUserDemoBucket(store, userId);
}

function ensureTasks(userId: string): Task[] {
  ensureUserData(userId);
  return store.tasks[userId].map((t) =>
    normalizeTask(
      enrichTaskCompletionHistory({
        ...t,
        userId,
      })
    )
  );
}

function ensureHabits(userId: string): Habit[] {
  ensureUserData(userId);
  return (store.habits[userId] ?? []).map((h) => ({ ...h, userId }));
}

function ensureRoutines(userId: string): Routine[] {
  ensureUserData(userId);
  return (store.routines[userId] ?? []).map((r) => ({ ...r, userId }));
}

function getAnalyticsForUser(userId: string): AnalyticsData {
  ensureUserData(userId);
  return structuredClone(store.analytics[userId]!);
}

function updateWeeklyActivity(userId: string, progress: number) {
  ensureUserData(userId);
  const analytics = store.analytics[userId];
  if (analytics) {
    const weekly = [...analytics.weeklyActivity];
    if (weekly.length > 0) {
      weekly[weekly.length - 1] = progress;
    }
    store.analytics[userId] = { ...analytics, weeklyActivity: weekly };
  }
}

export const jsonDataProvider: DataProvider = {
  findUser(email, password) {
    return (
      store.users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      ) ?? null
    );
  },

  findUserById(id) {
    return store.users.find((u) => u.id === id) ?? null;
  },

  findUserByEmail(email) {
    return (
      store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
      null
    );
  },

  createUser(data) {
    const user: UserRecord = {
      id: String(store.users.length + 1),
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name.trim(),
      joinedAt: new Date().toISOString(),
    };
    store.users.push(user);
    ensureUserData(user.id);
    return user;
  },

  emailExists(email) {
    return this.findUserByEmail(email) !== null;
  },

  getTasks(userId) {
    return ensureTasks(userId);
  },

  addTask(userId, data) {
    ensureUserData(userId);
    const task: Task = {
      id: createId("t"),
      userId,
      label: data.label.trim(),
      description: data.description?.trim() || undefined,
      period: data.period,
      completed: false,
      streak: 0,
      category: data.category ?? "general",
      priority: data.priority ?? "medium",
      preferredTime: data.preferredTime || undefined,
      estimatedMinutes: data.estimatedMinutes,
      createdAt: new Date().toISOString(),
      completionLog: {},
    };
    store.tasks[userId].push(task);
    return task;
  },

  recordTaskCompletion(userId, id, status, date = todayKey()) {
    ensureUserData(userId);
    const task = store.tasks[userId]?.find((t) => t.id === id);
    if (!task) return null;

    const updated = applyTaskCompletion(
      normalizeTask({ ...task, userId }),
      status,
      date
    );
    task.completionLog = updated.completionLog;
    task.completed = updated.completed;
    task.streak = updated.streak;

    const stats = computeDashboardStats(this.getTasks(userId));
    updateWeeklyActivity(userId, stats.progress);

    return { ...task, userId };
  },

  toggleTask(userId, id) {
    ensureUserData(userId);
    const task = store.tasks[userId]?.find((t) => t.id === id);
    if (!task) return null;

    const normalized = normalizeTask({ ...task, userId });
    const status: TaskDayStatus = normalized.completed ? "missed" : "done";
    return this.recordTaskCompletion(userId, id, status);
  },

  updateTask(userId, id, data) {
    ensureUserData(userId);
    const task = store.tasks[userId]?.find((t) => t.id === id);
    if (!task) return null;

    if (data.label !== undefined) task.label = data.label.trim();
    if (data.period !== undefined) task.period = data.period;
    if (data.category !== undefined) task.category = data.category;
    if (data.description !== undefined) {
      task.description = data.description.trim() || undefined;
    }
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.preferredTime !== undefined) {
      task.preferredTime = data.preferredTime || undefined;
    }
    if (data.estimatedMinutes !== undefined) {
      task.estimatedMinutes = data.estimatedMinutes;
    }

    return { ...task };
  },

  deleteTask(userId, id) {
    ensureUserData(userId);
    const before = store.tasks[userId]?.length ?? 0;
    store.tasks[userId] = store.tasks[userId].filter((t) => t.id !== id);
    return (store.tasks[userId]?.length ?? 0) < before;
  },

  getCommitments(userId) {
    return this.getTasks(userId).map((t) => ({
      id: t.id,
      userId: t.userId,
      label: t.label,
      completed: t.completed,
      streak: t.streak,
      category: t.category,
      createdAt: t.createdAt,
    }));
  },

  getHabits(userId) {
    return ensureHabits(userId);
  },

  toggleHabit(userId, id) {
    ensureUserData(userId);
    const habit = store.habits[userId]?.find((h) => h.id === id);
    if (!habit) return null;

    habit.completedToday = !habit.completedToday;
    if (habit.completedToday) {
      habit.streak += 1;
      if (habit.streak > habit.longestStreak) habit.longestStreak = habit.streak;
    }

    return { ...habit, userId };
  },

  getRoutines(userId) {
    return ensureRoutines(userId);
  },

  toggleRoutineStep(userId, routineId, stepId) {
    ensureUserData(userId);
    const routine = store.routines[userId]?.find((r) => r.id === routineId);
    if (!routine) return null;

    const step = routine.steps.find((s) => s.id === stepId);
    if (!step) return null;

    step.completed = !step.completed;
    routine.completedToday = syncRoutineCompletion(routine.steps);

    return { ...routine, userId };
  },

  getAnalytics(userId) {
    const analytics = getAnalyticsForUser(userId);
    const stats = computeDashboardStats(this.getTasks(userId));

    return {
      ...analytics,
      weeklyActivity: analytics.weeklyActivity.map((v, i) =>
        i === analytics.weeklyActivity.length - 1 ? stats.progress : v
      ),
    };
  },
};

export function createMockToken(userId: string): string {
  return `mock_token_${userId}_${Date.now()}`;
}

export function parseMockToken(token: string): string | null {
  if (!token.startsWith("mock_token_")) return null;
  const rest = token.slice("mock_token_".length);
  const lastUnderscore = rest.lastIndexOf("_");
  if (lastUnderscore === -1) return null;
  return rest.slice(0, lastUnderscore);
}

export function requestPasswordReset(email: string) {
  passwordResetRequests.add(email.toLowerCase());
}

/** Reset in-memory store to demo.json baseline (development) */
export function resetDemoStore() {
  store = createFreshDemoStore();
}
