import { describe, it, expect } from "vitest";
import {
  buildEvolutionTree,
  collectEvolutionNames,
  evolutionCondition,
} from "./evolution";
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

describe("evolutionCondition (D47)", () => {
  const trigger = (name: string) => ({ name, url: "" });

  it("names a level-up by its level", () => {
    expect(
      evolutionCondition([{ trigger: trigger("level-up"), min_level: 50 }]),
    ).toBe("Level 50");
  });

  it("names an evolution stone, in words", () => {
    expect(
      evolutionCondition([
        { trigger: trigger("use-item"), item: { name: "dusk-stone", url: "" } },
      ]),
    ).toBe("Dusk Stone");
  });

  it("names a trade", () => {
    expect(evolutionCondition([{ trigger: trigger("trade") }])).toBe("Trade");
  });

  it("names a friendship level-up", () => {
    expect(
      evolutionCondition([
        { trigger: trigger("level-up"), min_level: null, min_happiness: 160 },
      ]),
    ).toBe("Friendship");
  });

  it("says Special for a method it cannot name, rather than nothing", () => {
    expect(evolutionCondition([{ trigger: trigger("shed") }])).toBe("Special");
    //level-up with nothing we model (a place, a held item)
    expect(evolutionCondition([{ trigger: trigger("level-up") }])).toBe(
      "Special",
    );
  });

  it("falls through to a later entry when the first cannot be named", () => {
    //Leafeon and Glaceon: a special rock in the old games, a stone later
    expect(
      evolutionCondition([
        { trigger: trigger("level-up") },
        { trigger: trigger("use-item"), item: { name: "ice-stone", url: "" } },
      ]),
    ).toBe("Ice Stone");
  });

  it("names a move type a level-up needs", () => {
    //Sylveon: a Fairy move and friendship. the move is what sets it apart
    expect(
      evolutionCondition([
        {
          trigger: trigger("level-up"),
          known_move_type: { name: "fairy", url: "" },
          min_happiness: 160,
        },
      ]),
    ).toBe("Fairy move");
  });

  it("says the time of day a friendship evolution needs", () => {
    //Espeon and Umbreon would otherwise both read "Friendship"
    expect(
      evolutionCondition([
        {
          trigger: trigger("level-up"),
          min_happiness: 160,
          time_of_day: "night",
        },
      ]),
    ).toBe("Friendship, night");
  });

  it("shows no label for the first stage, which has no details", () => {
    expect(evolutionCondition([])).toBeUndefined();
    expect(evolutionCondition(undefined)).toBeUndefined();
  });

  it("reads the first entry when the games disagree", () => {
    expect(
      evolutionCondition([
        { trigger: trigger("level-up"), min_level: 30 },
        { trigger: trigger("trade") },
      ]),
    ).toBe("Level 30");
  });
});

describe("buildEvolutionTree with conditions", () => {
  it("puts each stage's condition on that stage", () => {
    const chain: ChainLink = {
      species: { name: "deino", url: "" },
      evolution_details: [],
      evolves_to: [
        {
          species: { name: "zweilous", url: "" },
          evolution_details: [
            { trigger: { name: "level-up", url: "" }, min_level: 50 },
          ],
          evolves_to: [],
        },
      ],
    };

    const tree = buildEvolutionTree(chain);

    expect(tree.condition).toBeUndefined();
    expect(tree.children[0].condition).toBe("Level 50");
  });
});
