import { describe, it, expect } from "vitest";
import { compareStat } from "./statComparison";

describe("compareStat", () => {
  it("picks left when left is greater", () => {
    expect(compareStat(80, 50)).toBe("left");
  });

  it("picks right when right is greater", () => {
    expect(compareStat(50, 80)).toBe("right");
  });

  it("returns tie when both values are equal", () => {
    expect(compareStat(65, 65)).toBe("tie");
  });
});
