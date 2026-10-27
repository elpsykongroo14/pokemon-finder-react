import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ComparePage } from "./ComparePage";
import { PreferencesProvider } from "../context/PreferencesContext";
import { usePokemon } from "../hooks/usePokemon";
import { EMPTY_COMPARE, LOADING_LABEL, SELF_COMPARE } from "../lib/copy";
import type { PokemonDetails } from "../lib/type";

vi.mock("../hooks/usePokemon");
const retryA = vi.fn();
const retryB = vi.fn();

vi.mock("../components/SearchBar", () => ({
  SearchBar: ({ onSubmit }: { onSubmit: (query: string) => void }) => (
    <button onClick={() => onSubmit("charmander")}>fake-search-submit</button>
  ),
}));

vi.mock("../components/CompareView", () => ({
  CompareView: ({
    primary,
    secondary,
  }: {
    primary: { name: string };
    secondary: { name: string };
  }) => (
    <div data-testid="compare-view">
      {primary.name} vs {secondary.name}
    </div>
  ),
}));

const pikachuData = { name: "pikachu", id: 25 } as PokemonDetails;
const charmanderData = { name: "charmander", id: 4 } as PokemonDetails;

//each name gets its own lookup result, and its own retry, so a test can tell
//which retry the page called
const idle = { data: null, loading: false, error: null };
function mockLooups(
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
    mockLooups({});

    renderComparePage("/compare");

    expect(screen.getByRole("status")).toHaveTextContent(EMPTY_COMPARE);
  });

  it("shows the loading label while Pokemon A is loading", () => {
    mockLooups({ pikachu: { loading: true } });

    renderComparePage("/compare?a=pikachu");

    expect(screen.getByRole("status")).toHaveTextContent(LOADING_LABEL);
  });

  it("explains a not found Pokemon A politely, without a retry button", () => {
    mockLooups({ pikachu: { error: "not-found" } });

    renderComparePage("/compare?a=pikachu");

    expect(screen.getByRole("status")).toHaveTextContent(
      'No Pokémon named "pikachu" was found.',
    );
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
  });

  it("raises an alert with a retry that retries Pokemon A when its unreachable", async () => {
    mockLooups({ pikachu: { error: "unreachable" } });
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
    mockLooups({ pikachu: { error: "unreachable" } });
    const user = userEvent.setup();

    const { container } = renderComparePage("/compare?a=pikachu");
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(container.querySelector(".compare-page")).toHaveFocus();
  });

  it("prompts for a second pokemon once the first loaded", () => {
    mockLooups({ pikachu: { data: pikachuData } });

    renderComparePage("/compare?a=pikachu");

    expect(
      screen.getByRole("heading", { name: "Comparing pikachu with..." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "fake-search-submit" }),
    ).toBeInTheDocument();
  });

  it("adds the second Pokemon to the comparison on submit", async () => {
    mockLooups({
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
    mockLooups({
      pikachu: { data: pikachuData },
      charmander: { loading: true },
    });

    renderComparePage("/compare?a=pikachu&b=charmander");

    expect(screen.getByRole("status")).toHaveTextContent(LOADING_LABEL);
  });

  it("retries pokemon B, not A, and keeps the search open when B is unreachable", async () => {
    mockLooups({
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
    mockLooups({ pikachu: { data: pikachuData } });

    renderComparePage("/compare?a=pikachu&b=pikachu");

    expect(screen.getByRole("alert")).toHaveTextContent(SELF_COMPARE);
    expect(
      screen.getByRole("button", { name: "fake-search-submit" }),
    ).toBeInTheDocument();
  });

  it("renders the comparison when two differen pokemon have loaded", () => {
    mockLooups({
      pikachu: { data: pikachuData },
      charmander: { data: charmanderData },
    });

    renderComparePage("/compare?a=pikachu&b=charmander");

    expect(screen.getByTestId("compare-view")).toHaveTextContent(
      "pikachu vs charmander",
    );
  });
});

//usePokemon, SearchBar, and CompareView are all mocked because each already has
//its own test file. ComparePage's own responsibility is purely: read the two
//query string slots, ask getComparePageState which ONE situation applies
//(that function has its own tests), draw it, and wire the right retry to it.
//the tests above exercise exactly that
