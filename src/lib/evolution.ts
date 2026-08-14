import type { ChainLink, EvolutionNode } from "./type";

//the API already gives us a tree, every node's evolves_to is an array of more nodes
//we just reshape each node into {name, children}
export function buildEvolutionTree(node: ChainLink): EvolutionNode {
  return {
    name: node.species.name,
    //this line IS the recursion:
    // for every child ChainLink call this function again.
    //.map() doesnt know or care that the function its calling is the function its inside of
    children: node.evolves_to.map(buildEvolutionTree),
  };
}
