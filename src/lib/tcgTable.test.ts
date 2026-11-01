import { describe, it, expect } from "vitest";
import {
  getAriaSort,
  nextTableSort,
  sortTableRows,
  type TableSort,
} from "./tcgTable";
import type { TCGCard } from "./type";

function makeCard(overrides: Partial<TCGCard> = {}): TCGCard {
  return { id: "1", name: "Card", ...overrides };
}

function ids(cards: TCGCard[]): string[] {
  return cards.map((card) => card.id);
}

describe("nextTableSort", () => {
  it("starts a column ascending when nothing is sorted", () => {
    expect(nextTableSort(null, "name")).toEqual({
      column: "name",
      direction: "asc",
    });
  });

  it("flips the same column to descending, then back to no sorting", () => {
    const asc: TableSort = { column: "name", direction: "asc" };
    const desc = nextTableSort(asc, "name");
    expect(desc).toEqual({ column: "name", direction: "desc" });
    expect(nextTableSort(desc, "name")).toBeNull();
  });

  it("switching to another column always restarts at ascending", () => {
    const desc: TableSort = { column: "name", direction: "desc" };
    expect(nextTableSort(desc, "rarity")).toEqual({
      column: "rarity",
      direction: "asc",
    });
  });
});

describe("getAriaSort", () => {
  it("is 'none' for every column when nothing is sorted", () => {
    expect(getAriaSort(null, "name")).toBe("none");
  });

  it("names the direction on the sorted column only", () => {
    const sort: TableSort = { column: "set", direction: "desc" };
    expect(getAriaSort(sort, "set")).toBe("descending");
    expect(getAriaSort(sort, "name")).toBe("none");
    expect(getAriaSort({ column: "set", direction: "asc" }, "set")).toBe(
      "ascending",
    );
  });
});

describe("sortTableRows", () => {
  const cards = [
    makeCard({
      id: "b",
      name: "Blastoise",
      set: { name: "Base Set", releaseDate: "1999/01/09" },
      rarity: "Rare",
    }),
    makeCard({
      id: "a",
      name: "abra",
      set: { name: "Jungle", releaseDate: "1999/06/16" },
      rarity: "Common",
    }),
    makeCard({
      id: "c",
      name: "Charizard",
      set: { name: "Aquapolis", releaseDate: "2003/01/15" },
      rarity: "Rare Holo",
    }),
  ];

  it("sorts by name ascending and descending, ignoring letter case", () => {
    expect(
      ids(sortTableRows(cards, { column: "name", direction: "asc" })),
    ).toEqual(["a", "b", "c"]);
    expect(
      ids(sortTableRows(cards, { column: "name", direction: "desc" })),
    ).toEqual(["c", "b", "a"]);
  });

  it("sorts by set name", () => {
    expect(
      ids(sortTableRows(cards, { column: "set", direction: "asc" })),
    ).toEqual(["c", "b", "a"]);
  });

  it("sorts by release date", () => {
    expect(
      ids(sortTableRows(cards, { column: "released", direction: "desc" })),
    ).toEqual(["c", "a", "b"]);
  });

  it("sorts rarity by rank, not alphabetically", () => {
    const rarities = [
      makeCard({ id: "rare", rarity: "Rare" }),
      makeCard({ id: "uncommon", rarity: "Uncommon" }),
      makeCard({ id: "common", rarity: "Common" }),
    ];
    //alphabetical would give common, rare, uncommon
    expect(
      ids(sortTableRows(rarities, { column: "rarity", direction: "asc" })),
    ).toEqual(["common", "uncommon", "rare"]);
  });

  it("puts cards with a missing value last, in both directions", () => {
    const withGap = [
      makeCard({ id: "none" }),
      makeCard({ id: "x", set: { name: "X Set" } }),
      makeCard({ id: "y", set: { name: "Y Set" } }),
    ];
    expect(
      ids(sortTableRows(withGap, { column: "set", direction: "asc" })),
    ).toEqual(["x", "y", "none"]);
    expect(
      ids(sortTableRows(withGap, { column: "set", direction: "desc" })),
    ).toEqual(["y", "x", "none"]);
  });

  it("keeps rows that tie in their incoming order", () => {
    const ties = [
      makeCard({ id: "first", rarity: "Rare" }),
      makeCard({ id: "second", rarity: "Rare" }),
      makeCard({ id: "third", rarity: "Rare" }),
    ];
    expect(
      ids(sortTableRows(ties, { column: "rarity", direction: "asc" })),
    ).toEqual(["first", "second", "third"]);
    expect(
      ids(sortTableRows(ties, { column: "rarity", direction: "desc" })),
    ).toEqual(["first", "second", "third"]);
  });

  it("with no sort returns the same order, as a new array", () => {
    const result = sortTableRows(cards, null);
    expect(ids(result)).toEqual(["b", "a", "c"]);
    expect(result).not.toBe(cards);
  });

  it("does not mutate the cards it was given", () => {
    const before = ids(cards);
    sortTableRows(cards, { column: "name", direction: "asc" });
    expect(ids(cards)).toEqual(before);
  });
});
