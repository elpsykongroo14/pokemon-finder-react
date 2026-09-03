import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePokemon } from "./usePokemon";
import type { PokemonDetails } from "../lib/type";

const { fetchPokemon } = vi.hoisted(() => ({ fetchPokemon: vi.fn() }));
vi.mock("../lib/api", () => ({ fetchPokemon }));

const mockPokemon: PokemonDetails = {
  name: "pikachu",
  id: 25,
  height: 4,
  weight: 60,
  types: [{ slot: 1, type: { name: "electric", url: "" } }],
  sprites: {
    front_default: "https://img.example/default.png",
    front_shiny: "https://img.example/shiny.png",
  },
  abilities: [
    { is_hidden: false, slot: 1, ability: { name: "static", url: "" } },
  ],
  stats: [{ base_stat: 35, effort: 0, stat: { name: "hp", url: "" } }],
  species: {
    name: "pikachu",
    url: "https://pokeapi.co/api/v2/pokemon-species/25/",
  },
};

describe("usePokemon", () => {
  beforeEach(() => {
    fetchPokemon.mockReset();
  });

  it("does not fetch when the name is blank", () => {
    const { result } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "   " },
    });

    expect(fetchPokemon).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, loading: false, error: null });
  });

  it("sets loading, then resolves with data", async () => {
    fetchPokemon.mockResolvedValue(mockPokemon);

    const { result } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(mockPokemon);
    expect(result.current.error).toBeNull();
  });

  it("surfaces the error message when the fetch fails", async () => {
    fetchPokemon.mockRejectedValue(new Error("Pokemon not found"));

    const { result } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "missingno" },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Pokemon not found");
    expect(result.current.data).toBeNull();
  });

  it("does not treat an aborted request as an error", async () => {
    fetchPokemon.mockRejectedValue(new DOMException("Aborted", "AbortError"));
    //new DOMException(message, name) builds the exact shape the browser's real AbortController produces when we abort a fetch
    //so we're simulating the real failure mode, not an approximation of it

    const { result } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
  });

  it("aborts the in-flight request when the name changes before it resolves", () => {
    //were not asserting on anything usePokemon returns,
    //were asserting on a side effect on an object the hook created itself.
    //the real AbortController's signal, the trick:
    //instead of mocking AbortController (which would mean testing our own fake instead of real browser behavior)
    //we let the hook create a real one, jsdom porvides a real AbortController/AbortSignal implementation
    //and we just capture a reference to the signal the moment our mocked fetchPokemon receives it

    const signals: AbortSignal[] = [];
    fetchPokemon.mockImplementation((_name, options) => {
      if (options?.signal) {
        signals.push(options.signal);
      }
      return new Promise(() => {}); // never resolves, simulates a request still in flight
    });

    const { rerender } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });

    expect(signals).toHaveLength(1);
    expect(signals[0].aborted).toBe(false);

    rerender({ name: "charmander" });

    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true); // first signal (pikachu) was aborted
    expect(signals[1].aborted).toBe(false); // second signal (charmander) is still active
  });

  it("aborts the in-flight request on umount", () => {
    let capturedSignal: AbortSignal | undefined;
    fetchPokemon.mockImplementation((_name, options) => {
      capturedSignal = options?.signal;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
