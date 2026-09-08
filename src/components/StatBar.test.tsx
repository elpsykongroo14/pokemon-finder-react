import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatBar } from "./StatBar";

describe("StatBar", () => {
  it("renders the label and the raw value as text", () => {
    render(
      <StatBar label="Attack" value={80} maxValue={100} isHighest={false} />,
    );

    expect(screen.getByText("Attack")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("sets the fill width as a percentage of value over maxValue", () => {
    const { container } = render(
      <StatBar label="Attack" value={25} maxValue={100} isHighest={false} />,
    );

    const fill = container.querySelector(".stat-bar-fill");
    expect(fill).toHaveStyle({ width: "25%" });
  });

  it("marks the row as highest when isHighest is true", () => {
    const { container } = render(
      <StatBar label="Attack" value={80} maxValue={100} isHighest={true} />,
    );

    expect(container.querySelector(".stat-row")).toHaveClass(
      "stat-row--highest",
    );
  });

  it("does not mark the row as highest when isHighest is false", () => {
    const { container } = render(
      <StatBar label="Attack" value={80} maxValue={100} isHighest={false} />,
    );

    expect(container.querySelector(".stat-row")).not.toHaveClass(
      "stat-row--highest",
    );
  });
});

//StatBar.test.tsx protects the percentage math and the highest-flag class, using a percentage chosen to distinguish correct math from a coincidentally matching wrong answer
