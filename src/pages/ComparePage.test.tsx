import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { ComparePage } from "./ComparePage";
import { PreferencesProvider } from "../context/PreferencesContext";
import { usePokemon } from "../hooks/usePokemon";
import {
  COMPARE_HEADING,
  COMPARE_SUBTITLE,
  EMPTY_COMPARE,
  FIRST_SEARCH_LABEL,
  LOADING_LABEL,
  OPPONENT_SEARCH_LABEL,
  SELF_COMPARE,
} from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

vi.mock("../hooks/usePokemon");
const retryA = vi.fn();
const retryB = vi.fn();

vi.mock("../components/SearchBar", () => ({
  SearchBar: ({
    onSubmit,
    label,
  }: {
    onSubmit: (query: string) => void;
    label?: string;
  }) => (
    <div>
      <button onClick={() => onSubmit("charmander")}>fake-search-submit</button>
      <span data-testid="search-label">{label}</span>
    </div>
  ),
}));

//the stand-in shows what it was given and offers the band's two actions
//(a pick for the second slot, and Swap) as plain buttons
vi.mock("../components/CompareView", () => ({
  CompareView: ({
    primary,
    secondary,
    pending,
    onPick,
    onSwap,
  }: {
    primary: { name: string };
    secondary: { name: string };
    pending?: boolean;
    onPick: (slot: "a" | "b", query: string) => void;
    onSwap: () => void;
  }) => (
    <div data-testid="compare-view" data-pending={pending || undefined}>
      {primary.name} vs {secondary.name}
      <button onClick={onSwap}>fake-swap</button>
      <button onClick={() => onPick("b", "squirtle")}>
        fake-pick-squirtle
      </button>
      <button onClick={() => onPick("b", "pikachu")}>fake-pick-pikachu</button>
    </div>
  ),
}));

//where the page has sent the URL
function Probe() {
  const { search } = useLocation();
  return <p data-testid="search">{search}</p>;
}

const pikachuData = { name: "pikachu", id: 25 } as PokemonDetails;
const charmanderData = { name: "charmander", id: 4 } as PokemonDetails;

//each name gets its own lookup result, and its own retry, so a test can tell
//which retry the page called
const idle = { data: null, loading: false, error: null };
function mockLookups(
  byName: Record<string, Partial<ReturnType<typeof usePokemon>>>,
) {
  vi.mocked(usePokemon).mockImplementation((name: string) => ({
    ...idle,
    retry: name === "pikachu" ? retryA : retryB,
    ...byName[name],
  }));
}

function renderComparePage(initialPath: string) {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/compare" element={<ComparePage />} />
        </Routes>
        <Probe />
      </MemoryRouter>
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  retryA.mockReset();
  retryB.mockReset();
});

