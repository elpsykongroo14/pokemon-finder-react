import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTeam } from "../hooks/useTeam";
import { TeamProvider } from "./TeamContext";
import type { PokemonDetails } from "../lib/type";

function renderTeam() {
  return renderHook(() => useTeam(), {
    wrapper: ({ children }) => <TeamProvider>{children}</TeamProvider>,
  });
}

function makePokemon(overrides: Partial<PokemonDetails> = {}): PokemonDetails {
  return {
    name: "charizard",
    id: 6,
    height: 17,
    weight: 905,
    types: [],
    sprites: { front_default: "charizard.png" },
    abilities: [],
    stats: [],
    species: { name: "charizard", url: "" },
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("TeamProvider", () => {
  it("loads a previously saved team from localStorage on mount", () => {
    localStorage.setItem(
      "pokemon_team",
      JSON.stringify([{ name: "pikachu", id: 25, sprite: "pikachu.png" }]),
    );

    const { result } = renderTeam();

    expect(result.current.team).toEqual([
      { name: "pikachu", id: 25, sprite: "pikachu.png" },
    ]);
  });

  it("starts with an empty team when localStorage holds corrupted data", () => {
    localStorage.setItem("pokemon_team", "{not valid json");

    const { result } = renderTeam();

    expect(result.current.team).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("persists a team change to localStorage", () => {
    const { result } = renderTeam();

    act(() => {
      result.current.addToTeam(makePokemon());
    });

    const stored = JSON.parse(localStorage.getItem("pokemon_team") ?? "[]");
    expect(stored).toEqual([
      { name: "charizard", id: 6, sprite: "charizard.png" },
    ]);
  });

  it("keeps the team in memory even if localStorage.setItem throws", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });

    const { result } = renderTeam();

    act(() => {
      result.current.addToTeam(makePokemon());
    });

    expect(result.current.team).toEqual([
      { name: "charizard", id: 6, sprite: "charizard.png" },
    ]);

    setItemSpy.mockRestore();
  });

  it("reports wether a pokemon is currently on the team", () => {
    const { result } = renderTeam();

    expect(result.current.isOnTeam("charizard")).toBe(false);

    act(() => {
      result.current.addToTeam(makePokemon());
    });

    expect(result.current.isOnTeam("charizard")).toBe(true);
  });

  it("wires addToTeam and removeFromTeam through visible state", () => {
    const { result } = renderTeam();

    act(() => {
      result.current.addToTeam(makePokemon());
    });

    expect(result.current.team).toHaveLength(1);

    act(() => {
      result.current.removeFromTeam("charizard");
    });

    expect(result.current.team).toHaveLength(0);
  });
});

//this file protects exactly the logic that belongs to it, localStorage loading (including the corrupted data fallback)
//the persistence effect (including its own failure path), and isOnTeam
//while deliberately leaving every reducer invariant (dedupe, max team, error clearing) to that file that already owns them  in full
