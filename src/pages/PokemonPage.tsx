import { useParams } from "react-router-dom";
import { useId, useRef } from "react";
import { usePokemon } from "../hooks/usePokemon";
import { EncounterField } from "../components/EncounterField";
import { PokemonEncounter } from "../components/PokemonEncounter";
import { PokemonReadout } from "../components/PokemonReadout";
import { PokemonSkeleton } from "../components/PokemonSkeleton";
import { FavoritesList } from "../components/FavoritesList";
import { CardsTeaser } from "../components/CardsTeaser";
import { MessageBox } from "../ui/MessageBox";
import { useTypeTheme } from "../hooks/useTypeTheme";
import { getPokemonPageState } from "../lib/pokemonPageState";
import { FailureMessage } from "../components/FailureMessage";
import "./PokemonPage.css";
import { PageTitle } from "../ui/PageTitle";
import { LOADING_LABEL } from "../lib/copy";

export function PokemonPage() {
  const { name } = useParams<{ name: string }>(); //this line reads the dynamic segment straight off the current URL.
  //it just reflects whatever the router already matched to get this component rendered in the first place
  //useParams here just reads result
  const { data, loading, error, retry } = usePokemon(name ?? "");
  const regionRef = useRef<HTMLDivElement>(null);
  //the name plate's heading id: the plate renders the heading, the field
  //is named after it (aria-labelledby), so the page owns the id both use
  const headingId = useId();

  useTypeTheme(error ? undefined : data?.types.map((t) => t.type.name));
  //usePokemon does not clear data when name changes
  //so while the next Pokemon loads, data still holds the previous one
  //thats gives us a good property for free
  //moving pikachu->charizard goes yellow -> orange directly instead of
  // yellow -> default -> orange, which would flicker, but if the new fetch fails, data is still the old pokemon and the page would show an error while wearing the old pokemon's colors
  //so we pass undefined on error.

  //instead of four seperate '{condition && ...}' blocks that could overlap.
  //we first work out WHICH single situation we are in, then render only that
  const state = getPokemonPageState({ name, loading, error, data });
  const pokemon = state.status === "ready" ? state.pokemon : undefined;

  //pressing Retry makes the button disappear (the skeleton replaces the message),
  //and a focused element that vanishes drops keyboard focus to the top of the page.
  //so before it vanishes, we move focus to the stable wrapper below
  //which stays mounted while the content inside it snaps
  function handleRetry() {
    regionRef.current?.focus();
    retry();
  }

  //what stands in the field. one situation at a time
  function renderField() {
    switch (state.status) {
      case "no-name":
        return (
          <div className="encounter-field__message">
            <MessageBox text="No Pokémon specified" />
          </div>
        );
      case "loading":
        //spec 7.6: the empty platform and silhouette, and the battle
        //dialog with the loading line. the skeleton is the one live
        //announcement; the dialog repeats it for the eye only
        return (
          <>
            <PokemonSkeleton />
            <div className="encounter-field__message" aria-hidden="true">
              <MessageBox text={LOADING_LABEL} />
            </div>
          </>
        );
      case "failed":
        return (
          <div className="encounter-field__message">
            <FailureMessage
              kind={state.kind}
              query={state.name}
              onRetry={handleRetry}
            />
          </div>
        );
      case "ready":
        //key: a new Pokémon is a NEW encounter layer, so the encounter
        //plays again (spec 6.1). the field around it is NOT keyed (D43)
        return (
          <PokemonEncounter
            key={state.pokemon.name}
            pokemon={state.pokemon}
            headingId={headingId}
          />
        );
    }
  }

  return (
    //page--bleed: this page runs edge to edge (the field and the rail),
    //instead of sitting inside the shell's 1240 px column
    <div className="pokemon-page page--bleed" ref={regionRef} tabIndex={-1}>
      {/* the name from the URL, so the tab is right even while loading
          or when the search failed ("Missingno · Pokémon Finder") */}
      <PageTitle page={name && name.charAt(0).toUpperCase() + name.slice(1)} />

      {/* the field stays mounted through loading, ready and failed, so its
          sky can change color under the encounter's slab (D43) */}
      <EncounterField labelledBy={pokemon ? headingId : undefined}>
        {renderField()}
      </EncounterField>

      <FavoritesList current={pokemon?.name} />

      {/* keyed like the encounter: a new Pokémon's bars grow again, and on
          phones its tabs start on Stats */}
      {pokemon && <PokemonReadout key={pokemon.name} pokemon={pokemon} />}

      {/* keyed: a new Pokémon starts its own lazy card lookup (B&W-7) */}
      {pokemon && <CardsTeaser key={pokemon.name} name={pokemon.name} />}
    </div>
  );
}
