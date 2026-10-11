import { describe, it, expect } from "vitest";
import { getSpriteUrl, integerScale, resolveSprite } from "./sprites";
import type { PokemonSprites } from "./sprites";

describe("getSpriteUrl", () => {
  it("returns official artwork when it exists", () => {
    const sprites = {
      front_default: "basic.png",
      other: {
        "official-artwork": { front_default: "artwork.png" },
      },
    };
    expect(getSpriteUrl(sprites)).toBe("artwork.png");
  });
  it("falls back to basic sprite when official artwork is not available", () => {
    const sprites = { front_default: "basic.png", other: {} };
    expect(getSpriteUrl(sprites)).toBe("basic.png");
  });

  it("returns null when nothing is available", () => {
    expect(getSpriteUrl({})).toBeNull();
  });

  it("returns the shiny artwork when shiny is requested", () => {
    const sprites = {
      front_shiny: "basic-shiny.png",
      other: { "official-artwork": { front_shiny: "artwork-shiny.png" } },
    };
    expect(getSpriteUrl(sprites, { shiny: true })).toBe("artwork-shiny.png");
  });

  it("falls back to the basic shiny sprite when shiny artwork is missing", () => {
    const sprites = { front_shiny: "basic-shiny.png", other: {} };
    expect(getSpriteUrl(sprites, { shiny: true })).toBe("basic-shiny.png");
  });
});

const full: PokemonSprites = {
  front_default: "p.png",
  front_shiny: "p-s.png",
  other: {
    "official-artwork": { front_default: "art.png", front_shiny: "art-s.png" },
  },
  versions: {
    "generation-v": {
      "black-white": {
        animated: { front_default: "a.gif", front_shiny: "a-s.gif" },
      },
    },
  },
};

describe("resolveSprite", () => {
  it("pixel mode prefers the animated Gen v sprite", () => {
    expect(resolveSprite(full)).toEqual({ url: "a.gif", kind: "animated" });
  });

  it("pixel mode falls back to the static pixel sprite when nothing is animated", () => {
    const noAnimated: PokemonSprites = {
      front_default: "p.png",
      other: full.other,
    };
    expect(resolveSprite(noAnimated)).toEqual({ url: "p.png", kind: "pixel" });
  });

  it("pixel mode falls back to artwork when there is no pixel sprite at all", () => {
    expect(resolveSprite({ other: full.other })).toEqual({
      url: "art.png",
      kind: "artwork",
    });
  });

  it("artwork mode prefers the artwork", () => {
    expect(resolveSprite(full, { mode: "artwork" })).toEqual({
      url: "art.png",
      kind: "artwork",
    });
  });

  it("artwork mode falls back to the static pixel sprite, never the animated one", () => {
    const sprites: PokemonSprites = {
      front_default: "p.png",
      versions: full.versions,
    };
    expect(resolveSprite(sprites, { mode: "artwork" })).toEqual({
      url: "p.png",
      kind: "pixel",
    });
  });

  it("uses the shiny frame at every step of the chain", () => {
    expect(resolveSprite(full, { shiny: true })).toEqual({
      url: "a-s.gif",
      kind: "animated",
    });
    expect(resolveSprite(full, { shiny: true, mode: "artwork" })).toEqual({
      url: "art-s.png",
      kind: "artwork",
    });
  });

  it("never returns a normal-colored sprite when shiny was requested", () => {
    expect(
      resolveSprite({ front_default: "p.png" }, { shiny: true }),
    ).toBeNull();
  });

  it("treats empty string and nulls as missing", () => {
    expect(
      resolveSprite({
        front_default: "",
        other: { "official-artwork": { front_default: null } },
      }),
    ).toBeNull();
  });

  it("returns null when nothing is available", () => {
    expect(resolveSprite({})).toBeNull();
  });
});

describe("resolveSprite with animation switched off", () => {
  it("skips the animated sprite uses the static pixel one", () => {
    expect(resolveSprite(full, { animate: false })).toEqual({
      url: "p.png",
      kind: "pixel",
    });
  });

  it("still reaches artwork when nothing static exists either", () => {
    const sprites: PokemonSprites = {
      other: full.other,
      versions: full.versions,
    };
    expect(resolveSprite(sprites, { animate: false })).toEqual({
      url: "art.png",
      kind: "artwork",
    });
  });
});

describe("integerScale", () => {
  it("returns the largest whole multiplier that fits", () => {
    expect(integerScale({ width: 96, height: 96 }, 300)).toBe(3);
  });

  it("is limited by the longest side", () => {
    expect(integerScale({ width: 50, height: 100 }, 250)).toBe(2);
  });

  it("never goes below 1, even when the image is bigger than the box", () => {
    expect(integerScale({ width: 475, height: 475 }, 180)).toBe(1);
  });

  it("returns 1 when the size is unknown (0 or NAN)", () => {
    expect(integerScale({ width: 0, height: 0 }, 180)).toBe(1);
    expect(integerScale({ width: NaN, height: NaN }, 180)).toBe(1);
  });
});
