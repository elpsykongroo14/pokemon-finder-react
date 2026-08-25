import { useState, useEffect } from "react";

//return a copy of `value` that only updates once `value` has stopped changing for `delayMs`.
//generic over T so it works for the search query string here
//and for anything else debounced later
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delayMs);

    //cleanup: if `value` changes again before delayMs is up (the user typed another character)
    //react runs this BEFORE re runing the effect.
    //that cancels the pending timeout, so only the timer from the last keystroke in a burst actually fires
    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}
