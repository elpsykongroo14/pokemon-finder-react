import { useEffect, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  PreferencesContext,
  type Preferences,
  type SpriteMode,
} from "../hooks/usePreferences";

const DEFAULT_PREFERENCES: Preferences = {
  animationsEnabled: true,
  soundEnabled: true,
  spriteMode: "pixel",
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useLocalStorage<Preferences>(
    "pokemon_preferences",
    DEFAULT_PREFERENCES,
  );

  //<html> exists outside anything React renders or owns, its the
  //one ancestor of #root that React never touches. reaching for
  //document.documentElement here is one of the few legitimate times
  //to step outside of React's model from inside a component, and
  //useEffect is the correct place to do it: it runs *after* React
  //has committed the render, as a deliberate side effect, not as
  //part of computing what JSX to produce.
  useEffect(() => {
    document.documentElement.dataset.motion = preferences.animationsEnabled
      ? "on"
      : "reduced";
  }, [preferences.animationsEnabled]);

  function setAnimationsEnabled(enabled: boolean) {
    setPreferences((prev) => ({ ...prev, animationsEnabled: enabled }));
  }

  function setSoundEnabled(enabled: boolean) {
    setPreferences((prev) => ({ ...prev, soundEnabled: enabled }));
  }

  function setSpriteMode(mode: SpriteMode) {
    setPreferences((prev) => ({ ...prev, spriteMode: mode }));
  }

  return (
    <PreferencesContext.Provider
      value={{
        ...preferences,
        setAnimationsEnabled,
        setSoundEnabled,
        setSpriteMode,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}
