import { getMockUserById, parseMockToken } from "@/lib/api/mock-users";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return apiError("Missing or invalid authorization token.", 401, "UNAUTHORIZED");
  }

  const token = authHeader.slice(7);
  const userId = parseMockToken(token);

  if (!userId) {
    return apiError("Invalid or expired token.", 401, "INVALID_TOKEN");
  }

  if (userId.startsWith("social-")) {
    const provider = userId.replace("social-", "") as "google" | "apple";
    const providerLabel =
      provider.charAt(0).toUpperCase() + provider.slice(1);

    return apiSuccess({
      id: userId,
      email: `${provider}@discipline.os`,
      name: `${providerLabel} User`,
    });
  }

  const user = getMockUserById(userId);

  if (!user) {
    return apiError("User not found.", 404, "USER_NOT_FOUND");
  }

  return apiSuccess({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
