import { POKEDEX_SIZE } from "./dex";

//where the session's wild pokemon is remembered. the "pf:" prefix (pokemon finder) keeps out
//keys apart from anything else that might share this origin's storage
export const ENCOUNTER_KEY = "pf:encounter";

//the two storage methods we use, and nothing more. asking for LESS than the
//whole storage type lets tests pass a tiny fake, and lets callers pass null
//when storage is blocked
export type StorageLike = Pick<Storage, "getItem" | "setItem">;

//pure: turn one random number in [0, 1) into a pokedex id in 1...POKEDEX_SIZE
//'random' is a parameter (not a call to Math.random inside) so a test can hand in
//0, 0.5, or 0.99999 and check the exact boundaries
export function pickEncounterId(random: () => number): number {
  return Math.floor(random() * POKEDEX_SIZE) + 1;
}

//a stored value comes from outside our code (the user, an old version of,
//a browser extension) so it is untrusted until it passes this check
function isValidId(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= POKEDEX_SIZE;
}

//returns this session's encunter, choosing and saving one only the first time
//read first, write second, which makes the functions IDEMPOTENT: calling it
//twice gives the same answer (React StrictMode does call it twice in dev)
export function getSessionEncounterId(
  storage: StorageLike | null,
  random: () => number,
): number {
  try {
    const stored = storage?.getItem(ENCOUNTER_KEY);
    if (stored != null) {
      const id = Number(stored);
      if (isValidId(id)) return id;
    }
  } catch {
    //reading can throw (blocked storage). fall through and pick fresh
  }

  const id = pickEncounterId(random);
  storeEncounterId(storage, id);
  return id;
}

//"Look for another" (spec 7.1): a new wild Pokémon, never the current one.
//when the dice land on the current Pokémon we step to the next number
//instead of rolling again: no loop, so the result is always one roll away
//and a test can predict it exactly. the % wraps the last Pokémon back to #1
export function pickNextEncounterId(
  current: number,
  random: () => number,
): number {
  const id = pickEncounterId(random);
  return id === current ? (id % POKEDEX_SIZE) + 1 : id;
}

//remember the encounter for this session. writing can throw (storage full
//or blocked); then the encounter just won't survive a refresh
export function storeEncounterId(storage: StorageLike | null, id: number) {
  try {
    storage?.setItem(ENCOUNTER_KEY, String(id));
  } catch {
    //nothing to do: the app works without storage
  }
}
