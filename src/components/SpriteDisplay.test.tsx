import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpriteDisplay } from "./SpriteDisplay";
import type { PokemonSprites } from "../lib/sprites";

describe("SpriteDisplay", () => {
  it("shows a placeholder when no sprite url resolves", () => {
    render(<SpriteDisplay sprites={{}} name="missingno" shiny={false} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("No image available")).toBeInTheDocument();
  });

  it("renders the official artwork with the pokemon's name as alt text", () => {
    const sprites: PokemonSprites = {
      front_default: "default.png",
      other: { "official-artwork": { front_default: "artwork.png" } },
    };

    render(<SpriteDisplay sprites={sprites} name="pikachu" shiny={false} />);

    const img = screen.getByRole("img", { name: "pikachu" });
    expect(img).toHaveAttribute("src", "artwork.png");
  });

  it("falls back to the default sprite when no official artwork exists", () => {
    const sprites: PokemonSprites = { front_default: "default.png" };

    render(<SpriteDisplay sprites={sprites} name="pikachu" shiny={false} />);

    expect(screen.getByRole("img", { name: "pikachu" })).toHaveAttribute(
      "src",
      "default.png",
    );
  });

  it("appends a shiny label to the alt text and uses the shiny sprite when shiny is true", () => {
    const sprites: PokemonSprites = {
      front_shiny: "default-shiny.png",
      other: { "official-artwork": { front_shiny: "artwork-shiny.png" } },
    };

    render(<SpriteDisplay sprites={sprites} name="pikachu" shiny={true} />);

    const img = screen.getByRole("img", { name: "pikachu(shiny)" });
    expect(img).toHaveAttribute("src", "artwork-shiny.png");
  });
});

//this file protects the placeholder fallback, the artwork over default priority
//(using the real priority logic, not a mock) and the one that matters the most for accessibility
//that the shiny label actually raches the alt text every time a shiny sprite is shown
