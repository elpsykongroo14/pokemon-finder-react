//pure helper file for picking a sprite url out of a pokeAPI `sprites` object.
//no network calls or DOM access, just one rule defined once:
//prefer the official artwork, if it isnt available then fall back to the basic default sprite

export interface PokemonSprites {
  front_default?: string | null;
  front_shiny?: string | null;
  other?: {
    "official-artwork"?: {
      front_default?: string | null;
      front_shiny?: string | null;
    };
  };
}

export interface SpriteFrames {
  front_default?: string | null;
  front_shiny?: string | null;
}

export interface PokemonSprites extends SpriteFrames {
  other?: {
    "official-artwork"?: SpriteFrames;
  };
  versions?: {
    "generation-v"?: {
      "black-white"?: {
        animated?: SpriteFrames;
      };
    };
  };
}

interface SpriteOptions {
  shiny?: boolean;
}

export function getSpriteUrl(
  sprites: PokemonSprites,
  { shiny = false }: SpriteOptions = {},
): string | null {
  const artwork = sprites.other?.["official-artwork"];

  if (shiny) {
    return artwork?.front_shiny || sprites.front_shiny || null;
  }
  return artwork?.front_default || sprites.front_default || null;
}
//{shiny = false}: SpritesOptions = {}, is an options object called instead of plain getSpriteUrl(sprites, true)

export type SpriteKind = "animated" | "pixel" | "artwork";
export type SpriteMode = "pixel" | "artwork";

export interface ResolvedSprite {
  url: string;
  kind: SpriteKind;
}

function pickFrame(frames: SpriteFrames | undefined, shiny: boolean) {
  return (shiny ? frames?.front_shiny : frames?.front_default) || null;
}

export function resolveSprite(
  sprites: PokemonSprites,
  {
    shiny = false,
    mode = "pixel",
    animate = true,
  }: { shiny?: boolean; mode?: SpriteMode; animate?: boolean } = {},
): ResolvedSprite | null {
  const animated = pickFrame(
    sprites.versions?.["generation-v"]?.["black-white"]?.animated,
    shiny,
  );
  const pixel = pickFrame(sprites, shiny);
  const artwork = pickFrame(sprites.other?.["official-artwork"], shiny);

  const chain: Array<[SpriteKind, string | null]> =
    mode === "pixel"
      ? [
          ["animated", animate ? animated : null],
          ["pixel", pixel],
          ["artwork", artwork],
        ]
      : [
          ["artwork", artwork],
          ["pixel", pixel],
        ];

  for (const [kind, url] of chain) {
    if (url) return { url, kind };
  }

  return null;
}

//pixel art only stays crisp when scaled by a whole number (2x, 3x, never 2.5x)
//returns the biggest whole number multiplier that still fits the longest side inside the box
export function integerScale(
  natural: { width: number; height: number },
  box: number,
): number {
  const longest = Math.max(natural.width, natural.height);
  if (!(longest > 0)) return 1;
  return Math.max(1, Math.floor(box / longest));
}
