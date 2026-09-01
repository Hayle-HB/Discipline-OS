"use client";

import { Mail, Palette, UserRound } from "lucide-react";

import { useDashboardUser } from "@/components/dashboard/DashboardLayoutClient";
import { ThemePicker } from "@/components/preferences/ThemePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const user = useDashboardUser();

  return (
    <div className="dashboard-page dashboard-page-narrow">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account details and appearance preferences.
        </p>
      </div>

      <div className="mt-6 space-y-5 sm:mt-8">
        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <UserRound className="size-4" aria-hidden="true" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-foreground">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-medium text-foreground">
                  {user.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                  {user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Palette className="size-4" aria-hidden="true" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="theme-select" className="text-sm text-foreground">
              Theme
            </Label>
            <ThemePicker variant="dropdown" />
            <p className="text-xs text-muted-foreground">
              Choose how Discipline OS looks on this device.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
