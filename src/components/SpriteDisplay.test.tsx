import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

describe("SpriteDisplay modes", () => {
  const sprites: PokemonSprites = {
    front_default: "p.png",
    other: { "official-artwork": { front_default: "art.png" } },
    versions: {
      "generation-v": {
        "black-white": { animated: { front_default: "a.gif" } },
      },
    },
  };

  it("shows the animated sprite in pixel mode when animation is allowed", () => {
    render(
      <SpriteDisplay
        sprites={sprites}
        name="mew"
        shiny={false}
        mode="pixel"
        animate
      />,
    );
    const img = screen.getByRole("img", { name: "mew" });
    expect(img).toHaveAttribute("src", "a.gif");
    expect(img).toHaveAttribute("data-kind", "animated");
  });

  it("swaps to the static pixel sprite when animation is off", () => {
    render(
      <SpriteDisplay sprites={sprites} name="mew" shiny={false} mode="pixel" />,
    );

    expect(screen.getByRole("img", { name: "mew" })).toHaveAttribute(
      "src",
      "p.png",
    );
  });

  it("scales a pixel sprite by a whole number once it has loaded", () => {
    render(
      <SpriteDisplay
        sprites={sprites}
        name="mew"
        shiny={false}
        mode="pixel"
        size={300}
      />,
    );
    const img = screen.getByRole("img", { name: "mew" });
    Object.defineProperty(img, "naturalWidth", { value: 96 });
    Object.defineProperty(img, "naturalHeight", { value: 96 });

    fireEvent.load(img);

    expect(img).toHaveStyle({ width: "288px" });
  });

  it("lets the browser defer the download only when asked to", () => {
    const { rerender } = render(
      <SpriteDisplay sprites={sprites} name="mew" shiny={false} />,
    );
    expect(screen.getByRole("img", { name: "mew" })).not.toHaveAttribute(
      "loading",
    );

    rerender(<SpriteDisplay sprites={sprites} name="mew" shiny={false} lazy />);
    expect(screen.getByRole("img", { name: "mew" })).toHaveAttribute(
      "loading",
      "lazy",
    );
  });

  it("never forces a width onto artwork", () => {
    render(<SpriteDisplay sprites={sprites} name="mew" shiny={false} />);
    const img = screen.getByRole("img", { name: "mew" });
    Object.defineProperty(img, "naturalWidth", { value: 475 });
    Object.defineProperty(img, "naturalHeight", { value: 475 });

    fireEvent.load(img);

    expect(img.getAttribute("style")).toBeNull();
  });
});

//this file protects the placeholder fallback, the artwork over default priority
//(using the real priority logic, not a mock) and the one that matters the most for accessibility
//that the shiny label actually raches the alt text every time a shiny sprite is shown
