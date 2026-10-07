import { render } from "@testing-library/react";
import { Cursor } from "./Cursor";
import { describe, it, expect } from "vitest";

describe("Cursor", () => {
  it("is hidden from assistive tech", () => {
    const { container } = render(<Cursor offset={0} />);
    expect(container.querySelector(".cursor")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("positions itself at the given offset", () => {
    const { container } = render(<Cursor offset={48} />);
    expect(container.querySelector(".cursor")).toHaveStyle({
      "--cursor-offset": "48px",
    });
  });

  it("accepts a CSS length string, so callers can use percentages", () => {
    const { container } = render(<Cursor offset="200%" axis="y" />);
    expect(container.querySelector(".cursor")).toHaveStyle({
      "--cursor-offset": "200%",
    });
  });

  it("moves along the vertical axis by default and the horizontal one on request", () => {
    const { container, rerender } = render(<Cursor offset={0} />);
    expect(container.querySelector(".cursor")).toHaveAttribute(
      "data-axis",
      "y",
    );

    rerender(<Cursor offset={0} axis="x" />);
    expect(container.querySelector(".cursor")).toHaveAttribute(
      "data-axis",
      "x",
    );
  });
});
