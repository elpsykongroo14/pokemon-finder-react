// Build-output guard: runs AFTER `npm run build` and checks dist/, the
// thing we actually deploy (a unit test over src/ cannot see bundler output).
// Two checks:
//   1. nothing dev-only shipped (the /styleguide page)
//   2. size budgets: total gzip size of all JS and of all CSS
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const DIST = "dist";

// --- 1. dev-only code -------------------------------------------------------
// The style guide's route path ("/styleguide") lives in the JS and its root
// class (.styleguide) in the CSS; minifiers rename variables but never change
// strings, so both survive and make a reliable marker.
const FORBIDDEN = [/styleguide/i];
const TEXT_FILE = /\.(html|js|css|map|json|txt)$/;

// --- 2. budgets (kB of gzip, the bytes that actually cross the network) ----
// Set in R10 from THIS script's own measurement (JS 89.8, CSS 10.4).
// Vite's build log prints bigger numbers (93.1 for the same JS) because it
// compresses at a different level: always compare numbers measured the same
// way. The headroom is small on purpose: a budget is a ratchet. When the app
// gets smaller, lower the number; when a change needs more, raising it is a
// decision that shows up in code review, not an accident nobody noticed.
// TOTALS per type, not per file: splitting one file into two must not be a
// way to dodge the budget.
// R10B (D60): CSS raised 11 -> 11.5 at B&W-1. The new design tokens sit next
// to the retired slate/teal/gold ones until B&W-8 deletes those; ratchet back
// down then.
// R10B (D61): CSS raised 11.5 -> 12 at B&W-2. The new primitives ship while
// the retired shell/stage/menu CSS still does (it leaves in B&W-3 to B&W-5).
const BUDGET_KB = { js: 93, css: 12 };

if (!existsSync(DIST)) {
  console.error(`check-dist: no ${DIST}/ folder. Run "npm run build" first.`);
  process.exit(1);
}

const files = readdirSync(DIST, { recursive: true, encoding: "utf8" });
const problems = [];

for (const file of files.filter((path) => TEXT_FILE.test(path))) {
  const text = readFileSync(join(DIST, file), "utf8");
  for (const pattern of FORBIDDEN) {
    if (pattern.test(text)) problems.push(`${file} contains ${pattern}`);
  }
}

const totals = { js: 0, css: 0 };
for (const file of files) {
  const type = file.endsWith(".js")
    ? "js"
    : file.endsWith(".css")
      ? "css"
      : null;
  if (!type) continue;
  // level 9 = maximum compression, what a CDN serves for static files
  totals[type] += gzipSync(readFileSync(join(DIST, file)), {
    level: 9,
  }).length;
}

for (const [type, bytes] of Object.entries(totals)) {
  const kb = bytes / 1024;
  const budget = BUDGET_KB[type];
  const line = `${type.toUpperCase()} ${kb.toFixed(2)} kB gzip (budget ${budget} kB)`;
  if (kb > budget) problems.push(`over budget: ${line}`);
  else console.log(`check-dist: ${line}`);
}

if (problems.length > 0) {
  console.error("check-dist: the production build failed its checks:");
  for (const problem of problems) console.error(`  - ${problem}`);
  // a non-zero exit code is how any script tells CI "this step failed"
  process.exit(1);
}

console.log("check-dist: nothing dev-only shipped, all budgets met.");
