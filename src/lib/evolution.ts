import type { ChainLink, EvolutionDetail, EvolutionNode } from "./type";
import { formatSlug } from "./text";

//how a stage is reached, as a short label for the arrow before it (D47):
//"Level 50", "Dusk Stone", "Trade", "Friendship". anything else (a move,
//a place, a time of day, a held item...) gets no label rather than a
//wrong one. undefined, not "", so the caller can skip the element.
//
//the API lists one entry per game that tells it differently; the first
//is the original, which is the one most people know
export function evolutionCondition(
  details: readonly EvolutionDetail[] | undefined,
): string | undefined {
  const detail = details?.[0];
  if (!detail) return undefined;

  switch (detail.trigger.name) {
    case "level-up":
      if (detail.min_level) return `Level ${detail.min_level}`;
      if (detail.min_happiness) return "Friendship";
      return undefined;
    case "use-item":
      return detail.item ? formatSlug(detail.item.name) : undefined;
    case "trade":
      return "Trade";
    default:
      return undefined;
  }
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
