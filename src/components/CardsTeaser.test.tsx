import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CardsTeaser } from "./CardsTeaser";
import { useTCGLibrary } from "../hooks/useTCGLibrary";
import type { TCGCard } from "../lib/type";

vi.mock("../hooks/useTCGLibrary");

const CARDS: TCGCard[] = [
  {
    id: "1",
    name: "Hydreigon",
    rarity: "Rare Holo",
    set: { name: "Noble Victories", releaseDate: "2011/11/16" },
  },
  {
    id: "2",
    name: "Hydreigon ex",
    rarity: "Special Illustration Rare",
    set: { name: "Surging Sparks", releaseDate: "2024/11/08" },
  },
  {
    id: "3",
    name: "Hydreigon",
    rarity: "Common",
    set: { name: "30th Celebration", releaseDate: "2026/09/16" },
  },
];

function libraryState(
  overrides: Partial<ReturnType<typeof useTCGLibrary>> = {},
) {
  return {
    title: "hydreigon",
    cards: CARDS,
    status: "success" as const,
    error: null,
    sortMode: "newest" as const,
    setSortMode: vi.fn(),
    retry: vi.fn(),
    ...overrides,
  };
}

function renderTeaser() {
  return render(
    <MemoryRouter>
      <CardsTeaser name="hydreigon" />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(useTCGLibrary).mockReset();
});

//the Pokémon page's cards teaser (spec 7.2): only when the Pokémon has
//cards, fetched once it scrolls into view (jsdom has no observer, so here
//it is "in view" at once)
describe("CardsTeaser", () => {
  it("is a section headed Cards", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(libraryState());
    renderTeaser();

    expect(screen.getByRole("region", { name: "Cards" })).toBeInTheDocument();
  });

  it("tells the card history in one sentence", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(libraryState());
    renderTeaser();

    expect(
      screen.getByText(
        "Hydreigon has appeared on 3 cards since 2011, from Noble Victories to the 30th Celebration set. Browse them by era, by rarity, or flip through them in a binder.",
      ),
    ).toBeInTheDocument();
  });

  it("links to the Pokémon's cards in the Library", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(libraryState());
    renderTeaser();

    expect(
      screen.getByRole("link", { name: "See all 3 cards" }),
    ).toHaveAttribute("href", "/library/hydreigon");
  });

  //the fan repeats what the sentence says: for the eye only
  it("fans three cards, hidden from screen readers", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(libraryState());
    const { container } = renderTeaser();

    const fan = container.querySelector(".cards-teaser__fan");
    expect(fan).toHaveAttribute("aria-hidden", "true");
    expect(fan?.querySelectorAll(".holo-card")).toHaveLength(3);
  });

  it.each(["loading", "empty", "error"] as const)(
    "shows nothing while %s",
    (status) => {
      vi.mocked(useTCGLibrary).mockReturnValue(
        libraryState({ status, cards: [] }),
      );
      const { container } = renderTeaser();

      expect(container.querySelector(".cards-teaser")).toBeNull();
    },
  );

  it("asks the card hook for this Pokémon", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(libraryState());
    renderTeaser();

    expect(useTCGLibrary).toHaveBeenCalledWith("hydreigon");
  });
});
