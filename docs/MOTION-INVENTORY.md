# Motion inventory

Every `@keyframes` in the app, its tier (roadmap §5.5, plus the Status tier from D33), what starts it, and how it switches off. Add a row in the same commit as a new keyframe. Remove the row when the keyframe is deleted.

**Gates:**

- **token**: the duration is a `--dur-*` token, so it drops to 0 ms when motion is off (`motion.css`).
- **on-only**: the rule sits under `:root[data-motion="on"]`, so with motion off the animation does not exist. `motion-gate.test.ts` requires this for any literal duration.
- **JS**: the element is not rendered when `animationsEnabled` is false.

`data-motion` holds the resolved answer (the app setting, falling back to the OS), so one gate covers both `prefers-reduced-motion` and the in-app setting.

**R10B rules (D42, D59):** exactly one sequence plays on its own (the encounter). The only ambient motion is the field's stripe drift and the battle dialog's caret. Choreography with literal timings is on-only, so no starting state can hide content when motion is off.

## Current (start of R10B, 2026-11-21)

| Keyframe                                 | File                          | Tier                | Trigger                   | Gate       | R10B fate                                                                                                                     |
| ---------------------------------------- | ----------------------------- | ------------------- | ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `stage-idle`                             | components/Stage.css          | Ambient             | always on the Stage       | on-only    | **Retire** in B&W-4 (D42)                                                                                                     |
| `cursor-blink`                           | ui/Cursor.css                 | Ambient (cursor)    | menus                     | on-only    | Kept in the primitive (Menu); **B&W-3**: the nav no longer uses it (D46)                                                      |
| `compare-stat-grow`                      | components/CompareStatRow.css | Transition          | Compare renders           | token      | Replace in B&W-5 (bars grow from their outer edge)                                                                            |
| `versus-enter-left/right`                | components/CompareView.css    | Transition          | Compare renders           | token      | Replace in B&W-5 (slide in from the outer edges)                                                                              |
| `versus-badge-pop`                       | components/CompareView.css    | Response            | Compare renders           | token      | Replace in B&W-5 (VS slam)                                                                                                    |
| `evolution-draw`, `evolution-draw-down`  | components/EvolutionNode.css  | Transition          | tab opens                 | token      | Review in B&W-4 (drawn arrow)                                                                                                 |
| `favorite-first-in`                      | components/FavoriteButton.css | Celebration         | first favorite            | on-only    | Keep, restyle in B&W-4                                                                                                        |
| `favorite-enter`                         | components/FavoritesList.css  | Transition          | tray item added           | token      | Review in B&W-4 (rail)                                                                                                        |
| `lost-route-rustle`, `lost-route-hop`    | components/LostRouteScene.css | Ambient (404 scene) | 404                       | on-only    | Keep, recolor in B&W-8                                                                                                        |
| `shiny-star`                             | components/ShinySparkle.css   | Celebration         | Shiny turned on           | JS + token | Keep, restyle in B&W-4                                                                                                        |
| `team-complete-pop`, `team-complete-pip` | context/TeamButton.css        | Celebration         | sixth member added        | token      | Keep, restyle in B&W-4                                                                                                        |
| `team-slot-enter`, `team-slot-exit`      | context/TeamSlots.css         | Transition          | slot added / removed (D6) | token      | Replace in B&W-6 (rise in, slot leave)                                                                                        |
| `pop-icon`                               | ui/PopIcon.css                | Response            | toggle pressed            | on-only    | Keep                                                                                                                          |
| `skeleton-pulse`                         | ui/Skeleton.css               | Status (D33)        | loading                   | on-only    | Keep                                                                                                                          |
| `spinner-spin`                           | ui/Spinner.css                | Status (D33)        | loading                   | on-only    | Keep                                                                                                                          |
| `stat-meter-grow`                        | ui/StatMeter.css              | Transition          | stats render              | on-only    | **B&W-2**: replaced `stat-meter-fill` (width → `scaleX`, 600 ms, 50 ms stagger); B&W-4 adds the encounter's 380 ms head start |
| `message-box-caret`                      | ui/MessageBox.css             | Ambient (caret)     | dialog text finished      | on-only    | **B&W-2**: new. The ▼ bobs, 800 ms `steps(2)`; it is rendered only once the text is typed                                     |
| `party-pop`                              | components/PartyCounter.css   | Response            | a member joins            | on-only    | **B&W-3**: new. Only the joining member's pip (`usePartyArrival`), never on load; 550 ms `--ease-pop`                         |

Not keyframes, but moving. **B&W-3** removed the global Backdrop drift and the page-load intro (D42) and added three hover transitions on tokens: the nav's Mist wipe (`scaleX`), the brand mark's half turn and the settings gear's 60° turn (`--dur-slow`, `--ease-spring`). Still to go: the theme fade (`styles/theme-transition.css`, token) is retired in B&W-4 (D43), and route view transitions (`styles/route-transition.css`, token) stay.

## Planned for R10B (spec §6)

Each row moves into the table above, with its file, in the slice that builds it.

| Keyframe (planned)                  | Tier        | Trigger                          | Gate         | Slice |
| ----------------------------------- | ----------- | -------------------------------- | ------------ | ----- |
| encounter wipe (black + white slab) | Transition  | new Pokémon                      | on-only      | B&W-4 |
| encounter plate slide               | Transition  | new Pokémon                      | on-only      | B&W-4 |
| encounter sprite drop + silhouette  | Transition  | new Pokémon                      | on-only      | B&W-4 |
| stripe drift (26 s, field only)     | Ambient     | always on the field              | on-only      | B&W-4 |
| dialog type-out                     | Transition  | Home encounter                   | on-only      | B&W-5 |
| heart burst                         | Celebration | favorite turned on               | JS + on-only | B&W-4 |
| inline confirmation slide           | Response    | favorite / team toggled          | token        | B&W-4 |
| hop                                 | Response    | hover / focus on a listed sprite | token        | B&W-4 |
| VS slam                             | Transition  | either side changes              | on-only      | B&W-5 |
| slot leave                          | Transition  | member removed                   | token        | B&W-6 |
| deal                                | Transition  | Library loads                    | on-only      | B&W-7 |
| card flip                           | Transition  | dialog opens / Previous / Next   | on-only      | B&W-7 |
| page turn                           | Transition  | binder Previous / Next           | on-only      | B&W-7 |
| tile in                             | Transition  | view or sort changes             | on-only      | B&W-7 |
| sheet                               | Transition  | phone card details open          | token        | B&W-7 |
