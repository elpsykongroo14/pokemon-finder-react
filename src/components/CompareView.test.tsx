import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompareView } from "./CompareView";
import type { PokemonDetails } from "../lib/type";
import { PreferencesProvider } from "../context/PreferencesContext";

function makePokemon(overrides: Partial<PokemonDetails> = {}): PokemonDetails {
  return {
    name: "charizard",
    id: 6,
    height: 17,
    weight: 905,
    types: [{ slot: 1, type: { name: "fire", url: "" } }],
    sprites: { front_default: "charizard.png" },
    abilities: [],
    stats: [{ base_stat: 78, effort: 0, stat: { name: "hp", url: "" } }],
    species: { name: "charizard", url: "" },
    ...overrides,
  };
}

//the sprites now follow the user's sprite/animation preferences,
//so CompareView needs a PreferencesProvider above it (the guard-clause hook throws without one)
function renderView(primary: PokemonDetails, secondary: PokemonDetails) {
  return render(
    <PreferencesProvider>
      <CompareView primary={primary} secondary={secondary} />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("CompareView", () => {
  it("labels the section with both pokemon's names", () => {
    const primary = makePokemon({ name: "charizard" });
    const secondary = makePokemon({ name: "blastoise" });

    renderView(primary, secondary);

    expect(
      screen.getByRole("region", { name: "Comparing charizard and blastoise" }),
    ).toBeInTheDocument();
  });

  it("renders each pokemon's name as a heading", () => {
    const primary = makePokemon({ name: "charizard" });
    const secondary = makePokemon({ name: "blastoise" });

    renderView(primary, secondary);
    expect(
      screen.getByRole("heading", { name: "charizard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "blastoise" }),
    ).toBeInTheDocument();
  });

  it("routes each pokemon's sprite and types its own column", () => {
    const primary = makePokemon({
      name: "charizard",
      sprites: { front_default: "charizard.png" },
      types: [{ slot: 1, type: { name: "fire", url: "" } }],
    });
    const secondary = makePokemon({
      name: "blastoise",
      sprites: { front_default: "blastoise.png" },
      types: [{ slot: 1, type: { name: "water", url: "" } }],
    });

    renderView(primary, secondary);

    expect(screen.getByRole("img", { name: "charizard" })).toHaveAttribute(
      "src",
      "charizard.png",
    );
    expect(screen.getByRole("img", { name: "blastoise" })).toHaveAttribute(
      "src",
      "blastoise.png",
    );

    expect(screen.getByText("fire")).toBeInTheDocument();
    expect(screen.getByText("water")).toBeInTheDocument();
  });

  it("passes both stat sets through the stats chart", () => {
    const primary = makePokemon({
      stats: [{ base_stat: 78, effort: 0, stat: { name: "hp", url: "" } }],
    });
    const secondary = makePokemon({
      stats: [{ base_stat: 79, effort: 0, stat: { name: "hp", url: "" } }],
    });

    renderView(primary, secondary);

    expect(screen.getByText("HP")).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("79")).toBeInTheDocument();
  });

  describe("versus stage", () => {
    it("re skins each half with its own pokemon's primary type", () => {
      const primary = makePokemon({
        name: "charizard",
        types: [
          { slot: 1, type: { name: "fire", url: "" } },
          { slot: 2, type: { name: "flying", url: "" } },
        ],
      });
      const secondary = makePokemon({
        name: "blastoise",
        types: [{ slot: 1, type: { name: "water", url: "" } }],
      });

      const { container } = renderView(primary, secondary);

      expect(container.querySelector('[data-side="left"]')).toHaveAttribute(
        "data-type",
        "fire",
      );
      expect(container.querySelector('[data-side="right"]')).toHaveAttribute(
        "data-type",
        "water",
      );
    });

    it("puts the first pokemon on the left half and the second on the right", () => {
      const { container } = renderView(
        makePokemon({ name: "charizard" }),
        makePokemon({ name: "blastoise" }),
      );
      expect(
        container.querySelector('[data-side="left"] h3'),
      ).toHaveTextContent("charizard");
      expect(
        container.querySelector('[data-side="right"] h3'),
      ).toHaveTextContent("blastoise");
    });

    it("leaves a half unthemed instea of crashing when a pokemon has no types", () => {
      const { container } = renderView(
        makePokemon({ types: [] }),
        makePokemon({ name: "blastoise" }),
      );

      expect(container.querySelector('[data-side="left"]')).not.toHaveAttribute(
        "data-type",
      );
    });

    it("hides the decorative VS badge from assistive tech", () => {
      renderView(makePokemon(), makePokemon({ name: "blastoise" }));

      expect(screen.getByText("VS")).toHaveAttribute("aria-hidden", "true");
    });
  });
});
