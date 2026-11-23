import "./Stage.css";
import { useState } from "react";
import { SpriteDisplay } from "./SpriteDisplay";
import { ShinySparkle } from "./ShinySparkle";
import { Icon } from "./Icon";
import { Button } from "../ui/Button";
import { SegmentedControl } from "../ui/SegmentedControl";
import { usePreferences } from "../hooks/usePreferences";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { STACKED_QUERY } from "../lib/breakpoints";
import {
  SHINY_LABEL,
  SPRITE_MODE_OPTIONS,
  SPRITE_OPTIONS_LABEL,
  SPRITES_LABEL,
} from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

interface StageProps {
  pokemon: PokemonDetails;
  //the pokemon page offers a shiny switch; the Home encouter does not
  shinyToggle?: boolean;
}

//the box a pixel sprite is scaled into, and the largest zoom it may get
//(spec 7.1): a big Black & White sprite (around 100 px) lands at 3x, a
//small one (Pikachu, 50 px) stops at 4x. phones have a shorter field
const SPRITE_BOX = { wide: 330, stacked: 270 } as const;
const MAX_SPRITE_SCALE = 4;

//the left side of the encounter field: the battle platform, the sprite
//standing on it, and every control that changes how the sprite looks. it
//is the only place that reads sprite preferences, so SpriteDisplay stays a
//plain, reusable component. who the Pokémon IS (dex, name, types) is the
//name plate's job now (NamePlate)
export function Stage({ pokemon, shinyToggle = false }: StageProps) {
  const { spriteMode, setSpriteMode, animationsEnabled } = usePreferences();
  const stacked = useMediaQuery(STACKED_QUERY);

  //page-only state (not a preference), so it starts false for every new
  //Pokémon: the encounter layer around this is keyed by name, so a new
  //Pokémon means a brand-new Stage. it is never saved
  const [shiny, setShiny] = useState(false);

  //how many times shiny has been switched on, an event counter bumped in
  //the click handler: the sparkle celebrates the moment of switching, not
  //the state of being shiny (switching OFF, or arriving, plays nothing)
  const [sparkleKey, setSparkleKey] = useState(0);

  function handleShinyClick() {
    const turningOn = !shiny;
    setShiny(turningOn);
    if (turningOn) setSparkleKey((key) => key + 1);
  }

  return (
    <div className="stage">
      <span className="stage__platform" aria-hidden="true" />
      <span className="stage__shadow" aria-hidden="true" />

      <div className="stage__sprite">
        {/* two wrappers, two jobs in the encounter (spec 6.1): the outer
            one drops in, the inner one plays the silhouette. they wrap the
            sprite instead of styling the <img>, because SpriteDisplay swaps
            the <img> for a new one when Shiny or Pixel changes, and a new
            element would replay the silhouette */}
        <div className="stage__drop">
          <div className="stage__reveal">
            <SpriteDisplay
              sprites={pokemon.sprites}
              name={pokemon.name}
              shiny={shiny}
              mode={spriteMode}
              animate={animationsEnabled}
              size={stacked ? SPRITE_BOX.stacked : SPRITE_BOX.wide}
              maxScale={MAX_SPRITE_SCALE}
              plain
            />
          </div>
          {/* inside the drop, outside the reveal: the stars sit around the
              sprite box and are never turned into a silhouette.
              JS gate, not CSS: a one-shot effect with motion off should not
              exist at all, rather than exist invisibly. a new key = a fresh
              burst, so switching on again replays it */}
          {animationsEnabled && sparkleKey > 0 && (
            <ShinySparkle key={sparkleKey} />
          )}
        </div>
      </div>

      <div
        className="stage__controls"
        role="group"
        aria-label={SPRITE_OPTIONS_LABEL}
      >
        {/* the same choice, and the same preference, as in Settings: two
            options, one selected, so radio buttons (spec 5.3) */}
        <SegmentedControl
          label={SPRITES_LABEL}
          options={SPRITE_MODE_OPTIONS}
          value={spriteMode}
          onChange={setSpriteMode}
        />
        {shinyToggle && (
          //on or off: a toggle button, named "Shiny" in both states, with
          //aria-pressed saying which (the same rule as Favorite)
          <Button
            variant="line"
            size="sm"
            pressed={shiny}
            onClick={handleShinyClick}
          >
            <Icon name="sparkle" />
            {SHINY_LABEL}
          </Button>
        )}
      </div>
    </div>
  );
}
