# Motion inventory

Every `@keyframes` in the app, its tier (roadmap §5.5, plus the Status tier from D33), what starts it, and how it switches off. Add a row in the same commit as a new keyframe. Remove the row when the keyframe is deleted.

**Gates:**

- **token**: the duration is a `--dur-*` token, so it drops to 0 ms when motion is off (`motion.css`).
- **on-only**: the rule sits under `:root[data-motion="on"]`, so with motion off the animation does not exist. `motion-gate.test.ts` requires this for any literal duration.
- **JS**: the element is not rendered when `animationsEnabled` is false.

`data-motion` holds the resolved answer (the app setting, falling back to the OS), so one gate covers both `prefers-reduced-motion` and the in-app setting.

**R10B rules (D42, D59):** exactly one sequence plays on its own (the encounter). The only ambient motion is the field's stripe drift and the battle dialog's caret. Choreography with literal timings is on-only, so no starting state can hide content when motion is off.

## Current (start of R10B, 2026-11-21)

| Keyframe                                 | File                            | Tier                | Trigger                            | Gate         | R10B fate                                                                                                                                        |
| ---------------------------------------- | ------------------------------- | ------------------- | ---------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `stage-idle`                             | components/Stage.css            | Ambient             | always on the Stage                | on-only      | **Retired in B&W-4** (D42): the keyframe is deleted                                                                                              |
| `cursor-blink`                           | ui/Cursor.css                   | Ambient (cursor)    | menus                              | on-only      | Kept in the primitive (Menu); **B&W-3**: the nav no longer uses it (D46)                                                                         |
| `compare-stat-grow`                      | components/CompareStatRow.css   | Transition          | Compare renders                    | token        | Replace in B&W-5 (bars grow from their outer edge)                                                                                               |
| `versus-enter-left/right`                | components/CompareView.css      | Transition          | Compare renders                    | token        | Replace in B&W-5 (slide in from the outer edges)                                                                                                 |
| `versus-badge-pop`                       | components/CompareView.css      | Response            | Compare renders                    | token        | Replace in B&W-5 (VS slam)                                                                                                                       |
| `evolution-draw`, `evolution-draw-down`  | components/EvolutionNode.css    | Transition          | tab opens                          | token        | **Retired in B&W-4**: the readout is visible at load on desktop, so a drawing arrow would be self-starting motion (D42). The arrow is static     |
| `favorite-first-in`                      | components/FavoriteButton.css   | Celebration         | first favorite                     | on-only      | **Retired in B&W-4**: replaced by the heart burst and the inline confirmation (the first favorite gets its own sentence)                         |
| `favorite-enter`                         | components/FavoritesList.css    | Response            | a favorite added while on the page | token        | **B&W-4**: the rail. Only tiles added on the page play it (`data-new`); the load-time stagger is gone (D42)                                      |
| `lost-route-rustle`, `lost-route-hop`    | components/LostRouteScene.css   | Ambient (404 scene) | 404                                | on-only      | Keep, recolor in B&W-8                                                                                                                           |
| `shiny-star`                             | components/ShinySparkle.css     | Celebration         | Shiny turned on                    | JS + on-only | **B&W-4**: restyled to five outlined four-point stars, 850 ms, staggered (spec 6.2); literal timings, so it moved under `data-motion="on"`       |
| `team-complete-pop`, `team-complete-pip` | context/TeamButton.css          | Celebration         | sixth member added                 | token        | Kept as is; it now shows on the black plate. Restyle with the Team slice (B&W-6)                                                                 |
| `team-slot-enter`, `team-slot-exit`      | context/TeamSlots.css           | Transition          | slot added / removed (D6)          | token        | Replace in B&W-6 (rise in, slot leave)                                                                                                           |
| `pop-icon`                               | ui/PopIcon.css                  | Response            | toggle pressed                     | on-only      | Keep                                                                                                                                             |
| `skeleton-pulse`                         | ui/Skeleton.css                 | Status (D33)        | loading                            | on-only      | Keep                                                                                                                                             |
| `spinner-spin`                           | ui/Spinner.css                  | Status (D33)        | loading                            | on-only      | Keep                                                                                                                                             |
| `stat-meter-grow`                        | ui/StatMeter.css                | Transition          | stats render                       | on-only      | **B&W-2**: `scaleX`, 600 ms, 50 ms stagger. **B&W-4**: `--stat-head-start` (380 ms on the Pokémon page readout)                                  |
| `message-box-caret`                      | ui/MessageBox.css               | Ambient (caret)     | dialog text finished               | on-only      | **B&W-2**: new. The ▼ bobs, 800 ms `steps(2)`; it is rendered only once the text is typed                                                        |
| `party-pop`                              | components/PartyCounter.css     | Response            | a member joins                     | on-only      | **B&W-3**: new. Only the joining member's pip (`usePartyArrival`), never on load; 550 ms `--ease-pop`                                            |
| `field-drift`                            | components/EncounterField.css   | Ambient             | always on the field                | on-only      | **B&W-4**: new. The stripes drift ±3 %, 26 s, `alternate`; the one ambient animation (D42)                                                       |
| `encounter-wipe`                         | components/PokemonEncounter.css | Transition          | new Pokémon (keyed layer mounts)   | on-only      | **B&W-4**: new. Black slab, then the white one 60 ms later, 640 ms `--ease-wipe`; both start and end off screen; `display: none` with motion off |
| `stage-drop`                             | components/Stage.css            | Transition          | new Pokémon                        | on-only      | **B&W-4**: new. 300 ms in, 500 ms: fall 60 px, squash, rebound 6 px                                                                              |
| `stage-reveal`                           | components/Stage.css            | Transition          | new Pokémon                        | on-only      | **B&W-4**: new. Silhouette, white flash, color; `steps(1)`, 900 ms. On a wrapper, so Shiny / Pixel swaps never replay it                         |
| `name-plate-in`                          | components/NamePlate.css        | Transition          | new Pokémon                        | on-only      | **B&W-4**: new. 260 ms in, 460 ms: slide from 56 px right and fade in                                                                            |
| `name-plate-total-grow`                  | components/NamePlate.css        | Transition          | new Pokémon                        | on-only      | **B&W-4**: new. The base stat total bar, 420 ms in, 600 ms `scaleX`                                                                              |
| `heart-burst`                            | components/HeartBurst.css       | Celebration         | favorite turned on                 | JS + on-only | **B&W-4**: new. Eight pieces in `--theme-accent`, 700 ms; keyed by `popKey`, never on arrival                                                    |
| `pokemon-note-in`                        | components/PokemonActions.css   | Response            | favorite / team toggled            | token        | **B&W-4**: new. The inline confirmation slides up 8 px; keyed per sentence, replaced not stacked                                                 |

