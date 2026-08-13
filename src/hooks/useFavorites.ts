import { createContext, useContext } from "react";
import type { FavoritePokemon, PokemonDetails } from "../lib/type";

export interface FavoritesContextValue {
  favorites: FavoritePokemon[];
  isFavorite: (name: string) => boolean;
  toggleFavorite: (Pokemon: PokemonDetails) => void;
  removeFavorite: (name: string) => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(
  null,
);

//useFavorites() guards against misuse.
//if some component calls useFavorites() outside of a <FavoritesProvider>, useContext would silently return null
//throwing immediately, with a clear message, turns a mysterious bug into an obvious one
export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
