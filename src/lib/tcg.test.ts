import { describe, it, expect, vi } from "vitest";
import {
  shuffleArray,
  sortTCGCards,
  getCardMetaRows,
  getRarityRank,
  getRarityTier,
  formatCardNumber,
  getCardStage,
  formatReleaseDate,
  getCardSubtitle,
  groupCards,
  countTiers,
  pickHand,
  summarizeCards,
  stepCard,
  describeCard,
} from "./tcg";
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

describe("getRarityRank", () => {
  it("ranks known rarities and gives anything else the lowest rank", () => {
    expect(getRarityRank("Secret Rare")).toBe(9);
    expect(getRarityRank("Common")).toBe(0);
    expect(getRarityRank("Some Future Rarity")).toBe(0);
    expect(getRarityRank(undefined)).toBe(0);
  });
});

describe("getRarityTier", () => {
  it.each([
    ["Common", "common"],
    ["Uncommon", "common"],
    ["Rare", "rare"],
    ["Rare Holo", "holo"],
    ["Rare Holo GX", "holo"],
    ["Rare Holo VMAX", "holo"],
    ["Rare Rainbow", "ultra"],
    ["Special Illustration Rare", "ultra"],
    ["Secret Rare", "ultra"],
  ] as const)("maps %s to the %s tier", (rarity, tier) => {
    expect(getRarityTier(rarity)).toBe(tier);
  });

  it("falls back to common for a missing or unrecognised rarity", () => {
    expect(getRarityTier(undefined)).toBe("common");
    expect(getRarityTier("Some Future Rarity")).toBe("common");
  });

  //these three strings are real API values that were missing from the table,
  //so they fell through to rank 0: a Double Rare ex looked and sorted like a Common
  it.each([
    ["Double Rare", "holo"],
    ["Rare BREAK", "holo"],
    ["Promo", "rare"],
  ] as const)("maps %s (once missing from the table) to %s", (rarity, tier) => {
    expect(getRarityTier(rarity)).toBe(tier);
  });

  it("sorts a Double Rare above a plain Rare", () => {
    expect(getRarityRank("Double Rare")).toBeGreaterThan(getRarityRank("Rare"));
  });
});

