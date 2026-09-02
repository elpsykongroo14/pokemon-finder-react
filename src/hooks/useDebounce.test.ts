import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it("returns the initial value immediately on first render", () => {
    const { result } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "pika", delay: 300 } },
    );

    expect(result.current).toBe("pika");
  });

  it("does not update before the delay has elapsed", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "pika", delay: 300 } },
    );

    rerender({ value: "charmandeer", delay: 300 });

    expect(result.current).toBe("pika");
  });

  it("updates to the latest value once the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "pika", delay: 300 } },
    );

    rerender({ value: "charmander", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("charmander");
  });

  it("collapses a rapid burst of changes into a single final update", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "p", delay: 300 } },
    );
    rerender({ value: "pi", delay: 300 });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: "pik", delay: 300 });
    act(() => vi.advanceTimersByTime(100));

    rerender({ value: "pika", delay: 300 });
    act(() => vi.advanceTimersByTime(100));

    // only 300ms have passed since "pika" arrived (100ms), so nothing has committed yet
    expect(result.current).toBe("p");

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("pika");
  });
});
