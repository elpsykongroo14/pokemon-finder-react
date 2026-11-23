//the two Compare slots, exactly as they sit in the URL (?a=…&b=…). a name
//can be empty: "/compare?a=pikachu" has no second Pokémon yet
export interface ComparePair {
  a: string;
  b: string;
}

export type CompareSlot = keyof ComparePair; //"a" | "b"

//Swap sides (spec 7.3): the same two Pokémon, the other way round
export function swapPair({ a, b }: ComparePair): ComparePair {
  return { a: b, b: a };
}

//names come from the URL and from what people type, so "Pikachu " and
//"pikachu" must count as the same Pokémon
function sameName(x: string, y: string): boolean {
  return x.trim().toLowerCase() === y.trim().toLowerCase();
}

//what the URL becomes when a Pokémon is picked for one slot in the identity
//band (D52). picking the Pokémon that already stands on the OTHER side
//swaps the two (spec 7.3), instead of leading to "compare it with itself"
export function pickForSide(
  pair: ComparePair,
  slot: CompareSlot,
  query: string,
): ComparePair {
  const name = query.trim();
  const other = slot === "a" ? pair.b : pair.a;

  if (other !== "" && sameName(name, other)) return swapPair(pair);
  return slot === "a" ? { a: name, b: pair.b } : { a: pair.a, b: name };
}
