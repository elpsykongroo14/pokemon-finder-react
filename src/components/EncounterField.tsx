import "./EncounterField.css";
import type { ReactNode } from "react";

interface EncounterFieldProps {
  //the id of the heading that names the field (the Pokémon's name on its
  //plate). left out while loading or after a failure: there is no name
  //yet, so the section is not a named region
  labelledBy?: string;
  //a plain name, for a field with no heading to point at (Home's "Wild
  //encounter"). labelledBy wins when both are given
  label?: string;
  //which screen this field belongs to. Home's is taller, with a higher
  //horizon (spec 7.1); CSS reads it from data-variant
  variant?: "page" | "home";
  children: ReactNode;
}

//the scenery alone: a sky in the primary type color, a darker ground with
//a horizon, slanted stripes in the second type. every color is a field
//token (type-themes.css), so this has no idea which Pokémon it shows: the
//nearest data-type decides. the field draws one of these; Compare draws
//two, one inside each half, each half wearing its own data-type
export function FieldSky() {
  return (
    <div className="encounter-field__sky" aria-hidden="true">
      <span className="encounter-field__ground" />
      <span className="encounter-field__stripes">
        <span className="encounter-field__stripe" />
        <span className="encounter-field__stripe" data-thin />
      </span>
    </div>
  );
}

//the encounter field (spec 1, 4.1): the scenery plus whatever stands in it.
//
//D43: this element stays mounted from loading to loaded and from one
//Pokémon to the next; only the layer INSIDE it is keyed by name. that is
//what lets the sky keep its old color for 300 ms, hidden under the black
//slab, and change while it is covered. a field keyed by name would be born
//with the new color and spoil the swap
export function EncounterField({
  labelledBy,
  label,
  variant = "page",
  children,
}: EncounterFieldProps) {
  return (
    <section
      className="encounter-field"
      data-variant={variant}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
    >
      <FieldSky />
      {children}
    </section>
  );
}
