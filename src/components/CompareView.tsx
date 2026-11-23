//two Pokémon side by side (spec 7.3): a split versus field on top, the
//black identity band with the pickers, the stat duel, and the verdict

import "./CompareView.css";
import { useId } from "react";
import type { PokemonDetails } from "../lib/type";
import { FieldSky } from "./EncounterField";
import { EncounterWipe } from "./EncounterWipe";
import { Stage, type SpriteBox } from "./Stage";
import { SearchBar } from "./SearchBar";
import { SpriteDisplay } from "./SpriteDisplay";
import { TypeBadgeList } from "./TypeBadgeList";
import { CompareStatsChart } from "./CompareStatsChart";
import { Icon } from "./Icon";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";
import { formatDexNumber } from "../lib/dex";
import { formatSlug } from "../lib/text";
import { statTotal } from "../lib/stats";
import { compareStat } from "../lib/statComparison";
import type { CompareSlot } from "../lib/comparePair";
import {
  COMPARE_FIRST_LABEL,
  COMPARE_FIRST_SEARCH_LABEL,
  COMPARE_SECOND_LABEL,
  COMPARE_SECOND_SEARCH_LABEL,
  STATS_HEADING,
  SWAP_SIDES_LABEL,
  compareRegionLabel,
  compareVerdict,
} from "../lib/copy";

type Side = "left" | "right";

interface CompareViewProps {
  primary: PokemonDetails;
  secondary: PokemonDetails;
  //the next comparison is loading; this one stays up until it lands
  pending?: boolean;
  //a Pokémon was picked in the identity band, for slot "a" or "b"
  onPick: (slot: CompareSlot, query: string) => void;
  onSwap: () => void;
}

//each half of the field is smaller than a whole field: a 3x sprite still
//fits on desktop, phones get a 1x or 2x one (integerScale picks)
const VERSUS_SPRITE_BOX: SpriteBox = { wide: 300, stacked: 150 };

//the attributes that re-skin one side. the type themes are attribute
//selectors (type-themes.css), so ANY element can wear one, and everything
//inside it (sky, stripes, dex number) takes that Pokémon's colors with no
//JavaScript doing any coloring. a Pokémon with no types gets no theme
function themeOf(pokemon: PokemonDetails) {
  return {
    "data-type": pokemon.types[0]?.type.name,
    "data-type2": pokemon.types[1]?.type.name,
  };
}

//one half of the field's scenery: sky, ground, stripes in its own colors.
//NOT keyed: when its Pokémon changes, the same element changes data-type,
//so its sky can switch color under the wipe's slab (D43)
function VersusHalf({
  pokemon,
  side,
}: {
  pokemon: PokemonDetails;
  side: Side;
}) {
  return (
    <div className="versus-half" data-side={side} {...themeOf(pokemon)}>
      <FieldSky />
    </div>
  );
}

//one side's platform and sprite. inside the keyed layer, so a new pairing
//slides both sprites in again (CompareView.css). the left one is mirrored
//by CSS, so the two face each other
function VersusStage({
  pokemon,
  side,
}: {
  pokemon: PokemonDetails;
  side: Side;
}) {
  return (
    <div className="versus-stage" data-side={side}>
      <Stage pokemon={pokemon} spriteOptions={false} box={VERSUS_SPRITE_BOX} />
    </div>
  );
}

//one side of the black identity band: who it is, and the picker that
//replaces it (D52). NOT keyed: the picker keeps keyboard focus while the
//next Pokémon loads, and its field empties itself after a pick
function VersusIdentity({
  pokemon,
  side,
  onPick,
}: {
  pokemon: PokemonDetails;
  side: Side;
  onPick: (query: string) => void;
}) {
  const first = side === "left";
  return (
    <div className="versus-side" data-side={side} {...themeOf(pokemon)}>
      <p className="versus-side__dex">{formatDexNumber(pokemon.id)}</p>
      <h3 className="versus-side__name">{pokemon.name}</h3>
      <TypeBadgeList types={pokemon.types} />
      <div className="versus-side__pick">
        <SearchBar
          onSubmit={onPick}
          label={
            first ? COMPARE_FIRST_SEARCH_LABEL : COMPARE_SECOND_SEARCH_LABEL
          }
          inputLabel={first ? COMPARE_FIRST_LABEL : COMPARE_SECOND_LABEL}
          labelVisible
          //the current Pokémon, standing in the empty field like the value
          //of a select (the prototype used one); typing replaces it
          placeholder={formatSlug(pokemon.name)}
          clearOnSubmit
        />
      </div>
    </div>
  );
}

