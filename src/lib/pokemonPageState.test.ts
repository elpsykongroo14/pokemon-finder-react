import { describe, it, expect } from "vitest";
import { getPokemonPageState } from "./pokemonPageState";
import type { PokemonDetails } from "./type";

const pikachu = { name: "pikachu" } as PokemonDetails;
const idle = { name: "pikachu", loading: false, error: null, data: null };

describe("getPokemonPageState", () => {
  it("has no-name when the URL has no pokemon name", () => {
    expect(getPokemonPageState({ ...idle, name: undefined })).toEqual({
      status: "no-name",
    });
    expect(getPokemonPageState({ ...idle, name: "" })).toEqual({
      status: "no-name",
    });
  });

  it("is loading while a fetch is in flight", () => {
    expect(getPokemonPageState({ ...idle, loading: true })).toEqual({
      status: "loading",
    });
  });

  it("carries the messsage when the fetch failed", () => {
    expect(getPokemonPageState({ ...idle, error: "boom" })).toEqual({
      status: "error",
      message: "boom",
    });
  });

  it("carries the pokemon when it is ready", () => {
    expect(getPokemonPageState({ ...idle, data: pikachu })).toEqual({
      status: "ready",
      pokemon: pikachu,
    });
  });

  it("is not-found when the fetch is finished with nothing", () => {
    expect(getPokemonPageState({ ...idle, name: "missingno" })).toEqual({
      status: "not-found",
      name: "missingno",
    });
  });

  it("never shows the previous pokemon while the next one loads", () => {
    expect(
      getPokemonPageState({ ...idle, loading: true, data: pikachu }),
    ).toEqual({ status: "loading" });
  });

  it("shows an error instead of a stale pokemon when a fetch fails", () => {
    expect(
      getPokemonPageState({ ...idle, error: "boom", data: pikachu }),
    ).toEqual({ status: "error", message: "boom" });
  });
});
