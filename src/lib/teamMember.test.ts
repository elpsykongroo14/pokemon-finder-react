import { describe, it, expect } from "vitest";
import { toTeamMember, parseTeamMember } from "./teamMember";
import type { PokemonDetails } from "./type";

const charizard = {
  name: "charizard",
  id: 6,
  sprites: { front_default: "https://img.example/charizard.png" },
  types: [
    { slot: 1, type: { name: "fire", url: "" } },
    { slot: 2, type: { name: "flying", url: "" } },
  ],
} as PokemonDetails;

describe("toTeamMember", () => {
  it("summarizes a full API pokemon into the small persisted shape", () => {
    expect(toTeamMember(charizard)).toEqual({
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

  it("rejects a member witha missing, empty or non string name", () => {
    expect(parseTeamMember({ id: 25, sprite: null })).toBeNull();
    expect(parseTeamMember({ name: "", id: 25, sprite: null })).toBeNull();
    expect(parseTeamMember({ name: 25, id: 25, sprite: null })).toBeNull();
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
});
