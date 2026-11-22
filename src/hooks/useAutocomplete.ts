import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "./useDebounce";
import { fetchPokemonIndex } from "../lib/api";
import type { PokemonIndexEntry } from "../lib/pokemonIndex";
import { filterEntries } from "../lib/autocomplete";

interface UseAutocompleteResults {
  matches: PokemonIndexEntry[];
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  isOpen: boolean;
  dismiss: () => void;
  notifyQueryEdited: () => void;
}

export function useAutocomplete(query: string): UseAutocompleteResults {
  const [allEntries, setAllEntries] = useState<PokemonIndexEntry[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  //empty dependency array: this runs on mount, same as the vanilla main.ts did on pages load
  //fetchAllPokemonNames already catches internally (allNamesCache in lib/api.ts) so even if useAutpcomplete were ever used in two place at once,
  //were not refetching all of the name list twice, react re running this effect on a remount just hits that in module cache
  useEffect(() => {
    fetchPokemonIndex()
      .then(setAllEntries)
      .catch((err) =>
        console.error("Failed to load pokemon names for autocomplete:", err),
      );
  }, []);

  //useMemo here instead of plain const because filterNames runs two .filter() passesover up to 1025 strings
  //its cheap but not free and this hook's component re renders on every keystroke (raw query changing) not just every debounce tick.
  //without useMemo wed redo that filtering work on renders where debouncedQuery and allNames havent actually changed at all
  //useMemo says to only recompute this when its actual input change
  const debouncedQuery = useDebounce(query, 250);

  const matches = useMemo(
    () => filterEntries(debouncedQuery, allEntries),
    [debouncedQuery, allEntries],
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
  //D51: there used to be a preview here, the full details of the
  //highlighted match fetched on every arrow key. each row now shows its own
  //sprite built from the dex number, so that request is gone

  function dismiss() {
    setDismissed(true);
  }

  //call this ONLY from the input's onChange handler, never from a
  //programmatic setQuery like selectMatch's. that restriction is what makes
  //this work: onChange fires exclusively on real user keystrokes, so this
  //function only ever runs when the user genuinely wants suggestions back,
  //with no need to infer that from diffing query values during render.
  function notifyQueryEdited() {
    setDismissed(false);
  }

  return {
    matches,
    highlightedIndex,
    setHighlightedIndex,
    isOpen,
    dismiss,
    notifyQueryEdited,
  };
}
