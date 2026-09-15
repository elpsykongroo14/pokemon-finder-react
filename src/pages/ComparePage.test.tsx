import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ComparePage } from "./ComparePage";
import { usePokemon } from "../hooks/usePokemon";
import type { PokemonDetails } from "../lib/type";

vi.mock("../hooks/usePokemon");

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

function renderComparePage(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ComparePage", () => {
  it("prompts to search first when theres no 'a' param", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderComparePage("/compare");

    expect(
      screen.getByText(
        "Search for a Pokémon first, then hit Compare to bring it here.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a loading status while Pokémon A is loading", () => {
    vi.mocked(usePokemon).mockImplementation((name: string) =>
      name === "pikachu"
        ? { data: null, loading: true, error: null }
        : { data: null, loading: false, error: null },
    );

    renderComparePage("/compare?a=pikachu");

    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  });

  it("shows an alert when Pokémon A fails to load", () => {
    vi.mocked(usePokemon).mockImplementation((name: string) =>
      name === "pikachu"
        ? { data: null, loading: false, error: "Pokémon not found" }
        : { data: null, loading: false, error: null },
    );

    renderComparePage("/compare?a=pikachu");

    expect(screen.getByRole("alert")).toHaveTextContent("Pokémon not found");
  });

  it("prompts for a second Pokémon once the first has loaded", () => {
    vi.mocked(usePokemon).mockImplementation((name: string) =>
      name === "pikachu"
        ? { data: pikachuData, loading: false, error: null }
        : { data: null, loading: false, error: null },
    );

    renderComparePage("/compare?a=pikachu");

    expect(
      screen.getByRole("heading", { name: "Comparing pikachu with..." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "fake-search-submit" }),
    ).toBeInTheDocument();
  });

  it("adds the second Pokémon to the comparison on submit", async () => {
    vi.mocked(usePokemon).mockImplementation((name: string) => {
      if (name === "pikachu")
        return { data: pikachuData, loading: false, error: null };
      if (name === "charmander")
        return { data: charmanderData, loading: false, error: null };
      return { data: null, loading: false, error: null };
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

  it("rejects comparing a Pokémon against itself", () => {
    vi.mocked(usePokemon).mockReturnValue({
      data: pikachuData,
      loading: false,
      error: null,
    });

    renderComparePage("/compare?a=pikachu&b=pikachu");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a different Pokémon to compare.",
    );
  });

  it("renders the comparison when two different Pokémon have loaded", () => {
    vi.mocked(usePokemon).mockImplementation((name: string) => {
      if (name === "pikachu")
        return { data: pikachuData, loading: false, error: null };
      if (name === "charmander")
        return { data: charmanderData, loading: false, error: null };
      return { data: null, loading: false, error: null };
    });

    renderComparePage("/compare?a=pikachu&b=charmander");

    expect(screen.getByTestId("compare-view")).toHaveTextContent(
      "pikachu vs charmander",
    );
  });
});

//usePokemon, SearchBar, and CompareView are all mocked because each already has
//its own test file, ComparePage's own responsibility is purely: parse the two
//query string slots, pick the right branch, and forward the right data
//thats what every test aboce actually exercises
