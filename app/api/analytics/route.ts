import { getDataProvider } from "@/lib/data";
import { requireUserId } from "@/lib/api/server-auth";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const userIdOrError = requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  return apiSuccess(getDataProvider().getAnalytics(userIdOrError));
}
