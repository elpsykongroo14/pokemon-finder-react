import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePreferences } from "../hooks/usePreferences";
import { PreferencesProvider } from "./PreferencesContext";
import { PREFERENCES_KEY } from "../lib/preferences";

function renderPreferences() {
  return renderHook(() => usePreferences(), {
    wrapper: ({ children }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    ),
  });
}

//a fake OS switch we can flip during a test, it has to support
//addEventListener/removeEventListener, because the provider now
//subscribes to the OS setting instead of reading it once
function stubOsReducedMotion(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();

  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) =>
      listeners.delete(listener),
  }));

  return {
    set(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

function readStored() {
  return JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{}");
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
    expect(result.current.spriteMode).toBe("pixel");
  });

  it("no longer exposes any sound setting", () => {
    const { result } = renderPreferences();

    expect(result.current).not.toHaveProperty("soundEnabled");
    expect(result.current).not.toHaveProperty("setSoundEnabled");
  });

  it("choosing 'off' updates state and the html attribute", () => {
    const { result } = renderPreferences();

    act(() => {
      result.current.setAnimations("off");
    });

    expect(result.current.animations).toBe("off");
    expect(result.current.animationsEnabled).toBe(false);
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("persists preferences to localStorage", () => {
    const { result } = renderPreferences();

    act(() => {
      result.current.setSpriteMode("artwork");
    });

    expect(readStored().spriteMode).toBe("artwork");
  });

  it("stores the choice 'auto', never the OS answer it resolved to", () => {
    stubOsReducedMotion(true);

    renderPreferences();

    expect(readStored()).toEqual({ animations: "auto", spriteMode: "pixel" });
  });

  it("on 'auto', follows the OS setting", () => {
    stubOsReducedMotion(true);

    const { result } = renderPreferences();

    expect(result.current.animationsEnabled).toBe(false);
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("on 'auto', follows the OS setting when it changes while the app is open", () => {
    const os = stubOsReducedMotion(false);
    const { result } = renderPreferences();
    expect(result.current.animationsEnabled).toBe(true);

    act(() => {
      os.set(true);
    });

    expect(result.current.animationsEnabled).toBe(false);
    expect(document.documentElement.dataset.motion).toBe("reduced");
  });

  it("an explicit 'on' wins over the OS setting", () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ animations: "on", spriteMode: "pixel" }),
    );
    stubOsReducedMotion(true);

    const { result } = renderPreferences();

    expect(result.current.animationsEnabled).toBe(true);
    expect(document.documentElement.dataset.motion).toBe("on");
  });

  it("migrates an old saved shape and rewrites it in the new shape", () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        animationsEnabled: false,
        soundEnabled: true,
        spriteMode: "artwork",
      }),
    );

    const { result } = renderPreferences();

    expect(result.current.animations).toBe("off");
    expect(readStored()).toEqual({ animations: "off", spriteMode: "artwork" });
  });

  it("throws when used outside a PreferencesProvider", () => {
    expect(() => renderHook(() => usePreferences())).toThrow(
      "usePreferences must be used within a PreferencesProvider",
    );
  });
});
