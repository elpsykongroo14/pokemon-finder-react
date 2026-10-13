//the container

import "./PokemonCard.css";
import { useState } from "react";
import { Stage } from "./Stage";
import { StageConsole } from "../ui/StageConsole";
import { StatBarChart } from "./StatBarChart";
import { MetaInfo } from "./MetaInfo";
import { PokemonActions } from "./PokemonActions";
import type { PokemonDetails } from "../lib/type";
import { EvolutionSection } from "./EvolutionSection";

interface PokemonCardProps {
  pokemon: PokemonDetails;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  //shiny lives here, not in Stage: the checkbox (Console) and the
  //sprite (Stage) both need it, so their closest shared parent owns it
  const [shiny, setShiny] = useState(false);

  return (
    <article className="pokemon-card">
      <StageConsole stage={<Stage pokemon={pokemon} shiny={shiny} />}>
        <PokemonActions
          pokemon={pokemon}
          shiny={shiny}
          onShinyChange={setShiny}
        />

        <section className="pokemon-card-section">
          <h3 className="pokemon-card-section-title">Base Stats</h3>
          <StatBarChart stats={pokemon.stats} />
        </section>

        <section className="pokemon-card-section">
          <h3 className="pokemon-card-section-title">Details</h3>
          <MetaInfo
            height={pokemon.height}
            weight={pokemon.weight}
            abilities={pokemon.abilities}
          />
        </section>
        {/*PokemonCard.tsx doesn't need to know anything changed underneath, it just hands its own pokemon prop to one more child, exactly the way it already hands slices of that same prop to SpriteDisplay, TypeBadgeList, and MetaInfo.*/}

        <section className="pokemon-card-section">
          <h3 className="pokemon-card-section-title">Evolution</h3>
          <EvolutionSection pokemon={pokemon} />
        </section>
      </StageConsole>
    </article>
  );
}
