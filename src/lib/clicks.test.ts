import { describe, it, expect } from "vitest";
import { isPlainLeftClick } from "./clicks";

const plain = {
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
};

describe("isPlainLeftClick", () => {
  it("is true for a left click with no modifier keys", () => {
    expect(isPlainLeftClick(plain)).toBe(true);
  });

  it.each(["metaKey", "ctrlKey", "shiftKey", "altKey"] as const)(
    "is false when %s is held",
    (key) => {
      expect(isPlainLeftClick({ ...plain, [key]: true })).toBe(false);
    },
  );

  it("is false for middle and right clicks", () => {
    expect(isPlainLeftClick({ ...plain, button: 1 })).toBe(false);
    expect(isPlainLeftClick({ ...plain, button: 2 })).toBe(false);
  });
});
