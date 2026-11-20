import "./EvolutionSection.css";
import "../styles/shared.css";
import { useEvolutionChain } from "../hooks/useEvolutionChain";
import type { PokemonDetails } from "../lib/type";
import { EvolutionNode } from "./EvolutionNode";
import { usePreferences } from "../hooks/usePreferences";

interface EvolutionSectionProps {
  pokemon: PokemonDetails;
}

export function EvolutionSection({ pokemon }: EvolutionSectionProps) {
  const { tree, sprites, loading, error } = useEvolutionChain(pokemon);
  //read the preference once here and pass it down, instead of every
  //recursive node reading context n its own
  const { spriteMode } = usePreferences();

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
      <EvolutionNode data={tree} sprites={sprites} mode={spriteMode} />
    </div>
  );
}
