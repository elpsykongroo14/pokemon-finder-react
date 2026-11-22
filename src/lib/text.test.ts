import { describe, it, expect } from "vitest";
import { formatSlug } from "./text";

describe("formatSlug", () => {
  it("turns an API slug into words with capitals", () => {
    expect(formatSlug("dusk-stone")).toBe("Dusk Stone");
  });

  it("capitalises a single word", () => {
    expect(formatSlug("levitate")).toBe("Levitate");
  });

  it("leaves an empty slug empty", () => {
    expect(formatSlug("")).toBe("");
  });
});
