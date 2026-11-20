//the network layer for every end to end test: a Playwright fixture
//
//Playwright builds a fixture before the test, hands it over, and runs the code
//after 'use()' once the test is done: setup and teardown in one place.
//'auto: true' means every test gets it, even one that never mentions it:
//no test can forget to fake the network
import { test as base, expect } from "@playwright/test";
import { fakeBackend } from "../src/testing/fakeBackend";

//a 1x1 transparent PNG: real image bytes for every sprite and card, so
//images "load" instantly and identically on every run
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

export interface FakeNetwork {
  //make every request whoe URL matches fail with 'status', until restore()
  outage(pattern: RegExp, status?: number): void;
  restore(): void;
}

export const test = base.extend<{ network: FakeNetwork }>({
  network: [
    async ({ page }, use) => {
      //requests to hosts nobody planned for; checked when test ends
      const unexpected: string[] = [];
      let down: { pattern: RegExp; status: number } | null = null;

      //intercept everything that is not our own server (localhost)
      await page.route(/^https?:\/\/(?!localhost)/, async (route) => {
        const request = route.request();
        const url = request.url();

        if (down?.pattern.test(url)) {
          return route.fulfill({ status: down.status, body: "outage" });
        }
        if (request.resourceType() === "image") {
          return route.fulfill({ contentType: "image/png", body: TINY_PNG });
        }
        const answer = fakeBackend(url);
        if (answer) {
          return route.fulfill({
            status: answer.status,
            contentType: answer.contentType,
            body: answer.body,
            //the app calls these hosts cross-origin, so the browser still
            //applies CORS to our fake answers, exactly like the real ones
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        }
        //fail closed: an unknown host is blocked and remembered, never
        //silently fetched from the real internet (which would make tests
        //slow, flaky, and dependent on someone elses server)
        unexpected.push(url);
        return route.abort("blockedbyclient");
      });

      await use({
        outage(pattern, status = 503) {
          down = { pattern, status };
        },
        restore() {
          down = null;
        },
      });

      //teardown: runs after the test body
      expect(
        unexpected,
        "the app called hosts the fake back end does not known",
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
