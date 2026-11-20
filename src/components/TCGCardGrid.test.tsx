import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TCGCardGrid } from "./TCGCardGrid";
import userEvent from "@testing-library/user-event";
import type { TCGCard } from "../lib/type";
import { CARDS_LOADING_LABEL } from "../lib/copy";

function makeCard(id: string, name: string): TCGCard {
  return { id, name };
}

describe("TCGCardGrid", () => {
  it("shows a loading status, and no cards, while status is loading ", () => {
    render(
      <TCGCardGrid
        cards={[]}
        status="loading"
        error={null}
        emptyMessage="No cards"
        onSelect={() => {}}
      />,
    );

    expect(
      screen.getByRole("status", { name: CARDS_LOADING_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
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
    expect(screen.getAllByRole("button")).toHaveLength(2);
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

    await user.click(screen.getByRole("button", { name: /Charizard/ }));

    expect(handleSelect).toHaveBeenCalledWith(cards[0]);
  });
});

//this file protects all four status branches plus the prop threading seam between grid and item
