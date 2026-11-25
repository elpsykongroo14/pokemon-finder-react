# Black & White redesign: implementation spec

This folder describes the visual redesign of Pokémon Finder that was approved on the design canvas. It is a **re-skin plus a handful of new interactions**. It does not change data flow, routing, state management or the test contract in `docs/UI-REHAUL-ROADMAP.md` §8.3.

What is in this folder:

| Path | What it is |
| --- | --- |
| `SPEC.md` | This document. The source of truth for decisions and behavior. |
| `screens/*.jpg` | Renders of every approved screen at 1440 px and 390 px, plus interaction states. Look at them before building a screen. `BEFORE-*` shows the current app. |
| `reference/*.dc.html` | The prototype source of each screen. Use it to read **exact CSS values, markup structure and copy**. It is not React and not meant to be copied wholesale. The `{{holes}}`, `<sc-for>` and `<sc-if>` are a prototype template syntax, and the `class Component extends DCLogic` block at the bottom is prototype logic with hard-coded data. |

Where this spec and the reference files disagree, **this spec wins**. Where the spec is silent, read the reference file.

---

## 1. The idea in one paragraph

The interface itself is only black and white, a nod to Pokémon Black & White. **All color comes from the Pokémon on screen** (or the card in your hand), through the existing type-theme engine (`useTypeTheme` → `data-type` / `data-type2` on `<html>` → `--theme-*` variables). Every Pokémon stands in an "encounter field": a sky in its primary type color, a darker ground with a horizon, slanted stripes in its second type, and an elliptical battle platform under the sprite. A black, slanted name plate carries its identity, like the HP boxes in a DS battle. Exactly one animation plays on its own (the encounter, once per new Pokémon). Everything else moves only in answer to something the user did.

## 2. Constraints (non-negotiable)

1. **Keep the architecture.** Cascade layers (`src/styles/layers.css`), the three token tiers (primitives → semantic → component), the type-theme engine, the `src/ui/` primitives and the component split all stay. This is a rebinding of tokens and a rewrite of component CSS, not a new system.
2. **Keep the test contract.** Roles, accessible names, visible strings that tests query, `aria-pressed` states, the sprite `alt` convention and the class contract in roadmap §8.3 (`.stat-row`, `.stat-row--highest`, `.stat-bar-fill`, `.stat-win`, `.stat-lose`, `.compare-stat-row`, `.tcg-card`, `.team-slot`, `.team-slot--empty`, `.team-slot--filled`, `.active`) must survive. Add new classes alongside them. If a test must change, change it in the same commit and say why.
3. **No sound** (decision D28). Do not add any.
4. **Motion is gated twice.** Everything respects `prefers-reduced-motion` *and* the app's own animation preference (`data-motion` on `<html>`, the `--dur-*` tokens in `src/styles/motion.css`, and the motion-gate CI guard). With motion off, colors swap in place and nothing moves. No content may be hidden by an animation's initial state unless that animation is guaranteed to run (roadmap §8.4).
5. **Accessibility floor:** visible keyboard focus on everything, 44 px minimum touch targets, text contrast at least 4.5:1 (3:1 for 24 px and up), never color alone for meaning.
6. **No new runtime dependencies** except the font package in §4.2.
7. **Budgets:** no layout-affecting animations except where unavoidable. Stat fills use `transform: scaleX`. The binder page turn and card flip use transforms only.
8. **Decision D9 still holds:** no fake console frame around the UI.

## 3. Bug to fix along the way

`src/lib/tcg.ts` → `RARITY_RANK` has no entry for **"Double Rare"**, **"Rare BREAK"** or **"Promo"**. Those cards currently fall through to rank 0, so a Double Rare ex is treated as Common (no holo, sorted last). Add:

```ts
"Double Rare": 4,   // tier "holo"
"Rare BREAK": 4,    // tier "holo"
Promo: 2,           // tier "rare"
```

Write the failing tests first (`getRarityTier("Double Rare") === "holo"`, and so on).

---

## 4. Design language

### 4.1 Color

Five neutrals. Everything else is a type color that already exists in `primitives.css` / `type-themes.css`, unchanged.

| Name | Hex | Role |
| --- | --- | --- |
| Ink | `#000000` | Text, plates, primary buttons, rules |
| Paper | `#FFFFFF` | Page background |
| Mist | `#ECEEF1` | Inputs, stat tracks, hover fills, empty slots |
| Line | `#C9CDD4` | Hairlines, inactive pips, the losing side of a comparison |
| Graphite | `#4A4E57` | Secondary text (8.6:1 on Paper) |

On black surfaces, secondary text is `#D8DBE0` and tertiary is `#A3A8B3`.

**Semantic rebinding (`semantic.css`).** The page is no longer a dark slate frame. Rebind the existing roles rather than inventing parallel ones:

