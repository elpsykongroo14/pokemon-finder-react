// @vitest-environment node
/// <reference types="node" />
//reads files, renders nothing, so it does not need jsdom

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TYPE_CHART } from "../lib/typeEffectiveness";
import { contrastRatio } from "../lib/contrast";

//the Black & White base (D41) rebinds every text role. this test reads the
//same files the browser does and checks each text/background pair the
//redesign creates, the way type-themes.test.ts checks the type palette.
//a later edit that, say, lightens Graphite fails here instead of in a
//screenshot nobody takes

const here = dirname(fileURLToPath(import.meta.url));
const read = (file: string) => readFileSync(join(here, file), "utf8");

const primitives = read("primitives.css");
const semantic = read("semantic.css");
const themes = read("type-themes.css");

//the declarations inside one "selector { ... }" block. the token files
//never nest braces, so "up to the first }" is the whole block
function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No "${selector}" block`);
  return css.slice(start, css.indexOf("}", start));
}

//follows --a: var(--b) chains until it reaches a hex color. a scoped
//block (.on-dark) is searched first, then :root of each token file,
//which is the same order the cascade resolves them in
function resolveHex(name: string, scope = ""): string {
  const sources = [
    scope,
    block(semantic, ":root"),
    themes,
    block(primitives, ":root"),
  ];

  for (const source of sources) {
    const direct = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(source);
    if (direct?.[1]) return direct[1];

    const alias = new RegExp(`--${name}:\\s*var\\(--([a-z0-9-]+)\\)`).exec(
      source,
    );
    if (alias?.[1]) return resolveHex(alias[1], scope);
  }
  throw new Error(`Could not resolve --${name} to a hex color`);
}

//WCAG AA: 4.5:1 for normal text, 3:1 for UI component boundaries
const AA_TEXT = 4.5;
const AA_UI = 3;

describe("the white base (D41)", () => {
  it.each([
    ["text-primary", "surface-frame"],
    ["text-secondary", "surface-frame"],
    ["text-primary", "surface-well"],
    ["text-secondary", "surface-well"],
    ["text-danger", "surface-frame"],
    ["text-success", "surface-frame"],
  ])("--%s is readable on --%s", (text, background) => {
    expect(
      contrastRatio(resolveHex(text), resolveHex(background)),
    ).toBeGreaterThanOrEqual(AA_TEXT);
  });

  //the spec says 8.6:1; measured, #4A4E57 on white is 8.34:1. the claim was
  //rounded wrong, the color is fine: it clears AAA (7:1), which is what
  //lets secondary text go down to 13px without a second thought
  it("keeps secondary text at AAA contrast on Paper", () => {
    expect(
      contrastRatio(resolveHex("text-secondary"), resolveHex("surface-frame")),
    ).toBeGreaterThanOrEqual(7);
  });

  it("draws the focus ring in a color that stands out from its halo", () => {
    expect(
      contrastRatio(resolveHex("focus-ring"), resolveHex("focus-halo")),
    ).toBeGreaterThanOrEqual(AA_UI);
  });
});

describe(".on-dark (black plates)", () => {
  const onDark = block(semantic, ".on-dark");

  it.each([
    "text-primary",
    "text-secondary",
    "text-tertiary",
    "text-danger",
    "text-success",
  ])("--%s is readable on Ink", (text) => {
    expect(
      contrastRatio(resolveHex(text, onDark), resolveHex("surface-ink")),
    ).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("swaps the focus ring so it still shows on black", () => {
    expect(
      contrastRatio(
        resolveHex("focus-ring", onDark),
        resolveHex("surface-ink"),
      ),
    ).toBeGreaterThanOrEqual(AA_UI);
  });
});

//B&W-5: a white surface that can open INSIDE a black plate (the
//autocomplete panel under Compare's pickers). it must win back every role
//.on-dark flipped, or its text would be white on white
describe(".on-light (white islands on a black plate)", () => {
  const onLight = block(semantic, ".on-light");

  it.each(["text-primary", "text-secondary", "text-danger", "text-success"])(
    "--%s is readable on Paper",
    (text) => {
      expect(
        contrastRatio(resolveHex(text, onLight), resolveHex("surface-paper")),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it("puts back the Ink focus ring and rules", () => {
    expect(
      contrastRatio(
        resolveHex("focus-ring", onLight),
        resolveHex("surface-paper"),
      ),
    ).toBeGreaterThanOrEqual(AA_UI);
    expect(
      contrastRatio(
        resolveHex("border-line", onLight),
        resolveHex("surface-paper"),
      ),
    ).toBeGreaterThanOrEqual(AA_UI);
  });

  //every role .on-dark changes, .on-light changes back
  it("resets every role that .on-dark flips", () => {
    const flipped = [
      ...block(semantic, ".on-dark").matchAll(/(--[a-z0-9-]+):/g),
    ].map((m) => m[1]);
    const reset = [...onLight.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]);

    expect(reset).toEqual(expect.arrayContaining(flipped));
  });
});

describe("the field and its plate", () => {
  //"No. 635" is drawn in the theme's soft tint on the black name plate
  it.each(Object.keys(TYPE_CHART))(
    "%s: the dex number is readable on the black plate",
    (type) => {
      expect(
        contrastRatio(resolveHex(`type-${type}-soft`), resolveHex("ink")),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it("the no-Pokémon theme keeps its text readable on the Graphite sky", () => {
    expect(
      contrastRatio(resolveHex("theme-accent-ink"), resolveHex("theme-accent")),
    ).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

//B&W-8, the contrast pass (spec 10, B&W-8): every pair the Team and
//Library slices added. a mark is text, so its words need 4.5:1 on its own
//fill; a ring or an outline is a UI boundary, 3:1
describe("the rarity tier marks (B&W-7)", () => {
  it.each(["common", "rare", "holo"])(
    "the %s mark's words are readable on its fill",
    (tier) => {
      expect(
        contrastRatio(
          resolveHex(`tier-${tier}-ink`),
          resolveHex(`tier-${tier}-fill`),
        ),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  //the ultra fill is a gradient through four foil colors: the Ink words
  //must read on every one of them, wherever the word happens to sit
  it.each(["foil-pink", "foil-yellow", "foil-mint", "foil-blue"])(
    "the ultra mark's words are readable on %s",
    (stop) => {
      expect(
        contrastRatio(resolveHex("tier-ultra-ink"), resolveHex(stop)),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  //a holo mark is Ink: on a black plate its ring turns white to exist
  it("keeps the holo mark's ring visible on a black plate", () => {
    expect(
      contrastRatio(
        resolveHex("tier-holo-ring", block(semantic, ".on-dark")),
        resolveHex("surface-ink"),
      ),
    ).toBeGreaterThanOrEqual(AA_UI);
  });
});

describe("the binder (B&W-7)", () => {
  it("writes its closing line readably on the page grey", () => {
    expect(
      contrastRatio(
        resolveHex("text-end-note"),
        resolveHex("surface-binder-page"),
      ),
    ).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it("draws its rings so they show on the black binder", () => {
    expect(
      contrastRatio(resolveHex("binder-ring"), resolveHex("surface-ink")),
    ).toBeGreaterThanOrEqual(AA_UI);
  });
});

describe("the card dialog's black stage (B&W-7)", () => {
  //the scrim is 92 % black over the page: over white that is #141414, the
  //lightest the stage can get, so it is the case to check
  const STAGE = "#141414";

  it.each(["text-primary", "text-secondary", "text-tertiary"])(
    "--%s is readable on the stage",
    (text) => {
      expect(
        contrastRatio(resolveHex(text, block(semantic, ".on-dark")), STAGE),
      ).toBeGreaterThanOrEqual(AA_TEXT);
    },
  );

  it("outlines the keyboard hint's keys visibly", () => {
    expect(
      contrastRatio(resolveHex("border-key"), STAGE),
    ).toBeGreaterThanOrEqual(AA_UI);
  });
});
