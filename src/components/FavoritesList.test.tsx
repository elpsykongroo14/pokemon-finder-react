import { type ReactNode } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { FavoritesProvider } from "../context/FavoritesContext";
import { FavoritesList } from "./FavoritesList";
import type { FavoritePokemon } from "../lib/type";
import { PreferencesProvider } from "../context/PreferencesContext";
import { useFavorites } from "../hooks/useFavorites";
import { EMPTY_FAVORITES } from "../lib/copy";

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

//plain function that calls the real render underneath
//with the app's specific provider stack baked in
function renderWithProviders(ui: ReactNode) {
  return render(
    <PreferencesProvider>
      <MemoryRouter>
        <FavoritesProvider>
          {ui}
          <Where />
        </FavoritesProvider>
      </MemoryRouter>
    </PreferencesProvider>,
  );
}

const storedPikachu: FavoritePokemon = {
  name: "pikachu",
  id: 25,
  sprite: "https://img.example/pikachu.png",
  types: ["electric"],
};

//saved before D48: no types
const storedOldEevee: FavoritePokemon = {
  name: "eevee",
  id: 133,
  sprite: "https://img.example/eevee.png",
};

function seed(...favorites: FavoritePokemon[]) {
  localStorage.setItem("pokemon_favorites", JSON.stringify(favorites));
}

const tile = (name: RegExp) => screen.getByRole("link", { name });

beforeEach(() => {
  localStorage.clear();
});

//B&W-4: the favorites tray became the rail under the Pokémon page's field
//(spec 7.2). each favorite is a tile that LINKS to its page; there is no
//remove button any more (unfavorite on the Pokémon's own page), so the
//remove test became the "goes to its page" and "marks the current" tests
describe("FavoritesList", () => {
  it("shows an empty state message when there are no favorites", () => {
    renderWithProviders(<FavoritesList />);

    expect(screen.getByRole("status")).toHaveTextContent(EMPTY_FAVORITES);
  });

  it("is a navigation landmark named Favorites", () => {
    seed(storedPikachu);
    renderWithProviders(<FavoritesList />);

    const rail = screen.getByRole("navigation", { name: "Favorites" });
    expect(within(rail).getByRole("list")).toBeInTheDocument();
  });

  it("lists a saved favorite as a link to its page", async () => {
    seed(storedPikachu);
    const user = userEvent.setup();
    renderWithProviders(<FavoritesList />);

    await user.click(tile(/pikachu/i));

    expect(screen.getByTestId("where")).toHaveTextContent("/pokemon/pikachu");
  });

  //the sprite is decoration: the name (visually hidden) names the link
  it("names each tile by the Pokémon, not by its picture", () => {
    seed(storedPikachu);
    renderWithProviders(<FavoritesList />);

    expect(tile(/pikachu/i)).toHaveAccessibleName("pikachu");
    expect(tile(/pikachu/i).querySelector("img")).toHaveAttribute("alt", "");
  });

  it("marks the tile of the Pokémon whose page this is", () => {
    seed(storedPikachu, storedOldEevee);
    renderWithProviders(<FavoritesList current="eevee" />);

    expect(tile(/eevee/i)).toHaveAttribute("aria-current", "page");
    expect(tile(/pikachu/i)).not.toHaveAttribute("aria-current");
  });

  //D48: the underline takes the primary type's color; a favorite saved
  //before types were stored gets no type, so a neutral underline
  it("themes a tile by its primary type, when it knows one", () => {
    seed(storedPikachu, storedOldEevee);
    renderWithProviders(<FavoritesList />);

    expect(tile(/pikachu/i)).toHaveAttribute("data-type", "electric");
    expect(tile(/eevee/i)).not.toHaveAttribute("data-type");
  });

  //D42: nothing moves on its own when the page loads
  it("does not animate the favorites that were there from the start", () => {
    seed(storedPikachu, storedOldEevee);
    renderWithProviders(<FavoritesList />);

    expect(tile(/pikachu/i)).not.toHaveAttribute("data-new");
    expect(tile(/eevee/i)).not.toHaveAttribute("data-new");
  });

  it("pops in a favorite added while you are on the page", async () => {
    seed(storedPikachu);
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
              types: [],
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

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(tile(/eevee/i)).toHaveAttribute("data-new");
    expect(tile(/pikachu/i)).not.toHaveAttribute("data-new");
  });
});
