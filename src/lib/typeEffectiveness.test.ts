import { describe, expect, it } from "vitest";
import { TYPE_CHART, computeDefensiveChart } from "./typeEffectiveness";

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
