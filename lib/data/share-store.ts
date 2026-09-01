import { createHash, randomBytes } from "crypto";

import { getDataProvider } from "@/lib/data";
import { addDays, toDateKey } from "@/lib/data/dates";
import {
  computeDayMetrics,
  normalizeTask,
} from "@/lib/data/task-completions";
import { groupTasksByPeriod } from "@/lib/data/task-periods";
import type {
  ShareCreatePayload,
  SharePreview,
  ShareRecord,
  ShareResourceName,
  SharedProgressPayload,
  Task,
} from "@/lib/data/types";

const VALID_RESOURCES = new Set<ShareResourceName>([
  "calendar",
  "tasks",
  "habits",
  "streak",
  "discipline_score",
  "analytics",
]);

export class ShareAccessError extends Error {
  constructor(
    message: string,
    public code: string,
    public meta?: Record<string, string>
  ) {
    super(message);
    this.name = "ShareAccessError";
  }
}

interface StoredShare {
  id: string;
  ownerId: string;
  ownerName: string;
  recipientEmail: string;
  resources: Array<{ name: ShareResourceName; permission: "view" }>;
  tokenHash: string;
  status: "active" | "revoked";
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  dataSnapshot: SharedProgressPayload["data"];
}

const shares: StoredShare[] = [];

export function normalizeShareEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toShareRecord(share: StoredShare): ShareRecord {
  return {
    id: share.id,
    ownerId: share.ownerId,
    ownerName: share.ownerName,
    recipientEmail: share.recipientEmail,
    resources: share.resources,
    status: share.status,
    expiresAt: share.expiresAt,
    createdAt: share.createdAt,
    updatedAt: share.updatedAt,
  };
}

function findShareByIdForRecipient(
  shareId: string,
  viewerEmail: string
): StoredShare | null {
  const normalized = normalizeShareEmail(viewerEmail);
  return (
    shares.find(
      (share) => share.id === shareId && share.recipientEmail === normalized
    ) ?? null
  );
}

function findShareByToken(token: string): StoredShare | null {
  const decoded = decodeURIComponent(token);
  return (
    shares.find(
      (share) =>
        share.tokenHash === hashToken(token) ||
        share.tokenHash === hashToken(decoded)
    ) ?? null
  );
}

function assertShareAccess(share: StoredShare, viewerEmail: string) {
  const normalizedViewer = normalizeShareEmail(viewerEmail);
  if (share.status === "revoked") {
    throw new ShareAccessError(
      "This share link has been revoked.",
      "SHARE_REVOKED"
    );
  }
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    throw new ShareAccessError(
      "This share link has expired.",
      "SHARE_EXPIRED"
    );
  }
  if (share.recipientEmail !== normalizedViewer) {
    throw new ShareAccessError(
      `This link was shared with ${share.recipientEmail}. You're signed in as ${normalizedViewer}. Sign in with the invited email to view this progress.`,
      "SHARE_FORBIDDEN",
      {
        invitedEmail: share.recipientEmail,
        signedInAs: normalizedViewer,
      }
    );
  }
}

function buildCalendarData(tasks: Task[]) {
  const dailyTasks = tasks.filter((task) => task.period === "daily");
  const days = Array.from({ length: 90 }, (_, index) => {
    const date = addDays(new Date(), index - 89);
    return computeDayMetrics(dailyTasks, toDateKey(date));
  });
  const tracked = days.filter((day) => day.done > 0 || day.missed > 0);
  return {
    days,
    summary: {
      daysTracked: tracked.length,
      totalDone: tracked.reduce((sum, day) => sum + day.done, 0),
      totalMissed: tracked.reduce((sum, day) => sum + day.missed, 0),
    },
  };
}

export function buildSharedDataFromTasks(
  tasks: Task[],
  allowed: Set<ShareResourceName>,
  ownerId: string
): SharedProgressPayload["data"] {
  const normalizedTasks = tasks.map((task) => normalizeTask(task));
  const data: SharedProgressPayload["data"] = {};

  if (allowed.has("calendar")) {
    data.calendar = buildCalendarData(normalizedTasks);
  }
  if (allowed.has("streak")) {
    const streaks = normalizedTasks.map((task) => task.streak);
    const dailyStreaks = normalizedTasks
      .filter((task) => task.period === "daily")
      .map((task) => task.streak);
    data.streak = {
      currentStreak: dailyStreaks.length ? Math.max(...dailyStreaks) : 0,
      bestStreak: streaks.length ? Math.max(...streaks) : 0,
      activeTasks: normalizedTasks.filter((task) => task.streak > 0).length,
    };
  }
  if (allowed.has("discipline_score")) {
    const total = normalizedTasks.length;
    const completed = normalizedTasks.filter((task) => task.completed).length;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;
    data.discipline_score = {
      completed,
      total,
      bestStreak: normalizedTasks.length
        ? Math.max(...normalizedTasks.map((task) => task.streak))
        : 0,
      score,
      progress: score,
    };
  }
  if (allowed.has("tasks")) {
    data.tasks = {
      tasks: normalizedTasks
        .filter((task) => task.period === "daily")
        .map((task) => ({
          id: task.id,
          label: task.label,
          period: task.period,
          category: task.category,
          streak: task.streak,
          completed: task.completed,
          completionLog: task.completionLog,
        })),
    };
  }
  if (allowed.has("habits")) {
    data.habits = { tasksByPeriod: groupTasksByPeriod(normalizedTasks) };
  }
  if (allowed.has("analytics")) {
    data.analytics = getDataProvider().getAnalytics(ownerId);
  }

  return data;
}

