import { describe, it, expect } from "vitest";
import { getOrderedStats } from "./stats";
import type { PokemonStat } from "./type";

function makeStat(name: string, base_stat: number): PokemonStat {
  return { base_stat, effort: 0, stat: { name, url: "" } };
}

describe("getOrderedStats", () => {
  it("reorders stats to match STAT_ORDER regardless of input order", () => {
    const shuffled = [
      makeStat("speed", 90),
      makeStat("hp", 35),
      makeStat("attack", 55),
    ];

    const result = getOrderedStats(shuffled);

    expect(result.map((s) => s.stat.name)).toEqual(["hp", "attack", "speed"]);
  });

  it("silently omits stats that STAT_ORDER doesnt recognize", () => {
    const withUnknown = [makeStat("hp", 35), makeStat("some-future-stat", 10)];

    const result = getOrderedStats(withUnknown);

    expect(result.map((s) => s.stat.name)).toEqual(["hp"]);
  });

  it("skips STAT_ORDER entries that are missing from the input, without producing undefined gaps", () => {
    const onlyHp = [makeStat("hp", 35)];

    const result = getOrderedStats(onlyHp);

    expect(result).toEqual([makeStat("hp", 35)]);
    expect(result).toHaveLength(1);
  });

  it("returns an empty array when given no stats", () => {
    expect(getOrderedStats([])).toEqual([]);
  });
});
