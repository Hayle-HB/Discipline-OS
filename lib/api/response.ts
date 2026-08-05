import { NextResponse } from "next/server";

import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/api/types";

export function apiSuccess<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function apiError(
  error: string,
  status = 400,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, error, code }, { status });
}
