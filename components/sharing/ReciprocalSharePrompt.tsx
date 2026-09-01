"use client";

import { ArrowLeftRight, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { respondToReciprocalShare } from "@/lib/api/shares";
import { ApiError } from "@/lib/api/types";
import type { ShareResourceName } from "@/lib/data/types";
import { SHARE_RESOURCES } from "@/lib/sharing/resources";
import { cn } from "@/lib/utils";

interface ReciprocalSharePromptProps {
  ownerName: string;
  shareId: string;
  onComplete: () => void;
}

export function ReciprocalSharePrompt({
  ownerName,
  shareId,
  onComplete,
}: ReciprocalSharePromptProps) {
  const [selectedResources, setSelectedResources] = useState<ShareResourceName[]>([
    "calendar",
    "streak",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleResource(id: ShareResourceName) {
    setSelectedResources((current) =>
      current.includes(id)
        ? current.filter((resource) => resource !== id)
        : [...current, id]
    );
  }

  async function handleAccept() {
    if (selectedResources.length === 0) {
      setError("Select at least one section to share back.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await respondToReciprocalShare(shareId, {
        accept: true,
        resources: selectedResources.map((name) => ({ name, permission: "view" })),
      });
      onComplete();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not share your progress back."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDecline() {
    setIsSubmitting(true);
    setError(null);
    try {
      await respondToReciprocalShare(shareId, {
        accept: false,
        resources: [],
      });
      onComplete();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not dismiss request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <ArrowLeftRight className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground sm:text-base">
            Share back with {ownerName}?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {ownerName} asked to see your progress too. Choose what you&apos;d like to share
            back — two-way accountability.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {SHARE_RESOURCES.map((resource) => {
          const checked = selectedResources.includes(resource.id);
          return (
            <label
              key={resource.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                checked
                  ? "border-foreground/15 bg-background/60"
                  : "border-border/50 bg-background/30"
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggleResource(resource.id)}
              />
              <span className="text-sm text-foreground">{resource.label}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          disabled={isSubmitting}
          onClick={handleDecline}
        >
          Not now
        </Button>
        <Button type="button" disabled={isSubmitting} onClick={handleAccept}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sharing…
            </>
          ) : (
            "Share my progress"
          )}
        </Button>
      </div>
    </div>
  );
}
