import { StatBar } from "./StatBar";
import type { PokemonStat } from "../lib/type";

{
  /*
    STAT_ORDER and MAX_STAT pulled straight from mainStats and MAX_STAT in render.ts from the vanilla project
*/
}
const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "speed",
  "special-attack",
  "special-defense",
] as const;

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  speed: "Speed",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
};

const MAX_STAT = 225;

interface StatBarChartProps {
  stats: PokemonStat[];
}

export function StatBarChart({ stats }: StatBarChartProps) {
  const orderedStats = STAT_ORDER.map((name) =>
    stats.find((s) => s.stat.name === name),
  ).filter((s): s is PokemonStat => s !== undefined);

  const highestValue = Math.max(...orderedStats.map((s) => s.base_stat));

  return (
    <div className="stat-bar-chart">
      {orderedStats.map((stat) => (
        <StatBar
          key={stat.stat.name}
          label={STAT_LABELS[stat.stat.name] ?? stat.stat.name}
          value={stat.base_stat}
          maxValue={MAX_STAT}
          isHighest={stat.base_stat === highestValue}
        />
      ))}
    </div>
  );
}
