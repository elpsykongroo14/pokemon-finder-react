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

  it("shows the dex number, the name as a heading, and the type", () => {
    renderStage();

    expect(screen.getByText("#025")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "pikachu" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/electric/i)).toBeInTheDocument();
  });

  it("shows the animated pixel sprite by default", () => {
    renderStage();

    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "a.gif",
    );
  });

  it("switches to the artwork when Pixel sprites is turned off", async () => {
    const user = userEvent.setup();
    renderStage();

    await user.click(screen.getByRole("checkbox", { name: "Pixel sprites" }));

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
      within(group).getByRole("checkbox", { name: "Pixel sprites" }),
    ).toBeInTheDocument();
    expect(
      within(group).getByRole("checkbox", { name: "Shiny" }),
    ).toBeInTheDocument();
  });

  it("has no Shiny switch unless asked for one (the Home encounter)", () => {
    renderStage();

    expect(
      screen.queryByRole("checkbox", { name: "Shiny" }),
    ).not.toBeInTheDocument();
  });

  it("swaps to the shiny sprite when Shiny is switched on", async () => {
    const user = userEvent.setup();
    renderStage(true);

    await user.click(screen.getByRole("checkbox", { name: "Shiny" }));

    expect(screen.getByRole("img", { name: "pikachu(shiny)" })).toHaveAttribute(
      "src",
      "as.gif",
    );
  });
});
