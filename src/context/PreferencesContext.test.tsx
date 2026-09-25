import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePreferences } from "../hooks/usePreferences";
import { PreferencesProvider } from "./PreferencesContext";

function renderPreferences() {
  return renderHook(() => usePreferences(), {
    wrapper: ({ children }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    ),
  });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-motion");
});

describe("PreferencesContext", () => {
  it("starts with animations and sound on, pixel sprites", () => {
    const { result } = renderPreferences();

    expect(result.current.animationsEnabled).toBe(true);
    expect(result.current.soundEnabled).toBe(true);
    expect(result.current.spriteMode).toBe("pixel");
  });

  it("turning animations off updates state and the html attribute", () => {
    const { result } = renderPreferences();

    act(() => {
      result.current.setAnimationsEnabled(false);
    });

    expect(result.current.animationsEnabled).toBe(false);
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("persisys preferences to localStorage", () => {
    const { result } = renderPreferences();

    act(() => {
      result.current.setSpriteMode("artwork");
    });

    const stored = JSON.parse(
      localStorage.getItem("pokemon_preferences") ?? "{}",
    );
    expect(stored.spriteMode).toBe("artwork");
  });

  it("throws when used outside a PreferencesProvider", () => {
    expect(() => renderHook(() => usePreferences())).toThrow(
      "usePreferences must be used within a PreferencesProvider",
    );
  });
});
