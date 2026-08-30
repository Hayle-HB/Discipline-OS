import { proxyAuthRoute } from "@/lib/api/backend";
import {
  addMockUser,
  createMockToken,
  emailExists,
} from "@/lib/api/mock-users";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { RegisterPayload, RegisterResponse } from "@/lib/api/types";

export async function POST(request: Request) {
  const proxied = await proxyAuthRoute("/api/auth/register", request);
  if (proxied) return proxied;

  try {
    const body = (await request.json()) as RegisterPayload;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!name || !email || !password) {
      return apiError(
        "Name, email, and password are required.",
        400,
        "VALIDATION_ERROR"
      );
    }

    if (password.length < 8) {
      return apiError(
        "Password must be at least 8 characters.",
        400,
        "VALIDATION_ERROR"
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Please enter a valid email address.", 400, "VALIDATION_ERROR");
    }

    if (emailExists(email)) {
      return apiError(
        "An account with this email already exists.",
        409,
        "EMAIL_EXISTS"
      );
    }

    const user = addMockUser({ name, email, password });

    const response: RegisterResponse = {
      token: createMockToken(user.id),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    return apiSuccess(response, "Account created successfully");
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}
