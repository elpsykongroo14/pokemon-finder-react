import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TypeBadge } from "./TypeBadge";

describe("TypeBadge", () => {
  it("shows the type name and exposes it as data-type for the theme CSS", () => {
    render(<TypeBadge typeName="fire" />);
    expect(screen.getByText("fire")).toHaveAttribute("data-type", "fire");
  });
});
