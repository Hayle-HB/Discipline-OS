"use client";

import { Flame } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Habit } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function HabitCard({ habit, onToggle, disabled }: HabitCardProps) {
  return (
    <Card
      className={cn(
        "border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-200",
        habit.completedToday && "border-emerald-500/20 bg-emerald-500/5"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onToggle(habit.id)}
            disabled={disabled}
            className="flex min-w-0 flex-1 items-start gap-3 text-left"
            aria-pressed={habit.completedToday}
          >
            <span
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2"
              style={{ borderColor: habit.color }}
              aria-hidden="true"
            >
              {habit.completedToday && (
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
              )}
            </span>
            <div className="min-w-0">
              <h3
                className={cn(
                  "font-medium text-foreground",
                  habit.completedToday && "text-muted-foreground line-through"
                )}
              >
                {habit.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {habit.description}
              </p>
            </div>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Flame className="size-3 text-orange-400/80" aria-hidden="true" />
            {habit.streak}d streak
          </span>
          <span className="capitalize">{habit.frequency}</span>
          <span>{habit.completionRate}% rate</span>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${habit.completionRate}%`,
              backgroundColor: habit.color,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
