import { type ReactNode } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { FavoritesProvider } from "../context/FavoritesContext";
import { FavoritesList } from "./FavoritesList";
import type { FavoritePokemon } from "../lib/type";
import { PreferencesProvider } from "../context/PreferencesContext";
import { useFavorites } from "../hooks/useFavorites";

//plain function that calls the real render underneath
//with the app's specific provider stack baked in
//the helper now includes the preferences provider
function renderWithProviders(ui: ReactNode) {
  return render(
    <PreferencesProvider>
      <MemoryRouter>
        <FavoritesProvider>{ui}</FavoritesProvider>
      </MemoryRouter>
    </PreferencesProvider>,
  );
}

const storedPikachu: FavoritePokemon = {
  name: "pikachu",
  id: 25,
  sprite: "https://img.example/pikachu.png",
};

beforeEach(() => {
  localStorage.clear();
});

describe("FavoritesList", () => {
  it("shows an empty state message when there are no favorites", () => {
    renderWithProviders(<FavoritesList />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "No favorites yet. Tap ♥ on any Pokémon to keep it here.",
    );
  });

  it("lists a favorite that was already saved", () => {
    localStorage.setItem("pokemon_favorites", JSON.stringify([storedPikachu]));
    renderWithProviders(<FavoritesList />);

    expect(screen.getByRole("link", { name: /pikachu/i })).toBeInTheDocument();
  });

  it("removes a favorite when its remove button is clicked", async () => {
    localStorage.setItem("pokemon_favorites", JSON.stringify([storedPikachu]));
    const user = userEvent.setup();
    renderWithProviders(<FavoritesList />);

    await user.click(
      screen.getByRole("button", { name: "Remove pikachu from favorites" }),
    );

    expect(
      screen.queryByRole("link", { name: /pikachu/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "No favorites yet. Tap ♥ on any Pokémon to keep it here.",
    );
  });

  it("names the list so a screen reader announces what it is", () => {
    localStorage.setItem("pokemon_favorites", JSON.stringify([storedPikachu]));
    renderWithProviders(<FavoritesList />);

    expect(screen.getByRole("list", { name: "Favorites" })).toBeInTheDocument();
  });

  it("gives favorites present at the start a one after another entrance", () => {
    const three = ["bulbasaur", "charmander", "squirtle"].map((name, i) => ({
      name,
      id: i + 1,
      sprite: null,
    }));
    localStorage.setItem("pokemon_favorites", JSON.stringify(three));
    renderWithProviders(<FavoritesList />);

    const slots = screen
      .getAllByRole("listitem")
      .map((li) => li.style.getPropertyValue("--fav-slot"));
    expect(slots).toEqual(["0", "1", "2"]);
  });

  it("lets a favorite added later pop in at once, not behind a queue", async () => {
    localStorage.setItem("pokemon_favorites", JSON.stringify([storedPikachu]));
    const user = userEvent.setup();

    //a stand-in for the Favorite button on a Pokémon page
    function AddEevee() {
      const { toggleFavorite } = useFavorites();
      return (
        <button
          onClick={() =>
            toggleFavorite({
              name: "eevee",
              id: 133,
              sprites: { front_default: null },
            } as never)
          }
        >
          add eevee
        </button>
      );
    }
    renderWithProviders(
      <>
        <AddEevee />
        <FavoritesList />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "add eevee" }));

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[1].style.getPropertyValue("--fav-slot")).toBe("0");
  });
});
