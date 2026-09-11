import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompareView } from "./CompareView";
import type { PokemonDetails } from "../lib/type";

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

describe("CompareView", () => {
  it("labels the section with both pokemon's names", () => {
    const primary = makePokemon({ name: "charizard" });
    const secondary = makePokemon({ name: "blastoise" });

    render(<CompareView primary={primary} secondary={secondary} />);

    expect(
      screen.getByRole("region", { name: "Comparing charizard and blastoise" }),
    ).toBeInTheDocument();
  });

  it("renders each pokemon's name as a heading", () => {
    const primary = makePokemon({ name: "charizard" });
    const secondary = makePokemon({ name: "blastoise" });

    render(<CompareView primary={primary} secondary={secondary} />);

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

    render(<CompareView primary={primary} secondary={secondary} />);

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

    render(<CompareView primary={primary} secondary={secondary} />);

    expect(screen.getByText("HP")).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getByText("79")).toBeInTheDocument();
  });
});
