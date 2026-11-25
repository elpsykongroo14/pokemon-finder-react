import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { HoloCard } from "./HoloCard";
import type { TCGCard } from "../lib/type";

function makeCard(overrides: Partial<TCGCard> = {}): TCGCard {
  return { id: "sv8-240", name: "Hydreigon ex", ...overrides };
}

function face(container: HTMLElement) {
  return container.querySelector(".holo-card") as HTMLElement;
}

//the card itself (spec 7.4): the picture, and the light CSS lays over it.
//it is drawn, not interactive: whatever holds it (a tile, a pocket, the
//dialog) is the button, and owns the pointer
describe("HoloCard", () => {
  it("draws the card's picture as decoration", () => {
    const { container } = render(
      <HoloCard
        card={makeCard({ images: { small: "s.png", large: "l.png" } })}
      />,
    );

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "s.png");
    expect(img).toHaveAttribute("alt", "");
  });

  it("uses the large picture when asked, falling back to the small one", () => {
    const { container, rerender } = render(
      <HoloCard
        card={makeCard({ images: { small: "s.png", large: "l.png" } })}
        size="large"
      />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "l.png");

    rerender(
      <HoloCard card={makeCard({ images: { small: "s.png" } })} size="large" />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "s.png");
  });

  it("draws no picture for a card without one, and keeps the card's shape", () => {
    const { container } = render(<HoloCard card={makeCard()} />);

    expect(container.querySelector("img")).toBeNull();
    expect(face(container)).toBeInTheDocument();
  });

  it("carries the rarity tier, which decides its light", () => {
    const { container } = render(
      <HoloCard card={makeCard({ rarity: "Ultra Rare" })} />,
    );

    expect(face(container)).toHaveAttribute("data-rarity", "ultra");
  });

  //a grid of 50+ cards must not load every picture at once; the dialog's
  //one card should load straight away
  it("loads lazily unless told it is wanted now", () => {
    const { container, rerender } = render(
      <HoloCard card={makeCard({ images: { small: "s.png" } })} />,
    );
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy");

    rerender(
      <HoloCard card={makeCard({ images: { small: "s.png" } })} eager />,
    );
    expect(container.querySelector("img")).toHaveAttribute("loading", "eager");
  });

  //the dialog's card is the content itself, so there it has a name
  it("can be named, where the picture is the content", () => {
    const { container } = render(
      <HoloCard
        card={makeCard({ images: { small: "s.png" } })}
        alt="Hydreigon ex"
      />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "alt",
      "Hydreigon ex",
    );
  });
});
