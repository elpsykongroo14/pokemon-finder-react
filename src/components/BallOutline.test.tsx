import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BallOutline } from "./BallOutline";

describe("BallOutline", () => {
  it("is decorative: hidden from assistive tech and not focusable", () => {
    const { container } = render(<BallOutline />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("draws at the requested size", () => {
    const { container } = render(<BallOutline size={64} />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", "64");
    expect(svg).toHaveAttribute("height", "64");
  });
});
