import { describe, it, expect } from "vitest";
import { isLibraryView, parseLibraryView, withLibrayView } from "./libraryView";

describe("parseLibraryView", () => {
  it.each(["grid", "table", "binder"] as const)("accept %s", (view) => {
    expect(parseLibraryView(view)).toBe(view);
  });

  it("falls back to grid when the param is mising", () => {
    expect(parseLibraryView(null)).toBe("grid");
  });

  it.each(["banana", "", "TABLE", " table", "grid,table"])(
    "falls back to grid for the untrusted value %j",
    (raw) => {
      expect(parseLibraryView(raw)).toBe("grid");
    },
  );
});

describe("isLibraryView", () => {
  it("is true only for the known views", () => {
    expect(isLibraryView("binder")).toBe(true);
    expect(isLibraryView("list")).toBe(false);
    expect(isLibraryView(undefined)).toBe(false);
    expect(isLibraryView(3)).toBe(false);
  });
});

describe("withLibraryView", () => {
  it("writes a non default view", () => {
    const next = withLibrayView(new URLSearchParams(), "table");
    expect(next.toString()).toBe("view=table");
  });

  it("removes the param for the default view, keeping the URL clean", () => {
    const next = withLibrayView(new URLSearchParams("view=table"), "grid");
    expect(next.toString()).toBe("");
  });

  it("keeps every other param untouched", () => {
    const next = withLibrayView(new URLSearchParams("sort=rarity"), "binder");
    expect(next.get("sort")).toBe("rarity");
    expect(next.get("view")).toBe("binder");
  });

  it("does not mutate the params it was given", () => {
    const original = new URLSearchParams("view=table");
    withLibrayView(original, "binder");
    expect(original.toString()).toBe("view=table");
  });
});
