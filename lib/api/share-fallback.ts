import { proxyToBackend } from "@/lib/api/backend";
import { getDataProvider } from "@/lib/data";
import {
  buildSharedDataFromTasks,
  normalizeShareEmail,
  shareStore,
  shareStoreErrorCode,
  shareStoreErrorMessage,
} from "@/lib/data/share-store";
import { requireUserId } from "@/lib/api/server-auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { ShareCreatePayload, ShareResourceName, Task } from "@/lib/data/types";
import { normalizeTask } from "@/lib/data/task-completions";

interface Viewer {
  id: string;
  email: string;
  name: string;
}

function mapShareError(error: unknown) {
  const code = shareStoreErrorCode(error);
  const status =
    code === "SHARE_NOT_FOUND"
      ? 404
      : code === "SHARE_FORBIDDEN" ||
          code === "SHARE_REVOKED" ||
          code === "SHARE_EXPIRED"
        ? 403
        : 400;
  return apiError(shareStoreErrorMessage(error), status, code);
}

async function getViewerFromRequest(
  request: Request
): Promise<Viewer | Response> {
  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const local = getDataProvider().findUserById(userIdOrError);
  if (local) {
    return {
      id: local.id,
      email: normalizeShareEmail(local.email),
      name: local.name,
    };
  }

  try {
    const response = await proxyToBackend("/api/auth/me", request, {
      method: "GET",
    });
    if (response.ok) {
      const json = (await response.json()) as {
        success?: boolean;
        data?: { id: string; email: string; name: string };
      };
      if (json.success && json.data?.email) {
        return {
          id: json.data.id,
          email: normalizeShareEmail(json.data.email),
          name: json.data.name,
        };
      }
    }
  } catch {
    // Fall through
  }

  return apiError("User not found.", 404, "NOT_FOUND");
}

async function fetchOwnerTasks(
  request: Request,
  ownerId: string
): Promise<Task[]> {
  try {
    const response = await proxyToBackend("/api/tasks", request, {
      method: "GET",
    });
    if (response.ok) {
      const json = (await response.json()) as {
        success?: boolean;
        data?: { tasks?: Task[] };
      };
      if (json.success && Array.isArray(json.data?.tasks)) {
        return json.data.tasks.map((task) => normalizeTask(task));
      }
    }
  } catch {
    // Fall through to local demo data
  }

  return getDataProvider()
    .getTasks(ownerId)
    .map((task) => normalizeTask(task));
}

async function buildSnapshotForShare(
  request: Request,
  viewer: Viewer,
  resourceNames: ShareResourceName[]
) {
  const tasks = await fetchOwnerTasks(request, viewer.id);
  const allowed = new Set(resourceNames);
  return buildSharedDataFromTasks(tasks, allowed, viewer.id);
}

export async function listSharesFallback(request: Request) {
  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;
  return apiSuccess(shareStore.listShares(userIdOrError));
}

export async function createShareFallback(
  request: Request,
  bodyText?: string
) {
  const viewer = await getViewerFromRequest(request);
  if (viewer instanceof Response) return viewer;

  try {
    const raw = bodyText ?? (await request.text());
    if (!raw.trim()) {
      return apiError("Invalid request body.", 400, "BAD_REQUEST");
    }
    const body = JSON.parse(raw) as ShareCreatePayload;
    const resourceNames = body.resources.map((resource) => resource.name);
    const dataSnapshot = await buildSnapshotForShare(
      request,
      viewer,
      resourceNames
    );
    const result = shareStore.createShare(
      viewer.id,
      viewer.email,
      viewer.name,
      body,
      dataSnapshot
    );
    return apiSuccess(result, "Share link created", 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError("Invalid request body.", 400, "BAD_REQUEST");
    }
    return mapShareError(error);
  }
}

export async function revokeShareFallback(request: Request, shareId: string) {
  const userIdOrError = await requireUserId(request);
  if (userIdOrError instanceof Response) return userIdOrError;

  const revoked = shareStore.revokeShare(userIdOrError, shareId);
  if (!revoked) {
    return apiError("Share not found.", 404, "NOT_FOUND");
  }
  return apiSuccess(null, "Share revoked");
}

export async function getSharePreviewFallback(
  request: Request,
  token: string
) {
  const viewer = await getViewerFromRequest(request);
  if (viewer instanceof Response) return viewer;

  try {
    return apiSuccess(shareStore.getSharePreview(token, viewer.email));
  } catch (error) {
    return mapShareError(error);
  }
}

export async function getSharedDataFallback(request: Request, token: string) {
  const viewer = await getViewerFromRequest(request);
  if (viewer instanceof Response) return viewer;

  try {
    return apiSuccess(shareStore.getSharedData(token, viewer.email));
  } catch (error) {
    return mapShareError(error);
  }
}

export async function listIncomingSharesFallback(request: Request) {
  const viewer = await getViewerFromRequest(request);
  if (viewer instanceof Response) return viewer;
  return apiSuccess(shareStore.listIncomingShares(viewer.email));
}

export async function getIncomingShareFallback(
  request: Request,
  shareId: string
) {
  const viewer = await getViewerFromRequest(request);
  if (viewer instanceof Response) return viewer;

  try {
    return apiSuccess(shareStore.getIncomingShare(shareId, viewer.email));
  } catch (error) {
    return mapShareError(error);
  }
}

export async function getIncomingShareDataFallback(
  request: Request,
  shareId: string
) {
  const viewer = await getViewerFromRequest(request);
  if (viewer instanceof Response) return viewer;

  try {
    return apiSuccess(shareStore.getIncomingShareData(shareId, viewer.email));
  } catch (error) {
    return mapShareError(error);
  }
}

/** Use local share store when backend is off or hasn't deployed /api/shares yet. */
export async function shouldUseShareFallback(
  proxied: Response | null
): Promise<boolean> {
  if (!proxied) return true;
  if (proxied.status === 404) return true;
  return false;
}

export async function proxyShareRoute(
  path: string,
  request: Request,
  init?: RequestInit
) {
  if (process.env.NODE_ENV === "development") {
    try {
      const localBase = "http://127.0.0.1:8000";
      const headers = new Headers(init?.headers);
      const authorization = request.headers.get("authorization");
      if (authorization) headers.set("Authorization", authorization);

      const method = init?.method ?? request.method;
      const body = init?.body;
      if (body !== undefined && method !== "GET" && method !== "HEAD" && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      const contentType = request.headers.get("content-type");
      if (contentType && !headers.has("Content-Type")) {
        headers.set("Content-Type", contentType);
      }

      const response = await fetch(`${localBase}${path}`, {
        method,
        headers,
        body,
        cache: "no-store",
      });

      if (response.status !== 404) {
        const text = await response.text();
        return new Response(text, {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      // Try configured backend next
    }
  }

  return proxyToBackend(path, request, init);
}
