import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEvolutionChain } from "./useEvolutionChain";
import type {
  PokemonDetails,
  PokemonSpecies,
  EvolutionChain,
} from "../lib/type";

const { fetchSpecies, fetchEvolutionChain, fetchPokemon } = vi.hoisted(() => ({
  fetchSpecies: vi.fn(),
  fetchEvolutionChain: vi.fn(),
  fetchPokemon: vi.fn(),
}));

vi.mock("../lib/api", () => ({
  fetchSpecies,
  fetchEvolutionChain,
  fetchPokemon,
}));

function makePokemon(name: string, speciesUrl: string): PokemonDetails {
  return {
    name,
    id: 1,
    height: 4,
    weight: 60,
    types: [],
    sprites: { front_default: `${name}.png`, front_shiny: `${name}-shiny.png` },
    abilities: [],
    stats: [],
    species: { name, url: speciesUrl },
  };
}

const charmander = makePokemon("charmander", "https://pokeapi.co/species/4/");

const species: PokemonSpecies = {
  evolution_chain: { url: "https://pokeapi.co/evolution-chain/2/" },
  flavor_text_entries: [],
};

const chain: EvolutionChain = {
  id: 2,
  chain: {
    species: { name: "charmander", url: "" },
    evolves_to: [
      {
        species: { name: "charmeleon", url: "" },
        evolves_to: [
          { species: { name: "charizard", url: "" }, evolves_to: [] },
        ],
      },
    ],
  },
};

describe("useEvolutionChain", () => {
  beforeEach(() => {
    fetchSpecies.mockReset();
    fetchEvolutionChain.mockReset();
    fetchPokemon.mockReset();
  });

  it("builds the evolution tree and fetches every stage's sprite", async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(chain);
    fetchPokemon.mockImplementation((name: string) =>
      Promise.resolve(makePokemon(name, "")),
    );

    const { result } = renderHook(() => useEvolutionChain(charmander));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.tree).toEqual({
      name: "charmander",
      children: [
        {
          name: "charmeleon",
          children: [{ name: "charizard", children: [] }],
        },
      ],
    });

    expect(fetchPokemon).toHaveBeenCalledTimes(3);
    expect(Object.keys(result.current.sprites)).toEqual([
      "charmander",
      "charmeleon",
      "charizard",
    ]);
  });

  it("fetches every stage's sprite in parallel, not one at a time", async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(chain);

    let inFlight = 0;
    let maxInFlight = 0;

    //every time fetchPokemon is called, we bump a counter
    //every time one of those promises actually resolves (via setTimeout) we bring it back down
    //if the hook were fetching sequentially, awaiting each fetchPokemon call before starting the next
    //inFlight could never exceed 1, because the next call literally cant start until the previous promise resolves
    //since Promise.all fires all three calls before any of them has a chance to resolve, maxInFlight should hit 3.
    fetchPokemon.mockImplementation((name: string) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      return new Promise((resolve) => {
        setTimeout(() => {
          inFlight--;
          resolve(makePokemon(name, ""));
        }, 0);
      });
    });

    renderHook(() => useEvolutionChain(charmander));

    await waitFor(() => expect(fetchPokemon).toHaveBeenCalledTimes(3));

    expect(maxInFlight).toBeGreaterThan(1);
  });

  it("keeps the tree intact even if one stage's sprite fetch failes", async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(chain);
    fetchPokemon.mockImplementation((name: string) =>
      name === "charmeleon"
        ? Promise.reject(new Error("network blip"))
        : Promise.resolve(makePokemon(name, "")),
    );

    const { result } = renderHook(() => useEvolutionChain(charmander));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.tree?.children[0].name).toBe("charmeleon");
    expect(result.current.sprites.charmeleon).toBeNull();
    expect(result.current.sprites.charmander).not.toBeNull();
  });

  it("surfaces an error when the species fetch fails outright", async () => {
    fetchSpecies.mockRejectedValue(new Error("species not found"));

    const { result } = renderHook(() => useEvolutionChain(charmander));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("species not found");
    expect(result.current.tree).toBeNull();
  });

  it("aborts the fetch chain when the pokemon prop changes", () => {
    const capturedSignal: AbortSignal[] = [];
    fetchSpecies.mockImplementation((_url, options) => {
      capturedSignal.push(options.signal);
      return new Promise(() => {});
    });

    const { rerender } = renderHook(
      ({ pokemon }) => useEvolutionChain(pokemon),
      { initialProps: { pokemon: charmander } },
    );

    expect(capturedSignal[0].aborted).toBe(false);

    rerender({
      pokemon: makePokemon("squirtle", "https://pokeapi.co/species/7/"),
    });

    expect(capturedSignal[0].aborted).toBe(true);
    expect(capturedSignal[1].aborted).toBe(false);
  });
});
