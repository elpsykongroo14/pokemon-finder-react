/// <reference types="node" />
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TYPE_CHART } from "../lib/typeEffectiveness";

//vitest does not hand back CSS text from an import (it stubs CSS out),
//so the test reads the file from disk instead
const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "type-themes.css"),
  "utf8",
);

const TYPES = Object.keys(TYPE_CHART);

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
});
