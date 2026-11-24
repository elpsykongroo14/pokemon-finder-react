import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TierMark, TierSwatch } from "./TierMark";

//spec 7.4: one mark in four strengths, used by the tile, the table, the
//dialog and the legend. its text is the card's real rarity string; the
//tier only decides how strong the mark looks
describe("TierMark", () => {
  it("shows the card's own rarity and carries its tier for the CSS", () => {
    render(<TierMark rarity="Special Illustration Rare" />);

    const mark = screen.getByText("Special Illustration Rare");
    expect(mark.closest(".tier-mark")).toHaveAttribute("data-rarity", "ultra");
  });

  it.each([
    ["Common", "common"],
    ["Rare", "rare"],
    ["Rare Holo", "holo"],
    ["Secret Rare", "ultra"],
  ])("puts %s in the %s tier", (rarity, tier) => {
    const { container } = render(<TierMark rarity={rarity} />);
    expect(container.querySelector(".tier-mark")).toHaveAttribute(
      "data-rarity",
      tier,
    );
  });

  //the star is decoration on the two shiny tiers; the words say it all
  it("adds a hidden star to holo and ultra marks only", () => {
    const { container, rerender } = render(<TierMark rarity="Rare Holo" />);
    const star = container.querySelector(".tier-mark svg");
    expect(star).toBeInTheDocument();
    expect(star).toHaveAttribute("aria-hidden", "true");

    rerender(<TierMark rarity="Rare" />);
    expect(container.querySelector(".tier-mark svg")).toBeNull();
  });

  //kept from the old grid tile: a card with no rarity still says something
  it("says unknown for a card with no rarity, in the common tier", () => {
    const { container } = render(<TierMark rarity={undefined} />);

    expect(screen.getByText("unknown")).toBeInTheDocument();
    expect(container.querySelector(".tier-mark")).toHaveAttribute(
      "data-rarity",
      "common",
    );
  });
});

describe("TierSwatch", () => {
  it("is a small square in the tier's look, hidden from screen readers", () => {
    const { container } = render(<TierSwatch tier="holo" />);

    const swatch = container.querySelector(".tier-swatch");
    expect(swatch).toHaveAttribute("data-rarity", "holo");
    expect(swatch).toHaveAttribute("aria-hidden", "true");
  });
});
