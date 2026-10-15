import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PokemonSkeleton } from "./PokemonSkeleton";

describe("PokemonSkeleton", () => {
  it("announces loading exactly once, not once per placeholder", () => {
    render(<PokemonSkeleton />);

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(
      screen.getByRole("status", { name: "Loading Pokémon" }),
    ).toBeInTheDocument();
  });

  it("reserves the same 240px sprite space as the real stage", () => {
    const { container } = render(<PokemonSkeleton />);

    expect(
      container.querySelector('.skeleton[data-shape="circle"]'),
    ).toHaveStyle({ width: "240px", height: "240px" });
  });
});
