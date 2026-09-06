import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFavorites } from "./useFavorites";

describe("useFavorites", () => {
  it("throws a clear error when used outside a FavoritesProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useFavorites())).toThrow(
      "useFavorites must be used within a FavoritesProvider",
    );

    consoleError.mockRestore();
  });
});
