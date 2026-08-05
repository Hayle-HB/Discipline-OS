import { createMockToken } from "@/lib/api/mock-users";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { SocialLoginPayload, SocialLoginResponse } from "@/lib/api/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SocialLoginPayload;

    if (!body.provider || !["google", "apple"].includes(body.provider)) {
      return apiError("Invalid social provider.", 400, "VALIDATION_ERROR");
    }

    // Temporary mock OAuth — replace with real provider flow
    const providerLabel =
      body.provider.charAt(0).toUpperCase() + body.provider.slice(1);

    const response: SocialLoginResponse = {
      token: createMockToken(`social-${body.provider}`),
      provider: body.provider,
      user: {
        id: `social-${body.provider}`,
        email: `${body.provider}@discipline.os`,
        name: `${providerLabel} User`,
      },
    };

    return apiSuccess(
      response,
      `Successfully signed in with ${providerLabel}`
    );
  } catch {
    return apiError("Social login failed.", 500, "SOCIAL_LOGIN_ERROR");
  }
}
