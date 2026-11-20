import { describe, it, expect } from "vitest";
import { compareStat, outcomeForSide } from "./statComparison";

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

describe("outcomeForSide", () => {
  it("tells the winning side it won and the other side it lost", () => {
    expect(outcomeForSide("left", "left")).toBe("win");
    expect(outcomeForSide("left", "right")).toBe("lose");
    expect(outcomeForSide("right", "right")).toBe("win");
    expect(outcomeForSide("right", "left")).toBe("lose");
  });

  it("tells both sides it was a tie", () => {
    expect(outcomeForSide("tie", "left")).toBe("tie");
    expect(outcomeForSide("tie", "right")).toBe("tie");
  });
});
