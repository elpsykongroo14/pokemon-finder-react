import { describe, it, expect } from "vitest";
import { moveInGrid } from "./gridNav";

//the 2x2 battle menu: 0 1
//                     2 3
describe("moveInGrid in 2x2 grid", () => {
  it.each([
    [0, "ArrowRight", 1],
    [0, "ArrowDown", 2],
    [3, "ArrowLeft", 2],
    [3, "ArrowUp", 1],
  ])("from %i, %s moves to %i", (from, key, to) => {
    expect(moveInGrid(from, key, 2, 4)).toBe(to);
  });

  it.each([
    [1, "ArrowRight", 0],
    [0, "ArrowLeft", 1],
    [3, "ArrowRight", 2],
    [2, "ArrowLeft", 3],
    [2, "ArrowDown", 0],
    [3, "ArrowDown", 1],
    [0, "ArrowUp", 2],
    [1, "ArrowUp", 3],
  ])("wraps at the edge: form %i, %s moves to %i", (from, key, to) => {
    expect(moveInGrid(from, key, 2, 4)).toBe(to);
  });

  it("jumps to the first and last item with Home and End", () => {
    expect(moveInGrid(3, "Home", 2, 4)).toBe(0);
    expect(moveInGrid(0, "End", 2, 4)).toBe(3);
  });

  it("returns null for keys it does not handle", () => {
    for (const key of ["Enter", " ", "a", "Tab", "Escape"]) {
      expect(moveInGrid(0, key, 2, 4)).toBeNull();
    }
  });
});

//a short last row:  0 1
//                   2 3
//                   4
describe("moveInGrid when the last row is short (5 items, 2 columns)", () => {
  it("wraps Right withing the short row", () => {
    expect(moveInGrid(4, "ArrowRight", 2, 5)).toBe(4);
  });

  it("wraps left within the short row", () => {
    expect(moveInGrid(2, "ArrowDown", 2, 5)).toBe(4);
  });

  it("goes down from the row above into the short row when it can", () => {
    expect(moveInGrid(2, "ArrowDown", 2, 5)).toBe(4);
  });

  it("wraps down from the lone item to the top of its column", () => {
    expect(moveInGrid(4, "ArrowDown", 2, 5)).toBe(0);
  });

  it("wraps up past the top to the lowest item that really exists in the column", () => {
    expect(moveInGrid(0, "ArrowUp", 2, 5)).toBe(4); //column 0 has 3 items
    expect(moveInGrid(1, "ArrowUp", 2, 5)).toBe(3); //column 1 has only 2
  });

  it("wraps down out of a column whose last cell is missing", () => {
    expect(moveInGrid(3, "ArrowDown", 2, 5)).toBe(1);
  });
});

describe("moveInGrid edge cases", () => {
  it("does nothing for an empty grid", () => {
    expect(moveInGrid(3, "ArrowRight", 2, 0)).toBeNull();
  });

  it("stays put in a one item grid", () => {
    expect(moveInGrid(0, "ArrowRight", 2, 1)).toBe(0);
    expect(moveInGrid(0, "ArrowDown", 2, 1)).toBe(0);
  });
});