Not keyframes, but moving. **B&W-3** removed the global Backdrop drift and the page-load intro (D42) and added three hover transitions on tokens: the nav's Mist wipe (`scaleX`), the brand mark's half turn and the settings gear's 60° turn (`--dur-slow`, `--ease-spring`). **B&W-4** retired the theme fade (`styles/theme-transition.css`, deleted, D43) and added: the field's color swap (`background-color`/`opacity` 1 ms after a 300 ms delay, on-only, so the sky changes under the black slab) and the hop on evolution stages and favorite tiles (`transform`, `--dur-base`, `--ease-spring`). Route view transitions (`styles/route-transition.css`, token) stay.

## Planned for R10B (spec §6)

Each row moves into the table above, with its file, in the slice that builds it.

| Keyframe (planned) | Tier       | Trigger                        | Gate    | Slice |
| ------------------ | ---------- | ------------------------------ | ------- | ----- |
| dialog type-out    | Transition | Home encounter                 | on-only | B&W-5 |
| VS slam            | Transition | either side changes            | on-only | B&W-5 |
| slot leave         | Transition | member removed                 | token   | B&W-6 |
| deal               | Transition | Library loads                  | on-only | B&W-7 |
| card flip          | Transition | dialog opens / Previous / Next | on-only | B&W-7 |
| page turn          | Transition | binder Previous / Next         | on-only | B&W-7 |
| tile in            | Transition | view or sort changes           | on-only | B&W-7 |
| sheet              | Transition | phone card details open        | token   | B&W-7 |
