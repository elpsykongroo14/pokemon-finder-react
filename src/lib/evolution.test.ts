import { describe, it, expect } from "vitest";
import { buildEvolutionTree, collectEvolutionNames } from "./evolution";
import type { ChainLink } from "./type";

function link(name: string, evolves_to: ChainLink[] = []): ChainLink {
  return { species: { name, url: "" }, evolves_to };
}

describe("buildEvolutionTree", () => {
  it("returns just a name with no children for a pokemon with no evolutions (base)", () => {
    const chain = link("eevee");

    expect(buildEvolutionTree(chain)).toEqual({ name: "eevee", children: [] });
  });

  it("recurses through a three stage-evolution line", () => {
    const chain = link("bulbasaur", [link("ivysaur", [link("venusaur")])]);

    expect(buildEvolutionTree(chain)).toEqual({
      name: "bulbasaur",
      children: [
        {
          name: "ivysaur",
          children: [{ name: "venusaur", children: [] }],
        },
      ],
    });
  });

  it("handles branching evolutions, like eevee's multiple eeveelutions", () => {
    const chain = link("eevee", [
      link("vaporeon"),
      link("jolteon"),
      link("flareon"),
    ]);

    const result = buildEvolutionTree(chain);

    expect(result.children.map((c) => c.name)).toEqual([
      "vaporeon",
      "jolteon",
      "flareon",
    ]);
  });
});

describe("collectEvolutionNames", () => {
  it("returns just the one name for a leaf node", () => {
    expect(collectEvolutionNames({ name: "venusaur", children: [] })).toEqual([
      "venusaur",
    ]);
  });

  it("flattens a full chain, self first then descendants in order", () => {
    const tree = buildEvolutionTree(
      link("bulbasaur", [link("ivysaur", [link("venusaur")])]),
    );

    expect(collectEvolutionNames(tree)).toEqual([
      "bulbasaur",
      "ivysaur",
      "venusaur",
    ]);
  });
});
