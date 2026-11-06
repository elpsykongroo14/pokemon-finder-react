import { describe, it, expect } from "vitest";
import {
  DEFAULT_PREFERENCES,
  parseStoredPreferences,
  resolveAnimations,
} from "./preferences";

describe("resolveAnimations", () => {
  it("'on' wins even when the OS asks for reduced motion", () => {
    expect(resolveAnimations("on", true)).toBe(true);
  });

  it("'off' wins even when the OS allows motion", () => {
    expect(resolveAnimations("off", false)).toBe(false);
  });

  it("'auto' follows the OS in both direction", () => {
    expect(resolveAnimations("auto", false)).toBe(true);
    expect(resolveAnimations("auto", true)).toBe(false);
  });
});

describe("parseStoredPreferences", () => {
  it("returns the defaults when nothing is stored", () => {
    expect(parseStoredPreferences(null)).toEqual(DEFAULT_PREFERENCES);
  });

  it("returns the defaults for text that is not JSON", () => {
    expect(parseStoredPreferences("{oops")).toEqual(DEFAULT_PREFERENCES);
  });

  it("returns the defaults for JSON that is not an object", () => {
    expect(parseStoredPreferences("[]")).toEqual(DEFAULT_PREFERENCES);
    expect(parseStoredPreferences("null")).toEqual(DEFAULT_PREFERENCES);
    expect(parseStoredPreferences("on")).toEqual(DEFAULT_PREFERENCES);
  });

  it("keeps a valid saved shape as it is", () => {
    const stored = JSON.stringify({ animations: "off", spriteMode: "artwork" });
    expect(parseStoredPreferences(stored)).toEqual({
      animations: "off",
      spriteMode: "artwork",
    });
  });

  it("falls back field by field, so one bad field does not reset others", () => {
    const stored = JSON.stringify({
      animations: "sideways",
      spriteMode: "artwork",
    });
    expect(parseStoredPreferences(stored)).toEqual({
      animations: "auto",
      spriteMode: "artwork",
    });
  });

  it("migrates the old animationsEnabled: false to 'off'", () => {
    const stored = JSON.stringify({
      animationsEnabled: false,
      soundEnabled: true,
      spriteMode: "pixel",
    });
    expect(parseStoredPreferences(stored)).toEqual({
      animations: "off",
      spriteMode: "pixel",
    });
  });

  it("migrates the old animationsEnabled: true to 'auto'", () => {
    const stored = JSON.stringify({
      animationsEnabled: true,
      soundEnabled: true,
      spriteMode: "artwork",
    });
    expect(parseStoredPreferences(stored)).toEqual({
      animations: "auto",
      spriteMode: "artwork",
    });
  });

  it("drops keys the app no longer knows (the old soundenabled)", () => {
    const stored = JSON.stringify({
      animations: "on",
      soundEnabled: true,
      spriteMode: "pixel",
    });
    expect(parseStoredPreferences(stored)).not.toHaveProperty("soundEnabled");
  });

  it("prefers the new field when both the new and the old one exist", () => {
    const stored = JSON.stringify({
      animations: "on",
      animationsEnabled: false,
      spriteMode: "pixel",
    });
    expect(parseStoredPreferences(stored).animations).toBe("on");
  });
});
