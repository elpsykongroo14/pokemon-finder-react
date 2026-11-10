import { describe, it, expect } from "vitest";
import { toRuns } from "./pixelArt";

describe("toRuns", () => {
  it("merges neighbouring pixels of the same color into one run", () => {
    expect(toRuns(["ggg"])).toEqual([{ x: 0, y: 0, width: 3, color: "g" }]);
  });

  it("starts a new run when the color changes", () => {
    expect(toRuns(["ggbb"])).toEqual([
      { x: 0, y: 0, width: 2, color: "g" },
      { x: 2, y: 0, width: 2, color: "b" },
    ]);
  });

  it("skips transparent pixels but keeps the positions after them", () => {
    expect(toRuns([".g..g"])).toEqual([
      { x: 1, y: 0, width: 1, color: "g" },
      { x: 4, y: 0, width: 1, color: "g" },
    ]);
  });

  it("never merges across rows", () => {
    expect(toRuns(["g", "g"])).toEqual([
      { x: 0, y: 0, width: 1, color: "g" },
      { x: 0, y: 1, width: 1, color: "g" },
    ]);
  });

  it("returns nothing for an empty or fully transparent picture", () => {
    expect(toRuns([])).toEqual([]);
    expect(toRuns(["...", "..."])).toEqual([]);
  });
});
