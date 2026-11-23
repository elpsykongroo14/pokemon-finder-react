import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompareView } from "./CompareView";
import type { PokemonDetails } from "../lib/type";
import { PreferencesProvider } from "../context/PreferencesContext";

//the pickers are SearchBars, which load the whole Pokédex index on mount.
//SearchBar has its own tests; here a stand-in reports which picker was
//used and what was "picked"
vi.mock("./SearchBar", () => ({
  SearchBar: ({
    onSubmit,
    inputLabel,
  }: {
    onSubmit: (query: string) => void;
    inputLabel?: string;
  }) => (
    <button type="button" onClick={() => onSubmit("zoroark")}>
      pick {inputLabel}
    </button>
  ),
}));

function makePokemon(overrides: Partial<PokemonDetails> = {}): PokemonDetails {
  return {
    name: "charizard",
    id: 6,
    height: 17,
    weight: 905,
    types: [{ slot: 1, type: { name: "fire", url: "" } }],
    sprites: { front_default: "charizard.png" },
    abilities: [],
    stats: [{ base_stat: 78, effort: 0, stat: { name: "hp", url: "" } }],
    species: { name: "charizard", url: "" },
    ...overrides,
  };
}

const onPick = vi.fn();
const onSwap = vi.fn();

function view(
  primary: PokemonDetails,
  secondary: PokemonDetails,
  pending = false,
) {
  return (
    <PreferencesProvider>
      <CompareView
        primary={primary}
        secondary={secondary}
        pending={pending}
        onPick={onPick}
        onSwap={onSwap}
      />
    </PreferencesProvider>
  );
}

//the sprites now follow the user's sprite/animation preferences,
//so CompareView needs a PreferencesProvider above it (the guard-clause hook throws without one)
function renderView(
  primary: PokemonDetails,
  secondary: PokemonDetails,
  pending = false,
) {
  return render(view(primary, secondary, pending));
}

const charizard = makePokemon();
const blastoise = makePokemon({
  name: "blastoise",
  id: 9,
  types: [{ slot: 1, type: { name: "water", url: "" } }],
  sprites: { front_default: "blastoise.png" },
  stats: [{ base_stat: 79, effort: 0, stat: { name: "hp", url: "" } }],
});

beforeEach(() => {
  localStorage.clear();
  onPick.mockClear();
  onSwap.mockClear();
});

