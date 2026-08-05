import { apiSuccess } from "@/lib/api/response";

export async function POST() {
  // Temporary: real backend would invalidate the token server-side
  return apiSuccess(null, "Logged out successfully");
}
