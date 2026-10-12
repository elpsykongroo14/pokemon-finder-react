import "./Stage.css";
import { Panel } from "../ui/Panel";
import { Toggle } from "../ui/Toggle";
import { SpriteDisplay } from "./SpriteDisplay";
import { TypeBadgeList } from "./TypeBadgeList";
import { usePreferences } from "../hooks/usePreferences";
import { formatDexNumber } from "../lib/dex";
import type { PokemonDetails } from "../lib/type";

interface StageProps {
  pokemon: PokemonDetails;
  shiny: boolean;
}

//the "top screen": identity (dex, number, name, types) and the sprite.
//it is the only place that reads sprite preferences, so SpriteDisplay
//stays a plain component that is easy to test and reuse
export function Stage({ pokemon, shiny }: StageProps) {
  const { spriteMode, setSpriteMode, animationsEnabled } = usePreferences();

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
          />
        </div>

        <Toggle
          label="Pixel sprites"
          checked={spriteMode === "pixel"}
          onChange={(checked) => setSpriteMode(checked ? "pixel" : "artwork")}
        />
      </div>
    </Panel>
  );
}
