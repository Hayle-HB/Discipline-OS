"use client";

import { Flame, Trash2 } from "lucide-react";

import type { Commitment } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface CommitmentItemProps {
  commitment: Commitment;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function CommitmentItem({
  commitment,
  onToggle,
  onDelete,
  disabled = false,
}: CommitmentItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between rounded-lg border border-border bg-background/50 px-4 py-3 transition-all duration-200",
        commitment.completed && "border-emerald-500/20 bg-emerald-500/5",
        !disabled && "hover:border-border hover:bg-secondary/30"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(commitment.id)}
        disabled={disabled}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-pressed={commitment.completed}
        aria-label={`Mark "${commitment.label}" as ${commitment.completed ? "incomplete" : "complete"}`}
      >
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            commitment.completed
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-border bg-secondary group-hover:border-foreground/30"
          )}
          aria-hidden="true"
        >
          {commitment.completed && (
            <svg
              viewBox="0 0 12 12"
              className="size-2.5 text-emerald-400"
              fill="none"
            >
              <path
                d="M2.5 6L5 8.5L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span
          className={cn(
            "truncate text-sm transition-colors",
            commitment.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          )}
        >
          {commitment.label}
        </span>
      </button>

      <div className="ml-3 flex shrink-0 items-center gap-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Flame
            className="size-3 text-orange-400/80"
            aria-hidden="true"
          />
          {commitment.streak}d
        </span>
        <button
          type="button"
          onClick={() => onDelete(commitment.id)}
          disabled={disabled}
          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus:opacity-100 group-hover:opacity-100 disabled:opacity-50"
          aria-label={`Delete "${commitment.label}"`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
