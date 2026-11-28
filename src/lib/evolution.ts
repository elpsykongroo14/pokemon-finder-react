import type { ChainLink, EvolutionDetail, EvolutionNode } from "./type";
import { formatSlug } from "./text";

//how a stage is reached, as a short label for the arrow before it (D47):
//"Level 50", "Dusk Stone", "Trade", "Friendship, day", "Fairy move".
//undefined only for the first stage (no details at all).
//
//the API lists one entry per game that tells it differently, the original
//first. the first one we can put into words wins: Leafeon's early entries
//are "level up near a mossy rock", which we do not name, and a later one
//is a Leaf Stone. a method none of them can name (a place, a held item at
//night...) reads "Special" rather than leaving an arrow with no label
function describeDetail(detail: EvolutionDetail): string | undefined {
  switch (detail.trigger.name) {
    case "level-up":
      if (detail.min_level) return `Level ${detail.min_level}`;
      if (detail.known_move_type)
        return `${formatSlug(detail.known_move_type.name)} move`;
      if (detail.min_happiness)
        return detail.time_of_day
          ? `Friendship, ${detail.time_of_day}`
          : "Friendship";
      return undefined;
    case "use-item":
      return detail.item ? formatSlug(detail.item.name) : undefined;
    case "trade":
      return "Trade";
  }
}

export function evolutionCondition(
  details: readonly EvolutionDetail[] | undefined,
): string | undefined {
  if (!details?.length) return undefined;
  for (const detail of details) {
    const label = describeDetail(detail);
    if (label) return label;
  }
  return "Special";
}

//the API already gives us a tree, every node's evolves_to is an array of more nodes
//we just reshape each node into {name, children, condition}
export function buildEvolutionTree(node: ChainLink): EvolutionNode {
  const condition = evolutionCondition(node.evolution_details);
  return {
    name: node.species.name,
    //this line IS the recursion:
    // for every child ChainLink call this function again.
    //.map() doesnt know or care that the function its calling is the function its inside of
    children: node.evolves_to.map(buildEvolutionTree),
    //only present when there is something to say, so a first stage stays
    //exactly { name, children }
    ...(condition && { condition }),
  };
}

//walks the tree and returns every name in it, flattened.
//this pokemon plus every descendant, in one array
export function collectEvolutionNames(node: EvolutionNode): string[] {
  return [node.name, ...node.children.flatMap(collectEvolutionNames)];
}
