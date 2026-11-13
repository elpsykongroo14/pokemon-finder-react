// Build-output guard: runs AFTER `npm run build`, reads what will actually
// be deployed (dist/), and fails if anything dev-only leaked into it.
// A unit test over src/ can't prove this: exclusion happens in the
// bundler (import.meta.env.DEV -> false, then dead-code elimination).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";

// Words that must never appear in a production file. The style guide's
// route path ("/styleguide") lives in the JS and its root class
// (.styleguide) lives in the CSS; minifiers rename variables but never
// change strings, so both survive and make a reliable marker.
const FORBIDDEN = [/styleguide/i];

// Only text files can contain those strings; fonts and images are skipped.
const TEXT_FILE = /\.(html|js|css|map|json|txt)$/;

if (!existsSync(DIST)) {
  console.error(`check-dist: no ${DIST}/ folder. Run "npm run build" first.`);
  process.exit(1);
}

const files = readdirSync(DIST, { recursive: true, encoding: "utf8" }).filter(
  (path) => TEXT_FILE.test(path),
);

const problems = [];
for (const file of files) {
  const text = readFileSync(join(DIST, file), "utf8");
  for (const pattern of FORBIDDEN) {
    if (pattern.test(text)) problems.push(`${file} contains ${pattern}`);
  }
}

if (problems.length > 0) {
  console.error("check-dist: dev-only code found in the production build:");
  for (const problem of problems) console.error(`  - ${problem}`);
  // A non-zero exit code is how any script tells CI "this step failed".
  process.exit(1);
}

console.log(
  `check-dist: ${files.length} text files checked, nothing dev-only shipped.`,
);
