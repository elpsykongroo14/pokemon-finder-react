import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { usePokemon } from "./usePokemon";
import type { PokemonDetails } from "../lib/type";
import { useEffect } from "react";
import { HttpError } from "../lib/httpError";

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

  it("reports 'not-found' when the server answers 404", async () => {
    fetchPokemon.mockRejectedValue(new HttpError(404, "https://x.test/a"));

    const { result } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "missingno" },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("not-found");
    expect(result.current.data).toBeNull();
  });

  it("reports 'unreachable' when the network itself fails", async () => {
    fetchPokemon.mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("unreachable");
  });

  it("does not treat an aborted request as an error", async () => {
    fetchPokemon.mockRejectedValue(new DOMException("Aborte", "AbortError"));

    const { result } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });

    //nothing will ever flip loading here, so there is nothing to waitFor on.
    //we let the rejected promise settle instead, then look at the result
    await act(async () => {});

    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
    //an abort means "a newer request replaced me", so the hook keeps
    //waiting for that newer one instead of declaring itself finished
    expect(result.current.loading).toBe(true);
  });

  it("is already loading on the very first painted render of a lookup", () => {
    fetchPokemon.mockImplementation(() => new Promise(() => {}));
    const painted: boolean[] = [];

    renderHook(() => {
      const result = usePokemon("missingno");
      //an effect runs only for renders React COMMITS (puts on screen).
      //a render that React throws away and redoes never reache it
      useEffect(() => {
        painted.push(result.loading);
      });
      return result;
    });

    //if loading were stored state this would be [false, true]: one painted
    //frame of "nothing found" before the effect started the request
    expect(painted).not.toContain(false);
  });

  it("is loading, never the old answer, in the first painted render after the name changes", async () => {
    fetchPokemon.mockResolvedValueOnce(mockPokemon);
    fetchPokemon.mockImplementation(() => new Promise(() => {}));
    const painted: boolean[] = [];

    const { result, rerender } = renderHook(
      ({ name }) => {
        const r = usePokemon(name);
        useEffect(() => {
          painted.push(r.loading);
        });
        return r;
      },
      { initialProps: { name: "pikachu" } },
    );
    await waitFor(() => expect(result.current.data).toEqual(mockPokemon));

    painted.length = 0; //forget everything before the name change
    rerender({ name: "charmander" });

    expect(painted).not.toContain(false);
  });

  it("keeps the previous pokemon in data while the next one loads", async () => {
    fetchPokemon.mockResolvedValueOnce(mockPokemon);
    fetchPokemon.mockImplementation(() => new Promise(() => {}));

    const { result, rerender } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });
    await waitFor(() => expect(result.current.data).toEqual(mockPokemon));

    rerender({ name: "charmander" });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual(mockPokemon);
  });

  it("shows loading, not the old error, when you come back to a name that failed", async () => {
    fetchPokemon.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    fetchPokemon.mockImplementation(() => new Promise(() => {}));

    const { result, rerender } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });
    await waitFor(() => expect(result.current.error).toBe("unreachable"));

    rerender({ name: "" });
    rerender({ name: "pikachu" });

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it("ignores a stale aborted request finishing after a newer one started", async () => {
    //each fake request rejects with AbortError the moment ITS signal aborts,
    //exactly like a real fetch
    fetchPokemon.mockImplementation(
      (_name: string, options?: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );

    const { result, rerender } = renderHook(({ name }) => usePokemon(name), {
      initialProps: { name: "pikachu" },
    });
    rerender({ name: "charmander" });
    await act(async () => {}); //let the stale pikachu rejection land

    expect(result.current.loading).toBe(true); //charmander is still in flight
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
