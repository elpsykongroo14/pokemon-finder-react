import "./EvolutionSection.css";
import "../styles/shared.css";
import { useEvolutionChain } from "../hooks/useEvolutionChain";
import type { PokemonDetails } from "../lib/type";
import { EvolutionNode } from "./EvolutionNode";
import { usePreferences } from "../hooks/usePreferences";
import { EVOLUTION_FAILED, EVOLUTION_LOADING, NO_EVOLUTION } from "../lib/copy";

interface EvolutionSectionProps {
  pokemon: PokemonDetails;
  //false: load the sprites right away (EvolutionNode's lazy)
  lazySprites?: boolean;
}

export function EvolutionSection({
  pokemon,
  lazySprites = true,
}: EvolutionSectionProps) {
  const { tree, sprites, loading, error } = useEvolutionChain(pokemon);
  //read the preference once here and pass it down, instead of every
  //recursive node reading context n its own
  const { spriteMode } = usePreferences();

  if (loading) {
    return (
      <p role="status" className="status-message">
        {EVOLUTION_LOADING}
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="status-message status-message--error">
        {EVOLUTION_FAILED}
      </p>
    );
  }

  //a real tree with zero children means:
  //fetched, fine, this pokemon just doesnt evolve
  //different from `error`, this is a successful empty result not a failure
  if (!tree || tree.children.length === 0) {
    return <p className="no-evolution">{NO_EVOLUTION}</p>;
  }

  return (
    <div className="evolution-chain">
      <EvolutionNode
        data={tree}
        sprites={sprites}
        mode={spriteMode}
        current={pokemon.name}
        lazy={lazySprites}
      />
    </div>
  );
}
