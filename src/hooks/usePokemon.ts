import { useState, useEffect } from "react";
import { fetchPokemon } from "../lib/api";
import { classifyFetchError, type FetchFailureKind } from "../lib/fetchErrors";
import type { PokemonDetails } from "../lib/type";

interface UsePokemonResult {
  data: PokemonDetails | null;
  loading: boolean;
  error: FetchFailureKind | null;
}

//what a FINISHED request leaves behind. failure null means it succed
//the state itself is 'Outcome | null' where null means "still waiting"
interface Outcome {
  failure: FetchFailureKind | null;
}

export function usePokemon(name: string): UsePokemonResult {
  //data is the last successful pokemon and is deliberately never cleared
  //so the page theme can glide pikachu -> with no flicker
  const [data, setData] = useState<PokemonDetails | null>(null);
  const [outcome, setOutCome] = useState<Outcome | null>(null);

  //"reset state when an input changes": compare during render, and if the
  //name differs, drop the old outcome right now. react throws this render
  //away and re-renders at once, so no frame is ever painted that pairs
  //the new name with old answer
  const [lastName, setLastName] = useState(name);
  if (name !== lastName) {
    setLastName(name);
    setOutCome(null);
  }

  useEffect(() => {
    if (!name.trim()) {
      return;
    }

    const controller = new AbortController();

    async function run() {
      try {
        const result = await fetchPokemon(name, { signal: controller.signal });
        setData(result);
      } catch (err: unknown) {
        //abort = a newer request replaced this one. say nothing, change nothing
        if (err instanceof DOMException && err.name === "AbortError") return;
        setOutCome({ failure: classifyFetchError(err) });
      }
    }
    run();

    return () => {
      controller.abort();
    };
  }, [name]);

  //derived on every renedr, never stored: nothing to keep in sync
  //loading = there is something to look up and no answer has arrived
  const loading = name.trim() !== "" && outcome === null;
  const error = outcome?.failure ?? null;

  return { data, loading, error };
}
