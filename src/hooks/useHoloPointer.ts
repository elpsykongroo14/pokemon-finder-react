import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { getHoloPose, type HoloPose } from "../lib/holo";
import { animationsAreOff } from "../lib/motion";

//the pointer moves up to hundreds of times a second, if each move went
//through react state, every card on the page could re-render every time
//instead this hook writes the numbers straight onto ONE element as CSS
//variables (--mx --my --rx --ry) and lets CSS do the drawing
//react does not know it happened, and does not need to.

function writePose(element: HTMLElement, pose: HoloPose) {
  element.style.setProperty("--mx", `${pose.mx}%`);
  element.style.setProperty("--my", `${pose.my}%`);
  element.style.setProperty("--rx", `${pose.rx}deg`);
  element.style.setProperty("--ry", `${pose.ry}deg`);
}

//removing the variable (not setting them to 0) hands control back to the
//fallback values written in the CSS: var(--mx, 30%)
function clearPose(element: HTMLElement) {
  for (const name of ["--mx", "--my", "--rx", "--ry"]) {
    element.style.removeProperty(name);
  }
}

//the caller owns the ref and passes it in (the same shape as "click outside"
//the hook). that keeps this hook's return value to plain functions, which React is
//allowed to hand to JSX during render; an object that contains a ref is not
export function useHoloPointer<T extends HTMLElement>(
  ref: RefObject<T | null>,
  enabled: boolean,
) {
  const frameId = useRef<number | null>(null);
  const isScheduled = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const cancelPendingFrame = useCallback(() => {
    if (frameId.current !== null) cancelAnimationFrame(frameId.current);
    frameId.current = null;
    isScheduled.current = false;
    lastPoint.current = null;
  }, []);

  //never leave a scheduled frame behinf when the card goes away
  useEffect(() => cancelPendingFrame, [cancelPendingFrame]);

  //if the effect gets turned off while a card is shown, put it back at rest
  useEffect(() => {
    if (enabled) return;
    cancelPendingFrame();
    if (ref.current) clearPose(ref.current);
  }, [ref, enabled, cancelPendingFrame]);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      //a finger is not a hovering pointer: touch gets the static shine only
      if (!enabled || event.pointerType === "touch") return;

      //remember only the latest position, between two frames we may get
      //many moves, but only the last one is worth drawing
      lastPoint.current = { x: event.clientX, y: event.clientY };
      if (isScheduled.current) return;
      isScheduled.current = true;

      frameId.current = requestAnimationFrame(() => {
        isScheduled.current = false;
        const element = ref.current;
        const point = lastPoint.current;
        if (!element || !point || animationsAreOff()) return;
        writePose(
          element,
          getHoloPose(element.getBoundingClientRect(), point.x, point.y),
        );
      });
    },
    [ref, enabled],
  );

  const onPointerLeave = useCallback(() => {
    cancelPendingFrame();
    if (ref.current) clearPose(ref.current);
  }, [ref, cancelPendingFrame]);

  return { onPointerMove, onPointerLeave };
}
