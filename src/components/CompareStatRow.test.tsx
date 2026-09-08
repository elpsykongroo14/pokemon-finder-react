import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompareStatRow } from "./CompareStatRow";

describe("CompareStatRow", () => {
  it("renders the label and both values", () => {
    render(<CompareStatRow label="Speed" leftValue={90} rightValue={60} />);

    expect(screen.getByText("Speed")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
  });

  it("highlights the left value as the winner when its higher", () => {
    render(<CompareStatRow label="Speed" leftValue={90} rightValue={60} />);

    expect(screen.getByText("90")).toHaveClass("stat-win");
    expect(screen.getByText("60")).toHaveClass("stat-lose");
  });

  it("highlights the right value as the winner when its higher", () => {
    render(<CompareStatRow label="Speed" leftValue={60} rightValue={90} />);

    expect(screen.getByText("90")).toHaveClass("stat-win");
    expect(screen.getByText("60")).toHaveClass("stat-lose");
  });

  it("highlights neither value when they're tied", () => {
    render(<CompareStatRow label="Speed" leftValue={75} rightValue={75} />);

    const [leftEl, rightEl] = screen.getAllByText("75");
    expect(leftEl).not.toHaveClass("stat-win");
    expect(leftEl).not.toHaveClass("stat-lose");
    expect(rightEl).not.toHaveClass("stat-win");
    expect(rightEl).not.toHaveClass("stat-lose");
  });
});

//CompareStatRow.test.tsx protects all three outcomes of compareStat against the real function, including the tie case a shallower pass would have skipped
