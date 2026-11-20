import { render, screen } from "@testing-library/react";
import { Panel } from "./Panel";
import { it, describe, expect } from "vitest";

describe("Panel", () => {
  it("renders its children", () => {
    render(<Panel>Trainer card</Panel>);
    expect(screen.getByText("Trainer card")).toBeInTheDocument();
  });

  it("defaults to the raised variant", () => {
    render(<Panel>content</Panel>);
    expect(screen.getByText("content").closest(".panel")).toHaveAttribute(
      "data-variant",
      "raised",
    );
  });

  it("applies the variant its given", () => {
    render(<Panel variant="sunken">content</Panel>);
    expect(screen.getByText("content").closest(".panel")).toHaveAttribute(
      "data-variant",
      "sunken",
    );
  });
});
