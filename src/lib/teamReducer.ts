import type { FavoritePokemon, PokemonDetails } from "./type";
import { getSpriteUrl } from "./sprites";

export const MAX_TEAM = 6;

export interface TeamState {
  members: FavoritePokemon[];
  error: string | null;
}

export type TeamAction =
  | { type: "ADD"; payload: PokemonDetails }
  | { type: "REMOVE"; payload: string }
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
        members: [
          ...state.members,
          {
            name: pokemon.name,
            id: pokemon.id,
            sprite: getSpriteUrl(pokemon.sprites),
          },
        ],
        error: null,
      };
    }
    case "REMOVE":
      return {
        members: state.members.filter((m) => m.name !== action.payload),
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "CLEAR":
      return { members: [], error: null };
    default:
      return state;
  }
}
