"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Flame,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings2,
} from "lucide-react";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api";
import type { AuthUser } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: "Today", href: "/dashboard", icon: LayoutDashboard },
  { label: "Manage", href: "/dashboard/manage", icon: Settings2 },
  { label: "Habits", href: "/dashboard/habits", icon: Flame },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

interface DashboardShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    router.replace("/login");
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-card/50 lg:flex">
        <div className="shrink-0 border-b border-border px-6 py-5">
          <Logo />
        </div>

        <nav
          className="shrink-0 space-y-1 px-3 py-4"
          aria-label="Dashboard"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-disabled={item.disabled}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                item.disabled && "pointer-events-none opacity-40"
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto shrink-0 border-t border-border p-4">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="size-4" aria-hidden="true" />
            )}
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4 lg:hidden">
          <Logo showText={false} />
          <div className="flex items-center gap-2">
            <span className="max-w-[120px] truncate text-sm text-muted-foreground">
              {user.name}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Log out"
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

        <nav
          className="flex shrink-0 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden"
          aria-label="Mobile dashboard"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
