import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "./useDebounce";
import { fetchAllpokemonNames, fetchPokemon } from "../lib/api";
import type { PokemonDetails } from "../lib/type";
import { filterNames } from "../lib/autocomplete";

interface UseAutocompleteResults {
  matches: string[];
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  preview: PokemonDetails | null;
  isOpen: boolean;
  dismiss: () => void;
}

export function useAutocomplete(query: string): UseAutocompleteResults {
  const [allNames, setAllNames] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [preview, setPreview] = useState<PokemonDetails | null>(null);

  //track the previous query to detect when the user types a new character
  //any new keystroke un dismisses, the user typing again means they want to see suggestions
  //even if they hit escape a moment ago
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setDismissed(false); //resets synchronously in the same render pass
  }

  //empty dependency array: this runs on mount, same as the vanilla main.ts did on page load
  //fetchAllpokemonNames already catches internally (allNamesCache in lib/api.ts) so even if useAutocomplete were ever used in two places at once,
  //were not refetching all of the name list twice, react re running this effect on a remount just hits that in module cache
  useEffect(() => {
    fetchAllpokemonNames()
      .then(setAllNames)
      .catch((err) =>
        console.error("Failed to load pokemon names for autocomplete:", err),
      );
  }, []);

  //useMemo here instead of plain const because filterNames runs two .filter() passes over up to 1025 strings,
  //its cheap but not free and this hook's component re renders on every keystroke (raw query changing) not just every debounce tick.
  //without useMemo wed redo that filtering work on renders where debouncedQuery and allNames havent actually changed at all
  //useMemo says to only recompute this when its actual input change
  const debouncedQuery = useDebounce(query, 250);

  const matches = useMemo(
    () => filterNames(debouncedQuery, allNames),
    [debouncedQuery, allNames],
  );

  //track the previous matches array reference to see if a new debounce tick occurs
  //it only fires when matches itself changes (a new debounce tick produced a different array)
  //pressing arrow keys changes highlightedIndex directly via the setter returned from the hook,
  //which doesnt touch matches so this effect wont fight by resetting back to 0 everytime an down arrow key is pressed
  const [prevMatches, setPrevMatches] = useState(matches);
  if (matches !== prevMatches) {
    setPrevMatches(matches);
    setHighlightedIndex(matches.length > 0 ? 0 : -1);
  }

  const isOpen = matches.length > 0 && !dismissed;
  const highlightedName = matches[highlightedIndex] ?? null;

  useEffect(() => {
    if (!highlightedName) {
      setPreview(null);
      return;
    }

    const controller = new AbortController();

    fetchPokemon(highlightedName, { signal: controller.signal })
      .then(setPreview)
      .catch((err) => {
        //an aborted fetch rejects with DOMException named "AbortError", that not a real failure
        //its us cleaning up a stale request so we say nothing to the user, same as the vanilla version
        if (err instanceof DOMException && err.name === "AbortError") return;
        //any other error: this is a nice to have thumbnail,
        //not the main search flow, so fail quietly rather than surfacing an error state
      });

    return () => controller.abort();
  }, [highlightedName]);

  function dismiss() {
    setDismissed(true);
  }

  return {
    matches,
    highlightedIndex,
    setHighlightedIndex,
    preview,
    isOpen,
    dismiss,
  };
}
