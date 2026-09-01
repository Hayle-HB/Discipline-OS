import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  PREFERENCES_VERSION,
} from "@/lib/preferences/constants";
import type {
  PreferenceKey,
  PreferenceValue,
  UserPreferences,
} from "@/lib/preferences/types";

interface StoredPreferences {
  version: number;
  values: Partial<UserPreferences>;
}

function readStored(): StoredPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredPreferences;
    if (parsed.version !== PREFERENCES_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readPreferences(): UserPreferences {
  const stored = readStored();
  return {
    ...DEFAULT_PREFERENCES,
    ...stored?.values,
  };
}

export function readPreference<K extends PreferenceKey>(
  key: K
): PreferenceValue<K> {
  return readPreferences()[key];
}

export function writePreferences(patch: Partial<UserPreferences>): UserPreferences {
  const next = { ...readPreferences(), ...patch };

  if (typeof window !== "undefined") {
    const payload: StoredPreferences = {
      version: PREFERENCES_VERSION,
      values: next,
    };
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(payload));
  }

  return next;
}

export function writePreference<K extends PreferenceKey>(
  key: K,
  value: PreferenceValue<K>
): UserPreferences {
  return writePreferences({ [key]: value } as Partial<UserPreferences>);
}
