import type { PokemonDetails } from "./type";
import type { FetchFailureKind } from "./fetchErrors";

//the compare page is in exactly one of these situations at a time
//same idea as poekmonPageState: a discriminated union makes impossible
//combinations (like "loading and showing the comparison") unrepresentable
//failures carry a kind and the name looked up, never a sentence:
//the words live in lib/copy.ts
//
//"ready" can be pending (B&W-5): the comparison on screen is about to be
//replaced (a pick in the identity band, or Swap) and the new one is still
//loading. pending is left out entirely, not false, when nothing is pending
export type ComparePageState =
  | { status: "no-first" }
  | { status: "first-loading" }
  | { status: "first-failed"; kind: FetchFailureKind; name: string }
  | { status: "pick-second"; first: PokemonDetails }
  | { status: "second-loading" }
  | { status: "second-failed"; kind: FetchFailureKind; name: string }
  | { status: "same-pokemon" }
  | {
      status: "ready";
      primary: PokemonDetails;
      secondary: PokemonDetails;
      pending?: true;
    };

//what the page know about one lookup (usePokemon's result has these fields)
interface Lookup {
  loading: boolean;
  error: FetchFailureKind | null;
  data: PokemonDetails | null;
}

//the comparison that is on screen right now. the page remembers it
//(useComparePageState); this file only decides what to do with it
export interface ShownPair {
  primary: PokemonDetails;
  secondary: PokemonDetails;
}

interface PageInputs {
  a: string;
  b: string;
  first: Lookup;
  second: Lookup;
  shown?: ShownPair | null;
}

//the order of these check is the rul for which situation we are in
//loading and error come before data because usePokemon keeps the previous
//pokemon in `data` while the next one loads (or after it fails), and we
//must not show that stale one. the second lookup is only looked at once
//a first pokemon is on screen and a second name exists
//
//one exception, checked first: a comparison is already on screen and one
//or both sides are reloading. then the old comparison stays, marked
//pending, instead of being swapped for a loading message: the field, the
//pickers and keyboard focus all survive the change. a failure still wins
export function getComparePageState({
  a,
  b,
  first,
  second,
  shown,
}: PageInputs): ComparePageState {
  if (!a) return { status: "no-first" };

  const reloading = first.loading || second.loading;
  const failed = first.error !== null || second.error !== null;
  if (shown && b && reloading && !failed) {
    return { status: "ready", ...shown, pending: true };
  }

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
