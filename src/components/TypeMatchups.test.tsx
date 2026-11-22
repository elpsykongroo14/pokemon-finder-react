import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { TypeMatchups } from "./TypeMatchups";

describe("TypeMatchups", () => {
  it("lists weaknesses, resistances and immunities as named lists", () => {
    render(<TypeMatchups types={["dark", "dragon"]} />);

    const weak = screen.getByRole("list", { name: "Weak to" });
    expect(within(weak).getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("list", { name: "Resists" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Immune to" })).toBeInTheDocument();
  });

  it("puts the strongest weakness first, with its multiplier", () => {
    render(<TypeMatchups types={["dark", "dragon"]} />);

    const first = within(
      screen.getByRole("list", { name: "Weak to" }),
    ).getAllByRole("listitem")[0];
    //the glyph for the eye, and words for a screen reader
    expect(first).toHaveTextContent("fairy×4");
    expect(first).toHaveTextContent("4 times damage");
  });

  //spec 7.2: "Immune to" only when there is something to list
  it("leaves out Immune to when nothing is immune", () => {
    render(<TypeMatchups types={["fire"]} />);

    expect(
      screen.queryByRole("list", { name: "Immune to" }),
    ).not.toBeInTheDocument();
  });
});
