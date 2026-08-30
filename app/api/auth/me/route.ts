import { proxyAuthRoute } from "@/lib/api/backend";
import { getMockUserById, parseMockToken } from "@/lib/api/mock-users";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getBearerToken, parseUserIdFromToken } from "@/lib/api/token";

export async function GET(request: Request) {
  const proxied = await proxyAuthRoute("/api/auth/me", request, { method: "GET" });
  if (proxied) return proxied;

  const token = getBearerToken(request);

  if (!token) {
    return apiError("Missing or invalid authorization token.", 401, "UNAUTHORIZED");
  }

  const userId = await parseUserIdFromToken(token);

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

  const mockUserId = parseMockToken(token);
  const user = mockUserId ? getMockUserById(mockUserId) : null;

  if (!user) {
    return apiError("User not found.", 404, "USER_NOT_FOUND");
  }

  return apiSuccess({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
