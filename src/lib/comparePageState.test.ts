import { describe, it, expect } from "vitest";
import { getComparePageState } from "./comparePageState";
import type { PokemonDetails } from "./type";

const pikachu = { name: "pikachu", id: 25 } as PokemonDetails;
const charmander = { name: "charmander", id: 4 } as PokemonDetails;

const idle = { loading: false, error: null, data: null };
const loaded = (data: PokemonDetails) => ({ ...idle, data });

describe("getComparePageState", () => {
  it("has no-first when the URL names no first pokemon", () => {
    expect(
      getComparePageState({ a: "", b: "", first: idle, second: idle }),
    ).toEqual({ status: "no-first" });
  });

  it("is first-loading while the first lookup is in flight, evene if stale sata is held", () => {
    const first = { ...loaded(pikachu), loading: true };

    expect(
      getComparePageState({ a: "pikachu", b: "", first, second: idle }),
    ).toEqual({ status: "first-loading" });
  });

  it("carries the kind and name when the first lookup failed", () => {
    const first = { ...idle, error: "unreachable" as const };

    expect(
      getComparePageState({ a: "pikachu", b: "", first, second: idle }),
    ).toEqual({ status: "first-failed", kind: "unreachable", name: "pikachu" });
  });

  it("treats a finished first lookup with nothing to show as not found", () => {
    expect(
      getComparePageState({ a: "missingno", b: "", first: idle, second: idle }),
    ).toEqual({ status: "first-failed", kind: "not-found", name: "missingno" });
  });

  it("asks for a second pokemon once the first is ready an there is no b", () => {
    expect(
      getComparePageState({
        a: "pikachu",
        b: "",
        first: loaded(pikachu),
        second: idle,
      }),
    ).toEqual({ status: "pick-second", first: pikachu });
  });

  it("is second-loading while the second lookup is in flight", () => {
    const second = { ...idle, loading: true };

    expect(
      getComparePageState({
        a: "pikachu",
        b: "charmander",
        first: loaded(pikachu),
        second,
      }),
    ).toEqual({ status: "second-loading" });
  });

  it("carries the kind and name when the second lookup failed", () => {
    const second = { ...idle, error: "not-found" as const };

    expect(
      getComparePageState({
        a: "pikachu",
        b: "nope",
        first: loaded(pikachu),
        second,
      }),
    ).toEqual({ status: "second-failed", kind: "not-found", name: "nope" });
  });

  it("rejects comparing a pokemon with itself", () => {
    expect(
      getComparePageState({
        a: "pikachu",
        b: "pikachu",
        first: loaded(pikachu),
        second: loaded(pikachu),
      }),
    ).toEqual({ status: "same-pokemon" });
  });

  it("is ready when two different pokemon have loaded", () => {
    expect(
      getComparePageState({
        a: "pikachu",
        b: "charmander",
        first: loaded(pikachu),
        second: loaded(charmander),
      }),
    ).toEqual({ status: "ready", primary: pikachu, secondary: charmander });
  });

  it("reports the first problem before looking at the second lookup", () => {
    const first = { ...idle, loading: true };
    const second = { ...idle, error: "unreachable" as const };

    expect(
      getComparePageState({ a: "pikachu", b: "x", first, second }),
    ).toEqual({ status: "first-loading" });
  });

  //B&W-5: a pick in the identity band or a Swap reloads one or both sides.
  //the comparison already on screen stays there, marked pending, until the
  //new one is ready: the field, the pickers and keyboard focus survive
  describe("while a comparison on screen is being replaced", () => {
    const shown = { primary: pikachu, secondary: charmander };
    const reloading = { ...idle, loading: true };

    it("keeps showing it, marked pending, while one side reloads", () => {
      expect(
        getComparePageState({
          a: "pikachu",
          b: "squirtle",
          first: loaded(pikachu),
          second: reloading,
          shown,
        }),
      ).toEqual({
        status: "ready",
        primary: pikachu,
        secondary: charmander,
        pending: true,
      });
    });

    it("keeps showing it while both sides reload (a swap)", () => {
      expect(
        getComparePageState({
          a: "charmander",
          b: "pikachu",
          first: reloading,
          second: reloading,
          shown,
        }),
      ).toMatchObject({ status: "ready", pending: true });
    });

    it("lets a failure replace it", () => {
      expect(
        getComparePageState({
          a: "pikachu",
          b: "nope",
          first: loaded(pikachu),
          second: { ...idle, error: "not-found" as const },
          shown,
        }),
      ).toEqual({ status: "second-failed", kind: "not-found", name: "nope" });
    });

    it("does not hold it when there is no second Pokémon to wait for", () => {
      expect(
        getComparePageState({
          a: "pikachu",
          b: "",
          first: reloading,
          second: idle,
          shown,
        }),
      ).toEqual({ status: "first-loading" });
    });

    it("shows the new comparison, not pending, once both sides have loaded", () => {
      const squirtle = { name: "squirtle", id: 7 } as PokemonDetails;

      expect(
        getComparePageState({
          a: "pikachu",
          b: "squirtle",
          first: loaded(pikachu),
          second: loaded(squirtle),
          shown,
        }),
      ).toEqual({ status: "ready", primary: pikachu, secondary: squirtle });
    });
  });
});
