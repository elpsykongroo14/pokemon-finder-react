import { describe, expect, it } from "vitest";
import {
  TYPE_CHART,
  computeDefensiveChart,
  groupMatchups,
} from "./typeEffectiveness";

describe("computeDefensiveChart", () => {
  it("applies a straightforward weaknes (fire is 2x against grass)", () => {
    expect(computeDefensiveChart(["grass"]).fire).toBe(2);
  });

  it("applies a straightforward resistance (water is 0.5x against grass)", () => {
    expect(computeDefensiveChart(["grass"]).water).toBe(0.5);
  });

  it("applies full immunity (ground deals 0x to flying)", () => {
    expect(computeDefensiveChart(["flying"]).ground).toBe(0);
  });

  it("leaves a genuinely unlisted matchup at neutral 1x default (electric vs bug)", () => {
    expect(computeDefensiveChart(["bug"]).electric).toBe(1);
  });

  it("compounds two weaknesses on a dual type into a 4x multiplier (flying/fire vs rock", () => {
    expect(computeDefensiveChart(["fire", "flying"]).rock).toBe(4);
  });

  it("compounds a weakness and an immunity into a hard 0x (fire/flying vs ground)", () => {
    //ground is 2x vs fire but flying is fully immune to ground ->  2 * 0 = 0
    expect(computeDefensiveChart(["fire", "flying"]).ground).toBe(0);
  });

  it("returns an all neutral chart when given no defending types", () => {
    const chart = computeDefensiveChart([]);
    Object.values(chart).forEach((multiplier) => expect(multiplier).toBe(1));
  });
});

describe("TYPE_CHART data integrity", () => {
  const VALID_TYPES = Object.keys(TYPE_CHART);

  it("has exactly the 18 real pokemon types as keys", () => {
    expect(VALID_TYPES).toHaveLength(18);
  });

  it("only references valid type names inside double/half/imune arrays (catches typos)", () => {
    const invalidReferences: string[] = [];

    Object.entries(TYPE_CHART).forEach(([attackingType, matchup]) => {
      const referenced = [
        ...(matchup.double ?? []),
        ...(matchup.half ?? []),
        ...(matchup.immune ?? []),
      ];
      referenced.forEach((type) => {
        if (!VALID_TYPES.includes(type)) {
          invalidReferences.push(`${attackingType} -> "${type}"`);
        }
      });
    });
    expect(invalidReferences).toEqual([]);
  });
});

describe("groupMatchups", () => {
  //Hydreigon: dark/dragon, the Pokémon in the approved screens
  const hydreigon = groupMatchups(["dark", "dragon"]);

  it("lists what hits harder than normal under 'weak', strongest first", () => {
    expect(hydreigon.weak[0]).toEqual({ type: "fairy", multiplier: 4 });
    expect(hydreigon.weak.map((m) => m.type).sort()).toEqual([
      "bug",
      "dragon",
      "fairy",
      "fighting",
      "ice",
    ]);
  });

  it("lists what hits softer under 'resists', and immunities on their own", () => {
    expect(hydreigon.resists.map((m) => m.multiplier)).toEqual(
      Array(6).fill(0.5),
    );
    expect(hydreigon.immune).toEqual([{ type: "psychic", multiplier: 0 }]);
  });

  it("puts a quarter resistance before a half one", () => {
    //Volcarona, bug/fire: grass does a quarter
    expect(groupMatchups(["bug", "fire"]).resists[0]).toEqual({
      type: "grass",
      multiplier: 0.25,
    });
  });

  it("leaves neutral matchups out, and keeps the chart's order within a group", () => {
    const pikachu = groupMatchups(["electric"]);
    expect(pikachu.weak).toEqual([{ type: "ground", multiplier: 2 }]);
    expect(pikachu.resists.map((m) => m.type)).toEqual([
      "electric",
      "flying",
      "steel",
    ]);
    expect(pikachu.immune).toEqual([]);
  });
});
