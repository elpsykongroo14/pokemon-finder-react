import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { BattleMenu } from "./BattleMenu";
import { SEARCH_INPUT_ID } from "../lib/ids";

function renderMenu() {
  return render(
    <MemoryRouter>
      <input id={SEARCH_INPUT_ID} aria-label="Search Pokémon" />
      <BattleMenu />
    </MemoryRouter>,
  );
}

const search = () => screen.getByRole("button", { name: "Search" });
const compare = () => screen.getByRole("link", { name: "Compare" });
const team = () => screen.getByRole("link", { name: "Team" });
const library = () => screen.getByRole("link", { name: "Library" });

describe("BattleMenu", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("offers Search, Compare, Team and Library", () => {
    renderMenu();

    expect(search()).toBeInTheDocument();
    expect(compare()).toHaveAttribute("href", "/compare");
    expect(team()).toHaveAttribute("href", "/team");
    expect(library()).toHaveAttribute("href", "/library");
  });

  it("puts only one item in the tab order (roving tabindex)", () => {
    renderMenu();

    const tabbable = [search(), compare(), team(), library()].filter(
      (el) => el.tabIndex === 0,
    );
    expect(tabbable).toEqual([search()]);
  });

  it("moves through the grid with the arrow keys", async () => {
    const user = userEvent.setup();
    renderMenu();
    search().focus();

    await user.keyboard("{ArrowRight}");
    expect(compare()).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(library()).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(team()).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(search()).toHaveFocus();
  });

  it("wraps around the edges", async () => {
    const user = userEvent.setup();
    renderMenu();
    search().focus();

    await user.keyboard("{ArrowLeft}");
    expect(compare()).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(library()).toHaveFocus();
  });

  it("jumps to the ends with home and end", async () => {
    const user = userEvent.setup();
    renderMenu();
    search().focus();

    await user.keyboard("{End}");
    expect(library()).toHaveFocus();

    await user.keyboard("{Home}");
    expect(search()).toHaveFocus();
  });

  it("makes the focused item the one that Tab returns to", async () => {
    const user = userEvent.setup();
    renderMenu();
    search().focus();

    await user.keyboard("{ArrowRight}{ArrowDown}");

    expect(library().tabIndex).toBe(0);
    expect(search().tabIndex).toBe(-1);
  });

  it("follows a mouse click too, so the keyboard continues from there", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(team());
    await user.keyboard("{ArrowRight}");

    expect(library()).toHaveFocus();
  });

  it("moves focus to the header search box when search is chosen", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(search());

    expect(
      screen.getByRole("textbox", { name: "Search Pokémon" }),
    ).toHaveFocus();
  });

  it("leaves Alt+Arrow alone, because that is the browser's back", async () => {
    const user = userEvent.setup();
    renderMenu();
    search().focus();

    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(search()).toHaveFocus();
  });
});
