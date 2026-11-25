import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAutocomplete } from "./useAutocomplete";
import type { PokemonDetails } from "../lib/type";

const { fetchPokemonIndex, fetchPokemon } = vi.hoisted(() => ({
  fetchPokemonIndex: vi.fn(),
  fetchPokemon: vi.fn(),
}));

vi.mock("../lib/api", () => ({ fetchPokemonIndex, fetchPokemon }));

const INDEX = [
  { name: "charmander", id: 4 },
  { name: "charizard", id: 6 },
  { name: "charmeleon", id: 5 },
  { name: "pikachu", id: 25 },
];

function makePokemon(name: string): PokemonDetails {
  return {
    name,
    id: 1,
    height: 4,
    weight: 60,
    types: [],
    sprites: { front_default: "", front_shiny: "" },
    abilities: [],
    stats: [],
    species: { name, url: "" },
  };
}

describe("useAutocomplete", () => {
  beforeEach(() => {
    fetchPokemonIndex.mockReset();
    fetchPokemon.mockReset();
    fetchPokemonIndex.mockResolvedValue(INDEX);
    fetchPokemon.mockResolvedValue(makePokemon("charmander"));
  });

  it("returns filtered matches after the debounce delay", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: "" } },
    );

    rerender({ query: "char" });

    await waitFor(() =>
      expect(result.current.matches).toEqual([
        { name: "charmander", id: 4 },
        { name: "charizard", id: 6 },
        { name: "charmeleon", id: 5 },
      ]),
    );
  });

  //B&W-8 follow-up (reported): the matches are worked out from the query
  //as it was 250 ms ago. until they catch up they belong to the OLD text,
  //and the hook says so, so Enter does not pick an old suggestion
  it("says when its matches still belong to older text", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: "" } },
    );

    rerender({ query: "char" });
    await waitFor(() => expect(result.current.matches).toHaveLength(3));
    expect(result.current.settled).toBe(true);

    rerender({ query: "pika" });
    expect(result.current.settled).toBe(false);
    expect(result.current.matches[0]?.name).toBe("charmander");

    await waitFor(() => expect(result.current.settled).toBe(true));
    expect(result.current.matches).toEqual([{ name: "pikachu", id: 25 }]);
  });

  it("finds a Pokemon by its pokedex number", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: "" } },
    );

    rerender({ query: "#025" });

    await waitFor(() =>
      expect(result.current.matches).toEqual([{ name: "pikachu", id: 25 }]),
    );
  });

  it("highlights the first match whenever the match list changes", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: "" } },
    );

    rerender({ query: "char" });

    await waitFor(() =>
      expect(result.current.matches.length).toBeGreaterThan(0),
    );

    expect(result.current.highlightedIndex).toBe(0);
  });

  it("keeps a manually set highlighted index across an unrelated re render", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: "char" } },
    );

    await waitFor(() =>
      expect(result.current.matches.length).toBeGreaterThan(0),
    );

    act(() => {
      result.current.setHighlightedIndex(2);
    });

    expect(result.current.highlightedIndex).toBe(2);

    //same query, same matches this should not reset the highight back to 0
    rerender({ query: "char" });

    expect(result.current.highlightedIndex).toBe(2);
  });

  //D51: rows show a sprite built from the dex number, so the hook no longer
  //fetches the full details of whatever is highlighted (one request per
  //arrow key press, for a thumbnail nobody needed any more)
  it("does not fetch details for the highlighted match", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: "" } },
    );

    rerender({ query: "char" });
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => result.current.setHighlightedIndex(1));

    expect(fetchPokemon).not.toHaveBeenCalled();
  });

  it("hides the dropdown on dismiss, and reopens it on the next keystroke", async () => {
    const { result, rerender } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: "char" } },
    );

    await waitFor(() => expect(result.current.isOpen).toBe(true));

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.isOpen).toBe(false);

    //the hook no longer infers "the user typed" from a query prop diff
    //that diffing was the actual bug we fixed. the real <input onChange> calls notifyQueryEdited() alongside setQuery
    //so the test has to do the same to simulate a genuine keystroke instead of a programmatic query change
    //(which is what selectMatch does, and should not reopen the dropdown)
    act(() => {
      result.current.notifyQueryEdited();
    });
    rerender({ query: "chara" });

    await waitFor(() => expect(result.current.isOpen).toBe(true));
  });
});
