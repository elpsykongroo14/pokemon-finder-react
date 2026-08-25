//filters the full 1025 name list down to at most 8 matches
//"startsWith" matches are ranked first (typing "char" should surface charmander before scyther)
//then substring matches fill in the rest (so "lizard" still finds charizard, even though it doesnt start with it)

export function filterNames(query: string, allNames: string[]): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const startsWith = allNames.filter((n) => n.startsWith(q));
  const contains = allNames.filter((n) => !n.startsWith(q) && n.includes(q));

  return [...startsWith, ...contains].slice(0, 8);
}
