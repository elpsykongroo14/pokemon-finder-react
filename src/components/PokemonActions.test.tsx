import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { PokemonActions } from "./PokemonActions";
import type { PokemonDetails } from "../lib/type";

const { toggleFavorite } = vi.hoisted(() => ({ toggleFavorite: vi.fn() }));

vi.mock("../hooks/useFavorites", () => ({
  useFavorites: () => ({ isFavorite: () => false, toggleFavorite }),
}));
vi.mock("../context/TeamButton", () => ({
  TeamButton: () => <button type="button">Team stub</button>,
}));

function Probe() {
  const { pathname, search } = useLocation();
  return <p data-testid="where">{pathname + search}</p>;
}

function renderActions(
  name = "pikachu",
  onShinyChange = vi.fn(),
  shiny = false,
) {
  render(
    <MemoryRouter initialEntries={["/pokemon/x"]}>
      <PokemonActions
        pokemon={{ name } as PokemonDetails}
        shiny={shiny}
        onShinyChange={onShinyChange}
      />
      <Probe />
    </MemoryRouter>,
  );
  return { onShinyChange };
}

describe("PokemonActions", () => {
  it("offers every action: favorite, team, shiny, compare and cards", () => {
    renderActions();

    expect(
      screen.getByRole("button", { name: /favorite/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Team stub" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Shiny" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "⚔️ Compare" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View Cards" }),
    ).toBeInTheDocument();
  });

  it("tells the parent when Shiny is toggled", async () => {
    const user = userEvent.setup();
    const { onShinyChange } = renderActions();

    await user.click(screen.getByRole("checkbox", { name: "Shiny" }));

    expect(onShinyChange).toHaveBeenCalledWith(true);
  });

  it("builds the destinations from the pokemon's name", () => {
    renderActions("pikachu");

    expect(screen.getByRole("link", { name: "⚔️ Compare" })).toHaveAttribute(
      "href",
      "/compare?a=pikachu",
    );
    expect(screen.getByRole("link", { name: "View Cards" })).toHaveAttribute(
      "href",
      "/library/pikachu",
    );
  });

  it("encodes names that are not URL-safe", () => {
    renderActions("mr mime");

    expect(screen.getByRole("link", { name: "⚔️ Compare" })).toHaveAttribute(
      "href",
      "/compare?a=mr%20mime",
    );
  });

  it("navigates to the compare page when Compare is clicked", async () => {
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByRole("link", { name: "⚔️ Compare" }));

    expect(screen.getByTestId("where")).toHaveTextContent("/compare?a=pikachu");
  });
});
