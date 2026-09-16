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
//plus corectly wiring the URL, the hook's props and the sort control together
//thatst what these five tests test actually exercise
