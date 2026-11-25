import "./HomePage.css";
import { useRef } from "react";
import { useEncounter } from "../hooks/useEncounter";
import { useTypeTheme } from "../hooks/useTypeTheme";
import { BattleMenu } from "../components/BattleMenu";
import { EncounterField } from "../components/EncounterField";
import { EncounterWipe } from "../components/EncounterWipe";
import { FailureMessage } from "../components/FailureMessage";
import { PokemonSkeleton } from "../components/PokemonSkeleton";
import { Stage } from "../components/Stage";
import { MessageBox } from "../ui/MessageBox";
import { PageTitle } from "../ui/PageTitle";
import {
  encounterMessage,
  LOADING_LABEL,
  WILD_ENCOUNTER_LABEL,
} from "../lib/copy";

//Home (spec 7.1): one wild encounter. the field on the left with the
//battle dialog, the command plate on the right.
//
//what is keyed and what is not, and why (the same rule as the Pokémon
//page, D43):
//  the field              NOT keyed: its sky changes color under the slab
//  the stage              keyed by name: a new Pokémon drops in again
//  the wipe               keyed by name: the slabs cross again
//  the dialog             NOT keyed: its live region must stay the same
//                         element so the new greeting is announced; it
//                         restarts its own typing inside (MessageBox)
//  the command plate      NOT keyed: "Look for another" lives on it, and a
//                         keyed plate would be thrown away by its own click,
//                         taking keyboard focus with it
export function HomePage() {
  const { id, data, loading, error, retry, reroll } = useEncounter();
  const stageRef = useRef<HTMLDivElement>(null);

  //the wild pokemon paints the page in its type colors same way
  //pokemon page does. while loading or after a failure there is no theme
  useTypeTheme(error ? undefined : data?.types.map((t) => t.type.name));

  //retry removes its own button so move focus to the stage slot first
  //(same reasoning as PokemonPage.handleRetry)
  function handleRetry() {
    stageRef.current?.focus();
    retry();
  }

  //the Pokémon to show, or null. usePokemon keeps the previous Pokémon in
  //data while the next one loads (after "Look for another"), so data alone
  //is not enough: only a finished, successful lookup counts
  const pokemon = !loading && !error ? data : null;

  return (
    //page--bleed: Home runs edge to edge, like the Pokémon page
    <div className="home-page page--bleed">
      {/* Home is the app itself, so the tab shows just the app name */}
      <PageTitle />
      <EncounterField variant="home" label={WILD_ENCOUNTER_LABEL}>
        {/* the stage slot stays mounted while its content swaps, so focus
            has somewhere to land after Retry. data-encounter: the Stage
            inside plays the drop and the silhouette (Stage.css) */}
        <div className="home-stage" data-encounter ref={stageRef} tabIndex={-1}>
          {pokemon ? (
            <Stage key={pokemon.name} pokemon={pokemon} spriteOptions={false} />
          ) : (
            !error && <PokemonSkeleton decorative />
          )}

          <div className="home-stage__dialog">
            {error ? (
              <FailureMessage
                kind={error}
                query={String(id)}
                onRetry={handleRetry}
              />
            ) : (
              <MessageBox
                text={pokemon ? encounterMessage(pokemon.name) : LOADING_LABEL}
                typing={pokemon ? "lines" : "letters"}
              />
            )}
          </div>
        </div>

        <BattleMenu pokemon={pokemon} onReroll={reroll} />

        {pokemon && <EncounterWipe key={pokemon.name} />}
      </EncounterField>
    </div>
  );
}
