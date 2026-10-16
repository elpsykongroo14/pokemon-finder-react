import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PokemonPage } from "./PokemonPage";
import { usePokemon } from "../hooks/usePokemon";
import type { PokemonDetails } from "../lib/type";
import { PreferencesProvider } from "../context/PreferencesContext";

vi.mock("../hooks/usePokemon");

vi.mock("../components/PokemonCard", () => ({
  PokemonCard: ({ pokemon }: { pokemon: { name: string } }) => (
    <div data-testid="pokemon-card">{pokemon.name}</div>
  ),
}));

function makePokemon(overrides: Partial<PokemonDetails> = {}): PokemonDetails {
  return { name: "pikachu", types: [], ...overrides } as PokemonDetails;
}

function renderPokemonPage(initialPath: string) {
  return render(
    //MessageBox reads the animation preference, so the page needs the provider
    <PreferencesProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/pokemon" element={<PokemonPage />} />
          <Route path="/pokemon/:name" element={<PokemonPage />} />
        </Routes>
      </MemoryRouter>
      ,
    </PreferencesProvider>,
  );
}

describe("PokemonPage", () => {
  it("shows a message when no name is in the URL", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderPokemonPage("/pokemon");

    expect(screen.getByRole("status")).toHaveTextContent(
      "No Pokémon specified",
    );
  });

  it("shows a loading skeleton while the fetch is in flight", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(
      screen.getByRole("status", { name: "Loading Pokémon" }),
    ).toBeInTheDocument();
  });

  it("shows a polite status, not an alert, when the Pokémon does not exist", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: "not-found",
    });

    renderPokemonPage("/pokemon/missingno");

    expect(screen.getByRole("status")).toHaveTextContent(
      'No Pokémon named "missingno" was found.',
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an alert when the pokedex cannot be reached", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: "unreachable",
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't reach the Pokédex. Check your connection and try again.",
    );
  });

  it("renders the pokemon card when data loads", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon(),
      loading: false,
      error: null,
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(screen.getByTestId("pokemon-card")).toHaveTextContent("pikachu");
  });

  it("shows a not found message when the fetch succeeds with no data", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderPokemonPage("/pokemon/missingno");

    expect(screen.getByRole("status")).toHaveTextContent(
      'No Pokémon named "missingno" was found.',
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("themes the whole page to the pokemon's types and clears it on leaving", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon({
        name: "charizard",
        types: [
          { slot: 1, type: { name: "fire", url: "" } },
          { slot: 2, type: { name: "flying", url: "" } },
        ],
      }),
      loading: false,
      error: null,
    });

    const { unmount } = renderPokemonPage("/pokemon/charizard");

    expect(document.documentElement.dataset.type).toBe("fire");
    expect(document.documentElement.dataset.type2).toBe("flying");

    unmount();

    expect(document.documentElement.dataset.type).toBeUndefined();
    expect(document.documentElement.dataset.typ2).toBeUndefined();
  });

  it("does not theme the page when the fetch failed", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon({
        types: [{ slot: 1, type: { name: "electric", url: "" } }],
      }),
      loading: false,
      error: "not-found",
    });

    renderPokemonPage("/pokemon/missingno");

    expect(document.documentElement.dataset.type).toBeUndefined();
  });
});

//PokemonPage owns state selection (loading/error/empty/success) and route driven navigation, nothing else
//usePokemon and PokemonCard are mocked because each already has its own dedicated test file covering its internals,
//re testing them  here would duplicate coverage while coupling this file  to unrelated concerns
