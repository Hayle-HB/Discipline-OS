export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface SocialLoginPayload {
  provider: "google" | "apple";
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: AuthUser;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface SocialLoginResponse extends LoginResponse {
  provider: "google" | "apple";
}

export type {
  Commitment,
  Task,
  TaskPeriod,
  TasksByPeriod,
  CreateTaskPayload,
  UpdateTaskPayload,
  DashboardStats,
  DashboardData,
  Habit,
  Routine,
  AnalyticsData,
  HabitsData,
} from "@/lib/data/types";
