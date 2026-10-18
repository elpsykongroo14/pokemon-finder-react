//how many Pokémon the app knows about: ids 1..POKEDEX_SIZE
//one number, used by the name-list request and by the random encounter,
//so the two can never disagree about where the Pokédex ends
export const POKEDEX_SIZE = 1025;

//pure formatting helper, no DOM, no React
//dex numbers show as #006, #025, #150. padStart only ever adds zeros
//it never cuts, so #1025 stays #1025
export function formatDexNumber(id: number): string {
  if (!Number.isInteger(id) || id < 1) return "#???";
  return `#${String(id).padStart(3, "0")}`;
}
