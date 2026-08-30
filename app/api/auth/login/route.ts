import { proxyAuthRoute } from "@/lib/api/backend";
import { createMockToken, findMockUser } from "@/lib/api/mock-users";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { LoginPayload, LoginResponse } from "@/lib/api/types";

export async function POST(request: Request) {
  const proxied = await proxyAuthRoute("/api/auth/login", request);
  if (proxied) return proxied;

  try {
    const body = (await request.json()) as LoginPayload;
    const email = body.email?.trim() ?? "";
    const password = body.password?.trim() ?? "";

    if (!email || !password) {
      return apiError("Email and password are required.", 400, "VALIDATION_ERROR");
    }

    const user = findMockUser(email, password);

    if (!user) {
      return apiError(
        "Invalid email or password. Try demo@discipline.os / password123",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const response: LoginResponse = {
      token: createMockToken(user.id),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    return apiSuccess(response, "Login successful");
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}
