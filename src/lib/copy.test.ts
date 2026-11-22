import { describe, it, expect } from "vitest";
import {
  encounterMessage,
  failureMessage,
  multiplierText,
  multiplierSpoken,
  partyCountText,
  favoriteNote,
  teamNote,
  FIRST_FAVORITE,
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

describe("partyCountText", () => {
  //read right after the visible word "Party", so the link is named
  //"Party, 4 of 6": the name starts with what the eye sees (D45, WCAG 2.5.3)
  it("counts the party out of the maximum", () => {
    expect(partyCountText(4, 6)).toBe(", 4 of 6");
    expect(partyCountText(0, 6)).toBe(", 0 of 6");
  });
});

//the inline confirmation under the Pokémon page actions (spec 6.2): one
//sentence about what the last click did
describe("favoriteNote", () => {
  it("confirms a save", () => {
    expect(favoriteNote({ added: true, first: false })).toBe(
      "Saved to your favorites.",
    );
  });

  it("confirms a removal", () => {
    expect(favoriteNote({ added: false, first: false })).toBe(
      "Removed from favorites.",
    );
  });

  it("celebrates the very first favorite instead", () => {
    expect(favoriteNote({ added: true, first: true })).toBe(FIRST_FAVORITE);
  });
});

describe("teamNote", () => {
  it("says who joined and how full the party is now", () => {
    expect(teamNote("hydreigon", { kind: "joined", size: 5 })).toBe(
      "Hydreigon joined your party. 5 of 6 slots filled.",
    );
  });

  it("says who left", () => {
    expect(teamNote("hydreigon", { kind: "left", size: 4 })).toBe(
      "Hydreigon left your party. 4 of 6 slots filled.",
    );
  });

  //a full party refuses the add; the party-full hint already explains it,
  //so the confirmation line has nothing to confirm
  it("has nothing to say when the add was refused", () => {
    expect(teamNote("hydreigon", { kind: "rejected", size: 6 })).toBeNull();
  });

  it("writes slugged names as words", () => {
    expect(teamNote("mr-mime", { kind: "joined", size: 1 })).toBe(
      "Mr Mime joined your party. 1 of 6 slots filled.",
    );
  });
});
