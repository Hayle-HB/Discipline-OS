import { proxyBackendRoute } from "@/lib/api/backend";
import { getDataProvider } from "@/lib/data";
import { requireUserId } from "@/lib/api/server-auth";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const proxied = await proxyBackendRoute("/api/analytics", request, { method: "GET" });
  if (proxied) return proxied;

  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  return apiSuccess(getDataProvider().getAnalytics(userIdOrError));
}
