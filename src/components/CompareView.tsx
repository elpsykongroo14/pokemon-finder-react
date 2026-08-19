//this is the container that puts two pokemon side by side

import type { PokemonDetails } from "../lib/type";
import { SpriteDisplay } from "./SpriteDisplay";
import { TypeBadgeList } from "./TypeBadgeList";
import { CompareStatsChart } from "./CompareStatsChart";

interface CompareViewProps {
  primary: PokemonDetails;
  secondary: PokemonDetails;
}

export function CompareView({ primary, secondary }: CompareViewProps) {
  return (
    <section
      className="compare-view"
      aria-label={`Comparing ${primary.name} and ${secondary.name}`}
    >
      <div className="compare-heads">
        <div className="compare-column">
          <SpriteDisplay
            sprites={primary.sprites}
            name={primary.name}
            shiny={false}
          />
          <h3>{primary.name}</h3>
          <TypeBadgeList types={primary.types} />
        </div>
        <div className="compare-columnn">
          <SpriteDisplay
            sprites={secondary.sprites}
            name={secondary.name}
            shiny={false}
          />
          <h3>{secondary.name}</h3>
          <TypeBadgeList types={secondary.types} />
        </div>
      </div>
      <CompareStatsChart
        leftStats={primary.stats}
        rightStats={secondary.stats}
      />
    </section>
  );
}

//compareView itself holds zero state
//its handed two full PokemonDetails objects and just routes and slices of them to children it already had.
//the same "pass through, dont own" discipline PokemonCard follows for SpriteDisplay/TypeBadgeList/StatBarChart
