import { describe, it, expect } from "vitest";
import { getBinderSpread } from "./binder";

//D54: the binder shows two pages at a time, an odd page on the left and
//the next one on the right. ?page= still means ONE page, so an old link
//to page 2 opens the spread that holds page 2 (pages 1 and 2).
//D55: on phones the binder shows one page at a time
describe("getBinderSpread, two pages at a time", () => {
  it("opens on pages 1 and 2", () => {
    expect(getBinderSpread(1, 3, 2)).toEqual({
      pages: [1, 2],
      pageCount: 3,
      previous: null,
      next: 3,
    });
  });

  it("puts an even page on the right of its spread", () => {
    expect(getBinderSpread(2, 3, 2).pages).toEqual([1, 2]);
    expect(getBinderSpread(4, 5, 2).pages).toEqual([3, 4]);
  });

  //with an odd number of pages the last spread has a page past the last
  //card: the binder draws "That's all 25 cards." there
  it("pairs the last page with the page after it when the count is odd", () => {
    expect(getBinderSpread(3, 3, 2)).toEqual({
      pages: [3, 4],
      pageCount: 3,
      previous: 1,
      next: null,
    });
  });

  it("steps a whole spread at a time", () => {
    const spread = getBinderSpread(3, 6, 2);
    expect(spread.previous).toBe(1);
    expect(spread.next).toBe(5);
  });

  it("clamps a page past the end to the last spread", () => {
    expect(getBinderSpread(99, 4, 2).pages).toEqual([3, 4]);
  });

  it("is one spread with no way on when everything fits", () => {
    expect(getBinderSpread(1, 1, 2)).toEqual({
      pages: [1, 2],
      pageCount: 1,
      previous: null,
      next: null,
    });
  });
});

describe("getBinderSpread, one page at a time (phones, D55)", () => {
  it("shows the page asked for, and steps one page", () => {
    expect(getBinderSpread(2, 3, 1)).toEqual({
      pages: [2],
      pageCount: 3,
      previous: 1,
      next: 3,
    });
  });

  it("never shows a page past the last card", () => {
    expect(getBinderSpread(3, 3, 1)).toEqual({
      pages: [3],
      pageCount: 3,
      previous: 2,
      next: null,
    });
  });
});
