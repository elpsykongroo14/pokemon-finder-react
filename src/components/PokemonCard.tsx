//the container whos job is:
//hold the shiny toggle state, and pass the right slices of pokemon down to each child.

import { useState } from "react";
import { SpriteDisplay } from "./SpriteDisplay";
import { TypeBadgeList } from "./TypeBadgeList";
import { StatBarChart } from "./StatBarChart";
import { MetaInfo } from "./MetaInfo";
import type { PokemonDetails } from "../lib/type";

interface PokemonCardProps {
  pokemon: PokemonDetails;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const [shiny, setShiny] = useState(false);

  return (
    <article className="pokemon-card">
      <header className="pokemon-card-header">
        <h2>{pokemon.name}</h2>
        <label className="shiny-toggle">
          <input
            type="checkbox"
            checked={shiny}
            onChange={(e) => setShiny(e.target.checked)}
          />
          Shiny
        </label>
      </header>

      <SpriteDisplay
        sprites={pokemon.sprites}
        name={pokemon.name}
        shiny={shiny}
      />
      <TypeBadgeList types={pokemon.types} />
      <StatBarChart stats={pokemon.stats} />
      <MetaInfo
        height={pokemon.height}
        weight={pokemon.weight}
        abilities={pokemon.abilities}
      />
    </article>
  );
}
