import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvolutionSection } from "./EvolutionSection";
import { useEvolutionChain } from "../hooks/useEvolutionChain";
import type { PokemonDetails } from "../lib/type";

vi.mock("../hooks/useEvolutionChain", () => ({
  useEvolutionChain: vi.fn(),
}));

const mockedUseEvolutionChain = vi.mocked(useEvolutionChain);

function setEvolutionChain(
  overrides: Partial<ReturnType<typeof useEvolutionChain>> = {},
) {
  mockedUseEvolutionChain.mockReturnValue({
    tree: null,
    sprites: {},
    loading: false,
    error: null,
    ...overrides,
  });
}

function makePokemon(): PokemonDetails {
  return {
    name: "bulbasaur",
    id: 1,
    height: 7,
    weight: 69,
    types: [],
    sprites: {},
    abilities: [],
    stats: [],
    species: {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon-species/1/",
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  setEvolutionChain();
});

describe("EvolutionSection", () => {
  it("shows a status message while loading", () => {
    setEvolutionChain({ loading: true });
    render(<EvolutionSection pokemon={makePokemon()} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading evolution chain...",
    );
  });

  it("shows an alert when the fetch fails", () => {
    setEvolutionChain({ error: "network error" });
    render(<EvolutionSection pokemon={makePokemon()} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load evolution data.",
    );
  });

  it("shows a 'does not evolve' message for a successful fetch with no evolution", () => {
    setEvolutionChain({
      tree: { name: "bulbasaur", children: [] },
      sprites: {},
    });
    render(<EvolutionSection pokemon={makePokemon()} />);

    expect(
      screen.getByText("This Pokémon does not evolve."),
    ).toBeInTheDocument();
    //and specifically not treated as an error
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the evolution tree when one exists", () => {
    setEvolutionChain({
      tree: {
        name: "bulbasaur",
        children: [{ name: "ivysaur", children: [] }],
      },
      sprites: { bulbasaur: "bulbasaur.png", ivysaur: "ivysaur.png" },
    });
    render(<EvolutionSection pokemon={makePokemon()} />);

    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("ivysaur")).toBeInTheDocument();
  });
});

//this file protects all four states, with particular care on the "empty tree doesnt equal error"
//distinction the source code itself calls out as easy to confuse, and it composes the real
//EvolutionNode for the success case without re verifying recursion behavior thats already covered elsewhere
