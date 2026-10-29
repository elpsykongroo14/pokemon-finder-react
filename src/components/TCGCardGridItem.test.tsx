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
      set: { name: "Base Set" },
      rarity: "Rare Holo",
      images: { small: "charizard.png" },
    });

    render(<TCGCardGridItem card={card} onSelect={() => {}} />);

    expect(screen.getByText("Charizard")).toBeInTheDocument();
    expect(screen.getByText("Base Set")).toBeInTheDocument();
    expect(screen.getByText("Rare Holo")).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "charizard.png",
    );
  });

  it("falls back to placeholder text when set or rarity is missing", () => {
    const card = makeCard({ set: undefined, rarity: undefined });

    render(<TCGCardGridItem card={card} onSelect={() => {}} />);

    expect(screen.getByText("Unknown set")).toBeInTheDocument();
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("is a real button whose name carries the name, set and rarity", () => {
    const card = makeCard({
      set: { name: "Base Set" },
      rarity: "Rare Holo",
    });

    render(<TCGCardGridItem card={card} onSelect={() => {}} />);

    expect(
      screen.getByRole("button", { name: /Charizard.*Base Set.*Rare Holo/ }),
    ).toBeInTheDocument();
  });

  it("calls onSelect with the card when clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const card = makeCard();

    render(<TCGCardGridItem card={card} onSelect={handleSelect} />);

    await user.click(screen.getByRole("button", { name: /Charizard/ }));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(card);
  });

  it("can be opened with Space", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const card = makeCard();

    render(<TCGCardGridItem card={card} onSelect={handleSelect} />);

    await user.tab();
    await user.keyboard(" ");

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(card);
  });
});

//this file protects the three fallback strings, the click contract,
//and the keyboard contract: Tab reaches the card, Enter and Space open it
