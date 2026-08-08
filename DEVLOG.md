08-07-26 porting non-DOM tests to the React project

first tests to land in pokemon-finder-react: sanitize.test.ts, sprites.test.ts, api.test.ts. logic in all three unchanged from the vanilla/TS versions none of them render anything or touch the DOM the way React Testing Library assertions would, so this migration didn't need RTL at all. worth noting explicitly: not every test in a framework migration has to change, only the ones coupled to the old rendering mechanism.

had to actually build the test runner first though, nothing was wired up yet. added vitest.config.ts (environment: jsdom, globals: false same reasoning as the main repo, ported unchanged) and jsdom as a devDependency. jsdom is needed even for sanitize.test.ts, which never renders anything itself escapeHTML's implementation calls document.createElement internally, so the test needs a fake document to exist even though the test code never queries one.

copied .env.test over unchanged (VITE_TCG_PROXY=https://fake-proxy.test) without it, fetchTCGCards's on api.test.ts fail loud guard fires during every test run since there's no real .env in a fresh checkout.

two real decisions, not just copy paste: wrote the tests as .test.ts instead of .test.js, since this project has no allowJs/checkJs history to be incremental about the way the vanilla repo did meaning these test files are now actually type checked, unlike their .js ancestors. and updated the vi.resetModules() + dynamic import trick in api.test.ts from ./api.js to ./api.ts, matching the explicit extension import convention the vite react-ts template already uses (main.tsx imports './App.tsx' the same way).
