import { getSpriteUrl } from "./sprites";
import type { PokemonDetails, TeamMember } from "./type";

//write direction: full API object in, small persisted summary out
export function toTeamMember(pokemon: PokemonDetails): TeamMember {
  return {
    name: pokemon.name,
    id: pokemon.id,
    sprite: getSpriteUrl(pokemon.sprites),
    types: pokemon.types.map((t) => t.type.name),
  };
}

//typeof null an typeof [] are both "object", so both get exculded explicitly
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//read direction: untrusted data in, trusted TeamMember (or null) out
//strict about identity (name, id), lenient about decoration (sprite, types)
export function parseTeamMember(raw: unknown): TeamMember | null {
  if (!isRecord(raw)) return null;

  const { name, id, sprite, types } = raw;
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

  return member;
}
