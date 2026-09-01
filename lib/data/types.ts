export interface UserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  joinedAt?: string;
}

export interface Commitment {
  id: string;
  userId: string;
  label: string;
  completed: boolean;
  streak: number;
  category: string;
  createdAt: string;
}

/** Period-based habit/task on the Today dashboard */
export type TaskPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type TaskDayStatus = "done" | "missed";

export type TaskPriority = "low" | "medium" | "high";

/** Per-period completion record (date key for daily, week/month/year keys otherwise) */
export interface TaskCompletionEntry {
  status: TaskDayStatus;
  /** ISO timestamp when marked done */
  completedAt?: string;
  /** Minutes spent on the task */
  durationMinutes?: number;
  note?: string;
}

export interface Task {
  id: string;
  userId: string;
  label: string;
  description?: string;
  period: TaskPeriod;
  completed: boolean;
  streak: number;
  category: string;
  priority?: TaskPriority;
  /** Ideal time of day, 24h "HH:mm" */
  preferredTime?: string;
  estimatedMinutes?: number;
  createdAt: string;
  completionLog?: Record<string, TaskCompletionEntry>;
}

export interface RecordTaskCompletionPayload {
  status: TaskDayStatus;
  date?: string;
}

export interface CreateTaskPayload {
  label: string;
  period: TaskPeriod;
  category?: string;
  description?: string;
  priority?: TaskPriority;
  preferredTime?: string;
  estimatedMinutes?: number;
}

export interface UpdateTaskPayload {
  label?: string;
  period?: TaskPeriod;
  category?: string;
  description?: string;
  priority?: TaskPriority;
  preferredTime?: string;
  estimatedMinutes?: number;
}

export interface TasksByPeriod {
  daily: Task[];
  weekly: Task[];
  monthly: Task[];
  yearly: Task[];
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: "daily" | "weekdays" | "weekly";
  streak: number;
  longestStreak: number;
  completionRate: number;
  completedToday: boolean;
  category: string;
  color: string;
}

export interface RoutineStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string;
  steps: RoutineStep[];
  completedToday: boolean;
}

export interface MonthlyScore {
  month: string;
  score: number;
}

export interface StreakHistoryEntry {
  date: string;
  score: number;
}

export interface CategoryBreakdown {
  category: string;
  completed: number;
  total: number;
  color: string;
}

export interface AnalyticsSummary {
  totalCommitmentsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  daysTracked: number;
}

export interface AnalyticsData {
  weeklyActivity: number[];
  monthlyScores: MonthlyScore[];
  streakHistory: StreakHistoryEntry[];
  categoryBreakdown: CategoryBreakdown[];
  insights: string[];
  summary: AnalyticsSummary;
}

export interface DemoDataFile {
  version: string;
  users: UserRecord[];
  tasks: Record<string, Task[]>;
  habits: Record<string, Habit[]>;
  routines: Record<string, Routine[]>;
  analytics: Record<string, AnalyticsData>;
}

export interface DashboardStats {
  completed: number;
  total: number;
  bestStreak: number;
  score: number;
  progress: number;
}

export interface DashboardData {
  tasks: Task[];
  tasksByPeriod: TasksByPeriod;
  stats: DashboardStats;
  weeklyActivity: number[];
  routines?: Routine[];
}

export interface HabitsData {
  habits: Habit[];
  completedToday: number;
  total: number;
}

export type ShareResourceName =
  | "calendar"
  | "tasks"
  | "habits"
  | "streak"
  | "discipline_score"
  | "analytics"
  | "goals";

export type GoalCategory =
  | "career"
  | "health"
  | "finance"
  | "education"
  | "personal"
  | "other";

export type GoalPriority = "low" | "medium" | "high";

export interface GoalTask {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  completed: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalSummary {
  id: string;
  title: string;
  description?: string;
  why?: string;
  deadline?: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: "active" | "archived";
  progressPercent: number;
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalDetail extends GoalSummary {
  tasks: GoalTask[];
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  why?: string;
  deadline?: string;
  category?: GoalCategory;
  priority?: GoalPriority;
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  why?: string;
  deadline?: string;
  category?: GoalCategory;
  priority?: GoalPriority;
}

export interface CreateGoalTaskPayload {
  title: string;
  description?: string;
}

export interface UpdateGoalTaskPayload {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface SharedGoalTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export interface SharedGoal {
  id: string;
  title: string;
  description?: string;
  why?: string;
  deadline?: string;
  category: GoalCategory;
  priority: GoalPriority;
  progressPercent: number;
  tasksTotal: number;
  tasksCompleted: number;
  daysRemaining?: number | null;
  tasks: SharedGoalTask[];
}

export interface SharedGoalsData {
  goals: SharedGoal[];
}

export interface ShareResourcePermission {
  name: ShareResourceName;
  permission: "view";
}

export interface ShareRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string | null;
  recipientEmail: string;
  resources: ShareResourcePermission[];
  status: "active" | "revoked" | "pending";
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  requestReciprocalAccess?: boolean;
  reciprocalResponded?: boolean;
}

export interface IncomingShareSummary {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string | null;
  resources: ShareResourcePermission[];
  status: "active" | "revoked" | "pending";
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  reciprocalPending?: boolean;
}

export interface ShareCreatePayload {
  recipientEmail: string;
  resources: ShareResourcePermission[];
  expiresInDays?: number | null;
  requestReciprocalAccess?: boolean;
}

export interface ShareUpdatePayload {
  resources: ShareResourcePermission[];
  expiresInDays?: number | null;
}

export interface ReciprocalSharePayload {
  resources: ShareResourcePermission[];
  accept: boolean;
}

export interface ShareCreateResult {
  share: ShareRecord;
  shareToken?: string | null;
  sharePath?: string | null;
  updated?: boolean;
}

export interface SharePreview {
  ownerName: string;
  recipientEmail: string;
  resources: ShareResourcePermission[];
  status: string;
  expiresAt: string | null;
}

export interface SharedDayMetric {
  dateKey: string;
  done: number;
  missed: number;
  pending: number;
  total: number;
  rate: number;
}

export interface SharedCalendarData {
  days: SharedDayMetric[];
  summary: {
    daysTracked: number;
    totalDone: number;
    totalMissed: number;
  };
}

export interface SharedStreakData {
  currentStreak: number;
  bestStreak: number;
  activeTasks: number;
}

export interface SharedDisciplineScoreData {
  completed: number;
  total: number;
  bestStreak: number;
  score: number;
  progress: number;
}

export interface SharedTasksData {
  tasks: Array<
    Pick<Task, "id" | "label" | "period" | "category" | "streak" | "completed"> & {
      completionLog?: Task["completionLog"];
    }
  >;
}

export interface SharedHabitsData {
  tasksByPeriod: TasksByPeriod;
}

export interface SharedProgressPayload {
  shareId?: string;
  ownerId?: string;
  ownerName: string;
  resources: ShareResourceName[];
  data: {
    calendar?: SharedCalendarData;
    streak?: SharedStreakData;
    discipline_score?: SharedDisciplineScoreData;
    tasks?: SharedTasksData;
    habits?: SharedHabitsData;
    analytics?: AnalyticsData;
    goals?: SharedGoalsData;
  };
}

export interface ShareComment {
  id: string;
  threadKey: string;
  authorId: string;
  authorName: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShareCommentCreatePayload {
  body: string;
  parentId?: string | null;
}
