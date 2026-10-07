import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrandMark } from "./Brandmark";

describe("BrandMark", () => {
  it("is decorative: hidden from assistive tech and not focusable", () => {
    const { container } = render(<BrandMark />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("scales to the requested size", () => {
    const { container } = render(<BrandMark size={48} />);

    expect(container.querySelector("svg")).toHaveAttribute("width", "48");
  });
});
