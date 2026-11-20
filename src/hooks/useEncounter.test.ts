import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StrictMode } from "react";
import { renderHook } from "@testing-library/react";
import { useEncounter } from "./useEncounter";
import { usePokemon } from "./usePokemon";
import { ENCOUNTER_KEY } from "../lib/encounter";

vi.mock("./usePokemon", () => ({ usePokemon: vi.fn() }));

const retry = vi.fn();

describe("useEncounter", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      retry,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("looks up the pokemon whose id the dice picked", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const { result } = renderHook(() => useEncounter());

    expect(result.current.id).toBe(513);
    expect(usePokemon).toHaveBeenCalledWith("513");
  });

  it("passes the lookup's data, loading, error and retry straight through", () => {
    const { result } = renderHook(() => useEncounter());

    expect(result.current).toMatchObject({
      data: null,
      loading: true,
      error: null,
      retry,
    });
  });

  it("keeps the same encounter across re-renders", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);

    const { result, rerender } = renderHook(() => useEncounter());
    rerender();
    rerender();

    expect(result.current.id).toBe(513);
    expect(random).toHaveBeenCalledTimes(1);
  });

  it("keeps the same encounter when Home is left and visited again", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValue(0.9);

    const first = renderHook(() => useEncounter());
    first.unmount(); //leaving home
    const second = renderHook(() => useEncounter()); //coming back

    expect(second.result.current.id).toBe(first.result.current.id);
  });

  it("rolls the dice only once even when React StrictMode runs the initializer twice", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);

    const { result } = renderHook(() => useEncounter(), {
      wrapper: StrictMode,
    });

    expect(result.current.id).toBe(513);
    expect(random).toHaveBeenCalledTimes(1);
  });

  it("saves the encounter in sessionStorage", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    renderHook(() => useEncounter());

    expect(sessionStorage.getItem(ENCOUNTER_KEY)).toBe("1");
  });
});
