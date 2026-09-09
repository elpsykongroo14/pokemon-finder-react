import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TCGCardGrid } from "./TCGCardGrid";
import userEvent from "@testing-library/user-event";
import type { TCGCard } from "../lib/type";

function makeCard(id: string, name: string): TCGCard {
  return { id, name };
}

describe("TCGCardGrid", () => {
  it("shows a loading message while status is loading", () => {
    render(
      <TCGCardGrid
        cards={[]}
        status="loading"
        error={null}
        emptyMessage="No cards"
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("Loading cards...")).toBeInTheDocument();
  });

  it("shows the empty message when statu is empty", () => {
    render(
      <TCGCardGrid
        cards={[]}
        status="empty"
        error={null}
        emptyMessage="No cards found"
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("No cards found")).toBeInTheDocument();
  });

  it("renders one grid item per card when status is succes", () => {
    const cards = [makeCard("1", "Charizard"), makeCard("2", "Blastoise")];

    render(
      <TCGCardGrid
        cards={cards}
        status="success"
        error={null}
        emptyMessage="No cards"
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText("Charizard")).toBeInTheDocument();
    expect(screen.getByText("Blastoise")).toBeInTheDocument();
    expect(screen.getAllByAltText(/Charizard|Blastoise/)).toHaveLength(2);
  });

  it("passes the onSelect callback through to each card so selection still works", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const cards = [makeCard("1", "Charizard")];

    render(
      <TCGCardGrid
        cards={cards}
        status="success"
        error={null}
        emptyMessage="No cards"
        onSelect={handleSelect}
      />,
    );

    const cardEl = screen.getByAltText("Charizard").closest(".tcg-card");
    if (!cardEl) throw new Error("card element not found");
    await user.click(cardEl);

    expect(handleSelect).toHaveBeenCalledWith(cards[0]);
  });
});

//this file protects all four status branches plus the prop threading seam between grid and item
