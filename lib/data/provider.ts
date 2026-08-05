import type {
  AnalyticsData,
  Commitment,
  DemoDataFile,
  Habit,
  Routine,
  Task,
  TaskPeriod,
  UserRecord,
} from "@/lib/data/types";

export interface DataProvider {
  // Users
  findUser(email: string, password: string): UserRecord | null;
  findUserById(id: string): UserRecord | null;
  findUserByEmail(email: string): UserRecord | null;
  createUser(data: {
    email: string;
    password: string;
    name: string;
  }): UserRecord;
  emailExists(email: string): boolean;

  // Tasks (period-based habits on Today dashboard)
  getTasks(userId: string): Task[];
  addTask(userId: string, data: import("@/lib/data/types").CreateTaskPayload): Task;
  recordTaskCompletion(
    userId: string,
    id: string,
    status: import("@/lib/data/types").TaskDayStatus,
    date?: string
  ): Task | null;
  /** @deprecated Use recordTaskCompletion */
  toggleTask(userId: string, id: string): Task | null;
  updateTask(
    userId: string,
    id: string,
    data: import("@/lib/data/types").UpdateTaskPayload
  ): Task | null;
  deleteTask(userId: string, id: string): boolean;

  /** @deprecated Use getTasks */
  getCommitments(userId: string): Commitment[];

  // Habits (detailed habit tracker page)
  getHabits(userId: string): Habit[];
  toggleHabit(userId: string, id: string): Habit | null;

  // Routines
  getRoutines(userId: string): Routine[];
  toggleRoutineStep(
    userId: string,
    routineId: string,
    stepId: string
  ): Routine | null;

  // Analytics
  getAnalytics(userId: string): AnalyticsData;
}

export type { DemoDataFile };
