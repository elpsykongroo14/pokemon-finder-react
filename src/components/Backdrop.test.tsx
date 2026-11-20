import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Backdrop } from "./Backdrop";

describe("Backdrop", () => {
  it("renders a decorative element hidden from assistive technology", () => {
    const { container } = render(<Backdrop />);

    const backdrop = container.querySelector(".backdrop");
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveAttribute("aria-hidden", "true");
  });

  it("is not interactive and has no content of its own", () => {
    const { container } = render(<Backdrop />);

    const backdrop = container.querySelector(".backdrop");
    expect(backdrop).toBeEmptyDOMElement();
    expect(backdrop).not.toHaveAttribute("tabindex");
    expect(backdrop).not.toHaveAttribute("role");
  });
});
