export { API_CONFIG } from "@/lib/api/config";
export { TEMP_API } from "@/lib/api/constants";
export { apiClient, apiClientWithAuth } from "@/lib/api/client";
export {
  login,
  register,
  forgotPassword,
  logout,
  getCurrentUser,
  socialLogin,
  getStoredToken,
  getStoredUser,
  storeAuthSession,
  clearAuthSession,
} from "@/lib/api/auth";
export {
  getDashboardData,
  createTask,
  recordTaskCompletion,
  toggleTask,
  updateTask,
  deleteTask,
  addTaskToPeriod,
} from "@/lib/api/tasks";
export {
  createCommitment,
  toggleCommitment,
  deleteCommitment,
} from "@/lib/api/commitments";
export {
  getHabitsData,
  toggleHabit,
  getAnalyticsData,
  getRoutines,
  toggleRoutineStep,
} from "@/lib/api/habits";
export type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  SocialLoginPayload,
  SocialLoginResponse,
  Task,
  TaskPeriod,
  TasksByPeriod,
  CreateTaskPayload,
  Habit,
  Routine,
  AnalyticsData,
  HabitsData,
} from "@/lib/api/types";
export { ApiError } from "@/lib/api/types";
