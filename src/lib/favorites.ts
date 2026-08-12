//setFavorites(...) needs a new array itself,
//so the interface has to change shape even though
//the underlying logic is identical to the one in the vanilla project

import type { PokemonDetails, FavoritePokemon } from "./type";
import { getSpriteUrl } from "./sprites";

const FAVORITES_KEY = "pokemon_favorites";

export function getFavorites(): FavoritePokemon[] {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
}

export function addFavorite(pokemon: PokemonDetails): FavoritePokemon[] {
  const favorites = getFavorites();
  if (favorites.some((f) => f.name === pokemon.name)) return favorites;

  const updated = [
    ...favorites,
    {
      name: pokemon.name,
      id: pokemon.id,
      sprite: getSpriteUrl(pokemon.sprites),
    },
  ];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFavorite(name: string): FavoritePokemon[] {
  const updated = getFavorites().filter((f) => f.name !== name);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

//vanilla's void functions become React's array returning
//functions, because React needs the new value to hand to setState
