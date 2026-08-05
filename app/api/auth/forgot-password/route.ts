import { TEMP_API } from "@/lib/api/constants";
import { requestPasswordReset } from "@/lib/api/mock-users";
import { apiError, apiSuccess } from "@/lib/api/response";
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
} from "@/lib/api/types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ForgotPasswordPayload;
    const { email } = body;

    if (!email?.trim()) {
      return apiError("Email is required.", 400, "VALIDATION_ERROR");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError("Please enter a valid email address.", 400, "VALIDATION_ERROR");
    }

    // Simulate email send delay
    await delay(TEMP_API.forgotPasswordDelayMs);

    // Always succeed — don't reveal whether the email exists
    requestPasswordReset(email);

    const response: ForgotPasswordResponse = {
      message:
        "If an account exists for that email, we've sent password reset instructions.",
    };

    return apiSuccess(response, response.message);
  } catch {
    return apiError("Invalid request body.", 400, "BAD_REQUEST");
  }
}
