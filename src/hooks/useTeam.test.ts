import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTeam } from "./useTeam";

describe("useTeam", () => {
  it("throws a clear error when used outside a TeamProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useTeam())).toThrow(
      "useTeam must be used within a TeamProvider",
    );

    consoleError.mockRestore();
  });
});
