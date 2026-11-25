import { describe, it, expect } from "vitest";
import { formatDexNumber } from "./dex";

describe("formatDexNumber", () => {
  //D56: "No. 025", the way the games print it (was "#025")
  it("pads short numbers to three digits", () => {
    expect(formatDexNumber(6)).toBe("No. 006");
    expect(formatDexNumber(25)).toBe("No. 025");
    expect(formatDexNumber(150)).toBe("No. 150");
  });

  it("never cuts numbers longer than three digits", () => {
    expect(formatDexNumber(1025)).toBe("No. 1025");
  });
  it("shows a placeholder for ids that cannot be real dex numbers", () => {
    expect(formatDexNumber(0)).toBe("No. ???");
    expect(formatDexNumber(-3)).toBe("No. ???");
    expect(formatDexNumber(1.5)).toBe("No. ???");
    expect(formatDexNumber(NaN)).toBe("No. ???");
  });
});
