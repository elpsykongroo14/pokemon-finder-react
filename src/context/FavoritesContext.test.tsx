import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "../hooks/useFavorites";
import { FavoritesProvider } from "./FavoritesContext";
import type { PokemonDetails } from "../lib/type";

function renderFavorites() {
  return renderHook(() => useFavorites(), {
    wrapper: ({ children }) => (
      <FavoritesProvider>{children}</FavoritesProvider>
    ),
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

describe("FavoritesContext", () => {
  it("starts with no favorites", () => {
    const { result } = renderFavorites();

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite("charizard")).toBe(false);
  });

  it("adds a pokemon to fvorites, computing its sprite", () => {
    const { result } = renderFavorites();

    act(() => {
      result.current.toggleFavorite(makePokemon());
    });

    expect(result.current.isFavorite("charizard")).toBe(true);
    expect(result.current.favorites).toEqual([
      { name: "charizard", id: 6, sprite: "charizard.png" },
    ]);
  });

  it("toggling an already favorited pokemon removes it", () => {
    const { result } = renderFavorites();

    act(() => {
      result.current.toggleFavorite(makePokemon());
    });
    expect(result.current.isFavorite("charizard")).toBe(true);

    act(() => {
      result.current.toggleFavorite(makePokemon());
    });
    expect(result.current.isFavorite("charizard")).toBe(false);
    expect(result.current.favorites).toEqual([]);
  });

  it("presists favorites to localStorage", () => {
    const { result } = renderFavorites();

    act(() => {
      result.current.toggleFavorite(makePokemon());
    });

    const stored = JSON.parse(
      localStorage.getItem("pokemon_favorites") ?? "[]",
    );
    expect(stored).toEqual([
      { name: "charizard", id: 6, sprite: "charizard.png" },
    ]);
  });

  it("removeFavorite is a no op when the pokemon isnt currently a favorite", () => {
    const { result } = renderFavorites();

    act(() => {
      result.current.removeFavorite("nonexistant");
    });

    expect(result.current.favorites).toEqual([]);
  });
});

//this file closes the real gap in favorites coverage
//the add path, the toggle round trip, and the localStorage wiring
//none of which any existing test exercised, since FavoriteList only ever drove removeFavorite and FavoriteButton mocked the hook entirely