- `--surface-frame` → Paper, `--surface-chrome` → Paper (the header is white, with a 2 px Ink bottom rule)
- `--text-primary` → Ink, `--text-secondary` → Graphite
- `--surface-well` → Mist, `--border-hairline` → Line, `--border-line` → Ink
- `--focus-ring` → Ink (white on dark surfaces, see §4.5)
- Add a scoped `.on-dark` override (the same pattern as the existing `.surface-window`) for black plates: text `#FFFFFF`, secondary `#D8DBE0`, focus ring white.
- The slate, teal and gold primitives become unused. Delete them only once nothing references them; the token guardrail test will tell you.

**How the type theme paints a field** (existing variables, new usage):

| Field part | Value |
| --- | --- |
| Sky | `--theme-accent` |
| Ground | the sky, overlaid with `rgba(0,0,0,.16)`, lower 31 % of the field (44 % on Home), with a 3 px `rgba(0,0,0,.18)` horizon line |
| Stripes, dual type | `--theme-accent-2`, opacity 1 |
| Stripes, single type | `--theme-accent-soft`, opacity .5 |
| Dex number on the black plate | `--theme-accent-soft` |
| Stat fills, base-stat-total bar | `--theme-accent` |

`--theme-accent-2` currently falls back to `--theme-accent` when there is no second type, so the single-type rule needs a selector such as `:root:not([data-type2])`.

**No Pokémon in focus** (empty Compare, loading, error, 404, and Library without a name): sky Graphite `#4A4E57`, stripes Mist at .35.

### 4.2 Type

Replace Nunito with **Archivo** (variable, with the width axis): `@fontsource-variable/archivo`, importing `standard.css` and `standard-italic.css` (weight 100–900, width 62–125 %). Keep `@fontsource/jersey-10`. Remove `@fontsource-variable/nunito`. Measure the bundle change and note it in the DEVLOG.

| Role | Spec |
| --- | --- |
| Display (Pokémon names, page titles) | Archivo 900 italic, `font-stretch: 125%`, letter-spacing −0.02em, line-height .92–.95. Pokémon page 68 px, Library and Team titles 60 px, Compare 46 px, team cards 27 px, phone 36–40 px |
| Section heading | Archivo 800, `font-stretch: 112%`, 22 px, line-height 1.2, with a 2 px Ink rule above it (16 px gap) |
| Era heading (Library) | Archivo 900 italic, `font-stretch: 118%`, 28 px |
| Body | Archivo 400–600, 16 px, line-height 1.5 |
| Labels and meta | Archivo 500–600, 13–15 px, Graphite |
| Buttons | Archivo 700, `font-stretch: 112%`, 16 px (15 px small) |
| Game text | **Jersey 10, only** for the battle dialog ("A wild ZOROARK appeared!") and dex numbers ("No. 635") |

Use `font-variant-numeric: tabular-nums` for stat values, card numbers and dates. No all-caps labels. The only uppercase is the Pokémon name inside the dialog sentence.

### 4.3 Shape: three rules

1. **Slant, 13°.** Anything that *is* the Pokémon or something you *do* with it leans: name plates, type chips, buttons, segmented controls, stat bars, party pips, rarity marks, nav highlight. **Skew a `::before` pseudo-element, never the element**, so text and icons stay upright and focus outlines stay sane:
   ```css
   .x{position:relative;isolation:isolate}
   .x::before{content:"";position:absolute;inset:0;z-index:-1;transform:skewX(-13deg);background:…}
   ```
   Stat tracks are the exception: they skew directly, because they hold no text.
2. **Square, 4 px corners.** Utilities stay calm: search inputs, selects, the settings button, autocomplete. They never lean.
3. **Ellipse.** Every sprite stands on a platform: an ellipse filled `rgba(255,255,255,.34)` with an inset `0 0 0 3px rgba(0,0,0,.16)` ring and an inner ellipse (`inset: 24% 18%`) at `rgba(255,255,255,.4)`, plus a `rgba(0,0,0,.22)` shadow ellipse just above its center.

Black plates use `clip-path` for their slanted edge: `polygon(132px 0, 100% 0, 100% 100%, 0 100%)` on desktop. On phones the edge moves to the top: `polygon(0 36px, 100% 0, 100% 100%, 0 100%)`.

### 4.4 Spacing and layout

Keep the 4 px grid tokens. Page gutters are 40 px at desktop and 20 px at phone width. Readable content maxes out at 1240 px (the Library is 1360 px). Breakpoint for the desktop-to-stacked switch: 1000 px (add a literal next to the existing 768 / 1024 ones, following decision D15).

### 4.5 Focus

`:focus-visible` gets a 3 px Ink outline, offset 3 px, with a 3 px Paper halo (`box-shadow: 0 0 0 3px #fff`). On `.on-dark` surfaces, swap the colors.

Slanted buttons draw their ring on a skewed `::after` instead: `inset: -6px; border: 3px solid currentRingColor`. Cards draw an outline around the card image, offset 4 px.

---

## 5. Components

Map these onto the existing primitives in `src/ui/` and components in `src/components/`. Restyle where they exist; add only what's missing.

### 5.1 App header (`Layout`, `MainNav`, `BrandMark`, `PartyCounter`, `SettingsButton`)

