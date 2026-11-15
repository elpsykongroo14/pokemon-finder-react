# Accessibility checklist: R10 manual gate

Run on the **production preview** (`npm run build && npm run preview`, with
`VITE_TCG_PROXY` set in `.env`), not the dev server.
Verdicts: ✓ pass · ✗ fail (describe) · ? unsure (describe). Bring every ✗ and ? back.

Tester: ______ Date: ______ Browser + OS: ______ Screen reader: ______

## 0. Automated results (filled in by R10 Parts 2–3)

| Check                                                    | Tool                                     | Result                                                                     |
| -------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| WCAG 2.1 A+AA rules, 12 page states                      | axe-core in Vitest (`npm run test:a11y`) | 0 violations                                                               |
| Page titles, every route                                 | `src/a11y/titles.test.tsx`               | pass (fixed in R10)                                                        |
| Text contrast, 965 elements × 25 states (18 type themes) | pixel sampling, real Chrome              | 0 below 4.5:1 / 3:1                                                        |
| Focus ring contrast at every Tab stop                    | real Chrome                              | ≥ 3:1 everywhere after fix (Stage toggles were 1.87–2.82:1)                |
| Reflow at 320 px                                         | real Chrome                              | no page overflow after fix; Library table scrolls in its own box (allowed) |
| `×` remove button, label in name (2.5.3)                 | review                                   | pass: symbol is not text; full name is descriptive                         |

## 1. Keyboard only

Run in Chrome on the production build, keys pressed by script, focus recorded after each key.

| #   | Result                                                                                                                                                                                        | Verdict       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| K1  | nav → search → Search → Settings → page → party → footer on every page; indicator visible at every stop (Part 3 measurements)                                                                 | ✓             |
| K2  | "pi" → options pichu, pikachu; ↓↑ move aria-activedescendant; Esc closes the list and keeps "pi"; Enter opens the highlighted Pokémon                                                         | ✓             |
| K3  | Stage toggles ring ≥ 8.68:1 on all 18 types after the R10 fix                                                                                                                                 | ✓             |
| K4  | Only the active tab is a Tab stop (tabIndex 0/-1/-1); → / Home / End move and select; Tab enters the panel                                                                                    | ✓             |
| K5  | Favorite and Add to Team work with Enter; focus stays on the button, which changes state                                                                                                      | ✓ (see F3)    |
| K6  | Versus screen has no controls of its own; both sides reached via search                                                                                                                       | ✓             |
| K7  | Removing a member moves focus to the "Your party" list (not lost); "pikachu removed from your team." announced                                                                                | ✓             |
| K8  | Grid / Table / Binder radios switch with arrows and update ?view=; binder page button reachable                                                                                               | ✓             |
| K9  | Card dialog: focus stays inside for Tab and Shift+Tab; Esc closes; focus returns to the opening card                                                                                          | ✓             |
| K10 | Settings dialog: Tab escaped the dialog when the checked radio was not the last radio in the DOM. **Fixed in R10** (`getTabStops`, regression test); re-verified with Auto / On / Off checked | ✓ (after fix) |
| K11 | Offline: alert "Couldn't reach the Pokédex. Check your connection and try again."; Retry reachable; after Retry focus stays on the page wrapper, not body                                     | ✓             |
| K12 | No traps found on any page                                                                                                                                                                    | ✓             |

## 2. Screen reader (accessibility tree + live-region recording; real SR still recommended for S4/S5)

| #   | Result                                                                                                                                                                | Verdict    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| S1  | Every page: banner, navigation "Main", search, main, complementary "Favorites and party", contentinfo (Home also has navigation "Quick menu"); correct per-page title | ✓          |
| S2  | Exactly one h1 per page, one h2 per page, h3s under it, no skipped levels                                                                                             | ✓          |
| S3  | combobox with aria-expanded / aria-controls / aria-autocomplete=list / aria-activedescendant; options named "pichu", "pikachu" (the ▶ cursor is not in the name)      | ✓          |
| S4  | Search from Home → URL changes, **focus stays in the search box, nothing announced** (only document.title changes, which screen readers do not speak)                 | ✗ → D35    |
| S5  | Nav link → **focus stays on the link, nothing announced**                                                                                                             | ✗ → D35    |
| S6  | First favorite announces "First favorite! It's waiting in your tray."; Add to Team announces via the button's pressed state                                           | ✓ (see F3) |
| S7  | Stats are `meter` elements named "HP", "Attack"…, value 35 of 0–255                                                                                                   | ✓          |
| S8  | Each compare row has text for both sides ("tied" in the test data; "higher" / "lower" otherwise)                                                                      | ✓          |
| S9  | Table named after the search; column headers scope=col; row headers scope=row; aria-sort goes none → ascending when sorted                                            | ✓          |
| S10 | Dialog named "Pikachu card details"                                                                                                                                   | ✓          |
| S11 | Error alert inserted on failure, and inserted again after a failed Retry (after the loading status), so it is announced each time                                     | ✓          |

## 3. Zoom and text spacing (emulated with viewport widths)

| #   | Result                                                                                       | Verdict |
| --- | -------------------------------------------------------------------------------------------- | ------- |
| Z1  | 200 % (640 px): all 8 page states fit, nothing clipped                                       | ✓       |
| Z2  | 400 % (320 px): no page overflow; Library table scrolls inside its own box (allowed)         | ✓       |
| Z3  | WCAG text-spacing CSS at 1280 px and 640 px: no clipped or overflowing text in 8 page states | ✓       |

## 4. Motion

| #   | Result                                                                                                   | Verdict     |
| --- | -------------------------------------------------------------------------------------------------------- | ----------- |
| M0  | Normal: backdrop drift (24 s, looping) + cursor blink; Stage shows the animated sprite                   | (reference) |
| M1  | OS reduce motion: `data-motion="reduced"`, 0 running animations on Home, Pokémon, Library; static sprite | ✓           |
| M2  | OS normal + in-app Animations "Off": same as M1, and it survives a reload                                | ✓           |
| M3  | Animation is controlled by the Settings dialog (Auto / On / Off), saved and applied everywhere           | ✓           |

## 5. Findings

| #   | Check   | What happened                                                                                                                   | Severity                   | Decision                                                    |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------- |
| F1  | K10     | Tab escaped the Settings dialog (radio group vs trap)                                                                           | High                       | Fixed in R10, regression test                               |
| F2  | S4, S5  | In-app navigation is silent for screen readers; keyboard focus stays in the header                                              | High (level A in practice) | D35                                                         |
| F3  | K5 / S6 | "Add to Team" changes its label ("On Team") AND its pressed state, so a screen reader hears "On Team, pressed": the state twice | Low                        | Open: keep the label fixed or drop aria-pressed (after D35) |
