"use client";

import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export function DashboardLoading() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-3">
      <Loader2
        className="size-6 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
    </div>
  );
}

export function useDashboardAuth() {
  const { user, isLoading } = useAuth();
  return { user, isAuthLoading: isLoading };
}
