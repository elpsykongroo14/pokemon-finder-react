import { describe, it, expect } from "vitest";
import { parseStoredTeam } from "./teamStorage";
import { MAX_TEAM } from "./teamReducer";

describe("parseStoredTeam", () => {
  it("returns an empry team when nothing is stored", () => {
    expect(parseStoredTeam(null)).toEqual([]);
  });

  it("returns an empty team when the stored text is not valid JSON", () => {
    expect(parseStoredTeam("{not valid json}")).toEqual([]);
  });

  it.each(["{}", "42", "", '"pikachu"', "null", "true"])(
    "returns an empty team when valid JSON is not an array: %s",
    (text) => {
      expect(parseStoredTeam(text)).toEqual([]);
    },
  );

  it("loads a team saved in the old shape unchanged", () => {
    const old = [{ name: "pikachu", id: 25, sprite: "p.png" }];

    expect(parseStoredTeam(JSON.stringify(old))).toEqual(old);
  });

  it("skips malformed entries but keeps the valid ones", () => {
    const text = JSON.stringify([
      { name: "pikachu", id: 25, sprite: null },
      null,
      { name: 7 },
      { name: "bulbasaur", id: 1, sprite: null },
    ]);

    expect(parseStoredTeam(text).map((m) => m.name)).toEqual([
      "pikachu",
      "bulbasaur",
    ]);
  });

  it("drops duplicate names, keeping the first", () => {
    const text = JSON.stringify([
      { name: "pikachu", id: 25, sprite: "first.png" },
      { name: "pikachu", id: 25, sprite: "second.png" },
    ]);

    const result = parseStoredTeam(text);

    expect(result).toHaveLength(1);
    expect(result[0]?.sprite).toBe("first.png");
  });

  it("never returns more than MAX_TEAM members", () => {
    const tooMany = Array.from({ length: MAX_TEAM + 3 }, (_, i) => ({
      name: `member-${i}`,
      id: i,
      sprite: null,
    }));

    expect(parseStoredTeam(JSON.stringify(tooMany))).toHaveLength(MAX_TEAM);
  });
});
