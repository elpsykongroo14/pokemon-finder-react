import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { BattleMenu } from "./BattleMenu";
import { TeamProvider } from "../context/TeamContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import type { PokemonDetails } from "../lib/type";

//B&W-5 (spec 7.1): the battle menu is now the command plate, four things
//to do with THIS wild Pokémon. it used to be a 2 x 2 pad of site links
//(Search, Compare, Team, Library) that repeated the header's nav. the
//keyboard model (roving tabindex over moveInGrid) is the same, now one
//column wide

const zoroark = {
  id: 571,
  name: "zoroark",
  types: [{ slot: 1, type: { name: "dark", url: "" } }],
  sprites: { front_default: "z.png" },
  stats: [],
} as unknown as PokemonDetails;

const onReroll = vi.fn();

function menu(pokemon: PokemonDetails | null = zoroark) {
  return (
    <PreferencesProvider>
      <TeamProvider>
        <MemoryRouter>
          <BattleMenu pokemon={pokemon} onReroll={onReroll} />
        </MemoryRouter>
      </TeamProvider>
    </PreferencesProvider>
  );
}

function renderMenu(pokemon: PokemonDetails | null = zoroark) {
  return render(menu(pokemon));
}

//a party of n other Pokémon, saved the way the app saves it
function seedParty(size: number) {
  localStorage.setItem(
    "pokemon_team",
    JSON.stringify(
      Array.from({ length: size }, (_, i) => ({
        name: `member-${i}`,
        id: i + 1,
        sprite: "",
      })),
    ),
  );
}

const entry = () => screen.getByRole("link", { name: "Check its entry" });
const compare = () => screen.getByRole("link", { name: "Compare" });
const team = () => screen.getByRole("button", { name: "Team" });
const reroll = () => screen.getByRole("button", { name: "Look for another" });

beforeEach(() => {
  localStorage.clear();
  onReroll.mockClear();
});

describe("BattleMenu", () => {
  it("is a region named by its hidden prompt, since the dialog already asks it", () => {
    renderMenu();

    expect(
      screen.getByRole("region", { name: "What will you do?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What will you do?" }),
    ).toHaveClass("visually-hidden");
  });

  it("offers the four commands for the wild Pokémon", () => {
    renderMenu();

    expect(entry()).toHaveAttribute("href", "/pokemon/zoroark");
    expect(compare()).toHaveAttribute("href", "/compare?a=zoroark");
    expect(team()).toHaveAttribute("aria-pressed", "false");
    expect(reroll()).toBeInTheDocument();
  });

  //the name is the title; the line under it is the description, so a
  //screen reader says "Compare, link, Size it up against another Pokémon"
  it("names each command by its title and describes it with the line below", () => {
    renderMenu();

    expect(entry()).toHaveAccessibleDescription(
      "Stats, evolution and type matchups",
    );
    expect(compare()).toHaveAccessibleDescription(
      "Size it up against another Pokémon",
    );
    expect(reroll()).toHaveAccessibleDescription(
      "A different wild Pokémon appears",
    );
  });

  it("offers only what still makes sense while there is no Pokémon", () => {
    renderMenu(null);

    expect(compare()).toHaveAttribute("href", "/compare");
    expect(reroll()).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Check its entry" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Team" }),
    ).not.toBeInTheDocument();
  });

  it("asks for another wild Pokémon, and keeps focus on the command", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(reroll());

    expect(onReroll).toHaveBeenCalledTimes(1);
    expect(reroll()).toHaveFocus();
  });

  describe("the team command", () => {
    it("says how much room the party has", () => {
      seedParty(4);
      renderMenu();

      expect(team()).toHaveTextContent("Add to team");
      expect(team()).toHaveAccessibleDescription(
        "Your party has room for 2 more",
      );
    });

    //D44: one name ("Team"), aria-pressed for the state, visible words swap
    it("adds the Pokémon, says so, and explains how to undo it", async () => {
      const user = userEvent.setup();
      renderMenu();

      await user.click(team());

      expect(team()).toHaveAttribute("aria-pressed", "true");
      expect(team()).toHaveTextContent("On your team");
      expect(team()).toHaveAccessibleDescription(
        "Zoroark joined your party. Select again to release it",
      );
      expect(
        screen.getByText("Zoroark joined your party. 1 of 6 slots filled."),
      ).toHaveAttribute("aria-live", "polite");
    });

    it("releases it again on a second select", async () => {
      const user = userEvent.setup();
      renderMenu();

      await user.click(team());
      await user.click(team());

      expect(team()).toHaveAttribute("aria-pressed", "false");
      expect(
        screen.getByText("Zoroark left your party. 0 of 6 slots filled."),
      ).toBeInTheDocument();
    });

    it("explains a full party up front, and says so when the add is refused", async () => {
      const user = userEvent.setup();
      seedParty(6);
      renderMenu();

      expect(team()).toHaveAccessibleDescription(
        "Your party is full. Release one on the Team page",
      );

      await user.click(team());

      expect(team()).toHaveAttribute("aria-pressed", "false");
      expect(
        screen.getByText("Couldn't add: your party is full."),
      ).toBeInTheDocument();
    });
  });

  describe("keyboard (roving tabindex)", () => {
    function tabbable() {
      return [entry(), compare(), team(), reroll()].filter(
        (el) => el.tabIndex === 0,
      );
    }

    it("puts only the first command in the tab order", () => {
      renderMenu();

      expect(tabbable()).toEqual([entry()]);
    });

    it("moves down and up with the arrow keys, wrapping at the ends", async () => {
      const user = userEvent.setup();
      renderMenu();
      entry().focus();

      await user.keyboard("{ArrowDown}");
      expect(compare()).toHaveFocus();

      await user.keyboard("{ArrowDown}{ArrowDown}");
      expect(reroll()).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(entry()).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(reroll()).toHaveFocus();
    });

    it("jumps to the ends with Home and End", async () => {
      const user = userEvent.setup();
      renderMenu();
      entry().focus();

      await user.keyboard("{End}");
      expect(reroll()).toHaveFocus();

      await user.keyboard("{Home}");
      expect(entry()).toHaveFocus();
    });

    it("makes the focused command the one Tab comes back to", async () => {
      const user = userEvent.setup();
      renderMenu();
      entry().focus();

      await user.keyboard("{ArrowDown}{ArrowDown}");

      expect(tabbable()).toEqual([team()]);
    });

    it("follows a mouse click too, so the keyboard continues from there", async () => {
      const user = userEvent.setup();
      renderMenu();

      await user.click(compare());
      await user.keyboard("{ArrowDown}");

      expect(team()).toHaveFocus();
    });

    it("leaves Alt+Arrow alone, because that is the browser's back", async () => {
      const user = userEvent.setup();
      renderMenu();
      entry().focus();

      await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

      expect(entry()).toHaveFocus();
    });

    //"Look for another" while loading: the list shrinks to two commands.
    //the remembered position must still point at a command that exists
    it("keeps exactly one command tabbable when the list gets shorter", async () => {
      const user = userEvent.setup();
      const view = renderMenu();
      await user.click(reroll());

      view.rerender(menu(null));

      expect(reroll().tabIndex).toBe(0);
      expect(compare().tabIndex).toBe(-1);
    });
  });
});
