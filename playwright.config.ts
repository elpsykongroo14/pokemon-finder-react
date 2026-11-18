//Playwright: end-to-end tests in a REAL browser against the PRODUCTION build.
//Vitest (src/**/*.test.tsx) checks units in jsdom in milliseconds; these few
//tests check that the shipped app works as a whole: real routing, real
//bundling, real browser APIs. top of the test pyramid: few, slow, valuable
import { defineConfig, devices } from "@playwright/test";

//GitHub Actions sets CI=true; locally it is unset
const CI = !!process.env.CI;
const PORT = 4173;

export default defineConfig({
  testDir: "./e2e",
  //each test file runs in its own worker process; tests inside a file run
  //in order. our tests never share state, so files can run side by side
  fullyParallel: true,
  //a stray test.only() left in a commit would silently skip every other
  //test: on CI that is an error, not a shortcut
  forbidOnly: CI,
  //one retry on CI only. a test that passes on retry is reported as FLAKY
  //(not hidden): it tells you to fix it, while not blocking the merge
  retries: CI ? 1 : 0,
  //one worker on CI, as Playwright's CI guide recommends: shared CI machines
  //are small, and tests competing for CPU become slow and flaky. locally,
  //Playwright picks a number from your CPU count
  workers: CI ? 1 : undefined,
  //"list" prints progress; "html" writes playwright-report/ (uploaded by CI
  //when something fails, so you can open the report from the run's page)
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: `http://localhost:${PORT}`,
    //on a failure's retry, record a trace: every action, DOM snapshot,
    //network call and console line, replayable with `npx playwright show-trace`
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    //the app respects prefers-reduced-motion; tests should not wait for
    //animations, and real users with this setting get the same app
    reducedMotion: "reduce",
    //a single click or fill that cannot happen within 10 s fails with a
    //specific message ("element is not visible") instead of eating the whole
    //30 s test timeout and reporting only "Test timeout exceeded"
    actionTimeout: 10_000,
  },

  //Chromium only (roadmap R10 rescope): the goal is "the app works", not a
  //browser compatibility matrix
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  //Playwright starts the server itself and waits until the URL answers.
  //`build` + `preview` = the production bundle, not the dev server: we test
  //what we ship. VITE_TCG_PROXY is a fake address the tests intercept
  //(Vite bakes VITE_* variables in at BUILD time, so it must be set here)
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    env: { VITE_TCG_PROXY: "https://tcg-proxy.e2e.test" },
    //locally, reuse a server you already started; CI always builds fresh
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
