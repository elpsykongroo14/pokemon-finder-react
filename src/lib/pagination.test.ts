import { describe, it, expect } from "vitest";
import {
  clampPage,
  getPageCount,
  paginate,
  parsePage,
  withPage,
  withoutPage,
} from "./pagination";

describe("parsePage", () => {
  it.each([
    ["1", 1],
    ["2", 2],
    ["37", 37],
  ])("accepts %j as page %i", (raw, expected) => {
    expect(parsePage(raw)).toBe(expected);
  });

  it("falls back to page 1 when param is missing", () => {
    expect(parsePage(null)).toBe(1);
  });

  it.each([
    "",
    "0",
    "-1",
    "2.5",
    "abc",
    " 2",
    "02",
    "1e3",
    "99999999999999999999",
  ])("falls back to page 1 for the untrusted value %j", (raw) => {
    expect(parsePage(raw)).toBe(1);
  });
});

describe("getPageCount", () => {
  it.each([
    [0, 1],
    [1, 1],
    [9, 1],
    [10, 2],
    [18, 2],
    [19, 3],
  ])("%i items at 9 per page make %i page(s)", (total, expected) => {
    expect(getPageCount(total, 9)).toBe(expected);
  });

  it("rejects a page size that cannot work", () => {
    expect(() => getPageCount(10, 0)).toThrow(RangeError);
    expect(() => getPageCount(10, 2.5)).toThrow(RangeError);
  });
});

describe("clamPage", () => {
  it("keeps a valid page and pulls others into range", () => {
    expect(clampPage(2, 3)).toBe(2);
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(-5, 3)).toBe(1);
    expect(clampPage(999, 3)).toBe(3);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 19 }, (_, i) => i + 1);

  it("returns the slice for a middle page", () => {
    expect(paginate(items, 2, 9)).toEqual({
      items: [10, 11, 12, 13, 14, 15, 16, 17, 18],
      page: 2,
      pageCount: 3,
    });
  });

  it("returns a short last page", () => {
    expect(paginate(items, 3, 9).items).toEqual([19]);
  });

  it("clamps a page past the end, and reports the page really shown", () => {
    const result = paginate(items, 999, 9);
    expect(result.page).toBe(3);
    expect(result.items).toEqual([19]);
  });

  it("handles an empty list as one empty page", () => {
    expect(paginate([], 5, 9)).toEqual({ items: [], page: 1, pageCount: 1 });
  });

  it("does not mutate the array it was given", () => {
    const copy = [...items];
    paginate(items, 2, 9);
    expect(items).toEqual(copy);
  });
});

describe("WithPage", () => {
  it("writes a page above 1", () => {
    expect(withPage(new URLSearchParams(), 3).toString()).toBe("page=3");
  });

  it("removes the param for page 1 and keeps other params", () => {
    const next = withPage(new URLSearchParams("view=binder&page=3"), 1);
    expect(next.toString()).toBe("view=binder");
  });

  it("does not mutate the params it was given", () => {
    const original = new URLSearchParams("page=2");
    withPage(original, 4);
    expect(original.toString()).toBe("page=2");
  });
});

describe("withoutPage", () => {
  it("drops only the page from a search string", () => {
    expect(withoutPage("?view=binder&page=3")).toBe("?view=binder");
  });

  it("returns an empty string when nothing is left", () => {
    expect(withoutPage("?page=3")).toBe("");
    expect(withoutPage("")).toBe("");
  });
});