describe("CompareView", () => {
  it("labels the section with both pokemon's names", () => {
    renderView(charizard, blastoise);

    expect(
      screen.getByRole("region", { name: "Comparing charizard and blastoise" }),
    ).toBeInTheDocument();
  });

  it("renders each pokemon's name as a heading", () => {
    renderView(charizard, blastoise);

    expect(
      screen.getByRole("heading", { name: "charizard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "blastoise" }),
    ).toBeInTheDocument();
  });

  it("routes each pokemon's sprite and types its own column", () => {
    renderView(charizard, blastoise);

    expect(screen.getByRole("img", { name: "charizard" })).toHaveAttribute(
      "src",
      "charizard.png",
    );
    expect(screen.getByRole("img", { name: "blastoise" })).toHaveAttribute(
      "src",
      "blastoise.png",
    );

    expect(screen.getByText("fire")).toBeInTheDocument();
    expect(screen.getByText("water")).toBeInTheDocument();
  });

  //the total row repeats single-stat totals, so look inside the HP row
  it("passes both stat sets through the stats chart", () => {
    renderView(charizard, blastoise);

    const hp = screen.getByText("HP").closest(".compare-stat-row");
    expect(hp).not.toBeNull();
    expect(within(hp as HTMLElement).getByText("78")).toBeInTheDocument();
    expect(within(hp as HTMLElement).getByText("79")).toBeInTheDocument();
  });

  it("shows each Pokémon's dex number", () => {
    renderView(charizard, blastoise);

    expect(screen.getByText("No. 006")).toBeInTheDocument();
    expect(screen.getByText("No. 009")).toBeInTheDocument();
  });

  it("puts the stat duel under its own 'Base stats' heading", () => {
    renderView(charizard, blastoise);

    expect(
      screen.getByRole("region", { name: "Base stats" }),
    ).toBeInTheDocument();
  });

  //spec 7.3: the verdict under the duel, in a polite live region, so a
  //new pairing is read out once it lands
  it("says who has the higher base stat total, and by how much", () => {
    renderView(charizard, blastoise);

    const verdict = screen.getByText(
      "Blastoise has the higher base stat total, by 1.",
    );
    expect(verdict.closest("[aria-live]")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  describe("identity band", () => {
    it("swaps the sides with the Swap button", async () => {
      const user = userEvent.setup();
      renderView(charizard, blastoise);

      await user.click(screen.getByRole("button", { name: "Swap sides" }));

      expect(onSwap).toHaveBeenCalledTimes(1);
    });

    it("has a First picker on the left and a Second picker on the right", async () => {
      const user = userEvent.setup();
      renderView(charizard, blastoise);

      await user.click(screen.getByRole("button", { name: "pick First" }));
      expect(onPick).toHaveBeenLastCalledWith("a", "zoroark");

      await user.click(screen.getByRole("button", { name: "pick Second" }));
      expect(onPick).toHaveBeenLastCalledWith("b", "zoroark");
    });
  });

  //while the next comparison loads, the old one stays up; say it is busy
  it("marks itself busy while the next comparison loads", () => {
    renderView(charizard, blastoise, true);

    expect(
      screen.getByRole("region", { name: "Comparing charizard and blastoise" }),
    ).toHaveAttribute("aria-busy", "true");
  });

  describe("versus field", () => {
    it("re skins each half with its own pokemon's types", () => {
      const primary = makePokemon({
        types: [
          { slot: 1, type: { name: "fire", url: "" } },
          { slot: 2, type: { name: "flying", url: "" } },
        ],
      });

      const { container } = renderView(primary, blastoise);

      const left = container.querySelector('[data-side="left"]');
      const right = container.querySelector('[data-side="right"]');
      expect(left).toHaveAttribute("data-type", "fire");
      expect(left).toHaveAttribute("data-type2", "flying");
      expect(right).toHaveAttribute("data-type", "water");
      expect(right).not.toHaveAttribute("data-type2");
    });

    it("puts the first pokemon on the left half and the second on the right", () => {
      const { container } = renderView(charizard, blastoise);
      expect(
        container.querySelector('[data-side="left"] h3'),
      ).toHaveTextContent("charizard");
      expect(
        container.querySelector('[data-side="right"] h3'),
      ).toHaveTextContent("blastoise");
    });

    it("leaves a half unthemed instea of crashing when a pokemon has no types", () => {
      const { container } = renderView(makePokemon({ types: [] }), blastoise);

      expect(container.querySelector('[data-side="left"]')).not.toHaveAttribute(
        "data-type",
      );
    });

    it("hides the decorative VS from assistive tech", () => {
      renderView(charizard, blastoise);

      expect(screen.getByText("VS")).toHaveAttribute("aria-hidden", "true");
    });

    //spec 6.1 / 6.2: a new pairing plays the entrance again (a new keyed
    //layer: slide-in, VS slam, wipe) while the two halves stay, so their
    //skies change color under the slab (D43)
    it("plays the entrance again for a new pairing, inside the same halves", () => {
      const { container, rerender } = renderView(charizard, blastoise);
      const half = container.querySelector(".versus-half");
      const layer = container.querySelector(".versus-encounter");

      const venusaur = makePokemon({ name: "venusaur", id: 3 });
      rerender(view(charizard, venusaur));

      expect(container.querySelector(".versus-half")).toBe(half);
      expect(container.querySelector(".versus-encounter")).not.toBe(layer);
    });
  });
});
