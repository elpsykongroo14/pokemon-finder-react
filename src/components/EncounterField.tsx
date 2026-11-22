import "./EncounterField.css";
import type { ReactNode } from "react";

interface EncounterFieldProps {
  //the id of the heading that names the field (the Pokémon's name on its
  //plate). left out while loading or after a failure: there is no name
  //yet, so the section is not a named region
  labelledBy?: string;
  children: ReactNode;
}

//the encounter field (spec 1, 4.1): a sky in the primary type color, a
//darker ground with a horizon, slanted stripes in the second type. all of
//it is painted from field tokens (type-themes.css), so this component has
//no idea which Pokémon it shows: the theme on <html> decides.
//
//D43: this element stays mounted from loading to loaded and from one
//Pokémon to the next; only the layer INSIDE it is keyed by name. that is
//what lets the sky keep its old color for 300 ms, hidden under the black
//slab, and change while it is covered. a field keyed by name would be born
//with the new color and spoil the swap
export function EncounterField({ labelledBy, children }: EncounterFieldProps) {
  return (
    <section className="encounter-field" aria-labelledby={labelledBy}>
      <div className="encounter-field__sky" aria-hidden="true">
        <span className="encounter-field__ground" />
        <span className="encounter-field__stripes">
          <span className="encounter-field__stripe" />
          <span className="encounter-field__stripe" data-thin />
        </span>
      </div>
      {children}
    </section>
  );
}
