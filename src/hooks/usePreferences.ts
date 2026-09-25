import { createContext, useContext } from "react";

export type SpriteMode = "pixel" | "artwork";

export interface Preferences {
  animationsEnabled: boolean;
  soundEnabled: boolean;
  spriteMode: SpriteMode;
}

export interface PreferencesContextValue extends Preferences {
  setAnimationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSpriteMode: (mode: SpriteMode) => void;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(
  null,
);

//same guard clause reasoning as useFavorites: without this check
//calling usePreferences() outside a <PreferencesProvider> would
//silently hand back null, and the crash would happen later,
//somewhere confusing, when code tries to read ".animationsEnabled"
//off of null. throwing here, immediately, with a clear message,
//turns that into an obvious bug at the exact place it was made
export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return ctx;
}
