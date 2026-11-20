import { useEffect, useState, type ReactNode } from "react";
import { PreferencesContext } from "../hooks/usePreferences";
import { usePrefersReduceMotion } from "../hooks/usePrefersReducedMotion";
import {
  PREFERENCES_KEY,
  parseStoredPreferences,
  resolveAnimations,
  type AnimationMode,
  type Preferences,
} from "../lib/preferences";
import type { SpriteMode } from "../lib/sprites";

//same lazy inializer pattern as TeamContext: read once, on mount through
//the parser. localStorage.getItem itself can throw (storage disabled), hence
//the try/catch around the read and not only around JSON.parse
function loadInitialPreference(): Preferences {
  try {
    return parseStoredPreferences(localStorage.getItem(PREFERENCES_KEY));
  } catch {
    return parseStoredPreferences(null);
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadInitialPreference);

  //live, not frozen: usePrefersReduceMotion subscribes to the OS setting
  //so a person on "auto" who flips the OS switch sees the app follow at once
  const osPrefersReducedMotion = usePrefersReduceMotion();

  //derived, never stored: storing it would create a second copy of the truth
  //that could disagree with the first the moment the OS setting changes
  const animationsEnabled = resolveAnimations(
    preferences.animations,
    osPrefersReducedMotion,
  );

  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      //storage full or unavailable
      //state stil holds in memory
    }
  }, [preferences]);

  //<html> exists outside anything React renders or owns, its the
  //one ancestor of #root that React never touches. reaching for
  //document.documentElement here is one of the few legitimate times
  //to step outside of React's model from inside a component, and
  //useEffect is the correct place to do it: it runs *after* React
  //has committed the render, as a deliberate side effect.
  //it writes the RESOLVED answer, so css (motion.css), plain JS
  //(lib/motion.ts) and React components all read the same one
  useEffect(() => {
    document.documentElement.dataset.motion = animationsEnabled
      ? "on"
      : "reduced";
  }, [animationsEnabled]);

  function setAnimations(mode: AnimationMode) {
    setPreferences((prev) => ({ ...prev, animations: mode }));
  }

  function setSpriteMode(mode: SpriteMode) {
    setPreferences((prev) => ({ ...prev, spriteMode: mode }));
  }

  return (
    <PreferencesContext.Provider
      value={{
        ...preferences,
        animationsEnabled,
        setAnimations,
        setSpriteMode,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
