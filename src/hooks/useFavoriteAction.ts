import { useState } from "react";
import { useFavorites } from "./useFavorites";
import { FIRST_FAVORITE } from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

//the favorite feature, shaped like useTeamAction: state and logic here, drawn
//by FavoriteButton (the control) and FavoriteStatus (the messages)
export interface FavoriteAction {
  isFavorite: boolean;
  toggle: () => void;
  popKey: number;
  celebratingFirst: boolean;
  announcement: string;
}

export function useFavoriteAction(pokemon: PokemonDetails): FavoriteAction {
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.name);

  //both are events ("it just happened"), so both are set in the click handler.
  //the one place that knows an add really happened. reading them off
  //the favorite list later could not tell "just added apart" from
  //"was already there when the page opened"
  const [popKey, setPopKey] = useState(0);
  const [justFirst, setJustFirst] = useState(false);

  //the banner shows only while that first favorite is still a favorite
  const celebratingFirst = justFirst && favorite;

  function toggle() {
    const adding = !favorite;
    //decide from the list as it was at click time (same rule as the team's "completes the party"):
    //an empty list plus an add = the first favorite
    const isFirst = adding && favorites.length === 0;

    toggleFavorite(pokemon);
    if (adding) setPopKey((key) => key + 1);
    setJustFirst(isFirst);
  }

  return {
    isFavorite: favorite,
    toggle,
    popKey,
    celebratingFirst,
    announcement: celebratingFirst ? FIRST_FAVORITE : "",
  };
}
