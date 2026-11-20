import "./Stage.css";
import { useState } from "react";
import { Panel } from "../ui/Panel";
import { Toggle } from "../ui/Toggle";
import { SpriteDisplay } from "./SpriteDisplay";
import { ShinySparkle } from "./ShinySparkle";
import { TypeBadgeList } from "./TypeBadgeList";
import { usePreferences } from "../hooks/usePreferences";
import { formatDexNumber } from "../lib/dex";
import { SPRITE_OPTIONS_LABEL } from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

interface StageProps {
  pokemon: PokemonDetails;
  //the pokemon page offers a shiny switch; the Home encouter does not
  shinyToggle?: boolean;
}

//the "top screen": identity (dex, number, name, types) the sprite,
//and every control that changes how the sprite looks. it is the only place that
//reads sprite preferences, so SpriteDisplay stays a plain, reusable component
export function Stage({ pokemon, shinyToggle = false }: StageProps) {
  const { spriteMode, setSpriteMode, animationsEnabled } = usePreferences();

  //shiny moved DOM into Stage: the switch and the sprite now live in the
  //same component, so the closest owner is this one. it is page-only state
  //(not a preference), so it starts false for every new Pokemon (see the
  //key={pokemon.name} in PokemonCard) and is never saved
  const [shiny, setShiny] = useState(false);

  //how many times shiny has been switched on, an event encounter, bumped in
  //the switch's handler: the sparkle celebrates the moment of switching,
  //not the state of being shiny (switching OFF, on arriving at a page,
  //plays nothing)
  const [sparkleKey, setSparkleKey] = useState(0);

  function handleShinyChange(checked: boolean) {
    setShiny(checked);
    if (checked) setSparkleKey((key) => key + 1);
  }

  return (
    <Panel variant="tinted">
      <div className="stage">
        <header className="stage__header">
          <span className="stage__dex">{formatDexNumber(pokemon.id)}</span>
          <h2 className="stage__name">{pokemon.name}</h2>
          <TypeBadgeList types={pokemon.types} />
        </header>

        <div className="stage__sprite">
          <SpriteDisplay
            sprites={pokemon.sprites}
            name={pokemon.name}
            shiny={shiny}
            mode={spriteMode}
            animate={animationsEnabled}
            size={240}
            plain
          />
          {/* JS gate, not CSS: a one-shot effect with motion off should not
              exist at all, rather than exist invisibly. a new key = a fresh
              burst, so switching on again replays it */}
          {animationsEnabled && sparkleKey > 0 && (
            <ShinySparkle key={sparkleKey} />
          )}
        </div>

        <div
          className="stage__controls"
          role="group"
          aria-label={SPRITE_OPTIONS_LABEL}
        >
          <Toggle
            label="Pixel sprites"
            checked={spriteMode === "pixel"}
            onChange={(checked) => setSpriteMode(checked ? "pixel" : "artwork")}
          />
          {shinyToggle && (
            <Toggle
              label="Shiny"
              checked={shiny}
              onChange={handleShinyChange}
            />
          )}
        </div>
      </div>
    </Panel>
  );
}
