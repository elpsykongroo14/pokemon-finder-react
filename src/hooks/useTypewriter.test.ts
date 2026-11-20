import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TYPEWRITER_TICK_MS, useTypewriter } from "./useTypewriter";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function tick(times: number) {
  act(() => {
    vi.advanceTimersByTime(TYPEWRITER_TICK_MS * times);
  });
}

describe("useTypewriter", () => {
  it("reveals one character per tick and stops at the full text", () => {
    const { result } = renderHook(() => useTypewriter("Hi!", true));
    expect(result.current).toBe("");

    tick(1);
    expect(result.current).toBe("H");

    tick(5);
    expect(result.current).toBe("Hi!");
  });

  it("returns the full text immediately when disabled", () => {
    const { result } = renderHook(() => useTypewriter("Hi!", false));
    expect(result.current).toBe("Hi!");
  });

  it("restarts from the beginning when the text changes", () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, true),
      { initialProps: { text: "Hi" } },
    );
    tick(2);
    expect(result.current).toBe("Hi");

    rerender({ text: "Yo" });
    expect(result.current).toBe("");

    tick(1);
    expect(result.current).toBe("Y");
  });
});
