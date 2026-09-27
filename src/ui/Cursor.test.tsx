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
});
