//one line of pokedex "table of contents": just enough to list a pokemon
//in search suggestions, with no per pokemon request needed
export interface PokemonIndexEntry {
  name: string;
  //null when the number cannot be read from the url (should not happen with
  //real pokeapi data, but the data is not ours, so we do not assume)
  id: number | null;
}

//PokéAPI's list gives every Pokémon a url that ends with its number:
//  https://pokeapi.co/api/v2/pokemon/25/   ->   25
//the number was in the response all along, the old code just threw it away
//a regular expression (regex) describes the shape we expect:
//  /pokemon/     the literal text "/pokemon/"
//  (\d+)         one or more digits, captured so we can read them back
//  \/?           an optional trailing slash
//  $             and then the string must END
//so ".../pokemon-species/25/" and ".../pokemon/abc/" do not match
export function parseDexId(url: string): number | null {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : null;
}

export function toIndexEntry(resource: {
  name: string;
  url: string;
}): PokemonIndexEntry {
  return { name: resource.name, id: parseDexId(resource.url) };
}
