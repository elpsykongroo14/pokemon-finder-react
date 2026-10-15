import { describe, it, expect } from "vitest";
import { classifyFetchError } from "./fetchErrors";
import { HttpError } from "./httpError";

describe("classifyFetchError", () => {
  it("calls a 404 'not-found': the thing does not exist", () => {
    expect(classifyFetchError(new HttpError(404, "https://x.test/a"))).toBe(
      "not-found",
    );
  });

  it("calls other HTTp failures 'unreachable': server trouble, not user error", () => {
    expect(classifyFetchError(new HttpError(500, "https://x.test/a"))).toBe(
      "unreachable",
    );
    expect(classifyFetchError(new HttpError(429, "https://x.test/a"))).toBe(
      "unreachable",
    );
  });

  it("calls a network failure 'unreachable': fetch iteself threw a TypeError", () => {
    expect(classifyFetchError(new TypeError("Failed to fetch"))).toBe(
      "unreachable",
    );
  });

  it("calls an ordinary Error 'unreachable'", () => {
    expect(classifyFetchError(new Error("boom"))).toBe("unreachable");
  });

  it("survives things that are not Errors at all", () => {
    expect(classifyFetchError("a thrown string")).toBe("unreachable");
    expect(classifyFetchError(undefined)).toBe("unreachable");
  });
});

describe("HttpError", () => {
  it("keeps old message format and exposes status and url", () => {
    const err = new HttpError(404, "https://x.test/a");

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.message).toBe("HTTP 404 for: https://x.test/a");
    expect(err.name).toBe("HttpError");
    expect(err.status).toBe(404);
    expect(err.url).toBe("https://x.test/a");
  });
});
