//accessibility checks for tests, built on axe-core (the rules engine that
//Lighthouse, the axe browser extension and playwright's axe integration all use)
//
//why not the vitest-axe package: its only release is 0.1.0 and its types
//extend vitest's old global namespace, so on vitest 4 we write type glue
//anyway. this file is that glue plus the whole matcher: ~60 we own,
//one dependency (the engine itself), nothing to wait on upstream for
import axe from "axe-core";
import type { AxeResults, Result, RunOptions } from "axe-core";
import { expect } from "vitest";

//which rules run. axe tags every rule with the standard it comes from;
//R1 set our target to WCAG 2.1 AA, so we run exactly those tags
//(AA includes everything in A, but the A rules carry their own tags)
const OPTIONS: RunOptions = {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  },
  rules: {
    //jsdom builds a DOM but never lays it out or paints it: no computed
    //colours behind text, no sizes. axe would report contrast as
    //"incomplete" at best, so we switch it off here, on purpose and check
    //contrast in a real browser instead
    "color-contrast": { enabled: false },
  },
};

//runs axe on a DOM subtree. page tests pass document.body, not the
//container render() returns: dialog renders through a portal straight into
//<body>, outside that container, so a container only scan never sees it
export async function runAxe(node: Element): Promise<AxeResults> {
  return axe.run(node, OPTIONS);
}

//turns axe's big result object into a message a human can act on.
//which rule, how serious, where (CSS selector, the HTML), and a link
function describe(violation: Result): string {
  const where = violation.nodes
    .map((node) => `    at ${node.target.join(" ")}\n      ${node.html}`)
    .join("\n");
  return (
    `  [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}\n` +
    `${where}\n` +
    `    more: ${violation.helpUrl}`
  );
}

//a custom matcher is just a function that returns {pass, message}.
//expect.extend registers it, so tests can write:
//  expect(await runAxe(document.body)).toHaveNoViolations()
expect.extend({
  toHaveNoViolations(received: AxeResults) {
    const violations = received.violations;
    const pass = violations.length === 0;
    return {
      pass,
      message: () =>
        pass
          ? "expected axe violations, but there were none"
          : `expected no axe violations, found ${violations.length}:\n\n` +
            violations.map(describe).join("\n\n"),
    };
  },
});

//teaches TypeScript that the matcher exists. vitest 4 reads matcher types
//from the "vitest" module's matchers interface; declaring an interface with
//the same name merges into it (declaration merging). merging only works if
//the type parameter matchers vitest's own declaration exactly, 'any'
//included, hence the one line lint exception
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Matchers<T = any> {
    toHaveNoViolations(): T;
  }
}
