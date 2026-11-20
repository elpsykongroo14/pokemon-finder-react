import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PixelArt } from "./PixelArt";

const palette = { g: "#00ff00", b: "#0000ff" };

describe("PixelArt", () => {
  it("is one image, named by its label", () => {
    render(
      <PixelArt
        width={2}
        height={1}
        palette={palette}
        layers={[{ name: "base", rows: ["gb"] }]}
        label="two pixels"
      />,
    );

    expect(screen.getByRole("img", { name: "two pixels" })).toHaveAttribute(
      "viewBox",
      "0 0 2 1",
    );
  });

  it("draws one rect per run colored from the palette", () => {
    const { container } = render(
      <PixelArt
        width={4}
        height={1}
        palette={palette}
        layers={[{ name: "base", rows: ["ggb."] }]}
        label="art"
      />,
    );

    const rects = container.querySelectorAll("rect");
    expect(rects).toHaveLength(2);
    expect(rects[0]).toHaveAttribute("width", "2");
    expect(rects[0]).toHaveAttribute("fill", "#00ff00");
    expect(rects[1]).toHaveAttribute("fill", "#0000ff");
  });

  it("puts each layer in its own named group, in order", () => {
    const { container } = render(
      <PixelArt
        width={1}
        height={1}
        palette={palette}
        layers={[
          { name: "back", rows: ["g"] },
          { name: "front", rows: ["b"] },
        ]}
        label="art"
      />,
    );

    const groups = container.querySelectorAll("g");
    expect(groups[0]).toHaveClass("pixel-art__layer--back");
    expect(groups[1]).toHaveClass("pixel-art__layer--front");
  });
});
