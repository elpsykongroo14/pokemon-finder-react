import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { TCGCardGrid } from "./TCGCardGrid";
import userEvent from "@testing-library/user-event";
import type { TCGCard } from "../lib/type";
import { CARDS_LOADING_LABEL } from "../lib/copy";
import { PreferencesProvider } from "../context/PreferencesContext";

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
    //changed in B&W-8: the sentence sits in the battle dialog now (spec
    //7.6), which needs the preferences (it types) and speaks through a live
    //region, so it is found by its role instead of a bare paragraph
    render(
      <PreferencesProvider>
        <TCGCardGrid
          cards={[]}
          status="empty"
          error={null}
          emptyMessage="No cards found"
          onSelect={() => {}}
        />
      </PreferencesProvider>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("No cards found");
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

//B&W-7 (spec 7.4): the grid is a timeline, grouped by series with a date
//sort and by tier with the rarity sort; each group is headed by its name,
//its years and its count
describe("TCGCardGrid as a timeline", () => {
  const cards: TCGCard[] = [
    {
      id: "a",
      name: "Hydreigon",
      rarity: "Common",
      set: { series: "Mega Evolution", releaseDate: "2026/09/16" },
    },
    {
      id: "b",
      name: "Hydreigon ex",
      rarity: "Ultra Rare",
      set: { series: "Scarlet & Violet", releaseDate: "2025/07/18" },
    },
    {
      id: "c",
      name: "Hydreigon ex",
      rarity: "Double Rare",
      set: { series: "Scarlet & Violet", releaseDate: "2023/06/09" },
    },
  ];

  function renderGrid(sortMode: "newest" | "rarity") {
    return render(
      <TCGCardGrid
        cards={cards}
        status="success"
        error={null}
        emptyMessage="No cards"
        onSelect={() => {}}
        sortMode={sortMode}
      />,
    );
  }

  it("heads a group per series, in the order the cards come", () => {
    renderGrid("newest");

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Mega Evolution", "Scarlet & Violet"]);
  });

  it("names each group as a region, with its years and its count", () => {
    renderGrid("newest");

    const group = screen.getByRole("region", { name: "Scarlet & Violet" });
    expect(group).toHaveTextContent("2023 to 2025");
    expect(group).toHaveTextContent("2 cards");
    expect(within(group).getAllByRole("button")).toHaveLength(2);
  });

  it("groups by tier when sorted by rarity", () => {
    renderGrid("rarity");

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toEqual(["Ultra rare and up", "Holo", "Common"]);
  });

  //tile in plays when the page says the arrangement changed, not on load
  it("marks itself as entering only when asked", () => {
    const { container, rerender } = renderGrid("newest");
    expect(container.querySelector("[data-entering]")).toBeNull();

    rerender(
      <TCGCardGrid
        cards={cards}
        status="success"
        error={null}
        emptyMessage="No cards"
        onSelect={() => {}}
        entering
      />,
    );
    expect(container.querySelector("[data-entering]")).toBeInTheDocument();
  });
});

//this file protects all four status branches plus the prop threading seam between grid and item
