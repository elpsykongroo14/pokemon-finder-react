import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "./HomePage";
import { useEncounter } from "../hooks/useEncounter";
import { PreferencesProvider } from "../context/PreferencesContext";
import type { PokemonDetails } from "../lib/type";

vi.mock("../hooks/useEncounter");

//the real stage reads sprites and preferences, none of which home's own logic
//cares about, so a stand in keeps this test about Home
vi.mock("../components/Stage", () => ({
  Stage: ({ pokemon }: { pokemon: { name: string } }) => (
    <div data-testid="stage">{pokemon.name}</div>
  ),
}));

const retry = vi.fn();

const pikachu = {
  id: 25,
  name: "pikachu",
  types: [{ slot: 1, type: { name: "electric", url: "" } }],
} as unknown as PokemonDetails;

function renderHome() {
  return render(
    <PreferencesProvider>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </PreferencesProvider>,
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    retry.mockClear();
    document.documentElement.removeAttribute("data-type");
  });

  it("announces the loading while the encounter loads, and still shows the menu", () => {
    vi.mocked(useEncounter).mockReturnValue({
      id: 25,
      data: null,
      loading: true,
      error: null,
      retry,
    });

    renderHome();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Searching the tall grass…",
    );
    expect(screen.queryByTestId("stage")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Compare" })).toBeInTheDocument();
  });

  it("shows the wild pokemon on the stage with two line greeting", () => {
    vi.mocked(useEncounter).mockReturnValue({
      id: 25,
      data: pikachu,
      loading: false,
      error: null,
      retry,
    });

    renderHome();

    expect(screen.getByTestId("stage")).toHaveTextContent("pikachu");
    expect(screen.getByRole("status")).toHaveTextContent(
      "A wild PIKACHU appeared! What will you do?",
    );
  });

  it("paints the page in the wild pokemon's type colors", () => {
    vi.mocked(useEncounter).mockReturnValue({
      id: 25,
      data: pikachu,
      loading: false,
      error: null,
      retry,
    });

    renderHome();

    expect(document.documentElement.dataset.type).toBe("electric");
  });

  it("keeps the menu usable and offers Retry when the Pokedex is unreachable", async () => {
    vi.mocked(useEncounter).mockReturnValue({
      id: 25,
      data: null,
      loading: false,
      error: "unreachable",
      retry,
    });
    const user = userEvent.setup();

    renderHome();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't reach the Pokédex.",
    );
    expect(screen.getByRole("link", { name: "Library" })).toBeInTheDocument();
    expect(document.documentElement.dataset.type).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toHaveClass("home-stage");
  });
});

//this file is deliberately minimal: Homepage is a static component
//with no state, props or router dependency, so a single "does the right text render" assertion is correctly sized test
//not under tested, just proportionate to the component'a actual complexity
