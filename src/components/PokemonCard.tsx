//the container

import "./PokemonCard.css";
import { useState } from "react";
import { SpriteDisplay } from "./SpriteDisplay";
import { TypeBadgeList } from "./TypeBadgeList";
import { StatBarChart } from "./StatBarChart";
import { MetaInfo } from "./MetaInfo";
import { FavoriteButton } from "./FavoriteButton";
import { useFavorites } from "../hooks/useFavorites";
import type { PokemonDetails } from "../lib/type";
import { EvolutionSection } from "./EvolutionSection";
import { TeamButton } from "../context/TeamButton";

interface PokemonCardProps {
  pokemon: PokemonDetails;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const [shiny, setShiny] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <article className="pokemon-card">
      <header className="pokemon-card-header">
        <h2>{pokemon.name}</h2>
        <div className="pokemon-card-actions">
          <FavoriteButton
            isFavorite={isFavorite(pokemon.name)}
            onToggle={() => toggleFavorite(pokemon)}
          />
          <TeamButton pokemon={pokemon} />
          <label className="shiny-toggle">
            <input
              type="checkbox"
              checked={shiny}
              onChange={(e) => setShiny(e.target.checked)}
            />
            Shiny
          </label>
        </div>
      </header>

      <div className="pokemon-card-section">
        <SpriteDisplay
          sprites={pokemon.sprites}
          name={pokemon.name}
          shiny={shiny}
        />
        <TypeBadgeList types={pokemon.types} />
      </div>

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
    </article>
  );
}
