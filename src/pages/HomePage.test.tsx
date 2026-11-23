import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HomePage } from "./HomePage";
import { useEncounter } from "../hooks/useEncounter";
import { PreferencesProvider } from "../context/PreferencesContext";
import { TeamProvider } from "../context/TeamContext";
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
const reroll = vi.fn();

const pikachu = {
  id: 25,
  name: "pikachu",
  types: [{ slot: 1, type: { name: "electric", url: "" } }],
} as unknown as PokemonDetails;

const zoroark = {
  id: 571,
  name: "zoroark",
  types: [{ slot: 1, type: { name: "dark", url: "" } }],
} as unknown as PokemonDetails;

type Encounter = ReturnType<typeof useEncounter>;

function encounter(overrides: Partial<Encounter>): Encounter {
  return {
    id: 25,
    data: null,
    loading: false,
    error: null,
    retry,
    reroll,
    ...overrides,
  };
}

//the command plate's team command needs the real party
function page() {
  return (
    <PreferencesProvider>
      <TeamProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </TeamProvider>
    </PreferencesProvider>
  );
}

const renderHome = () => render(page());

describe("HomePage", () => {
  beforeEach(() => {
    retry.mockClear();
    reroll.mockClear();
    localStorage.clear();
    document.documentElement.removeAttribute("data-type");
  });

  it("announces the loading while the encounter loads, and still offers the menu", () => {
    vi.mocked(useEncounter).mockReturnValue(encounter({ loading: true }));

    renderHome();

    //one status only: the battle dialog says it, the skeleton is a picture
    expect(screen.getByRole("status")).toHaveTextContent(
      "Searching the tall grass…",
    );
    expect(screen.queryByTestId("stage")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute(
      "href",
      "/compare",
    );
    expect(
      screen.getByRole("button", { name: "Look for another" }),
    ).toBeInTheDocument();
  });

  it("shows the wild pokemon on the stage with two line greeting", () => {
    vi.mocked(useEncounter).mockReturnValue(encounter({ data: pikachu }));

    renderHome();

    expect(screen.getByTestId("stage")).toHaveTextContent("pikachu");
    expect(screen.getByRole("status")).toHaveTextContent(
      "A wild PIKACHU appeared! What will you do?",
    );
    expect(
      screen.getByRole("link", { name: "Check its entry" }),
    ).toHaveAttribute("href", "/pokemon/pikachu");
  });

  it("stands everything in a field named 'Wild encounter'", () => {
    vi.mocked(useEncounter).mockReturnValue(encounter({ data: pikachu }));

    renderHome();

    expect(
      screen.getByRole("region", { name: "Wild encounter" }),
    ).toBeInTheDocument();
  });

  it("paints the page in the wild pokemon's type colors", () => {
    vi.mocked(useEncounter).mockReturnValue(encounter({ data: pikachu }));

    renderHome();

    expect(document.documentElement.dataset.type).toBe("electric");
  });

  it("asks for another wild Pokémon from the command plate", async () => {
    vi.mocked(useEncounter).mockReturnValue(encounter({ data: pikachu }));
    const user = userEvent.setup();

    renderHome();
    await user.click(screen.getByRole("button", { name: "Look for another" }));

    expect(reroll).toHaveBeenCalledTimes(1);
  });

  //spec 6.1 + D43: a new Pokémon is a new stage (keyed by name), so the
  //encounter plays again, inside the SAME field, so its sky can change
  //color under the slab. the dialog keeps its live region, so the new
  //greeting is announced
  it("plays a fresh encounter for a new Pokémon inside the same field", () => {
    vi.mocked(useEncounter).mockReturnValue(encounter({ data: pikachu }));
    const view = renderHome();
    const field = view.container.querySelector(".encounter-field");
    const stage = screen.getByTestId("stage");
    const status = screen.getByRole("status");

    vi.mocked(useEncounter).mockReturnValue(
      encounter({ id: 571, data: zoroark }),
    );
    view.rerender(page());

    expect(view.container.querySelector(".encounter-field")).toBe(field);
    expect(screen.getByTestId("stage")).not.toBe(stage);
    expect(screen.getByTestId("stage")).toHaveTextContent("zoroark");
    expect(screen.getByRole("status")).toBe(status);
    expect(status).toHaveTextContent("A wild ZOROARK appeared!");
  });

  it("keeps the menu usable and offers Retry when the Pokedex is unreachable", async () => {
    vi.mocked(useEncounter).mockReturnValue(
      encounter({ error: "unreachable" }),
    );
    const user = userEvent.setup();

    renderHome();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't reach the Pokédex.",
    );
    expect(
      screen.getByRole("button", { name: "Look for another" }),
    ).toBeInTheDocument();
    expect(document.documentElement.dataset.type).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toHaveClass("home-stage");
  });
});
