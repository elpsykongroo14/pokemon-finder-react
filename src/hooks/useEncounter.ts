import { useState } from "react";
import { usePokemon } from "./usePokemon";
import {
  getSessionEncounterId,
  pickNextEncounterId,
  storeEncounterId,
  type StorageLike,
} from "../lib/encounter";

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
  const [id, setId] = useState(() =>
    getSessionEncounterId(readSessionStorage(), Math.random),
  );

  //"Look for another" (spec 7.1). the dice are rolled HERE, in the event
  //handler, and the finished number is handed to setId. the tempting
  //alternative, setId((current) => pickNext(current, Math.random)), puts
  //randomness and a storage write inside an updater function, and React
  //may run updaters twice (StrictMode does, on purpose): two different
  //rolls, and storage could end up holding the one that was thrown away.
  //an event handler runs exactly once per click
  function reroll() {
    const next = pickNextEncounterId(id, Math.random);
    storeEncounterId(readSessionStorage(), next);
    setId(next);
  }

  return { id, ...usePokemon(String(id)), reroll };
}
