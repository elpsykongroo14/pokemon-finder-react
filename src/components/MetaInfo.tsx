import type { PokemonAbility } from "../lib/type";

interface MetaInfoProps {
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  //TODO: flavor text lives on the /pokmeon-species endpoint not /.pokemon.
  //it requires wiring fetchSpecies into usePokemon (or a new hook)
  //before this component can accept a flavorText prop
}

export function MetaInfo({ height, weight, abilities }: MetaInfoProps) {
  const heightM = (height / 10).toFixed(1);
  const weightKg = (weight / 10).toFixed(1);

  const normalAbilities = abilities
    .filter((a) => !a.is_hidden)
    .map((a) => a.ability.name)
    .join(", ");

  const hiddenAbility = abilities.find((a) => a.is_hidden);

  return (
    <table className="meta-table">
      <tbody>
        <tr>
          <td className="meta-key">Height</td>
          <td className="meta-val">{heightM} m</td>
        </tr>
        <tr>
          <td className="meta-key">Weight</td>
          <td className="meta-val">{weightKg} kg</td>
        </tr>
        <tr>
          <td className="meta-key">Abilities</td>
          <td className="meta-val">{normalAbilities}</td>
        </tr>
        {hiddenAbility && (
          <tr>
            <td className="meta-key">Hidden</td>
            <td className="meta-val meta-val--hidden">
              {hiddenAbility.ability.name}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
