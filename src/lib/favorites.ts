//the reducer is whats going to own what changes so
//favorites.ts only needs to own reading and writing localStorage
//no need for array logic mixed in

import type { FavoritePokemon } from "./type";

const FAVORITES_KEY = "pokemon_favorites";

export function loadFavorites(): FavoritePokemon[] {
  try {
    //localStorage content is just a string a user could have corrupted
    //JSON.parse on bad input throws,
    //better to fall back to an empty list than crash the whole app on load.
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoritePokemon[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}
