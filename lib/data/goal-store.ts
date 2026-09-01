import { randomBytes } from "crypto";

import type {
  CreateGoalPayload,
  CreateGoalTaskPayload,
  GoalDetail,
  GoalSummary,
  GoalTask,
  UpdateGoalPayload,
  UpdateGoalTaskPayload,
} from "@/lib/data/types";

interface StoredGoal extends GoalDetail {
  userId: string;
}

function newId() {
  return randomBytes(12).toString("hex");
}

function daysRemaining(deadline?: string | null): number | null {
  if (!deadline) return null;
  const deadlineDate = new Date(`${deadline.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(deadlineDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((deadlineDate.getTime() - today.getTime()) / 86_400_000);
}

function computeProgress(tasks: GoalTask[]) {
  if (tasks.length === 0) return { progressPercent: 0, tasksTotal: 0, tasksCompleted: 0 };
  const tasksCompleted = tasks.filter((task) => task.completed).length;
  return {
    progressPercent: Math.round((tasksCompleted / tasks.length) * 100),
    tasksTotal: tasks.length,
    tasksCompleted,
  };
}

function toSummary(goal: StoredGoal): GoalSummary {
  const { tasks, userId: _, ...summary } = goal;
  const progress = computeProgress(tasks);
  return {
    ...summary,
    ...progress,
    daysRemaining: daysRemaining(summary.deadline),
  };
}

class GoalStore {
  private goals = new Map<string, StoredGoal>();

  listGoals(userId: string): GoalSummary[] {
    return [...this.goals.values()]
      .filter((goal) => goal.userId === userId && goal.status === "active")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toSummary);
  }

  getGoal(userId: string, goalId: string): GoalDetail | null {
    const goal = this.goals.get(goalId);
    if (!goal || goal.userId !== userId || goal.status !== "active") return null;
    const { userId: _, ...detail } = goal;
    return {
      ...detail,
      ...computeProgress(goal.tasks),
      daysRemaining: daysRemaining(goal.deadline),
    };
  }

  createGoal(userId: string, payload: CreateGoalPayload): GoalDetail {
    const now = new Date().toISOString();
    const goal: StoredGoal = {
      id: newId(),
      userId,
      title: payload.title.trim(),
      description: payload.description?.trim() || undefined,
      why: payload.why?.trim() || undefined,
      deadline: payload.deadline || undefined,
      category: payload.category ?? "personal",
      priority: payload.priority ?? "medium",
      status: "active",
      progressPercent: 0,
      tasksTotal: 0,
      tasksCompleted: 0,
      daysRemaining: daysRemaining(payload.deadline),
      tasks: [],
      createdAt: now,
      updatedAt: now,
    };
    this.goals.set(goal.id, goal);
    const { userId: _, ...detail } = goal;
    return detail;
  }

  updateGoal(userId: string, goalId: string, payload: UpdateGoalPayload): GoalDetail | null {
    const goal = this.getGoal(userId, goalId);
    if (!goal) return null;
    const stored = this.goals.get(goalId)!;

    const updated: StoredGoal = {
      ...stored,
      title: payload.title?.trim() ?? goal.title,
      description:
        payload.description !== undefined
          ? payload.description.trim() || undefined
          : goal.description,
      why: payload.why !== undefined ? payload.why.trim() || undefined : goal.why,
      deadline: payload.deadline !== undefined ? payload.deadline || undefined : goal.deadline,
      category: payload.category ?? goal.category,
      priority: payload.priority ?? goal.priority,
      updatedAt: new Date().toISOString(),
      daysRemaining: daysRemaining(
        payload.deadline !== undefined ? payload.deadline : goal.deadline
      ),
    };
    this.goals.set(goalId, updated);
    const { userId: _, ...detail } = updated;
    return detail;
  }

  deleteGoal(userId: string, goalId: string): boolean {
    const goal = this.goals.get(goalId);
    if (!goal || goal.userId !== userId) return false;
    this.goals.set(goalId, { ...goal, status: "archived", updatedAt: new Date().toISOString() });
    return true;
  }

  createTask(
    userId: string,
    goalId: string,
    payload: CreateGoalTaskPayload
  ): GoalTask | null {
    const goal = this.getGoal(userId, goalId);
    if (!goal) return null;

    const now = new Date().toISOString();
    const task: GoalTask = {
      id: newId(),
      goalId,
      title: payload.title.trim(),
      description: payload.description?.trim() || undefined,
      completed: false,
      sortOrder: goal.tasks.length,
      createdAt: now,
      updatedAt: now,
    };

    const stored = this.goals.get(goalId)!;
    const updated: StoredGoal = {
      ...stored,
      tasks: [...goal.tasks, task],
      updatedAt: now,
      ...computeProgress([...goal.tasks, task]),
    };
    this.goals.set(goalId, updated);
    return task;
  }

  updateTask(
    userId: string,
    goalId: string,
    taskId: string,
    payload: UpdateGoalTaskPayload
  ): GoalTask | null {
    const goal = this.getGoal(userId, goalId);
    if (!goal) return null;

    const index = goal.tasks.findIndex((task) => task.id === taskId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    const current = goal.tasks[index];
    const updatedTask: GoalTask = {
      ...current,
      title: payload.title?.trim() ?? current.title,
      description:
        payload.description !== undefined
          ? payload.description.trim() || undefined
          : current.description,
      completed: payload.completed ?? current.completed,
      updatedAt: now,
    };

    const stored = this.goals.get(goalId)!;
    const tasks = [...goal.tasks];
    tasks[index] = updatedTask;
    this.goals.set(goalId, {
      ...stored,
      tasks,
      updatedAt: now,
      ...computeProgress(tasks),
    });
    return updatedTask;
  }

  deleteTask(userId: string, goalId: string, taskId: string): boolean {
    const goal = this.getGoal(userId, goalId);
    if (!goal) return false;

    const tasks = goal.tasks.filter((task) => task.id !== taskId);
    if (tasks.length === goal.tasks.length) return false;

    const stored = this.goals.get(goalId)!;
    this.goals.set(goalId, {
      ...stored,
      tasks,
      updatedAt: new Date().toISOString(),
      ...computeProgress(tasks),
    });
    return true;
  }

  listGoalsWithTasks(userId: string): GoalDetail[] {
    return [...this.goals.values()]
      .filter((goal) => goal.userId === userId && goal.status === "active")
      .map((goal) => {
        const { userId: _, ...detail } = goal;
        return {
          ...detail,
          ...computeProgress(goal.tasks),
          daysRemaining: daysRemaining(goal.deadline),
        };
      });
  }
}

let store: GoalStore | null = null;

export function getGoalStore() {
  if (!store) store = new GoalStore();
  return store;
}

export function buildSharedGoalsData(userId: string) {
  const goals = getGoalStore()
    .listGoalsWithTasks(userId)
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      why: goal.why,
      deadline: goal.deadline,
      category: goal.category,
      priority: goal.priority,
      progressPercent: goal.progressPercent,
      tasksTotal: goal.tasksTotal,
      tasksCompleted: goal.tasksCompleted,
      daysRemaining: goal.daysRemaining,
      tasks: goal.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
      })),
    }));

  return { goals };
}
