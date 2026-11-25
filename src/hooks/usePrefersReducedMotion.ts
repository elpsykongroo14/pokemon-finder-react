//css handles the OS reduced motion settings for us (motion.css)
//but a typewriter is driven by javascript timers, and CSS  cant turn those off
//so JS has to read the setting itself

import { useMediaQuery } from "./useMediaQuery";

//one media query among others: the subscription itself lives in
//useMediaQuery (which also covers jsdom having no matchMedia)
export function usePrefersReduceMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
