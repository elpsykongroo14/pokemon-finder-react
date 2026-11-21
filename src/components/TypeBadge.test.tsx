import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TypeBadge } from "./TypeBadge";

describe("TypeBadge", () => {
  it("shows the type name and exposes it as data-type for the theme CSS", () => {
    render(<TypeBadge typeName="fire" />);
    expect(screen.getByText("fire")).toHaveAttribute("data-type", "fire");
  });

  it("shows no multiplier unless it is given one", () => {
    const { container } = render(<TypeBadge typeName="fire" />);
    expect(
      container.querySelector(".type-badge__multiplier"),
    ).not.toBeInTheDocument();
  });

  it("shows the multiplier as a glyph and says it in words", () => {
    render(<TypeBadge typeName="ground" multiplier={0.5} />);
    //the glyph is decoration: a screen reader would read "times one half"
    expect(screen.getByText("×½")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(", half damage")).toHaveClass("visually-hidden");
  });

  it("passes its size to CSS, medium by default", () => {
    const { rerender } = render(<TypeBadge typeName="fire" />);
    expect(screen.getByText("fire")).toHaveAttribute("data-size", "md");
    rerender(<TypeBadge typeName="fire" size="lg" />);
    expect(screen.getByText("fire")).toHaveAttribute("data-size", "lg");
  });
});
