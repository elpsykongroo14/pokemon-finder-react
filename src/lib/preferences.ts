//pure rules for the person's settings: wwhat shape they have, how to read
//them back from the disk safely, and what an animation choice means right now
//no react in here so every rule can be tested in plain vitest

import type { SpriteMode } from "./sprites";

//the "auto" means "follow my operating system", and it is a choice in its own
//right, not the abscemce of one. storing it (instead of storing the OS answer
//we saw on the first visit) is what lets the app follow the OS when it changes
export type AnimationMode = "auto" | "on" | "off";

export interface Preferences {
  animations: AnimationMode;
  spriteMode: SpriteMode;
}

export const PREFERENCES_KEY = "pokemon_preferences";

export const DEFAULT_PREFERENCES: Preferences = {
  animations: "auto",
  spriteMode: "pixel",
};

const ANIMATION_MODES: readonly AnimationMode[] = ["auto", "on", "off"];
const SPRITE_MODES: readonly SpriteMode[] = ["pixel", "artwork"];

//turns the stored choice into the one yes/no answer the rest of the app needs
//an explicit "on" or "off" winds over the OS; only "auto" asks the OS
export function resolveAnimations(
  mode: AnimationMode,
  osPrefersReducedMotion: boolean,
): boolean {
  if (mode === "on") return true;
  if (mode === "off") return false;
  return !osPrefersReducedMotion;
}

//the typeof null and typeof [] are both "object", so both get excluded explicitly
//(same guard as teamMember.ts; a third copy is the moment to share it)
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//"includes" on a readonly array of a literal type only accepts that type
//so we widen the array to unknown[] for the check and narrow back with "is"
function isAnimationMode(value: unknown): value is AnimationMode {
  return (ANIMATION_MODES as readonly unknown[]).includes(value);
}

function isSpriteMode(value: unknown): value is SpriteMode {
  return (SPRITE_MODES as readonly unknown[]).includes(value);
}

//before the app saved {animationsEnabled: boolean, soundEnabled, spriteMode}.
//false can only have meant "no anomations", so it becomes "off". true was
//usually just the default app saved by itself on the first visit, so it
//becomes "auto" (which gives the same answer for almosy everyone)
function migrateLegacyAnimations(legacy: unknown): AnimationMode | null {
  if (legacy === false) return "off";
  if (legacy === true) return "auto";
  return null;
}

//read direction: untrusted text in, trusted Preferences out. every field is
//checked on its own, so one bad field falls back alone instead of taking the
//other settings down with it. unknown keys (like the old soundEnabled) are
//dropped simply because we build a fresh object instead of spreading the input
export function parseStoredPreferences(stored: string | null): Preferences {
  if (stored == null) return DEFAULT_PREFERENCES;

  let data: unknown;
  try {
    data = JSON.parse(stored);
  } catch {
    return DEFAULT_PREFERENCES;
  }
  if (!isRecord(data)) return DEFAULT_PREFERENCES;

  const animations = isAnimationMode(data.animations)
    ? data.animations
    : (migrateLegacyAnimations(data.animationsEnabled) ??
      DEFAULT_PREFERENCES.animations);

  const spriteMode = isSpriteMode(data.spriteMode)
    ? data.spriteMode
    : DEFAULT_PREFERENCES.spriteMode;

  return { animations, spriteMode };
}
