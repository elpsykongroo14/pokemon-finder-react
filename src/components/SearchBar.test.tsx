import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";
import { useAutocomplete } from "../hooks/useAutocomplete";

const { setHighlightedIndex, dismiss } = vi.hoisted(() => ({
  setHighlightedIndex: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock("../hooks/useAutocomplete", () => ({
  useAutocomplete: vi.fn(),
}));

const mockedUseAutocomplete = vi.mocked(useAutocomplete);

//a small helper to keep every test's setup honest
function setAutocomplete(
  overrides: Partial<ReturnType<typeof useAutocomplete>> = {},
) {
  mockedUseAutocomplete.mockReturnValue({
    matches: [],
    highlightedIndex: -1,
    setHighlightedIndex,
    preview: null,
    isOpen: false,
    dismiss,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setAutocomplete();
});

describe("SearchBar", () => {
  it("renders a search input and submit button", () => {
    render(<SearchBar onSubmit={() => {}} />);

    expect(
      screen.getByRole("combobox", { name: /search pokémon/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("submits the trimmed query when the form is submitted", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<SearchBar onSubmit={handleSubmit} />);

    await user.type(screen.getByRole("combobox"), "  pikachu  ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(handleSubmit).toHaveBeenCalledWith("pikachu");
  });

  it("does not submit an empty ot whitespace only query", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<SearchBar onSubmit={handleSubmit} />);

    await user.type(screen.getByRole("combobox"), "   ");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("shows matches in a listbox when the hook reports its open", () => {
    setAutocomplete({
      matches: ["pikachu", "pichu"],
      isOpen: true,
      highlightedIndex: 0,
    });
    render(<SearchBar onSubmit={() => {}} />);

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("pikachu");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
  });

  it("hides the listbox when the hook reports its closed", () => {
    setAutocomplete({ matches: ["pikachu"], isOpen: false });
    render(<SearchBar onSubmit={() => {}} />);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("moves the highlight down on ArrowDown", async () => {
    const user = userEvent.setup();
    setAutocomplete({
      matches: ["pikachu", "pichu"],
      isOpen: true,
      highlightedIndex: 0,
    });
    render(<SearchBar onSubmit={() => {}} />);

    await user.type(screen.getByRole("combobox"), "{ArrowDown}");

    expect(setHighlightedIndex).toHaveBeenCalledWith(1);
  });

  it("selects the highlighted match on Enter", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    setAutocomplete({
      matches: ["pikachu", "pichu"],
      isOpen: true,
      highlightedIndex: 1,
    });
    render(<SearchBar onSubmit={handleSubmit} />);

    await user.type(screen.getByRole("combobox"), "{Enter}");

    expect(handleSubmit).toHaveBeenCalledWith("pichu");
  });

  it("dismisses the dropdown on Escape", async () => {
    const user = userEvent.setup();
    setAutocomplete({
      matches: ["pikachu"],
      isOpen: true,
      highlightedIndex: 0,
    });
    render(<SearchBar onSubmit={() => {}} />);

    await user.type(screen.getByRole("combobox"), "{Escape}");

    expect(dismiss).toHaveBeenCalled();
  });

  it("selects a match when its clicked", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    setAutocomplete({
      matches: ["pikachu"],
      isOpen: true,
      highlightedIndex: 0,
    });
    render(<SearchBar onSubmit={handleSubmit} />);

    await user.click(screen.getByRole("option", { name: "pikachu" }));

    expect(handleSubmit).toHaveBeenCalledWith("pikachu");
  });
});
