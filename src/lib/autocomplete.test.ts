import { describe, it, expect } from "vitest";
import { filterNames } from "./autocomplete";

const names = ["charmander", "charizard", "scyther", "wartrotle"];

describe("filterNames", () => {
  it("returns names with the query before names merely containing it", () => {
    const result = filterNames("char", names);

    expect(result).toEqual(["charmander", "charizard"]);
  });

  it("finds substring matches even when the query isnt a prefix", () => {
    const result = filterNames("izard", names);

    expect(result).toEqual(["charizard"]);
  });

  it("is case insensitive", () => {
    expect(filterNames("CHAR", names)).toEqual(["charmander", "charizard"]);
  });

  it("trims surrounding whitespace from the query", () => {
    expect(filterNames("  char", names)).toEqual(["charmander", "charizard"]);
  });

  it("returns an empty array for an empty or whitespace only query", () => {
    expect(filterNames("", names)).toEqual([]);
    expect(filterNames("   ", names)).toEqual([]);
  });

  it("caps results at 8, prioritizing prefix matches over substring matches", () => {
    const manyNames = [
      "aardvark1",
      "aardvark2",
      "aardvark3",
      "aardvark4",
      "aardvark5",
      "aardvark6",
      "aardvark7",
      "aardvark8",
      "aardvark9",
      "xaardvarkx",
    ];

    const result = filterNames("aardvark", manyNames);

    expect(result).toHaveLength(8);
    expect(result).not.toContain("xaardvarkx");
  });
});
