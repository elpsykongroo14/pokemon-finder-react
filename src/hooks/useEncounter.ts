import { useState } from "react";
import { usePokemon } from "./usePokemon";
import { getSessionEncounterId, type StorageLike } from "../lib/encounter";

//touching window.sessionStorage can THROW (some browsers block storage entirely)
//so even getting the object needs a try
function readSessionStorage(): StorageLike | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

//the wild pokemon for browser session: one id chosen once, then fetched
//with the same hook the pokemon page uses, so loading, failure kinds and retry all behave exactly as they do there
export function useEncounter() {
  //useState's lazy form: the function runs ONCE, on the first render only
  //so dice are never re-rolled by a later re-render
  const [id] = useState(() =>
    getSessionEncounterId(readSessionStorage(), Math.random),
  );

  return { id, ...usePokemon(String(id)) };
}
