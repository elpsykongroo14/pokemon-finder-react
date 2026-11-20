import type { PokemonIndexEntry } from "./pokemonIndex";

//filters the pokedex index down to at most 8 suggestions
//a query made only of digits (optionally starting with #) is a pokedex number
//"25" and "#025" both suggest #25 first then #250..#259
//otherwise its a name:
//"startsWith" matches are ranked first (typing "char" should surface charmander before scyther)
//then substring matches fill in the rest (so "lizard" still finds charizard, even though it doesnt start with it)

const MAX_SUGGESTIONS = 8;

export function filterEntries(
  query: string,
  entries: PokemonIndexEntry[],
): PokemonIndexEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const digits = q.replace(/^#/, "");
  if (/^\d+$/.test(digits)) {
    //String(Number(...)) drops leading zeros, so "025" is looked up as "25",
    //the same way ids are written in the list
    const wanted = String(Number(digits));
    return entries
      .filter((e) => e.id !== null && String(e.id).startsWith(wanted))
      .slice(0, MAX_SUGGESTIONS);
  }

  const startsWith = entries.filter((e) => e.name.startsWith(q));
  const contains = entries.filter(
    (e) => !e.name.startsWith(q) && e.name.includes(q),
  );

  return [...startsWith, ...contains].slice(0, MAX_SUGGESTIONS);
}
