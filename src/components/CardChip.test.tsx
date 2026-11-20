import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardChip } from "./CardChip";

describe("CardChip", () => {
  it("shows its text", () => {
    render(<CardChip>Base Set</CardChip>);
    expect(screen.getByText("Base Set")).toBeInTheDocument();
  });

  it("carries the tier for styling, and carries none when it has no tier", () => {
    const { rerender } = render(<CardChip tier="holo">Rare Holo</CardChip>);
    expect(screen.getByText("Rare Holo")).toHaveAttribute(
      "data-rarity",
      "holo",
    );

    rerender(<CardChip>Base Set</CardChip>);
    expect(screen.getByText("Base Set")).not.toHaveAttribute("data-rarity");
  });
});
