import { getSpriteUrl } from "./sprites";
import { statTotal } from "./stats";
import type { FavoritePokemon, PokemonDetails, TeamMember } from "./type";

//write direction: full API object in, small persisted summary out.
//a favorite and a team member share this much (name, id, sprite, types)
export function toFavorite(pokemon: PokemonDetails): FavoritePokemon {
  return {
    name: pokemon.name,
    id: pokemon.id,
    sprite: getSpriteUrl(pokemon.sprites),
    types: pokemon.types.map((t) => t.type.name),
  };
}

//...and a team member adds the base stat total, which only the Team page's
//cards show (D49). favorites do not carry a number nobody reads
export function toTeamMember(pokemon: PokemonDetails): TeamMember {
  return { ...toFavorite(pokemon), statTotal: statTotal(pokemon.stats) };
}

//a member saved before a field existed (types: R7, statTotal: B&W-6) is
//missing it until the Team page's backfill fetches the Pokémon again
export function isIncompleteMember(member: TeamMember): boolean {
  return member.types === undefined || member.statTotal === undefined;
}

//typeof null an typeof [] are both "object", so both get exculded explicitly
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//read direction: untrusted data in, trusted TeamMember (or null) out
//strict about identity (name, id), lenient about decoration (sprite, types)
export function parseTeamMember(raw: unknown): TeamMember | null {
  if (!isRecord(raw)) return null;

  const { name, id, sprite, types, statTotal } = raw;
  if (typeof name !== "string" || name === "") return null;
  if (typeof id !== "number" || !Number.isInteger(id)) return null;

  const member: TeamMember = {
    name,
    id,
    sprite: typeof sprite === "string" ? sprite : null,
  };

  if (Array.isArray(types) && types.every((t) => typeof t === "string")) {
    member.types = types;
  }

  //a total is a sum of whole numbers, so anything else did not come from
  //us: leave it out and let the backfill fetch the real one
  if (
    typeof statTotal === "number" &&
    Number.isInteger(statTotal) &&
    statTotal >= 0
  ) {
    member.statTotal = statTotal;
  }

  return member;
}
