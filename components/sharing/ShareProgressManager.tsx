"use client";

import {
  Check,
  ChevronRight,
  Loader2,
  Share2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardUser } from "@/components/dashboard/DashboardLayoutClient";
import { ShareAccessModal } from "@/components/sharing/ShareAccessModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShare, listShares } from "@/lib/api/shares";
import { ApiError } from "@/lib/api/types";
import type { ShareRecord, ShareResourceName } from "@/lib/data/types";
import {
  formatShareResources,
  SHARE_EXPIRATION_OPTIONS,
  SHARE_RESOURCES,
} from "@/lib/sharing/resources";
import { cn } from "@/lib/utils";

export function ShareProgressManager() {
  const user = useDashboardUser();
  const [shares, setShares] = useState<ShareRecord[]>([]);
  const [selectedResources, setSelectedResources] = useState<ShareResourceName[]>([
    "calendar",
  ]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [requestReciprocalAccess, setRequestReciprocalAccess] = useState(false);
  const [expirationId, setExpirationId] = useState("never");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingShare, setEditingShare] = useState<ShareRecord | null>(null);

  const expirationDays = useMemo(() => {
    return (
      SHARE_EXPIRATION_OPTIONS.find((option) => option.id === expirationId)?.days ??
      null
    );
  }, [expirationId]);

  const loadShares = useCallback(async () => {
    try {
      setShares(await listShares());
      setError(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load shared access list."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShares();
  }, [loadShares]);

  function toggleResource(id: ShareResourceName) {
    setSelectedResources((current) =>
      current.includes(id)
        ? current.filter((resource) => resource !== id)
        : [...current, id]
    );
  }

  async function handleCreateShare(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (selectedResources.length === 0) {
      setError("Select at least one section to share.");
      return;
    }

    const normalizedRecipient = recipientEmail.trim().toLowerCase();
    if (normalizedRecipient === user.email.toLowerCase()) {
      setError("Use a different email — you can't share progress with yourself.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createShare({
        recipientEmail: normalizedRecipient,
        resources: selectedResources.map((name) => ({ name, permission: "view" })),
        requestReciprocalAccess,
        ...(expirationDays ? { expiresInDays: expirationDays } : {}),
      });
      setSuccessMessage(
        result.updated
          ? `Updated access for ${normalizedRecipient}.`
          : `Shared with ${normalizedRecipient}.`
      );
      setRecipientEmail("");
      setRequestReciprocalAccess(false);
      await loadShares();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not create share link."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeShares = shares.filter((share) => share.status === "active");

  return (
    <>
      <Card className="border-border/60 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Share2 className="size-4" aria-hidden="true" />
            Share Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Send an invitation to share your progress by entering your recipient's email address.
       
          </p>

          <form onSubmit={handleCreateShare} className="space-y-5">
            <div className="space-y-3">
              <Label className="text-sm text-foreground">What do you want to share?</Label>
              <div className="space-y-2">
                {SHARE_RESOURCES.map((resource) => {
                  const checked = selectedResources.includes(resource.id);
                  return (
                    <label
                      key={resource.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                        checked
                          ? "border-foreground/20 bg-secondary/30"
                          : "border-border/60 bg-background/40 hover:bg-secondary/20"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleResource(resource.id)}
                        className="mt-0.5"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">
                          {resource.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {resource.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-email">Who can access it?</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="friend@gmail.com"
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-3">
              <Checkbox
                checked={requestReciprocalAccess}
                onCheckedChange={(checked) =>
                  setRequestReciprocalAccess(checked === true)
                }
                className="mt-0.5"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  Ask to see their progress too
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  They&apos;ll get a prompt to share back with you — two-way accountability.
                </span>
              </span>
            </label>

            <div className="space-y-2">
              <Label>Access expires</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SHARE_EXPIRATION_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setExpirationId(option.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition-colors",
                      expirationId === option.id
                        ? "border-foreground/20 bg-secondary text-foreground"
                        : "border-border/60 text-muted-foreground hover:bg-secondary/30"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Check className="size-4" aria-hidden="true" />
                  {successMessage}
                </p>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Share progress"
              )}
            </Button>
          </form>

          <div className="space-y-3 border-t border-border/60 pt-5">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" aria-hidden="true" />
              <h3 className="text-sm font-medium text-foreground">Shared access</h3>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading shares…
              </div>
            ) : activeShares.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active shares yet. Invite someone above to share your progress.
              </p>
            ) : (
              <ul className="space-y-2">
                {activeShares.map((share) => (
                  <li key={share.id}>
                    <button
                      type="button"
                      onClick={() => setEditingShare(share)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-left transition-colors hover:border-foreground/15 hover:bg-secondary/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {share.recipientEmail}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {formatShareResources(share.resources)} · View only
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Updated {new Date(share.updatedAt).toLocaleDateString()}
                          {share.requestReciprocalAccess && !share.reciprocalResponded
                            ? " · Reciprocal requested"
                            : ""}
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
          </div>
        </CardContent>
      </Card>

      <ShareAccessModal
        share={editingShare}
        open={Boolean(editingShare)}
        onClose={() => setEditingShare(null)}
        onSaved={(updated) => {
          setShares((current) =>
            current.map((share) => (share.id === updated.id ? updated : share))
          );
        }}
        onRevoked={(shareId) => {
          setShares((current) => current.filter((share) => share.id !== shareId));
        }}
      />
    </>
  );
}
