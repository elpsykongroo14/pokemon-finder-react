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
      <EvolutionNode
        data={data}
        sprites={{ charizard: { front_default: "charizard.png" } }}
      />,
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
    expect(screen.getByText("No image available")).toBeInTheDocument();
  });

  it("recursively renders every stage in a linear evolution chain", () => {
    const data = makeNode("bulbasaur", [
      makeNode("ivysaur", [makeNode("venusaur")]),
    ]);
    const sprites = {
      bulbasaur: { front_default: "bulbasaur.png" },
      ivysaur: { front_default: "ivysaur.png" },
      venusaur: { front_default: "venusaur.png" },
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
      eevee: { front_default: "eevee.png" },
      vaporeon: { front_default: "vaporeon.png" },
      jolteon: { front_default: "jolteon.png" },
      flareon: { front_default: "flareon.png" },
    };

    render(<EvolutionNode data={data} sprites={sprites} />);

    expect(screen.getByText("eevee")).toBeInTheDocument();
    expect(screen.getByText("vaporeon")).toBeInTheDocument();
    expect(screen.getByText("jolteon")).toBeInTheDocument();
    expect(screen.getByText("flareon")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(4);
  });

  it("shows the sprite kind the mode asks for", () => {
    const data = makeNode("pikachu");
    const sprites = {
      pikachu: {
        front_default: "pixel.png",
        other: { "official-artwork": { front_default: "art.png" } },
      },
    };

    const { rerender } = render(
      <EvolutionNode data={data} sprites={sprites} mode="pixel" />,
    );
    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "pixel.png",
    );
    rerender(<EvolutionNode data={data} sprites={sprites} mode="artwork" />);
    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "art.png",
    );
  });

  it("lazy-loads the icons", () => {
    render(
      <EvolutionNode
        data={makeNode("pikachu")}
        sprites={{ pikachu: { front_default: "pikachu.png" } }}
      />,
    );

    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "loading",
      "lazy",
    );
  });

  it("starts each arrow a level later than the one before it", () => {
    const data = makeNode("bulbasaur", [
      makeNode("ivysaur", [makeNode("venusaur")]),
    ]);

    const { container } = render(<EvolutionNode data={data} sprites={{}} />);

    const depths = Array.from(
      container.querySelectorAll<HTMLElement>(".evolution-arrow"),
    ).map((arrow) => arrow.style.getPropertyValue("--evo-depth"));
    expect(depths).toEqual(["0", "1"]);
  });
});
