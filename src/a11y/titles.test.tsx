//WCAG 2.4.2 Page tilted (level A): every route gets its own browser-tab
//title. axe cant check this: its rule only asks "is there a title at all all?",
//and "pokemon-finder-react" on every page passed that happily
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
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

describe("every route has its own document title", () => {
  it.each([
    ["/", "Pokémon Finder"],
    ["/pokemon/pikachu", "Pikachu · Pokémon Finder"],
    ["/compare", "Compare Pokémon · Pokémon Finder"],
    ["/team", "Your Team · Pokémon Finder"],
    ["/library", "TCG Library · Pokémon Finder"],
    ["/library/pikachu", "TCG Library: pikachu · Pokémon Finder"],
    ["/no/such/page", "Page not found · Pokémon Finder"],
  ])("%s → %s", async (path, expected) => {
    renderApp(path);
    await waitFor(() => expect(document.title).toBe(expected));
  });

  it("changes when you search for another Pokémon (no page reload)", async () => {
    const user = userEvent.setup();
    renderApp("/pokemon/pikachu");
    await waitFor(() =>
      expect(document.title).toBe("Pikachu · Pokémon Finder"),
    );

    //the header's search box, same as a user would use it
    const [search] = screen.getAllByRole("combobox", {
      name: "Search Pokémon",
    });
    await user.type(search, "raichu{Enter}");

    await waitFor(() => expect(document.title).toBe("Raichu · Pokémon Finder"));
  });
});
