import { describe, it, expect, vi } from "vitest";
import { shuffleArray, sortTCGCards, getCardMetaRows } from "./tcg";
import type { TCGCard } from "./type";

function makeCard(overrides: Partial<TCGCard> = {}): TCGCard {
  return { id: "1", name: "Card", ...overrides };
}
describe("shuffleArray", () => {
  it("returns an array with the same elements, just reordered", () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);

    expect(result).toHaveLength(original.length);
    expect([...result].sort()).toEqual([...original].sort());
  });

  it("does not mutate the original array", () => {
    const original = [1, 2, 3];
    shuffleArray(original);

    expect(original).toEqual([1, 2, 3]);
  });

  it("actually reorders elements, given a controlled (mocked) random source", () => {
    //Math.random mocked to always return 0 forces every swap to pick index 0
    //which produces a specific, predictable reversale we can assert on exactly
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    const result = shuffleArray([1, 2, 3, 4]);

    expect(result).toEqual([2, 3, 4, 1]);
    randomSpy.mockRestore();
  });
});

describe("sortTCGCards", () => {
  const cards = [
    makeCard({ id: "a", set: { releaseDate: "1999/01/09" }, rarity: "Common" }),
    makeCard({
      id: "b",
      set: { releaseDate: "2023/03/31" },
      rarity: "Secret Rare",
    }),
    makeCard({ id: "c", set: { releaseDate: "2010/07/21" }, rarity: "Rare" }),
  ];

  it("sorts newest first by release date", () => {
    expect(sortTCGCards(cards, "newest").map((c) => c.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("sorts oldest first by release date", () => {
    expect(sortTCGCards(cards, "oldest").map((c) => c.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("sorts by rarity rank, highest first", () => {
    expect(sortTCGCards(cards, "rarity").map((c) => c.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("treats missing rarity as the lowest rank rather than throwing", () => {
    const withMissing = [
      makeCard({ id: "known", rarity: "Rare" }),
      makeCard({ id: "unknown-rarity" }),
    ];

    expect(sortTCGCards(withMissing, "rarity").map((c) => c.id)).toEqual([
      "known",
      "unknown-rarity",
    ]);
  });

  it("doest not mutate the original cards array", () => {
    const originalOrder = cards.map((c) => c.id);
    sortTCGCards(cards, "newest");
    expect(cards.map((c) => c.id)).toEqual(originalOrder);
  });
});

describe("getCardMetaRows", () => {
  it("includes a row for every field thats present", () => {
    const card = makeCard({
      set: { name: "Base Set", releaseDate: "1999/01/09" },
      rarity: "Rare Holo",
      artist: "Mitsuhiro Arita",
      hp: "120",
      supertypes: ["Pokémon"],
    });

    expect(getCardMetaRows(card)).toEqual([
      { label: "Set", value: "Base Set" },
      { label: "Released", value: "1999 · 01 · 09" },
      { label: "Rarity", value: "Rare Holo" },
      { label: "Artist", value: "Mitsuhiro Arita" },
      { label: "HP", value: "120 HP" },
      { label: "Type", value: "Pokémon" },
    ]);
  });

  it("drops rows entirely for fields the API didnt return, rather than showing them blank", () => {
    expect(getCardMetaRows(makeCard({ rarity: "Common" }))).toEqual([
      { label: "Rarity", value: "Common" },
    ]);
  });

  it("returns an empty array when the card has none of the optional fields", () => {
    expect(getCardMetaRows(makeCard())).toEqual([]);
  });
});
