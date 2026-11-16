//on every page change, focus moves to a skip link
//whose name says which page you are on ("Your Team: skip to content").
//a screen reader reads it, a keyboard user starts from it, and Enter on it
//jumps past the header into the page
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { clearPokeCache } from "../lib/api";
import { installFakeApi } from "./fakeApi";
import { renderApp } from "./renderApp";

beforeEach(() => {
  installFakeApi();
  clearPokeCache();
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("route change focus", () => {
  it("does nothing on the first load: the screen reader already starts at the top", async () => {
    renderApp("/team");
    const skip = await screen.findByRole("link", { name: "Skip to content" });
    expect(skip).not.toHaveFocus();
  });

  it("moves focus to the skip link, named after the new page, when you follow a nav link", async () => {
    const user = userEvent.setup();
    renderApp("/");
    //Home has two "Team" links (the nav and the battle menu): use the nav's
    const nav = screen.getByRole("navigation", { name: "Main" });
    await user.click(within(nav).getByRole("link", { name: "Team" }));

    const skip = await screen.findByRole("link", {
      name: "Your Team: skip to content",
    });
    await waitFor(() => expect(skip).toHaveFocus());
  });

  //a screen reader reads a link's name AT THE MOMENT it gets focus. so the
  //new name must already be in the DOM then, not one render later
  it("is already named after the new page at the moment it gets focus", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const skip = await screen.findByRole("link", { name: "Skip to content" });
    const namesAtFocus: string[] = [];
    skip.addEventListener("focus", () =>
      namesAtFocus.push(skip.textContent ?? ""),
    );

    const nav = screen.getByRole("navigation", { name: "Main" });
    await user.click(within(nav).getByRole("link", { name: "Team" }));

    await waitFor(() =>
      expect(namesAtFocus).toEqual(["Your Team: skip to content"]),
    );
  });

  it("does the same after a search from the header", async () => {
    const user = userEvent.setup();
    renderApp("/team");
    const [search] = screen.getAllByRole("combobox", {
      name: "Search Pokémon",
    });
    await user.type(search, "raichu{Enter}");

    const skip = await screen.findByRole("link", {
      name: "Raichu: skip to content",
    });
    await waitFor(() => expect(skip).toHaveFocus());
  });

  it("leaves focus alone when only the query string changes (same page, new view)", async () => {
    const user = userEvent.setup();
    renderApp("/library/pikachu?view=grid");
    const table = await screen.findByRole("radio", { name: /table/i });
    await user.click(table);

    expect(table).toHaveFocus();
    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).not.toHaveFocus();
  });

  it("Enter on the skip link puts focus at the start of the page content", async () => {
    const user = userEvent.setup();
    renderApp("/team");
    const skip = await screen.findByRole("link", { name: "Skip to content" });
    skip.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("main")).toHaveFocus();
  });
});
