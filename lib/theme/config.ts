import type { LucideIcon } from "lucide-react";
import { Laptop, Moon, Sun, Sunset } from "lucide-react";

import type { ResolvedTheme, ThemeId } from "@/lib/theme/types";

export interface ThemeOption {
  id: ThemeId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "night",
    label: "Night",
    description: "Dark, focused workspace",
    icon: Moon,
  },
  {
    id: "day",
    label: "Day",
    description: "Bright, clean interface",
    icon: Sun,
  },
  {
    id: "dusk",
    label: "Dusk",
    description: "Soft blue-toned dark",
    icon: Sunset,
  },
  {
    id: "system",
    label: "System",
    description: "Match your device",
    icon: Laptop,
  },
];

export function getThemeOption(id: ThemeId): ThemeOption {
  return THEME_OPTIONS.find((t) => t.id === id) ?? THEME_OPTIONS[0];
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "night";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "night"
    : "day";
}

export function resolveTheme(theme: ThemeId): ResolvedTheme {
  if (theme === "system") return getSystemTheme();
  return theme;
}

export function applyThemeToDocument(theme: ThemeId): ResolvedTheme {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.resolvedTheme = resolved;
  root.style.colorScheme = resolved === "day" ? "light" : "dark";
  return resolved;
}
