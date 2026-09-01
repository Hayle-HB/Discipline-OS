/**
 * Server-side FastAPI backend integration.
 *
 * Next.js /api routes proxy to BACKEND_API_URL.
 * Set USE_MOCK_AUTH=true to use in-memory demo auth instead.
 */

/** Deployed Render API — used when BACKEND_API_URL is unset in production. */
const PRODUCTION_BACKEND_URL =
  "https://discipline-os-backend-29ku.onrender.com";

const FETCH_TIMEOUT_MS = 55_000;
const FETCH_RETRIES = 2;

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

  // Never use localhost on Vercel/production — it is not reachable there.
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return PRODUCTION_BACKEND_URL;
  }

  return "http://127.0.0.1:8000";
}

/** Resolve at call time so Vercel runtime env vars are picked up. */
export function getBackendBaseUrl(): string {
  return resolveBackendBaseUrl();
}

export function isBackendEnabled(): boolean {
  return getBackendBaseUrl().length > 0;
}

function backendUnavailableResponse(baseUrl: string): Response {
  const onVercel = process.env.VERCEL === "1";
  const pointsToLocalhost =
    baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost");

  let error =
    "Cannot reach the backend. Start it with: cd Backend && ./venv/bin/python main.py";

  if (onVercel && pointsToLocalhost) {
    error =
      "BACKEND_API_URL is not set on Vercel. Add your Render URL in Project Settings → Environment Variables, then redeploy.";
  } else if (onVercel) {
    error =
      "Cannot reach the backend on Render. Free-tier services sleep after inactivity — wait 30–60 seconds and try again.";
  }

  return Response.json(
    {
      success: false,
      error,
      code: "BACKEND_UNAVAILABLE",
    },
    { status: 503 }
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit
): Promise<globalThis.Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      if (attempt < FETCH_RETRIES) {
        await sleep(2500 * (attempt + 1));
      }
    }
  }

  throw lastError;
}

/** Forward a request to the FastAPI backend and return its JSON response. */
export async function proxyToBackend(
  path: string,
  request: Request,
  init?: RequestInit
): Promise<Response> {
  const baseUrl = getBackendBaseUrl();
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

  try {
    const response = await fetchWithRetry(`${baseUrl}${path}`, {
      method,
      headers,
      body: body || undefined,
      cache: "no-store",
    });

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return backendUnavailableResponse(baseUrl);
  }
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
