import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PokemonReadout } from "./PokemonReadout";
import type { PokemonDetails } from "../lib/type";

//each section has its own tests; here only the layout around them matters
vi.mock("./StatBarChart", () => ({ StatBarChart: () => <p>stats here</p> }));
vi.mock("./MetaInfo", () => ({ MetaInfo: () => <p>profile here</p> }));
vi.mock("./EvolutionSection", () => ({
  EvolutionSection: () => <p>evolution here</p>,
}));
vi.mock("./TypeMatchups", () => ({
  TypeMatchups: () => <p>matchups here</p>,
}));

const pokemon = {
  name: "hydreigon",
  types: [{ slot: 1, type: { name: "dark", url: "" } }],
  stats: [],
  abilities: [],
  height: 18,
  weight: 1600,
} as unknown as PokemonDetails;

//what the phone breakpoint query answers. jsdom has no matchMedia, so the
//test decides, the way a real window width would
function setStacked(stacked: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: stacked,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PokemonReadout", () => {
  //D57, desktop: everything at once, no tabs
  it("shows all four sections at once on wide screens, with headings", () => {
    setStacked(false);
    render(<PokemonReadout pokemon={pokemon} />);

    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings).toEqual([
      "Base stats",
      "Profile",
      "Evolution",
      "Type matchups",
    ]);
    expect(screen.getByText("stats here")).toBeInTheDocument();
    expect(screen.getByText("matchups here")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("makes each section a region named by its heading", () => {
    setStacked(false);
    render(<PokemonReadout pokemon={pokemon} />);

    expect(
      screen.getByRole("region", { name: "Type matchups" }),
    ).toBeInTheDocument();
  });

  //D57, phones: one panel at a time behind real tabs
  it("organises the sections into four tabs on phones", async () => {
    setStacked(true);
    const user = userEvent.setup();
    render(<PokemonReadout pokemon={pokemon} />);

    const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(tabs).toEqual(["Stats", "Profile", "Evolution", "Matchups"]);
    expect(screen.getByRole("tab", { name: "Stats" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tablist")).toHaveAccessibleName("Pokémon details");

    await user.click(screen.getByRole("tab", { name: "Matchups" }));
    expect(screen.getByRole("tab", { name: "Matchups" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("has no section headings on phones (the tabs name the panels)", () => {
    setStacked(true);
    render(<PokemonReadout pokemon={pokemon} />);

    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });
});
