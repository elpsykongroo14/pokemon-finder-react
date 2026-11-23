import { type ReactNode } from "react";
import type { FavoritePokemon, PokemonDetails } from "../lib/type";
import { toTeamMember } from "../lib/teamMember";
import { FavoritesContext } from "../hooks/useFavorites";
import { useLocalStorage } from "../hooks/useLocalStorage";

type FavoritesAction =
  | { type: "ADD"; payload: PokemonDetails }
  | { type: "REMOVE"; payload: string };

function favoritesReducer(
  state: FavoritePokemon[],
  action: FavoritesAction,
): FavoritePokemon[] {
  switch (action.type) {
    case "ADD": {
      const pokemon = action.payload;
      if (state.some((f) => f.name === pokemon.name)) return state;
      //a favorite and a team member are saved as the same small summary
      //(name, id, sprite and, since D48, types), so one function builds both
      return [...state, toTeamMember(pokemon)];
    }
    case "REMOVE":
      return state.filter((f) => f.name !== action.payload);
    default:
      return state;
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  //this is the lazy initializer form, three argument version.
  //undefined is the "initial arg," and loadFavorites is a function React calls exactly once on mount, to compute the real initial stat
  const [favorites, setFavorites] = useLocalStorage<FavoritePokemon[]>(
    "pokemon_favorites",
    [],
  );
  function dispatch(action: FavoritesAction) {
    setFavorites((prev) => favoritesReducer(prev, action));
  }

  function isFavorite(name: string) {
    return favorites.some((f) => f.name === name);
  }

  function toggleFavorite(pokemon: PokemonDetails) {
    dispatch(
      isFavorite(pokemon.name)
        ? { type: "REMOVE", payload: pokemon.name }
        : { type: "ADD", payload: pokemon },
    );
  }

  function removeFavorite(name: string) {
    dispatch({ type: "REMOVE", payload: name });
  }

  return (
    //the context doesn't expose raw dispatch. It exposes named, intention-revealing functions instead
    //Consumers call toggleFavorite(pokemon), not dispatch({ type: "ADD", payload: pokemon }) scattered across every component
    //This keeps the action shape as an internal implementation detail of the provider
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
