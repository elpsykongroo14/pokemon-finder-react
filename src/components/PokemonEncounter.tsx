import "./PokemonEncounter.css";
import { Stage } from "./Stage";
import { NamePlate } from "./NamePlate";
import { EncounterWipe } from "./EncounterWipe";
import type { PokemonDetails } from "../lib/type";

interface PokemonEncounterProps {
  pokemon: PokemonDetails;
  headingId: string;
}

//the encounter layer: everything inside the field that belongs to ONE
//Pokémon (the stage and the name plate), plus the two slabs that wipe
//across when it appears.
//
//the page renders it with key={pokemon.name}. a different key tells React
//"this is a different element": it throws the old layer away and mounts a
//new one, and a freshly mounted element plays its CSS animations from the
//start. that one key is the whole restart mechanism for the encounter
//(spec 6.1): no class toggling, no timers. it also resets per-Pokémon state
//(Shiny, the confirmation line) for free.
//
//data-encounter tells the Stage inside to play the drop and the silhouette
//(Stage.css). Home sets the same attribute on its own stage slot
export function PokemonEncounter({
  pokemon,
  headingId,
}: PokemonEncounterProps) {
  return (
    <div className="encounter" data-encounter>
      <Stage pokemon={pokemon} shinyToggle />
      <NamePlate pokemon={pokemon} headingId={headingId} />
      <EncounterWipe />
    </div>
  );
}
