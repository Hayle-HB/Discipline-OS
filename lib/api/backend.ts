/**
 * Server-side FastAPI backend integration.
 *
 * By default auth proxies to http://127.0.0.1:8000.
 * Set USE_MOCK_AUTH=true to use the in-memory demo auth instead.
 */

function resolveBackendBaseUrl(): string {
  if (process.env.USE_MOCK_AUTH === "true") {
    return "";
  }

  const configured = process.env.BACKEND_API_URL?.trim();
  if (configured === "false" || configured === "0") {
    return "";
  }

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return "http://127.0.0.1:8000";
}

const backendBaseUrl = resolveBackendBaseUrl();

export function isBackendEnabled(): boolean {
  return backendBaseUrl.length > 0;
}

export function getBackendBaseUrl(): string {
  return backendBaseUrl;
}

function backendUnavailableResponse(): Response {
  return Response.json(
    {
      success: false,
      error:
        "Cannot reach the backend. Start it with: cd Backend && ./venv/bin/python main.py",
      code: "BACKEND_UNAVAILABLE",
    },
    { status: 503 }
  );
}

/** Forward a request to the FastAPI backend and return its JSON response. */
export async function proxyToBackend(
  path: string,
  request: Request,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const contentType = request.headers.get("content-type");
  if (contentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", contentType);
  }

  const method = init?.method ?? request.method;
  let body = init?.body;

  if (body === undefined && method !== "GET" && method !== "HEAD") {
    body = await request.text();
  }

  let response: globalThis.Response;
  try {
    response = await fetch(`${backendBaseUrl}${path}`, {
      method,
      headers,
      body: body || undefined,
      cache: "no-store",
    });
  } catch {
    return backendUnavailableResponse();
  }

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Proxy route to FastAPI when backend is configured; otherwise return null for mock fallback. */
export async function proxyBackendRoute(
  path: string,
  request: Request,
  init?: RequestInit
): Promise<Response | null> {
  if (!isBackendEnabled()) {
    return null;
  }
  return proxyToBackend(path, request, init);
}

/** @deprecated Use proxyBackendRoute */
export const proxyAuthRoute = proxyBackendRoute;
