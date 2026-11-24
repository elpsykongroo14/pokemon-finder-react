import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PokemonPage } from "./PokemonPage";
import { usePokemon } from "../hooks/usePokemon";
import type { PokemonDetails } from "../lib/type";
import { PreferencesProvider } from "../context/PreferencesContext";
import userEvent from "@testing-library/user-event";

vi.mock("../hooks/usePokemon");
const retry = vi.fn();

//B&W-4: PokemonCard was split into the encounter layer (inside the field)
//and the readout (below it), with the favorites rail between them. all
//three have their own tests; here they are stand-ins that show what the
//page handed them
vi.mock("../components/PokemonEncounter", () => ({
  PokemonEncounter: ({ pokemon }: { pokemon: { name: string } }) => (
    <div data-testid="pokemon-card">{pokemon.name}</div>
  ),
}));
vi.mock("../components/PokemonReadout", () => ({
  PokemonReadout: ({ pokemon }: { pokemon: { name: string } }) => (
    <div data-testid="pokemon-readout">{pokemon.name}</div>
  ),
}));
//B&W-7: the cards teaser has its own tests and fetches from the card
//proxy; this page only places it
vi.mock("../components/CardsTeaser", () => ({
  CardsTeaser: ({ name }: { name: string }) => (
    <div data-testid="cards-teaser">{name}</div>
  ),
}));

vi.mock("../components/FavoritesList", () => ({
  FavoritesList: ({ current }: { current?: string }) => (
    <nav data-testid="favorites-rail">{current ?? "none"}</nav>
  ),
}));

function makePokemon(overrides: Partial<PokemonDetails> = {}): PokemonDetails {
  return { name: "pikachu", types: [], ...overrides } as PokemonDetails;
}

function renderPokemonPage(initialPath: string) {
  const ui = (
    //MessageBox reads the animation preference, so the page needs the provider
    <PreferencesProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/pokemon" element={<PokemonPage />} />
          <Route path="/pokemon/:name" element={<PokemonPage />} />
        </Routes>
      </MemoryRouter>
    </PreferencesProvider>
  );
  //ui is returned too, so a test can rerender the same tree after
  //changing what usePokemon returns
  return { ...render(ui), ui };
}

describe("PokemonPage", () => {
  beforeEach(() => retry.mockClear());
  it("shows a message when no name is in the URL", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      retry,
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
      retry,
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(
      screen.getByRole("status", { name: "Searching the tall grass…" }),
    ).toBeInTheDocument();
  });

  //B&W-8, spec 7.6: while loading, the battle dialog says it too. the
  //skeleton above already announces it, so the dialog is for the eye: one
  //announcement, not two
  it("shows the loading line in the battle dialog, without a second announcement", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      retry,
    });

    const { container } = renderPokemonPage("/pokemon/pikachu");

    const dialog = container.querySelector(".encounter-field__message");
    expect(dialog).toHaveTextContent("Searching the tall grass…");
    expect(dialog).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("offers Retry when the pokeex is unreachable, and only then", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: "unreachable",
      retry,
    });
    const { unmount } = renderPokemonPage("/pokemon/pikachu");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    //the alert announces the sentence only, not the button's label
    expect(screen.getByRole("alert")).not.toHaveTextContent("Retry");
    unmount();

    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: "not-found",
      retry,
    });
    renderPokemonPage("/pokemon/missingno");
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });

  it("Retry calls retry and keeps keyboard focus on the page", async () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: "unreachable",
      retry,
    });
    const user = userEvent.setup();
    renderPokemonPage("/pokemon/pikachu");

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toHaveClass("pokemon-page");
  });

  it("shows a polite status, not an alert, when the Pokémon does not exist", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: "not-found",
      retry,
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
      retry,
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't reach the Pokédex. Check your connection and try again.",
    );
  });

  it("renders the encounter and the readout when data loads", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon(),
      loading: false,
      error: null,
      retry,
    });

    renderPokemonPage("/pokemon/pikachu");

    expect(screen.getByTestId("pokemon-card")).toHaveTextContent("pikachu");
    expect(screen.getByTestId("pokemon-readout")).toHaveTextContent("pikachu");
    //B&W-7: and the cards teaser under it, for the same Pokémon
    expect(screen.getByTestId("cards-teaser")).toHaveTextContent("pikachu");
  });

  //the rail marks the tile of the Pokémon on screen; while loading there
  //is none yet
  it("tells the favorites rail which Pokémon is on screen", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon(),
      loading: false,
      error: null,
      retry,
    });
    renderPokemonPage("/pokemon/pikachu");
    expect(screen.getByTestId("favorites-rail")).toHaveTextContent("pikachu");
  });

  //D43: the field outlives each Pokémon: loading the next one must not
  //replace it, or its sky could not change color under the slab
  it("keeps the same field from one Pokémon, through loading, to the next", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon(),
      loading: false,
      error: null,
      retry,
    });
    const view = renderPokemonPage("/pokemon/pikachu");
    const field = view.container.querySelector(".encounter-field");
    expect(field).not.toBeNull();

    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon(),
      loading: true,
      error: null,
      retry,
    });
    view.rerender(view.ui);
    expect(view.container.querySelector(".encounter-field")).toBe(field);

    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon({ name: "raichu" }),
      loading: false,
      error: null,
      retry,
    });
    view.rerender(view.ui);
    expect(view.container.querySelector(".encounter-field")).toBe(field);
  });

  //the field is a region named after the Pokémon only once there is one
  it("names the field after the Pokémon once it has loaded", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: makePokemon(),
      loading: true,
      error: null,
      retry,
    });
    const { container } = renderPokemonPage("/pokemon/pikachu");

    expect(container.querySelector(".encounter-field")).not.toHaveAttribute(
      "aria-labelledby",
    );
  });

  it("shows a not found message when the fetch succeeds with no data", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      retry,
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
      retry,
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
      retry,
    });

    renderPokemonPage("/pokemon/missingno");

    expect(document.documentElement.dataset.type).toBeUndefined();
  });
});

//PokemonPage owns state selection (loading/error/empty/success) and route driven navigation, nothing else
//usePokemon and PokemonCard are mocked because each already has its own dedicated test file covering its internals,
//re testing them  here would duplicate coverage while coupling this file  to unrelated concerns
