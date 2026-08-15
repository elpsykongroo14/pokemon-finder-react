import { useEvolutionChain } from "../hooks/useEvolutionChain";
import type { PokemonDetails } from "../lib/type";
import { EvolutionNode } from "./EvolutionNode";

interface EvolutionSectionProps {
  pokemon: PokemonDetails;
}

export function EvolutionSection({ pokemon }: EvolutionSectionProps) {
  const { tree, loading, error } = useEvolutionChain(pokemon);

  if (loading) {
    return (
      <p role="status" className="status-message">
        Loading evolution chain...
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="status-message status-message--error">
        Couldn't load evolution data.
      </p>
    );
  }

  //a real tree with zero children means:
  //fetched, fine, this pokemon just doesnt evolve
  //different from `error`, this is a successful empty result not a failure
  if (!tree || tree.children.length === 0) {
    return <p className="no-evolution">This Pokémon does not evolve.</p>;
  }

  return (
    <div className="evolution-chain">
      <EvolutionNode data={tree} />
    </div>
  );
}
