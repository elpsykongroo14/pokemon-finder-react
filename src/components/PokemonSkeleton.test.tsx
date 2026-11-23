import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PokemonSkeleton } from "./PokemonSkeleton";

describe("PokemonSkeleton", () => {
  it("announces loading exactly once, not once per placeholder", () => {
    render(<PokemonSkeleton />);

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(
      screen.getByRole("status", { name: "Searching the tall grass…" }),
    ).toBeInTheDocument();
  });

  //spec 7.6: an empty platform with a silhouette where the sprite will
  //stand, built from the Stage's own classes so it sits in the same place
  it("stands a silhouette on an empty platform, in the stage's place", () => {
    const { container } = render(<PokemonSkeleton />);

    expect(container.querySelector(".stage .stage__platform")).not.toBeNull();
    expect(
      container.querySelector('.stage__sprite .skeleton[data-shape="circle"]'),
    ).toHaveStyle({ height: "240px" });
  });
});
