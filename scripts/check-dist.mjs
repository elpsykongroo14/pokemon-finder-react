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
// R10B (D63): CSS raised 12 -> 13.5 at B&W-4 (measured 13.18). The whole
// Pokémon page (field, encounter, plate, rail, readout) lands while Home
// still ships StageConsole, Panel, BattleMenu, Menu and Cursor (about
// 1.5 kB, gone in B&W-5). B&W-8 ratchets this back down.
// R10B (D64): JS 93 -> 93.5 and CSS 13.5 -> 14.5 at B&W-5 (measured 93.23 /
// 14.46). The retired Home CSS did leave (StageConsole, Panel, Menu, Cursor,
// the old BattleMenu and versus badge: 0 rules left in the bundle); what
// remains is new: the command plate, the versus field, the identity band
// with its pickers, the stat duel (+1.23 kB CSS gzip), and the command,
// reroll, pick / swap and pending-comparison logic (+1.83 kB JS gzip).
// B&W-8 ratchets both back down.
// R10B (D65): JS 93.5 -> 93.75 and CSS 14.5 -> 15.25 at B&W-6 (measured
// 93.54 / 15.00). The old party grid's CSS was replaced, not kept beside
// the new one; the growth is the title band, the party cards with their
// mini fields, stat bars and open slots (+0.53 kB CSS gzip), and the stat
// total on team members, its backfill and the TransitionLink size (+0.30
// kB JS gzip). B&W-8 ratchets both back down.
// R10B (D66): JS 93.75 -> 97.25 and CSS 15.25 -> 18.5 at B&W-7 (measured
// 96.98 / 18.31). The Library is the largest screen and was rebuilt, not
// restyled: the hero with the hand and its deal, the sticky toolbar and
// legend, four tier marks, the shared tilting card face, the timeline
// grid, the six-column table, binder spreads with the page turn, the card
// dialog with its flip and the phone sheet, and the Pokémon page's cards
// teaser (+3.26 kB CSS gzip; the old Library CSS and CardChip are gone),
// plus the card helpers, spreads, card stepping and lazy loading (+3.44 kB
// JS gzip). B&W-8 ratchets both back down.
// R10B (D67), B&W-8, the ratchet: CSS 18.5 -> 18.4, JS 97.25 -> 97.5
// (measured 97.21 / 18.21). The planned ratchet down mostly could not
// happen: the retired primitives (Panel, StageConsole, Menu, Cursor,
// Toggle, Input) had already left the production bundle in B&W-5, since
// only the dev-only style guide still imported them; deleting them, the
// .surface-window scope and the dead tokens took off about 0.1 kB CSS.
// JS grew 0.23 kB for the Library's Retry, keeping focus at the ends of
// the binder and the dialog, and sprites that follow the setting in the
// favorites rail and on team cards. Every increase above was a feature,
// not a leftover; from here the budgets only go down.
const BUDGET_KB = { js: 97.5, css: 18.4 };

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
