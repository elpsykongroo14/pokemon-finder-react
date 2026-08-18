//the design goal is that this should feel like a drop-in replacement for useState
//same tuple return, same ability to pass either a value or an updater function to the setter
//so that nothing calling it has to think differently than it would with ordinary local state

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

//<T> makes it generic. T could be FavoritePokemon[] today or string[] for history,
//the hook doesn't care, it just persists whatever it's handed
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      //the lazy initializer does double duty.
      //it reads from localStorage and falls back to initialValue and guards against a corrupt/missing entry with try/catch
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      //storage full or unavailable
      //state still holds in memory
    }
  }, [key, value]);

  return [value, setValue];
}
