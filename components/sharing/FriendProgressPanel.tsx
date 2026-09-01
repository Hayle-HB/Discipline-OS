"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

import { SharedProgressView } from "@/components/sharing/SharedProgressView";
import { Button } from "@/components/ui/button";
import { listIncomingShares, getIncomingShareData } from "@/lib/api/shares";
import { ApiError } from "@/lib/api/types";
import type {
  IncomingShareSummary,
  ShareResourcePermission,
  SharedProgressPayload,
} from "@/lib/data/types";
import { formatShareResources } from "@/lib/sharing/resources";
import { cn } from "@/lib/utils";

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function avatarStyle(name: string): { background: string; color: string } {
  const hue = hashName(name) % 360;
  return {
    background: `hsl(${hue} 42% 94%)`,
    color: `hsl(${hue} 32% 38%)`,
  };
}

function FriendAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "size-14 text-lg" : size === "sm" ? "size-9 text-sm" : "size-11 text-base";
  const colors = avatarStyle(name);

  return (
    <div
      style={colors}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-border/50",
        sizeClass
      )}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function FriendDetailHeader({
  ownerName,
  resources,
  onBack,
}: {
  ownerName: string;
  resources: ShareResourcePermission[];
  onBack: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-1 border-b border-border/60 bg-background/95 px-1 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 sm:-mx-0">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="-ml-1 mb-2 h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Friends
      </Button>

      <div className="flex items-center gap-3 pb-4 sm:gap-4">
        <FriendAvatar name={ownerName} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {ownerName}
          </h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {formatShareResources(resources)}
          </p>
        </div>
      </div>
    </header>
  );
}

function FriendProgressDetailPanel({
  friend,
  payload,
  loading,
  error,
  onBack,
}: {
  friend: IncomingShareSummary | null;
  payload: SharedProgressPayload | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}) {
  if (!friend) return null;

  return (
    <section className="flex min-h-0 w-full flex-col">
      <FriendDetailHeader
        ownerName={friend.ownerName}
        resources={friend.resources}
        onBack={onBack}
      />

      <div className="min-h-0 flex-1 py-4 sm:py-6">
        {loading && (
          <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            Loading progress…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {payload && !loading && !error && (
          <SharedProgressView payload={payload} hideHeader />
        )}
      </div>
    </section>
  );
}

export function FriendProgressPage() {
  const [friends, setFriends] = useState<IncomingShareSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payload, setPayload] = useState<SharedProgressPayload | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.id === selectedId) ?? null,
    [friends, selectedId]
  );

  const loadFriends = useCallback(async () => {
    try {
      setFriends(await listIncomingShares());
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load shared progress."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  async function openFriend(shareId: string) {
    setSelectedId(shareId);
    setDetailLoading(true);
    setDetailError(null);
    setPayload(null);
    try {
      setPayload(await getIncomingShareData(shareId));
    } catch (err) {
      setDetailError(
        err instanceof ApiError
          ? err.message
          : "Could not load this person's progress."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeFriend() {
    setSelectedId(null);
    setPayload(null);
    setDetailError(null);
  }

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="flex min-h-[55vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Loading friends…
        </div>
      </div>
    );
  }

  if (selectedId) {
    return (
      <div className="dashboard-page">
        <FriendProgressDetailPanel
          friend={selectedFriend}
          payload={payload}
          loading={detailLoading}
          error={detailError}
          onBack={closeFriend}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="animate-fade-up space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Accountability inbox
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Friends</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Progress shared with you shows up here automatically — no links required.
        </p>
      </header>

      <section className="mt-6 space-y-4 sm:mt-8" aria-label="Friends who shared with you">
        {friends.length > 0 && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {friends.length} {friends.length === 1 ? "share" : "shares"}
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        {friends.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 bg-gradient-to-b from-card/50 to-card/20 px-6 py-14 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary/70">
              <Users className="size-7 text-muted-foreground/80" aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-medium text-foreground">Nothing here yet</p>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
              When a friend shares from Profile, you&apos;ll see them listed here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {friends.map((friend) => (
              <li key={friend.id}>
                <button
                  type="button"
                  onClick={() => openFriend(friend.id)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/30 px-3 py-3 text-left transition-all hover:border-foreground/10 hover:bg-card/60 sm:px-4 sm:py-3.5"
                >
                  <FriendAvatar name={friend.ownerName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {friend.ownerName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {friend.resources.length} sections ·{" "}
                      {new Date(friend.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** @deprecated Use FriendProgressPage */
export function FriendProgressList() {
  return <FriendProgressPage />;
}

export function FriendProgressDetail({
  shareId,
  onBack,
}: {
  shareId: string;
  onBack?: () => void;
}) {
  const [friend, setFriend] = useState<IncomingShareSummary | null>(null);
  const [payload, setPayload] = useState<SharedProgressPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([listIncomingShares(), getIncomingShareData(shareId)])
      .then(([friends, data]) => {
        setFriend(friends.find((item) => item.id === shareId) ?? null);
        setPayload(data);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load shared progress."
        );
      })
      .finally(() => setIsLoading(false));
  }, [shareId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 px-5 py-10 text-center">
        <p className="text-sm text-destructive">{error ?? "Not found."}</p>
        <Link
          href="/dashboard/friends"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to Friends
        </Link>
      </div>
    );
  }

  return (
    <FriendProgressDetailPanel
      friend={
        friend ?? {
          id: shareId,
          ownerId: payload.ownerId ?? "",
          ownerName: payload.ownerName,
          resources: payload.resources.map((name) => ({
            name,
            permission: "view" as const,
          })),
          status: "active",
          expiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
      payload={payload}
      loading={false}
      error={null}
      onBack={
        onBack ??
        (() => {
          window.location.href = "/dashboard/friends";
        })
      }
    />
  );
}
