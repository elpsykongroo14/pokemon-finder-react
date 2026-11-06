import { createContext, useContext } from "react";
import type { AnimationMode, Preferences } from "../lib/preferences";
import type { SpriteMode } from "../lib/sprites";

export type { AnimationMode, Preferences, SpriteMode };

//two different things live side by side here on purpose:
//  animations         = what the person chose ("auto" | "on" | "off"), for the settings UI
//  animationsEnabled  = what that choice means right now, for everything that animates
//components that animate only ever read the second one, so they never have to
//know that "auto" exists or ask the OS themselves
export interface PreferencesContextValue extends Preferences {
  animationsEnabled: boolean;
  setAnimations: (mode: AnimationMode) => void;
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
