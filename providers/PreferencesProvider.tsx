"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DEFAULT_PREFERENCES } from "@/lib/preferences/constants";
import {
  readPreferences,
  writePreference,
  writePreferences,
} from "@/lib/preferences/storage";
import type {
  PreferenceKey,
  PreferenceValue,
  UserPreferences,
} from "@/lib/preferences/types";
import { applyThemeToDocument, resolveTheme } from "@/lib/theme/config";
import type { ResolvedTheme, ThemeId } from "@/lib/theme/types";

interface PreferencesContextValue {
  preferences: UserPreferences;
  resolvedTheme: ResolvedTheme;
  setPreference: <K extends PreferenceKey>(
    key: K,
    value: PreferenceValue<K>
  ) => void;
  setPreferences: (patch: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemeId) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferencesState] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("night");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = readPreferences();
    setPreferencesState(initial);
    setResolvedTheme(applyThemeToDocument(initial.theme));
    document.documentElement.dataset.themeReady = "true";
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || preferences.theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      setResolvedTheme(applyThemeToDocument("system"));
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preferences.theme, ready]);

  const setPreferences = useCallback((patch: Partial<UserPreferences>) => {
    const next = writePreferences(patch);
    setPreferencesState(next);
    if (patch.theme !== undefined) {
      setResolvedTheme(applyThemeToDocument(next.theme));
    }
  }, []);

  const setPreference = useCallback(
    <K extends PreferenceKey>(key: K, value: PreferenceValue<K>) => {
      const next = writePreference(key, value);
      setPreferencesState(next);
      if (key === "theme") {
        setResolvedTheme(applyThemeToDocument(next.theme));
      }
    },
    []
  );

  const setTheme = useCallback(
    (theme: ThemeId) => setPreference("theme", theme),
    [setPreference]
  );

  const value = useMemo(
    () => ({
      preferences,
      resolvedTheme,
      setPreference,
      setPreferences,
      setTheme,
    }),
    [preferences, resolvedTheme, setPreference, setPreferences, setTheme]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferencesContext(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      "usePreferencesContext must be used within PreferencesProvider."
    );
  }
  return context;
}

/** Read a single preference with setter — extend keys in PreferenceKey. */
export function usePreference<K extends PreferenceKey>(
  key: K
): [PreferenceValue<K>, (value: PreferenceValue<K>) => void] {
  const { preferences, setPreference } = usePreferencesContext();
  return [
    preferences[key],
    useCallback(
      (value: PreferenceValue<K>) => setPreference(key, value),
      [key, setPreference]
    ),
  ];
}

export function useTheme() {
  const { preferences, resolvedTheme, setTheme } = usePreferencesContext();
  return {
    theme: preferences.theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme !== "day",
  };
}

/** Safe hook for pages outside provider (returns defaults, no-op setter). */
export function useThemeOptional() {
  const context = useContext(PreferencesContext);
  if (!context) {
    return {
      theme: DEFAULT_PREFERENCES.theme,
      resolvedTheme: resolveTheme(DEFAULT_PREFERENCES.theme),
      setTheme: () => {},
      isDark: true,
    };
  }
  return {
    theme: context.preferences.theme,
    resolvedTheme: context.resolvedTheme,
    setTheme: context.setTheme,
    isDark: context.resolvedTheme !== "day",
  };
}
