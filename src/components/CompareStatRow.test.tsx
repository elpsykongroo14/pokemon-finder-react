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

  //the tug of war: honest bars and a reading order that makes sense aloud
  describe("tug-of-war bars", () => {
    function getFills(container: HTMLElement) {
      return Array.from(
        container.querySelectorAll<HTMLElement>(".compare-stat-bar__fill"),
      ).map((el) => el.style.getPropertyValue("--stat-bar-percent"));
    }

    it("sizes both bars against the same rule, left first", () => {
      const { container } = render(
        <CompareStatRow
          label="Speed"
          leftValue={50}
          rightValue={100}
          max={200}
        />,
      );

      expect(getFills(container)).toEqual(["25%", "50%"]);
    });

    it("measures against the highest possible base stat by default", () => {
      const { container } = render(
        <CompareStatRow label="Speed" leftValue={255} rightValue={0} />,
      );

      expect(getFills(container)).toEqual(["100%", "0%"]);
    });

    it("hides the bars from assitive tech, since the numbers already say it", () => {
      const { container } = render(
        <CompareStatRow label="Speed" leftValue={90} rightValue={60} />,
      );

      const bars = container.querySelectorAll(".compare-stat-bar");
      expect(bars).toHaveLength(2);
      bars.forEach((bar) => expect(bar).toHaveAttribute("aria-hidden", "true"));
    });

    it("marks each bar with its side's outcome", () => {
      const { container } = render(
        <CompareStatRow label="Speed" leftValue={90} rightValue={60} />,
      );

      const [left, right] = container.querySelectorAll(".compare-stat-bar");
      expect(left).toHaveAttribute("data-outcome", "win");
      expect(right).toHaveAttribute("data-outcome", "lose");
    });

    it("puts the label first in the HTML, so a screen reader says it first", () => {
      render(<CompareStatRow label="Speed" leftValue={90} rightValue={60} />);

      const row = screen.getByText("Speed").closest(".compare-stat-row");
      expect(row?.firstElementChild).toBe(screen.getByText("Speed"));
    });
  });

  //the accessible signal: the result must be available without seeing color
  describe("non-color signal", () => {
    it("says 'higher' for the winner and 'lower' for the loser, each on its own side", () => {
      render(<CompareStatRow label="Speed" leftValue={90} rightValue={60} />);

      expect(screen.getByText("90")).toContainElement(
        screen.getByText("higher"),
      );
      expect(screen.getByText("60")).toContainElement(
        screen.getByText("lower"),
      );
    });

    it("puts the words on the right side when the right value wins", () => {
      render(<CompareStatRow label="Speed" leftValue={60} rightValue={90} />);

      expect(screen.getByText("90")).toContainElement(
        screen.getByText("higher"),
      );
      expect(screen.getByText("60")).toContainElement(
        screen.getByText("lower"),
      );
    });

    it("says 'tied' on both sides, and never higher or lower, for a tie", () => {
      render(<CompareStatRow label="Speed" leftValue={75} rightValue={75} />);

      expect(screen.getAllByText("tied")).toHaveLength(2);
      expect(screen.queryByText("higher")).not.toBeInTheDocument();
      expect(screen.queryByText("lower")).not.toBeInTheDocument();
    });

    //B&W-5 (spec 7.3): the ▲ / ▼ arrows are gone. the visible non-color
    //cue is now the "+30" lead badge on the winning side (plus its bold
    //value); the words stay for screen readers. this test replaces the
    //one that checked the arrows were hidden
    it("marks the winner with its lead, hidden from assistive tech but not the words", () => {
      render(<CompareStatRow label="Speed" leftValue={90} rightValue={60} />);

      const lead = screen.getByText("+30");
      expect(lead).toHaveAttribute("aria-hidden", "true");
      expect(screen.getByText("90")).toContainElement(lead);
      expect(screen.queryByText("▲")).not.toBeInTheDocument();
      expect(screen.getByText("higher")).not.toHaveAttribute("aria-hidden");
      expect(screen.getByText("lower")).not.toHaveAttribute("aria-hidden");
    });

    it("puts the lead on the right side when the right value wins", () => {
      render(<CompareStatRow label="Speed" leftValue={60} rightValue={95} />);

      expect(screen.getByText("95")).toContainElement(screen.getByText("+35"));
    });

    it("shows no lead for a tie", () => {
      render(<CompareStatRow label="Speed" leftValue={75} rightValue={75} />);

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });
  });

  //spec 7.3: the winning bar is its own Pokémon's type color. both sides'
  //bars share every row, so each bar wears its side's theme itself
  it("themes each bar with its own side's type", () => {
    const { container } = render(
      <CompareStatRow
        label="Speed"
        leftValue={90}
        rightValue={60}
        leftType="water"
        rightType="fire"
      />,
    );

    const [left, right] = container.querySelectorAll(".compare-stat-bar");
    expect(left).toHaveAttribute("data-type", "water");
    expect(right).toHaveAttribute("data-type", "fire");
  });

  //the bars grow one row after another (spec 6.1): the row passes its
  //position to CSS, which turns it into a delay
  it("hands its position in the chart to CSS for the stagger", () => {
    const { container } = render(
      <CompareStatRow label="Speed" leftValue={90} rightValue={60} index={3} />,
    );

    expect(
      container
        .querySelector<HTMLElement>(".compare-stat-row")
        ?.style.getPropertyValue("--stat-index"),
    ).toBe("3");
  });

  //spec 7.3: a total row under the six stats: bigger values, no bars, no
  //lead, but the same words for screen readers
  describe("total row", () => {
    it("shows both totals with their outcome words, and no bars or lead", () => {
      const { container } = render(
        <CompareStatRow
          label="Total"
          leftValue={528}
          rightValue={550}
          variant="total"
        />,
      );

      expect(container.querySelector(".compare-stat-row")).toHaveAttribute(
        "data-variant",
        "total",
      );
      expect(screen.getByText("550")).toHaveClass("stat-win");
      expect(screen.getByText("528")).toContainElement(
        screen.getByText("lower"),
      );
      expect(container.querySelectorAll(".compare-stat-bar")).toHaveLength(0);
      expect(screen.queryByText("+22")).not.toBeInTheDocument();
    });
  });
});

//CompareStatRow.test.tsx protects all three outcomes of compareStat against the real function, including the tie case a shallower pass would have skipped
