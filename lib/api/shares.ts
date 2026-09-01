import { API_CONFIG } from "@/lib/api/config";
import { apiClient } from "@/lib/api/client";
import { getStoredToken } from "@/lib/api/auth";
import type {
  IncomingShareSummary,
  ReciprocalSharePayload,
  ShareCreatePayload,
  ShareCreateResult,
  SharePreview,
  ShareRecord,
  SharedProgressPayload,
  ShareUpdatePayload,
} from "@/lib/data/types";

const { shares: shareRoutes } = API_CONFIG.routes;

function authHeaders() {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

export async function listShares(): Promise<ShareRecord[]> {
  return apiClient<ShareRecord[]>(shareRoutes.list, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function listIncomingShares(): Promise<IncomingShareSummary[]> {
  return apiClient<IncomingShareSummary[]>(shareRoutes.incoming, {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getIncomingShare(
  shareId: string
): Promise<IncomingShareSummary> {
  return apiClient<IncomingShareSummary>(shareRoutes.incomingById(shareId), {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getIncomingShareData(
  shareId: string
): Promise<SharedProgressPayload> {
  return apiClient<SharedProgressPayload>(shareRoutes.incomingData(shareId), {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function createShare(
  payload: ShareCreatePayload
): Promise<ShareCreateResult> {
  return apiClient<ShareCreateResult>(shareRoutes.list, {
    method: "POST",
    headers: authHeaders(),
    body: payload,
  });
}

export async function updateShare(
  id: string,
  payload: ShareUpdatePayload
): Promise<ShareRecord> {
  return apiClient<ShareRecord>(shareRoutes.byId(id), {
    method: "PATCH",
    headers: authHeaders(),
    body: payload,
  });
}

export async function respondToReciprocalShare(
  shareId: string,
  payload: ReciprocalSharePayload
): Promise<{ accepted: boolean; share?: ShareRecord | null; alreadyShared?: boolean }> {
  return apiClient(shareRoutes.reciprocal(shareId), {
    method: "POST",
    headers: authHeaders(),
    body: payload,
  });
}

export async function revokeShare(id: string): Promise<void> {
  return apiClient<void>(shareRoutes.byId(id), {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function getSharePreview(token: string): Promise<SharePreview> {
  return apiClient<SharePreview>(shareRoutes.preview(token), {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getSharedProgress(
  token: string
): Promise<SharedProgressPayload> {
  return apiClient<SharedProgressPayload>(shareRoutes.data(token), {
    method: "GET",
    headers: authHeaders(),
  });
}
