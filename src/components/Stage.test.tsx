import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
        "black-white": { animated: { front_default: "a.gif" } },
      },
    },
  },
} as PokemonDetails;

function renderStage(shiny = false) {
  return render(
    <PreferencesProvider>
      <Stage pokemon={pokemon} shiny={shiny} />
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
        animatiosEnabled: true,
        soundEnabled: true,
        spriteMode: "pixel",
      }),
    );

    renderStage();

    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "p.png",
    );
  });
});
