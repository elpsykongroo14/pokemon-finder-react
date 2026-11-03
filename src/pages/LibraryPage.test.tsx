import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LibraryPage } from "./LibraryPage";
import { useTCGLibrary } from "../hooks/useTCGLibrary";

vi.mock("../hooks/useTCGLibrary");

vi.mock("../components/SearchBar", () => ({
  SearchBar: ({ onSubmit }: { onSubmit: (query: string) => void }) => (
    <button onClick={() => onSubmit("charmander")}>fake-search-submit</button>
  ),
}));

vi.mock("../components/TCGCardBinder", () => ({
  TCGCardBinder: ({
    page,
    onPageChange,
  }: {
    page: number;
    onPageChange: (page: number) => void;
  }) => (
    <div data-testid="tcg-card-binder" data-page={page}>
      <button onClick={() => onPageChange(3)}>fake-go-to-page-3</button>
    </div>
  ),
}));

vi.mock("../components/TCGCardGrid", () => ({
  TCGCardGrid: ({
    status,
    emptyMessage,
    onSelect,
  }: {
    status: string;
    emptyMessage: string;
    onSelect: (card: { id: string; name: string }) => void;
  }) => (
    <div
      data-testid="tcg-card-grid"
      data-status={status}
      data-empty-message={emptyMessage}
    >
      <button onClick={() => onSelect({ id: "1", name: "Pikachu Card" })}>
        fake-select-card
      </button>
    </div>
  ),
}));

vi.mock("../components/TCGCardTable", () => ({
  TCGCardTable: ({ caption }: { caption: string }) => (
    <div data-testid="tcg-card-table" data-caption={caption} />
  ),
}));

vi.mock("../components/TCGCardModal", () => ({
  TCGCardModal: ({
    card,
    onClose,
  }: {
    card: { name: string };
    onClose: () => void;
  }) => (
    <div data-testid="tcg-card-modal">
      {card.name}
      <button onClick={onClose}>fake-close-modal</button>
    </div>
  ),
}));

function makeLibraryState(
  overrides: Partial<ReturnType<typeof useTCGLibrary>> = {},
) {
  return {
    title: "Featured Cards",
    cards: [],
    status: "success" as const,
    error: null,
    sortMode: "newest" as const,
    setSortMode: vi.fn(),
    ...overrides,
  };
}

