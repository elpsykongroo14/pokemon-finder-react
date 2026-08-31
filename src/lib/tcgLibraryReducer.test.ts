import { describe, it, expect } from "vitest";
import {
  tcgLibraryReducer,
  initialTCGLibraryState,
  type TCGLibraryState,
} from "./tcgLibraryReducer";
import type { TCGCard } from "./type";

describe("tcgLibraryReducer", () => {
  it("starts a new search: sets loading, adopts the new title, and drops stale cards/errors", () => {
    const staleState: TCGLibraryState = {
      title: "Old Search",
      cards: [{ id: "1", name: "Old Card" } as TCGCard],
      status: "success",
      error: "leftover",
    };

    const result = tcgLibraryReducer(staleState, {
      type: "FETCH_START",
      title: "Charizard",
    });

    expect(result).toEqual({
      title: "Charizard",
      cards: [],
      status: "loading",
      error: null,
    });
  });

  it("marks success and stores the cards when the payload is non empty", () => {
    const state: TCGLibraryState = {
      title: "Charizard",
      cards: [],
      status: "loading",
      error: null,
    };
    const cards = [{ id: "1", name: "Charizard" } as TCGCard];

    const result = tcgLibraryReducer(state, {
      type: "FETCH_SUCCESS",
      payload: cards,
    });

    expect(result.cards).toEqual(cards);
    expect(result.status).toBe("success");
    expect(result.error).toBeNull();
  });

  it("marks empty (not success) when the payload has no cards", () => {
    const state: TCGLibraryState = {
      title: "Nonexistent Pokemon",
      cards: [],
      status: "loading",
      error: null,
    };

    const result = tcgLibraryReducer(state, {
      type: "FETCH_SUCCESS",
      payload: [],
    });

    expect(result.status).toBe("empty");
    expect(result.cards).toEqual([]);
  });

  it("stores the error, clears cards, and perserves the existing title", () => {
    const state: TCGLibraryState = {
      title: "Charizard",
      cards: [{ id: "1", name: "Charizard" } as TCGCard],
      status: "loading",
      error: null,
    };

    const result = tcgLibraryReducer(state, {
      type: "FETCH_ERROR",
      payload: "Network request failed",
    });

    expect(result).toEqual({
      title: "Charizard",
      cards: [],
      status: "error",
      error: "Network request failed",
    });
  });

  it("returns the same state for an unrecognized action type", () => {
    const state = initialTCGLibraryState;

    // @ts-expect-error deliberately testing an invalid action at runtime
    const result = tcgLibraryReducer(state, { type: "NOT_A_REAL_ACTION" });

    expect(result).toBe(state);
  });
});
