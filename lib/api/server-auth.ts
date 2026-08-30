import { getBearerToken, parseUserIdFromToken } from "@/lib/api/token";
import { apiError } from "@/lib/api/response";

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const token = getBearerToken(request);
  if (!token) return null;
  return parseUserIdFromToken(token);
}

export async function requireUserId(request: Request): Promise<string | Response> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return apiError("Missing or invalid authorization token.", 401, "UNAUTHORIZED");
  }

  return userId;
}
