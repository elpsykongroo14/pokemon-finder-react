# Pokémon Finder: Design Brief (R1)

> Status: draft for sign-off. Refines §3 of UI-REHAUL-ROADMAP.md with what
> the R0 references actually show.

## 1. Intent (in the owner's words)

> love the retro and nostalgic feeling that the nintendo ds era of the
> pokemon games bring up especially black and white / black2 and white2, it
> feels clean without trying too hard and the pixel art there is perfect. i
> collected here some of the sprites that i found were fitting for the
> aesthetic im aiming for with that DS-era games vibe. more ideas are always
> welcome on how to blend and marry it into the existing app during the ui
> redesign. goal is to make it nostalgic/retro but not make it too tryhard,
> same thing with the tcg page although i currently dont have much ideas how
> to implement the ds era games vibe with TCG.

## update: An idea for the TCG page

> In B/W, the PC holds Pokémon in boxes. Each box has a title tab and a themed wallpaper, and it's a grid of slots you page through with arrows.
> Our Library could borrow that as a layout metaphor: each set or Pokémon is a "box". The wallpaper tints from the Pokémon's type, which the theme engine gives us for free. The Binder view becomes "Box 1/12 ◀ ▶", and Grid is the box contents.
> This is a metaphor, not console-frame art, so it doesn't conflict with D9.
> For the card modal we copy pkmn.gg's structure, with card on the left and info on the right.

## 2. North star

Opening the app should feel like flipping open a DS and turning on a
Pokédex: bright, chunky-but-clean, alive, and a little bit playful like the ds era pokemon games, think of black and white or black and white 2. maybe a fun pokemon related pixel animation?

## 3. Traits extracted from the references

| #   | Trait                                                                | Becomes                                         |
| --- | -------------------------------------------------------------------- | ----------------------------------------------- |
| T1  | Dark frame, light data window                                        | `--surface-frame` / `--surface-window`          |
| T2  | Thin, crisp, bright outlines                                         | `--border-line`                                 |
| T3  | Angled shapes, used sparingly                                        | One notch shape: Window, StatMeter, Button only |
| T4  | Small solid type chips                                               | TypeBadge: solid fill + `--type-x-ink` text     |
| T5  | Whole-screen color themes                                            | Type-reactive theme engine                      |
| T6  | HP-style meters with tier colors                                     | StatMeter                                       |
| T7  | Warm selection color against cool chrome                             | `--accent-select`                               |
| P1  | (pkmn.gg) Restraint: neutrals plus one loud accent per screen        | One-accent-per-screen rule                      |
| P2  | (pkmn.gg) Sprite tiles, generation pills, card-left/info-right modal | Library structure                               |

Rule of thumb: **DS decides how the chrome and data look; pkmn.gg decides
how much of it there is and where it goes. fall back to reference pictures that were provided from the old pokemon games for an idea of what to make it look like, put effort into making it look good and put together**

## 4. Decisions

- D1: Integration branch `ui/rehaul` + preview deploys.
- D2: One theme axis (the Pokémon's type). Light/dark deferred to R12.
- D9: No console shell / fake frame around the UI (backlog skin only).
- D12 (proposed): Retire "no glow, no color bloom". New rule: glow or
  gradient only when it carries type or state information. Confirm in R1.
- D13 (open): Chrome direction. A = roadmap navy/cobalt, thick outlines.
  B = B/W-style slate + teal, thin crisp lines, subtle gloss. Leaning B.
  Decide in R1 Part 2 with swatches.

  answer for | D13 | Chrome direction | A (navy/cobalt) / B (slate/teal) | B, with gold retained as the selection accent | R1 | B — slate/teal chrome, gold selection |

## 6. Anti-goals (unchanged from roadmap §3)

No generic soft-shadow card grid, no decorative gradients, no motion that
blocks the user, no DS-shell chrome, no new libraries without a reason.
