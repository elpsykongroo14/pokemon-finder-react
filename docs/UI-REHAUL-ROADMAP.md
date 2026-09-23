# Pokémon Finder — UI Rehaul Roadmap

> **Working title:** _Dex Mode_ — a DS-era Pokédex you can actually play with.
> **Applies to:** `pokemon-finder-react` first, then the vanilla TypeScript version (Phase R11).
> **Status:** blueprint. Nothing in this document has been implemented yet.
> **How to use it:** commit it as `docs/UI-REHAUL-ROADMAP.md`. At the start of every session, paste (or attach) it and name the phase we're on. Tick the tracker, add a line to the change log, and record decisions in §10.

---

## Contents

1. [Phase tracker](#1-phase-tracker)
2. [Diagnosis: why the UI feels dull](#2-diagnosis-why-the-ui-feels-dull)
3. [North star & design pillars](#3-north-star--design-pillars)
4. [Reference board](#4-reference-board)
5. [Design-system philosophy](#5-design-system-philosophy)
6. [Technical decisions & tradeoffs](#6-technical-decisions--tradeoffs)
7. [Phases R0–R12](#7-phases)
8. [Cross-cutting rules](#8-cross-cutting-rules)
9. [Risks](#9-risks)
10. [Decision log](#10-decision-log)
11. [Component map (current → target)](#11-component-map-current--target)
12. [Copy & voice guide](#12-copy--voice-guide)
13. [Working agreement & session kickoff](#13-working-agreement--session-kickoff)
14. [Change log](#14-change-log)

---

## 1. Phase tracker

Sizes are relative (S / M / L, where M ≈ one of the bigger testing-pass sessions), not calendar time.

| ✓   | Phase   | Name                                   | Size | Depends on             | Visible payoff                                 |
| --- | ------- | -------------------------------------- | ---- | ---------------------- | ---------------------------------------------- |
| ☐   | **R0**  | Baseline & ground rules                | S    | Phase 9 checkpoint     | None (safety net)                              |
| ☐   | **R1**  | Design language                        | M    | R0                     | Style guide page                               |
| ☐   | **R2**  | Foundation refactor (no visual change) | M    | R1                     | None (enables everything)                      |
| ☐   | **R3**  | Primitives kit                         | L    | R2                     | Buttons, panels, bars look like the game       |
| ☐   | **R4**  | App shell, navigation & theme engine   | L    | R3                     | **First "wow": whole app re-skinned**          |
| ☐   | **R5**  | The Pokémon page                       | L    | R4                     | **Animated sprite stage, type-reactive world** |
| ☐   | **R6**  | Home, search, favorites & states       | M    | R5                     | Landing "encounter", live autocomplete         |
| ☐   | **R7**  | Compare & Team                         | M–L  | R5                     | Versus screen, party screen                    |
| ☐   | **R8**  | TCG Library                            | L    | R4 (and tcg-proxy fix) | Holo cards, grid/table/binder                  |
| ☐   | **R9**  | Juice, sound & settings                | M    | R5–R8                  | Celebrations, polish                           |
| ☐   | **R10** | Quality gates & launch                 | M    | R9                     | Confidence + merge to `main`                   |
| ☐   | **R11** | Port to the vanilla version            | L    | R10                    | Both apps match                                |
| ☐   | **R12** | Backlog (game-depth features)          | —    | —                      | Only after R11                                 |

**Order rationale:** the first _visible_ transformation lands at R4–R5, deliberately early. The foundation phases (R0–R3) are unglamorous but they are what stops the redesign from becoming another rushed, vibecoded pass, which is exactly the thing we're fixing.

---

## 2. Diagnosis: why the UI feels dull

Grounded in the current code (`src/styles/tokens.css`, `src/index.css`, `src/App.css`, the components), not just impressions.

| #   | Observation                                                                                          | Where it shows up                                | Effect                                                                                           | Fixed in |
| --- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------- |
| 1   | The whole app lives in one centered column, `max-width: 640px`                                       | `.app` in `index.css`                            | On a laptop the UI is a narrow strip in a sea of grey                                            | R4       |
| 2   | Every text element is monospace (`--font-mono`), including headings                                  | `body`, `h1–h3`                                  | Reads as a terminal / dev tool, not a game                                                       | R1       |
| 3   | One accent color (yellow), used only for the active nav pill. Everything else is grey on grey        | `--color-accent` usage                           | No emotion, no hierarchy                                                                         | R1, R4   |
| 4   | The 18 type colors exist as tokens but only tint a badge border and text                             | `TypeBadge`, `.type-badge`                       | The single most colorful dataset in the app is barely used                                       | R4, R5   |
| 5   | Sprite = static official artwork inside a flat grey circle (`.sprite-stage`)                         | `SpriteDisplay`, `.sprite-stage`                 | The Pokémon, the star of the app, has no presence and no life                                    | R5       |
| 6   | Motion = 120–320 ms color/border transitions on hover, and nothing else                              | `--duration-*`, `transition` rules               | No entrances, no route transitions, no feedback when you favorite or add to a team               | R3, R9   |
| 7   | Loading is the text "Loading…", errors are red text, empty states are one sentence                   | `PokemonPage`, `HomePage`, `FavoritesList`       | Moments that could carry personality carry none                                                  | R6       |
| 8   | Every container uses the same recipe: surface + 1 px hairline + `radius-lg` + soft shadow            | `.pokemon-card`, `.compare-panel`, `.tcg-card` … | No visual hierarchy; the generic "SaaS card kit" look                                            | R1, R3   |
| 9   | Depth is soft dark shadows and 8–13 % white borders                                                  | `--shadow-*`, `--color-border-*`                 | Nothing looks pressable or tangible                                                              | R1, R3   |
| 10  | The tokens file states its own rule: _"soft & dark — no glow, no color bloom"_                       | `tokens.css` elevation comment                   | That rule was right for the old direction. It has to be retired **on purpose** (recorded in §10) | R1       |
| 11  | Structure debt: one 852-line `App.css`; four different sections reuse `.pokemon-card-sprite-section` | `App.css`, `PokemonCard.tsx`                     | Restyling in place would be fragile                                                              | R2       |
| 12  | Team slots are blank squares with a name in text; favorites show a 32 px sprite                      | `TeamSlots`, `FavoritesList`                     | The features you built hardest are the least celebrated                                          | R6, R7   |

### What we keep (the assets)

- **Token discipline.** `tokens.css` already says "components reference variables, never raw values." That single rule makes a rehaul cheap. We extend it; we don't replace it.
- **Component decomposition** (leaves are dumb, containers decide). Restyling should almost never require logic changes.
- **The test suite.** Tests query by role/text/label, so class-name and layout changes are safe by construction. Only _visible text_, _roles_ and _accessible names_ are load-bearing (see §8.3).
- **Routing, hooks, data layer, reducers.** Out of scope except for strictly additive changes (sprite fallback chain, preferences hook, theme hook, typewriter hook).

### Scope boundary

**Presentation and interaction only.** New product features (collection tracking, type-coverage analysis, mini-games) live in R12 and are not smuggled into visual phases.

---

## 3. North star & design pillars

**One sentence:** _Opening the app should feel like flipping open a DS and turning on a Pokédex: bright, chunky, alive, and a little bit playful._

### The one memorable thing (where we spend our boldness)

> **The whole interface takes on the Pokémon's type.** Search Charizard and the backdrop, borders, bars and glow shift to fire-and-flying; search Gyarados and it turns water-and-flying. A living (animated) sprite stands on that backdrop.

Everything else stays disciplined so this moment lands. This is inspired by the way DS-era summary/Pokédex screens tint themselves around the Pokémon being viewed.

### Pillars

1. **Alive.** Sprites move, bars fill, menus have a blinking cursor, buttons squish when pressed. Stillness is the exception, not the default.
2. **Chunky & tactile.** Thick outlines, bevels, hard offset shadows, big hit targets. Things look pressable, so pressing them is satisfying.
3. **Type-reactive.** Color is data. The palette is driven by the Pokémon's type(s), not by decoration.
4. **Game-native structure.** The app is organized like the games: a _Stage_ (the Pokémon), a _Console_ (menus/tabs), a _Tray_ (party & favorites), message boxes with typewriter text, Fight/Bag/Pokémon/Run-style menus.
5. **Original, not ripped.** DS _vocabulary_, our own art. No copied game UI, fonts, or audio (see §9, risk 7).
6. **Accessible & fast, always.** Vibrant does not mean unreadable or janky. Reduced-motion, keyboard, contrast and performance are hard floors, not polish items.

### Anti-goals

- No generic rounded-card grid with identical soft shadows.
- No gradients or glow used as _decoration_. Gradients/glow only where they carry type or state information.
- No motion that blocks the user or delays content.
- No skeuomorphic DS-shell chrome (bezels, hinge, fake buttons) in v1. (Backlog idea only.)
- No new libraries unless a concrete need appears (see §6).

### Layout concept: Stage + Console

On mobile the layout is literally the DS: **top screen** = the Stage, **bottom screen** = the Console. On desktop the two sit side by side.

```
DESKTOP (≥ 1024px)
┌──────────────────────────────────────────────────────────────┐
│ [◓ logo]  ▶Home  Compare  Team  Library            [⚙] [★ 3] │  header / menu bar
├───────────────────────────────┬──────────────────────────────┤
│  STAGE                        │  CONSOLE                     │
│  type-tinted backdrop         │  [Info][Stats][Evolution][TCG]│
│  animated sprite on platform  │  ┌────────────────────────┐  │
│  #006  CHARIZARD              │  │ active tab content     │  │
│  (fire)(flying)               │  │ (HP-style stat bars…)  │  │
│  [♥ Favorite][+ Team][✦Shiny] │  └────────────────────────┘  │
├───────────────────────────────┴──────────────────────────────┤
│ TRAY:  ★ favorites strip …………………  Party  ◓◓◓◓○○            │
└──────────────────────────────────────────────────────────────┘

MOBILE (< 768px)          HOME (2×2 battle-menu hub)
┌──────────────┐          ┌───────────────────────────┐
│ header       │          │ A wild PIKACHU appeared!  │  ← stage w/ random Pokémon
├──────────────┤          │        (animated)         │
│   STAGE      │          ├───────────────────────────┤
├──────────────┤          │ What will you do?         │
│   CONSOLE    │          │ ▶ Search     Compare      │
│   (tabs)     │          │   Team       Library      │
├──────────────┤          └───────────────────────────┘
│ TRAY         │
└──────────────┘
```

---

## 4. Reference board

We borrow **ideas**, never assets.

### DS-era games (Gen IV: Diamond/Pearl/Platinum/HGSS; Gen V: Black/White) → what to translate

| Game-UI idea                                          | Our translation                                                         | Phase      |
| ----------------------------------------------------- | ----------------------------------------------------------------------- | ---------- |
| Summary screen tinted by Pokémon type                 | Type-reactive theme engine                                              | R4, R5     |
| Two screens (top = art, bottom = touch menu)          | Stage + Console layout                                                  | R4, R5     |
| Animated Gen V sprites                                | Animated sprite stage w/ static fallbacks                               | R5         |
| HP bar that fills, color by level                     | Stat bars that fill with stepped easing, colored by tier                | R3, R5     |
| Battle menu (2×2 Fight/Bag/Pokémon/Run) with ▶ cursor | Home hub, nav, autocomplete list, selects use a sliding/blinking cursor | R3, R6     |
| Text box with typewriter text                         | `MessageBox` for status/empty/error/success messages                    | R3, R6     |
| Party screen (big slot 1 + five smaller)              | Team page                                                               | R7         |
| Pokédex list with icon + number + name                | Autocomplete dropdown, favorites tray                                   | R6         |
| PC box grid                                           | Library grid                                                            | R8         |
| Poké Ball as loader/icon language                     | Spinner, empty slots, team counter                                      | R3, R6, R7 |

### pkmn.gg (favorite site reference; `/series` in particular)

**Caveat:** the site blocks automated fetching, so this list comes from its public descriptions, not from its visuals. **R0 includes a screenshot capture step** so that visual specifics come from real images, not guesses.

| Idea documented on the site                           | Our translation                                           | Phase |
| ----------------------------------------------------- | --------------------------------------------------------- | ----- |
| Series → Set → Card browsing hierarchy                | Library navigation structure (Pokémon → sets → cards)     | R8    |
| **Grid / Table / Binder** views of the same card data | View toggle on Library, stored in the URL (`?view=table`) | R8    |
| Have / Need / Duplicates filtering                    | Backlog (needs new data: owned cards)                     | R12   |
| Collection progress that "levels up"                  | Backlog (dex/collection progress)                         | R12   |
| Sort and filter controls as first-class UI            | Restyled sort control + rarity/set chips                  | R8    |

---

## 5. Design-system philosophy

This is the one part where we slow down and understand _why_, because every later phase leans on it. (CSS itself will be delivered finished, without line-by-line commentary; see §13.)

### 5.1 Three-tier tokens: primitive → semantic → component

- **Primitives** are raw values with no opinion: `--blue-500`, `--space-4`, the 18 base type colors.
- **Semantic tokens** are _roles_: `--surface-window`, `--text-on-window`, `--accent-primary`, `--border-chunky`. They point at primitives.
- **Component tokens** are optional local knobs: `--button-bg`, `--stat-fill`. They point at semantic tokens.

Components only read semantic (or their own component) tokens. Why: to change the _look_ you rebind a role once; to change a _theme_ you rebind roles wholesale. Today `tokens.css` mixes primitives and semantics in one flat list. That was fine for one theme; it isn't for a system where the Pokémon's type reskins the page.

### 5.2 A theme is a rebinding, not a rewrite

Type-reactivity works by setting **one attribute** (`data-type="fire"`) on `<html>`. A CSS block for each type rebinds a handful of semantic tokens (`--theme-base`, `--theme-deep`, `--theme-soft`, `--theme-ink`). Every component already reads those tokens, so the entire page recolors with no React re-render fan-out and no prop drilling.

_Tradeoff:_ the alternative is passing theme through React Context to every component. That is more code, more re-renders, and gives the same result. We let the browser's cascade do the fan-out; React's only job is to set one attribute (and clean it up on unmount, the same cleanup discipline as the `Modal` Escape-listener bug you caught in Phase 8).

_Derivation rule:_ each type gets **one** base color; the deep/soft/ink variants are _derived_ (`color-mix(in oklch, …)`), not hand-picked 18 × 4 times. One input, derived outputs, so a palette change is one edit.

Dual-type Pokémon: a diagonal gradient from type 1 to type 2 on the Stage backdrop; chrome uses type 1.

### 5.3 Cascade layers give the CSS an order

We declare a fixed layer order once (`reset, tokens, base, primitives, features, themes, utilities`). Later layers beat earlier ones **regardless of selector specificity**. That kills the "my new rule doesn't apply / my rule accidentally overrides another" class of bug, which is the main way CSS rots during a large restyle.

### 5.4 Two-layer component architecture

- `src/ui/`: **primitives** (Button, Panel, Tabs, MessageBox, StatMeter, Dialog…). They know nothing about Pokémon (same principle as your generic `Modal`).
- `src/components/`, `src/pages/`: **features** that _compose_ primitives with Pokémon data.

Rule: primitives never import from `lib/` or feature code. This is what makes R11 (the vanilla port) tractable, because the primitives are the part that ports.

### 5.5 Motion is a vocabulary with four tiers

| Tier            | Purpose               | Examples                                                      | Allowed where           |
| --------------- | --------------------- | ------------------------------------------------------------- | ----------------------- |
| **Response**    | Answers a user action | Button press squish, toggle, favorite pop                     | Everywhere              |
| **Transition**  | Shows a state change  | Route change, tab switch, modal open, stat bars filling       | Everywhere              |
| **Ambient**     | Idle "life"           | Sprite idle animation, blinking ▶ cursor, platform shadow bob | **Stage only** + cursor |
| **Celebration** | Rare rewards          | Shiny sparkle, "Team complete!", first favorite               | Rare, user-triggered    |

Rules: only `transform` and `opacity` animate by default (compositor-friendly); ambient motion is confined to the Stage so the rest of the page can be calm; every effect has a static fallback (§8.4).

### 5.6 Motion tokens (proposal; final values locked in R1)

| Token             | Value                     | Use                |
| ----------------- | ------------------------- | ------------------ |
| `--dur-instant`   | 80 ms                     | Press feedback     |
| `--dur-fast`      | 140 ms                    | Hover, focus       |
| `--dur-base`      | 240 ms                    | Most transitions   |
| `--dur-slow`      | 420 ms                    | Modal, tab, route  |
| `--dur-epic`      | 700 ms                    | Celebrations       |
| `--ease-standard` | `cubic-bezier(.4,0,.2,1)` | Default (existing) |
| `--ease-snap`     | overshoot cubic-bezier    | Pop-in             |
| `--ease-bounce`   | `linear()` spring curve   | Celebrations       |
| `--ease-tick`     | `steps(n)`                | HP-bar chunky fill |

### 5.7 Elevation: from "soft" to "tactile"

Old: soft dark blur shadows + 1 px hairlines. New: **thick outline + bevel highlight + hard offset shadow** (e.g., a solid 0 4 px 0 shadow that collapses to 0 on press). Depth now communicates _pressability_, not just layering.

Caveat: pixel-notched corners (via `clip-path`) also clip focus rings and box-shadows. Use them only on the signature `Window` frame and draw focus indicators inside the clip (or via `filter: drop-shadow` on a wrapper).

### 5.8 Accessible vibrancy

Saturated type colors (electric yellow, ice, fairy pink) **fail contrast** with white text. Each type therefore gets an `--type-x-ink` (the text color to place _on_ it), and a contrast table is produced in R1. Contrast targets: WCAG 2.2 AA (4.5:1 body text, 3:1 large text and UI component boundaries).

---

## 6. Technical decisions & tradeoffs

| Topic                 | Options                                                                         | Recommendation                                              | Why / tradeoff                                                                                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CSS approach**      | (a) plain CSS + tokens + `@layer`; (b) CSS Modules; (c) Tailwind; (d) CSS-in-JS | **(a)**                                                     | Extends the token architecture you already have; zero dependencies; ports to the vanilla app almost as-is. CSS Modules give scoping but rename every class and make sharing with vanilla harder. Tailwind would rewrite markup everywhere and fight the token system. CSS-in-JS adds runtime cost and can't port. |
| **Motion**            | CSS-first vs. an animation library (e.g., `motion`)                             | **CSS-first**, revisit at R7                                | CSS handles hover/press/keyframes/`@starting-style` enter animations. The one thing CSS handles awkwardly is _exit_ animations on React unmount (team slot removal). Decide at R7 with a real need in hand; measure bundle impact before adding anything.                                                         |
| **Route transitions** | Manual vs. View Transitions API                                                 | **View Transitions**, progressive enhancement               | React Router v7 exposes a `viewTransition` option on links/navigation, enabling shared-element morphs (favorite sprite → stage sprite). Verify current browser support in R4 and feature-detect; no support = instant navigation, still fully working.                                                            |
| **Fonts**             | Google Fonts `<link>` vs. self-host via Fontsource                              | **Self-host (Fontsource)**                                  | Fewer third-party requests, no layout surprises, cacheable with the app (DevOps lesson: font loading strategy, `font-display`, preload, subsetting).                                                                                                                                                              |
| **Font pairing**      | Pixel display + rounded/clear body                                              | Shortlist in R1, decided from a specimen                    | Display candidates: _Pixelify Sans_, _Jersey_ family, _DotGothic16_, _Silkscreen_. Body candidates: _Nunito_, _Fredoka_, _Rubik_. All are open-licensed; confirm licenses. **Never** use game-proprietary fonts.                                                                                                  |
| **Icons**             | Icon library vs. own SVG/pixel set                                              | **Own small SVG set** (~15 icons)                           | A distinct pixel-style set is part of the identity; a stock icon library is the definition of generic.                                                                                                                                                                                                            |
| **Sprites**           | Official artwork only vs. animated pixel sprites                                | **Pixel mode default, Art mode toggle**                     | PokeAPI's `sprites.versions` includes Gen V animated sprites, but only for older Pokémon. Coverage decides the fallback chain (R0 spike). Pixel sprites need integer scaling + `image-rendering: pixelated`.                                                                                                      |
| **Settings state**    | New store vs. existing pattern                                                  | **Context + `useLocalStorage`**                             | Same pattern as Favorites/Team. Holds: animations (auto/on/off), sound (off), sprite mode (pixel/art).                                                                                                                                                                                                            |
| **Modal**             | Keep portal `Modal` and add dialog semantics vs. native `<dialog>`              | **Keep portal, add semantics** (decide in R3)               | The current Modal has no `role="dialog"`, no `aria-modal`, no focus management. Native `<dialog>` gives these nearly free, but jsdom's support for `showModal()` is limited, which could complicate the existing Modal tests. Verify before committing.                                                           |
| **Style guide**       | Storybook vs. dev-only `/styleguide` route                                      | **Dev-only route**                                          | A route gated by `import.meta.env.DEV` (lazy-loaded so it never ships) is ~zero setup and teaches the same thing. Storybook is heavier than this project needs.                                                                                                                                                   |
| **Visual regression** | Manual screenshots vs. Playwright `toHaveScreenshot`                            | Manual through R9; **Playwright in R10**                    | Automated screenshot diffs are flaky across machines unless run in CI's container with animations disabled. Worth it once the design has stabilized, not while it's changing daily.                                                                                                                               |
| **Branching**         | Long-lived integration branch vs. feature flag vs. straight to `main`           | **Integration branch `ui/rehaul`** + per-PR preview deploys | Straight-to-`main` would leave the live site half-old/half-new. A feature flag doubles the CSS. A solo project has little merge-drift risk, so an integration branch is the simplest option. Merge `main` into it regularly. Decision **D1** in §10.                                                              |

---

## 7. Phases

Every phase uses the same template: **Goal · Why · Deliverables · Tasks · Checkpoint · Watch-outs · Learning focus.**
"Checkpoint" is the same idea as in Phase 9: the objective test that says the phase is finished.

---

### R0: Baseline & ground rules

**Size S · Depends on:** Phase 9 checkpoint (green CI + deployed React parity). If Phase 9 is still open, the analysis tasks below can run now, but no visual change merges until it closes.

**Goal:** a safety net and a shared starting line. Nothing visual changes.

**Why:** you can't tell whether a redesign improved things (or broke them) without a "before". Also, a few pre-existing issues are cheaper to fix in isolation than to discover mid-restyle.

**Deliverables**

- `docs/ui-baseline/`: screenshots of every route/state at 375 / 768 / 1440 px
- `docs/ui-references/`: your DS-era + pkmn.gg screenshots (local moodboard; **not** deployed)
- Lighthouse numbers recorded in DEVLOG
- A sprite-coverage table (spike)
- Decision log seeded (§10)

**Tasks**

1. Create the integration branch `ui/rehaul` from `main` (D1). Findings from your workflows: `ci.yml` only runs for pushes/PRs targeting `main`, and `cd.yml` deploys only after CI succeeds on `main`. So (a) CI must be extended to `ui/**` branches, and (b) there are no preview deployments yet (task 8). Name phase branches `ui/r0-hygiene`, `ui/r1-tokens`, etc. Never `ui/rehaul/...`, because git can't have a branch and a "folder" of the same name.
2. **Baseline screenshots:** Home; Pokémon (single-type, dual-type, branching evolution such as Eevee, missing sprite); Compare (empty / one / full); Team (empty / partial / full); Library (loading / featured / results / no results / modal open); 404; error state.
3. **Baseline metrics:** Lighthouse (mobile) on Home and a Pokémon page. Record Performance, Accessibility, and the Core Web Vitals figures.
4. **Health check:** `npm test`, `npm run lint`, `npm run build` all green; note the test count so we can prove nothing was lost. (Measured on the uploaded copy: 47 test files, 223 tests, lint clean, build = JS 254.11 kB / 80.22 kB gzip, CSS 15.81 kB / 3.22 kB gzip, 72 modules. Re-measure on your machine and record your own numbers.)
5. **Hygiene fixes** (own commit, own PR):
   - `TypeBadge.tsx`: `--color-text-secoondary` typo (fallback var never resolves)
   - `PokemonPage.tsx`: links to `/Library/…` (capital L) → `/library/…`. `PokemonPage.test.tsx` asserts the capital-L URL, so update that test in the same commit
   - `App.tsx`: stray empty `<Route />` at the end of the layout group. Confirm it's accidental, then remove
   - `TeamSlots.tsx`: (in the uploaded copy) a leftover `e.stopPropagation()` on the Remove button; no parent click handler exists anymore for it to guard against. Optional cleanup; if the stale select-on-click comment still exists in your local copy, remove it too
   - `StatBarChart.tsx`: `MAX_STAT = 225`, but real base stats reach 255 (e.g., Blissey's HP), so any stat above 225 gets clipped at a full bar (the track hides the overflow) and can't be told apart from a 225. No test pins this value (verified), so change it to 255
6. **Reference capture (you):** 10–20 screenshots each of (a) DS-era screens: party, summary, Pokédex list, battle menu, bag, PC box, from Platinum/HGSS/BW; (b) pkmn.gg: `/series`, a series page, a set page in Grid, Table and Binder view. Add one line per image on _what you like about it_.
7. **Sprite/API spike:** inspect live PokeAPI JSON for ~10 Pokémon across generations. Record which have `sprites.versions["generation-v"]["black-white"].animated`, what `sprites.other.showdown` covers, and whether `cries` is present. Output: a table "ID range → best available sprite" that defines the fallback chain.

8. **CI triggers + preview job:** extend `ci.yml` to run for pushes/PRs on `ui/rehaul`, fix its mislabeled step (`npm ci` is named "Lint"), add `npm run build` to CI, and add a `preview` job (runs only after `test` passes, only on pushes to `ui/rehaul`) that deploys to Cloudflare Pages with `--branch=ui-rehaul`. Production `cd.yml` stays untouched. Then add the preview URL's origin to the `tcg-proxy` CORS allowlist, or the Library page won't load on the preview.
9. **Class-contract audit:** confirm the list in §8.3 of class names that tests depend on, so later phases never break a test by accident.

**Checkpoint:** baseline folders committed; numbers in DEVLOG; tests/lint/build green; hygiene PR merged; CI runs on `ui/rehaul` and a preview URL works (including the Library page); class contract confirmed; D1–D9 answered or scheduled.

**Watch-outs:** screenshots of game UI are for private reference only. Don't commit them to a public repo if you're unsure about redistribution; keep `docs/ui-references/` git-ignored if in doubt.

**Learning focus:** establishing baselines (DevOps mindset: measure before you change), preview deployments, small isolated hygiene PRs.

---

### R1: Design language

**Size M · Depends on:** R0

**Goal:** decide how it looks _before_ touching components.

**Why:** the current UI feels lazy because visual decisions were made per-component, one at a time. A design language makes every later decision a lookup instead of an improvisation.

**Deliverables**

- Design brief page in `docs/` (this doc's §3 refined with your R0 references)
- **Tokens v2** (three-tier, §5.1): palette, type scale, spacing, radii, borders, elevation, motion, z-index
- Font specimen and final font pairing
- Type-theme derivation for all 18 types + **contrast table**
- Icon direction + first 8–10 icons (heart, star, ball, swords, plus, close, search, cog, arrow, sparkle)
- Copy & voice guide (§12 finalized)
- Dev-only `/styleguide` route displaying every token and the static look of primitives

**Starter palette (proposal, to be locked here after the specimen + contrast test)**

| Name         | Hex       | Role                           |
| ------------ | --------- | ------------------------------ |
| Ink Navy     | `#0E1330` | Deep background, text on light |
| Night Blue   | `#1B2A6B` | Primary chrome, dark panels    |
| Cobalt       | `#2F6BFF` | Primary action, focus          |
| Window White | `#F4F7FF` | Panel/window surfaces          |
| Pikachu Gold | `#FFCB2F` | Selection, shiny, highlights   |
| Ball Red     | `#F0443A` | Favorite, danger               |
| HP Green     | `#3FD68A` | Success, "high" stat tier      |

Type colors: reuse the existing `--type-*` values as **primitives**; derive deep/soft/ink from them.

**Tasks**

1. Review your R0 references with me and extract 5–7 concrete traits ("thick navy outlines," "glossy bevel," "wide letterspaced pixel headers"…).
2. Choose display + body fonts from a specimen page (D4). Self-host via Fontsource; define `font-display` and preload strategy.
3. Write tokens v2 in three files: `primitives.css`, `semantic.css`, `motion.css` (+ `type-themes.css`).
4. Build the type-theme block; test it visually on the 18 types plus dual-type combos.
5. Contrast pass: every semantic text/background pair and every `--type-x-ink` against WCAG AA. Record failures and fix in tokens.
6. Build `/styleguide` (lazy-loaded, DEV-only).
7. Explicitly **retire** the "no glow, no color bloom" rule (D-log) and document the replacement rule: _glow/gradient only when it carries type or state information_.

**Checkpoint:** you sign off on a `/styleguide` screenshot; contrast table has zero AA failures; tokens documented; nothing in `src/components/` changed yet.

**Watch-outs:** Pokémon type colors are the loudest thing on the page; a palette designed without them will clash. Design the chrome _with_ the type colors on screen.

**Learning focus:** design-system philosophy (§5), font loading, accessibility contrast math.

---

### R2: Foundation refactor (no visual change)

**Size M · Depends on:** R1

**Goal:** make the codebase safe to restyle. The app must look **identical** when this phase ends.

**Why:** "refactor first, restyle second" keeps structural changes and visual changes in separate, reviewable commits. When something looks wrong later, you know which kind of change caused it.

**Deliverables**

- `src/styles/layers.css` declaring layer order
- `App.css` split into co-located per-component CSS files (`Component.tsx` + `Component.css`), each inside its layer
- Alias layer mapping old token names → new semantic tokens, so migration is incremental
- Global baseline: `:focus-visible` style, `prefers-reduced-motion` handling, reset
- `src/ui/` folder created (empty scaffolding + conventions)
- `PreferencesProvider` (animations / sound / sprite mode) via Context + `useLocalStorage`; sets `data-motion` on `<html>`
- Stylelint with `color-no-hex` for `src/components`, `src/pages`, `src/ui` (raw hex only allowed in token files)

**Tasks**

1. Declare layers; wrap tokens/reset/base.
2. Split `App.css` by component. Rename the misused `.pokemon-card-sprite-section` to purpose-named classes.
3. Add the alias map (`--color-bg-surface: var(--surface-window)` etc.); delete aliases as components migrate in R3–R8.
4. Build `PreferencesProvider` + `usePreferences` (guard clause pattern like `useFavorites`), with tests using `renderHook`.
5. Add Stylelint to lint script + CI.
6. Compare against the R0 screenshots at three widths.

**Checkpoint:** side-by-side with R0 baseline shows no visual difference; tests/lint/build green; test count ≥ R0 count; `App.css` gone.

**Watch-outs:** don't "fix" visual things you notice along the way. Write them in the decision/notes list for R3+.

**Learning focus:** cascade layers, CSS architecture at scale, linting as a guardrail, CI gates.

---

### R3: Primitives kit

**Size L · Depends on:** R2

**Goal:** a small set of game-styled building blocks; feature components will then compose them.

**Why:** if every feature component styles its own buttons and bars, the UI is inconsistent again within a month. Primitives are where the "care" gets encoded once.

**Deliverables** (each documented with all states on `/styleguide`)

| Primitive                     | Variants / notes                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Button` / `IconButton`       | primary, secondary, ghost, danger, toggle (`aria-pressed`); states: default, hover, active (squish), focus-visible, disabled, loading |
| `Panel` (Window)              | The DS window frame: thick outline, bevel, hard shadow; `raised` / `sunken` / `tinted` (theme)                                        |
| `Cursor` (▶)                  | Blinking + slide-to-target behavior for menus                                                                                         |
| `Menu` / `MenuItem`           | Cursor-driven list; used by nav, autocomplete, selects                                                                                |
| `Tabs`                        | Roving tabindex, arrow-key support, animated indicator                                                                                |
| `StatMeter`                   | HP-bar style; stepped fill; tier colors; count-up number; text alternative                                                            |
| `TypeBadge` (skin)            | Glossy pill with type icon and `--type-x-ink` text                                                                                    |
| `MessageBox`                  | Typewriter text (visual only), full text to screen readers                                                                            |
| `Spinner` / `Skeleton`        | Poké Ball spinner; "silhouette" skeleton (`brightness(0)` sprite)                                                                     |
| `Dialog`                      | Modal shell w/ `role="dialog"`, `aria-modal`, labelled, focus trap + focus return                                                     |
| `Toggle` / `Select` / `Input` | Native controls, restyled                                                                                                             |
| `Icon`                        | The R1 icon set                                                                                                                       |

**Tasks**

1. Build primitives one at a time; each gets an RTL test for its behavior (keyboard, roles, states), not its appearance.
2. `MessageBox`: hook `useTypewriter(text)`: instant when reduced-motion or animations are off; render an `aria-hidden` animated copy plus a visually-hidden full-text live region.
3. `Dialog`: implement decision D7; replace `Modal`'s internals; keep its public API so existing tests keep passing.
4. **Restyle native controls; don't replace them.** The Shiny toggle stays a real `<input type="checkbox">` with an accessible name of "Shiny", restyled with `appearance: none`. This keeps `getByRole("checkbox", { name: "Shiny" })` in the existing test valid and keeps native semantics.
5. Add `/styleguide` sections for each primitive with all states forced visible.

**Checkpoint:** every primitive has all states on `/styleguide`; keyboard-only pass on each; no raw hex outside token files (Stylelint green); primitives have tests; existing suite still green.

**Watch-outs:** roles and accessible names are load-bearing for your tests (see §8.3). Keep `role="status"` / `role="alert"` on messages.

**Learning focus:** component API design, roving tabindex, focus management, accessible names, testing behavior over appearance.

---

### R4: App shell, navigation & theme engine

**Size L · Depends on:** R3
**Visible payoff:** this is the first phase where the app _looks_ new everywhere.

**Goal:** replace the 640 px column with the Stage + Console layout and wire the type-reactive theme.

**Deliverables**

- New `Layout`: header/menu bar, content region, Tray (favorites + party counter)
- Responsive grid: mobile stacked (Stage over Console), desktop side by side
- Navigation as a `Menu` with a cursor/indicator that slides between routes
- `useTypeTheme(types)` hook: sets `document.documentElement.dataset.type` (and `data-type2`), **cleans up on unmount**
- Route transitions (View Transitions with feature detection, plus a reduced-motion-safe fallback)
- Global animated backdrop (subtle, theme-tinted, paused when animations are off)
- Brand mark / logo (Poké Ball-inspired original SVG)

**Tasks**

1. Redesign `Layout.tsx` markup; keep `NavLink end`, the search `role="search"`, and everything `Layout.test.tsx` asserts.
2. Implement `useTypeTheme` and test it (`renderHook` + assert the `<html>` attribute set and cleared).
3. Define breakpoints as tokens; verify 375 / 768 / 1024 / 1440.
4. Decide D3 (Stage + Console everywhere, or only on some pages) with a real screenshot in hand.
5. Add route transition; verify Back/Forward and deep-link behavior unchanged.

**Checkpoint:** every page is visibly re-skinned and responsive; type theme applies and clears correctly when navigating Pokémon → Compare → Home; `Layout` tests green; Lighthouse Accessibility ≥ baseline.

**Watch-outs:** when the theme attribute is cleared, the transition back to default must not flash. If the search bar is repositioned, keep it identical for keyboard flow (Tab order).

**Learning focus:** layout systems (grid), `useEffect` cleanup discipline, View Transitions, progressive enhancement.

---

### R5: The Pokémon page

**Size L · Depends on:** R4

**Goal:** turn the Pokémon page into the hero of the app.

**Deliverables**

- **Stage:** type-tinted backdrop (dual-type diagonal), platform + ground shadow, **animated sprite** with idle motion
- **Sprite fallback chain** (from the R0 spike): animated Gen V → static Gen IV/V → official artwork; `image-rendering: pixelated` with integer scaling for pixel sprites; fixed-size container (no layout shift)
- **Sprite mode toggle** (Pixel ⇄ Art), persisted in preferences
- Header: dex number (`#006`), name, `TypeBadge`s
- Actions: Favorite / Team (restyled, with response animations), **Shiny** (restyled checkbox with sparkle moment), Compare, View Cards
- **Console tabs:** Info · Stats · Evolution (and a link/tab into cards)
- Stats: `StatMeter` with staggered fill on mount
- Evolution: animated connectors, sprite icons, branching layout preserved
- Details: `MetaInfo` as a proper labelled list (fixes the flagged `td` → `th scope="row"` item)
- Loading = silhouette skeleton; not-found and error = `MessageBox`

**Tasks**

1. Extend `PokemonSprites` in `lib/sprites.ts` with the `versions` shape needed; add `getSpriteUrl(sprites, { shiny, mode })` with the fallback chain. **Write the unit tests first** (you already have `sprites.test.ts` in the same style).
2. Build `Stage` (composed from `Panel` + new sprite component).
3. Wire `useTypeTheme(pokemon.types)` in `PokemonPage`.
4. Restyle actions; keep `aria-pressed`, the checkbox role/name ("Shiny") and the shiny `alt` text convention that `PokemonCard.test.tsx` pins.
5. Stats: keep the visible labels ("Attack", "Sp. Atk" etc.) that tests assert; if you want game-style abbreviations, do it with CSS or an `abbr`, or update the tests **in the same commit** deliberately.
6. Fix `MetaInfo` semantics (`th scope="row"`) and update `MetaInfo.test.tsx`.
7. Test states: single-type, dual-type, no animated sprite (Gen 6+ fallback), no sprite at all, very long name, slow network.

**Checkpoint:** search 8 Pokémon spanning generations/types. Stage, theme and fallbacks behave; CLS stays low (fixed-size sprite box); reduced-motion shows static sprite; existing PokemonPage/PokemonCard tests green; new sprite tests green.

**Watch-outs:** animated GIFs are heavier than PNGs; lazy-load and don't animate more than one sprite at a time (the Stage sprite). Ambient motion beyond the Stage is prohibited (§5.5). WCAG 2.2.2: auto-playing motion lasting over 5 s needs a way to pause/stop, satisfied by the animations setting; make it discoverable.

**Learning focus:** data-driven theming, fallback chains as pure functions, image rendering, layout-shift prevention.

---

### R6: Home, search, favorites & states

**Size M · Depends on:** R5

**Goal:** the first thing a visitor sees, and the most-used interaction, get the same care.

**Deliverables**

- **Home** "wild encounter": random Pokémon on the Stage, `MessageBox`: _"A wild {NAME} appeared!"_, 2×2 battle-style menu hub (Search / Compare / Team / Library)
- **SearchBar + autocomplete** as a Pokédex-style list: sprite icon, `#id`, name, cursor movement; preview panel restyled
- **Favorites tray** in the Tray: sprite icons, staggered enter, "empty" as an invitation
- Unified loading / empty / error / success message treatment via `MessageBox`
- "Recently viewed" strip _(only if it can be derived from existing data; otherwise → R12)_

**Tasks**

1. Home: choose the random Pokémon (id range, stable per session) using existing fetch layer; no new endpoints.
2. Restyle `SearchBar` without changing its combobox ARIA contract (`role="combobox"`, `aria-activedescendant`, listbox/option ids). `SearchBar.test.tsx` and `Layout.test.tsx` rely on these.
3. Autocomplete rows get sprites from existing data (`preview`) where available; don't add per-row fetches.
4. Favorites tray + empty states copy from §12.
5. Replace text-only statuses with `MessageBox` while keeping `role="status"` / `role="alert"`.

**Checkpoint:** keyboard-only search flow works (↑/↓/Enter/Esc), screen-reader announcements unchanged, tests green, Home feels like an entry screen rather than a blank page.

**Watch-outs:** a random-Pokémon Home adds a network request on load. Keep it non-blocking (skeleton) and keep LCP within budget (§8.5).

**Learning focus:** combobox accessibility, non-blocking data fetching on first paint, empty-state design.

---

### R7: Compare & Team

**Size M–L · Depends on:** R5

**Goal:** turn the two "power features" into their own game screens.

**Deliverables**

- **Compare:** "Versus" screen: split Stage with diagonal divider; stat rows become a tug-of-war (bars grow from the center); winner highlight with an **icon and text**, not color alone (fixes the flagged `CompareStatRow` accessibility gap)
- **Team:** "Party" screen: large slot 1 + five smaller slots (or 2×3 on mobile), empty slots as Poké Ball outlines, sprite + name + types per slot
- Add/remove animations (enter now; exit per D6)
- **"Team complete!"** celebration at 6/6 (rare, user-triggered)
- Team-full message when adding a 7th: explains what to do

**Tasks**

1. **Data decision (D10):** party cards want types (and maybe a stat total), but `FavoritePokemon` persists only `{ name, id, sprite }`. Options: (a) fetch details for the 6 members at render (network + loading states), (b) extend the persisted shape with optional fields and backfill lazily (requires tolerating old localStorage data with missing fields). Recommendation: **(b) with optional fields**, since it's cheaper at runtime. It touches `teamReducer` invariants, so add tests first.
2. Exit animations: decide D6. Options: CSS `@starting-style` + `transition-behavior` on removal, a "leaving" state before dispatch, or a small animation library. Pick with a concrete failing case in hand.
3. `CompareStatRow`: add text/ARIA equivalent for win/lose; update its tests deliberately.
4. Keep `TeamSlots` always rendering exactly `MAX_TEAM` slots (the invariant is tested).
5. Drag-to-reorder → **R12**, not here (new reducer action).

**Checkpoint:** compare and team flows work by keyboard; no color-only signals; team reducer tests unchanged and green; celebration respects reduced motion.

**Learning focus:** state-shape evolution and localStorage migration safety, exit-animation strategies, accessible status signals.

---

### R8: TCG Library

**Size L · Depends on:** R4 and the **tcg-proxy follow-up** (fix the Worker config so `TCG_CACHE` / `TCG_RATE_LIMITER` bindings attach to the right Worker; see the 09-17 DEVLOG entry). The Library is the most request-heavy page; don't stress an unbound Worker.

**Goal:** make the card library feel like flipping through a binder, with the pkmn.gg-style view flexibility.

**Deliverables**

- **View toggle: Grid · Table · Binder**, stored in the URL (`?view=`), consistent with your Phase 6 deep-linking philosophy
- **Card hover:** subtle tilt + holographic glare that follows the pointer (custom properties `--mx/--my`), only on the hovered card; static gloss on touch and reduced-motion
- **Rarity tiers** → visual tiers (tokens `--rarity-*`): common has no effect; holo/rare tiers earn effects
- **Card modal:** zoom + tilt + info panel; built on the new `Dialog`
- Skeleton loading; sort control restyled; set/rarity chips _(if derivable from existing card data)_
- Keyboard accessibility for grid items (the flagged item: whole-card `div` has no role/tabIndex/keydown). Use a real `<button>` (or link) as the card's interactive element

**Tasks**

1. Fix `TCGCardGridItem` semantics first, with tests (`Enter`/`Space` open the modal).
2. Table view: sortable columns from existing `cards`; no new API calls.
3. Binder view: paged 3×3 (or responsive) spreads with page controls.
4. Holo effect: write our own simplified version. If you take inspiration from an open-source implementation, read its license and credit it.
5. Performance: effects apply only to the one hovered card; no `will-change` on the whole grid; images stay `loading="lazy"`.

**Checkpoint:** all three views work with the same data; deep link to `?view=binder` reloads correctly; tests for the grid item (keyboard) pass; scrolling 50+ cards stays smooth in the DevTools performance panel.

**Learning focus:** URL state as a source of truth, pointer-driven CSS variables, rendering performance, semantic interactive elements.

---

### R9: Juice, sound & settings

**Size M · Depends on:** R5–R8

**Goal:** the last 10 % that makes it feel _cared for_. Deliberately late: polish is easy to over-do before the structure is settled.

**Deliverables**

- **Settings panel:** Animations (Auto / On / Off), Sound (Off / On), Sprite mode (Pixel / Art)
- **One orchestrated page-load moment** (a single signature intro, not scattered fades)
- Micro-interactions audit: every button, toggle and card has a response; every list has a tasteful enter
- **Celebration moments:** shiny reveal, first favorite, team complete, all with `--dur-epic` ceiling
- **Optional sound:** off by default; synthesized retro blips (Web Audio API), no copied audio. Autoplay policies mean sound only starts after a user gesture
- 404 as a "glitch" page (tasteful, no rapid flashing)
- Easter egg(s) (e.g., a Konami-code effect). Optional and fun.

**Tasks**

1. Settings UI bound to `PreferencesProvider` (already built in R2).
2. Motion audit: list every animation in the app; classify by tier (§5.5); remove any that aren't earning their place.
3. Reduced-motion audit: with OS setting on, everything is static but fully functional.
4. Flashing audit: nothing flashes more than 3 times per second (WCAG 2.3.1).
5. Sound module isolated behind a tiny interface so it can be omitted from the vanilla port if desired.

**Checkpoint:** settings persist across reloads; reduced-motion pass done; no animation left unclassified; sound is silent by default.

**Learning focus:** motion design restraint, Web Audio basics, user-preference architecture.

---

### R10: Quality gates & launch

**Size M · Depends on:** R9

**Goal:** prove the redesign is accessible, fast and robust, then merge to `main`.

**Deliverables & tasks**

1. **Accessibility:** automated (axe via a Vitest matcher such as `vitest-axe`, verify package fit) + manual keyboard-only run of every page + screen-reader smoke test + contrast re-check.
2. **Performance:** Lighthouse mobile vs the R0 baseline; Core Web Vitals "good" thresholds (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1); bundle-size review with a Vite-compatible analyzer; image/GIF weight review; DevTools performance recording of the Stage and the Library grid.
3. **Cross-browser:** Chromium, Firefox, WebKit (Safari); check View Transitions and any newer CSS features degrade cleanly.
4. **Responsive matrix:** 360 / 375 / 768 / 1024 / 1440 / 1920, portrait + landscape phone.
5. **Visual regression:** adopt Playwright `toHaveScreenshot` for the key pages, with animations disabled, run in CI's container (Decision D8).
6. **CI:** optional Lighthouse CI budget assertion; keep tests/lint/Stylelint/build as required checks.
7. **Cleanup:** delete alias tokens and dead CSS; ensure `/styleguide` is not in the production bundle (verify in build output).
8. **Launch:** update README screenshots, write a DEVLOG chapter, open the `ui/rehaul` → `main` PR, deploy, smoke-test production.

**Checkpoint:** all gates green or explicitly waived in §10 with a reason; production deploy verified.

**Learning focus:** performance budgets, automated a11y testing, visual regression tradeoffs, release discipline.

---

### R11: Port to the vanilla version

**Size L · Depends on:** R10

**Goal:** the vanilla app gets the same identity without re-designing it.

**Not yet inspected:** I've only seen the React repo. The first task is to review the vanilla repo's structure (upload it when we get here).

**What ports (near copy/paste):** tokens (all files), fonts, `@layer` order, primitive CSS, keyframes, icons/SVGs, sprite fallback logic (pure function), copy/voice.
**What gets re-implemented:** theme setter (a tiny module setting `data-type`), typewriter, tilt/holo pointer handler, settings persistence, dialog semantics, Tabs/Menu behavior. Same design, vanilla DOM code, using your existing `requireElement` / `requireQuery` helpers and `createElement`/`textContent` discipline (no `innerHTML` regressions).

**Tasks**

1. Diff the vanilla markup vs the React markup; list where class names/structure differ.
2. Choose the sharing mechanism (D11): copy files (simplest), git subtree, or a shared package (overkill for two repos). Recommendation: **copy + a `DESIGN-SYSTEM-VERSION` note** in each repo.
3. Port in the same order as React: tokens → primitives → shell → Pokémon → Home/search → Compare/Team → Library → juice.
4. Re-run the a11y/perf gates.

**Checkpoint:** side-by-side screenshots of React and vanilla are equivalent; vanilla tests/CI green; both deployed.

**Learning focus:** what a framework abstracts vs. what CSS alone gives you; keeping two implementations in sync.

---

### R12: Backlog (only after R11)

Not commitments. Each needs its own mini-roadmap before it starts.

- **Collection tracker** (pkmn.gg-inspired): mark cards as owned, progress per Pokémon/set, "level up" badges
- **Team type coverage:** uses your existing `typeEffectiveness` lib: weaknesses/resistances across the party
- **Drag-to-reorder team** (new reducer action + tests)
- **"Who's that Pokémon?"** silhouette mini-game
- **Evolution conditions** (level/stone) (requires modeling `evolution_details`, deliberately omitted so far)
- **Cries** on the Stage (opt-in; PokeAPI provides audio URLs)
- **Gen IV / Gen V skin packs** (a third theme axis)
- **Dark/light variants** (a second theme axis, doubles QA, so not before the type axis is solid)
- **Optional console-shell chrome** (bezel/hinge) as a toggleable skin

---

## 8. Cross-cutting rules

### 8.1 Workflow per phase

- Branch per task off `ui/rehaul` (your existing discipline); PRs into `ui/rehaul`; merge `main` in regularly.
- **Structural and visual changes in separate commits.**
- PR description includes before/after screenshots at 375 and 1440.
- One DEVLOG chapter per phase (what changed, what surprised you, decisions).
- Update the tracker (§1) and change log (§14).

### 8.2 Definition of Done (every phase)

- [ ] `npm test`, `npm run lint`, Stylelint, `npm run build` green
- [ ] Test count ≥ previous phase (no silent deletions)
- [ ] No raw hex/px-magic in components; tokens only
- [ ] Keyboard-only pass on touched screens
- [ ] `prefers-reduced-motion` pass on touched screens
- [ ] Contrast pass on new color pairs
- [ ] Checked at 375 / 768 / 1440
- [ ] Before/after screenshots in the PR
- [ ] DEVLOG chapter written

### 8.3 Test contract (what's load-bearing)

Your tests assert on **behavior**: roles, accessible names, visible text. So:

- **Safe to change freely:** layout, colors, animations, and DOM nesting that doesn't affect roles or the class names listed next.
- **Class names that tests DO depend on (the "class contract", verified in R0):** `.stat-row`, `.stat-row--highest`, `.stat-bar-fill` (StatBar, StatBarChart tests); `.stat-win`, `.stat-lose` (CompareStatRow); `.compare-stat-row` (CompareStatsChart); `.tcg-card` (TCGCardGrid, TCGCardGridItem); `.team-slot`, `.team-slot--empty`, `.team-slot--filled` (TeamSlots); `.active` on the nav links (Layout). Rename one only together with its test, in the same commit, or keep the old class and add new ones alongside it.
- **Load-bearing:** `role` attributes (`combobox`, `listbox`, `option`, `status`, `alert`, `dialog` when added), accessible names (`aria-label`s, the "Shiny" checkbox name, `Remove X from team`), visible strings that tests query (e.g., "Attack"), `aria-pressed` states, and the sprite `alt` convention.
- If a change _must_ alter one of these, update the test **in the same commit** and say why in the commit message.
- New logic gets tests first or alongside: sprite fallback chain, `useTypeTheme`, `useTypewriter`, `PreferencesProvider`, view-mode URL param, party data shape.

### 8.4 Progressive enhancement rule

Every effect must degrade to a working, static UI: no View Transitions → instant navigation; no `color-mix` → fallback color; reduced motion → no movement; JS animation failure → content still visible. **Content must never be hidden by an animation's initial state** unless that animation is guaranteed to run.

### 8.5 Budgets (proposals; finalize in R1)

- Core Web Vitals "good": LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (mobile emulation)
- Ambient animation only on the Stage; ≤ 1 concurrent animated sprite
- No layout-affecting property animations (`width`, `top`, …) except where unavoidable and small (the stat fill uses `transform: scaleX` or a compositor-friendly technique where possible)
- Bundle baseline (R0): JS 254.11 kB (80.22 kB gzip), CSS 15.81 kB (3.22 kB gzip). Any phase that grows either by a lot must justify it
- New dependencies: each needs a written reason and a measured size

### 8.6 Asset & IP policy

Fan project using public APIs (PokeAPI sprites/data; the Pokémon TCG API via your proxy). Pokémon names, sprites, and card art belong to their owners; we display them as the APIs provide them. **We create our own UI art, icons, sounds and fonts** (or use openly-licensed fonts). We do not copy game UI textures, proprietary fonts or game audio. Keep a short "Credits & disclaimer" footer/page in the app.

---

## 9. Risks

| #   | Risk                                                                  | Likelihood | Mitigation                                                                                        |
| --- | --------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| 1   | Motion overload or jank                                               | Med        | Four-tier vocabulary, Stage-only ambient, compositor-friendly properties, R9 audit, R10 profiling |
| 2   | Vibrant palette fails contrast                                        | High       | `-ink` tokens, contrast table in R1, re-check R10                                                 |
| 3   | Animated sprites: weight, layout shift, mixed fidelity next to HD art | Med        | Fixed boxes, lazy loading, Pixel/Art mode with clear fallback rules                               |
| 4   | Restyle breaks tests                                                  | Med        | Test contract (§8.3); safe/load-bearing lists                                                     |
| 5   | Scope creep into features                                             | High       | Scope boundary (§2); backlog rule (R12)                                                           |
| 6   | Vanilla and React drift apart                                         | Med        | Primitives-only-port principle; R11 sync note; same token files                                   |
| 7   | IP/asset problems                                                     | Low–Med    | §8.6; original UI art, open-licensed fonts, synthesized sound                                     |
| 8   | Newer CSS/browser API gaps                                            | Med        | §8.4 progressive enhancement; cross-browser in R10; verify support before relying                 |
| 9   | Fatigue: long project, late payoff                                    | Med        | Visible wins scheduled at R4–R5; small phases; tracker; celebrate each checkpoint                 |
| 10  | Live site half-old/half-new                                           | Med        | Integration branch + preview deploys (D1)                                                         |
| 11  | localStorage shape change breaks existing users' data (R7)            | Med        | Optional fields, tolerant parsing, tests with old-shape data                                      |
| 12  | `clip-path` pixel corners clip focus rings/shadows                    | Med        | Limit to `Window` frame; wrapper-based focus/shadow                                               |
| 13  | Tcg-proxy misbinding stresses the wrong Worker at R8                  | Med        | Fix the 09-17 follow-up before R8 starts                                                          |

---

## 10. Decision log

| ID  | Decision                           | Options                                              | Recommendation                                                                                         | Needed by | Answer |
| --- | ---------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------- | ------ |
| D1  | Branching / deploy strategy        | Integration branch; feature flag; straight to `main` | Integration branch + previews                                                                          | R0        |        |
| D2  | Theme axes                         | Type only; type + light/dark                         | Type only (dark/light → R12)                                                                           | R1        |        |
| D3  | Layout                             | Stage + Console everywhere; only on some pages       | Everywhere the content is "a Pokémon" (Home, Pokémon, Compare, Team); Library uses a wider grid layout | R4        |        |
| D4  | Font pairing                       | From specimen                                        | Pixel display + rounded body                                                                           | R1        |        |
| D5  | Sound                              | None; opt-in synthesized                             | Opt-in synthesized, off by default, in R9                                                              | R9        |        |
| D6  | Exit animations / motion library   | CSS-only; small library                              | Decide with a concrete case at R7                                                                      | R7        |        |
| D7  | Modal implementation               | Portal + semantics; native `<dialog>`                | Portal + semantics unless jsdom support checks out                                                     | R3        |        |
| D8  | Visual regression                  | Manual; Playwright                                   | Playwright in R10                                                                                      | R10       |        |
| D9  | Skeuomorphic console shell         | Yes; no                                              | No for v1 (backlog skin)                                                                               | R1        |        |
| D10 | Party card data                    | Fetch at render; extend persisted shape              | Extend with optional fields                                                                            | R7        |        |
| D11 | Sharing design system with vanilla | Copy; subtree; package                               | Copy + version note                                                                                    | R11       |        |
| D12 | Retire "no glow, no color bloom"   | Keep; retire w/ replacement rule                     | Retire, glow/gradient only when it carries type/state info                                             | R1        |        |

_(Add rows as new decisions appear. Never edit history; append a superseding row.)_

---

## 11. Component map (current → target)

| Current                                                | Target treatment                                                    | Phase      |
| ------------------------------------------------------ | ------------------------------------------------------------------- | ---------- |
| `Layout`                                               | Stage + Console shell, header menu with cursor, Tray, theme engine  | R4         |
| `HomePage` (one sentence)                              | Wild-encounter Home + battle-menu hub                               | R6         |
| `SearchBar` + autocomplete                             | Pokédex-style list, sprite rows, cursor                             | R6         |
| `FavoritesList`                                        | Tray strip with sprite icons, staggered enter, inviting empty state | R6         |
| `PokemonPage` / `PokemonCard`                          | Stage + tabbed Console                                              | R5         |
| `SpriteDisplay`                                        | Animated sprite w/ fallback chain, platform, Pixel/Art toggle       | R5         |
| `TypeBadgeList` / `TypeBadge`                          | Glossy pill w/ icon and ink-contrast text                           | R3         |
| `StatBarChart` / `StatBar`                             | `StatMeter` HP-style bars, stepped fill, tiers                      | R3, R5     |
| `MetaInfo`                                             | Labelled list (`th scope="row"` fix)                                | R5         |
| `EvolutionSection` / `EvolutionNode`                   | Animated connectors, sprite icons                                   | R5         |
| `FavoriteButton`, `TeamButton`                         | `Button` toggle variants + response animation                       | R3, R5     |
| Shiny checkbox                                         | Same native checkbox, restyled; sparkle moment                      | R3, R5     |
| `CompareView` / `CompareStatsChart` / `CompareStatRow` | Versus screen, tug-of-war bars, non-color winner signal             | R7         |
| `TeamSlots` / `TeamContext` UI                         | Party screen, Poké Ball empty slots, celebration                    | R7         |
| `TCGCardGrid` / `TCGCardGridItem`                      | Grid/Table/Binder, holo tilt, keyboard-accessible items             | R8         |
| `Modal` / `TCGCardModal`                               | `Dialog` primitive + zoom/tilt card modal                           | R3, R8     |
| `NotFoundPage`                                         | Tasteful glitch 404 in `MessageBox` voice                           | R9         |
| Status paragraphs (`Loading…`, errors)                 | `Spinner`/`Skeleton` + `MessageBox`                                 | R3, R5, R6 |
| `App.css`, `tokens.css`                                | Layered, split, three-tier tokens                                   | R1, R2     |

---

## 12. Copy & voice guide

Game flavor on top, plain meaning underneath. Errors say what happened and what to do. An action keeps the same name through the whole flow.

| Moment          | Copy                                                                                  |
| --------------- | ------------------------------------------------------------------------------------- |
| Loading         | "Searching the tall grass…"                                                           |
| Home greeting   | "A wild {NAME} appeared!" then "What will you do?"                                    |
| Not found       | "No Pokémon named "{query}" was found. Check the spelling or try its Pokédex number." |
| Network error   | "Couldn't reach the Pokédex. Check your connection and try again." (+ `Retry` button) |
| Favorite        | Button: "Add to favorites" → toast: "{Name} added to favorites."                      |
| Team add        | Button: "Add to team" → "{Name} joined your team!"                                    |
| Team full       | "Your team is full (6/6). Remove a member to add {Name}."                             |
| Team complete   | "Team complete!"                                                                      |
| Empty favorites | "No favorites yet. Tap ♥ on any Pokémon to keep it here."                             |
| Empty team slot | (icon only; accessible name "Empty team slot {n}")                                    |
| No cards        | "No TCG cards found for "{name}"." (unchanged)                                        |

Sentence case. Active voice. No jokes in error messages that hide what went wrong.

---

## 13. Working agreement & session kickoff

**How we'll work each session**

- We pick **one phase (or a slice of one)**, restate its goal and checkpoint, then build.
- **CSS/design:** I deliver finished files directly. I explain only design-system _philosophy_ and decisions (the "why" behind tokens, layers, motion vocabulary), not line-by-line CSS.
- **React/TypeScript/DevOps:** mentor format continues as usual: concept and why first, then step-by-step (what / which file / why / how), tradeoffs stated honestly, with the complete answer at the end of the message.
- DevOps and best-practice callouts stay in, wherever relevant (previews, CI gates, budgets, lint guardrails).
- Nothing outside the scope boundary (§2) gets added without a written decision.

**Kickoff template (paste at the start of each session)**

```
Project: pokemon-finder-react, UI Rehaul
Reference: docs/UI-REHAUL-ROADMAP.md (attached)
Current phase: R__  (slice: ______)
Last checkpoint reached: ______
Open decisions I've made since last time: D__ = ______
What I want this session: ______
```

**Recommended next steps**

1. Finish Phase 9 (CI/CD parity), then start **R0**.
2. While R0 runs, gather the reference screenshots (R0 task 6); they directly shape R1.
3. Answer D1 (branching), D2 (theme axes) and D9 (console shell) before R1 begins.

D1 Integration branch ui/rehaul + preview deploys (done in R0)
D2 Type-reactive theme only; light/dark deferred to R12
D9 No: no fake console frame around the UI (backlog skin only)

---

## 14. Change log

| Date       | Change                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-19 | Initial roadmap created (R0–R12).                                                                                                                                                         |
| 2026-09-19 | R0 walkthrough: corrected §8.3 (some tests depend on class names), added CI/preview and class-contract tasks, added measured baselines.                                                   |
| 2026-09-21 | R0 complete. D1, D2, D9 answered. R1 started.                                                                                                                                             |
| 2026-09-23 | Fonts locked: Jersey 10 + Nunito. D13 → B (slate/teal + gold selection). D14 added (elevation). primitives.css, semantic.css, motion.css written; contrast-checked; wired into index.css. | type-themes.css added: 18 types x deep/soft/ink derived and contrast-checked (zero AA failures), [data-type] mechanism wired. |