//changed in B&W-7: the dialog's list is now the spec's (7.4): Series,
//Released, Rarity, Artist, HP, Stage. the set moved up into the subtitle
//("Surging Sparks, 240/191") and the release date reads like a date
describe("getCardMetaRows", () => {
  it("includes a row for every field thats present", () => {
    const card = makeCard({
      set: { name: "Base Set", series: "Base", releaseDate: "1999/01/09" },
      rarity: "Rare Holo",
      artist: "Mitsuhiro Arita",
      hp: "120",
      subtypes: ["Stage 2"],
    });

    expect(getCardMetaRows(card)).toEqual([
      { label: "Series", value: "Base" },
      { label: "Released", value: "9 Jan 1999" },
      { label: "Rarity", value: "Rare Holo" },
      { label: "Artist", value: "Mitsuhiro Arita" },
      { label: "HP", value: "120 HP" },
      { label: "Stage", value: "Stage 2" },
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

//spec 7.4: "240/191" when the number is a plain number, the printed code
//as it is otherwise (promos: "SWSH037")
describe("formatCardNumber", () => {
  it("shows a numeric number over the set's printed total", () => {
    const card = makeCard({
      number: "240",
      set: { name: "Surging Sparks", printedTotal: 191 },
    });
    expect(formatCardNumber(card)).toBe("240/191");
  });

  it("shows a code as it is", () => {
    const card = makeCard({ number: "SWSH037", set: { printedTotal: 307 } });
    expect(formatCardNumber(card)).toBe("SWSH037");
  });

  it("shows the number alone when the set has no printed total", () => {
    expect(formatCardNumber(makeCard({ number: "12" }))).toBe("12");
  });

  it("is null for a card without a number", () => {
    expect(formatCardNumber(makeCard())).toBeNull();
  });
});

describe("getCardStage", () => {
  it.each([
    [["Basic"], "Basic"],
    [["Stage 1"], "Stage 1"],
    [["Stage 2", "ex"], "Stage 2"],
    [["BREAK"], "BREAK"],
  ])("reads %j as %s", (subtypes, stage) => {
    expect(getCardStage(makeCard({ subtypes }))).toBe(stage);
  });

  it("is null when no subtype is a stage", () => {
    expect(getCardStage(makeCard({ subtypes: ["Item"] }))).toBeNull();
    expect(getCardStage(makeCard())).toBeNull();
  });
});

describe("formatReleaseDate", () => {
  it("writes the API's 2024/11/08 the way people write a date", () => {
    expect(formatReleaseDate("2024/11/08")).toBe("8 Nov 2024");
    expect(formatReleaseDate("2011/02/09")).toBe("9 Feb 2011");
  });

  it("is null for a date it cannot read", () => {
    expect(formatReleaseDate(undefined)).toBeNull();
    expect(formatReleaseDate("soon")).toBeNull();
    expect(formatReleaseDate("2024/13/01")).toBeNull();
  });
});

describe("getCardSubtitle", () => {
  it("is the set and the number", () => {
    const card = makeCard({
      number: "240",
      set: { name: "Surging Sparks", printedTotal: 191 },
    });
    expect(getCardSubtitle(card)).toBe("Surging Sparks, 240/191");
  });

  it("is whichever of the two exists", () => {
    expect(getCardSubtitle(makeCard({ set: { name: "Jungle" } }))).toBe(
      "Jungle",
    );
    expect(getCardSubtitle(makeCard())).toBe("");
  });
});

//the grid as a timeline (spec 7.4): by series with a date sort, by tier
//with the rarity sort. the cards arrive already sorted; grouping keeps
//their order and the order the groups first appear in
describe("groupCards", () => {
  const cards = [
    makeCard({
      id: "a",
      rarity: "Common",
      set: { series: "Mega Evolution", releaseDate: "2026/01/30" },
    }),
    makeCard({
      id: "b",
      rarity: "Ultra Rare",
      set: { series: "Scarlet & Violet", releaseDate: "2025/07/18" },
    }),
    makeCard({
      id: "c",
      rarity: "Rare Holo",
      set: { series: "Scarlet & Violet", releaseDate: "2023/06/09" },
    }),
    makeCard({ id: "d", rarity: "Rare", set: { releaseDate: "2011/02/09" } }),
  ];

  it("groups a date sort by series, in the order the cards come", () => {
    const groups = groupCards(cards, "newest");

    expect(groups.map((g) => g.label)).toEqual([
      "Mega Evolution",
      "Scarlet & Violet",
      "Other cards",
    ]);
    expect(groups[1]?.cards.map((c) => c.id)).toEqual(["b", "c"]);
  });

  it("gives each group the first and last year of its cards", () => {
    const groups = groupCards(cards, "newest");

    expect(groups[0]?.years).toEqual({ first: 2026, last: 2026 });
    expect(groups[1]?.years).toEqual({ first: 2023, last: 2025 });
  });

  it("groups the rarity sort by tier, rarest first, skipping empty tiers", () => {
    const groups = groupCards(cards, "rarity");

    expect(groups.map((g) => g.label)).toEqual([
      "Ultra rare and up",
      "Holo",
      "Rare",
      "Common",
    ]);
    expect(groups.map((g) => g.key)).toEqual([
      "ultra",
      "holo",
      "rare",
      "common",
    ]);
    expect(
      groupCards([makeCard({ rarity: "Rare" })], "rarity").map((g) => g.key),
    ).toEqual(["rare"]);
  });

  it("has no year span for cards without dates", () => {
    expect(groupCards([makeCard()], "newest")[0]?.years).toBeNull();
  });

  it("is empty for no cards", () => {
    expect(groupCards([], "oldest")).toEqual([]);
  });
});

describe("countTiers", () => {
  it("counts the cards in each tier, zero for an empty tier", () => {
    expect(
      countTiers([
        makeCard({ rarity: "Ultra Rare" }),
        makeCard({ rarity: "Rare Holo" }),
        makeCard({ rarity: "Rare Holo" }),
        makeCard({ rarity: "Rare" }),
      ]),
    ).toEqual({ ultra: 1, holo: 2, rare: 1, common: 0 });
  });
});

//the hero's hand (spec 7.4): the three rarest, newest first among ties
describe("pickHand", () => {
  it("takes the three highest by rarity, rarest first", () => {
    const hand = pickHand([
      makeCard({ id: "common", rarity: "Common" }),
      makeCard({ id: "holo", rarity: "Rare Holo" }),
      makeCard({ id: "secret", rarity: "Secret Rare" }),
      makeCard({ id: "rare", rarity: "Rare" }),
      makeCard({ id: "ultra", rarity: "Ultra Rare" }),
    ]);

    expect(hand.map((c) => c.id)).toEqual(["secret", "ultra", "holo"]);
  });

  it("prefers the newer card when two are equally rare", () => {
    const hand = pickHand([
      makeCard({
        id: "old",
        rarity: "Rare Holo",
        set: { releaseDate: "2011/01/01" },
      }),
      makeCard({
        id: "new",
        rarity: "Rare Holo",
        set: { releaseDate: "2020/01/01" },
      }),
    ]);

    expect(hand.map((c) => c.id)).toEqual(["new", "old"]);
  });

  it("holds fewer than three when there are fewer cards", () => {
    expect(pickHand([])).toEqual([]);
  });
});

//the facts the hero's lead sentence and the Pokémon page's teaser are
//built from (spec 7.2, 7.4). the words themselves live in copy.ts
describe("summarizeCards", () => {
  it("finds the count, the year span and the oldest and newest series and sets", () => {
    const summary = summarizeCards([
      makeCard({
        set: {
          name: "30th Celebration",
          series: "Mega Evolution",
          releaseDate: "2026/09/16",
        },
      }),
      makeCard({
        set: {
          name: "Noble Victories",
          series: "Black & White",
          releaseDate: "2011/11/16",
        },
      }),
      makeCard({
        set: {
          name: "Surging Sparks",
          series: "Scarlet & Violet",
          releaseDate: "2024/11/08",
        },
      }),
    ]);

    expect(summary).toEqual({
      count: 3,
      firstYear: 2011,
      lastYear: 2026,
      firstSeries: "Black & White",
      lastSeries: "Mega Evolution",
      firstSet: "Noble Victories",
      lastSet: "30th Celebration",
    });
  });

  it("leaves out what no card has", () => {
    expect(summarizeCards([makeCard(), makeCard()])).toEqual({
      count: 2,
      firstYear: null,
      lastYear: null,
      firstSeries: null,
      lastSeries: null,
      firstSet: null,
      lastSet: null,
    });
  });
});

//Previous card / Next card and the arrow keys in the dialog (D53): they
//move through the cards in the order the page shows them, and stop at the ends
describe("stepCard", () => {
  const cards = [
    makeCard({ id: "a" }),
    makeCard({ id: "b" }),
    makeCard({ id: "c" }),
  ];

  it("moves forward and back", () => {
    expect(stepCard(cards, cards[1]!, 1)?.id).toBe("c");
    expect(stepCard(cards, cards[1]!, -1)?.id).toBe("a");
  });

  it("stops at the ends", () => {
    expect(stepCard(cards, cards[2]!, 1)).toBeNull();
    expect(stepCard(cards, cards[0]!, -1)).toBeNull();
  });

  it("finds the card by id, and is null for a card not in the list", () => {
    expect(stepCard(cards, makeCard({ id: "a" }), 1)?.id).toBe("b");
    expect(stepCard(cards, makeCard({ id: "zz" }), 1)).toBeNull();
  });
});

//a pocket or a hand slot shows only the picture, so its button needs a
//name in words: the card, its set and its rarity, the same facts a grid
//tile says (B&W-7)
describe("describeCard", () => {
  it("joins the name, set and rarity", () => {
    expect(
      describeCard(
        makeCard({
          name: "Hydreigon ex",
          rarity: "Ultra Rare",
          set: { name: "White Flare" },
        }),
      ),
    ).toBe("Hydreigon ex, White Flare, Ultra Rare");
  });

  it("is just the name when nothing else is known", () => {
    expect(describeCard(makeCard({ name: "Mystery" }))).toBe("Mystery");
  });
});
