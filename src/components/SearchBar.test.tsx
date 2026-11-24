import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./SearchBar";
import { useAutocomplete } from "../hooks/useAutocomplete";

const { setHighlightedIndex, dismiss, notifyQueryEdited } = vi.hoisted(() => ({
  setHighlightedIndex: vi.fn(),
  dismiss: vi.fn(),
  notifyQueryEdited: vi.fn(),
}));

vi.mock("../hooks/useAutocomplete", () => ({
  useAutocomplete: vi.fn(),
}));

const mockedUseAutocomplete = vi.mocked(useAutocomplete);

const PIKACHU = { name: "pikachu", id: 25 };
const PICHU = { name: "pichu", id: 172 };
const PIKACHU_AND_PICHU = [PIKACHU, PICHU];

//a small helper to keep every test's setup honest
function setAutocomplete(
  overrides: Partial<ReturnType<typeof useAutocomplete>> = {},
) {
  mockedUseAutocomplete.mockReturnValue({
    matches: [],
    highlightedIndex: -1,
    setHighlightedIndex,
    isOpen: false,
    dismiss,
    notifyQueryEdited,
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setAutocomplete();
});

describe("SearchBar", () => {
  it("leaves its search landmark unnamed by default, and names it when given a label", () => {
    const { unmount } = render(<SearchBar onSubmit={vi.fn()} />);
    expect(screen.getByRole("search")).not.toHaveAttribute("aria-label");
    unmount();

    render(<SearchBar onSubmit={vi.fn()} label="Choose an opponent" />);
    expect(
      screen.getByRole("search", { name: "Choose an opponent" }),
    ).toBeInTheDocument();
  });

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
      matches: PIKACHU_AND_PICHU,
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

  it("shows each option's Pokedex number to the eye, but not to a secreen render", () => {
    setAutocomplete({
      matches: PIKACHU_AND_PICHU,
      isOpen: true,
      highlightedIndex: 0,
    });
    render(<SearchBar onSubmit={() => {}} />);

    const first = screen.getByRole("option", { name: "pikachu" });
    expect(first).toHaveTextContent("No. 025");
    expect(screen.getByRole("option", { name: "pichu" })).toHaveTextContent(
      "No. 172",
    );
  });

  it("keeps the combobox contract: ids, aria-activedescendant, aria-controls", () => {
    setAutocomplete({
      matches: PIKACHU_AND_PICHU,
      isOpen: true,
      highlightedIndex: 1,
    });
    render(<SearchBar onSubmit={() => {}} />);

    const input = screen.getByRole("combobox", { name: /search pokémon/i });
    const listbox = screen.getByRole("listbox");
    const options = screen.getAllByRole("option");

    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    //B&W-5: the ids are no longer the fixed "autocomplete-option-0": they
    //come from useId, because Compare now shows three of these at once.
    //what matters is that they exist, differ, and are what the input points at
    expect(listbox.id).not.toBe("");
    expect(new Set(options.map((o) => o.id)).size).toBe(2);
    expect(input).toHaveAttribute("aria-activedescendant", options[1].id);
  });

  //B&W-5: Compare shows the header search and two pickers on one page. two
  //elements sharing an id is invalid HTML, and aria-controls pointing at a
  //duplicated id can lead a screen reader into the wrong list
  it("gives every search bar its own ids, so several can share a page", () => {
    setAutocomplete({ matches: [PIKACHU], isOpen: true, highlightedIndex: 0 });
    render(
      <>
        <SearchBar onSubmit={() => {}} inputLabel="First" />
        <SearchBar onSubmit={() => {}} inputLabel="Second" />
      </>,
    );

    const [one, two] = screen.getAllByRole("combobox");
    const [listOne, listTwo] = screen.getAllByRole("listbox");
    const [optionOne, optionTwo] = screen.getAllByRole("option");

    expect(one.id).not.toBe(two.id);
    expect(listOne.id).not.toBe(listTwo.id);
    expect(optionOne.id).not.toBe(optionTwo.id);
    expect(one).toHaveAttribute("aria-controls", listOne.id);
    expect(two).toHaveAttribute("aria-controls", listTwo.id);
  });

  it("uses the input id it is given (the header search, which others focus by id)", () => {
    render(<SearchBar onSubmit={() => {}} inputId="pokemon-search" />);

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "id",
      "pokemon-search",
    );
  });

  it("can show its label on screen, and then the label names the field", () => {
    render(<SearchBar onSubmit={() => {}} inputLabel="Second" labelVisible />);

    const field = screen.getByRole("combobox", { name: "Second" });
    expect(screen.getByText("Second").tagName).toBe("LABEL");
    expect(field).not.toHaveAttribute("aria-label");
  });

  //B&W-7: the Library hero's search has a visible "Search" button (spec
  //7.4); the name stays the same, so it is still the "Search" button
  it("can show its submit button's word instead of the magnifier", () => {
    render(<SearchBar onSubmit={() => {}} submitText />);

    const submit = screen.getByRole("button", { name: "Search" });
    expect(submit).toHaveTextContent("Search");
    expect(submit.querySelector("svg")).toBeNull();
  });

  it("empties the field after a pick when asked to (the Compare pickers)", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    setAutocomplete({ matches: [PIKACHU], isOpen: true, highlightedIndex: 0 });
    render(<SearchBar onSubmit={handleSubmit} clearOnSubmit />);

    await user.type(screen.getByRole("combobox"), "pika");
    await user.click(screen.getByRole("option", { name: "pikachu" }));

    expect(handleSubmit).toHaveBeenCalledWith("pikachu");
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("hides the listbox when the hook reports its closed", () => {
    setAutocomplete({ matches: [PIKACHU], isOpen: false });
    render(<SearchBar onSubmit={() => {}} />);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("moves the highlight down on ArrowDown", async () => {
    const user = userEvent.setup();
    setAutocomplete({
      matches: PIKACHU_AND_PICHU,
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
      matches: PIKACHU_AND_PICHU,
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
      matches: [PIKACHU],
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
      matches: [PIKACHU],
      isOpen: true,
      highlightedIndex: 0,
    });
    render(<SearchBar onSubmit={handleSubmit} />);

    await user.click(screen.getByRole("option", { name: "pikachu" }));

    expect(handleSubmit).toHaveBeenCalledWith("pikachu");
  });

  //D51: every row shows its sprite, built from the dex number alone. the
  //picture is decoration (alt=""): the option is already named by its name
  it("shows each option's sprite as decoration, built from its dex number", () => {
    setAutocomplete({
      matches: PIKACHU_AND_PICHU,
      isOpen: true,
      highlightedIndex: 0,
    });
    const { container } = render(<SearchBar onSubmit={() => {}} />);

    const sprites = container.querySelectorAll<HTMLImageElement>(
      ".autocomplete-item img",
    );
    expect(sprites).toHaveLength(2);
    expect(sprites[0]).toHaveAttribute("alt", "");
    expect(sprites[0].src.endsWith("/25.png")).toBe(true);
    expect(sprites[0]).toHaveAttribute("loading", "lazy");
    expect(screen.getByRole("option", { name: "pikachu" })).toBeInTheDocument();
  });

  it("no longer draws a ▶ cursor in the rows", () => {
    setAutocomplete({ matches: [PIKACHU], isOpen: true, highlightedIndex: 0 });
    render(<SearchBar onSubmit={() => {}} />);

    expect(screen.queryByText("▶")).not.toBeInTheDocument();
  });

  it("asks for a name or a number", () => {
    render(<SearchBar onSubmit={() => {}} />);

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Search by name or number",
    );
  });
});

//this file protects: the field is discoverable and submittable, empty input is rejected, the dropdown reflects hook state faithfully,
//all four keyboard interactions work, and mouse selection works. If we later rewrites useAutocomplete's internals, or swaps SearchBar's useState for a reducer, none of this file needs to change
//only the assertions about useAutocomplete's own behavior would need updating
