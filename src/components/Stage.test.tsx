import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferencesProvider } from "../context/PreferencesContext";
import { Stage } from "./Stage";
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
        "black-white": {
          animated: { front_default: "a.gif", front_shiny: "as.gif" },
        },
      },
    },
  },
} as PokemonDetails;

const shinyButton = () => screen.getByRole("button", { name: "Shiny" });

function renderStage(shinyToggle = false) {
  return render(
    <PreferencesProvider>
      <Stage pokemon={pokemon} shinyToggle={shinyToggle} />
    </PreferencesProvider>,
  );
}

describe("Stage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  //B&W-4: the dex number, name and types moved to the name plate (see
  //NamePlate.test); the stage is the platform and the sprite now
  it("stands the sprite on a platform, and no longer names the Pokémon", () => {
    const { container } = renderStage();

    expect(container.querySelector(".stage__platform")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("shows the animated pixel sprite by default", () => {
    renderStage();

    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "a.gif",
    );
  });

  //spec 5.3: Pixel / Artwork is a segmented control, one of two options,
  //so radio buttons (it was a "Pixel sprites" checkbox before B&W-4)
  it("switches to the artwork when Artwork is chosen", async () => {
    const user = userEvent.setup();
    renderStage();
    expect(screen.getByRole("radio", { name: "Pixel" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "Artwork" }));

    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "art.png",
    );
  });

  it("uses the static pixel sprite when anmations are switched off", () => {
    localStorage.setItem(
      "pokemon_preferences",
      JSON.stringify({
        animations: "off",
        spriteMode: "pixel",
      }),
    );

    renderStage();

    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "p.png",
    );
  });

  it("keeps every sprite switch together in a 'Sprite options' group", () => {
    renderStage(true);

    const group = screen.getByRole("group", { name: "Sprite options" });
    expect(
      within(group).getByRole("group", { name: "Sprites" }),
    ).toBeInTheDocument();
    expect(
      within(group).getByRole("button", { name: "Shiny" }),
    ).toBeInTheDocument();
  });

  it("has no Shiny switch unless asked for one (the Home encounter)", () => {
    renderStage();

    expect(
      screen.queryByRole("button", { name: "Shiny" }),
    ).not.toBeInTheDocument();
  });

  //a toggle button: one name, aria-pressed says on or off
  it("swaps to the shiny sprite when Shiny is switched on", async () => {
    const user = userEvent.setup();
    renderStage(true);
    expect(shinyButton()).toHaveAttribute("aria-pressed", "false");

    await user.click(shinyButton());

    expect(shinyButton()).toHaveAttribute("aria-pressed", "true");

    expect(screen.getByRole("img", { name: "pikachu(shiny)" })).toHaveAttribute(
      "src",
      "as.gif",
    );
  });

  it("sparkles at the moment Shiny is switched on, and not before", async () => {
    const user = userEvent.setup();
    const { container } = renderStage(true);
    expect(container.querySelector(".shiny-sparkle")).toBeNull();

    await user.click(shinyButton());

    const burst = container.querySelector(".shiny-sparkle");
    expect(burst).not.toBeNull();
    //decorative: the switch already says Shiny is on
    expect(burst).toHaveAttribute("aria-hidden", "true");
  });

  it("plays a fresh burst each time Shiny is switched on again", async () => {
    const user = userEvent.setup();
    const { container } = renderStage(true);
    const shinySwitch = shinyButton();

    await user.click(shinySwitch); //on
    const first = container.querySelector(".shiny-sparkle");
    await user.click(shinySwitch); //off: nothing new plays
    expect(container.querySelector(".shiny-sparkle")).toBe(first);
    await user.click(shinySwitch); //on again

    expect(container.querySelector(".shiny-sparkle")).not.toBe(first);
  });

  it("does not sparkle at all when animations are off", async () => {
    localStorage.setItem(
      "pokemon_preferences",
      JSON.stringify({ animations: "off", spriteMode: "pixel" }),
    );
    const user = userEvent.setup();
    const { container } = renderStage(true);

    await user.click(shinyButton());

    expect(container.querySelector(".shiny-sparkle")).toBeNull();
  });
});
