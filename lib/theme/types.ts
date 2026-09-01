/** Stored theme preference (includes system auto). */
export type ThemeId = "night" | "day" | "dusk" | "system";

/** Resolved theme applied to the document (system → night or day). */
export type ResolvedTheme = "night" | "day" | "dusk";
