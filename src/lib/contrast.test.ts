import { describe, it, expect } from "vitest";
import { contrastRatio, relativeLuminance } from "./contrast";

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBe(0);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("is case-insensitive", () => {
    expect(relativeLuminance("#FFAA00")).toBe(relativeLuminance("#ffaa00"));
  });

  it("rejects anything that is not a 6-digit hex color", () => {
    expect(() => relativeLuminance("red")).toThrow();
    expect(() => relativeLuminance("#fff")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a color on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#336699", "#336699")).toBe(1);
  });

  it("gives the same answer whichever color is the text", () => {
    expect(contrastRatio("#10151a", "#ffbca4")).toBe(
      contrastRatio("#ffbca4", "#10151a"),
    );
  });

  it("matches the published value for #767676 on white (the classic AA threshold gray)", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });
});
