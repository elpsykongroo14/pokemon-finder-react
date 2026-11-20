// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

//two guardrails from the Definition of Done (roadmap 8.2), turned into tests
//so a machine checks them on every run instead of a person remembering to
//like layers.test.ts, this reads real files, so it lives outside src/
const srcDir = fileURLToPath(new URL("../src/", import.meta.url));

function filesIn(extension: string): string[] {
  return readdirSync(srcDir, { recursive: true, encoding: "utf8" }).filter(
    (path) => path.endsWith(extension),
  );
}

function read(path: string): string {
  return readFileSync(`${srcDir}${path}`, "utf8");
}

//a comment can mention anything ("was #fff"), so strip them before scanning
function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("design tokens", () => {
  it("every var(--token) without a fallback is defined somewhere", () => {
    const declared = new Set<string>();

    for (const path of filesIn(".css")) {
      const css = withoutComments(read(path));
      //  --name: value;     and     @property --name { ... }
      for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) declared.add(m[1]);
      for (const m of css.matchAll(/@property\s+(--[\w-]+)/g))
        declared.add(m[1]);
    }
    //some variables are set from React: style={{ "--fav-slot": 2 }}
    for (const path of filesIn(".tsx")) {
      for (const m of read(path).matchAll(/["'](--[\w-]+)["']/g))
        declared.add(m[1]);
    }

    const offenders: string[] = [];
    for (const path of filesIn(".css")) {
      const css = withoutComments(read(path));
      //var(--x) closes right away = no fallback. var(--x, 1px) has one, and
      //is allowed to point at something that may not exist
      for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
        if (!declared.has(m[1])) offenders.push(`${path} uses ${m[1]}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("component CSS uses tokens, not raw colors", () => {
    //the style guide page is a dev-only specimen that has to show raw values
    const exempt = new Set(["pages/StyleGuide.css"]);
    const offenders: string[] = [];

    for (const path of filesIn(".css")) {
      const normalized = path.replaceAll("\\", "/");
      const inComponentCode = /^(components|pages|ui)\//.test(normalized);
      if (!inComponentCode || exempt.has(normalized)) continue;

      const css = withoutComments(read(path));
      for (const m of css.matchAll(
        /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g,
      )) {
        offenders.push(`${normalized} has raw color ${m[0]}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
