import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TCGCardTable } from "./TCGCardTable";
import type { TCGCard } from "../lib/type";
import { CARDS_LOADING_LABEL } from "../lib/copy";

const CARDS: TCGCard[] = [
  {
    id: "1",
    name: "Charizard",
    rarity: "Rare Holo",
    set: { name: "Base Set", releaseDate: "1999/01/09" },
  },
  {
    id: "2",
    name: "Abra",
    rarity: "Common",
    set: { name: "Jungle", releaseDate: "1999/06/16" },
  },
  {
    id: "3",
    name: "Blastoise",
    rarity: "Rare",
    set: { name: "Aquapolis", releaseDate: "2003/01/15" },
  },
];

function renderTable(
  overrides: Partial<Parameters<typeof TCGCardTable>[0]> = {},
) {
  const props = {
    cards: CARDS,
    status: "success" as const,
    error: null,
    emptyMessage: "No cards",
    caption: "Featured Cards",
    onSelect: () => {},
    ...overrides,
  };
  return render(<TCGCardTable {...props} />);
}

//the card names in the order the rows are currently shown
function shownNames(): (string | null)[] {
  return screen.getAllByRole("rowheader").map((cell) => cell.textContent);
}

describe("TCGCardTable", () => {
  it("is a real table, named by its caption, with a header and one row per card", () => {
    renderTable();

    expect(
      screen.getByRole("table", { name: "Featured Cards" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    //one header row plus one row per card
    expect(screen.getAllByRole("row")).toHaveLength(CARDS.length + 1);
    expect(shownNames()).toEqual(["Charizard", "Abra", "Blastoise"]);
  });

  it("shows set, rarity and release date, with fallbacks for missing values", () => {
    renderTable({ cards: [{ id: "9", name: "Mystery" }] });

    expect(screen.getByText("Unknown set")).toBeInTheDocument();
    expect(screen.getByText("unknown")).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("starts unsorted: no column announces a direction, rows keep their order", () => {
    renderTable();

    for (const header of screen.getAllByRole("columnheader")) {
      expect(header).toHaveAttribute("aria-sort", "none");
    }
    expect(shownNames()).toEqual(["Charizard", "Abra", "Blastoise"]);
  });

  it("cycles a column ascending, descending, then back to the original order", async () => {
    const user = userEvent.setup();
    renderTable();
    const nameButton = screen.getByRole("button", { name: "Name" });
    const nameHeader = screen.getByRole("columnheader", { name: "Name" });

    await user.click(nameButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(shownNames()).toEqual(["Abra", "Blastoise", "Charizard"]);

    await user.click(nameButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(shownNames()).toEqual(["Charizard", "Blastoise", "Abra"]);

    await user.click(nameButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    expect(shownNames()).toEqual(["Charizard", "Abra", "Blastoise"]);
  });

  it("only one column is sorted at a time", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: "Name" }));
    await user.click(screen.getByRole("button", { name: "Set" }));

    expect(screen.getByRole("columnheader", { name: "Set" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it("sorts the Rarity column by rank, not alphabetically", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: "Rarity" }));

    //Common < Rare < Rare Holo
    expect(shownNames()).toEqual(["Abra", "Blastoise", "Charizard"]);
  });

  it("opens a card with a real button, by click and by keyboard", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    renderTable({ onSelect: handleSelect });

    await user.click(screen.getByRole("button", { name: "Abra" }));
    expect(handleSelect).toHaveBeenCalledWith(CARDS[1]);

    screen.getByRole("button", { name: "Blastoise" }).focus();
    await user.keyboard("{Enter}");
    expect(handleSelect).toHaveBeenLastCalledWith(CARDS[2]);
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it("tags each row with its rarity tier", () => {
    renderTable();

    expect(screen.getByRole("row", { name: /Charizard/ })).toHaveAttribute(
      "data-rarity",
      "holo",
    );
    expect(screen.getByRole("row", { name: /Abra/ })).toHaveAttribute(
      "data-rarity",
      "common",
    );
  });

  it("shows one loading status and no table while loading", () => {
    renderTable({ status: "loading", cards: [] });

    expect(
      screen.getByRole("status", { name: CARDS_LOADING_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows the error text, or the empty message, instead of a table", () => {
    const { unmount } = renderTable({
      status: "error",
      error: "Could not load cards",
      cards: [],
    });
    expect(screen.getByText("Could not load cards")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    unmount();

    renderTable({ status: "empty", cards: [], emptyMessage: "Nothing here" });
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
