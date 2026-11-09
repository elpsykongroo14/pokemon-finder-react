import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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

function renderActions(name = "pikachu") {
  render(
    <MemoryRouter initialEntries={["/pokemon/x"]}>
      <PokemonActions pokemon={{ name } as PokemonDetails} />
      <Probe />
    </MemoryRouter>,
  );
}

describe("PokemonActions", () => {
  it("groups the collection buttons under 'Collect'", () => {
    renderActions();

    const collect = screen.getByRole("group", { name: "Collect" });
    expect(
      within(collect).getByRole("button", { name: /favorite/i }),
    ).toBeInTheDocument();
    expect(
      within(collect).getByRole("button", { name: "Team stub" }),
    ).toBeInTheDocument();
  });

  it("groups the links to other pages under 'explore'", () => {
    renderActions();

    const explore = screen.getByRole("group", { name: "Explore" });
    expect(
      within(explore).getByRole("link", { name: "⚔️ Compare" }),
    ).toBeInTheDocument();
    expect(
      within(explore).getByRole("link", { name: "View Cards" }),
    ).toBeInTheDocument();
  });

  it("no longer holds sprites switches (they live on the stage)", () => {
    renderActions();

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("calls toggleFavorite with the pokemon when Favorite is clicked", async () => {
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByRole("button", { name: /favorite/i }));

    expect(toggleFavorite).toHaveBeenCalledWith({ name: "pikachu" });
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
