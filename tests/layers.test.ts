// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

//the docblock above switches THIS file out of jsdom: it reads real files,
//and jsdom pretends every file lives at http://localhost
//this test reads files from disk, so it lives OUTSIDE src/.
//src/ is compiled for the browser and deliberately knows nothing about Node;
//tests/ is compiled by tsconfig.node.json, which does.
const srcDir = fileURLToPath(new URL("../src/", import.meta.url));

function declaredLayers(): string[] {
  const source = readFileSync(`${srcDir}styles/layers.css`, "utf8");
  //matches the one-line order statement:  @layer reset, tokens, base, ...;
  const statement = source.match(/@layer\s+([^;{]+);/);
  if (!statement) throw new Error("layers.css has no @layer order statement");
  return statement[1].split(",").map((name) => name.trim());
}

function cssFilesInSrc(): string[] {
  return readdirSync(srcDir, { recursive: true, encoding: "utf8" }).filter(
    (path) => path.endsWith(".css"),
  );
}

describe("cascade layers", () => {
  it("every @layer block in the app uses a layer declared in layers.css", () => {
    const declared = new Set(declaredLayers());
    const offenders: string[] = [];

    for (const path of cssFilesInSrc()) {
      const source = readFileSync(`${srcDir}${path}`, "utf8");
      //only BLOCKS (@layer name { ... }) count, not the order statement itself
      for (const match of source.matchAll(/@layer\s+([\w-]+)\s*\{/g)) {
        if (!declared.has(match[1])) {
          offenders.push(`${path} uses undeclared layer "${match[1]}"`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("declares the layers in the order the architecture promises", () => {
    expect(declaredLayers()).toEqual([
      "reset",
      "tokens",
      "base",
      "primitives",
      "features",
      "themes",
      "utilities",
    ]);
  });
});
