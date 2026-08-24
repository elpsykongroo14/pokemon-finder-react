import { useEffect, useReducer, useState, useMemo } from "react";
import {
  fetchTCGCards,
  fetchTCGCardsBatch,
  fetchAllpokemonNames,
} from "../lib/api";
import { shuffleArray, sortTCGCards, type SortMode } from "../lib/tcg";
import {
  tcgLibraryReducer,
  initialTCGLibraryState,
} from "../lib/tcgLibraryReducer";
import type { TCGCard } from "../lib/type";

const FEATURED_PICK_COUNT = 25;

//pokemonName is undefined for the featured view (/library) and set for a search (/library/:name)
//the page component reads that split off the URL via useParams and hands us a plain value
//the hook itself doesnt know or care about routing, same convention a usePokemon
export function useTCGLibrary(pokemonName?: string) {
  const [state, dispatch] = useReducer(
    tcgLibraryReducer,
    initialTCGLibraryState,
  );
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      dispatch({ type: "FETCH_START", title: pokemonName ?? "Featured Cards" });

      try {
        const cards = pokemonName
          ? await fetchTCGCards(pokemonName, { signal: controller.signal })
          : await fetchFeaturedCards(controller.signal);

        if (controller.signal.aborted) return; //guard after wait
        dispatch({ type: "FETCH_SUCCESS", payload: cards });
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof TypeError
            ? "Network error, check your connection."
            : pokemonName
              ? `Failed to load cards for "${pokemonName}".`
              : "Failed to load featured cards. Try again.";
        dispatch({ type: "FETCH_ERROR", payload: message });
      }
    }

    run();
    return () => controller.abort();
  }, [pokemonName]);

  //derived, not stored same principle as sortTCGCards itself.
  //we recompute this from state.cards + sortMode on every render instead of keeping a second "sortCards" field in the reducer.
  //useMemo just means we skip the recompute on the renders where neither input changed.
  const sortedCards = useMemo(
    () => sortTCGCards(state.cards, sortMode),
    [state.cards, sortMode],
  );

  return { ...state, cards: sortedCards, sortMode, setSortMode };
}

async function fetchFeaturedCards(signal: AbortSignal): Promise<TCGCard[]> {
  const allNames = await fetchAllpokemonNames();
  const picks = shuffleArray(allNames).slice(0, FEATURED_PICK_COUNT);
  return fetchTCGCardsBatch(picks, { signal });
}
