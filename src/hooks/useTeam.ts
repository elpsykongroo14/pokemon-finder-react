//the file is deliberately shaped identically to useFavorites.ts
//same "throw if used outside a provider" guard, for the same reason
//(turn a silent null into a loud, immediate error pointing at the actual mistake)

import { createContext, useContext } from "react";
import type { FavoritePokemon, PokemonDetails } from "../lib/type";

export interface TeamContextValue {
  team: FavoritePokemon[];
  error: string | null;
  addToTeam: (pokemon: PokemonDetails) => void;
  removeFromTeam: (name: string) => void;
  clearError: () => void;
  isOnTeam: (name: string) => boolean;
}

export const TeamContext = createContext<TeamContextValue | null>(null);

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error("UseTeam must be used within a TeamProvider");
  }
  return ctx;
}

//the shape of TeamContextValue doesn't expose dispatch at all
//consumers call addToTeam(pokemon), never dispatch({ type: "ADD", payload: pokemon })
//the action object shape stays a private implementation detail the reducer and provider agree on between themselves
