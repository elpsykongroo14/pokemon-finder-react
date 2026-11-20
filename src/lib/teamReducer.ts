import type { PokemonDetails, TeamMember } from "./type";
import { toTeamMember } from "./teamMember";

export const MAX_TEAM = 6;

export interface TeamState {
  members: TeamMember[];
  error: string | null;
}

export type TeamAction =
  | { type: "ADD"; payload: PokemonDetails }
  | { type: "REMOVE"; payload: string }
  | { type: "BACKFILL"; payload: PokemonDetails }
  | { type: "CLEAR_ERROR" }
  | { type: "CLEAR" };

export function TeamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case "ADD": {
      const pokemon = action.payload;

      if (state.members.some((m) => m.name === pokemon.name)) {
        return { ...state, error: `${pokemon.name} is already on your team` };
      }
      if (state.members.length >= MAX_TEAM) {
        return { ...state, error: `Team is full (${MAX_TEAM}/${MAX_TEAM})` };
      }

      return {
        members: [...state.members, toTeamMember(pokemon)],
        error: null,
      };
    }
    case "REMOVE":
      return {
        members: state.members.filter((m) => m.name !== action.payload),
        error: null,
      };
    case "BACKFILL": {
      const fresh = toTeamMember(action.payload);

      const needsBackfill = state.members.some(
        (m) => m.name === fresh.name && m.types === undefined,
      );
      //returning the same object tells react (and our persistence effect) that nothing changed
      if (!needsBackfill) return state;

      return {
        ...state,
        members: state.members.map((m) =>
          m.name === fresh.name ? { ...m, types: fresh.types } : m,
        ),
      };
    }
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "CLEAR":
      return { members: [], error: null };
    default:
      return state;
  }
}

//a reducer must be a pure function
//same input, same output, forever, with zero side effects (no timers, no fetches, no DOM)
