// @vitest-environment node
//this test reads files, it renders nothing, so it does not need jsdom

//THE MOTION RULE, enforced by CI instead of by memory:
//every animation or transition must stop when the person turns
//animations off. there are exactly two ways to satisfy that:
//
//  1. its duration is a motion token, var(--dur-*). motion.css sets every
//     token to 0ms when motion is off, so the motion is gone automatically
//  2. it uses a hard-coded time (a loop period like 2.4s or 900ms, which
//     has no token), and then it MUST sit under :root[data-motion="on"],
//     so it only exists while motion is on
//
//anything else (a literal time with no gate) fails the build, with the
//file and line, so the next animation added cannot forget the rule

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it, expect } from "vitest";
import postcss, { type Declaration, type Rule } from "postcss";

const MOTION_PROPERTIES =
  /^(animation|animation-duration|transition|transition-duration)$/;

//a number followed by s or ms, not part of a longer word or token name
//(so "--dur-slow" or "steps(2, end)" never match). 0s and 0ms are allowed:
//a zero duration is not motion
const LITERAL_TIME = /(?<![\w-])(\d*\.?\d+)(ms|s)\b/g;

const GATE = ':root[data-motion="on"]';

function hasNonZeroLiteralTime(value: string): boolean {
  return [...value.matchAll(LITERAL_TIME)].some(
    (match) => Number(match[1]) > 0,
  );
}

//a rule is gated only if EVERY one of its selectors starts with the gate:
//".a, :root[data-motion="on"] .b" still animates .a ungated
function isGated(declaration: Declaration): boolean {
  const parent = declaration.parent;
  if (parent?.type !== "rule") return false;
  return (parent as Rule).selectors.every((selector) =>
    selector.trim().startsWith(GATE),
  );
}

//returns one line per broken declaration, e.g.
//"src/ui/Spinner.css:19  animation: spinner-spin 800ms linear infinite"
function findUngatedMotion(css: string, fileName: string): string[] {
  const problems: string[] = [];

  postcss.parse(css, { from: fileName }).walkDecls((declaration) => {
    if (!MOTION_PROPERTIES.test(declaration.prop)) return;
    if (!hasNonZeroLiteralTime(declaration.value)) return; //tokens, none, 0s
    if (isGated(declaration)) return;

    const line = declaration.source?.start?.line ?? 0;
    problems.push(
      `${fileName}:${line}  ${declaration.prop}: ${declaration.value}`,
    );
  });

  return problems;
}

function listCssFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith(".css"))
    .map((path) => join(directory, path));
}

describe("findUngatedMotion (the checker itself)", () => {
  //a checker that never fails proves nothing, so first prove it CAN fail

  it("flags a hard-coded duration with no gate", () => {
    const css = ".spin { animation: spin 800ms linear infinite; }";
    expect(findUngatedMotion(css, "a.css")).toEqual([
      "a.css:1  animation: spin 800ms linear infinite",
    ]);
  });

  it("accepts a hard-coded duration behind the gate", () => {
    const css =
      ':root[data-motion="on"] .spin { animation: spin 0.8s linear infinite; }';
    expect(findUngatedMotion(css, "a.css")).toEqual([]);
  });

  it("accepts durations written as motion tokens", () => {
    const css =
      ".btn { transition: transform var(--dur-fast) var(--ease-snap); animation: pop var(--dur-base) steps(2, end); }";
    expect(findUngatedMotion(css, "a.css")).toEqual([]);
  });

  it("accepts none and zero durations", () => {
    const css = ".a { animation: none; transition-duration: 0ms; }";
    expect(findUngatedMotion(css, "a.css")).toEqual([]);
  });

  it("flags a rule where only some of the selectors are gated", () => {
    const css =
      '.a, :root[data-motion="on"] .b { animation: spin 1s infinite; }';
    expect(findUngatedMotion(css, "a.css")).toHaveLength(1);
  });

  it("still flags an ungated loop inside a media query", () => {
    const css =
      "@media (min-width: 768px) { .a { transition: opacity 200ms ease; } }";
    expect(findUngatedMotion(css, "a.css")).toHaveLength(1);
  });
});

describe("every stylesheet in the app", () => {
  const sourceRoot = join(process.cwd(), "src");
  const files = listCssFiles(sourceRoot);

  it("finds the stylesheets (so an empty search cannot pass silently)", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("stops all of its motion when animations are off", () => {
    const problems = files.flatMap((file) =>
      findUngatedMotion(
        readFileSync(file, "utf8"),
        relative(process.cwd(), file),
      ),
    );

    //on failure, the diff lists every offending file:line and declaration
    expect(problems).toEqual([]);
  });
});
