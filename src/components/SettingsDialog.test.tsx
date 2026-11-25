import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider } from "../context/PreferencesContext";
import { SettingsDialog } from "./SettingsDialog";
import { Stage } from "./Stage";
import { PREFERENCES_KEY } from "../lib/preferences";
import type { PokemonDetails } from "../lib/type";

const pokemon = {
  name: "pikachu",
  id: 25,
  types: [{ slot: 1, type: { name: "electric", url: "" } }],
  sprites: {
    front_default: "p.png",
    other: { "official-artwork": { front_default: "art.png" } },
    versions: {
      "generation-v": {
        "black-white": { animated: { front_default: "a.gif" } },
      },
    },
  },
} as PokemonDetails;

function renderDialog() {
  return render(
    <PreferencesProvider>
      <SettingsDialog onClose={vi.fn()} />
    </PreferencesProvider>,
  );
}

beforeEach(() => localStorage.clear());

describe("SettingsDialog", () => {
  //B&W-8 (found by axe in a real browser): the dialog renders through a
  //portal into <body>, outside <main>, so a <header> in it became a second
  //page banner while the dialog was open
  it("adds no banner landmark to the page", () => {
    renderDialog();

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
  });

  it("is a dialog named  Settings with a matching visible heading", () => {
    renderDialog();

    expect(
      screen.getByRole("dialog", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Settings", level: 2 }),
    ).toBeInTheDocument();
  });

  it("shows the current chices as checked radios", () => {
    renderDialog();
    const animations = screen.getByRole("group", { name: "Animations" });
    const sprites = screen.getByRole("group", { name: "Sprites" });

    expect(
      within(animations).getByRole("radio", { name: "Auto" }),
    ).toBeChecked();
    expect(within(sprites).getByRole("radio", { name: "Pixel" })).toBeChecked();
  });

  it("choosing Off saves it and updates the hint", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("radio", { name: "Off" }));

    expect(screen.getByRole("radio", { name: "Off" })).toBeChecked();
    expect(JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? "{}")).toEqual({
      animations: "off",
      spriteMode: "pixel",
    });
    expect(
      screen.getByRole("group", { name: "Animations" }),
    ).toHaveAccessibleDescription("Off everywhere in the app.");
  });

  it("on Auto, the hint says what the device setting resolves to", () => {
    renderDialog();

    //jsdom has matchMedia, so "auto" resolves to motion on
    expect(
      screen.getByRole("group", { name: "Animations" }),
    ).toHaveAccessibleDescription("Following your device: motion is on.");
  });

  //B&W-4: the Stage's control is a Pixel / Artwork segmented control too
  //(it was a "Pixel sprites" checkbox), so both places show the same two
  //radios; each query is scoped to its own place
  it("shares one source of truth with the Stage's sprite control", async () => {
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <Stage pokemon={pokemon} />
        <SettingsDialog onClose={vi.fn()} />
      </PreferencesProvider>,
    );
    const stage = within(screen.getByRole("group", { name: "Sprite options" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(stage.getByRole("radio", { name: "Pixel" })).toBeChecked();

    //change it in the dialog: the Stage follows
    await user.click(dialog.getByRole("radio", { name: "Artwork" }));
    expect(stage.getByRole("radio", { name: "Artwork" })).toBeChecked();
    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "art.png",
    );

    //change it on the Stage: the dialog follows
    await user.click(stage.getByRole("radio", { name: "Pixel" }));
    expect(dialog.getByRole("radio", { name: "Pixel" })).toBeChecked();
  });
});
