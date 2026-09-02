import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it("falls back to the initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("default");

    //render.current here is a tuple, [value, setValue]
    //same shape useState returns, so result.current[0] is the current stored value
  });

  it("reads an existing value from storage on mount", () => {
    localStorage.setItem("test-key", JSON.stringify("stored value"));
    //set up storage before rendering the hook not after
    //were testing what happens on mount, which is the only moment
    //the lazy initializer runs

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("stored value");
  });

  it("falls back to the initial value when stored data is corrupt", () => {
    localStorage.setItem("test-key", "{not valid json}");

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("default");
  });

  it("persists a new value to storage when setter is called", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    act(() => {
      result.current[1]("updated");
    });
    //result.current[1] is the setter, calling it triggers a useState update
    //which is a state change happening from our test code rather than from a simulated user event
    //so it needs the same act(...) wrapping we used for the fake timer callback

    //we assert on two things here on purpose:
    //the in memory value(what a re render would show) and the actual localStorage contents(the persistence contract itself)
    //either one regressing would be a real bug

    expect(result.current[0]).toBe("updated");
    expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
  });
});
