import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useComparePageState } from "./useComparePageState";
import type { PokemonDetails } from "../lib/type";

const pikachu = { name: "pikachu", id: 25 } as PokemonDetails;
const charmander = { name: "charmander", id: 4 } as PokemonDetails;
const bulbasaur = { name: "bulbasaur", id: 1 } as PokemonDetails;
const squirtle = { name: "squirtle", id: 7 } as PokemonDetails;

const idle = { loading: false, error: null, data: null };
const loaded = (data: PokemonDetails) => ({ ...idle, data });
//usePokemon keeps the last pokemon in data while the next one loads
const reloading = (held: PokemonDetails) => ({
  ...loaded(held),
  loading: true,
});

type Inputs = Parameters<typeof useComparePageState>[0];

function renderState(initial: Inputs) {
  return renderHook((inputs: Inputs) => useComparePageState(inputs), {
    initialProps: initial,
  });
}

describe("useComparePageState", () => {
  it("is ready once both Pokémon have loaded", () => {
    const { result } = renderState({
      a: "pikachu",
      b: "charmander",
      first: loaded(pikachu),
      second: loaded(charmander),
    });

    expect(result.current).toEqual({
      status: "ready",
      primary: pikachu,
      secondary: charmander,
    });
  });

  it("keeps the comparison on screen, pending, while a new second Pokémon loads", () => {
    const view = renderState({
      a: "pikachu",
      b: "charmander",
      first: loaded(pikachu),
      second: loaded(charmander),
    });

    view.rerender({
      a: "pikachu",
      b: "squirtle",
      first: loaded(pikachu),
      second: reloading(charmander),
    });

    expect(view.result.current).toEqual({
      status: "ready",
      primary: pikachu,
      secondary: charmander,
      pending: true,
    });
  });

  //the case a pure "what does usePokemon hold right now" rule gets wrong: in
  //a swap the two lookups finish one after the other, and for a moment both
  //hold the same Pokémon. the hook remembers what it SHOWED, so the screen
  //never drops to a loading message in between
  it("holds the shown comparison through a swap, even when one side finishes first", () => {
    const view = renderState({
      a: "pikachu",
      b: "charmander",
      first: loaded(pikachu),
      second: loaded(charmander),
    });

    view.rerender({
      a: "charmander",
      b: "pikachu",
      first: loaded(charmander), //finished first
      second: reloading(charmander), //still holds the old right side
    });

    expect(view.result.current).toEqual({
      status: "ready",
      primary: pikachu,
      secondary: charmander,
      pending: true,
    });

    view.rerender({
      a: "charmander",
      b: "pikachu",
      first: loaded(charmander),
      second: loaded(pikachu),
    });

    expect(view.result.current).toEqual({
      status: "ready",
      primary: charmander,
      secondary: pikachu,
    });
  });

  it("forgets an old comparison once something else was on screen", () => {
    const view = renderState({
      a: "pikachu",
      b: "charmander",
      first: loaded(pikachu),
      second: loaded(charmander),
    });

    //a new first Pokémon and no second: "pick a second" is on screen
    view.rerender({
      a: "bulbasaur",
      b: "",
      first: loaded(bulbasaur),
      second: idle,
    });
    expect(view.result.current.status).toBe("pick-second");

    //while the new second one loads, the old pikachu/charmander pair must
    //not come back
    view.rerender({
      a: "bulbasaur",
      b: "squirtle",
      first: loaded(bulbasaur),
      second: { ...idle, loading: true },
    });
    expect(view.result.current).toEqual({ status: "second-loading" });

    view.rerender({
      a: "bulbasaur",
      b: "squirtle",
      first: loaded(bulbasaur),
      second: loaded(squirtle),
    });
    expect(view.result.current).toEqual({
      status: "ready",
      primary: bulbasaur,
      secondary: squirtle,
    });
  });
});