- White bar, minimum height 72 px, padding `12px 40px`, 2 px Ink bottom rule, `z-index` above page content.
- **Brand:** the mark (a 30 px disc with a 3 px Ink stroke, split on the 13° slant, one half black and one half white: see `MARK` in the reference) plus "Pokémon Finder" in Archivo 800, width 112 %, 20 px. On hover, the disc rotates 180° with a springy ease (`cubic-bezier(.3,1.6,.5,1)`, 500 ms).
- **Nav:** 40 px tall links, padding `0 16px`, weight 600. On hover, a Mist slanted plate wipes in from the left (`scaleX` 0→1, 180 ms). The current page gets a solid Ink slanted plate with white text. Keep `.active` and `aria-current`.
- **Search:** 44 px, Mist fill, 4 px radius, 2 px transparent border. On hover the border turns Line; on focus the field turns Paper with an Ink border. Placeholder: "Search by name or number". Autocomplete panel: white, 2 px Ink border, a hard `6px 6px 0 #000` shadow, rows of 48 px sprite + name + "No. 635" + small type chips, with Mist for the active row. Keep every existing combobox role and keyboard behavior.
- **Party counter:** the word "Party" plus six pips (10×18 px, slanted). An empty pip is white with a Line ring; a filled pip has an Ink ring and is **filled with that member's primary type color**. When a Pokémon joins, its pip plays the party-pop animation (§6.2). Accessible name: "Your team, 4 of 6".
- **Settings:** a 44 px icon button with a gear icon; the icon rotates 60° on hover.

### 5.2 Buttons (`src/ui/Button`)

Height 48 px (40 px small), padding `0 22px`, slanted `::before`, icon gap 10 px. Four variants:

| Variant | Rest | Hover |
| --- | --- | --- |
| `light` (on black) | white plate, Ink text | Ink plate, white text, 2 px white inset ring |
| `ghost` (on black) | 2 px white inset ring, white text | white plate, Ink text |
| `dark` (on white) | Ink plate, white text | white plate, Ink text, 2 px Ink inset ring |
| `line` (on white) | white plate, 2 px Ink ring | Ink plate, white text |

Pressed: the plate moves down 2 px. Disabled: 35 % opacity. Toggle buttons keep **one accessible name** and use `aria-pressed`; the visible label swaps ("Favorite" ↔ "Favorited", "Add to team" ↔ "On your team").

### 5.3 Segmented control (`SegmentedControl`, and the Pixel/Artwork and Shiny controls)

A slanted white plate with a 2 px Ink ring. Each option is 40 px tall (44 px on phones). Hover gives a Mist plate; the selected option gets an Ink plate with white text. Used for Pixel/Artwork, Shiny, and the Library's Grid/Table/Binder.

### 5.4 Type chip (`TypeBadge`)

30 px tall (24 px small, 34 px large on the Pokémon plate), padding `0 14px`, Archivo 700 width 112 % at 14 px, a slanted `::before` in the type color, and text in the type's `-ink` token. For matchups, a multiplier badge sits inside the chip at its right edge: an Ink slanted box with white text (`×4`, `×2`, `×½`, `×¼`, `×0`).

### 5.5 Stat meter (`StatMeter`, `StatBarChart`)

Rows 42 px tall in the grid `76px 44px 1fr`: label (Graphite), value (Archivo 800 width 112 %, 19 px, right-aligned), then a 14 px slanted Mist track with a `--theme-accent` fill measured against 255 (the existing `MAX_BASE_STAT`). The highest stat's label turns Ink and bold (keep `.stat-row--highest`). Under the chart, a quiet scale line reads "0" and "255". Fills grow with `scaleX` from 0, 600 ms, `cubic-bezier(.2,.8,.2,1)`, staggered 50 ms per row, starting 380 ms after the encounter starts.

### 5.6 Section heading

A 2 px Ink rule, 16 px of space, then the heading (§4.2), then 20 px before the content. No eyebrow labels and no numbering.

### 5.7 Footer (`AppFooter`)

A 2 px Ink top rule, padding `24px 40px 32px`, 14 px Graphite text, links in Ink. Keep the existing credits and disclaimer copy.

---

## 6. Motion

Reuse the motion tokens and the motion-gate architecture from R9. Add new keyframes to the classified motion inventory.

### 6.1 The encounter: the one sequence that plays on its own

It plays once per **new** Pokémon: when one first renders on Home, on its page, or on Compare, and again whenever the Pokémon changes. It does not replay on re-renders or tab changes. In React, restart it with a `key` on the field element (for example `key={pokemon.name}`); no A/B class juggling is needed. All times are measured from the moment the new Pokémon renders.

