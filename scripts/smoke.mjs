//post deploy smoke test: runs after a deploy, against the real deployed
//site. every earlier gate checked our code or our build; this checks the
//running system, including the parts no local test can see: Cloudflare's
//_redirects (SPA deep links) and _headers (caching), and TLS + DNS.
//
//usage: node scripts/smoke.mjs https://<deployment>.page.dev
//exits 0 when every check passes, 1 otherwise (CI marks ths job failed)

import { resolve } from "path";

const base = process.argv[2];
if (!base) {
  console.error("usage: node scripts/smoke.mjs <base-url>");
  process.exit(1);
}

//a brand new deployment can take a few seconds to answer everywhere, so a
//failed request is retired with exponential backoff: wait 1s, 2s, 4s,
//8s... each wait doubles, so a slow system gets breathing room quickly
//while a healthy one is checked at once. (fixed fast retries would hammer
//a struggling server; a single long wait would slow every healthy run.)
async function fecthWithRetry(url, attempts = 5) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      //5xx = the server is not ready or broken: worth retrying
      //anything else is a real answer, good or bad, so return it
      if (response.status < 500) return response;
      if (attempt === attempts) return response;
    } catch (error) {
      //network level failure (DNS not propagated yet, so connection reset)
      if (attempt === attempts) throw error;
    }
    const waitMs = 1000 * 2 ** (attempt - 1);
    console.log(`  … ${url} not ready, retrying in ${waitMs / 1000} s`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

const failures = [];
function check(name, ok, detail) {
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : `: ${detail}`}`);
  if (!ok) failures.push(name);
}

//1. the home page is served, as HTML, and is never cached long
const home = await fecthWithRetry(base + "/");
const html = await home.text();
check("home page answer 200", home.status === 200, `got ${home.status}`);
check(
  "home page is the app's HTML",
  html.includes('<div id="root">'),
  "no #root element in the response",
);
const homeCache = home.headers.get("cache-control") ?? "";
check(
  "index.html is re-checked on every visit (it points at the current build)",
  /max-age=0|no-cache/.test(homeCache),
  `cache-control is "${homeCache}"`,
);

// 2. a deep link works: _redirects rewrites /pokemon/... to index.html.
//   without it, sharing a link (or reloading) gives a 404
const deep = await fecthWithRetry(base + "/pokemon/pikachu");
const deepHtml = await deep.text();
check(
  "deep link /pokemon/pikachu serves the app (SPA rewrite)",
  deep.status === 200 && deepHtml.includes(`<div id="root">`),
  "got ${deep.status}",
);

// 3. the hashed bundle the HTML points at exists and is cached forever
const script = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
check("index.html references a hashed JS bundle", !!script, "none found");
if (script) {
  const asset = await fecthWithRetry(base + script);
  check(`${script} answer 200`, asset.status === 200, `got ${asset.status}`);
  const assetCache = asset.headers.get("cache-control") ?? "";
  check(
    "hashed assets are immutable (public/_headers applied)",
    assetCache.includes("immutable"),
    `cache-control is ${assetCache}`,
  );
}

if (failures.length > 0) {
  console.error(`\nsmoke: ${failures.length} check(s) failed on ${base}`);
  process.exit(1);
}
console.log(`\nsmoke: ${base} is healthy`);
