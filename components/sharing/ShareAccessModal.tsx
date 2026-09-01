"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { revokeShare, updateShare } from "@/lib/api/shares";
import { ApiError } from "@/lib/api/types";
import type { ShareRecord, ShareResourceName } from "@/lib/data/types";
import { SHARE_RESOURCES } from "@/lib/sharing/resources";
import { cn } from "@/lib/utils";

interface ShareAccessModalProps {
  share: ShareRecord | null;
  open: boolean;
  onClose: () => void;
  onSaved: (share: ShareRecord) => void;
  onRevoked: (shareId: string) => void;
}

export function ShareAccessModal({
  share,
  open,
  onClose,
  onSaved,
  onRevoked,
}: ShareAccessModalProps) {
  const [selectedResources, setSelectedResources] = useState<ShareResourceName[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (share) {
      setSelectedResources(share.resources.map((resource) => resource.name));
      setError(null);
    }
  }, [share]);

  if (!open || !share) return null;

  const activeShare = share;

  function toggleResource(id: ShareResourceName) {
    setSelectedResources((current) =>
      current.includes(id)
        ? current.filter((resource) => resource !== id)
        : [...current, id]
    );
  }

  async function handleSave() {
    if (selectedResources.length === 0) {
      setError("Select at least one section to share.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateShare(activeShare.id, {
        resources: selectedResources.map((name) => ({ name, permission: "view" })),
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update share.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRevoke() {
    setIsRevoking(true);
    setError(null);
    try {
      await revokeShare(activeShare.id);
      onRevoked(activeShare.id);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not revoke access.");
    } finally {
      setIsRevoking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border/60 bg-card shadow-xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Manage access
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold text-foreground">
              {activeShare.recipientEmail}
            </h3>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Choose what this person can view. Changes apply immediately.
          </p>

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

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/60 px-5 py-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="gap-2 text-destructive hover:text-destructive"
            disabled={isSaving || isRevoking}
            onClick={handleRevoke}
          >
            {isRevoking ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            Remove access
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving || isRevoking}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
