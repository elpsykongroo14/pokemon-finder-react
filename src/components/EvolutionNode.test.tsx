import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { EvolutionNode } from "./EvolutionNode";
import type { EvolutionNode as EvolutionNodeData } from "../lib/type";
import type { PokemonSprites } from "../lib/sprites";

//tiny helper, not a heavyweight fixture library
//its only job is to save us from typing {children: []} on every leaf node
function makeNode(
  name: string,
  children: EvolutionNodeData[] = [],
  condition?: string,
): EvolutionNodeData {
  return condition ? { name, children, condition } : { name, children };
}

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

//B&W-4: stages are links to their Pokémon now, so they need a router.
//their sprites are decorative (alt=""): the name is right under them as
//text, and an alt would make every link say its name twice. so the tests
//find the images by tag, not by the img role
function renderNode(
  data: EvolutionNodeData,
  sprites: Record<string, PokemonSprites | null>,
  extra: { current?: string; mode?: "pixel" | "artwork" } = {},
) {
  return render(
    <MemoryRouter>
      <EvolutionNode data={data} sprites={sprites} {...extra} />
      <Where />
    </MemoryRouter>,
  );
}

describe("EvolutionNode", () => {
  it("renders a leaf stage with the pokemon's sprite and name", () => {
    const { container } = renderNode(makeNode("charizard"), {
      charizard: { front_default: "charizard.png" },
    });

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "charizard.png",
    );
    expect(screen.getByText("charizard")).toBeInTheDocument();
  });

  it("renders a placeholder when no sprite is available for this stage", () => {
    const { container } = renderNode(makeNode("missingno"), {});

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("No image available")).toBeInTheDocument();
  });

  it("recursively renders every stage in a linear evolution chain", () => {
    const data = makeNode("bulbasaur", [
      makeNode("ivysaur", [makeNode("venusaur")]),
    ]);
    const { container } = renderNode(data, {
      bulbasaur: { front_default: "bulbasaur.png" },
      ivysaur: { front_default: "ivysaur.png" },
      venusaur: { front_default: "venusaur.png" },
    });

    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("ivysaur")).toBeInTheDocument();
    expect(screen.getByText("venusaur")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(3);
  });

  it("renders every branch when a stage splits into multiple evolutions", () => {
    const data = makeNode("eevee", [
      makeNode("vaporeon"),
      makeNode("jolteon"),
      makeNode("flareon"),
    ]);
    const { container } = renderNode(data, {
      eevee: { front_default: "e.png" },
      vaporeon: { front_default: "v.png" },
      jolteon: { front_default: "j.png" },
      flareon: { front_default: "f.png" },
    });

    for (const name of ["eevee", "vaporeon", "jolteon", "flareon"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(container.querySelectorAll("img")).toHaveLength(4);
  });

  it("shows the sprite kind the mode asks for", () => {
    const sprites = {
      pikachu: {
        front_default: "p.png",
        other: { "official-artwork": { front_default: "art.png" } },
      },
    };
    const { container, unmount } = renderNode(makeNode("pikachu"), sprites, {
      mode: "pixel",
    });
    expect(container.querySelector("img")).toHaveAttribute("src", "p.png");
    unmount();

    const artwork = renderNode(makeNode("pikachu"), sprites, {
      mode: "artwork",
    });
    expect(artwork.container.querySelector("img")).toHaveAttribute(
      "src",
      "art.png",
    );
  });

  it("lazy-loads the icons, and keeps them out of the link's name", () => {
    const { container } = renderNode(makeNode("pikachu"), {
      pikachu: { front_default: "p.png" },
    });

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("alt", "");
    expect(screen.getByRole("link", { name: "pikachu" })).toBeInTheDocument();
  });

  //D47: the condition sits on the step BEFORE the stage it leads to
  it("labels each step with how the next stage is reached", () => {
    const data = makeNode("deino", [
      makeNode("zweilous", [makeNode("hydreigon", [], "Level 64")], "Level 50"),
    ]);
    renderNode(data, {});

    const steps = [...document.querySelectorAll(".evolution-step__how")].map(
      (step) => step.textContent,
    );
    expect(steps).toEqual(["Level 50", "Level 64"]);
  });

  it("draws the arrow for a step even when the condition has no name", () => {
    const { container } = renderNode(
      makeNode("larvesta", [makeNode("volcarona")]),
      {},
    );

    const how = container.querySelector(".evolution-step__how");
    expect(how).toHaveTextContent("");
    expect(how?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  //spec 7.2: nodes navigate. the current stage is the page you are on
  it("links every other stage to its page, and marks the current one", async () => {
    const user = userEvent.setup();
    renderNode(
      makeNode("deino", [makeNode("zweilous", [makeNode("hydreigon")])]),
      {},
      { current: "zweilous" },
    );

    expect(
      screen.queryByRole("link", { name: "zweilous" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("zweilous").closest("[aria-current]"),
    ).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("link", { name: "hydreigon" }));
    expect(screen.getByTestId("where")).toHaveTextContent("/pokemon/hydreigon");
  });
});
