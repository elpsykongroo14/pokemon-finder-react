import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { LibraryHero } from "./LibraryHero";
import type { PokemonDetails, TCGCard } from "../lib/type";

vi.mock("./SearchBar", () => ({
  SearchBar: ({
    onSubmit,
    inputLabel,
  }: {
    onSubmit: (query: string) => void;
    inputLabel: string;
  }) => (
    <button onClick={() => onSubmit("zoroark")}>{`fake-${inputLabel}`}</button>
  ),
}));

const HYDREIGON = {
  name: "hydreigon",
  id: 635,
  types: [
    { slot: 1, type: { name: "dark", url: "" } },
    { slot: 2, type: { name: "dragon", url: "" } },
  ],
} as PokemonDetails;

const CARDS: TCGCard[] = [
  {
    id: "common",
    name: "Hydreigon",
    rarity: "Common",
    set: {
      name: "30th Celebration",
      series: "Mega Evolution",
      releaseDate: "2026/09/16",
    },
  },
  {
    id: "sir",
    name: "Hydreigon ex",
    rarity: "Special Illustration Rare",
    set: {
      name: "Surging Sparks",
      series: "Scarlet & Violet",
      releaseDate: "2024/11/08",
    },
  },
  {
    id: "holo",
    name: "Hydreigon",
    rarity: "Rare Holo",
    set: {
      name: "Noble Victories",
      series: "Black & White",
      releaseDate: "2011/11/16",
    },
  },
  {
    id: "rare",
    name: "Hydreigon",
    rarity: "Rare",
    set: {
      name: "Dragons Exalted",
      series: "Black & White",
      releaseDate: "2012/08/15",
    },
  },
];

type Props = Parameters<typeof LibraryHero>[0];

function renderHero(overrides: Partial<Props> = {}) {
  const props: Props = {
    name: "hydreigon",
    pokemon: HYDREIGON,
    cards: CARDS,
    status: "success",
    featuredHref: "/library?view=table",
    onSearch: () => {},
    onSelect: () => {},
    onOpenBinder: () => {},
    ...overrides,
  };
  return render(
    <MemoryRouter>
      <LibraryHero {...props} />
    </MemoryRouter>,
  );
}

//the Library's hero (spec 7.4): the hand of three on the field, and the
//black plate with the title, the lead, a search and two buttons
describe("LibraryHero", () => {
  it("names the page after the Pokémon, with its dex number", () => {
    renderHero();

    expect(
      screen.getByRole("heading", { level: 2, name: "Hydreigon cards" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No. 635")).toBeInTheDocument();
  });

  it("writes the lead sentence from the cards", () => {
    renderHero();

    expect(
      screen.getByText(
        "4 cards printed between 2011 and 2026, from Black & White to Mega Evolution.",
      ),
    ).toBeInTheDocument();
  });

  //the field and the hand wear the searched Pokémon's colors
  it("themes itself by the Pokémon's types", () => {
    const { container } = renderHero();

    const hero = container.querySelector(".library-hero");
    expect(hero).toHaveAttribute("data-type", "dark");
    expect(hero).toHaveAttribute("data-type2", "dragon");
  });

  //the featured state: the same layout, Graphite, the existing copy
  it("is the TCG Library, in Graphite, without a Pokémon", () => {
    const { container } = renderHero({ name: undefined, pokemon: null });

    expect(
      screen.getByRole("heading", { level: 2, name: "TCG Library" }),
    ).toBeInTheDocument();
    expect(container.querySelector(".library-hero")).not.toHaveAttribute(
      "data-type",
    );
    expect(screen.queryByText(/^No\. /)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /entry/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Featured/ })).toBeNull();
  });

  it("holds the three rarest cards, the rarest first, each a button that opens it", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    renderHero({ onSelect: handleSelect });

    const hand = screen.getByRole("list", {
      name: "Three of the rarest cards",
    });
    const buttons = within(hand).getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Hydreigon ex, Surging Sparks, Special Illustration Rare",
      "Hydreigon, Noble Victories, Rare Holo",
      "Hydreigon, Dragons Exalted, Rare",
    ]);

    await user.click(buttons[0]!);
    expect(handleSelect).toHaveBeenCalledWith(CARDS[1]);
  });

  it("deals no hand while the cards load", () => {
    renderHero({ cards: [], status: "loading" });

    expect(
      screen.queryByRole("list", { name: "Three of the rarest cards" }),
    ).not.toBeInTheDocument();
  });

  it("searches for another Pokémon's cards", async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn();
    renderHero({ onSearch: handleSearch });

    await user.click(
      screen.getByRole("button", {
        name: "fake-Find another Pokémon's cards",
      }),
    );
    expect(handleSearch).toHaveBeenCalledWith("zoroark");
  });

  it("opens the binder, links to the entry, and leads back to the featured cards", async () => {
    const user = userEvent.setup();
    const handleOpenBinder = vi.fn();
    renderHero({ onOpenBinder: handleOpenBinder });

    await user.click(screen.getByRole("button", { name: "Open the binder" }));
    expect(handleOpenBinder).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole("link", { name: "Hydreigon's entry" }),
    ).toHaveAttribute("href", "/pokemon/hydreigon");
    expect(screen.getByRole("link", { name: /Featured/ })).toHaveAttribute(
      "href",
      "/library?view=table",
    );
  });
});