| Step | Start | Duration | What happens |
| --- | --- | --- | --- |
| Wipe | 0 ms | 640 ms, `cubic-bezier(.7,0,.3,1)` | A black slanted slab (80 % of the field's width), followed 60 ms later by a thin white slab (7 % width), crosses the field left to right. Animate `left` from −95 % to 135 % or the equivalent transform, inside an `overflow: hidden` field. Both slabs must end fully off screen: the first version had a bug where the white slab stopped mid-screen. |
| Color swap | 300 ms | instant | The sky, stripes and dex color change while the black slab covers them (`transition: background-color 1ms linear 300ms`). |
| Plate | 260 ms | 460 ms, `cubic-bezier(.2,.8,.2,1)` | The black name plate slides in from 56 px to the right, fading in. |
| Sprite drop | 300 ms | 500 ms | It falls 60 px into place, squashes (`scale(1.05,.93)` at 62 %), rebounds 6 px, then settles. |
| Silhouette | 0–720 ms of a 900 ms animation | `steps(1)` | The sprite is `filter: brightness(0)`, flashes `brightness(0) invert(1)` at 80 %, and is in full color from 88 %. This is how a wild Pokémon appears in Black & White. |
| Bars | 380 ms + 50 ms per row | 600 ms | The base-stat-total bar and the stat bars grow. |
| Dialog (Home only) | 950 ms, then 2050 ms | 900 ms and 500 ms, `steps(24)` / `steps(17)` | The two dialog lines type out using `clip-path: inset(0 100% 0 0)` → `inset(0)`. A blinking ▼ caret follows. The full text is in the DOM from the start, so screen readers aren't affected (reuse `useTypewriter` if it fits, otherwise CSS-only is fine). |

With reduced motion or animations off: no wipe, no drop, no silhouette. The sprite, colors and text appear immediately.

**Ambient:** the stripes drift ±3 % horizontally over 26 s (`alternate`, linear), on the stage only, as the one ambient animation allowed by the §8.5 budget. Off with reduced motion.

### 6.2 Motions that answer an action

| Name | Trigger | Spec |
| --- | --- | --- |
| Party pop | A Pokémon joins the team | Its header pip scales to `1.7, 1.35` and back, 550 ms, `cubic-bezier(.3,1.7,.5,1)` |
| Heart burst | Favorite turned **on** (not off) | Eight confetti pieces in the Pokémon's type color (alternating squares and circles, 12 px) fly out about 60 px from the button and fade, 700 ms. A one-shot event, like the existing `ShinySparkle`. |
| Inline confirmation | Favorite or team toggled on the Pokémon page | A line appears under the actions (slide up 8 px, 350 ms): "Saved to your favorites.", "Hydreigon joined your party. 5 of 6 slots filled.", "Hydreigon left your party. 4 of 6 slots filled." It lives in an `aria-live="polite"` region and is replaced, not stacked. |
| Sparkle | Shiny turned on | The existing `ShinySparkle`, restyled: five white four-point stars with Ink outlines around the sprite, 850 ms, staggered |
| Hop | Pointer or focus on a sprite in a list (evolution nodes, favorites tiles, party cards) | `translateY(-12px)` and back with a springy ease, about 300–450 ms |
| VS slam | Compare: either side changes | "VS" scales from 2.6× (rotated −8°) to 1×, 500 ms, `cubic-bezier(.3,1.6,.5,1)`, 650 ms in. The sprites slide in from their outer edges (180 px, 550 ms, 300 ms in) instead of dropping. |
| Slot leave | A party member is removed | The card lifts 12 px, tilts −2°, scales to .96 and fades (320 ms), *then* the team updates. Focus moves to a sensible place (reuse the D6 exit-animation pattern). |
| Deal | The Library page loads | The three hero cards rise from below the field and fan out: center first (150 ms), then left (350 ms), then right (450 ms), 700 ms each |
| Card tilt | Pointer over any card (hero, grid, binder, dialog) | See §7.4 |
| Flip | The card dialog opens, or Previous/Next is used | The card rotates in from `rotateY(180deg) scale(.9)` (its back) to the front, 700 ms, `cubic-bezier(.3,1.2,.4,1)`, with `backface-visibility: hidden` on both faces |
| Page turn | Binder Next/Previous | The incoming page rotates in about the spine from `rotateY(∓92deg)` with `brightness(.4)` → none, 600 ms. The opposite page fades in. It does not play on first load. |
| Tile in | Library view or sort changes | Tiles rise 18 px and fade in, 450 ms, staggered 35 ms (capped at 14 steps) |
| Sheet | Phone card details open | A black bottom sheet slides up from 100 %, 380 ms |

---

## 7. Screens

Check each one against `screens/` and `reference/`. Sizes are desktop values; §8 covers phones.

### 7.1 Home (`HomePage`, `Stage`, `StageConsole`, `MessageBox`, `BattleMenu`)

See `screens/home--1440.jpg` and `screens/encounter-sequence.jpg`.

- A full-width encounter field, 660 px tall, with the ground at 44 %. The **stage takes the left 56 %**: platform 400×84 at `bottom: 196px`, sprite standing on it at an **integer scale** (3× for the Black & White animated sprites, 4× for small ones such as Pikachu and Lucario; keep your sprite fallback chain).
- **Battle dialog box** (the restyled `MessageBox`), at the bottom of the stage 40 px from each side, at least 132 px tall: white, a 4 px Ink border, 14 px radius, and an inner double ring (`inset 0 0 0 4px #fff, inset 0 0 0 8px <type color>`). Jersey 10 at 40 px, two lines: "A wild ZOROARK appeared!" and "What will you do?" with the caret.
- **Command plate** (the restyled `BattleMenu`): the black plate on the right 46 % with the slanted left edge (148 px). Four slanted command rows, 78 px tall, each with a title (Archivo 800, 21 px) and a description (14 px). Hover fills the row white and nudges it 8 px left. The first row is primary (white at rest).
  1. "Check its entry": "Stats, evolution and type matchups" (link)
  2. "Compare": "Size it up against another Pokémon" (link)
  3. "Add to team" / "On your team" (toggle): "Your party has room for 2 more", "Hydreigon joined your party. Select again to release it", or "Your party is full. Release one on the Team page"
  4. "Look for another": "A different wild Pokémon appears" (rerolls with a new encounter)
- The prompt heading "What will you do?" is visually hidden on the plate, because the dialog already says it.

### 7.2 Pokémon page (`PokemonPage`, `PokemonCard`, `Stage`, `PokemonActions`, `FavoritesList`, `MetaInfo`, `EvolutionSection`)

See `screens/pokemon--1440.jpg` and `screens/BEFORE-pokemon--1440.jpg`.

- **Encounter field**, 580 px tall:
  - **Stage (left 56 %):** platform 400×84 at `bottom: 92px`, sprite feet at `bottom: 126px`. Sprite options sit bottom-left (40 px from the edge, 26 px up): a segmented control with "Pixel" and "Artwork", then a separate Shiny toggle with a sparkle icon. Keep the existing accessible names ("Pixel sprites" / "Shiny"); the visible labels may be shorter.
  - **Plate (right 50 %, slanted edge 132 px):**
    - "No. 635" in Jersey 10, 30 px, in `--theme-accent-soft`
    - The name in the 68 px display style
    - Large type chips
    - "Base stat total" with "600" and a 12 px slanted bar on `rgba(255,255,255,.2)`
    - **A 2×2 action grid**, max 460 px wide: Favorite (light) and Add to team (light), then Compare (ghost) and Cards (ghost, links to the Library for this Pokémon)
    - The inline confirmation line (§6.2)
- **Favorites rail:** a black strip right under the field, with the heading "Favorites" and slanted 84×64 tiles. Each tile shows the static Black & White sprite, a 5 px underline in the Pokémon's type color, and a Mist-at-12 % background. The current Pokémon's tile is white. Sprites hop on hover. An empty state follows the existing copy.
- **Readout:** a 1240 px grid with columns `7fr 5fr`, gaps `56px 72px`. Row 1: Base stats | Profile. Row 2: Evolution | Type matchups. On desktop **these are all visible at once; there are no tabs** (tabs remain on phones, §8).
  - **Profile:** a two-column `dl` (Height, Weight, Abilities, Hidden ability) with Line hairlines. Use `th scope="row"` or `dt`/`dd`, as decided in R5.
  - **Evolution:** nodes 132 px wide, with the static sprite (176 px rendered, overlapping a 116×28 platform) and the name underneath. The current stage's platform is `--theme-accent` and its name is bold Ink; other stages have a Mist platform. Between nodes, a 96 px column shows the condition ("Level 50", "Dusk Stone") above a drawn arrow. Nodes are buttons that navigate. The whole chain must fit on one row at 1440 px.
  - **Type matchups:** "Weak to", "Resists" and "Immune to" (the last only when non-empty), as wrapping chip lists with multiplier badges.
- **Cards teaser (new):** shown only when the Pokémon has cards.
  - A section headed "Cards". On the left, three of its rarest cards in a fan (170 px wide, rotated ±12°, ±112 px apart, the center card raised 10 px). The fan spreads further on hover.
  - On the right, one sentence: "Hydreigon has appeared on 25 cards since 2011, from Noble Victories to the 30th Celebration set. Browse them by era, by rarity, or flip through them in a binder." Then a dark button, "See all 25 cards", linking to `/library/<name>`. Build the sentence from the data: count, earliest year, first and latest set names.
  - Fetch lazily (when it scrolls into view) with the existing TCG hook, so the Pokémon page never waits on the proxy.

### 7.3 Compare (`ComparePage`, `CompareView`, `CompareStatsChart`, `CompareStatRow`)

See `screens/compare--1440.jpg`.

- **Split field**, 520 px tall: two halves divided by a slanted line (`clip-path` polygons offset ±60 px around the center), each half in its own Pokémon's sky, ground and stripes. A 36 px black slanted seam runs between them. Each stage has a 360×76 platform. The **left sprite is mirrored** (`scaleX(-1)`) so the two face each other.
- "VS": Archivo 900 italic, width 125 %, 132 px, white with a 6 px Ink stroke (`-webkit-text-stroke` plus `paint-order: stroke fill`), centered, with the VS slam.
- **Identity band:** a black band with three columns:
  - Left: the first Pokémon's dex number, name (46 px display), chips and a "First" select
  - Center: a 60 px slanted white Swap button whose icon spins 180° on hover
  - Right: the second Pokémon, right-aligned, with a "Second" select
  - Choosing the Pokémon already on the other side swaps them, as the current self-compare logic does.
- **Stat duel:** rows 50 px tall in the grid `96px 1fr 112px 1fr 96px`. A left value, a left bar growing **from the right** (track counter-skewed to +13°), the stat label in the center, a right bar, and a right value. The winning side's bar is its type color and its value bold Ink, with a small Ink "+23" difference badge next to it. The losing side's bar is Line and its value Graphite. Keep the non-color text equivalent ("higher" / "lower" / "tied") and the class contract. A total row below, 66 px, with a 2 px Ink top rule and values at 28 px.
- **Verdict line:** the winner's static sprite (72 px) next to "Volcarona has the higher base stat total, by 22." or "X and Y have the same base stat total." Live region.

### 7.4 Library (`LibraryPage`, `TCGCardGrid`, `TCGCardGridItem`, `TCGCardTable`, `TCGCardBinder`, `TCGCardModal`, `useHoloPointer`)

See `screens/library-*.jpg`, `screens/card-tilt-and-foil.jpg` and `screens/BEFORE-library--1440.jpg`.

**Data additions.** Extend `TCGCard` in `src/lib/type.ts` with fields the API already returns: `number`, `subtypes`, `types`, `set.series`, `set.printedTotal`. Display the number as `"240/191"` when `number` is numeric, otherwise as-is (`"SWSH037"`). Add the "Stage" row from `subtypes` (Basic / Stage 1 / Stage 2 / BREAK).

**Hero (560 px field, themed by the searched Pokémon):**
- **Left 58 %:** "the hand", three cards fanned at 270 px wide. Use the three highest by rarity rank, newest first among ties. The sides are scaled .86, rotated ±13° and offset ±178 px; hovering the hand spreads them to ±206 px and ±17°. They are real buttons that open the card dialog. The deal animation plays on load. A dark shadow ellipse sits under the hand.
- **Right 48 %:** the black plate with:
  - "No. 635"
  - The title "Hydreigon cards" (60 px display)
  - A lead sentence: "25 cards printed between 2011 and 2026, from Black & White to Mega Evolution." (built from the data: count, min and max year, oldest and newest series)
  - A small search form labeled "Find another Pokémon's cards", with a white-bordered black input and a light "Search" button (the existing library search)
  - Two buttons: "Open the binder" (light; switches to the binder view and scrolls to it) and "Hydreigon's entry" (ghost; links to the Pokémon page)
- **Library without a name** (featured state): the same layout with the Graphite theme and the existing featured copy.

**Sticky toolbar** (white, 2 px Ink bottom rule):
- "25 cards" (Archivo 800, 20 px, live region)
- A **rarity legend**: four tier marks with counts ("Ultra rare and up 5", "Holo 13", "Rare 6", "Common 1")
- On the right: the Grid / Table / Binder segmented control (with icons), then "Sort" with a select offering "Newest first", "Oldest first" and "Rarest first"
- Keep the `?view=` URL param and the binder `?page=` behavior.

**Rarity tiers: one mark in four strengths, used everywhere** (tile, table, dialog, legend):

| Tier | Mark (slanted chip, 24 px, 12 px bold text = the actual rarity string) | Light effect on hover |
| --- | --- | --- |
| common | Mist fill, Graphite text | none |
| rare | white fill, 2 px Ink ring | glare only |
| holo | Ink fill, white text, small four-point star icon | glare + faint foil (opacity .28) |
| ultra | foil fill `linear-gradient(100deg,#ffd6e8,#fff3b0 30%,#c6f7e9 60%,#cdd8ff)`, 2 px Ink ring, Ink text, star icon | glare + full foil (opacity .5) |

**Card tilt and light** (extend `useHoloPointer`; the math lives in `src/lib/holo.ts` and should stay pure and tested):
- On pointer move, set `--rx = (0.5 - y) * 16deg` and `--ry = (x - 0.5) * 20deg` (×0.7 on cards under 300 px wide), plus `--mx` / `--my` as percentages. Transform: `perspective(900px) rotateX(var(--rx)) rotateY(var(--ry))`. Use an 80 ms linear transition while tracking and 500 ms back to rest on leave.
- **Glare:** `radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,.55), transparent 46%)`, `mix-blend-mode: overlay`.
- **Foil:** a 115° rainbow band (pink / yellow / mint / blue at 50 % alpha), `background-size: 260%`, `background-position: var(--mx) var(--my)`, `mix-blend-mode: color-dodge`.
- Both are off at rest, only on hover, and do nothing with reduced motion.
- Cards have a `border-radius: 4.6% / 3.3%` and a soft drop shadow, `0 8px 18px rgba(0,0,0,.2)`. These are physical objects, the one place soft shadows are allowed.

**Grid view, grouped as a timeline:**
- With a date sort, groups are by **series** (`set.series`), newest or oldest first. With rarity sort, groups are by tier: "Ultra rare and up", "Holo", "Rare", "Common".
- **Layout per group:** two columns, `230px 1fr`. The left column is sticky (`top` just below the toolbar) and holds the era name (28 px italic display), the year span ("2023 to 2025", or one year) in bold, and the count ("7 cards") in Graphite.
- **Cards:** `repeat(auto-fill, minmax(172px, 1fr))`, gaps 36/24 px. Give grid items `min-width: 0`: long rarity strings like "Special Illustration Rare" otherwise blow out the columns, which was a bug in the first prototype.
- **Tile:** a real `<button>`, fixing the R8 keyboard issue with `TCGCardGridItem`. Inside: the card, then set name (bold, 15 px) and number (Graphite, tabular) on one row, with the tier mark below. On hover or focus, the card lifts 10 px and the shadow deepens. Keep `.tcg-card`.

**Table view:**
- A real table (or an ARIA grid if you need animated rows).
- Columns: thumbnail (46 px, which pivots −6° and scales 1.12 on row hover), Card (name as a link-style button that opens the dialog, set name under it), Number, Released ("8 Nov 2024"), Rarity mark, Artist ("Not listed" in Graphite when missing).
- Rows are 76 px tall with Line hairlines and a Mist hover. Released and Artist hide at phone width.

**Binder view:**
- A black binder, 14 px radius, 28 px padding, laid out as two pages with a 44 px spine between them holding three rings (30 px circles, a 5 px Line border, black center).
- Each page is `#2A2C31` with a 6 px radius and a 3×3 grid of pockets (`aspect-ratio: 63/88`, `#1D1F23`, a white top sheen gradient and a hairline like a plastic sleeve). Cards sit 5 px inside the pockets.
- **Nine cards per page, two pages per spread.** A page past the last card shows a centered "That's all 25 cards." instead of empty pockets. Empty pockets on the last real page are fine.
- Below the binder: Previous / "Pages 1 and 2 of 3" / Next as line buttons, disabled at the ends. The page turn plays as in §6.2.
- Pockets are buttons that open the dialog. On hover, the card lifts 6 px and scales 1.04.

**Card dialog** (the existing `Dialog` primitive and `TCGCardModal`):
- A scrim of `rgba(0,0,0,.92)` with `backdrop-filter: blur(8px)`, content aligned to the top with padding `max(4vh, 32px)`. Two columns, `420px 1fr`, gap 56 px, white text.
- **Left:** the card (tilt, glare and foil as above), inside a 3D flipper whose back face is black with a white/black/white inset frame and the brand disc at 38 %. It flips in on open and on every Previous / Next.
- **Right:**
  - "Card 7 of 25" (Graphite on dark)
  - The name (48 px display)
  - "Surging Sparks, 240/191"
  - The tier mark
  - A `dl`: Series, Released, Rarity, Artist (omitted when missing), HP, Stage
  - "Previous card" (ghost) and "Next card" (light)
  - A hint: "Use ← → to flip through, Esc to close."
- A close button sits top-right. **Arrow keys** move between cards in the current sort order, and **Esc** closes. Focus goes to Close on open and returns to the card that opened the dialog on close.

### 7.5 Team (`TeamPage`, `TeamSlots`)

See `screens/team--1440.jpg`.

- **Title band:** black, padding `40px`. "Your team" (60 px display) and a sentence: "4 of 6 slots filled. Your team is saved in this browser." or "Six of six. Your party is ready." On the right, six large slanted pips (22×40 px, a 3 px white ring), filled with each member's type color.
- **Party cards** in a grid `auto-fill, minmax(340px, 1fr)`, gap 24 px, each a 2 px Ink ring:
  - A **262 px mini field** on top: sky, ground, stripes, a 190×40 platform, the sprite at 2×, and a bottom edge slanted 26 px.
  - Below it: "No. 635" in Jersey 10 with an Ink slanted "Lead" tag on slot 1, the name (27 px display), small chips, a "Base stat total" mini bar, and actions: "Details" (line, small) and a remove icon button named "Remove Hydreigon from team".
- **Empty slot:** diagonal Mist and white stripes, a faded brand disc, "Slot 5 is open", and a dark "Find a Pokémon" button.
- Cards rise in staggered by 60 ms on load. The sprite hops when you hover a card. Removal plays the slot-leave motion. Keep `.team-slot*` classes and the existing announcements.

### 7.6 States not drawn on the canvas: apply the language

- **Loading:** the field in the Graphite theme, with an empty platform and a pulsing Mist silhouette blob where the sprite goes, and the dialog box reading "Searching the tall grass…" (existing copy). Library loading uses card-shaped Mist skeletons with the same radius.
- **Errors:** the battle dialog box with the existing failure copy and a dark "Retry" button. Keep the focus handling from R6.
- **404:** keep the pixel-art lost-route scene, re-colored to the Graphite theme, with the dialog box.
- **Settings dialog:** white sheet, 2 px Ink border, 14 px radius, the segmented control for motion and sprite preferences, and Archivo throughout.

---

## 8. Phone (≤ 1000 px stacks; designed at 390 px)

See `screens/pokemon--390.jpg`, `screens/library--390.jpg` and `screens/library-card-sheet--390.jpg`.

- **Top bar:** 56 px, with the brand, a search icon button (opening the existing search), and the party pips. **Bottom navigation:** 68 px, four items (Home, Compare, Team, Library), each a 20 px icon over a 12 px label. The current item gets an Ink slanted plate behind its icon.
- **Pokémon page:**
  - The field is 370 px tall, then the black plate overlaps it by 28 px with a slanted top edge.
  - The plate holds the dex number (24 px), the name (40 px), chips, the stat-total bar, and a 2×2 action grid: "Favorite", "Add to team" (on-state "On team"), "Compare" and "Cards".
  - Below the plate, a **slanted tab bar** (Stats, Profile, Evolution, Matchups, 44 px tall) over one panel. Keep your existing `Tabs` primitive and its ARIA.
- **Library:**
  - A 250 px field with the hand of three (128 px cards), then a black title block with the same slanted overlap.
  - A sticky toolbar with Grid / List and a Sort select (label visually hidden).
  - The grid has 2 columns, gaps 22/14 px, grouped by era with the year span on the right of each heading. Tiles show the set name and tier mark.
  - Card details open as a **black bottom sheet**: a grab handle, a close button, a 220 px card with the flip, name, "set, number", tier mark, a short `dl` (Released, Artist, HP), and Previous / Next.
- Compare and Team stack using the media rules in their reference files (`@media (max-width: 1000px)`).

---

## 9. Copy (new or changed strings)

Put every string in `src/lib/copy.ts`, following the existing pattern.

- Home: "What will you do?", "Check its entry", "Stats, evolution and type matchups", "Compare", "Size it up against another Pokémon", "Add to team", "On your team", "Your party has room for {n} more", "{Name} joined your party. Select again to release it", "Your party is full. Release one on the Team page", "Look for another", "A different wild Pokémon appears".
- Pokémon page: "Favorite", "Favorited", "Add to team", "On your team", "Compare", "Cards", "Saved to your favorites.", "Removed from favorites.", "{Name} joined your party. {n} of 6 slots filled.", "{Name} left your party. {n} of 6 slots filled.", "Base stat total", "Hidden ability", "Weak to", "Resists", "Immune to", "See all {n} cards", and the teaser sentence.
- Compare: "First", "Second", "Swap sides", "{Name} has the higher base stat total, by {n}.", "{A} and {B} have the same base stat total."
- Team: "Your team", "{n} of 6 slots filled. Your team is saved in this browser.", "Six of six. Your party is ready.", "Lead", "Details", "Slot {n} is open", "Find a Pokémon".
- Library: "{Name} cards", the lead sentence, "Find another Pokémon's cards", "Search", "Open the binder", "{Name}'s entry", "{n} cards", "Sort", "Newest first", "Oldest first", "Rarest first", "Ultra rare and up", "Holo", "Rare", "Common", "Pages {a} and {b} of {n}", "Page {a} of {n}", "That's all {n} cards.", "Card {i} of {n}", "Previous card", "Next card", "Not listed", and the keyboard hint.
- Header: "Party", "Your team, {n} of 6".

---

## 10. Suggested slices

Each slice is one PR into `ui/rehaul`. It follows roadmap §8.1 and §8.2 (Definition of Done, before/after screenshots at 375 and 1440, DEVLOG chapter, tracker and change log).

1. **B&W-1 Foundation:** the font swap; semantic token rebinding (§4.1) and the `.on-dark` scope; the field variables (§4.1 table) including the single-type rule; the focus ring; the `RARITY_RANK` fix with tests. Expect the whole app to turn white and black, broken in places. That's fine.
2. **B&W-2 Primitives:** Button, SegmentedControl, TypeBadge (with the multiplier badge), StatMeter, section heading, MessageBox as the battle dialog, Dialog. Update the dev style guide.
3. **B&W-3 Shell:** header, nav, search and autocomplete, party pips with type colors and party pop, settings button, footer, phone top bar and bottom nav.
4. **B&W-4 Encounter field and Pokémon page:** the field component (sky, ground, stripes, platform, drift); the encounter sequence restarted with `key`; plate, actions, inline confirmation, heart burst; favorites rail; readout; evolution; matchups; phone tabs.
5. **B&W-5 Home and Compare:** battle dialog and command plate, reroll; split field, VS slam, identity band, stat duel, verdict.
6. **B&W-6 Team:** title band, party cards, empty slots, slot leave.
7. **B&W-7 Library:** data additions; hero and deal; toolbar and legend; tiers; tilt, glare and foil; grid timeline; table; binder with page turn and end page; dialog with flip and keyboard; phone sheet; cards teaser on the Pokémon page.
8. **B&W-8 Pass:** states (§7.6), 375 / 768 / 1440 checks, the reduced-motion and animations-off pass, a contrast check of every new pair, an axe run, budgets, E2E smoke updates.
