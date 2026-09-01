import type { ThemeId } from "@/lib/theme/types";

/** Keys stored in user preferences — extend this union for new settings. */
export type PreferenceKey = "theme";

export interface UserPreferences {
  theme: ThemeId;
}

export type PreferenceValue<K extends PreferenceKey> = UserPreferences[K];
