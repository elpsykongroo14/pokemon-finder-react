import { describe, it, expect } from "vitest";
import {
  encounterMessage,
  failureMessage,
  multiplierText,
  multiplierSpoken,
} from "./copy";

describe("EncounterMessage", () => {
  it("announces the wild pokemon in capitals, then ask what to do", () => {
    expect(encounterMessage("pikachu")).toBe(
      "A wild PIKACHU appeared!\nWhat will you do?",
    );
  });
});

describe("failureMessage", () => {
  it("names the query and says what to try when nothing was found", () => {
    expect(failureMessage("not-found", "missingno")).toBe(
      'No Pokémon named "missingno" was found. Check the spelling or try its Pokédex number.',
    );
  });

  it("blames the connection, not the user, when Pokedex is unreachable", () => {
    expect(failureMessage("unreachable", "pikachu")).toBe(
      "Couldn't reach the Pokédex. Check your connection and try again.",
    );
  });

  it("does not leak the query into the unreachable message", () => {
    expect(failureMessage("unreachable", "pikachu")).not.toContain("pikachu");
  });
});

describe("multiplierText", () => {
  //the badge inside a type chip is one glyph wide, so halves and quarters
  //use the fraction characters instead of "0.5"
  it.each([
    [4, "×4"],
    [2, "×2"],
    [1, "×1"],
    [0.5, "×½"],
    [0.25, "×¼"],
    [0, "×0"],
  ])("writes %s as %s", (multiplier, text) => {
    expect(multiplierText(multiplier)).toBe(text);
  });
});

describe("multiplierSpoken", () => {
  //what a screen reader hears instead of "times one half"
  it.each([
    [4, "4 times damage"],
    [2, "2 times damage"],
    [1, "normal damage"],
    [0.5, "half damage"],
    [0.25, "quarter damage"],
    [0, "no damage"],
  ])("says %s as %s", (multiplier, words) => {
    expect(multiplierSpoken(multiplier)).toBe(words);
  });
});
