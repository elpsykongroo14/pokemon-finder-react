import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryToolbar } from "./LibraryToolbar";
import type { TCGCard } from "../lib/type";

const CARDS: TCGCard[] = [
  { id: "1", name: "A", rarity: "Ultra Rare" },
  { id: "2", name: "B", rarity: "Rare Holo" },
  { id: "3", name: "C", rarity: "Rare Holo" },
  { id: "4", name: "D", rarity: "Rare" },
];

type Props = Parameters<typeof LibraryToolbar>[0];

function renderToolbar(overrides: Partial<Props> = {}) {
  const props: Props = {
    cards: CARDS,
    status: "success",
    view: "grid",
    onViewChange: () => {},
    sortMode: "newest",
    onSortChange: () => {},
    ...overrides,
  };
  return render(<LibraryToolbar {...props} />);
}

//the sticky toolbar (spec 7.4): the count, the rarity legend, the view
//switch and the sort
describe("LibraryToolbar", () => {
  //a live region: a new search or a reload changes the count, and that
  //change is announced
  it("counts the cards, politely announcing a change", () => {
    renderToolbar();

    const count = screen.getByText("4 cards");
    expect(count).toHaveAttribute("aria-live", "polite");
  });

  it("says nothing about the count while the cards load", () => {
    renderToolbar({ cards: [], status: "loading" });

    expect(screen.queryByText("0 cards")).not.toBeInTheDocument();
  });

  it("lists how many cards there are in each tier", () => {
    renderToolbar();

    const legend = screen.getByRole("list", { name: "Cards by rarity" });
    expect(
      within(legend)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Ultra rare and up 1", "Holo 2", "Rare 1", "Common 0"]);
  });

  it("switches the view with the named view group", async () => {
    const user = userEvent.setup();
    const handleView = vi.fn();
    renderToolbar({ onViewChange: handleView });

    expect(
      screen.getByRole("group", { name: "Library view" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "Binder" }));
    expect(handleView).toHaveBeenCalledWith("binder");
  });

  it("sorts with a labelled select offering the spec's three orders", async () => {
    const user = userEvent.setup();
    const handleSort = vi.fn();
    renderToolbar({ onSortChange: handleSort });

    const sort = screen.getByLabelText("Sort");
    expect(
      within(sort)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual(["Newest first", "Oldest first", "Rarest first"]);

    await user.selectOptions(sort, "rarity");
    expect(handleSort).toHaveBeenCalledWith("rarity");
  });
});
