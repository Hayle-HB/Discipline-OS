"use client";

import { createContext, useContext } from "react";

import {
  DashboardLoading,
  useDashboardAuth,
} from "@/components/dashboard/DashboardLoading";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { AuthUser } from "@/lib/api/types";

const DashboardUserContext = createContext<AuthUser | null>(null);

export function useDashboardUser(): AuthUser {
  const user = useContext(DashboardUserContext);
  if (!user) {
    throw new Error("useDashboardUser must be used within the dashboard layout.");
  }
  return user;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const { user, isAuthLoading } = useDashboardAuth();

  if (isAuthLoading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <DashboardUserContext.Provider value={user}>
      <DashboardShell user={user}>{children}</DashboardShell>
    </DashboardUserContext.Provider>
  );
}
