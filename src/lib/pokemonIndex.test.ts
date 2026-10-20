import { describe, it, expect } from "vitest";
import { parseDexId, toIndexEntry } from "./pokemonIndex";

describe("parseDexId", () => {
  it("reads the number from a pokeapi url with a trailing slash", () => {
    expect(parseDexId("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
  });

  it("reads the number when there is no trailing slash", () => {
    expect(parseDexId("https://pokeapi.co/api/v2/pokemon/1025")).toBe(1025);
  });

  it.each([
    "",
    "...",
    "https://pokeapi.co/api/v2/pokemon/abc/",
    "https://pokeapi.co/api/v2/pokemon-species/25/",
    "https://pokeapi.co/api/v2/pokemon/25/extra",
  ])("returns null when the url has no pokemon number (%j)", (url) => {
    expect(parseDexId(url)).toBeNull();
  });
});

describe("toIndexEntry", () => {
  it("pairs the name with the number from its url", () => {
    expect(
      toIndexEntry({
        name: "pikachu",
        url: "https://pokeapi.co/api/v2/pokemon/25/",
      }),
    ).toEqual({ name: "pikachu", id: 25 });
  });
});
