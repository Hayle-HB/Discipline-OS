import { resetDemoStore } from "@/lib/data/json-store";
import { isApiDataSource } from "@/lib/data/config";
import { apiError, apiSuccess } from "@/lib/api/response";

function resetNotAvailable() {
  return apiError(
    "Demo reset is only available with JSON demo data (DISCIPLINE_OS_DATA_SOURCE=json).",
    404,
    "NOT_FOUND"
  );
}

/** Reset in-memory demo data back to demo.json baseline */
export async function POST() {
  if (isApiDataSource()) return resetNotAvailable();

  resetDemoStore();

  return apiSuccess({ reset: true }, "Demo data reset to demo.json baseline");
}

/** Same as POST — handy when pasting in the browser address bar won't work; use console instead */
export async function GET() {
  if (isApiDataSource()) return resetNotAvailable();

  resetDemoStore();

  return apiSuccess(
    { reset: true },
    "Demo data reset. Reload the dashboard to see all 14 tasks."
  );
}
