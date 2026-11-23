import { useState } from "react";
import { useFavorites } from "./useFavorites";
import type { FavoriteOutcome, PokemonDetails } from "../lib/type";

//the favorite feature, shaped like useTeamAction: state and logic here,
//drawn by FavoriteButton. what to SAY about a click is the page's job: the
//toggle returns what happened, and the page turns that into its one
//confirmation line (favoriteNote in copy.ts)
export interface FavoriteAction {
  isFavorite: boolean;
  toggle: () => FavoriteOutcome;
  //goes up by one each time a click ADDS the favorite: the icon pop and the
  //heart burst replay on it
  popKey: number;
}

export function useFavoriteAction(pokemon: PokemonDetails): FavoriteAction {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.name);

  //an event counter, set in the click handler: the one place that knows an
  //add really happened. read off the favorites list later, "just added"
  //would look the same as "was already there when the page opened"
  const [popKey, setPopKey] = useState(0);

  function toggle(): FavoriteOutcome {
    const added = !favorite;
    //decided from the list as it was at click time (the same rule as the
    //team's "completes the party"): an empty list plus an add = the first
    const first = added && favorites.length === 0;

    toggleFavorite(pokemon);
    if (added) setPopKey((key) => key + 1);
    return { added, first };
  }

  return { isFavorite: favorite, toggle, popKey };
}
