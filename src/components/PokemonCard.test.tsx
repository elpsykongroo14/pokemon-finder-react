import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokemonCard } from "./PokemonCard";
import type { PokemonDetails } from "../lib/type";
import { PreferencesProvider } from "../context/PreferencesContext";
import { MemoryRouter } from "react-router-dom";

const { toggleFavorite } = vi.hoisted(() => ({ toggleFavorite: vi.fn() }));

vi.mock("../hooks/useFavorites", () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    toggleFavorite,
  }),
}));

vi.mock("./TypeBadgeList", () => ({ TypeBadgeList: () => null }));
vi.mock("./StatBarChart", () => ({ StatBarChart: () => null }));
vi.mock("./MetaInfo", () => ({ MetaInfo: () => null }));
vi.mock("./EvolutionSection", () => ({ EvolutionSection: () => null }));
vi.mock("../context/TeamButton", () => ({ TeamButton: () => null }));

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

function renderCard() {
  return render(
    <MemoryRouter>
      <PreferencesProvider>
        <PokemonCard pokemon={mockPokemon} />
      </PreferencesProvider>
    </MemoryRouter>,
  );
}

describe("PokemonCard", () => {
  it("shows the default sprite and an unchecked shiny toggle on first render", () => {
    renderCard();

    expect(screen.getByRole("checkbox", { name: "Shiny" })).not.toBeChecked();
    expect(screen.getByRole("img", { name: "pikachu" })).toBeInTheDocument();
  });

  it("swaps to the shiny sprite when the Shiny checkbox is checked", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("checkbox", { name: "Shiny" }));

    expect(screen.getByRole("checkbox", { name: "Shiny" })).toBeChecked();
    expect(
      screen.getByRole("img", { name: "pikachu(shiny)" }),
    ).toBeInTheDocument();
  });

  it("calls toggleFavorite with the pokemon when the favorite button is clicked", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: /favorite/i }));

    expect(toggleFavorite).toHaveBeenCalledWith(mockPokemon);
  });

  it("organises the details into Info, Stats and Evolution tabs", async () => {
    const user = userEvent.setup();
    renderCard();

    const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(tabs).toEqual(["Info", "Stats", "Evolution"]);
    expect(screen.getByRole("tab", { name: "Info" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("tab", { name: "Stats" }));
    expect(screen.getByRole("tab", { name: "Stats" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
