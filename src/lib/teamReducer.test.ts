import { describe, it, expect } from "vitest";
import { TeamReducer, MAX_TEAM, type TeamState } from "./teamReducer";
import type { PokemonDetails } from "./type";

function makeState(overrides: Partial<TeamState> = {}): TeamState {
  return { members: [], error: null, ...overrides };
}

const mockPikachu = {
  name: "pikachu",
  id: 25,
  sprites: { front_default: "https://img.example/pikachu.png" },
} as PokemonDetails;

describe("TeamReducer", () => {
  it("adds a pokemon that isnt already on the team", () => {
    const result = TeamReducer(makeState(), {
      type: "ADD",
      payload: mockPikachu,
    });

    expect(result.members).toEqual([
      { name: "pikachu", id: 25, sprite: "https://img.example/pikachu.png" },
    ]);
    expect(result.error).toBeNull();
  });

  it("rejects adding a pokemon already on the team, leaving memeber unchanged", () => {
    const state = makeState({
      members: [{ name: "pikachu", id: 25, sprite: null }],
    });

    const result = TeamReducer(state, { type: "ADD", payload: mockPikachu });

    expect(result.members).toHaveLength(1);
    expect(result.error).toBe("pikachu is already on your team");
  });

  it("rejects adding a pokemon when the team already has 6 members", () => {
    const fullTeam = Array.from({ length: MAX_TEAM }, (_, i) => ({
      name: `member-${i}`,
      id: i,
      sprite: null,
    }));
    const state = makeState({ members: fullTeam });

    const result = TeamReducer(state, { type: "ADD", payload: mockPikachu });

    expect(result.members).toHaveLength(MAX_TEAM);
    expect(result.error).toBe(`Team is full (${MAX_TEAM}/${MAX_TEAM})`);
  });

  it("removes a member by name and clears any existing error", () => {
    const state = makeState({
      members: [
        { name: "pikachu", id: 25, sprite: null },
        { name: "bulbasaur", id: 1, sprite: null },
      ],
      error: "Team is full (6/6)",
    });

    const result = TeamReducer(state, { type: "REMOVE", payload: "pikachu" });

    expect(result.members).toEqual([
      { name: "bulbasaur", id: 1, sprite: null },
    ]);
    expect(result.error).toBeNull();
  });

  it("clears an error without touching members", () => {
    const state = makeState({
      members: [{ name: "pikachu", id: 25, sprite: null }],
      error: "something went wrong",
    });

    const result = TeamReducer(state, { type: "CLEAR_ERROR" });

    expect(result.error).toBeNull();
    expect(result.members).toEqual(state.members);
  });

  it("resets to an empty team", () => {
    const state = makeState({
      members: [{ name: "pikachu", id: 25, sprite: null }],
      error: "something went wrong",
    });

    const result = TeamReducer(state, { type: "CLEAR" });

    expect(result).toEqual({ members: [], error: null });
  });

  it("returns the same state for an unrecognized action type", () => {
    const state = makeState({
      members: [{ name: "pikachu", id: 25, sprite: null }],
    });

    // @ts-expect-error deliberately testing an invalid action at runtime
    const result = TeamReducer(state, { type: "NOT_A_REAL_ACTION" });

    expect(result).toBe(state);
  });
});
