import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider } from "../context/PreferencesContext";
import { SettingsButton } from "./SettingsButton";

function renderButton() {
  return render(
    <PreferencesProvider>
      <SettingsButton />
    </PreferencesProvider>,
  );
}

beforeEach(() => localStorage.clear());

describe("SettingsButton", () => {
  it("is a button named Settings, and the dialog starts closed", () => {
    renderButton();

    expect(
      screen.getByRole("button", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the dialog and moves focus inside it", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Settings" }));

    const dialog = screen.getByRole("dialog", { name: "Settings" });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it("Escape closes it and gives focus back to the gear button", async () => {
    const user = userEvent.setup();
    renderButton();
    const gear = screen.getByRole("button", { name: "Settings" });

    await user.click(gear);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(gear).toHaveFocus();
  });

  it("the Close button also gives focus back to the gear button", async () => {
    const user = userEvent.setup();
    renderButton();
    const gear = screen.getByRole("button", { name: "Settings" });

    await user.click(gear);
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(gear).toHaveFocus();
  });

  it("a choice made in the dialog is still there after closing and reopening", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Settings" }));
    await user.click(screen.getByRole("radio", { name: "Artwork" }));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Settings" }));

    expect(screen.getByRole("radio", { name: "Artwork" })).toBeChecked();
  });
});
