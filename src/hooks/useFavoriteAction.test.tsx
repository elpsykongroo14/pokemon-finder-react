import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { FavoritesProvider } from "../context/FavoritesContext";
import { useFavoriteAction } from "./useFavoriteAction";
import type { FavoriteOutcome } from "../lib/type";
import type { PokemonDetails } from "../lib/type";

function makePokemon(name: string, id: number) {
  return { name, id, sprites: {}, types: [] } as unknown as PokemonDetails;
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
  //the toggle reports what it did, so the page can confirm it in words
  it("reports the very first favorite as an add, and as the first", () => {
    const { result } = renderAction();
    let outcome: FavoriteOutcome | undefined;

    act(() => {
      outcome = result.current.toggle();
    });

    expect(result.current.isFavorite).toBe(true);
    expect(outcome).toEqual({ added: true, first: true });
  });

  it("does not call it 'first' when other favorites already exist", () => {
    seedFavorites(["bulbasaur"]);
    const { result } = renderAction();
    let outcome: FavoriteOutcome | undefined;

    act(() => {
      outcome = result.current.toggle();
    });

    expect(outcome).toEqual({ added: true, first: false });
  });

  it("reports a removal", () => {
    seedFavorites(["pikachu"]);
    const { result } = renderAction();
    let outcome: FavoriteOutcome | undefined;

    act(() => {
      outcome = result.current.toggle();
    });

    expect(result.current.isFavorite).toBe(false);
    expect(outcome).toEqual({ added: false, first: false });
  });

  it("counts adds for the icon pop and the burst, not removals", () => {
    const { result } = renderAction();
    expect(result.current.popKey).toBe(0);

    act(() => void result.current.toggle()); //add
    expect(result.current.popKey).toBe(1);

    act(() => void result.current.toggle()); //remove
    expect(result.current.popKey).toBe(1);

    act(() => void result.current.toggle()); //add again
    expect(result.current.popKey).toBe(2);
  });

  it("does not pop for a Pokémon that was already a favorite on arrival", () => {
    seedFavorites(["pikachu"]);
    const { result } = renderAction();

    expect(result.current.isFavorite).toBe(true);
    expect(result.current.popKey).toBe(0);
  });
});
