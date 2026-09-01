"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { THEME_OPTIONS } from "@/lib/theme/config";
import type { ThemeId } from "@/lib/theme/types";
import { useTheme } from "@/providers/PreferencesProvider";
import { cn } from "@/lib/utils";

interface ThemePickerProps {
  /** Profile page dropdown or compact icon menu (auth/landing). */
  variant?: "dropdown" | "compact";
  className?: string;
}

export function ThemePicker({ variant = "dropdown", className }: ThemePickerProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (variant === "compact") {
    const active = THEME_OPTIONS.find((t) => t.id === theme) ?? THEME_OPTIONS[0];
    const ActiveIcon = active.icon;

    return (
      <div ref={menuRef} className={cn("relative", className)}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-11 items-center justify-center rounded-lg border border-border bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          aria-label="Theme preference"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <ActiveIcon className="size-4" aria-hidden="true" />
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Choose theme"
            className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-border bg-popover p-1 shadow-lg"
          >
            {THEME_OPTIONS.map((option) => (
              <ThemeMenuItem
                key={option.id}
                option={option}
                selected={theme === option.id}
                onSelect={() => {
                  setTheme(option.id);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const active = THEME_OPTIONS.find((t) => t.id === theme) ?? THEME_OPTIONS[0];
  const ActiveIcon = active.icon;

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        id="theme-select"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:bg-secondary/40"
      >
        <span className="flex items-center gap-2">
          <ActiveIcon className="size-4 shrink-0 text-foreground" aria-hidden="true" />
          <span className="font-medium">{active.label}</span>
          <span className="hidden text-muted-foreground sm:inline">
            — {active.description}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby="theme-select"
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover py-1 shadow-lg"
        >
          {THEME_OPTIONS.map((option) => (
            <ThemeMenuItem
              key={option.id}
              option={option}
              selected={theme === option.id}
              onSelect={() => {
                setTheme(option.id);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThemeMenuItem({
  option,
  selected,
  onSelect,
}: {
  option: (typeof THEME_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
        selected
          ? "bg-secondary font-medium text-foreground"
          : "text-foreground/80 hover:bg-secondary/50"
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1">{option.label}</span>
    </button>
  );
}
