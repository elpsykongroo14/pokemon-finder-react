//css handles the OS reduced motion settings for us (motion.css)
//but a typewriter is driven by javascript timers, and CSS  cant turn those off
//so JS has to read the setting itself

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia(QUERY).matches;
}

export function usePrefersReduceMotion() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

//the typeof window.matchMedia !== "function" guards exist because jsdom
//doesn't implement matchMedia. Without them, every test that renders a MessageBox would crash
