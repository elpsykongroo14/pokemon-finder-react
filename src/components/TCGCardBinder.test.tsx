import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TCGCardBinder } from "./TCGCardBinder";
import type { TCGCard } from "../lib/type";
import { BINDER_PAGES_LABEL, CARDS_LOADING_LABEL } from "../lib/copy";

//n cards named "Card 1" ... "Card n"
function makeCards(n: number): TCGCard[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `c${i + 1}`,
    name: `Card ${i + 1}`,
  }));
}

function renderBinder(
  overrides: Partial<Parameters<typeof TCGCardBinder>[0]> = {},
) {
  const props = {
    cards: makeCards(19),
    status: "success" as const,
    error: null,
    emptyMessage: "No cards",
    page: 1,
    onPageChange: () => {},
    onSelect: () => {},
    ...overrides,
  };
  return render(<TCGCardBinder {...props} />);
}

//the card buttons only (not Previous / next)
function shownCards() {
  return screen.getAllByRole("button", { name: /^Card \d+/ });
}

describe("TCGCardBinder", () => {
  it("shows the first nine of 19 cards, and says which page it is", () => {
    renderBinder();

    expect(shownCards()).toHaveLength(9);
    expect(
      screen.getByRole("button", { name: /^Card 1(?!\d)/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Card 10/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("shows the short last page with the remaining card", () => {
    renderBinder({ page: 3 });

    expect(shownCards()).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: /^Card 19/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last", () => {
    const first = renderBinder({ page: 1 });
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    first.unmount();

    renderBinder({ page: 3 });
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("asks for the next and previous page when the controls are used", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    renderBinder({ page: 2, onPageChange: handlePageChange });

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(handlePageChange).toHaveBeenLastCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(handlePageChange).toHaveBeenLastCalledWith(1);
    expect(handlePageChange).toHaveBeenCalledTimes(2);
  });

  it("clamps a page past the end, and steps back from the page really shown", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    renderBinder({ page: 999, onPageChange: handlePageChange });

    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    //Previous goes to 2 (from the shown page 3), not to 998
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("opens a card when it is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const cards = makeCards(19);
    renderBinder({ cards, onSelect: handleSelect });

    await user.click(screen.getByRole("button", { name: /^Card 2(?!\d)/ }));

    expect(handleSelect).toHaveBeenCalledWith(cards[1]);
  });

  it("names the page controls for a screen reader and announces page changes politely", () => {
    renderBinder();

    expect(
      screen.getByRole("navigation", { name: BINDER_PAGES_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("shows one loading status and no page controls while loading", () => {
    renderBinder({ status: "loading", cards: [] });

    expect(
      screen.getByRole("status", { name: CARDS_LOADING_LABEL }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("shows the error or empty sentence instead of a binder", () => {
    const failed = renderBinder({
      status: "error",
      error: "Could not load",
      cards: [],
    });
    expect(screen.getByText("Could not load")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    failed.unmount();

    renderBinder({ status: "empty", emptyMessage: "Nothing here", cards: [] });
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
