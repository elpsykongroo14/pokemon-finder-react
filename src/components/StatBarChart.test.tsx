import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatBarChart } from "./StatBarChart";
import type { PokemonStat } from "../lib/type";

function makeStat(name: string, base_stat: number): PokemonStat {
  return { base_stat, effort: 0, stat: { name, url: "" } };
}

describe("StatBarChart", () => {
  it("renders stats in the canonical  HP/Atk/Def/Spd/SpA/SpD regardless of input order", () => {
    const stats = [
      makeStat("speed", 90),
      makeStat("hp", 35),
      makeStat("special-defense", 20),
      makeStat("attack", 55),
      makeStat("defense", 40),
      makeStat("special-attack", 50),
    ];

    render(<StatBarChart stats={stats} />);

    const labels = screen.getAllByText(
      /^(HP|Attack|Defense|Speed|Sp\. Atk|Sp\. Def)$/,
    );
    expect(labels.map((el) => el.textContent)).toEqual([
      "HP",
      "Attack",
      "Defense",
      "Speed",
      "Sp. Atk",
      "Sp. Def",
    ]);
  });

  it("marks the single highest stat", () => {
    const stats = [
      makeStat("hp", 35),
      makeStat("attack", 90),
      makeStat("defense", 40),
    ];

    const { container } = render(<StatBarChart stats={stats} />);

    const rows = container.querySelectorAll(".stat-row");
    const highest = container.querySelectorAll(".stat-row--highest");
    expect(highest).toHaveLength(1);
    expect(highest[0]).toHaveTextContent("Attack");
    expect(rows).toHaveLength(3);
  });

  it("marks every stat that ties for highest", () => {
    const stats = [
      makeStat("hp", 90),
      makeStat("attack", 90),
      makeStat("defense", 40),
    ];

    const { container } = render(<StatBarChart stats={stats} />);

    expect(container.querySelectorAll(".stat-row--highest")).toHaveLength(2);
  });
});

//this file protects the canonical ordering against out of order API input, and protects the highest stat comparison against both the "one winner" and "tied winners" cases
//while composing the real, already trusted StatBar instead of a mock, which is what let us assert on genuine rendered DOM order rather than prop call arguments
