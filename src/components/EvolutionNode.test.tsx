import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvolutionNode } from "./EvolutionNode";
import type { EvolutionNode as EvolutionNodeData } from "../lib/type";

//tiny helper, not a heavyweight fixture library
//its only job is to save us from typing {children: []} on every leaf node
function makeNode(
  name: string,
  children: EvolutionNodeData[] = [],
): EvolutionNodeData {
  return { name, children };
}

describe("EvolutionNode", () => {
  it("renders a leaf stage with the pokemon's sprite and name", () => {
    const data = makeNode("charizard");

    render(
      <EvolutionNode data={data} sprites={{ charizard: "charizard.png" }} />,
    );

    expect(screen.getByRole("img", { name: "charizard" })).toHaveAttribute(
      "src",
      "charizard.png",
    );
    expect(screen.getByText("charizard")).toBeInTheDocument();
  });

  it("renders a placeholder when no sprite is available for this stage", () => {
    const data = makeNode("missingno");

    render(<EvolutionNode data={data} sprites={{}} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("No image")).toBeInTheDocument();
  });

  it("recursively renders every stage in a linear evolution chain", () => {
    const data = makeNode("bulbasaur", [
      makeNode("ivysaur", [makeNode("venusaur")]),
    ]);
    const sprites = {
      bulbasaur: "bulbasaur.png",
      ivysaur: "ivysaur.png",
      venusaur: "venusaur.png",
    };

    render(<EvolutionNode data={data} sprites={sprites} />);

    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("ivysaur")).toBeInTheDocument();
    expect(screen.getByText("venusaur")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("renders every branch when a stage splits into multiple evolutions", () => {
    const data = makeNode("eevee", [
      makeNode("vaporeon"),
      makeNode("jolteon"),
      makeNode("flareon"),
    ]);

    const sprites = {
      eevee: "eevee.png",
      vaporeon: "vaporeon.png",
      jolteon: "jolteon.png",
      flareon: "flareon.png",
    };

    render(<EvolutionNode data={data} sprites={sprites} />);

    expect(screen.getByText("eevee")).toBeInTheDocument();
    expect(screen.getByText("vaporeon")).toBeInTheDocument();
    expect(screen.getByText("jolteon")).toBeInTheDocument();
    expect(screen.getByText("flareon")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(4);
  });
});
