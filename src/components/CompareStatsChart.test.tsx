import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompareStatsChart } from "./CompareStatsChart";
import type { PokemonStat } from "../lib/type";

function makeStat(name: string, base_stat: number): PokemonStat {
  return { base_stat, effort: 0, stat: { name, url: "" } };
}

describe("CompareStatsChart", () => {
  it("matches stats by name, not array position, even when the two sides are ordered differently", () => {
    //deliberately scrambled relative to each other and relative to STAT_ORDER
    //this is the exact shape of input that broke the original positional matching version
    const leftStats = [
      makeStat("attack", 100),
      makeStat("hp", 35),
      makeStat("speed", 90),
    ];
    const rightStats = [
      makeStat("hp", 60),
      makeStat("speed", 40),
      makeStat("attack", 20),
    ];

    render(<CompareStatsChart leftStats={leftStats} rightStats={rightStats} />);

    //if matching were positional, index 0 would compare 100 vs 60 as "attack"
    //by name matching must compare the real Attack (100) vs the real Attack (20)
    const attackRow = screen.getByText("Attack").closest(".compare-stat-row");
    expect(attackRow).toHaveTextContent("100");
    expect(attackRow).toHaveTextContent("20");
  });

  it("skips a stat entirely when the right side is missing it", () => {
    const leftStats = [makeStat("hp", 35), makeStat("attack", 55)];
    const rightStats = [makeStat("hp", 40)];

    render(<CompareStatsChart leftStats={leftStats} rightStats={rightStats} />);

    expect(screen.getByText("HP")).toBeInTheDocument();
    expect(screen.queryByText("Attack")).not.toBeInTheDocument();
  });

  it("skips a stat entirely when the left side is missing it", () => {
    const leftStats = [makeStat("hp", 35)];
    const rightStats = [makeStat("hp", 40), makeStat("attack", 55)];

    render(<CompareStatsChart leftStats={leftStats} rightStats={rightStats} />);

    expect(screen.getByText("HP")).toBeInTheDocument();
    expect(screen.queryByText("Attack")).not.toBeInTheDocument();
  });

  it("renders rows in canonical STAT_ORDER regardless of input array order", () => {
    const leftStats = [
      makeStat("speed", 90),
      makeStat("hp", 35),
      makeStat("attack", 90),
    ];
    const rightStats = [
      makeStat("attack", 20),
      makeStat("speed", 40),
      makeStat("hp", 60),
    ];

    render(<CompareStatsChart leftStats={leftStats} rightStats={rightStats} />);

    const labels = screen.getAllByText(/^(HP|Attack|Speed)$/);
    expect(labels.map((el) => el.textContent)).toEqual([
      "HP",
      "Attack",
      "Speed",
    ]);
  });
});

//this test doesnt just check today's behavior, it looks in the specific fix for a documented bug from the vanilla version
//using inputs deliberately shaped to recreate the conditions that caused it
