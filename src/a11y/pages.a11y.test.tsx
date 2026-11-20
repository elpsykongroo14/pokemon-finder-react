//page-level accessibility gate: every route, in the
//states a user actually sees, rendered as the REAL app (all providers, the
//real Layout, real components) and checked by axe.
//only the network is fake (see fakeApi.ts)
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { clearPokeCache } from "../lib/api";
import { CARDS_LOADING_LABEL, LOADING_LABEL } from "../lib/copy";
import { installFakeApi } from "./fakeApi";
import { runAxe } from "./axe";
import { renderApp } from "./renderApp";

//axe checks what is in the DOM right now, so a check run while a page is
//still loading would only check the skeleton. "settled" = none of the
//app's loading signals is on screen: the two loading sentences from
//copy.ts (as text or as a status's name) and any skeleton shape.
//waitFor retries until that holds (or fails the test after 1 s)
const LOADING = new RegExp(`${LOADING_LABEL}|${CARDS_LOADING_LABEL}`);

async function settled() {
  await waitFor(() => {
    expect(screen.queryByText(LOADING)).toBeNull();
    expect(screen.queryByRole("status", { name: LOADING })).toBeNull();
    expect(document.querySelector(".skeleton")).toBeNull();
  });
}

//R10 F3: an emoji or arrow inside a button or link becomes part of its
//accessible name, so a screen reader reads it out ("crossed swords,
//Compare"). axe does not flag this, so we check it ourselves: no
//pictograph, arrow, geometric shape or dingbat in the name of anything
//you can operate. decorative icons belong in an aria-hidden span
const SYMBOL =
  /[\p{Extended_Pictographic}\u2190-\u21FF\u25A0-\u25FF\u2700-\u27BF]/u;
const OPERABLE = [
  "button",
  "link",
  "tab",
  "option",
  "radio",
  "checkbox",
  "switch",
  "menuitem",
] as const;

//the whole page check: axe's rules plus the name rule above
async function expectAccessiblePage() {
  expect(await runAxe(document.body)).toHaveNoViolations();
  const offenders = OPERABLE.flatMap((role) =>
    screen
      .queryAllByRole(role, { name: SYMBOL })
      .map((el) => `${role}: "${el.textContent?.trim()}"`),
  );
  expect(offenders).toEqual([]);
}

beforeEach(() => {
  installFakeApi();
  //api.ts caches responses in module scope; a cache left over from the
  //previous test would make "loading" states unreachable
  clearPokeCache();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("accessibility: every page passes axe (WCAG 2.1 A + AA) and has clean names", () => {
  it("Home, after the wild encounter has loaded", async () => {
    renderApp("/");
    await screen.findAllByText(/pikachu/i);
    await settled();
    await expectAccessiblePage();
  });

  it("Pokémon page", async () => {
    renderApp("/pokemon/pikachu");
    await screen.findByRole("heading", { name: /pikachu/i });
    await settled();
    await expectAccessiblePage();
  });

  it("Compare (Versus) with two Pokémon", async () => {
    renderApp("/compare?a=pikachu&b=raichu");
    await screen.findAllByText(/raichu/i);
    await settled();
    await expectAccessiblePage();
  });

  it("Team (Party), empty", async () => {
    renderApp("/team");
    await settled();
    await expectAccessiblePage();
  });

  it("Team (Party), with members", async () => {
    localStorage.setItem(
      "pokemon_team",
      JSON.stringify([
        {
          name: "pikachu",
          id: 25,
          sprite: "https://img.test/25.png",
          types: ["electric"],
        },
        {
          name: "raichu",
          id: 26,
          sprite: "https://img.test/26.png",
          types: ["electric"],
        },
      ]),
    );
    renderApp("/team");
    await screen.findAllByText(/raichu/i);
    await settled();
    await expectAccessiblePage();
  });

  it.each(["grid", "table", "binder"])("Library, %s view", async (view) => {
    renderApp(`/library/pikachu?view=${view}`);
    await screen.findAllByText(/test set|pikachu/i);
    await settled();
    await expectAccessiblePage();
  });

  it("Library, card dialog open", async () => {
    const user = userEvent.setup();
    renderApp("/library/pikachu?view=grid");
    const cards = await screen.findAllByRole("button", { name: /pikachu/i });
    await user.click(cards[0]);
    await screen.findByRole("dialog");
    await expectAccessiblePage();
  });

  it("Settings dialog open", async () => {
    const user = userEvent.setup();
    renderApp("/pokemon/pikachu");
    await screen.findByRole("heading", { name: /pikachu/i });
    await user.click(screen.getByRole("button", { name: "Settings" }));
    await screen.findByRole("dialog");
    await expectAccessiblePage();
  });

  it("Pokémon page, network error (MessageBox + Retry)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    renderApp("/pokemon/pikachu");
    await screen.findByRole("alert");
    await expectAccessiblePage();
  });

  it("404", async () => {
    renderApp("/this/route/does/not/exist");
    await screen.findByRole("heading", { level: 2 });
    await expectAccessiblePage();
  });
});
