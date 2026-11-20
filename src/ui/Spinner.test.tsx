import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("announces itself by default", () => {
    render(<Spinner label="loading Pokémon" />);
    expect(
      screen.getByRole("status", { name: "loading Pokémon" }),
    ).toBeInTheDocument();
  });

  it("stays silent when decorative, for a parent that announces busy state", () => {
    const { container } = render(<Spinner decorative />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(container.querySelector(".spinner")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
