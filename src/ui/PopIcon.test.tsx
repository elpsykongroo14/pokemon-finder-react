import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PopIcon } from "./PopIcon";

describe("PopIcon", () => {
  it("does not pop on the first render (nothing has happened yet)", () => {
    render(<PopIcon popKey={0}>❤️</PopIcon>);

    expect(screen.getByText("❤️")).not.toHaveAttribute("data-pop");
  });

  it("pops once the counter has moved", () => {
    render(<PopIcon popKey={1}>❤️</PopIcon>);

    expect(screen.getByText("❤️")).toHaveAttribute("data-pop");
  });

  it("swaps in a brand new element each time the counter moves", () => {
    const { rerender } = render(<PopIcon popKey={1}>❤️</PopIcon>);
    const first = screen.getByText("❤️");

    rerender(<PopIcon popKey={1}>❤️</PopIcon>);
    expect(screen.getByText("❤️")).toBe(first); //same key: same element

    rerender(<PopIcon popKey={2}>❤️</PopIcon>);
    expect(screen.getByText("❤️")).not.toBe(first); //new key: fresh element
  });
});