//who has the higher base stat total. a live region that stays mounted, so
//a new pairing's verdict is read out once it lands. the winner's sprite is
//decoration: the sentence already names it
function CompareVerdict({
  primary,
  secondary,
}: {
  primary: PokemonDetails;
  secondary: PokemonDetails;
}) {
  const left = statTotal(primary.stats);
  const right = statTotal(secondary.stats);
  const winner = compareStat(left, right);
  const champion =
    winner === "left" ? primary : winner === "right" ? secondary : null;

  return (
    <p className="compare-verdict" aria-live="polite">
      {champion && (
        <span className="compare-verdict__sprite">
          <SpriteDisplay
            sprites={champion.sprites}
            name={champion.name}
            shiny={false}
            mode="pixel"
            size={72}
            maxScale={1}
            plain
            decorative
          />
        </span>
      )}
      <span>
        {compareVerdict(
          { name: primary.name, total: left },
          { name: secondary.name, total: right },
        )}
      </span>
    </p>
  );
}

export function CompareView({
  primary,
  secondary,
  pending = false,
  onPick,
  onSwap,
}: CompareViewProps) {
  const duelId = useId();

  //one key for the pairing: when EITHER side changes, everything keyed by
  //it is thrown away and mounted fresh, and fresh elements play their CSS
  //animations from the start (spec 6.1, 6.2: slide-in, VS slam, wipe, the
  //bars growing). the halves, the band and the verdict are not keyed
  const pairKey = `${primary.name}|${secondary.name}`;

  return (
    <section
      className="compare-view"
      aria-label={compareRegionLabel(primary.name, secondary.name)}
      aria-busy={pending || undefined}
    >
      <div className="versus-field">
        <VersusHalf pokemon={primary} side="left" />
        <VersusHalf pokemon={secondary} side="right" />
        <span className="versus-field__seam" aria-hidden="true" />

        {/* the layer covers the whole field, so the wipe inside it crosses
            both halves. (one key, one element: two siblings sharing a key
            would leave React unable to tell them apart) */}
        <div className="versus-encounter" key={pairKey}>
          <VersusStage pokemon={primary} side="left" />
          <VersusStage pokemon={secondary} side="right" />
          <p className="versus-field__vs" aria-hidden="true">
            VS
          </p>
          <EncounterWipe />
        </div>
      </div>

      <div className="versus-band on-dark">
        <VersusIdentity
          pokemon={primary}
          side="left"
          onPick={(query) => onPick("a", query)}
        />
        {/* the Button primitive's "light" look is exactly the spec's swap
            (a white plate; Ink with a white ring on hover). the wrapper
            only makes it a 60 px square */}
        <span className="versus-band__swap">
          <Button
            variant="light"
            aria-label={SWAP_SIDES_LABEL}
            onClick={onSwap}
          >
            <Icon name="swap" />
          </Button>
        </span>
        <VersusIdentity
          pokemon={secondary}
          side="right"
          onPick={(query) => onPick("b", query)}
        />
      </div>

      <section className="compare-duel" aria-labelledby={duelId}>
        <SectionHeading level={3} id={duelId}>
          {STATS_HEADING}
        </SectionHeading>
        <CompareStatsChart
          key={pairKey}
          leftStats={primary.stats}
          rightStats={secondary.stats}
          leftType={primary.types[0]?.type.name}
          rightType={secondary.types[0]?.type.name}
        />
        <CompareVerdict primary={primary} secondary={secondary} />
      </section>
    </section>
  );
}

//CompareView still owns no data: it is handed two full PokemonDetails and
//routes slices of them to its children. what it does own is the decision
//of what is keyed by the pairing and what is not, the same split the
//Pokémon page makes between its field and its encounter layer
