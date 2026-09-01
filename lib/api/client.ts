import { API_CONFIG } from "@/lib/api/config";
import { ApiError, type ApiResponse } from "@/lib/api/types";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function buildUrl(path: string): string {
  const base = API_CONFIG.baseUrl.replace(/\/$/, "");
  const route = path.startsWith("/") ? path : `/${path}`;
  return `${base}${route}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!isJson) {
    if (!response.ok) {
      throw new ApiError(response.statusText || "Request failed", response.status);
    }
    return undefined as T;
  }

  const json = (await response.json()) as ApiResponse<T> & { detail?: unknown };

  if (!response.ok || json.success === false) {
    const detail =
      typeof json.detail === "string"
        ? json.detail
        : Array.isArray(json.detail)
          ? json.detail.map((item) => item?.msg ?? String(item)).join(", ")
          : undefined;
    const message =
      json.success === false ? json.error : detail ?? "Request failed";
    const code = json.success === false ? json.code : undefined;
    throw new ApiError(message, response.status, code);
  }

  return json.data;
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(response);
}

export function apiClientWithAuth<T>(
  path: string,
  token: string,
  options: RequestOptions = {}
): Promise<T> {
  return apiClient<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}
