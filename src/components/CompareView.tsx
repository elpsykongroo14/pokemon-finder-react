//this is the container that puts two pokemon side by side
//a split "versus" stage on top, the tug of war stat rows underneath

import "./CompareView.css";
import type { PokemonDetails } from "../lib/type";
import { SpriteDisplay } from "./SpriteDisplay";
import { TypeBadgeList } from "./TypeBadgeList";
import { CompareStatsChart } from "./CompareStatsChart";
import { usePreferences } from "../hooks/usePreferences";

interface CompareViewProps {
  primary: PokemonDetails;
  secondary: PokemonDetails;
}

//one half of the stage. data type reskins only this half (the type themes
//are attribute selectors, so any element can wear one), which is how  the two
//halves get two differenet colors with no javaScipt doing any coloring
function VersusSide({
  pokemon,
  side,
}: {
  pokemon: PokemonDetails;
  side: "left" | "right";
}) {
  const { spriteMode, animationsEnabled } = usePreferences();

  return (
    <div
      className="versus-side"
      data-side={side}
      data-type={pokemon.types[0]?.type.name}
    >
      <SpriteDisplay
        sprites={pokemon.sprites}
        name={pokemon.name}
        shiny={false}
        mode={spriteMode}
        animate={animationsEnabled}
        size={160}
        plain
      />
      <h3 className="versus-side__name">{pokemon.name}</h3>
      <TypeBadgeList types={pokemon.types} />
    </div>
  );
}

export function CompareView({ primary, secondary }: CompareViewProps) {
  return (
    <section
      className="compare-view"
      aria-label={`Comparing ${primary.name} and ${secondary.name}`}
    >
      <div className="versus-stage">
        <VersusSide pokemon={primary} side="left" />
        <span className="versus-stage__badge surface-window" aria-hidden="true">
          VS
        </span>
        <VersusSide pokemon={secondary} side="right" />
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
