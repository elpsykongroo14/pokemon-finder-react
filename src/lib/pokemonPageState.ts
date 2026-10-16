import type { PokemonDetails } from "./type";
import type { FetchFailureKind } from "./fetchErrors";

//the page can be in exactly ONE of these situations at a time
//a "discriminated union": every case has 'status' tag, and TypeScript
//uses the tag to know which other fields exist (only "ready" has a pokemon, only "failed" has a a kin)
//that makes impossible combinations, like "loading AND showing an error", unrepresentable
//
//"failed" carries a KIND, not a sentence: the words live in lib/copy.ts
export type PokemonPageState =
  | { status: "no-name" }
  | { status: "loading" }
  | { status: "failed"; kind: FetchFailureKind; name: string }
  | { status: "ready"; pokemon: PokemonDetails };

interface PageInputs {
  name: string | undefined;
  loading: boolean;
  error: FetchFailureKind | null;
  data: PokemonDetails | null;
}

//the order of these checks IS the rule for which situatin.
//loading comes before data: usePokemon keeps the PREVIOUS pokemon in 'data'
//while the next one loads, and we must not show it then
//error comes before data for the same reason
export function getPokemonPageState({
  name,
  loading,
  error,
  data,
}: PageInputs): PokemonPageState {
  if (!name) return { status: "no-name" };
  if (loading) return { status: "loading" };
  if (error) return { status: "failed", kind: error, name };
  if (data) return { status: "ready", pokemon: data };
  return { status: "failed", kind: "not-found", name };
}
