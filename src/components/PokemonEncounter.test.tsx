import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokemonEncounter } from "./PokemonEncounter";
import type { PokemonDetails } from "../lib/type";
import type { FavoritesContextValue } from "../hooks/useFavorites";
import { PreferencesProvider } from "../context/PreferencesContext";
import { MemoryRouter } from "react-router-dom";

//moved from PokemonCard.test (B&W-4): PokemonCard was split into this
//keyed encounter layer (stage + name plate) and PokemonReadout (the
//sections below the field), so its tests moved with the parts they test

const { toggleFavorite } = vi.hoisted(() => ({ toggleFavorite: vi.fn() }));

vi.mock("../hooks/useFavorites", () => ({
  //typed as the real context value, so if the context gains a field the
  //compiler points here instead of a test failing for a confusing reason
  useFavorites: (): FavoritesContextValue => ({
    favorites: [],
    isFavorite: () => false,
    toggleFavorite,
    removeFavorite: () => {},
  }),
}));

vi.mock("./TypeBadgeList", () => ({ TypeBadgeList: () => null }));
vi.mock("../hooks/useTeamAction", () => ({ useTeamAction: () => ({}) }));
vi.mock("../context/TeamButton", () => ({
  TeamToggle: () => null,
  TeamStatus: () => null,
}));

const mockPokemon: PokemonDetails = {
  name: "pikachu",
  id: 25,
  height: 4,
  weight: 60,
  types: [{ slot: 1, type: { name: "electric", url: "" } }],
  sprites: {
    front_default: "https://img.example/default.png",
    front_shiny: "https://img.example/shiny.png",
  },
  abilities: [
    { is_hidden: false, slot: 1, ability: { name: "static", url: "" } },
  ],
  stats: [{ base_stat: 35, effort: 0, stat: { name: "hp", url: "" } }],
  species: {
    name: "pikachu",
    url: "https://pokeapi.co/api/v2/pokemon-species/25/",
  },
};

//the page renders the layer with key={pokemon.name}; the helper does the
//same, so a rerender with another Pokémon behaves the way the page does
function encounter(pokemon: PokemonDetails) {
  return (
    <MemoryRouter>
      <PreferencesProvider>
        <PokemonEncounter
          key={pokemon.name}
          pokemon={pokemon}
          headingId="plate-name"
        />
      </PreferencesProvider>
    </MemoryRouter>
  );
}

const shinyButton = () => screen.getByRole("button", { name: "Shiny" });

describe("PokemonEncounter", () => {
  it("shows the default sprite and Shiny off on first render", () => {
    render(encounter(mockPokemon));

    expect(shinyButton()).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("img", { name: "pikachu" })).toBeInTheDocument();
  });

  it("swaps to the shiny sprite when Shiny is pressed", async () => {
    const user = userEvent.setup();
    render(encounter(mockPokemon));

    await user.click(shinyButton());

    expect(shinyButton()).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("img", { name: "pikachu(shiny)" }),
    ).toBeInTheDocument();
  });

  it("calls toggleFavorite with the pokemon when Favorite is clicked", async () => {
    const user = userEvent.setup();
    render(encounter(mockPokemon));

    await user.click(screen.getByRole("button", { name: "Favorite" }));

    expect(toggleFavorite).toHaveBeenCalledWith(mockPokemon);
  });

  it("starts every Pokémon with Shiny off", async () => {
    const user = userEvent.setup();
    const { rerender } = render(encounter(mockPokemon));
    await user.click(shinyButton());
    expect(shinyButton()).toHaveAttribute("aria-pressed", "true");

    //a new key: what the page does when we search again
    rerender(encounter({ ...mockPokemon, name: "raichu", id: 26 }));

    expect(shinyButton()).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("img", { name: "raichu" })).toBeInTheDocument();
  });

  //the page names the field after this heading, through the id it passes
  it("puts the name on the plate as a level 2 heading with the given id", () => {
    render(encounter(mockPokemon));

    expect(
      screen.getByRole("heading", { level: 2, name: "pikachu" }),
    ).toHaveAttribute("id", "plate-name");
  });

  //the wipe is decoration: two slabs, the black one first, and nothing a
  //screen reader would ever read (spec 6.1)
  it("draws the two wipe slabs, hidden from assistive tech", () => {
    const { container } = render(encounter(mockPokemon));

    const slabs = container.querySelectorAll(".encounter__wipe");
    expect(slabs).toHaveLength(2);
    slabs.forEach((slab) =>
      expect(slab).toHaveAttribute("aria-hidden", "true"),
    );
    expect(slabs[1]).toHaveAttribute("data-white");
  });
});
