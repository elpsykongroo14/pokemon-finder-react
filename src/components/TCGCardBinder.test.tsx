import { describe, it, expect, vi, afterEach } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TCGCardBinder } from "./TCGCardBinder";
import type { TCGCard } from "../lib/type";
import { BINDER_PAGES_LABEL, CARDS_LOADING_LABEL } from "../lib/copy";
import { PreferencesProvider } from "../context/PreferencesContext";

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
  //the provider: the error and empty sentences sit in the battle dialog,
  //which reads the animation preference (B&W-8)
  return render(
    <PreferencesProvider>
      <TCGCardBinder {...props} />
    </PreferencesProvider>,
  );
}

//the card buttons only (not Previous / Next)
function shownCards() {
  return screen.getAllByRole("button", { name: /^Card \d+/ });
}

//jsdom has no matchMedia, which the binder reads as "wide screen"; a phone
//is a matchMedia that answers yes to the stacked query
function pretendPhone() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

afterEach(() => {
  Reflect.deleteProperty(window, "matchMedia");
});

//B&W-7, D54: on a wide screen the binder opens two pages at a time
describe("TCGCardBinder, two pages at a time", () => {
  it("shows the first 18 of 19 cards on pages 1 and 2", () => {
    renderBinder();

    expect(shownCards()).toHaveLength(18);
    expect(
      screen.queryByRole("button", { name: /^Card 19/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Pages 1 and 2 of 3")).toBeInTheDocument();
  });

  //?page=2 from an old link opens the spread that holds page 2
  it("opens the spread that holds an even page", () => {
    renderBinder({ page: 2 });

    expect(screen.getByText("Pages 1 and 2 of 3")).toBeInTheDocument();
  });

  it("ends with the last page and a closing line instead of empty pockets", () => {
    renderBinder({ page: 3 });

    expect(shownCards()).toHaveLength(1);
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByText("That's all 19 cards.")).toBeInTheDocument();
  });

  it("turns a whole spread at a time", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    renderBinder({ page: 1, onPageChange: handlePageChange });

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(handlePageChange).toHaveBeenLastCalledWith(3);
  });

  it("disables Previous on the first spread and Next on the last", () => {
    const first = renderBinder({ page: 1 });
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    first.unmount();

    renderBinder({ page: 3 });
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  //the page-turn motion plays on Previous / Next only, never on load
  //and only on the spread it turned to: a page change that came another
  //way (the Back button, a new search) must not replay an old turn
  it("remembers which way the page was turned, for the spread it led to", async () => {
    const user = userEvent.setup();
    const props = {
      cards: makeCards(30),
      status: "success" as const,
      error: null,
      emptyMessage: "No cards",
      onPageChange: () => {},
      onSelect: () => {},
    };
    const view = render(<TCGCardBinder {...props} page={1} />);
    const binder = view.container.querySelector(".binder") as HTMLElement;
    expect(binder).not.toHaveAttribute("data-turn");

    await user.click(screen.getByRole("button", { name: "Next" }));
    view.rerender(<TCGCardBinder {...props} page={3} />);
    expect(binder).toHaveAttribute("data-turn", "next");

    //Back in the browser, to pages 1 and 2: no turn plays
    view.rerender(<TCGCardBinder {...props} page={1} />);
    expect(binder).not.toHaveAttribute("data-turn");
  });

  it("draws the rings of the spine, for the eye only", () => {
    const { container } = renderBinder();

    expect(container.querySelector(".binder__spine")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});

//D55: on a phone the binder shows one page at a time, so ?view=binder
//never lies. these are the page-at-a-time tests from before B&W-7
describe("TCGCardBinder on a phone, one page at a time", () => {
  it("shows the first nine of 19 cards, and says which page it is", () => {
    pretendPhone();
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

  it("shows the short last page with the remaining card, and no closing page", () => {
    pretendPhone();
    renderBinder({ page: 3 });

    expect(shownCards()).toHaveLength(1);
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.queryByText("That's all 19 cards.")).not.toBeInTheDocument();
  });

  it("asks for the next and previous page when the controls are used", async () => {
    pretendPhone();
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
    pretendPhone();
    const user = userEvent.setup();
    const handlePageChange = vi.fn();
    renderBinder({ page: 999, onPageChange: handlePageChange });

    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    //Previous goes to 2 (from the shown page 3), not to 998
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});

describe("TCGCardBinder", () => {
  //B&W-8: Next on the last-but-one spread disables itself, and a disabled
  //button drops keyboard focus to the top of the page. focus moves to the
  //way back instead, so the keyboard stays in the binder
  it("keeps focus in the binder when a turn reaches the last spread", async () => {
    const user = userEvent.setup();
    function Stateful() {
      const [page, setPage] = useState(1);
      return (
        <PreferencesProvider>
          <TCGCardBinder
            cards={makeCards(40)}
            status="success"
            error={null}
            emptyMessage="No cards"
            page={page}
            onPageChange={setPage}
            onSelect={() => {}}
          />
        </PreferencesProvider>
      );
    }
    //40 cards: five pages, three spreads. two turns reach the last one
    render(<Stateful />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toHaveFocus();
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
    expect(screen.getByText("Pages 1 and 2 of 3")).toHaveAttribute(
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
    //changed in B&W-8: the sentence sits in the battle dialog now (spec
    //7.6), which needs the preferences (it types) and speaks through a live
    //region, so it is found by its role instead of a bare paragraph
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    failed.unmount();

    renderBinder({ status: "empty", emptyMessage: "Nothing here", cards: [] });
    expect(screen.getByRole("status")).toHaveTextContent("Nothing here");
  });
});
