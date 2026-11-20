/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TYPE_CHART } from "../lib/typeEffectiveness";
import { contrastRatio } from "../lib/contrast";

const primitives = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "primitives.css"),
  "utf-8",
);

//vitest does not hand back CSS text from an import (it stubs CSS out),
//so the test reads the file from disk instead
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "type-themes.css"),
  "utf8",
);

const TYPES = Object.keys(TYPE_CHART);

//finds "--name: #hex" (or "--name: var(--other)", following the chain)
//in the two palette files, so the test reads the SAME values the browser does
function resolveHex(name: string): string {
  const all = `${css}\n${primitives}`;
  const direct = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(all);
  if (direct?.[1]) return direct[1];

  const alias = new RegExp(`--${name}:\\s*var\\(--([a-z0-9-]+)\\)`).exec(all);
  if (alias?.[1]) return resolveHex(alias[1]);

  throw new Error(`Could not resolve --${name} to a hex color`);
}

//WCAG AA for normal-size text
const AA = 4.5;

describe("type-themes.css", () => {
  it.each(TYPES)("%s has a primary and a secondary theme block", (type) => {
    expect(css).toContain(`[data-type="${type}"]`);
    expect(css).toContain(`[data-type2="${type}"]`);
  });

  it("every secondary block sets both secondary variables", () => {
    const blocks = css.match(/\[data-type2="[a-z]+"\]\s*\{[^}]*\}/g) ?? [];

    expect(blocks).toHaveLength(TYPES.length);
    for (const block of blocks) {
      expect(block).toContain("--theme-accent-2:");
      expect(block).toContain("--theme-accent-2-deep:");
    }
  });

  it("puts the secondary blocks after the primary ones, so they win the cascade", () => {
    const lastPrimary = css.lastIndexOf('[data-type="');
    const firstSecondary = css.indexOf('[data-type2="');

    expect(firstSecondary).toBeGreaterThan(lastPrimary);
  });

  it("defaults the secondary accent to the primary one", () => {
    expect(css).toContain("--theme-accent-2: var(--theme-accent);");
    expect(css).toContain("--theme-accent-2-deep: var(--theme-accent-deep);");
  });

  //text on the soft tint (panels, versus halves) must be readable for every type
  //this is the check that was missing when the light "ink" of five types
  //(fighting, poison, ghost, drafon, dark) landed on a light tint ar under 2:1
  it.each(TYPES)("%s: soft-tint text is readable on its soft tint", (type) => {
    const text = resolveHex("theme-soft-ink");
    const background = resolveHex(`type-${type}-soft`);

    expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(AA);
  });

  //the original contrast of the ink token: readable on the accent color (badges)
  it.each(TYPES)("%s: ink is readable on its accent color", (type) => {
    const ink = resolveHex(`type-${type}-ink`);
    const accent = resolveHex(`type-${type}`);

    expect(contrastRatio(ink, accent)).toBeGreaterThanOrEqual(AA);
  });
});
