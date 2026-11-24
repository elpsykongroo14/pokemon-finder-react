import { describe, it, expect } from "vitest";
import {
  toFavorite,
  toTeamMember,
  parseTeamMember,
  isIncompleteMember,
} from "./teamMember";
import type { PokemonDetails } from "./type";
import { parseStoredTeam } from "./teamStorage";

const charizard = {
  name: "charizard",
  id: 6,
  sprites: { front_default: "https://img.example/charizard.png" },
  types: [
    { slot: 1, type: { name: "fire", url: "" } },
    { slot: 2, type: { name: "flying", url: "" } },
  ],
  //Charizard's six base stats: 78 + 84 + 78 + 109 + 85 + 100 = 534
  stats: [78, 84, 78, 109, 85, 100].map((base_stat) => ({
    base_stat,
    effort: 0,
    stat: { name: "", url: "" },
  })),
} as PokemonDetails;

describe("toTeamMember", () => {
  it("summarizes a full API pokemon into the small persisted shape", () => {
    expect(toTeamMember(charizard)).toEqual({
      name: "charizard",
      id: 6,
      sprite: "https://img.example/charizard.png",
      types: ["fire", "flying"],
      //D49: saved with the member, so a team card can show it without
      //fetching the Pokémon again
      statTotal: 534,
    });
  });
});

//favorites use the same summary, minus the total (B&W-6 split them)
describe("toFavorite", () => {
  it("summarizes a pokemon without the stat total", () => {
    expect(toFavorite(charizard)).toEqual({
      name: "charizard",
      id: 6,
      sprite: "https://img.example/charizard.png",
      types: ["fire", "flying"],
    });
  });
});

describe("parseTeamMember", () => {
  it("accepts the old shape (no types) and leaves types absent", () => {
    const result = parseTeamMember({
      name: "pikachu",
      id: 25,
      sprite: "p.png",
    });

    expect(result).toEqual({ name: "pikachu", id: 25, sprite: "p.png" });
    expect(result).not.toHaveProperty("types");
  });

  it("accepts the new shape and keeps types", () => {
    const result = parseTeamMember({
      name: "pikachu",
      id: 25,
      sprite: "p.png",
      types: ["electric"],
    });

    expect(result?.types).toEqual(["electric"]);
  });

  it.each([null, undefined, "pikachu", 25, true, [], [1, 2]])(
    "rejects a value that is not an object: %j",
    (bad) => {
      expect(parseTeamMember(bad)).toBeNull();
    },
  );

  it("rejects a member with a missing, empty or non string name", () => {
    expect(parseTeamMember({ id: 25, sprite: null })).toBeNull();
    expect(parseTeamMember({ name: "", id: 25, sprite: null })).toBeNull();
    expect(parseTeamMember({ name: 25, id: 25, sprite: null })).toBeNull();
  });

  it("rejects a member with a missing or non integer id", () => {
    expect(parseTeamMember({ name: "Pikachu", sprite: null })).toBeNull();
    expect(parseTeamMember({ name: "Pikachu", id: "25" })).toBeNull();
    expect(parseTeamMember({ name: "Pikachu", id: 25.5 })).toBeNull();
  });

  it("returns an empty team when the stored text is an empty string", () => {
    expect(parseStoredTeam("")).toEqual([]);
  });

  it("turns a missing or invalud sprite into null instead of rejecting", () => {
    expect(parseTeamMember({ name: "pikachu", id: 25 })?.sprite).toBeNull();
    expect(
      parseTeamMember({ name: "pikachu", id: 25, sprite: 42 })?.sprite,
    ).toBeNull();
  });

  it("drops malformed types but keeps the member", () => {
    const notArray = parseTeamMember({ name: "a", id: 1, types: "fire" });
    const badItems = parseTeamMember({ name: "a", id: 1, types: ["fire", 7] });

    expect(notArray).toEqual({ name: "a", id: 1, sprite: null });
    expect(badItems).toEqual({ name: "a", id: 1, sprite: null });
  });

  //D49: teams saved before B&W-6 have no stat total. that is not an error,
  //the backfill fills it in on the Team page
  it("keeps a saved stat total", () => {
    expect(
      parseTeamMember({ name: "a", id: 1, statTotal: 534 })?.statTotal,
    ).toBe(534);
  });

  it("leaves the stat total absent for a member saved without one", () => {
    expect(parseTeamMember({ name: "a", id: 1 })).not.toHaveProperty(
      "statTotal",
    );
  });

  it.each(["534", -1, 12.5, Number.NaN, null])(
    "drops a stat total that is not a whole number of zero or more: %j",
    (bad) => {
      expect(
        parseTeamMember({ name: "a", id: 1, statTotal: bad }),
      ).not.toHaveProperty("statTotal");
    },
  );
});

//one rule, read by the reducer (may BACKFILL change this member?) and by
//the backfill hook (whom to fetch next?), so the two cannot disagree
describe("isIncompleteMember", () => {
  it("is incomplete without types or without a stat total", () => {
    expect(isIncompleteMember({ name: "a", id: 1, sprite: null })).toBe(true);
    expect(
      isIncompleteMember({ name: "a", id: 1, sprite: null, types: ["fire"] }),
    ).toBe(true);
    expect(
      isIncompleteMember({ name: "a", id: 1, sprite: null, statTotal: 300 }),
    ).toBe(true);
  });

  it("is complete with both", () => {
    expect(
      isIncompleteMember({
        name: "a",
        id: 1,
        sprite: null,
        types: ["fire"],
        statTotal: 300,
      }),
    ).toBe(false);
  });
});
