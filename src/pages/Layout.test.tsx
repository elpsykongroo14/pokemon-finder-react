import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { FavoritesProvider } from "../context/FavoritesContext";
import { TeamProvider } from "../context/TeamContext";

vi.mock("../components/SearchBar", () => ({
  SearchBar: ({ onSubmit }: { onSubmit: (query: string) => void }) => (
    <button onClick={() => onSubmit("pikachu")}>fake-search-submit</button>
  ),
}));

function renderLayout(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <FavoritesProvider>
        <TeamProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Home Content</div>} />
              <Route
                path="/pokemon/:name"
                element={<div>Pokemon Page Content</div>}
              />
              <Route path="/compare" element={<div>Compare Content</div>} />
            </Route>
          </Routes>
        </TeamProvider>
      </FavoritesProvider>
    </MemoryRouter>,
  );
}

describe("Layout", () => {
  it("renders the persistent title and nav alongside the matched route", () => {
    renderLayout("/");

    expect(
      screen.getByRole("heading", { name: "Pokémon Finder" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Compare" })).toBeInTheDocument();
    expect(screen.getByText("Home Content")).toBeInTheDocument();
  });

  it("swaps only the Outlet content when the route changes", () => {
    renderLayout("/compare");

    expect(
      screen.getByRole("heading", { name: "Pokémon Finder" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Compare Content")).toBeInTheDocument();
    expect(screen.queryByText("Home Content")).not.toBeInTheDocument();
  });

  it("marks Home active only on the exact rooth path,not on nested routes", () => {
    const { unmount } = renderLayout("/");
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("active");
    unmount();

    renderLayout("/pokemon/pikachu");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveClass(
      "active",
    );
  });

  it("navigates to the pokemon page when a search is submitted", async () => {
    const user = userEvent.setup();
    renderLayout("/");

    await user.click(
      screen.getByRole("button", { name: "fake-search-submit" }),
    );

    expect(screen.getByText("Pokemon Page Content")).toBeInTheDocument();
    expect(screen.queryByText("Home Content")).not.toBeInTheDocument();
  });

  it("exposes the shell as landmarks: banner, navigation, main, favorites", () => {
    renderLayout("/");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Main" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "Favorites and party" }),
    ).toBeInTheDocument();
  });

  it("keeps favorites and the party counter together in the tray", () => {
    renderLayout("/");

    const tray = screen.getByRole("complementary", {
      name: "Favorites and party",
    });
    expect(within(tray).getByText("No favorites yet.")).toBeInTheDocument();
    expect(
      within(tray).getByRole("link", { name: "Party 0/6" }),
    ).toBeInTheDocument();
  });

  it("renders the routed page inside <main>, not in the header or tray", () => {
    renderLayout("/");

    expect(screen.getByRole("main")).toContainElement(
      screen.getByText("Home Content"),
    );
    expect(screen.getByRole("banner")).not.toContainElement(
      screen.getByText("Home Content"),
    );
  });

  it("keeps the keyboard order: nav links, then search, then page content", async () => {
    const user = userEvent.setup();
    renderLayout("/");

    await user.tab();
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Compare" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Team" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Library" })).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole("button", { name: "fake-search-submit" }),
    ).toHaveFocus();
  });
});

//this file is where were fored to mock a whole component rather than a hook (SearchBar)
//and it proves real routing behavior (URl change -> visible content change)
//rather than a mocked function's call arguments
