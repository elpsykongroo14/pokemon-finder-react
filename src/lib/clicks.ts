import type { MouseEvent } from "react";

//a click the browser should handle itself: ctrl/cmd-click opens a new tab
//shift click a new window, middle click does its own thing
//pick<> means tests can pass a plain object instead of a real event
export function isPlainLeftClick(
  event: Pick<
    MouseEvent,
    "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey"
  >,
): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
