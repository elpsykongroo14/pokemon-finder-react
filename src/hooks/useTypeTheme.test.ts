import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTypeTheme } from "./useTypeTheme";

const root = document.documentElement;

describe("useTypeTheme", () => {
  it("sets data-type and data-typ2 on <html> for a dual type pokemon", () => {
    renderHook(() => useTypeTheme(["fire", "flying"]));

    expect(root.dataset.type).toBe("fire");
    expect(root.dataset.type2).toBe("flying");
  });

  it("sets only data type for a single type pokemon", () => {
    renderHook(() => useTypeTheme(["electric"]));

    expect(root.dataset.type).toBe("electric");
    expect(root.dataset.type2).toBeUndefined();
  });

  it("sets nothing while there is no pokemon yet", () => {
    renderHook(() => useTypeTheme(undefined));

    expect(root.dataset.type).toBeUndefined();
    expect(root.dataset.type2).toBeUndefined();
  });

  it("clears both attributes when component unmounts", () => {
    const { unmount } = renderHook(() => useTypeTheme(["fire", "flying"]));
    expect(root.dataset.type).toBe("fire");

    unmount();

    expect(root.dataset.type).toBeUndefined();
    expect(root.dataset.type2).toBeUndefined();
  });

  it("swaps themes when the pokemon changes, dropping a stale second type", () => {
    const { rerender } = renderHook(
      ({ types }: { types: string[] }) => useTypeTheme(types),
      { initialProps: { types: ["fire", "flying"] } },
    );
    expect(root.dataset.type2).toBe("flying");

    rerender({ types: ["water"] });

    expect(root.dataset.type).toBe("water");
    expect(root.dataset.type2).toBeUndefined();
  });

  it("ignores type names that have no theme", () => {
    renderHook(() => useTypeTheme(["stellar"]));

    expect(root.dataset.type).toBeUndefined();
  });
});
