"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { CommitmentItem } from "@/components/dashboard/CommitmentItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Commitment } from "@/lib/api/types";

interface TodayCommitmentsProps {
  commitments: Commitment[];
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (label: string) => Promise<void>;
}

export function TodayCommitments({
  commitments,
  onToggle,
  onDelete,
  onAdd,
}: TodayCommitmentsProps) {
  const [newLabel, setNewLabel] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setIsAdding(true);
    try {
      await onAdd(newLabel.trim());
      setNewLabel("");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleToggle(id: string) {
    setBusyId(id);
    try {
      await onToggle(id);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await onDelete(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm animate-fade-up animation-delay-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">
          Today&apos;s Commitments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {commitments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No commitments yet. Add your first promise below.
            </p>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Today's commitments">
            {commitments.map((commitment) => (
              <li key={commitment.id}>
                <CommitmentItem
                  commitment={commitment}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  disabled={busyId === commitment.id}
                />
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Add a new commitment…"
            disabled={isAdding}
            aria-label="New commitment"
          />
          <Button type="submit" disabled={isAdding || !newLabel.trim()}>
            {isAdding ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            <span className="sr-only sm:not-sr-only">Add</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
