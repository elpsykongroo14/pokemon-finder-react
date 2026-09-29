import {
  useEffect,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTabsContext } from "./TabsContext";

interface TabListProps {
  children: ReactNode;
  "aria-label": string;
}

export function TabList({ children, ...rest }: TabListProps) {
  const { value } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  //why were using useLayoutEffect instead of useEffect:
  //were measuring the DOM and then writting a style
  //useLayoutEffect runs after React updates the DOM but before the browser paints,
  //if we measured in a normal useEffect, the browser would paint the paint the indicator in the wrong place for one frame
  //and wed see a flicker on every tab change
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const selected = list.querySelector<HTMLElement>(
        '[aria-selected="true"]',
      );
      if (!selected) return;
      list.style.setProperty("--indicator-x", `${selected.offsetLeft}px`);
      list.style.setProperty("--indicator-w", String(selected.offsetWidth));
    };
    //we write to list.style directly instead of using state
    //measuring layout and applying it is a legitimate reason to bypass React state
    //putting pixel values in state would trigger an extra render for no benefit, since nothing else reads them.

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value]);
  //ResizeObserver keeps the indicator correct  when the tab list changes size
  //(a window resize, or a web font finishing loading and shifting text widths)
  //the typeOf ResizeObserver === "undefined" guard exists because jsdom, our test enviroment doesnt implement it

  useEffect(() => {
    if (listRef.current) listRef.current.dataset.ready = "true";
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const current = tabs.indexOf(e.target as HTMLButtonElement);
    if (current === -1) return;

    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = (current + 1) % tabs.length;
        break;
      case "ArrowLeft":
        next = (current - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    tabs[next].focus();
  }

  return (
    <div
      {...rest}
      ref={listRef}
      role="tablist"
      className="tab-list"
      onKeyDown={handleKeyDown}
    >
      {children} <span className="tab-indicator" aria-hidden="true" />
    </div>
  );
}
