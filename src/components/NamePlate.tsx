import "./NamePlate.css";
import type { CSSProperties } from "react";
import { TypeBadgeList } from "./TypeBadgeList";
import { PokemonActions } from "./PokemonActions";
import { formatDexNumber } from "../lib/dex";
import { MAX_STAT_TOTAL, percentOf, statTotal } from "../lib/stats";
import { BASE_STAT_TOTAL_LABEL } from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

interface NamePlateProps {
  pokemon: PokemonDetails;
  //the page names the field after this heading (aria-labelledby), so the
  //page chooses the id and hands it down
  headingId: string;
}

//the black name plate (spec 7.2): who this Pokémon is, like the HP box in a
//DS battle. it lives in the encounter layer, so it slides in with each new
//Pokémon. .on-dark flips text and focus rings to white for everything in it
export function NamePlate({ pokemon, headingId }: NamePlateProps) {
  const total = statTotal(pokemon.stats);

  return (
    <div className="name-plate on-dark">
      <div className="name-plate__inner">
        <p className="name-plate__dex">{formatDexNumber(pokemon.id)}</p>
        <h2 id={headingId} className="name-plate__name">
          {pokemon.name}
        </h2>
        <TypeBadgeList types={pokemon.types} size="lg" />

        <div className="name-plate__total">
          <p className="name-plate__total-row">
            <span>{BASE_STAT_TOTAL_LABEL}</span>
            <strong>{total}</strong>
          </p>
          {/* the number above already says it; the bar is for the eye.
              --fill is a 0..1 fraction: the fill is scaled, not resized,
              so growing it never touches layout */}
          <span className="name-plate__bar" aria-hidden="true">
            <span
              className="name-plate__fill"
              style={
                {
                  "--fill": percentOf(total, MAX_STAT_TOTAL) / 100,
                } as CSSProperties
              }
            />
          </span>
        </div>

        <PokemonActions pokemon={pokemon} />
      </div>
    </div>
  );
}
