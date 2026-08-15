import { useState, useEffect } from "react";
import { fetchSpecies, fetchEvolutionChain } from "../lib/api";
import type { PokemonDetails, EvolutionNode } from "../lib/type";
import { buildEvolutionTree } from "../lib/evolution";

interface useEvolutionChainResult {
  tree: EvolutionNode | null;
  loading: boolean;
  error: string | null;
}

export function useEvolutionChain(
  pokemon: PokemonDetails,
): useEvolutionChainResult {
  const [tree, setTree] = useState<EvolutionNode | null>(null);
  //starts true: this effect always fires on mount,
  //since "pokemon" is guaranteed non null
  //unlike usePokemon's empty query like idle state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      try {
        //1) species endpoint gives us the evolution chain's URL
        const species = await fetchSpecies(pokemon.species.url, {
          signal: controller.signal,
        });
        //2) follow that URL to get the raw ChainLink tree
        const evoData = await fetchEvolutionChain(species.evolution_chain.url, {
          signal: controller.signal,
        });
        //3) reshape it into  the tree EvolutionNode (the component) expects
        setTree(buildEvolutionTree(evoData.chain));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    run();

    return () => {
      controller.abort();
    };
  }, [pokemon]);

  return { tree, loading, error };
}

//this is a two-step fetch chain, sequential on purpose.
//fetchEvolutionChain can't run until fetchSpecies resolves,
//because the evolution-chain URL lives inside the species response
