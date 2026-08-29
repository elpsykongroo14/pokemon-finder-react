import { type ReactNode } from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { FavoritesProvider } from "../context/FavoritesContext";
import { FavoritesList } from "./FavoritesList";
import type { FavoritePokemon } from "../lib/type";

//plain function that calls the real render underneath
//with the app's specific provider stack baked in
function renderWithProviders(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <FavoritesProvider>{ui}</FavoritesProvider>
    </MemoryRouter>,
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

    expect(screen.getByText("No favorites yet.")).toBeInTheDocument();
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
    expect(screen.getByText("No favorites yet.")).toBeInTheDocument();
  });
});
