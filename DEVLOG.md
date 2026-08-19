08-07-26 porting non-DOM tests to the React project

first tests to land in pokemon-finder-react: sanitize.test.ts, sprites.test.ts, api.test.ts. logic in all three unchanged from the vanilla/TS versions none of them render anything or touch the DOM the way React Testing Library assertions would, so this migration didn't need RTL at all. worth noting explicitly: not every test in a framework migration has to change, only the ones coupled to the old rendering mechanism.

had to actually build the test runner first though, nothing was wired up yet. added vitest.config.ts (environment: jsdom, globals: false same reasoning as the main repo, ported unchanged) and jsdom as a devDependency. jsdom is needed even for sanitize.test.ts, which never renders anything itself escapeHTML's implementation calls document.createElement internally, so the test needs a fake document to exist even though the test code never queries one.

copied .env.test over unchanged (VITE_TCG_PROXY=https://fake-proxy.test) without it, fetchTCGCards's on api.test.ts fail loud guard fires during every test run since there's no real .env in a fresh checkout.

two real decisions, not just copy paste: wrote the tests as .test.ts instead of .test.js, since this project has no allowJs/checkJs history to be incremental about the way the vanilla repo did meaning these test files are now actually type checked, unlike their .js ancestors. and updated the vi.resetModules() + dynamic import trick in api.test.ts from ./api.js to ./api.ts, matching the explicit extension import convention the vite react-ts template already uses (main.tsx imports './App.tsx' the same way).

08-11-26 decomposing the display: components instead of render.ts functions

built the five components that replace what render.ts used to do imperatively. TypeBadge/TypeBadgeList, StatBar/StatBarChart, SpriteDisplay, MetaInfo, composed under a PokemonCard container. typeColors and the mainStats/MAX_STAT ordering moved from render.ts's shared scope into the one component that actually uses each (TypeBadge, StatBarChart) instead of a shared module colocation over premature sharing, promote to lib/ only when a second consumer shows up. SpriteDisplay imports getSpriteUrl from lib/sprites.ts unchanged.

StatBarChart computes highestValue with Math.max() directly in the render body instead of storing it in useState derived, not stored, recalculated fresh every render off of stats, no effect needed to keep it in sync. named this explicitly as the trap to avoid going forward: if a value can be computed from props/state you already have, don't give it its own useState.

MetaInfo intentionally drops flavor text for now that lives on the /pokemon-species endpoint, which usePokemon doesn't fetch (only /pokemon). left a TODO rather than silently faking it or expanding the hook's scope mid component build.

PokemonCard owns shiny toggle state via useState and drills it one level into SpriteDisplay. PokemonCard itself never reads shiny, purely a pass through first real feel of prop drilling. deliberately not reaching for Context yet even though the future phase's pain (favorites/team needing the same shiny state from a sibling branch) is visible from here; i will be letting the friction be felt before naming the fix.

08-13-6 favorites via context + useReducer

built the "wrong" version first on purpose: lifted favorites into App with useState, threaded isFavorite/onToggleFavorite through PokemonCard into a new FavoriteButton purely as pass-through props. PokemonCard never read either value itself, just forwarded them, one hop was enough to feel the actual cost: a component's signature polluted by a concern it doesn't own, and any future nesting multiplies it. that's the argument for Context, not a "React best practices say so" default.

refactored into src/context/FavoritesContext.tsx: createContext + useReducer + a useFavorites() hook that throws if called outside the provider instead of silently returning null. reducer (ADD/REMOVE) stays pure, no localStorage inside it. persistence moved to a useEffect keyed on the favorites array, since writing to storage is a side effect of state changing, not part of the state transition itself. lib/favorites.ts slimmed down to loadFavorites/saveFavorites, pure I/O only, wrapped the JSON.parse in try/catch since corrupted localStorage shouldn't crash the app on mount.

useReducer(reducer, undefined, loadFavorites) uses the lazy initializer form, same reasoning as usePokemon's AbortController pattern: only pay the read cost once, on mount, not every render.

context exposes named functions (toggleFavorite, removeFavorite) instead of raw dispatch, keeps the action shape as an internal detail of the provider. FavoriteButton stays a plain prop driven component, doesn't call useContext itself, only PokemonCard does since it's the one that owns the concern deliberately not sprinkling useContext into every component that touches favorites adjacent UI.

decided against moving shiny into Context: single component concern, nothing else reads it yet, no felt friction to justify it. decided against Redux/Zustand for the same reasoning in reverse one shared slice, two consumers, changes only on click, Context+useReducer is correctly sized. no state library earns its cost here.

08-15-26 evolution chains and type effectiveness

ported TYPE_CHART + computeDefensiveChart into lib/typeEffectiveness.ts, unchanged from render.ts, static game data, no API round trip needed, same reasoning as typeColors. buildEvolutionTree moved into lib/evolution.ts, pure ChainLink→EvolutionNode reshape, framework agnostic. added collectEvolutionNames alongside it, same recursive skeleton as buildEvolutionTree but flattening instead of nesting (flatMap vs map).

EvolutionNode.tsx is the first recursive component in the project renders itself per child for branching chains (Eevee's 8). learned that a type and a value can share a name in the same file (interface EvolutionNode + function EvolutionNode coexist, separate TS namespaces) but aliased the import anyway for readability. base case (no children) and recursive case share one `stage` JSX block to avoid duplicating markup.

wiring: added optional `{ signal }` to fetchSpecies/fetchEvolutionChain in api.ts, matching fetchPokemon's cancellation support needed once useEvolutionChain could fire a stale request race. useEvolutionChain does the two-step sequential fetch (species → chain, since the chain's URL only exists after species resolves), builds the tree, then batch-fetches every stage's sprite in parallel via Promise.all, and necessary since components can't await mid ender the way the old async renderEvolutionNode could. per stage sprite failures are swallowed individually so one broken stage doesn't kill the section.

EvolutionSection owns the loading/error/no evolution/success branching and mounts into PokemonCard as one more pass through prop, same pattern as every other card section. three separate commits: pure logic, wiring, sprites kept intentionally split since only the last two touch anything network facing.

08-18-26, team builder: reducer level invariants

built the team roster as useReducer, not another useLocalStorage backed dispatch like favorites state here is { members, error }, and error is transient UI state that has no business being written to disk on every toast, so persistence stays a useEffect keyed on state.members only, never the whole state object.

max 6 and duplicate checks live in teamReducer itself, not the click handler a rejected ADD returns members untouched with error set, so "team full" is a state the reducer structurally refuses to produce rather than a fact every future call site has to remember to check.

kept the auto-dismiss timer out of the reducer on purpose reducers stay pure, so the setTimeout(clearError, 3000) lives in TeamButton's useEffect instead, cleaned up on every re fire so a second rejection can't have its timer clear a newer error message.

TeamSlots always renders exactly 6 <li>s (filled or empty) instead of team.map(), direct port of renderTeam()'s fixed slot layout from the vanilla version a roster with capacity reads differently than an unbounded list, same data shape as favorites but a different UI metaphor on purpose.

08-18-26 compare mode: derived state closes the p1Bar/p2Bar bug for good

the bug in the vanilla project never really "forgot a null check" it was that highlightStats() stored highlight state in DOM classNames that had to be kept in sync by hand, across two separate querySelectorAll index lookups, and one branch got the sync right while the other didn't.

so nothing about "which stat wins" gets a useState anywhere. compareStat(left, right) is a pure function in lib/, called directly inside CompareStatRow's render body recomputed from the two props it's given, every render, with nowhere for it to disagree with the values it's rendering next to. no useEffect syncing a winner flag after the fact, which is exactly the pattern that would've reintroduced the same bug shape with hooks instead of DOM classes.

matching is by stat name (stats.find(s => s.stat.name === statName)) in both CompareStatsChart branches, not by array index, the actual mechanism behind the original bug (bars assumed to line up positionally between two separate DOM queries) isn't fixed here so much as it's not expressible in this code at all.

promoted STAT_ORDER/STAT_LABELS out of StatBarChart into lib/stats.ts once CompareStatsChart needed the same constants, getOrderedStats stayed behind in lib/stats.ts but isn't used by compare mode, since CompareStatsChart works off raw find() by name instead not everything tied to a promoted constant has to move with it.

self compare guard (isSelfCompare) is a boolean computed from data/compareData at render, not a shared error div getting hidden/unhidden defensively like vanilla's errorDiv
