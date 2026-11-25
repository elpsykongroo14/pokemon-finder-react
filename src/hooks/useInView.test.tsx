import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useInView } from "./useInView";

//a stand-in IntersectionObserver the test can drive by hand
let observerCallback: IntersectionObserverCallback | null = null;
const disconnect = vi.fn();
const observe = vi.fn();

function installObserver() {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = () => [];
    },
  );
}

function scrollIntoView(isIntersecting: boolean) {
  act(() => {
    observerCallback?.(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  return <div ref={ref}>{seen ? "seen" : "not yet"}</div>;
}

afterEach(() => {
  vi.unstubAllGlobals();
  observerCallback = null;
  disconnect.mockClear();
  observe.mockClear();
});

//the Pokémon page's cards teaser fetches only once it scrolls into view
//(spec 7.2), so the page never waits on the card proxy
describe("useInView", () => {
  it("is false until the element scrolls into view, then true", () => {
    installObserver();
    render(<Probe />);

    expect(screen.getByText("not yet")).toBeInTheDocument();
    expect(observe).toHaveBeenCalledTimes(1);

    scrollIntoView(false);
    expect(screen.getByText("not yet")).toBeInTheDocument();

    scrollIntoView(true);
    expect(screen.getByText("seen")).toBeInTheDocument();
  });

  //once seen, the answer never goes back: the fetch has started
  it("stops watching once it has been seen", () => {
    installObserver();
    render(<Probe />);

    scrollIntoView(true);
    expect(disconnect).toHaveBeenCalled();
  });

  it("stops watching when the element goes away", () => {
    installObserver();
    const { unmount } = render(<Probe />);

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  //an old browser (or the test DOM) without IntersectionObserver: load at
  //once rather than never
  it("counts as seen at once where IntersectionObserver does not exist", () => {
    render(<Probe />);

    expect(screen.getByText("seen")).toBeInTheDocument();
  });
});
