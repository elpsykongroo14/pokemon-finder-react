import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu } from "./Menu";
import { MenuItem } from "./MenuItem";
import { describe, it, vi, expect } from "vitest";

function renderBattleMenu(onSelect = vi.fn()) {
  render(
    <Menu aria-label="Battle menu">
      <MenuItem index={0} onSelect={() => onSelect("Fight")}>
        Fight
      </MenuItem>
      <MenuItem index={1} onSelect={() => onSelect("Bag")}>
        Bag
      </MenuItem>
      <MenuItem index={2} onSelect={() => onSelect("Pokémon")}>
        Pokémon
      </MenuItem>
      <MenuItem index={3} onSelect={() => onSelect("Run")}>
        Run
      </MenuItem>
    </Menu>,
  );
  return onSelect;
}

describe("Menu", () => {
  it("puts only one item in the Tab order", () => {
    renderBattleMenu();
    const items = screen.getAllByRole("menuitem");

    expect(items[0]).toHaveAttribute("tabindex", "0");
    for (const item of items.slice(1)) {
      expect(item).toHaveAttribute("tabindex", "-1");
    }
  });

  it("moves focus with arrow keys and wraps at the ends", async () => {
    renderBattleMenu();
    const items = screen.getAllByRole("menuitem");

    await userEvent.tab();
    expect(items[0]).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    expect(items[1]).toHaveFocus();
    expect(items[1]).toHaveAttribute("tabindex", "0");
    expect(items[0]).toHaveAttribute("tabindex", "-1");

    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(items[3]).toHaveFocus(); //wrapped past the top back to the last item
  });

  it("Home and End jump to the first and last item", async () => {
    renderBattleMenu();
    const items = screen.getAllByRole("menuitem");

    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(items[3]).toHaveFocus();

    await userEvent.keyboard("{Home}");
    expect(items[0]).toHaveFocus();
  });

  it("selects the item that was clicked", async () => {
    const onSelect = renderBattleMenu();
    await userEvent.click(screen.getByRole("menuitem", { name: "Bag" }));
    expect(onSelect).toHaveBeenCalledWith("Bag");
  });
});
