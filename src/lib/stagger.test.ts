import { describe, it, expect } from "vitest";
import { staggerSlot } from "./stagger";

describe("staggerSlot", () => {
  it("gives items that were there at the start their own position as slot", () => {
    expect([0, 1, 2].map((i) => staggerSlot(i, 3))).toEqual([0, 1, 2]);
  });

  it("gives an item that arrived later slot 0, so it enters right away", () => {
    //3 items at the start (positions 0..2), a 4th added afterwards (position 3)
    expect(staggerSlot(3, 3)).toBe(0);
    expect(staggerSlot(10, 3)).toBe(0);
  });

  it("caps the slot so a long list does not take forever to appear", () => {
    expect(staggerSlot(7, 60)).toBe(7);
    expect(staggerSlot(8, 60)).toBe(8);
    expect(staggerSlot(9, 60)).toBe(8);
    expect(staggerSlot(59, 60)).toBe(8);
  });

  it("respects a custom cap", () => {
    expect(staggerSlot(5, 20, 3)).toBe(3);
  });

  it("gives every item slot 0 when the list started empty", () => {
    expect(staggerSlot(0, 0)).toBe(0);
    expect(staggerSlot(4, 0)).toBe(0);
  });
});
