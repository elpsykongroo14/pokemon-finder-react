import { describe, it, expect } from "vitest";
import { failureMessage } from "./copy";

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
