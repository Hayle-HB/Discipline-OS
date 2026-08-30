import { proxyAuthRoute } from "@/lib/api/backend";
import { apiSuccess } from "@/lib/api/response";

export async function POST(request: Request) {
  const proxied = await proxyAuthRoute("/api/auth/logout", request);
  if (proxied) return proxied;

  return apiSuccess(null, "Logged out successfully");
}
