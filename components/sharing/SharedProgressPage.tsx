"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";

import { SharedProgressView } from "@/components/sharing/SharedProgressView";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import {
  clearAuthSession,
  getCurrentUser,
  getStoredToken,
} from "@/lib/api";
import { getSharePreview, getSharedProgress } from "@/lib/api/shares";
import { ApiError } from "@/lib/api/types";
import type { SharePreview, SharedProgressPayload } from "@/lib/data/types";

interface SharedProgressPageProps {
  token: string;
}

export function SharedProgressPage({ token }: SharedProgressPageProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<SharePreview | null>(null);
  const [payload, setPayload] = useState<SharedProgressPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSharedView = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      router.replace(`/login?redirect=${encodeURIComponent(`/shared/${token}`)}`);
      return;
    }

    try {
      await getCurrentUser();
      const sharePreview = await getSharePreview(token);
      setPreview(sharePreview);
      const data = await getSharedProgress(token);
      setPayload(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAuthSession();
        router.replace(`/login?redirect=${encodeURIComponent(`/shared/${token}`)}`);
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load shared progress."
      );
    } finally {
      setIsLoading(false);
    }
  }, [router, token]);

  useEffect(() => {
    loadSharedView();
  }, [loadSharedView]);

  if (isLoading) {
    return (
      <SharedPageShell>
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Loading shared progress…
        </div>
      </SharedPageShell>
    );
  }

  if (error) {
    return (
      <SharedPageShell>
        <div className="mx-auto max-w-lg rounded-xl border border-border/60 bg-card/50 p-6 text-center">
          <ShieldAlert className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
          <h1 className="mt-4 text-lg font-semibold text-foreground">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          {error.includes("shared with") && (
            <p className="mt-3 text-xs text-muted-foreground">
              Tip: open this link in a private window and sign in with the invited
              email — not the account that created the share.
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
            <Button asChild>
              <Link href={`/login?redirect=${encodeURIComponent(`/shared/${token}`)}`}>
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      </SharedPageShell>
    );
  }

  if (!payload || !preview) return null;

  return (
    <SharedPageShell>
      <div className="mx-auto max-w-3xl">
        <SharedProgressView payload={payload} />
      </div>
    </SharedPageShell>
  );
}

function SharedPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo href="/dashboard" />
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
