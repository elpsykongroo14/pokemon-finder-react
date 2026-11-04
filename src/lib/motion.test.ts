import { describe, it, expect, afterEach, vi } from "vitest";
import { animationsAreOff } from "./motion";

function stubOsReducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", () => ({ matches: reduce }));
}

describe("animationsAreOff", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.motion;
  });

  it("the app's setting 'reduced' wins, even if the OS allows motion", () => {
    stubOsReducedMotion(false);
    document.documentElement.dataset.motion = "reduced";
    expect(animationsAreOff()).toBe(true);
  });

  it("the app's setting 'on' wins, even if the OS asks for less motion", () => {
    stubOsReducedMotion(true);
    document.documentElement.dataset.motion = "on";
    expect(animationsAreOff()).toBe(false);
  });

  it("with no app setting yet, the OS decides", () => {
    stubOsReducedMotion(true);
    expect(animationsAreOff()).toBe(true);

    stubOsReducedMotion(false);
    expect(animationsAreOff()).toBe(false);
  });

  it("without matchMedia (jsdom) animations count as allowed", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(animationsAreOff()).toBe(false);
  });
});
