import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

afterEach(() => {
  vi.unstubAllGlobals();
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

  it("starts with animations off for a new visitor whose OS asks for reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));

    const { result } = renderPreferences();

    expect(result.current.animationsEnabled).toBe(false);
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("lets a saved choice win over the OS setting", () => {
    localStorage.setItem(
      "pokemon_preferences",
      JSON.stringify({
        animationsEnabled: true,
        soundEnabled: true,
        spriteMode: "pixel",
      }),
    );
    vi.stubGlobal("matchMedia", () => ({ matches: true }));

    const { result } = renderPreferences();

    expect(result.current.animationsEnabled).toBe(true);
    expect(document.documentElement.dataset.motion).toBe("on");
  });
});
