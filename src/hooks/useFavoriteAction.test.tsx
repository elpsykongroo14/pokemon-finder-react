import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { FavoritesProvider } from "../context/FavoritesContext";
import { useFavoriteAction } from "./useFavoriteAction";
import { FIRST_FAVORITE } from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

function makePokemon(name: string, id: number) {
  return { name, id, sprites: {} } as PokemonDetails;
}

const pikachu = makePokemon("pikachu", 25);

function renderAction(pokemon = pikachu) {
  return renderHook(() => useFavoriteAction(pokemon), {
    wrapper: ({ children }) => (
      <FavoritesProvider>{children}</FavoritesProvider>
    ),
  });
}

function seedFavorites(names: string[]) {
  localStorage.setItem(
    "pokemon_favorites",
    JSON.stringify(names.map((name, i) => ({ name, id: i + 1, sprite: null }))),
  );
}

beforeEach(() => localStorage.clear());

describe("useFavoriteAction", () => {
  it("celebrates and announces the very first favorite", () => {
    const { result } = renderAction();

    act(() => result.current.toggle());

    expect(result.current.isFavorite).toBe(true);
    expect(result.current.celebratingFirst).toBe(true);
    expect(result.current.announcement).toBe(FIRST_FAVORITE);
  });

  it("does not call it 'first' when other favorites already exist", () => {
    seedFavorites(["bulbasaur"]);
    const { result } = renderAction();

    act(() => result.current.toggle());

    expect(result.current.isFavorite).toBe(true);
    expect(result.current.celebratingFirst).toBe(false);
    expect(result.current.announcement).toBe("");
  });

  it("stops celebrating once that favorite is removed again", () => {
    const { result } = renderAction();

    act(() => result.current.toggle());
    act(() => result.current.toggle());

    expect(result.current.celebratingFirst).toBe(false);
  });

  it("counts adds for the icon pop, not removals", () => {
    const { result } = renderAction();
    expect(result.current.popKey).toBe(0);

    act(() => result.current.toggle()); //add
    expect(result.current.popKey).toBe(1);

    act(() => result.current.toggle()); //remove
    expect(result.current.popKey).toBe(1);

    act(() => result.current.toggle()); //add again
    expect(result.current.popKey).toBe(2);
  });

  it("does not pop for a Pokémon that was already a favorite on arrival", () => {
    seedFavorites(["pikachu"]);
    const { result } = renderAction();

    expect(result.current.isFavorite).toBe(true);
    expect(result.current.popKey).toBe(0);
  });
});
