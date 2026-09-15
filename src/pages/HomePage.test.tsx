import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders the initial prompt to search", () => {
    render(<HomePage />);

    expect(
      screen.getByText("Search for a Pokémon to get started."),
    ).toBeInTheDocument();
  });
});

//this file is deliberately minimal: Homepage is a static component
//with no state, props or router dependency, so a single "does the right text render" assertion is correctly sized test
//not under tested, just proportionate to the component'a actual complexity