function renderLibraryPage(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:name" element={<LibraryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LibraryPage", () => {
  it("renders the panel title and forwards status/emptyMessage to the grid", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(
      makeLibraryState({ title: "Featured Cards", status: "success" }),
    );

    renderLibraryPage("/library");

    expect(
      screen.getByRole("heading", { name: "TCG Library" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Featured Cards")).toBeInTheDocument();

    const grid = screen.getByTestId("tcg-card-grid");
    expect(grid).toHaveAttribute("data-status", "success");
    expect(grid).toHaveAttribute("data-empty-message", "No cards loaded.");
  });

  it("builds a name specific empty message for a search", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(
      makeLibraryState({ title: "pikachu", status: "empty" }),
    );

    renderLibraryPage("/library/pikachu");

    expect(screen.getByTestId("tcg-card-grid")).toHaveAttribute(
      "data-empty-message",
      'No TCG cards found for "pikachu".',
    );
  });

  it("navigates to a name search on submit", async () => {
    vi.mocked(useTCGLibrary).mockImplementation((name?: string) =>
      makeLibraryState({ title: name ?? "Featured Cards" }),
    );
    const user = userEvent.setup();

    renderLibraryPage("/library");
    await user.click(
      screen.getByRole("button", { name: "fake-search-submit" }),
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "charmander" }),
    ).toBeInTheDocument();
  });

  it("calls setSortMode when a different sort option is chose", async () => {
    const setSortMode = vi.fn();
    vi.mocked(useTCGLibrary).mockReturnValue(makeLibraryState({ setSortMode }));
    const user = userEvent.setup();

    renderLibraryPage("/library");
    await user.selectOptions(screen.getByLabelText("Sort cards"), "oldest");

    expect(setSortMode).toHaveBeenCalledWith("oldest");
  });

  it("shows the view toggle with Grid selected by default", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(makeLibraryState());

    renderLibraryPage("/library");

    expect(
      screen.getByRole("group", { name: "Library view" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
  });

  it("opens straight onto the view named in the URL", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(makeLibraryState());

    renderLibraryPage("/library?view=binder");

    expect(screen.getByRole("radio", { name: "Binder" })).toBeChecked();
  });

  it("switches view when a different option is chosen", async () => {
    vi.mocked(useTCGLibrary).mockReturnValue(makeLibraryState());
    const user = userEvent.setup();

    renderLibraryPage("/library");
    await user.click(screen.getByRole("radio", { name: "Table" }));

    expect(screen.getByRole("radio", { name: "Table" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Grid" })).not.toBeChecked();
  });

  it("keeps the chosen view when searching and when going back to Featured", async () => {
    vi.mocked(useTCGLibrary).mockImplementation((name?: string) =>
      makeLibraryState({ title: name ?? "Featured Cards" }),
    );
    const user = userEvent.setup();

    renderLibraryPage("/library?view=table");
    await user.click(
      screen.getByRole("button", { name: "fake-search-submit" }),
    );

    //we are now on /library/charmander?view=table
    expect(
      screen.getByRole("heading", { level: 3, name: "charmander" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Table" })).toBeChecked();
    expect(screen.getByRole("link", { name: /Featured/ })).toHaveAttribute(
      "href",
      "/library?view=table",
    );
  });

  it("shows the grid by default and the table for ?view=tabl, never both", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(
      makeLibraryState({ title: "Featured Cards" }),
    );

    const first = renderLibraryPage("/library");
    expect(screen.getByTestId("tcg-card-grid")).toBeInTheDocument();
    expect(screen.queryByTestId("tcg-card-table")).not.toBeInTheDocument();
    first.unmount();

    renderLibraryPage("/library?view=table");
    expect(screen.getByTestId("tcg-card-table")).toHaveAttribute(
      "data-caption",
      "Featured Cards",
    );
    expect(screen.queryByTestId("tcg-card-grid")).not.toBeInTheDocument();
  });

  it("swaps the grid for the table when the Table option s chosen", async () => {
    vi.mocked(useTCGLibrary).mockReturnValue(makeLibraryState());
    const user = userEvent.setup();

    renderLibraryPage("/library");
    await user.click(screen.getByRole("radio", { name: "Table" }));

    expect(screen.getByTestId("tcg-card-table")).toBeInTheDocument();
    expect(screen.queryByTestId("tcg-card-grid")).not.toBeInTheDocument();
  });

  it("opens the binder on the page named in the URL, and flipping updates it", async () => {
    vi.mocked(useTCGLibrary).mockReturnValue(makeLibraryState());
    const user = userEvent.setup();

    renderLibraryPage("/library?view=binder&page=2");
    expect(screen.getByTestId("tcg-card-binder")).toHaveAttribute(
      "data-page",
      "2",
    );
    expect(screen.queryByTestId("tcg-card-grid")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "fake-go-to-page-3" }));
    expect(screen.getByTestId("tcg-card-binder")).toHaveAttribute(
      "data-page",
      "3",
    );
  });

  it("starts the binder on page 1 when the URL has no usable page", () => {
    vi.mocked(useTCGLibrary).mockReturnValue(makeLibraryState());

    renderLibraryPage("/library?view=binder&page=banana");

    expect(screen.getByTestId("tcg-card-binder")).toHaveAttribute(
      "data-page",
      "1",
    );
  });

  it("keeps the view but drops the page on a new search and on the way back to Featured", async () => {
    vi.mocked(useTCGLibrary).mockImplementation((name?: string) =>
      makeLibraryState({ title: name ?? "Featured Cards" }),
    );
    const user = userEvent.setup();

    renderLibraryPage("/library?view=binder&page=2");
    await user.click(
      screen.getByRole("button", { name: "fake-search-submit" }),
    );

    //now on /library/charmander?view=binder, page reset
    expect(
      screen.getByRole("heading", { level: 3, name: "charmander" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Binder" })).toBeChecked();
    expect(screen.getByTestId("tcg-card-binder")).toHaveAttribute(
      "data-page",
      "1",
    );
    expect(screen.getByRole("link", { name: /Featured/ })).toHaveAttribute(
      "href",
      "/library?view=binder",
    );
  });

  it("opens the modal on card select and closes it", async () => {
    vi.mocked(useTCGLibrary).mockReturnValue(makeLibraryState());
    const user = userEvent.setup();

    renderLibraryPage("/library");

    expect(screen.queryByTestId("tcg-card-modal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "fake-select-card" }));
    expect(screen.getByTestId("tcg-card-modal")).toHaveTextContent(
      "Pikachu Card",
    );

    await user.click(screen.getByRole("button", { name: "fake-close-modal" }));
    expect(screen.queryByTestId("tcg-card-modal")).not.toBeInTheDocument();
  });
});

//useTCGLibrary, SearchBar,TCGCardGrid, and TCGCardModal are all mocked because
//each already has its own dedicated test file, LibraryPage's own responsibility
//and the only thing genuinely new here is the selectedCard state it alone owns
//plus correctly wiring the URL, the hook's props and the sort control together.
//the view toggle is NOT mocked: it is the real SegmentedControl reading the real
//URL through MemoryRouter, because "the URL is the source of truth" is exactly
//the behavior these tests exist to protect
