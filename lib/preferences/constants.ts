import type { UserPreferences } from "@/lib/preferences/types";

export const PREFERENCES_STORAGE_KEY = "discipline-os-preferences";
export const PREFERENCES_VERSION = 1;

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "night",
};
