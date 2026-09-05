import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTCGLibrary } from "./useTCGLibrary";
import type { TCGCard } from "../lib/type";

const { fetchTCGCards, fetchTCGCardsBatch, fetchAllpokemonNames } = vi.hoisted(
  () => ({
    fetchTCGCards: vi.fn(),
    fetchTCGCardsBatch: vi.fn(),
    fetchAllpokemonNames: vi.fn(),
  }),
);

vi.mock("../lib/api", () => ({
  fetchTCGCards,
  fetchTCGCardsBatch,
  fetchAllpokemonNames,
}));

function makeCard(id: string, releaseDate: string, rarity: string): TCGCard {
  return { id, name: "Pikachu", rarity, set: { name: "Base", releaseDate } };
}

describe("useTCGLibrary", () => {
  beforeEach(() => {
    fetchTCGCards.mockReset();
    fetchTCGCardsBatch.mockReset();
    fetchAllpokemonNames.mockReset();
  });

  it("loads cards for a named search", async () => {
    const cards = [makeCard("1", "2020-01-01", "Rare")];
    fetchTCGCards.mockResolvedValue(cards);

    const { result } = renderHook(() => useTCGLibrary("pikachu"));

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.title).toBe("pikachu");
    expect(result.current.cards).toEqual(cards);
    expect(fetchTCGCardsBatch).not.toHaveBeenCalled();
  });

  it("shows an empty state when the search returns no cards", async () => {
    fetchTCGCards.mockResolvedValue([]);

    const { result } = renderHook(() => useTCGLibrary("missingno"));

    await waitFor(() => expect(result.current.status).toBe("empty"));

    expect(result.current.cards).toEqual([]);
  });

  it("shows a network specific error for a TypeError", async () => {
    fetchTCGCards.mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useTCGLibrary("pikachu"));

    await waitFor(() => expect(result.current.status).toBe("error"));

    expect(result.current.error).toBe("Network error, check your connection.");
  });

  it("shows a search-specific error for any other failure", async () => {
    fetchTCGCards.mockRejectedValue(new Error("500"));

    const { result } = renderHook(() => useTCGLibrary("pikachu"));

    await waitFor(() => expect(result.current.status).toBe("error"));

    expect(result.current.error).toBe('Failed to load cards for "pikachu".');
  });

  it("builds the featured view from a random batch of pokemon names", async () => {
    const allNames = Array.from({ length: 100 }, (_, i) => `pokemon-${i}`);
    fetchAllpokemonNames.mockResolvedValue(allNames);
    fetchTCGCardsBatch.mockResolvedValue([makeCard("1", "2020-01-01", "Rare")]);

    const { result } = renderHook(() => useTCGLibrary());

    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.title).toBe("Featured Cards");
    expect(fetchAllpokemonNames).toHaveBeenCalled();

    const requestedNames = fetchTCGCardsBatch.mock.calls[0]![0] as string[]; //it reaches into vitest's recorded call history
    //.mock.calls is an array of every call, each entry itself is an array that of that call's arguments
    //so [0]![0] means "the first argument of the first call"
    expect(requestedNames).toHaveLength(25);
    requestedNames.forEach((name) => expect(allNames).toContain(name));
  });

  it("clears the previous search's cards immediately when the name changes", async () => {
    fetchTCGCards.mockResolvedValueOnce([makeCard("1", "2020-01-01", "Rare")]);

    const { result, rerender } = renderHook(
      ({ name }: { name?: string }) => useTCGLibrary(name),
      { initialProps: { name: "pikachu" } },
    );

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.cards).toHaveLength(1);

    fetchTCGCards.mockImplementation(() => new Promise(() => {})); //new search never resolves
    rerender({ name: "charmander" });

    expect(result.current.status).toBe("loading");
    expect(result.current.cards).toEqual([]);
  });

  it("resorts the returned cards when sortMode changes, from memory without refetching", async () => {
    const cards = [
      makeCard("old", "2015-01-01", "Common"),
      makeCard("new", "2023-01-01", "Common"),
    ];
    fetchTCGCards.mockResolvedValue(cards);

    const { result } = renderHook(() => useTCGLibrary("pikachu"));
    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.cards[0]!.id).toBe("new"); //default "newest" first

    act(() => {
      result.current.setSortMode("oldest");
    });

    expect(result.current.cards[0]!.id).toBe("old");
    expect(fetchTCGCards).toHaveBeenCalledTimes(1); //this line proves sorting is genuinely a client-side
  });

  it("abort the in flight request when the search name changes", () => {
    const capturedSignals: AbortSignal[] = [];
    fetchTCGCards.mockImplementation((_name, options) => {
      capturedSignals.push(options.signal);
      return new Promise(() => {});
    });

    const { rerender } = renderHook(
      ({ name }: { name?: string }) => useTCGLibrary(name),
      { initialProps: { name: "pikachu" } },
    );

    expect(capturedSignals[0].aborted).toBe(false);

    rerender({
      name: "charmander",
    });

    expect(capturedSignals[0].aborted).toBe(true);
  });
});
