import { useState, useEffect } from "react";
import { fetchSpecies, fetchEvolutionChain, fetchPokemon } from "../lib/api";
import type { PokemonDetails, EvolutionNode } from "../lib/type";
import { buildEvolutionTree, collectEvolutionNames } from "../lib/evolution";
import { getSpriteUrl } from "../lib/sprites";

interface useEvolutionChainResult {
  tree: EvolutionNode | null;
  sprites: Record<string, string | null>;
  loading: boolean;
  error: string | null;
}

export function useEvolutionChain(
  pokemon: PokemonDetails,
): useEvolutionChainResult {
  const [tree, setTree] = useState<EvolutionNode | null>(null);
  const [sprites, setSprites] = useState<Record<string, string | null>>({});
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
        const evoTree = buildEvolutionTree(evoData.chain);
        setTree(evoTree);

        //now fetch evry stage's sprites, all at once, in parallel
        //not one branch at a time like the vanilla recursive fetch did
        const names = collectEvolutionNames(evoTree);
        const results = await Promise.all(
          names.map((name) =>
            fetchPokemon(name, { signal: controller.signal })
              //one stage failing to load shoudlnt take down the whole section
              //same shrug and continue pattern as fetchTCGCardsBatch
              .then((data) => getSpriteUrl(data.sprites))
              .catch(() => null),
          ),
        );

        //zip names and results back together into a lookup map
        const spriteMap: Record<string, string | null> = {};
        names.forEach((name, i) => {
          spriteMap[name] = results[i];
        });
        setSprites(spriteMap);
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

  return { tree, sprites, loading, error };
}

//this is a two-step fetch chain, sequential on purpose.
//fetchEvolutionChain can't run until fetchSpecies resolves,
//because the evolution-chain URL lives inside the species response
