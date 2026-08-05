import { API_CONFIG } from "@/lib/api/config";
import { apiClient } from "@/lib/api/client";
import type {
  AuthUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  SocialLoginPayload,
  SocialLoginResponse,
} from "@/lib/api/types";

const { auth: authRoutes } = API_CONFIG.routes;

const AUTH_TOKEN_KEY = "discipline_os_token";
const AUTH_USER_KEY = "discipline_os_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(AUTH_TOKEN_KEY) ??
    sessionStorage.getItem(AUTH_TOKEN_KEY)
  );
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(AUTH_USER_KEY) ??
    sessionStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeAuthSession(
  token: string,
  user: AuthUser,
  rememberMe = false
): void {
  const storage = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;

  other.removeItem(AUTH_TOKEN_KEY);
  other.removeItem(AUTH_USER_KEY);

  storage.setItem(AUTH_TOKEN_KEY, token);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient<LoginResponse>(authRoutes.login, {
    method: "POST",
    body: payload,
  });
}

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>(authRoutes.register, {
    method: "POST",
    body: payload,
  });
}

export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  return apiClient<ForgotPasswordResponse>(authRoutes.forgotPassword, {
    method: "POST",
    body: payload,
  });
}

export async function logout(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    try {
      await apiClient<void>(authRoutes.logout, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Clear local session even if the server call fails
    }
  }
  clearAuthSession();
}

export async function getCurrentUser(): Promise<AuthUser> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<AuthUser>(authRoutes.me, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function socialLogin(
  payload: SocialLoginPayload
): Promise<SocialLoginResponse> {
  return apiClient<SocialLoginResponse>(authRoutes.socialLogin, {
    method: "POST",
    body: payload,
  });
}
