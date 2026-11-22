import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { FavoritesProvider } from "../context/FavoritesContext";
import { TeamProvider } from "../context/TeamContext";
import { PreferencesProvider } from "../context/PreferencesContext";

vi.mock("../components/SearchBar", () => ({
  SearchBar: ({ onSubmit }: { onSubmit: (query: string) => void }) => (
    <button onClick={() => onSubmit("pikachu")}>fake-search-submit</button>
  ),
}));

function renderLayout(initialPath = "/") {
  return render(
    //the tray's empty-favorites MessageBox reads the animation preference
    <PreferencesProvider>
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
      </MemoryRouter>
    </PreferencesProvider>,
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

  it("exposes the shell as landmarks: banner, navigation, main", () => {
    renderLayout("/");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Main" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("has exactly one banner and one contentinfo landmark", () => {
    renderLayout("/");

    //the shell's own header and footer. (the Home router no
    //PageHeader; jsdom would wrongly count one as a second banner)
    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  });

  it("puts the Settings button in the header, on every page", () => {
    renderLayout("/");

    expect(screen.getByRole("banner")).toContainElement(
      screen.getByRole("button", { name: "Settings" }),
    );
  });

  //B&W-3 moved the party up into the header (spec 5.1). B&W-4 gave
  //favorites their rail on the Pokémon page (D48), so the shell's tray,
  //and its "Favorites" complementary landmark, are gone
  it("puts the party counter in the header, and has no favorites tray", () => {
    renderLayout("/");

    expect(
      within(screen.getByRole("banner")).getByRole("link", {
        name: "Party, 0 of 6",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Favorites" }),
    ).not.toBeInTheDocument();
  });

  //D42: the global drifting backdrop is retired; the color now lives in
  //the fields that show a Pokémon
  it("no longer paints a backdrop behind the app", () => {
    const { container } = renderLayout("/");

    expect(container.querySelector(".backdrop")).not.toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();
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
