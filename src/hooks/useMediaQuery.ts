import { useCallback, useSyncExternalStore } from "react";

//"does this media query match right now?", kept up to date as the window
//changes. the browser owns the answer, React only reads it, so this is a
//subscription to an outside store: useSyncExternalStore is React's tool
//for exactly that (subscribe to changes + read the current value), and it
//can never show a stale answer during a render, which a useState copy
//updated from an effect could
//
//the typeof guards exist because jsdom (the test DOM) has no matchMedia;
//there every query answers false, which means "desktop" for the phone query
export function useMediaQuery(query: string): boolean {
  //useCallback: React re-subscribes whenever subscribe is a NEW function.
  //without it that would be every render; with it, only when query changes
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== "function") return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = () =>
    typeof window.matchMedia === "function" && window.matchMedia(query).matches;

  return useSyncExternalStore(subscribe, getSnapshot);
}
