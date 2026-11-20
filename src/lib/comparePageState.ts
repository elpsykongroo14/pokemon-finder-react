import type { PokemonDetails } from "./type";
import type { FetchFailureKind } from "./fetchErrors";

//the compare page is in exactly one of these situations at a time
//same idea as poekmonPageState: a discriminated union makes impossible
//combinations (like "loading and showing the comparison") unrepresentable
//failures carry a kind and the name looked up, never a sentence:
//the words live in lib/copy.ts
export type ComparePageState =
  | { status: "no-first" }
  | { status: "first-loading" }
  | { status: "first-failed"; kind: FetchFailureKind; name: string }
  | { status: "pick-second"; first: PokemonDetails }
  | { status: "second-loading" }
  | { status: "second-failed"; kind: FetchFailureKind; name: string }
  | { status: "same-pokemon" }
  | { status: "ready"; primary: PokemonDetails; secondary: PokemonDetails };

//what the page know about one lookup (usePokemon's result has these fields)
interface Lookup {
  loading: boolean;
  error: FetchFailureKind | null;
  data: PokemonDetails | null;
}

interface PageInputs {
  a: string;
  b: string;
  first: Lookup;
  second: Lookup;
}

//the order of these check is the rul for which situation we are in
//loading and error come before data because usePokemon keeps the previous
//pokemon in `data` while the next one loads (or after it fails), and we
//must not show that stale one. the second lookup is only looked at once
//a first pokemon is on screen and a second name exists
export function getComparePageState({
  a,
  b,
  first,
  second,
}: PageInputs): ComparePageState {
  if (!a) return { status: "no-first" };
  if (first.loading) return { status: "first-loading" };
  if (first.error)
    return { status: "first-failed", kind: first.error, name: a };
  if (!first.data)
    return { status: "first-failed", kind: "not-found", name: a };

  if (!b) return { status: "pick-second", first: first.data };
  if (second.loading) return { status: "second-loading" };
  if (second.error)
    return { status: "second-failed", kind: second.error, name: b };
  if (!second.data)
    return { status: "second-failed", kind: "not-found", name: b };

  if (first.data.id === second.data.id) return { status: "same-pokemon" };
  return { status: "ready", primary: first.data, secondary: second.data };
}
