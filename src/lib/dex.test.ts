import { describe, it, expect } from "vitest";
import { formatDexNumber } from "./dex";

describe("formatDexNumber", () => {
  it("pads short numbers to three digits", () => {
    expect(formatDexNumber(6)).toBe("#006");
    expect(formatDexNumber(25)).toBe("#025");
    expect(formatDexNumber(150)).toBe("#150");
  });

  it("never cuts numbers longer than three digits", () => {
    expect(formatDexNumber(1025)).toBe("#1025");
  });
  it("shows a placeholder for ids that cannot be real dex numbers", () => {
    expect(formatDexNumber(0)).toBe("#???");
    expect(formatDexNumber(-3)).toBe("#???");
    expect(formatDexNumber(1.5)).toBe("#???");
    expect(formatDexNumber(NaN)).toBe("#???");
  });
});
