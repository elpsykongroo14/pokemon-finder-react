import "./MetaInfo.css";
import type { PokemonAbility } from "../lib/type";
import { formatSlug } from "../lib/text";
import { HIDDEN_ABILITY_LABEL, NO_HIDDEN_ABILITY } from "../lib/copy";

interface MetaInfoProps {
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  //TODO: flavor text lives on the /pokmeon-species endpoint not /.pokemon.
  //it requires wiring fetchSpecies into usePokemon (or a new hook)
  //before this component can accept a flavorText prop
}

//the "Profile" section: a two-column table, each value tied to its name by
//a row header (th scope="row", the R5 decision), so a screen reader says
//"Height, 1.8 m" instead of two unrelated cells
export function MetaInfo({ height, weight, abilities }: MetaInfoProps) {
  //the api reports height in decimetres and weight in hectograms
  //so we convert them to meters/kilograms by dividing by 10
  const heightM = (height / 10).toFixed(1);
  const weightKg = (weight / 10).toFixed(1);

  //"flame-body" is an API slug; people read "Flame Body"
  const normalAbilities = abilities
    .filter((a) => !a.is_hidden)
    .map((a) => formatSlug(a.ability.name))
    .join(", ");

  const hiddenAbility = abilities.find((a) => a.is_hidden);

  return (
    <table className="meta-table">
      <tbody>
        <tr>
          <th scope="row" className="meta-key">
            Height
          </th>
          <td className="meta-val">{heightM} m</td>
        </tr>
        <tr>
          <th scope="row" className="meta-key">
            Weight
          </th>
          <td className="meta-val">{weightKg} kg</td>
        </tr>
        <tr>
          <th scope="row" className="meta-key">
            Abilities
          </th>
          <td className="meta-val">{normalAbilities}</td>
        </tr>
        {/* always there (spec 7.2): "None" is an answer too, and every
            profile then has the same four rows in the same places */}
        <tr>
          <th scope="row" className="meta-key">
            {HIDDEN_ABILITY_LABEL}
          </th>
          <td className="meta-val">
            {hiddenAbility
              ? formatSlug(hiddenAbility.ability.name)
              : NO_HIDDEN_ABILITY}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