export const shareStore = {
  listShares(ownerId: string): ShareRecord[] {
    return shares
      .filter((share) => share.ownerId === ownerId)
      .map(toShareRecord);
  },

  listIncomingShares(viewerEmail: string) {
    const normalized = normalizeShareEmail(viewerEmail);
    const now = new Date();
    return shares
      .filter(
        (share) =>
          share.recipientEmail === normalized &&
          share.status === "active" &&
          (!share.expiresAt || new Date(share.expiresAt) >= now)
      )
      .map((share) => ({
        id: share.id,
        ownerId: share.ownerId,
        ownerName: share.ownerName,
        resources: share.resources,
        status: share.status,
        expiresAt: share.expiresAt,
        createdAt: share.createdAt,
        updatedAt: share.updatedAt,
      }));
  },

  getIncomingShare(shareId: string, viewerEmail: string) {
    const share = findShareByIdForRecipient(shareId, viewerEmail);
    if (!share) {
      throw new ShareAccessError("Share not found.", "SHARE_NOT_FOUND");
    }
    assertShareAccess(share, viewerEmail);
    return {
      id: share.id,
      ownerId: share.ownerId,
      ownerName: share.ownerName,
      resources: share.resources,
      status: share.status,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
    };
  },

  getIncomingShareData(shareId: string, viewerEmail: string): SharedProgressPayload {
    const share = findShareByIdForRecipient(shareId, viewerEmail);
    if (!share) {
      throw new ShareAccessError("Share not found.", "SHARE_NOT_FOUND");
    }
    assertShareAccess(share, viewerEmail);
    const allowed = new Set(share.resources.map((resource) => resource.name));
    return {
      shareId: share.id,
      ownerId: share.ownerId,
      ownerName: share.ownerName,
      resources: [...allowed],
      data: share.dataSnapshot,
    };
  },

  createShare(
    ownerId: string,
    ownerEmail: string,
    ownerName: string,
    payload: ShareCreatePayload,
    dataSnapshot: SharedProgressPayload["data"]
  ) {
    const recipientEmail = normalizeShareEmail(payload.recipientEmail);
    const ownerNormalized = normalizeShareEmail(ownerEmail);
    if (recipientEmail === ownerNormalized) {
      throw new ShareAccessError(
        "You cannot share progress with yourself.",
        "CANNOT_SHARE_WITH_SELF"
      );
    }

    const resources = payload.resources
      .map((resource) => resource.name)
      .filter((name, index, all) => all.indexOf(name) === index)
      .filter((name): name is ShareResourceName =>
        VALID_RESOURCES.has(name as ShareResourceName)
      );

    if (resources.length === 0) {
      throw new ShareAccessError(
        "Select at least one resource to share.",
        "NO_RESOURCES"
      );
    }

    const now = new Date().toISOString();
    const expiresAt = payload.expiresInDays
      ? new Date(Date.now() + payload.expiresInDays * 86400000).toISOString()
      : null;
    const token = randomBytes(24).toString("base64url");
    const tokenHash = hashToken(token);

    const share: StoredShare = {
      id: createId("share"),
      ownerId,
      ownerName: ownerName.trim() || "Discipline OS user",
      recipientEmail,
      resources: resources.map((name) => ({ name, permission: "view" })),
      tokenHash,
      status: "active",
      expiresAt,
      createdAt: now,
      updatedAt: now,
      dataSnapshot,
    };

    shares.unshift(share);

    return {
      share: toShareRecord(share),
      shareToken: token,
      sharePath: `/shared/${token}`,
    };
  },

  revokeShare(ownerId: string, shareId: string): boolean {
    const share = shares.find(
      (item) => item.id === shareId && item.ownerId === ownerId
    );
    if (!share) return false;
    share.status = "revoked";
    share.updatedAt = new Date().toISOString();
    return true;
  },

  getSharePreview(token: string, viewerEmail: string): SharePreview {
    const share = findShareByToken(token);
    if (!share) {
      throw new ShareAccessError("Share link not found.", "SHARE_NOT_FOUND");
    }
    assertShareAccess(share, viewerEmail);

    return {
      ownerName: share.ownerName,
      recipientEmail: share.recipientEmail,
      resources: share.resources,
      status: share.status,
      expiresAt: share.expiresAt,
    };
  },

  getSharedData(token: string, viewerEmail: string): SharedProgressPayload {
    const share = findShareByToken(token);
    if (!share) {
      throw new ShareAccessError("Share link not found.", "SHARE_NOT_FOUND");
    }
    assertShareAccess(share, viewerEmail);

    const allowed = new Set(share.resources.map((resource) => resource.name));
    return {
      ownerName: share.ownerName,
      resources: [...allowed],
      data: share.dataSnapshot,
    };
  },
};

export function shareStoreErrorMessage(error: unknown): string {
  if (error instanceof ShareAccessError) return error.message;
  if (error instanceof Error) return error.message;
  return "Could not process share request.";
}

export function shareStoreErrorCode(error: unknown): string {
  if (error instanceof ShareAccessError) return error.code;
  if (error instanceof Error) return error.message;
  return "UNKNOWN";
}

export function shareStoreErrorMeta(
  error: unknown
): Record<string, string> | undefined {
  if (error instanceof ShareAccessError) return error.meta;
  return undefined;
}
