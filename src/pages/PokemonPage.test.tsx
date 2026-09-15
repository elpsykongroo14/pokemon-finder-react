import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PokemonPage } from "./PokemonPage";
import { usePokemon } from "../hooks/usePokemon";
import type { PokemonDetails } from "../lib/type";

vi.mock("../hooks/usePokemon");

vi.mock("../components/PokemonCard", () => ({
  PokemonCard: ({ pokemon }: { pokemon: { name: string } }) => (
    <div data-testid="pokemon-card">{pokemon.name}</div>
  ),
}));

function renderPokemonPage(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/pokemon" element={<PokemonPage />} />
        <Route path="/pokemon/:name" element={<PokemonPage />} />
      </Routes>
    </MemoryRouter>,
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

    expect(screen.getByText("No Pokémon specified")).toBeInTheDocument();
  });

  it("shows a loading status while the fetch is in flight", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("shows an alert with the error message when the fetch fails", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: "Pokémon not found",
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(screen.getByRole("alert")).toHaveTextContent("Pokémon not found");
  });

  it("renders the pokemon card and activation links when data loads", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: { name: "pikachu" } as PokemonDetails,
      loading: false,
      error: null,
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(screen.getByTestId("pokemon-card")).toHaveTextContent("pikachu");
    expect(
      screen.getByRole("button", { name: "⚔️ Compare" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Cards" })).toHaveAttribute(
      "href",
      "/Library/pikachu",
    );
  });

  it("shows a not found message when the fetch succeeds with no data", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderPokemonPage("/pokemon/missingno");

    expect(screen.getByText('No results for "missingno".')).toBeInTheDocument();
  });

  it("navigates to the compare page when Compare is clicked", async () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: { name: "pikachu" } as PokemonDetails,
      loading: false,
      error: null,
    });
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/pokemon/pikachu"]}>
        <Routes>
          <Route path="/pokemon/:name" element={<PokemonPage />} />
          <Route path="/compare" element={<p>Compare Page Content</p>} />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "⚔️ Compare" }));

    expect(screen.getByText("Compare Page Content")).toBeInTheDocument();
  });
});

//PokemonPage owns state selection (loading/error/empty/success) and route driven navigation, nothing else
//usePokemon and PokemonCard are mocked because each already has its own dedicated test file covering its internals,
//re testing them  here would duplicate coverage while coupling this file  to unrelated concerns
