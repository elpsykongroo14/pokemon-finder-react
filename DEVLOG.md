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

08-23-2026 Routing and Shareable URLs: goal is to replace manual popstate history hacking with React Router, make every view deep linkable

ended up installing react-router-dom (v7 declarative mode),

shipped:

a route table:/, /pokemon/:name, /compare, /team, \* (404 page).

A Layout component (title, nav, global, favorites) wraps all routes via a pathless layout route + <Outlet />.

a PokemonPage that reads the selected Pokemon from useParams instead of local state.

a comparePage that reads both compare slots from useSearchParams (?a=&b=) instead of a compareMode boolean + string state.

FavoritesList/TeamSlots dropped their onSelect prop, naviguate via <Link> directly instead of a callback threaded down from App.

Retired CompareButton's toggle API and replaced with a plain nav button (compare is now one way navigation not a toggle)

key decisions: pokemon name is a path param (single required resource) compare targets are query params (optional, two independent slots). Declarative router mode kept, not framework/data mode, no reason to replace the existing usePokemon fetch hook pattern

08-24-2026 TCG library: reducer + portal, and the view toggle finally dies

library became real routes instead of a hidden view: /library (featured, shuffled) and /library/:name (search). replaces showLibrary/hideLibrary/restoreLibraryState entirely, router already does what that pushState hand rolling was doing.

useTCGLibrary hook: useReducer owns {cards, status, error} since a fetch resolves all three atomically, sortMode stays a separate useState next to it since it changes independently of any fetch. sorted cards are useMemo'd off cards+sortMode, never stored derived state killed the p1Bar/p2Bar bug back in compare mode, same rule applies here.

hit a real bug before writing the effect: fetchTCGCardsBatch swallows every per card error into [], so checking err instanceof AbortError in the catch block would never fire on a cancelled featured cards batch. switched to checking controller.signal.aborted right after each await instead of trusting the error type, more robust in general, not just a workaround for this one function.

added {signal} to fetchTCGCards/fetchTCGCardsBatch in api.ts, matching fetchPokemon/fetchSpecies, wasn't needed in vanilla since nothing there could unmount mid fetch.

modal is Modal.tsx (generic, createPortal into document.body) wrapping TCGCardModal (the pokemon specific content). escape key + body scroll lock are both useEffect cleanup functions now instead of manual .hidden toggling, closing the modal = unmounting = cleanup runs itself. getCardMetaRows moved to lib/tcg.ts as a pure function returning data instead of building an innerHTML string, means escapeHTML's job disappears entirely, JSX escapes {value} by default.

deliberately dropped the IntersectionObserver batching from renderCardGrid. that existed to stop 250 sequential appendChild calls from janking the thread, react's reconciler doesn't have that cost profile, loading="lazy" on the imgs is doing the actual heavy lifting either way. noted as a tradeoff to revisit with virtualization if card counts ever grow past a few hundred, not assumed away.

SearchBar got a placeholder prop instead of a new search component, first real payoff of building it generic back then.

08-26-2026 debounce live search and autocomplete

shipped live autocomplete on the search bar, typing filters against the cached pokemon name list, shows up to 8 ranked matches (prefix matches before substring matches) and previews the currently highlighted match (sprite, name, dex number) before commiting to a search, full keyboard support and mouse support, both wired to trigger the actual search immediately.

this was the last vanilla js feature left to port and it was the hardest one, the original implementation depended on a module level AbortController variable that had to be manually reassigned on every keystroke to keep cancellation working. That pattern has no equivalent in a function component (there's no persistent module state to hang a mutable controller off). Porting it honestly, instead of papering over the gap, forced a real answer to "how does React want you to cancel stale async work?"

the build:

lib/autocomplete.ts: pure filterNames(), ported and unit testable in isolation, same pattern as sprites.ts/sanitize.ts.

hooks/useDebounce.ts: a generic hook that debounces a value, not a callback. Chose this over a hook wrapping the vanilla debounce<Args> callback pattern specifically to avoid stale-closure bugs that come from re created callbacks on every render; a debounced value plugs cleanly into useEffect dependency arrays instead.

hooks/useAutocomplete.ts: owns all six pieces of interaction state (query debounce, matches, highlight index, preview, open/dismissed) and both useEffects one resetting the highlight when matches change, one fetching the preview for the highlighted name (not the raw query those diverge during keyboard nav) with AbortController cleanup.

components/SearchBar.tsx: first real use of useRef for imperative DOM access (refocusing the input after a mouse-click selection), plus a fix for a classic autocomplete bug: onMouseDown={e => e.preventDefault()} on each option, to stop the browser from blurring the input (and closing the dropdown) before the click handler fires.

08-29-2026 infra + first three components:

added @testing-library/react (jest-dom and user-event were already devDependencies but the render()/screen half of the stack was missing). new src/test-setup.ts registers jest-dom's matchers via the /vitest entrypoint and calls cleanup() in an afterEach necessary by hand since vitest.config.ts runs with globals: false, so RTL's own auto cleanup hook never fires. wired into vitest.config.ts via setupFiles.

FavoriteButton.test.tsx: first RTL test in the project. getByRole over className/test-id on purpose aria-pressed was already correct on the button, so no accessibility gap to work around. three cases: unfavorited render, favorited render, onToggle fires on click via user-event.

PokemonCard.test.tsx: first use of vi.mock, and the harder case the
component composes six children plus useFavorites, and EvolutionSection fetches for real on mount. mocked useFavorites and every child not under test (TypeBadgeList, StatBarChart, MetaInfo, evolutionSection, TeamButton) so the test only proves PokemonCard's own two jobs: shiny toggle state and favorite button wiring, not re-proving what each child already gets tested for on its own. hit the vi.mock hoisting gotcha here vi.mock calls get hoisted above regular imports, so a plain `const toggleFavorite = vi.fn()` referenced inside the factory throws a TDZ error; fixed with vi.hoisted()

FavoritesList.test.tsx: opposite call from PokemonCard this component's whole job is rendering real favorites state, so mocking useFavorites would test nothing real. wrapped render() in the real FavoritesProvider + MemoryRouter instead (Link needs a router in the tree; MemoryRouter over BrowserRouter since it doesn't touch the real URL bar). seeded state by writing straight to localStorage before render, same mechanism useLocalStorage's lazy initializer already reads from, no backdoor needed. jsdom's localStorage is a real singleton shared across tests in a file though, so added beforeEach(() => localStorage.clear()) to stop state leaking test to test. also first use of queryByRole (returns null instead of throwing) to assert a favorite is gone after removal, versus getByRole for asserting something exists.

