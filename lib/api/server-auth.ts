import { parseMockToken } from "@/lib/api/mock-users";
import { apiError } from "@/lib/api/response";

export function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return parseMockToken(token);
}

export function requireUserId(request: Request): string | Response {
  const userId = getUserIdFromRequest(request);

  if (!userId) {
    return apiError("Missing or invalid authorization token.", 401, "UNAUTHORIZED");
  }

  return userId;
}
