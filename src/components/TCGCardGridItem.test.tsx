import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TCGCardGridItem } from "./TCGCardGridItem";
import type { TCGCard } from "../lib/type";

function makeCard(overrides: Partial<TCGCard> = {}): TCGCard {
  return { id: "base1-4", name: "Charizard", ...overrides };
}

describe("TCGCardGridItem", () => {
  it("renders the card's name, image, set, and rarity", () => {
    const card = makeCard({
      set: { id: "base1", name: "Base Set" },
      rarity: "Rare Holo",
      images: { small: "charizard.png" },
    });

    render(<TCGCardGridItem card={card} onSelect={() => {}} />);

    expect(screen.getByAltText("Charizard")).toHaveAttribute(
      "src",
      "charizard.png",
    );
    expect(screen.getByText("Base Set")).toBeInTheDocument();
    expect(screen.getByText("Rare Holo")).toBeInTheDocument();
  });

  it("falls back to placeholder text when set or rarity is missing", () => {
    const card = makeCard({ set: undefined, rarity: undefined });

    return <TCGCardGridItem card={card} onSelect={() => {}} />;

    expect(screen.getByText("Unknow set")).toBeInTheDocument();
    expect(screen.getByText("unkown")).toBeInTheDocument();
  });

  it("calls onSelect with the card when clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const card = makeCard();

    render(<TCGCardGridItem card={card} onSelect={handleSelect} />);

    const cardEl = screen.getByAltText("Charizard").closest(".tcg-card");
    if (!cardEl) throw new Error("card element not found");
    await user.click(cardEl);

    expect(handleSelect).toHaveBeenCalledWith(card);
  });
});

//this test protects the three fallback strings and the click contract
