import { describe, it, expect } from "vitest";
import {
  getOrderedStats,
  percentOf,
  MAX_BASE_STAT,
  MAX_STAT_TOTAL,
  statTotal,
} from "./stats";
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

describe("percentOf", () => {
  it("returns how full the bar is, from 0 to 100", () => {
    expect(percentOf(50, 200)).toBe(25);
    expect(percentOf(200, 200)).toBe(100);
    expect(percentOf(0, 200)).toBe(0);
  });

  it("never goes below 0 or above 100", () => {
    expect(percentOf(-10, 200)).toBe(0);
    expect(percentOf(500, 200)).toBe(100);
  });

  it("returns 0 instead of NaN or infinity when max is 0 or negative", () => {
    expect(percentOf(50, 0)).toBe(0);
    expect(percentOf(50, -5)).toBe(0);
  });

  it("uses a ruler of 255, the higehst base stat any pokemon can have", () => {
    expect(MAX_BASE_STAT).toBe(255);
  });
});

describe("statTotal", () => {
  it("adds up every base stat", () => {
    const stats = [92, 105, 90, 125, 90, 98].map((base_stat) => ({
      base_stat,
      effort: 0,
      stat: { name: "x", url: "" },
    }));
    expect(statTotal(stats)).toBe(600);
  });

  it("is 0 for no stats", () => {
    expect(statTotal([])).toBe(0);
  });

  //the plate's bar measures every Pokémon against one ruler, the highest
  //ordinary total (Arceus, 720), so a 600 reads as most of the way
  it("measures the total against 720", () => {
    expect(MAX_STAT_TOTAL).toBe(720);
    expect(percentOf(600, MAX_STAT_TOTAL)).toBeCloseTo(83.33, 1);
  });
});
