import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "./useMediaQuery";

//a stand-in for window.matchMedia that the test can flip, like resizing
//the window across the breakpoint
function stubMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    get matches() {
      return matches;
    },
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  }));
  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach((fn) => fn());
    },
    listenerCount: () => listeners.size,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("reads whether the query matches right now", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(max-width: 1000px)"));
    expect(result.current).toBe(true);
  });

  it("follows the query when it starts or stops matching", () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 1000px)"));
    expect(result.current).toBe(false);

    act(() => media.set(true));
    expect(result.current).toBe(true);

    act(() => media.set(false));
    expect(result.current).toBe(false);
  });

  it("stops listening when the component unmounts", () => {
    const media = stubMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery("(max-width: 1000px)"));
    expect(media.listenerCount()).toBe(1);

    unmount();
    expect(media.listenerCount()).toBe(0);
  });

  //jsdom (and very old browsers) have no matchMedia at all: answer "no
  //match" instead of crashing every test that renders the Pokémon page
  it("answers false where matchMedia does not exist", () => {
    vi.stubGlobal("matchMedia", undefined);
    const { result } = renderHook(() => useMediaQuery("(max-width: 1000px)"));
    expect(result.current).toBe(false);
  });
});
