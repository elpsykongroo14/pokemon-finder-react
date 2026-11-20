import { describe, it, expect } from "vitest";
import { filterEntries } from "./autocomplete";
import type { PokemonIndexEntry } from "./pokemonIndex";

//a tiny index: the numbers are the real ones, the list is just short
const entries: PokemonIndexEntry[] = [
  { name: "charmander", id: 4 },
  { name: "charizard", id: 6 },
  { name: "scyther", id: 123 },
  { name: "wartortle", id: 8 },
];

const names = (list: PokemonIndexEntry[]) => list.map((e) => e.name);

describe("filterEntries by name", () => {
  it("returns names with the query before names merely containing it", () => {
    expect(names(filterEntries("char", entries))).toEqual([
      "charmander",
      "charizard",
    ]);
  });

  it("finds substring matches even when the query isnt a prefix", () => {
    expect(names(filterEntries("izard", entries))).toEqual(["charizard"]);
  });

  it("is case insensitive", () => {
    expect(names(filterEntries("CHAR", entries))).toEqual([
      "charmander",
      "charizard",
    ]);
  });

  it("trims surrounding whitespace from the query", () => {
    expect(names(filterEntries(" char", entries))).toEqual([
      "charmander",
      "charizard",
    ]);
  });

  it("returns an empty array for an empty or whitespace only query", () => {
    expect(filterEntries("", entries)).toEqual([]);
    expect(filterEntries("   ", entries)).toEqual([]);
  });

  it("returns whole entries, so the caller still has each number", () => {
    expect(filterEntries("scyth", entries)).toEqual([
      { name: "scyther", id: 123 },
    ]);
  });

  it("caps results at 8, prioritizing prefix matches over substring matches", () => {
    const many: PokemonIndexEntry[] = [
      ...Array.from({ length: 9 }, (_, i) => ({
        name: `aardvark${i + 1}`,
        id: i + 1,
      })),
      { name: "xaardvarkx", id: 10 },
    ];

    const result = filterEntries("aardvark", many);

    expect(result).toHaveLength(8);
    expect(names(result)).not.toContain("xaardvarkx");
  });
});

describe("filterEntries by number", () => {
  //ids 1..30 plus 250..252, in a number order like the real list
  const numbered: PokemonIndexEntry[] = [
    ...Array.from({ length: 30 }, (_, i) => ({
      name: `mon${i + 1}`,
      id: i + 1,
    })),
    { name: "mon250", id: 250 },
    { name: "mon251", id: 251 },
    { name: "mon252", id: 252 },
  ];
  const ids = (list: PokemonIndexEntry[]) => list.map((e) => e.id);

  it("puts the exact number first, then longer numbers that start with it", () => {
    expect(ids(filterEntries("25", numbered))).toEqual([25, 250, 251, 252]);
  });

  it("puts the exact number first then longer numbers that start with it", () => {
    expect(ids(filterEntries("#025", numbered))).toEqual([25, 250, 251, 252]);
    expect(ids(filterEntries("025", numbered))).toEqual([25, 250, 251, 252]);
  });

  it("accepts a leading # and leading zeros, like the dex number is written", () => {
    expect(filterEntries("2", numbered)).toHaveLength(8);
  });

  it("finds nothing for a number that no pokemon has", () => {
    expect(filterEntries("#999", numbered)).toEqual([]);
    expect(filterEntries("0", numbered)).toEqual([]);
  });

  it("skips entries whose number could not be read", () => {
    const withGap: PokemonIndexEntry[] = [
      { name: "mystery", id: null },
      { name: "mon1", id: 1 },
    ];

    expect(names(filterEntries("1", withGap))).toEqual(["mon1"]);
  });
});