09-02-26: testing pass: reducers + pure lib layer:

Landed on splitting the work bottom-up pure functions and reducers first, since they need nothing but Vitest, no DOM, no mocking gymnastics before touching anything that needs React Testing Library. Figured getting the AAA pattern and "test behavior not implementation" solid on boring, deterministic functions first would make the RTL stuff land better later, rather than learning both at once.

Wrote full coverage for both reducers first teamReducer and tcgLibraryReducer. The one that actually taught me something: tcgLibraryReducer's FETCH_START case deliberately throws away the previous search's cards instead of spreading ...state, specifically so a stale results grid doesn't sit behind the loading spinner looking like it belongs to the new search. Wrote a test that arranges a state with stale cards already in it before dispatching FETCH_START, so the test can actually catch someone "cleaning up" that line back to the more obvious-looking spread later.

Then knocked out the rest of the pure lib/ layer: statComparison, stats, evolution, autocomplete, typeEffectiveness, tcg. A few things worth remembering from this batch:

evolution.ts was my first recursive function to test had to actually think about base case vs. recursive case as distinct things to prove, not just "call it once and check the output."

typeEffectiveness.ts has a full 18×18 type chart realized fast that hand-testing every matchup is a waste of time, and the better move for a big static data table is a couple of targeted behavior checks (a plain weakness, a plain resistance, an immunity, and the 4x dual-type compounding case) plus a separate "data integrity" test that walks the whole table checking every referenced type name is real, which is the actual bug this kind of file is prone to: typos, not logic errors.

09-04-2026: testing pass: hooks (useDebounce, useLocalStorage, usePokemon, useAutocomplete)

First real hook testing session. Had to settle the actual mechanics before writing anything: useState/useEffect need a fiber to hang state off of, so a hook can't be called from a plain test function the way a pure function can needs either a real consuming component rendering it, or renderHook standing in as a throwaway host. Went with renderHook for everything this session since none of these six hooks are meaningfully owned by one component; noted useFavorites/useTeam are the opposite case (already covered indirectly through the components that use them) and will only need renderHook for their outside-provider throw guard, not the whole hook.

useDebounce first, since it's dependency free and it's the one every other async hook in this session builds on. Used vi.useFakeTimers() + vi.advanceTimersByTime() instead of real waits a debounce test suite that actually sleeps 300ms per assertion doesn't scale and gets flaky under load.

useLocalStorage next, mostly to establish that jsdom's localStorage is real, not something to mock same reasoning FavoritesList.test.tsx already leaned on, just applied one layer down.

usePokemon is where the real complexity started. Mocked lib/api.ts at the module boundary with vi.mock + vi.hoisted (same TDZ gotcha as PokemonCard.test.tsx, vi.mock factories get hoisted above the import that would otherwise define the mock fn) instead of mocking fetch directly, so the test only proves "does this hook manage loading/data/error given what fetchPokemon returns," not the network layer that api.test.ts already owns. New tool: waitFor, needed because promise resolution lands a tick after the synchronous loading = true, asserting on data immediately instead of waiting for it would've been flaky by construction, not just occasionally.

useAutocomplete composed everything above. Explicitly did not re-test debounce timing here it already has its own file, so useAutocomplete's tests get to trust it as a building block instead of re-litigating 250ms delays. That decision also killed fake timers for this file: mixing vi.useFakeTimers with waitFor's own internal polling is a known way to hang a test, so went with real elapsed time instead, since the delay's short and the isolation already exists elsewhere. Slower test file, on purpose.