describe("ComparePage", () => {
  it("invites the use to search first when theres no 'a' param", () => {
    mockLookups({});

    renderComparePage("/compare");

    expect(screen.getByRole("status")).toHaveTextContent(EMPTY_COMPARE);
  });

  it("starts a comparison from the empty page: its search picks the first Pokémon", async () => {
    mockLookups({});
    const user = userEvent.setup();

    renderComparePage("/compare");

    expect(screen.getByTestId("search-label")).toHaveTextContent(
      FIRST_SEARCH_LABEL,
    );
    await user.click(
      screen.getByRole("button", { name: "fake-search-submit" }),
    );
    expect(screen.getByTestId("search")).toHaveTextContent("?a=charmander");
  });

  it("shows the loading label while Pokemon A is loading", () => {
    mockLookups({ pikachu: { loading: true } });

    renderComparePage("/compare?a=pikachu");

    expect(screen.getByRole("status")).toHaveTextContent(LOADING_LABEL);
  });

  it("explains a not found Pokemon A politely, without a retry button", () => {
    mockLookups({ pikachu: { error: "not-found" } });

    renderComparePage("/compare?a=pikachu");

    expect(screen.getByRole("status")).toHaveTextContent(
      'No Pokémon named "pikachu" was found.',
    );
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });

  it("raises an alert with a retry that retries Pokemon A when its unreachable", async () => {
    mockLookups({ pikachu: { error: "unreachable" } });
    const user = userEvent.setup();

    renderComparePage("/compare?a=pikachu");
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't reach the Pokédex.",
    );
    expect(retryA).toHaveBeenCalledTimes(1);
    expect(retryB).not.toHaveBeenCalled();
  });

  it("moves focus to the page wrapper before retrying, so focus is not lost", async () => {
    mockLookups({ pikachu: { error: "unreachable" } });
    const user = userEvent.setup();

    const { container } = renderComparePage("/compare?a=pikachu");
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(container.querySelector(".compare-page")).toHaveFocus();
  });

  it("prompts for a second pokemon once the first loaded", () => {
    mockLookups({ pikachu: { data: pikachuData } });

    renderComparePage("/compare?a=pikachu");

    expect(
      screen.getByRole("heading", { name: "Comparing Pikachu with..." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "fake-search-submit" }),
    ).toBeInTheDocument();
  });

  it("adds the second Pokemon to the comparison on submit", async () => {
    mockLookups({
      pikachu: { data: pikachuData },
      charmander: { data: charmanderData },
    });
    const user = userEvent.setup();

    renderComparePage("/compare?a=pikachu");
    await user.click(
      screen.getByRole("button", { name: "fake-search-submit" }),
    );

    expect(screen.getByTestId("compare-view")).toHaveTextContent(
      "pikachu vs charmander",
    );
  });

  it("shows the loading label while Pokemon B is loading", () => {
    mockLookups({
      pikachu: { data: pikachuData },
      charmander: { loading: true },
    });

    renderComparePage("/compare?a=pikachu&b=charmander");

    expect(screen.getByRole("status")).toHaveTextContent(LOADING_LABEL);
  });

  it("retries pokemon B, not A, and keeps the search open when B is unreachable", async () => {
    mockLookups({
      pikachu: { data: pikachuData },
      charmander: { error: "unreachable" },
    });
    const user = userEvent.setup();

    renderComparePage("/compare?a=pikachu&b=charmander");
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(retryB).toHaveBeenCalledTimes(1);
    expect(retryA).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "fake-search-submit" }),
    ).toBeInTheDocument();
  });

  it("rejects comparing a pokemon against itself, and offers a new search", () => {
    mockLookups({ pikachu: { data: pikachuData } });

    renderComparePage("/compare?a=pikachu&b=pikachu");

    expect(screen.getByRole("alert")).toHaveTextContent(SELF_COMPARE);
    expect(
      screen.getByRole("button", { name: "fake-search-submit" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["no first pokemon", "/compare", {}],
    [
      "a loaded comparison",
      "/compare?a=pikachu&b=charmander",
      { pikachu: { data: pikachuData }, charmander: { data: charmanderData } },
    ],
  ])(
    "gives the page an h2 so the headings below it nest correctly (%s)",
    (_name, path, lookups) => {
      mockLookups(lookups);

      renderComparePage(path);

      expect(
        screen.getByRole("heading", { level: 2, name: COMPARE_HEADING }),
      ).toBeInTheDocument();
    },
  );

  it("shows its title and purpose (the heading is no longer hidden)", () => {
    mockLookups({});

    renderComparePage("/compare");

    expect(
      screen.getByRole("heading", { level: 2, name: COMPARE_HEADING }),
    ).not.toHaveClass("visually-hidden");
    expect(screen.getByText(COMPARE_SUBTITLE)).toBeInTheDocument();
  });

  it("names the opponent search, so it is not confused with header search", () => {
    mockLookups({ pikachu: { data: pikachuData } });

    renderComparePage("/compare?a=pikachu");

    expect(screen.getByTestId("search-label")).toHaveTextContent(
      OPPONENT_SEARCH_LABEL,
    );
  });

  it("renders the comparison when two differen pokemon have loaded", () => {
    mockLookups({
      pikachu: { data: pikachuData },
      charmander: { data: charmanderData },
    });

    renderComparePage("/compare?a=pikachu&b=charmander");

    expect(screen.getByTestId("compare-view")).toHaveTextContent(
      "pikachu vs charmander",
    );
  });

  //B&W-5 (spec 7.3): the versus field and the names take the title's
  //place on screen. the h2 stays, for the page outline and screen readers
  it("keeps the page heading for screen readers only once the comparison is up", () => {
    mockLookups({
      pikachu: { data: pikachuData },
      charmander: { data: charmanderData },
    });

    renderComparePage("/compare?a=pikachu&b=charmander");

    expect(
      screen.getByRole("heading", { level: 2, name: COMPARE_HEADING }),
    ).toHaveClass("visually-hidden");
    expect(screen.queryByText(COMPARE_SUBTITLE)).not.toBeInTheDocument();
  });

  describe("identity band", () => {
    const both = {
      pikachu: { data: pikachuData },
      charmander: { data: charmanderData },
    };

    it("swaps the two sides in the URL", async () => {
      mockLookups(both);
      const user = userEvent.setup();

      renderComparePage("/compare?a=pikachu&b=charmander");
      await user.click(screen.getByRole("button", { name: "fake-swap" }));

      expect(screen.getByTestId("search")).toHaveTextContent(
        "?a=charmander&b=pikachu",
      );
    });

    it("puts a picked Pokémon in its slot", async () => {
      mockLookups({ ...both, squirtle: { loading: true } });
      const user = userEvent.setup();

      renderComparePage("/compare?a=pikachu&b=charmander");
      await user.click(
        screen.getByRole("button", { name: "fake-pick-squirtle" }),
      );

      expect(screen.getByTestId("search")).toHaveTextContent(
        "?a=pikachu&b=squirtle",
      );
    });

    it("swaps instead when the Pokémon on the other side is picked", async () => {
      mockLookups(both);
      const user = userEvent.setup();

      renderComparePage("/compare?a=pikachu&b=charmander");
      await user.click(
        screen.getByRole("button", { name: "fake-pick-pikachu" }),
      );

      expect(screen.getByTestId("search")).toHaveTextContent(
        "?a=charmander&b=pikachu",
      );
    });

    //the comparison must not drop to a loading message while the new
    //opponent loads: the picker that was just used lives inside it
    it("keeps the comparison up, marked pending, while the new pick loads", async () => {
      mockLookups({ ...both, squirtle: { loading: true } });
      const user = userEvent.setup();

      renderComparePage("/compare?a=pikachu&b=charmander");
      await user.click(
        screen.getByRole("button", { name: "fake-pick-squirtle" }),
      );

      const view = screen.getByTestId("compare-view");
      expect(view).toHaveTextContent("pikachu vs charmander");
      expect(view).toHaveAttribute("data-pending", "true");
    });
  });
});

//usePokemon, SearchBar, and CompareView are all mocked because each already has
//its own test file. ComparePage's own responsibility is purely: read the two
//query string slots, ask getComparePageState which ONE situation applies
//(that function has its own tests), draw it, and wire the right retry to it.
//the tests above exercise exactly that
